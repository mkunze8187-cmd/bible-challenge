import {
  InvalidRngOperationError,
  type RngCheckpoint,
  type RngOperation,
  type RngRequest,
  type RngResult,
  type RngState,
} from "./types";

const UINT32_MAX_PLUS_ONE = 0x100000000;

export class AuthoritativeRng {
  private state: RngState;
  private readonly acceptedResults = new Map<string, RngResult>();

  constructor(seedOrCheckpoint: string | RngCheckpoint) {
    if (typeof seedOrCheckpoint === "string") {
      this.state = {
        seed: seedOrCheckpoint,
        state: seedToUint32(seedOrCheckpoint),
        cursor: 0,
      };
    } else {
      this.state = cloneState(seedOrCheckpoint.state);
      for (const result of seedOrCheckpoint.acceptedResults) {
        this.acceptedResults.set(result.idempotencyKey, cloneResult(result));
      }
    }
  }

  getState(): RngState {
    return cloneState(this.state);
  }

  checkpoint(): RngCheckpoint {
    return {
      checkpointVersion: "rng-checkpoint.v1",
      state: cloneState(this.state),
      acceptedResults: [...this.acceptedResults.values()].map(cloneResult),
    };
  }

  execute(request: RngRequest): RngResult {
    const prior = this.acceptedResults.get(request.idempotencyKey);
    if (prior) {
      return { ...cloneResult(prior), requestId: request.requestId, duplicate: true };
    }

    const stateBefore = cloneState(this.state);
    const value = this.executeOperation(request.operation);
    const result: RngResult = {
      requestId: request.requestId,
      idempotencyKey: request.idempotencyKey,
      stateBefore,
      stateAfter: cloneState(this.state),
      value,
      duplicate: false,
    };
    this.acceptedResults.set(request.idempotencyKey, cloneResult(result));
    return result;
  }

  boundedInt(minInclusive: number, maxExclusive: number): number {
    if (!Number.isInteger(minInclusive) || !Number.isInteger(maxExclusive) || maxExclusive <= minInclusive) {
      throw new InvalidRngOperationError("boundedInt requires integer minInclusive < maxExclusive.");
    }

    const range = maxExclusive - minInclusive;
    const limit = UINT32_MAX_PLUS_ONE - (UINT32_MAX_PLUS_ONE % range);
    let value = this.nextUint32();
    while (value >= limit) {
      value = this.nextUint32();
    }

    return minInclusive + (value % range);
  }

  choice<T>(items: readonly T[]): T {
    if (items.length < 1) throw new InvalidRngOperationError("choice requires at least one item.");
    return items[this.boundedInt(0, items.length)];
  }

  shuffle<T>(items: readonly T[]): T[] {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = this.boundedInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private executeOperation(operation: RngOperation): number | number[] {
    switch (operation.type) {
      case "boundedInt":
        return this.boundedInt(operation.minInclusive, operation.maxExclusive);
      case "choice":
        return this.boundedInt(0, operation.count);
      case "shuffle":
        return this.shuffle([...Array(operation.count).keys()]);
    }
  }

  private nextUint32(): number {
    let x = this.state.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = {
      ...this.state,
      state: x >>> 0,
      cursor: this.state.cursor + 1,
    };
    return this.state.state;
  }
}

export function seedToUint32(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || 0x6d2b79f5;
}

function cloneState(state: RngState): RngState {
  return { ...state };
}

function cloneResult(result: RngResult): RngResult {
  return {
    requestId: result.requestId,
    idempotencyKey: result.idempotencyKey,
    stateBefore: cloneState(result.stateBefore),
    stateAfter: cloneState(result.stateAfter),
    value: Array.isArray(result.value) ? [...result.value] : result.value,
    duplicate: result.duplicate,
  };
}
