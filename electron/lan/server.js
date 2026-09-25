const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { WebSocketServer } = require("ws");
const { getWifiSsid, getWindowsNetworkProfile, selectAdapter } = require("./network");
const { createHostRemoteManager } = require("./hostRemote");

const DEFAULT_PORT = 4179;
const PORT_ATTEMPTS = 10;
const MAX_PAYLOAD_BYTES = 16 * 1024;
const MAX_CONNECTIONS = 60;
const MAX_CONNECTIONS_PER_IP = 4;
const STATIC_ROOT = path.join(__dirname, "static");
const STATIC_ROUTES = new Map([
  ["/", { file: "host-remote.html", contentType: "text/html; charset=utf-8" }],
  ["/host-remote", { file: "host-remote.html", contentType: "text/html; charset=utf-8" }]
]);

function applySecurityHeaders(response) {
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

function getRemoteIp(request) {
  return request.socket.remoteAddress?.replace(/^::ffff:/, "") ?? "unknown";
}

function isExpectedHost(header, address, port) {
  return header === `${address}:${port}`;
}

function isExpectedOrigin(header, address, port) {
  return header === `http://${address}:${port}`;
}

function createLanServer(options = {}) {
  let server = null;
  let wss = null;
  let heartbeatTimer = null;
  let info = null;
  const enabledFeatures = new Set();
  const hostRemote = createHostRemoteManager({
    onHostCommand: options.onHostCommand,
    onSecurityEvent: options.onSecurityEvent,
    onStatus: (status) => options.onHostRemoteStatus?.(status)
  });

  function getStatus() {
    return {
      running: Boolean(server),
      features: Array.from(enabledFeatures),
      address: info?.address ?? null,
      port: info?.port ?? null,
      adapter: info?.adapter ?? null,
      networkProfile: info?.networkProfile ?? null,
      ssid: info?.ssid ?? null,
      hostRemote: hostRemote.getStatus()
    };
  }

  async function startFeature(feature, startOptions = {}) {
    enabledFeatures.add(feature);
    if (!server) {
      await start(startOptions);
    }

    if (feature === "host-remote") {
      await hostRemote.enable(info);
    }

    options.onStatus?.(getStatus());
    return getStatus();
  }

  function stopFeature(feature) {
    enabledFeatures.delete(feature);
    if (feature === "host-remote") {
      hostRemote.disable();
    }
    if (enabledFeatures.size === 0) {
      stop();
    }
    options.onStatus?.(getStatus());
    return getStatus();
  }

  async function start(startOptions = {}) {
    const adapter = startOptions.adapterAddress
      ? selectAdapter(startOptions.adapterAddress)
      : selectAdapter(options.getPreferredAddress?.());
    const networkProfile = startOptions.skipNetworkChecks ? null : await getWindowsNetworkProfile(adapter.address);
    const ssid = startOptions.skipNetworkChecks ? null : await getWifiSsid();
    const selected = await listenOnAvailablePort(adapter.address, startOptions.preferredPort ?? DEFAULT_PORT);
    server = selected.server;
    wss = selected.wss;
    info = {
      address: adapter.address,
      port: selected.port,
      adapter,
      networkProfile,
      ssid
    };
    heartbeatTimer = setInterval(() => hostRemote.sweepHeartbeats(), 2_000);
    heartbeatTimer.unref?.();
  }

  function stop() {
    hostRemote.disable();
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    if (wss) {
      for (const client of wss.clients) {
        client.close(1000, "server stopping");
      }
      wss.close();
      wss = null;
    }
    if (server) {
      server.close();
      server = null;
    }
    info = null;
  }

  function listenOnAvailablePort(address, preferredPort) {
    return new Promise((resolve, reject) => {
      const attempts = Array.from({ length: PORT_ATTEMPTS }, (_entry, index) => preferredPort + index);

      function tryNext(index) {
        if (index >= attempts.length) {
          reject(new Error(`No LAN server port available from ${preferredPort} to ${preferredPort + PORT_ATTEMPTS - 1}.`));
          return;
        }

        const port = attempts[index];
        const nextServer = http.createServer((request, response) => handleHttpRequest(request, response, address, port));
        const nextWss = new WebSocketServer({ noServer: true, maxPayload: MAX_PAYLOAD_BYTES });

        nextServer.on("upgrade", (request, socket, head) => {
          handleUpgrade(nextWss, request, socket, head, address, port);
        });
        nextServer.once("error", (error) => {
          nextServer.close();
          if (error.code === "EADDRINUSE" || error.code === "EACCES") {
            tryNext(index + 1);
            return;
          }
          reject(error);
        });
        nextServer.listen(port, address, () => {
          resolve({ server: nextServer, wss: nextWss, port });
        });
      }

      tryNext(0);
    });
  }

  function handleHttpRequest(request, response, address, port) {
    applySecurityHeaders(response);
    if (!isExpectedHost(request.headers.host, address, port)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const url = new URL(request.url ?? "/", `http://${address}:${port}`);
    const route = STATIC_ROUTES.get(url.pathname);
    if (!route || request.method !== "GET") {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": route.contentType });
    fs.createReadStream(path.join(STATIC_ROOT, route.file)).pipe(response);
  }

  function handleUpgrade(nextWss, request, socket, head, address, port) {
    if (!isExpectedHost(request.headers.host, address, port) || !isExpectedOrigin(request.headers.origin, address, port)) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    const url = new URL(request.url ?? "/", `http://${address}:${port}`);
    if (url.pathname !== "/ws") {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    const role = url.searchParams.get("role");
    if (role !== "host-remote" && role !== "phone") {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    const ip = getRemoteIp(request);
    if (!canAcceptConnection(nextWss, ip)) {
      socket.write("HTTP/1.1 429 Too Many Requests\r\n\r\n");
      socket.destroy();
      return;
    }

    nextWss.handleUpgrade(request, socket, head, (ws) => {
      hostRemote.addClient(ws, { role, ip });
    });
  }

  function canAcceptConnection(nextWss, ip) {
    if (nextWss.clients.size >= MAX_CONNECTIONS) {
      return false;
    }

    let perIp = 0;
    for (const client of nextWss.clients) {
      if (client._socket?.remoteAddress?.replace(/^::ffff:/, "") === ip) {
        perIp += 1;
      }
    }
    return perIp < MAX_CONNECTIONS_PER_IP;
  }

  return {
    approveHostRemotePairing: hostRemote.approvePendingPairing,
    denyHostRemotePairing: hostRemote.denyPendingPairing,
    getStatus,
    revokeHostRemote: hostRemote.revoke,
    sendHostRemoteView: hostRemote.sendHostView,
    startFeature,
    stop,
    stopFeature
  };
}

module.exports = {
  MAX_PAYLOAD_BYTES,
  applySecurityHeaders,
  createLanServer,
  isExpectedHost,
  isExpectedOrigin
};
