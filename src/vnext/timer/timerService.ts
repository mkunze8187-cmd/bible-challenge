import type { AgonTimer, TimerCommand, TimerCommandResult, TimerEvent, TimerProjection, TimerRejectionCode } from "./types";

export interface TimerDefinition {
  id: string;
  contextId: string;
  durationMs: number;
  warningThresholdsMs?: number[];
  overtimeMode?: "none" | "count-up";
  visibility?: "public" | "player" | "team" | "host-only";
}

export interface TimerServiceOptions {
  now: () => Date;
  createEventId: () => string;
}

export class TimerService {
  private readonly timers = new Map<string, AgonTimer>();
  private readonly idempotencyResults = new Map<string, TimerCommandResult>();

  constructor(private readonly options: TimerServiceOptions) {}

  defineTimer(definition: TimerDefinition): AgonTimer {
    if (definition.durationMs <= 0) {
      throw new Error("Timer duration must be greater than zero.");
    }

    const timer: AgonTimer = {
      id: definition.id,
      contextId: definition.contextId,
      durationMs: definition.durationMs,
      state: "ready",
      accumulatedElapsedMs: 0,
      warningThresholdsMs: [...(definition.warningThresholdsMs ?? [])].sort((a, b) => b - a),
      firedWarningThresholdsMs: [],
      overtimeMode: definition.overtimeMode ?? "none",
      visibility: definition.visibility ?? "public",
      stateVersion: 0,
    };
    this.timers.set(timer.id, timer);
    return this.cloneTimer(timer);
  }

  getTimer(timerId: string): AgonTimer | undefined {
    const timer = this.timers.get(timerId);
    return timer ? this.cloneTimer(timer) : undefined;
  }

  submit(command: TimerCommand): TimerCommandResult {
    const timer = this.timers.get(command.timerId);
    if (!timer) return this.reject(command, 0, "UNKNOWN_TIMER");

    if (this.idempotencyResults.has(command.idempotencyKey)) {
      const prior = this.idempotencyResults.get(command.idempotencyKey)!;
      return { ...prior, status: "DUPLICATE", events: prior.events.map((event) => ({ ...event })) };
    }
    if (command.expectedStateVersion !== undefined && command.expectedStateVersion < timer.stateVersion) {
      return this.reject(command, timer.stateVersion, "STALE_STATE");
    }

    const result = this.applyCommand(timer, command);
    if (result.status === "ACCEPTED") {
      this.idempotencyResults.set(command.idempotencyKey, result);
    }
    return result;
  }

  expireDueTimers(): TimerEvent[] {
    const events: TimerEvent[] = [];
    for (const timer of this.timers.values()) {
      if (timer.state !== "running") continue;
      const projection = this.project(timer.id);
      for (const threshold of timer.warningThresholdsMs ?? []) {
        if (projection.remainingMs <= threshold && !timer.firedWarningThresholdsMs.includes(threshold)) {
          timer.firedWarningThresholdsMs.push(threshold);
          timer.stateVersion += 1;
          events.push(this.event(timer, "timer.warning", { thresholdMs: threshold }));
        }
      }
      if (projection.remainingMs === 0 && timer.overtimeMode === "none") {
        timer.accumulatedElapsedMs = timer.durationMs;
        timer.startedAt = undefined;
        timer.state = "expired";
        timer.stateVersion += 1;
        events.push(this.event(timer, "timer.expired", {}));
      }
    }
    return events;
  }

  project(timerId: string): TimerProjection {
    const timer = this.timers.get(timerId);
    if (!timer) throw new Error(`Unknown timer "${timerId}".`);
    const elapsedMs = this.elapsedMs(timer);
    const remainingMs = Math.max(0, timer.durationMs - elapsedMs);
    const overtimeMs = timer.overtimeMode === "count-up" ? Math.max(0, elapsedMs - timer.durationMs) : 0;

    return {
      timerId: timer.id,
      contextId: timer.contextId,
      state: timer.state,
      durationMs: timer.durationMs,
      elapsedMs,
      remainingMs,
      overtimeMs,
      warningThresholdsMs: [...(timer.warningThresholdsMs ?? [])],
      visibility: timer.visibility,
      stateVersion: timer.stateVersion,
    };
  }

