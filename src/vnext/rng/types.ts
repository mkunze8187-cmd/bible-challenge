export interface RngState {
  seed: string;
  state: number;
  cursor: number;
}

export type RngOperation =
  | { type: "boundedInt"; minInclusive: number; maxExclusive: number }
  | { type: "choice"; count: number }
  | { type: "shuffle"; count: number };

export interface RngRequest {
  requestId: string;
  idempotencyKey: string;
  operation: RngOperation;
}

export interface RngResult {
  requestId: string;
  idempotencyKey: string;
  stateBefore: RngState;
  stateAfter: RngState;
  value: number | number[];
  duplicate: boolean;
}

export interface RngCheckpoint {
  checkpointVersion: "rng-checkpoint.v1";
  state: RngState;
  acceptedResults: RngResult[];
}

export class InvalidRngOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRngOperationError";
  }
}
