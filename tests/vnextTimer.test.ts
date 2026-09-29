import { describe, expect, it } from "vitest";
import { TimerService, type TimerCommand } from "../src/vnext/timer";

function createClock(startMs = Date.parse("2026-09-29T12:00:00.000Z")) {
  let current = startMs;
  return {
    now: () => new Date(current),
    advance: (ms: number) => {
      current += ms;
    },
  };
}

function command(type: TimerCommand["type"], overrides: Partial<TimerCommand> = {}): TimerCommand {
  return {
    commandId: `${type}-command`,
    idempotencyKey: `${type}-key`,
    timerId: "timer-1",
    type,
    ...overrides,
  };
}

function createService(clock = createClock()) {
  let eventIndex = 0;
  const service = new TimerService({
    now: clock.now,
    createEventId: () => `timer-event-${++eventIndex}`,
  });
  service.defineTimer({
    id: "timer-1",
    contextId: "round-1",
    durationMs: 30_000,
    warningThresholdsMs: [10_000, 5_000],
    overtimeMode: "none",
    visibility: "public",
  });
  return { service, clock };
}

describe("authoritative TimerService (#156)", () => {
  it("starts, pauses, resumes, resets, and cancels deterministically with a fake clock", () => {
    const { service, clock } = createService();

    expect(service.submit(command("start"))).toMatchObject({ status: "ACCEPTED", stateVersion: 1 });
    clock.advance(12_000);
    expect(service.project("timer-1")).toMatchObject({ state: "running", elapsedMs: 12_000, remainingMs: 18_000 });

    expect(service.submit(command("pause", { idempotencyKey: "pause-1" }))).toMatchObject({ status: "ACCEPTED" });
    clock.advance(5_000);
    expect(service.project("timer-1")).toMatchObject({ state: "paused", elapsedMs: 12_000, remainingMs: 18_000 });

    expect(service.submit(command("resume", { idempotencyKey: "resume-1" }))).toMatchObject({ status: "ACCEPTED" });
    clock.advance(3_000);
    expect(service.project("timer-1")).toMatchObject({ state: "running", elapsedMs: 15_000, remainingMs: 15_000 });

    expect(service.submit(command("reset", { idempotencyKey: "reset-1" }))).toMatchObject({ status: "ACCEPTED" });
    expect(service.project("timer-1")).toMatchObject({ state: "ready", elapsedMs: 0, remainingMs: 30_000 });
    expect(service.submit(command("cancel", { idempotencyKey: "cancel-1" }))).toMatchObject({ status: "ACCEPTED" });
    expect(service.project("timer-1").state).toBe("cancelled");
  });

  it("expires authoritatively and emits warning thresholds once", () => {
    const { service, clock } = createService();
    service.submit(command("start"));

    clock.advance(21_000);
    expect(service.expireDueTimers().map((event) => event.type)).toEqual(["timer.warning"]);
    expect(service.expireDueTimers()).toEqual([]);

    clock.advance(5_000);
    expect(service.expireDueTimers().map((event) => event.type)).toEqual(["timer.warning"]);

    clock.advance(4_000);
    const events = service.expireDueTimers();

    expect(events.map((event) => event.type)).toEqual(["timer.expired"]);
    expect(service.project("timer-1")).toMatchObject({ state: "expired", remainingMs: 0 });
  });

  it("reconnect/background projection derives from authoritative timestamps without reset", () => {
    const { service, clock } = createService();
    service.submit(command("start"));
    clock.advance(7_500);

    const reconnectProjection = service.project("timer-1");

    expect(reconnectProjection).toMatchObject({
      timerId: "timer-1",
      contextId: "round-1",
      state: "running",
      elapsedMs: 7_500,
      remainingMs: 22_500,
      visibility: "public",
    });
  });

  it("rejects stale actions after expiration and protects duplicate commands by idempotency key", () => {
    const { service, clock } = createService();
    const firstStart = service.submit(command("start", { expectedStateVersion: 0 }));
    const duplicateStart = service.submit(command("start", { commandId: "start-command-2", expectedStateVersion: 0 }));

    expect(firstStart.status).toBe("ACCEPTED");
    expect(duplicateStart.status).toBe("DUPLICATE");
    expect(service.project("timer-1").stateVersion).toBe(1);

    clock.advance(30_000);
    service.expireDueTimers();

    expect(
      service.submit(command("pause", { commandId: "late-pause", idempotencyKey: "late-pause", expectedStateVersion: 1 })),
    ).toMatchObject({ status: "REJECTED", reasonCode: "STALE_STATE" });
    expect(
      service.submit(command("cancel", { commandId: "late-cancel", idempotencyKey: "late-cancel" })),
    ).toMatchObject({ status: "REJECTED", reasonCode: "EXPIRED" });
  });

  it("supports explicit add/subtract time while preserving state-version checks", () => {
    const { service } = createService();

    expect(service.submit(command("addTime", { idempotencyKey: "add", amountMs: 5_000 }))).toMatchObject({
      status: "ACCEPTED",
    });
    expect(service.project("timer-1").durationMs).toBe(35_000);
    expect(
      service.submit(
        command("subtractTime", {
          commandId: "subtract-stale",
          idempotencyKey: "subtract-stale",
          amountMs: 5_000,
          expectedStateVersion: 0,
        }),
      ),
    ).toMatchObject({ status: "REJECTED", reasonCode: "STALE_STATE" });
  });

  it("supports overtime count-up without changing expiration into browser authority", () => {
    const clock = createClock();
    let eventIndex = 0;
    const service = new TimerService({
      now: clock.now,
      createEventId: () => `timer-event-${++eventIndex}`,
    });
    service.defineTimer({
      id: "timer-1",
      contextId: "round-1",
      durationMs: 10_000,
      overtimeMode: "count-up",
    });
    service.submit(command("start"));
    clock.advance(12_500);

    expect(service.expireDueTimers()).toEqual([]);
    expect(service.project("timer-1")).toMatchObject({
      state: "running",
      remainingMs: 0,
      overtimeMs: 2_500,
    });
  });
});