  private applyCommand(timer: AgonTimer, command: TimerCommand): TimerCommandResult {
    switch (command.type) {
      case "start":
        if (timer.state !== "ready") return this.reject(command, timer.stateVersion, "INVALID_STATE");
        timer.startedAt = this.options.now().toISOString();
        timer.state = "running";
        return this.accept(command, timer, "timer.started", {});
      case "pause":
        if (timer.state !== "running") return this.reject(command, timer.stateVersion, "INVALID_STATE");
        timer.accumulatedElapsedMs = this.elapsedMs(timer);
        timer.startedAt = undefined;
        timer.state = "paused";
        return this.accept(command, timer, "timer.paused", {});
      case "resume":
        if (timer.state !== "paused") return this.reject(command, timer.stateVersion, "INVALID_STATE");
        timer.startedAt = this.options.now().toISOString();
        timer.state = "running";
        return this.accept(command, timer, "timer.resumed", {});
      case "reset":
        timer.startedAt = undefined;
        timer.accumulatedElapsedMs = 0;
        timer.firedWarningThresholdsMs = [];
        timer.state = "ready";
        return this.accept(command, timer, "timer.reset", {});
      case "cancel":
        if (timer.state === "expired") return this.reject(command, timer.stateVersion, "EXPIRED");
        timer.startedAt = undefined;
        timer.state = "cancelled";
        return this.accept(command, timer, "timer.cancelled", {});
      case "expire":
        timer.accumulatedElapsedMs = timer.durationMs;
        timer.startedAt = undefined;
        timer.state = "expired";
        return this.accept(command, timer, "timer.expired", {});
      case "addTime":
      case "subtractTime":
        return this.adjustDuration(timer, command);
    }
  }

  private adjustDuration(timer: AgonTimer, command: TimerCommand): TimerCommandResult {
    if (timer.state === "expired" || timer.state === "cancelled") {
      return this.reject(command, timer.stateVersion, timer.state === "expired" ? "EXPIRED" : "INVALID_STATE");
    }
    const amount = command.amountMs ?? 0;
    const nextDuration = command.type === "addTime" ? timer.durationMs + amount : timer.durationMs - amount;
    if (amount <= 0 || nextDuration <= 0) return this.reject(command, timer.stateVersion, "INVALID_DURATION");

    timer.durationMs = nextDuration;
    return this.accept(command, timer, command.type === "addTime" ? "timer.timeAdded" : "timer.timeSubtracted", {
      amountMs: amount,
    });
  }

  private accept(command: TimerCommand, timer: AgonTimer, eventType: string, payload: Record<string, unknown>): TimerCommandResult {
    timer.stateVersion += 1;
    const event = this.event(timer, eventType, payload);
    return { commandId: command.commandId, status: "ACCEPTED", stateVersion: timer.stateVersion, events: [event] };
  }

  private reject(command: Pick<TimerCommand, "commandId">, stateVersion: number, reasonCode: TimerRejectionCode): TimerCommandResult {
    return { commandId: command.commandId, status: "REJECTED", stateVersion, reasonCode, events: [] };
  }

  private event(timer: AgonTimer, type: string, payload: Record<string, unknown>): TimerEvent {
    return {
      eventId: this.options.createEventId(),
      timerId: timer.id,
      type,
      stateVersion: timer.stateVersion,
      occurredAt: this.options.now().toISOString(),
      payload,
    };
  }

  private elapsedMs(timer: AgonTimer): number {
    if (timer.state !== "running" || !timer.startedAt) return timer.accumulatedElapsedMs;
    return timer.accumulatedElapsedMs + Math.max(0, this.options.now().getTime() - new Date(timer.startedAt).getTime());
  }

  private cloneTimer(timer: AgonTimer): AgonTimer {
    return {
      ...timer,
      warningThresholdsMs: [...(timer.warningThresholdsMs ?? [])],
      firedWarningThresholdsMs: [...timer.firedWarningThresholdsMs],
    };
  }
}
