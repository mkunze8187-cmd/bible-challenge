export type TimerState = "ready" | "running" | "paused" | "expired" | "cancelled";
export type TimerVisibility = "public" | "player" | "team" | "host-only";
export type TimerOvertimeMode = "none" | "count-up";
export type TimerCommandType = "start" | "pause" | "resume" | "reset" | "cancel" | "expire" | "addTime" | "subtractTime";
export type TimerCommandStatus = "ACCEPTED" | "REJECTED" | "DUPLICATE";

export interface AgonTimer {
  id: string;
  contextId: string;
  durationMs: number;
  state: TimerState;
  accumulatedElapsedMs: number;
  startedAt?: string;
  warningThresholdsMs?: number[];
  firedWarningThresholdsMs: number[];
  overtimeMode: TimerOvertimeMode;
  visibility: TimerVisibility;
  stateVersion: number;
}

export interface TimerCommand {
  commandId: string;
  idempotencyKey: string;
  timerId: string;
  type: TimerCommandType;
  expectedStateVersion?: number;
  amountMs?: number;
}

export interface TimerEvent {
  eventId: string;
  timerId: string;
  type: string;
  stateVersion: number;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface TimerCommandResult {
  commandId: string;
  status: TimerCommandStatus;
  stateVersion: number;
  events: TimerEvent[];
  reasonCode?: TimerRejectionCode;
}

export type TimerRejectionCode =
  | "UNKNOWN_TIMER"
  | "INVALID_STATE"
  | "STALE_STATE"
  | "INVALID_DURATION"
  | "EXPIRED";

export interface TimerProjection {
  timerId: string;
  contextId: string;
  state: TimerState;
  durationMs: number;
  elapsedMs: number;
  remainingMs: number;
  overtimeMs: number;
  warningThresholdsMs: number[];
  visibility: TimerVisibility;
  stateVersion: number;
}
