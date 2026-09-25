import { createRequire } from "node:module";
import http from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import WebSocket from "ws";

const require = createRequire(import.meta.url);
const { createLanServer, MAX_PAYLOAD_BYTES } = require("../electron/lan/server");

let lanServer = null;

afterEach(() => {
  lanServer?.stop();
  lanServer = null;
});

async function startServer(options = {}) {
  lanServer = createLanServer(options);
  return lanServer.startFeature("host-remote", { adapterAddress: "127.0.0.1", preferredPort: 43179, skipNetworkChecks: true });
}

function httpRequest(port, requestPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        host: "127.0.0.1",
        port,
        path: requestPath,
        headers
      },
      (response) => {
        response.resume();
        response.on("end", () => resolve(response));
      }
    );
    request.on("error", reject);
    request.end();
  });
}

function connectWs(port, role = "host-remote", origin = `http://127.0.0.1:${port}`) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws?role=${role}`, { origin });
    ws.seenMessages = [];
    ws.on("message", (raw) => {
      ws.seenMessages.push(JSON.parse(String(raw)));
    });
    ws.once("open", () => resolve(ws));
    ws.once("error", reject);
  });
}

function nextMessage(ws, predicate = () => true) {
  const existingIndex = ws.seenMessages.findIndex(predicate);
  if (existingIndex >= 0) {
    const [message] = ws.seenMessages.splice(existingIndex, 1);
    return Promise.resolve(message);
  }

  return new Promise((resolve) => {
    const listener = (raw) => {
      const message = JSON.parse(String(raw));
      if (predicate(message)) {
        ws.off("message", listener);
        const encoded = JSON.stringify(message);
        const queuedIndex = ws.seenMessages.findIndex((queued) => JSON.stringify(queued) === encoded);
        if (queuedIndex >= 0) {
          ws.seenMessages.splice(queuedIndex, 1);
        }
        resolve(message);
      }
    };
    ws.on("message", listener);
  });
}

function send(ws, message) {
  ws.send(JSON.stringify({ v: 1, ...message }));
}

describe("LAN server hardening", () => {
  it("serves only fixed routes with security headers and rejects bad Host headers", async () => {
    const status = await startServer();
    const port = status.port;

    const ok = await httpRequest(port, "/host-remote");
    expect(ok.statusCode).toBe(200);
    expect(ok.headers["x-frame-options"]).toBe("DENY");
    expect(ok.headers["cache-control"]).toBe("no-store");
    expect(ok.headers["referrer-policy"]).toBe("no-referrer");
    expect(ok.headers["x-content-type-options"]).toBe("nosniff");

    const traversal = await httpRequest(port, "/%2e%2e/package.json");
    expect(traversal.statusCode).toBe(404);

    const unknown = await httpRequest(port, "/unknown");
    expect(unknown.statusCode).toBe(404);

    const badHost = await httpRequest(port, "/host-remote", { Host: "evil.test" });
    expect(badHost.statusCode).toBe(403);
  });

  it("rejects WebSocket upgrades from the wrong Origin", async () => {
    const status = await startServer();

    await expect(connectWs(status.port, "host-remote", "http://evil.test")).rejects.toThrow();
  });

  it("enforces max WebSocket payload size", async () => {
    const status = await startServer();
    const ws = await connectWs(status.port);
    await nextMessage(ws, (message) => message.type === "connected");

    const closed = new Promise((resolve) => ws.once("close", resolve));
    ws.send("x".repeat(MAX_PAYLOAD_BYTES + 1));
    await closed;
    expect(ws.readyState).toBe(WebSocket.CLOSED);
  });
});

describe("host remote pairing", () => {
  it("pairs with a correct single-use code, then reconnects with an in-memory token", async () => {
    const status = await startServer();
    const code = status.hostRemote.pairingCode;
    const ws = await connectWs(status.port);
    await nextMessage(ws, (message) => message.type === "connected");

    send(ws, { type: "pair", code, deviceLabel: "Tablet" });
    await expect(nextMessage(ws, (message) => message.type === "pairing-pending")).resolves.toMatchObject({
      type: "pairing-pending"
    });
    expect(lanServer.getStatus().hostRemote.pendingPairing.deviceLabel).toBe("Tablet");

    expect(lanServer.approveHostRemotePairing()).toEqual({ ok: true });
    const paired = await nextMessage(ws, (message) => message.type === "paired");
    expect(paired.token).toEqual(expect.any(String));
    expect(lanServer.getStatus().hostRemote).toMatchObject({
      paired: true,
      connected: true,
      pairingCode: null,
      deviceLabel: "Tablet"
    });

    const rejectedWs = await connectWs(status.port);
    await nextMessage(rejectedWs, (message) => message.type === "connected");
    send(rejectedWs, { type: "pair", code, deviceLabel: "Second tablet" });
    await expect(nextMessage(rejectedWs, (message) => message.type === "pairing-rejected")).resolves.toMatchObject({
      reason: "bad-code"
    });

    ws.close();
    const resumedWs = await connectWs(status.port);
    await nextMessage(resumedWs, (message) => message.type === "connected");
    send(resumedWs, { type: "resume", token: paired.token, deviceLabel: "Tablet" });
    await expect(nextMessage(resumedWs, (message) => message.type === "resumed")).resolves.toMatchObject({
      deviceLabel: "Tablet"
    });
  });

  it("rate-limits bad codes and allows only one approval prompt at a time", async () => {
    const status = await startServer();
    const code = status.hostRemote.pairingCode;
    const first = await connectWs(status.port);
    const second = await connectWs(status.port);
    await nextMessage(first, (message) => message.type === "connected");
    await nextMessage(second, (message) => message.type === "connected");

    send(first, { type: "pair", code, deviceLabel: "First" });
    await nextMessage(first, (message) => message.type === "pairing-pending");
    send(second, { type: "pair", code, deviceLabel: "Second" });
    await expect(nextMessage(second, (message) => message.type === "pairing-rejected")).resolves.toMatchObject({
      reason: "approval-pending"
    });

    const wrong = await connectWs(status.port);
    await nextMessage(wrong, (message) => message.type === "connected");
    for (let index = 0; index < 5; index += 1) {
      send(wrong, { type: "pair", code: "00000000", deviceLabel: "Wrong" });
      await nextMessage(wrong, (message) => message.type === "pairing-rejected");
    }
    send(wrong, { type: "pair", code: "00000000", deviceLabel: "Wrong" });
    await expect(nextMessage(wrong, (message) => message.type === "pairing-rejected")).resolves.toMatchObject({
      reason: "rate-limited"
    });
  });

  it("keeps host view and host commands scoped to the host-remote role", async () => {
    const onHostCommand = vi.fn(() => Promise.resolve({ ok: true }));
    const onSecurityEvent = vi.fn();
    const status = await startServer({ onHostCommand, onSecurityEvent });
    const code = status.hostRemote.pairingCode;
    const host = await connectWs(status.port, "host-remote");
    const phone = await connectWs(status.port, "phone");
    await nextMessage(host, (message) => message.type === "connected");
    await nextMessage(phone, (message) => message.type === "connected");

    send(host, { type: "pair", code, deviceLabel: "Host phone" });
    await nextMessage(host, (message) => message.type === "pairing-pending");
    lanServer.approveHostRemotePairing();
    await nextMessage(host, (message) => message.type === "paired");

    lanServer.sendHostRemoteView({ promptId: "p1", answer: "private" });
    await expect(nextMessage(host, (message) => message.type === "host-view")).resolves.toMatchObject({
      view: { answer: "private" }
    });

    let phoneReceivedHostView = false;
    phone.on("message", (raw) => {
      const message = JSON.parse(String(raw));
      if (message.type === "host-view") {
        phoneReceivedHostView = true;
      }
    });
    send(phone, { type: "host-command", command: { type: "mark-correct" } });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(phoneReceivedHostView).toBe(false);
    expect(onHostCommand).not.toHaveBeenCalled();
    expect(onSecurityEvent).toHaveBeenCalledWith("phone-host-command-dropped");
  });
});
