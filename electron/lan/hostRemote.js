const crypto = require("node:crypto");
const QRCode = require("qrcode");

const PAIR_FAILURE_LIMIT = 5;
const PAIR_FAILURE_WINDOW_MS = 60_000;
const HEARTBEAT_TIMEOUT_MS = 6_000;
const MESSAGE_WINDOW_MS = 10_000;
const MESSAGE_LIMIT = 30;

function createId(prefix) {
  return `${prefix}-${crypto.randomBytes(12).toString("hex")}`;
}

function createPairingCode() {
  return String(crypto.randomInt(0, 100_000_000)).padStart(8, "0");
}

function timingSafeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left ?? ""), "utf8");
  const rightBuffer = Buffer.from(String(right ?? ""), "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    crypto.timingSafeEqual(leftBuffer, leftBuffer);
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sanitizeDeviceLabel(value) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 80) : "Host remote";
}

function createHostRemoteManager(options = {}) {
  let enabled = false;
  let serverInfo = null;
  let pairingCode = null;
  let pairingUrl = null;
  let qrCodeDataUrl = null;
  let approvedRemote = null;
  let pendingPairing = null;
  let lastHostView = null;
  const clients = new Set();
  const failuresByIp = new Map();

  const notifyStatus = () => {
    options.onStatus?.(getStatus());
  };

  function getStatus() {
    return {
      enabled,
      listening: Boolean(serverInfo),
      address: serverInfo?.address ?? null,
      port: serverInfo?.port ?? null,
      url: pairingUrl,
      pairingCode: enabled && !approvedRemote ? pairingCode : null,
      qrCodeDataUrl: enabled && !approvedRemote ? qrCodeDataUrl : null,
      paired: Boolean(approvedRemote),
      connected: Boolean(approvedRemote?.connected),
      deviceLabel: approvedRemote?.deviceLabel ?? pendingPairing?.deviceLabel ?? null,
      pendingPairing: pendingPairing
        ? {
            id: pendingPairing.id,
            deviceLabel: pendingPairing.deviceLabel
          }
        : null
    };
  }

  async function enable(nextServerInfo) {
    enabled = true;
    serverInfo = nextServerInfo;
    pairingCode = createPairingCode();
    pairingUrl = `http://${serverInfo.address}:${serverInfo.port}/host-remote`;
    qrCodeDataUrl = await QRCode.toDataURL(pairingUrl, { margin: 1, scale: 6 });
    approvedRemote = null;
    pendingPairing = null;
    lastHostView = null;
    notifyStatus();
    return getStatus();
  }

  function disable() {
    enabled = false;
    serverInfo = null;
    pairingCode = null;
    pairingUrl = null;
    qrCodeDataUrl = null;
    approvedRemote = null;
    pendingPairing = null;
    lastHostView = null;
    for (const client of clients) {
      client.ws.close(1000, "host remote disabled");
    }
    clients.clear();
    notifyStatus();
  }

  function revoke() {
    approvedRemote = null;
    pendingPairing = null;
    pairingCode = enabled ? createPairingCode() : null;
    for (const client of clients) {
      if (client.role === "host-remote") {
        client.paired = false;
        client.token = null;
        client.ws.close(1000, "host remote revoked");
      }
    }
    notifyStatus();
    return getStatus();
  }

  function getFailureBucket(ip) {
    const now = Date.now();
    const bucket = failuresByIp.get(ip) ?? [];
    const recent = bucket.filter((timestamp) => now - timestamp < PAIR_FAILURE_WINDOW_MS);
    failuresByIp.set(ip, recent);
    return recent;
  }

  function recordFailure(ip) {
    const bucket = getFailureBucket(ip);
    bucket.push(Date.now());
    failuresByIp.set(ip, bucket);
  }

  function isRateLimited(ip) {
    return getFailureBucket(ip).length >= PAIR_FAILURE_LIMIT;
  }

  function send(client, message) {
    if (client.ws.readyState === client.ws.OPEN) {
      client.ws.send(JSON.stringify({ v: 1, ...message }));
    }
  }

  function addClient(ws, context) {
    const client = {
      id: createId("client"),
      ws,
      role: context.role,
      ip: context.ip,
      paired: false,
      token: null,
      deviceLabel: null,
      connectedAt: Date.now(),
      lastSeenAt: Date.now(),
      messageTimestamps: []
    };

    clients.add(client);
    ws.on("error", () => {
      removeClient(client);
    });
    ws.on("message", (raw) => handleMessage(client, raw));
    ws.on("close", () => removeClient(client));
    ws.on("pong", () => {
      client.lastSeenAt = Date.now();
    });
    send(client, { type: "connected", role: client.role });
    return client;
  }

  function removeClient(client) {
    clients.delete(client);
    if (approvedRemote?.clientId === client.id) {
      approvedRemote.connected = false;
      approvedRemote.clientId = null;
      notifyStatus();
    }
  }

  function validateMessageRate(client) {
    const now = Date.now();
    client.messageTimestamps = client.messageTimestamps.filter((timestamp) => now - timestamp < MESSAGE_WINDOW_MS);
    client.messageTimestamps.push(now);
    return client.messageTimestamps.length <= MESSAGE_LIMIT;
  }

  function parseMessage(raw) {
    try {
      const parsed = JSON.parse(String(raw));
      return parsed && typeof parsed === "object" && parsed.v === 1 && typeof parsed.type === "string" ? parsed : null;
    } catch {
      return null;
    }
  }

  function handleMessage(client, raw) {
    client.lastSeenAt = Date.now();
    if (!validateMessageRate(client)) {
      client.ws.close(1008, "rate limit");
      return;
    }

    const message = parseMessage(raw);
    if (!message) {
      return;
    }

    if (message.type === "heartbeat") {
      send(client, { type: "heartbeat", now: Date.now() });
      return;
    }

    if (client.role === "phone") {
      if (message.type === "host-command") {
        options.onSecurityEvent?.("phone-host-command-dropped");
      }
      return;
    }

    if (message.type === "pair") {
      handlePair(client, message);
      return;
    }

    if (message.type === "resume") {
      handleResume(client, message);
      return;
    }

    if (message.type === "host-command") {
      handleHostCommand(client, message);
    }
  }

  function handlePair(client, message) {
    if (!enabled || client.role !== "host-remote") {
      send(client, { type: "pairing-rejected", reason: "not-enabled" });
      return;
    }

    if (isRateLimited(client.ip)) {
      send(client, { type: "pairing-rejected", reason: "rate-limited" });
      return;
    }

    if (!pairingCode || !timingSafeStringEqual(message.code, pairingCode)) {
      recordFailure(client.ip);
      send(client, { type: "pairing-rejected", reason: "bad-code" });
      return;
    }

    if (pendingPairing) {
      send(client, { type: "pairing-rejected", reason: "approval-pending" });
      return;
    }

    pendingPairing = {
      id: createId("pair"),
      clientId: client.id,
      deviceLabel: sanitizeDeviceLabel(message.deviceLabel),
      replaceExisting: Boolean(approvedRemote),
      createdAt: Date.now()
    };
    client.deviceLabel = pendingPairing.deviceLabel;
    send(client, { type: "pairing-pending", pairingId: pendingPairing.id });
    notifyStatus();
  }

  function handleResume(client, message) {
    if (!approvedRemote?.token || !timingSafeStringEqual(message.token, approvedRemote.token)) {
      send(client, { type: "resume-rejected" });
      return;
    }

    approvedRemote.connected = true;
    approvedRemote.clientId = client.id;
    client.paired = true;
    client.token = approvedRemote.token;
    client.deviceLabel = approvedRemote.deviceLabel;
    send(client, { type: "resumed", deviceLabel: approvedRemote.deviceLabel });
    if (lastHostView) {
      send(client, { type: "host-view", view: lastHostView });
    }
    notifyStatus();
  }

  async function handleHostCommand(client, message) {
    if (!client.paired || !approvedRemote || client.token !== approvedRemote.token) {
      send(client, { type: "command-result", requestId: message.requestId ?? null, ok: false, reason: "not-paired" });
      return;
    }

    const command = message.command;
    if (!command || typeof command !== "object" || typeof command.type !== "string") {
      send(client, { type: "command-result", requestId: message.requestId ?? null, ok: false, reason: "bad-message" });
      return;
    }

    const result = await options.onHostCommand?.(command);
    send(client, { type: "command-result", requestId: message.requestId ?? null, ...(result ?? { ok: false, reason: "no-handler" }) });
  }

  function approvePendingPairing() {
    if (!pendingPairing) {
      return { ok: false, reason: "no-pending-pairing" };
    }

    const client = Array.from(clients).find((candidate) => candidate.id === pendingPairing.clientId);
    if (!client) {
      pendingPairing = null;
      notifyStatus();
      return { ok: false, reason: "client-disconnected" };
    }

    const token = crypto.randomBytes(32).toString("base64url");
    approvedRemote = {
      token,
      deviceLabel: pendingPairing.deviceLabel,
      clientId: client.id,
      connected: true,
      approvedAt: Date.now()
    };
    pairingCode = null;
    client.paired = true;
    client.token = token;
    client.deviceLabel = pendingPairing.deviceLabel;
    pendingPairing = null;
    send(client, { type: "paired", token, deviceLabel: approvedRemote.deviceLabel });
    if (lastHostView) {
      send(client, { type: "host-view", view: lastHostView });
    }
    notifyStatus();
    return { ok: true };
  }

  function denyPendingPairing() {
    if (!pendingPairing) {
      return { ok: false, reason: "no-pending-pairing" };
    }

    const client = Array.from(clients).find((candidate) => candidate.id === pendingPairing.clientId);
    if (client) {
      send(client, { type: "pairing-rejected", reason: "denied" });
    }
    pendingPairing = null;
    notifyStatus();
    return { ok: true };
  }

  function sendHostView(view) {
    lastHostView = view;
    for (const client of clients) {
      if (client.role === "host-remote" && client.paired) {
        send(client, { type: "host-view", view });
      }
    }
  }

  function sweepHeartbeats() {
    const now = Date.now();
    for (const client of clients) {
      if (now - client.lastSeenAt > HEARTBEAT_TIMEOUT_MS) {
        client.ws.terminate();
      } else if (client.ws.readyState === client.ws.OPEN) {
        client.ws.ping();
      }
    }
  }

  return {
    addClient,
    approvePendingPairing,
    denyPendingPairing,
    disable,
    enable,
    getStatus,
    revoke,
    sendHostView,
    sweepHeartbeats
  };
}

module.exports = {
  createHostRemoteManager,
  timingSafeStringEqual
};
