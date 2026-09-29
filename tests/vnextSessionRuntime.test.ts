import { describe, expect, it } from "vitest";
import { asId } from "../src/vnext/domain/ids";
import {
  InMemorySessionRuntime,
  semanticCommandExamples,
  validateSessionCommandEnvelopeShape,
  type SessionCommandEnvelope,
  type SessionCommandPolicy,
} from "../src/vnext/sessionRuntime";

const policies: SessionCommandPolicy[] = [
  { commandType: "challenge.submitAnswer", allowedRoles: ["player"], allowedPhases: ["active"] },
  { commandType: "buzzer.buzz", allowedRoles: ["player"], allowedPhases: ["active"] },
  { commandType: "choice.choose", allowedRoles: ["player"], allowedPhases: ["active"] },
  { commandType: "cards.draw", allowedRoles: ["player"], allowedPhases: ["active"] },
  { commandType: "dice.roll", allowedRoles: ["host"], allowedPhases: ["active"] },
  { commandType: "clue.reveal", allowedRoles: ["host"], allowedPhases: ["active"] },
];

function makeRuntime() {
  let eventIndex = 0;
  return new InMemorySessionRuntime({
    sessionId: asId("session-350"),
    initialPhase: "active",
    commandPolicies: policies,
    now: () => new Date("2026-09-29T12:00:00.000Z"),
    createEventId: () => asId<"DomainEventId">(`event-${++eventIndex}`),
  });
}

function makeCommand(
  commandType = "challenge.submitAnswer",
  payload: unknown = { answer: "Moses" },
  overrides: Partial<SessionCommandEnvelope> = {},
): SessionCommandEnvelope {
  return {
    contractVersion: "session-runtime-command.v1",
    protocolVersion: "1.0",
    commandId: asId("command-1"),
    sessionId: asId("session-350"),
    actor: {
      role: "player",
      actorId: asId<"ParticipantId">("participant-1"),
      participantId: asId("participant-1"),
      siteId: asId("site-1"),
    },
    endpointId: asId("endpoint-1"),
    siteId: asId("site-1"),
    correlationId: "correlation-1",
    idempotencyKey: "idempotency-1",
    commandType,
    payload,
    expectedStateVersion: 0,
    clientObservedAt: "2026-09-29T12:00:00.000Z",
    ...overrides,
  };
}

describe("SessionRuntime command/event contracts (#350)", () => {
  it("validates serializable command envelope fixtures", () => {
    const command = makeCommand();
    const serialized = JSON.parse(JSON.stringify(command));

    expect(validateSessionCommandEnvelopeShape(serialized)).toEqual({ valid: true, errors: [] });
  });

  it("provides semantic command examples across multiple mechanic types", () => {
    expect(Object.values(semanticCommandExamples).map((example) => example.commandType)).toEqual([
      "challenge.submitAnswer",
      "buzzer.buzz",
      "choice.choose",
      "cards.draw",
      "dice.roll",
      "clue.reveal",
    ]);
  });

  it("accepts a semantic command and emits an authoritative event envelope", () => {
    const runtime = makeRuntime();

    const result = runtime.submit(makeCommand());

    expect(result).toEqual({
      commandId: "command-1",
      status: "ACCEPTED",
      stateVersion: 1,
      events: [
        {
          contractVersion: "session-runtime-event.v1",
          protocolVersion: "1.0",
          eventId: "event-1",
          sessionId: "session-350",
          commandId: "command-1",
          correlationId: "correlation-1",
          actor: {
            role: "player",
            actorId: "participant-1",
            participantId: "participant-1",
            siteId: "site-1",
          },
          eventType: "challenge.submitAnswer.accepted",
          payload: { answer: "Moses" },
          stateVersion: 1,
          occurredAt: "2026-09-29T12:00:00.000Z",
        },
      ],
    });
  });

  it("returns duplicate for repeated idempotency keys without advancing state", () => {
    const runtime = makeRuntime();
    const first = runtime.submit(makeCommand());
    const duplicate = runtime.submit(makeCommand("challenge.submitAnswer", { answer: "Moses" }, { commandId: asId("command-2") }));

    expect(first.status).toBe("ACCEPTED");
    expect(duplicate.status).toBe("DUPLICATE");
    expect(duplicate.stateVersion).toBe(1);
    expect(runtime.getDescriptor().stateVersion).toBe(1);
  });

  it("rejects stale state, invalid actor role, invalid phase, and wrong session", () => {
    const runtime = makeRuntime();
    runtime.submit(makeCommand());

    expect(
      runtime.submit(makeCommand("challenge.submitAnswer", { answer: "Aaron" }, { idempotencyKey: "stale", expectedStateVersion: 0 })),
    ).toMatchObject({ status: "REJECTED", reasonCode: "STALE_STATE" });
    expect(
      makeRuntime().submit(
        makeCommand("challenge.submitAnswer", { answer: "Moses" }, { actor: { role: "host", actorId: "host" } }),
      ),
    ).toMatchObject({ status: "REJECTED", reasonCode: "UNAUTHORIZED_ACTOR" });
    const paused = makeRuntime();
    paused.setPhase("paused");
    expect(paused.submit(makeCommand())).toMatchObject({ status: "REJECTED", reasonCode: "INVALID_PHASE" });
    expect(makeRuntime().submit(makeCommand("challenge.submitAnswer", { answer: "Moses" }, { sessionId: asId("other-session") }))).toMatchObject({
      status: "REJECTED",
      reasonCode: "WRONG_SESSION",
    });
  });

  it("rejects non-semantic UI and transport commands", () => {
    const runtime = new InMemorySessionRuntime({
      sessionId: asId("session-350"),
      initialPhase: "active",
      commandPolicies: [
        ...policies,
        { commandType: "ui.click", allowedRoles: ["player"], allowedPhases: ["active"] },
        { commandType: "challenge.submitAnswer", allowedRoles: ["player"], allowedPhases: ["active"] },
      ],
      now: () => new Date("2026-09-29T12:00:00.000Z"),
      createEventId: () => asId("event-1"),
    });

    expect(runtime.submit(makeCommand("ui.click", { x: 10, y: 20 }))).toMatchObject({
      status: "REJECTED",
      reasonCode: "NON_SEMANTIC_COMMAND",
    });
    expect(
      runtime.submit(
        makeCommand("challenge.submitAnswer", { answer: "Moses", clientX: 10 }, { idempotencyKey: "coordinate" }),
      ),
    ).toMatchObject({ status: "REJECTED", reasonCode: "NON_SEMANTIC_COMMAND" });
  });

  it("keeps envelopes transport-independent and vendor-neutral", () => {
    const command = makeCommand();
    const serialized = JSON.stringify(command);

    expect(serialized).not.toContain("localhost");
    expect(serialized).not.toContain("websocket");
    expect(serialized).not.toContain("electron");
    expect(serialized).not.toContain("hosted");
  });
});
