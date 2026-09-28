import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { HostCommand, HostRemoteView } from "../lib/hostRemoteView";
import "./styles.css";

type ConnectionState = "connecting" | "connected" | "paired" | "disconnected";

interface ServerMessage {
  v: 1;
  type: string;
  [key: string]: unknown;
}

const TOKEN_KEY = "bible-challenge-host-remote-token";
const DEVICE_LABEL_KEY = "bible-challenge-host-remote-device-label";
const REQUEST_TIMEOUT_MS = 5_000;

function getInitialCode(): string {
  return new URLSearchParams(window.location.search).get("code")?.replace(/\D/g, "").slice(0, 8) ?? "";
}

function createRequestId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `request-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sendJson(socket: WebSocket | null, message: Record<string, unknown>) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ v: 1, ...message }));
  }
}

function commandWithFreshness(view: HostRemoteView | null, command: HostCommand): HostCommand {
  return {
    ...command,
    promptId: view?.promptId ?? null,
    stateVersion: view?.stateVersion ?? 0
  };
}

function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [view, setView] = useState<HostRemoteView | null>(null);
  const [pairingCode, setPairingCode] = useState(getInitialCode);
  const [deviceLabel, setDeviceLabel] = useState(() => localStorage.getItem(DEVICE_LABEL_KEY) ?? "Host phone");
  const [notice, setNotice] = useState("");
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pendingResolverRef = useRef<((message: ServerMessage) => void) | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const wakeVideoRef = useRef<HTMLVideoElement | null>(null);

  const selectedParticipantId = view?.selectedAnswererId ?? view?.currentParticipantId ?? view?.participants[0]?.id ?? "";
  const selectedParticipant = view?.participants.find((participant) => participant.id === selectedParticipantId) ?? null;
  const isPaired = connectionState === "paired";
  const isBusy = pendingRequestId !== null;

  useEffect(() => {
    if (window.location.search) {
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
      }
    };
  }, []);

  function requestScreenWake() {
    const video = wakeVideoRef.current;
    if (video) {
      if (!video.srcObject && "captureStream" in HTMLCanvasElement.prototype) {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext("2d");
        context?.fillRect(0, 0, 1, 1);
        video.srcObject = canvas.captureStream(1);
      }
      void video.play().catch(() => undefined);
    }
  }

  const standings = useMemo(() => view?.scoreboard ?? [], [view]);

  function connect() {
    setConnectionState("connecting");
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws?role=host-remote`);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnectionState("connected");
      setNotice("");
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        sendJson(socket, { type: "resume", token, deviceLabel });
      }
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
      }
      heartbeatTimerRef.current = window.setInterval(() => sendJson(socket, { type: "heartbeat" }), 2_000);
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as ServerMessage;
      handleServerMessage(message);
    });

    socket.addEventListener("close", () => {
      setConnectionState("disconnected");
      setNotice("Disconnected. Reconnecting...");
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
      }
      reconnectTimerRef.current = window.setTimeout(connect, 1_500);
    });
  }

  function handleServerMessage(message: ServerMessage) {
    if (message.type === "paired" || message.type === "resumed") {
      const token = typeof message.token === "string" ? message.token : localStorage.getItem(TOKEN_KEY);
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      if (typeof message.deviceLabel === "string") {
        localStorage.setItem(DEVICE_LABEL_KEY, message.deviceLabel);
      }
      setConnectionState("paired");
      setNotice("Remote connected.");
      return;
    }

    if (message.type === "pairing-pending") {
      setNotice("Waiting for approval on the laptop.");
      return;
    }

    if (message.type === "pairing-rejected" || message.type === "resume-rejected") {
      localStorage.removeItem(TOKEN_KEY);
      setConnectionState("connected");
      setNotice(message.reason === "bad-code" ? "Pairing code rejected." : "Pairing was not approved.");
      return;
    }

    if (message.type === "host-view") {
      setView(message.view as HostRemoteView);
      return;
    }

    if (message.type === "command-result") {
      pendingResolverRef.current?.(message);
      pendingResolverRef.current = null;
    }
  }

  function pair() {
    if (pairingCode.length !== 8) {
      setNotice("Enter the 8-digit pairing code from the laptop.");
      return;
    }
    sendJson(socketRef.current, { type: "pair", code: pairingCode, deviceLabel });
    setNotice("Pairing request sent.");
  }

  function sendCommand(command: HostCommand) {
    if (!view || isBusy) {
      return;
    }

    const requestId = createRequestId();
    setPendingRequestId(requestId);
    setNotice("");
    sendJson(socketRef.current, {
      type: "host-command",
      requestId,
      command: commandWithFreshness(view, command)
    });

    const timeoutId = window.setTimeout(() => {
      pendingResolverRef.current = null;
      setPendingRequestId(null);
      setNotice("The command timed out. Screen updated when the laptop responds.");
    }, REQUEST_TIMEOUT_MS);

    pendingResolverRef.current = (message) => {
      if (message.requestId !== requestId) {
        return;
      }
      window.clearTimeout(timeoutId);
      setPendingRequestId(null);
      if (message.ok === false) {
        setNotice(message.reason === "stale-prompt" || message.reason === "stale-version"
          ? "The game moved on. Screen updated."
          : "Command was not accepted.");
      }
    };
  }

  function scoreFor(participantId: string, score: number) {
    sendCommand({ type: "set-score", participantId, score });
  }

  if (!isPaired) {
    return (
      <main className="remote-shell remote-pairing">
        <section className="remote-panel">
          <p className="eyebrow">Host Remote</p>
          <h1>Pair Controller</h1>
          <label>
            <span>Device name</span>
            <input value={deviceLabel} onChange={(event) => setDeviceLabel(event.target.value)} />
          </label>
          <label>
            <span>Pairing code</span>
            <input inputMode="numeric" maxLength={8} value={pairingCode} onChange={(event) => setPairingCode(event.target.value.replace(/\D/g, "").slice(0, 8))} />
          </label>
          <button type="button" className="primary" onClick={pair} disabled={connectionState === "connecting"}>
            Pair
          </button>
          <p className="status">{notice || (connectionState === "connecting" ? "Connecting..." : "Enter the code shown on the laptop.")}</p>
          <p className="status">Keep this screen open during the game. For events, set auto-lock to at least 5 minutes.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="remote-shell" onPointerDown={requestScreenWake}>
      <video ref={wakeVideoRef} className="wake-video" muted playsInline loop aria-hidden="true" />
      <header>
        <div>
          <p className="eyebrow">Host Remote</p>
          <h1>{view?.gameLabel ?? "Bible Challenge"}</h1>
        </div>
        <span className={`connection connection-${connectionState}`}>{connectionState}</span>
      </header>

      {notice ? <div className="notice">{notice}</div> : null}

      <section className="remote-grid">
        <div className="control-stack">
          <label>
            <span>Answering participant</span>
            <select
              value={selectedParticipantId}
              onChange={(event) => sendCommand({ type: "select-answerer", participantId: event.target.value })}
              disabled={isBusy}
            >
              {view?.participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name}
                </option>
              ))}
            </select>
          </label>

          <div className="button-grid">
            <button type="button" className="primary" onClick={() => sendCommand({ type: "mark-correct", participantId: selectedParticipantId })} disabled={isBusy}>
              Mark Correct{view?.selectedAwardPoints == null ? "" : ` (+${view.selectedAwardPoints})`}
            </button>
            <button type="button" onClick={() => sendCommand({ type: "mark-incorrect", participantId: selectedParticipantId })} disabled={isBusy}>
              Mark Incorrect
            </button>
            <button type="button" onClick={() => sendCommand({ type: "reveal-answer" })} disabled={isBusy}>Reveal</button>
            <button type="button" onClick={() => sendCommand({ type: "skip" })} disabled={isBusy}>Skip</button>
            <button type="button" onClick={() => sendCommand({ type: "continue" })} disabled={isBusy}>Next</button>
            <button type="button" onClick={() => sendCommand({ type: "undo" })} disabled={isBusy || !view?.undoLabel}>Undo</button>
          </div>

          <div className="timer-row">
            <button type="button" onClick={() => sendCommand({ type: "set-timer-paused", paused: !view?.timer.paused })} disabled={isBusy}>
              {view?.timer.paused ? "Resume" : "Pause"}
            </button>
            {[15, 30, 60].map((seconds) => (
              <button key={seconds} type="button" onClick={() => sendCommand({ type: "adjust-timer", seconds })} disabled={isBusy}>+{seconds}s</button>
            ))}
            {[15, 30].map((seconds) => (
              <button key={seconds} type="button" onClick={() => sendCommand({ type: "adjust-timer", seconds: -seconds })} disabled={isBusy}>-{seconds}s</button>
            ))}
          </div>
        </div>

        <aside className="host-notes">
          <details open>
            <summary>Answer Key</summary>
            <strong>{view?.host?.answer ?? "Waiting for a prompt"}</strong>
            {view?.host?.reference ? <p>{view.host.reference}</p> : null}
            {view?.host?.verse ? <p>{view.host.verse}</p> : null}
            {view?.host?.hints?.length ? (
              <ul>
                {view.host.hints.map((hint) => <li key={hint}>{hint}</li>)}
              </ul>
            ) : null}
            {view?.host?.note ? <p>{view.host.note}</p> : null}
          </details>
          <div className="mini-board">
            <span>Timer</span>
            <strong>{view?.timer.remainingSeconds ?? 0}s</strong>
            {selectedParticipant ? <p>Answerer: {selectedParticipant.name}</p> : null}
            <p>Buzz policy: {view?.buzzTurnPolicy ?? "n/a"}</p>
          </div>
        </aside>

        <section className="scoreboard">
          <h2>Scoreboard</h2>
          {standings.map((standing) => (
            <div key={standing.participant.id} className="score-row">
              <span>{standing.participant.name}</span>
              <div>
                <button type="button" onClick={() => sendCommand({ type: "adjust-score", participantId: standing.participant.id, delta: -1 })} disabled={isBusy}>-</button>
                <strong>{standing.stats.totalScore}</strong>
                <button type="button" onClick={() => sendCommand({ type: "adjust-score", participantId: standing.participant.id, delta: 1 })} disabled={isBusy}>+</button>
                <button type="button" onClick={() => scoreFor(standing.participant.id, 0)} disabled={isBusy}>0</button>
              </div>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("remote-root")!).render(<App />);
