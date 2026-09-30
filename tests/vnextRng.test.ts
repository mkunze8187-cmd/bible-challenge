import { describe, expect, it } from "vitest";
import { AuthoritativeRng, InvalidRngOperationError } from "../src/vnext/rng";

describe("AuthoritativeRng primitive (#538)", () => {
  it("produces the same sequence for the same seed and accepted operation sequence", () => {
    const first = new AuthoritativeRng("session-seed");
    const second = new AuthoritativeRng("session-seed");
    const operations = [
      { requestId: "r1", idempotencyKey: "k1", operation: { type: "boundedInt" as const, minInclusive: 0, maxExclusive: 10 } },
      { requestId: "r2", idempotencyKey: "k2", operation: { type: "choice" as const, count: 4 } },
      { requestId: "r3", idempotencyKey: "k3", operation: { type: "shuffle" as const, count: 6 } },
    ];

    expect(operations.map((request) => first.execute(request).value)).toEqual(
      operations.map((request) => second.execute(request).value),
    );
    expect(second.getState()).toEqual(first.getState());
  });

  it("checkpoint and restore continues from the correct RNG cursor", () => {
    const original = new AuthoritativeRng("checkpoint-seed");
    original.execute({
      requestId: "before",
      idempotencyKey: "before",
      operation: { type: "boundedInt", minInclusive: 0, maxExclusive: 100 },
    });

    const restored = new AuthoritativeRng(original.checkpoint());
    const originalNext = original.execute({
      requestId: "after-original",
      idempotencyKey: "after",
      operation: { type: "boundedInt", minInclusive: 0, maxExclusive: 100 },
    });
    const restoredNext = restored.execute({
      requestId: "after-restored",
      idempotencyKey: "after",
      operation: { type: "boundedInt", minInclusive: 0, maxExclusive: 100 },
    });

    expect(restoredNext.value).toBe(originalNext.value);
    expect(restoredNext.stateBefore).toEqual(originalNext.stateBefore);
    expect(restored.getState()).toEqual(original.getState());
  });

  it("does not consume randomness twice for duplicate or replayed accepted commands", () => {
    const rng = new AuthoritativeRng("idempotent-seed");
    const first = rng.execute({
      requestId: "first",
      idempotencyKey: "same-logical-request",
      operation: { type: "boundedInt", minInclusive: 1, maxExclusive: 7 },
    });
    const stateAfterFirst = rng.getState();
    const duplicate = rng.execute({
      requestId: "retry",
      idempotencyKey: "same-logical-request",
      operation: { type: "boundedInt", minInclusive: 1, maxExclusive: 7 },
    });

    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.value).toBe(first.value);
    expect(rng.getState()).toEqual(stateAfterFirst);
  });

  it("restores idempotency history from checkpoint without rerolling", () => {
    const rng = new AuthoritativeRng("history-seed");
    const first = rng.execute({
      requestId: "first",
      idempotencyKey: "persisted-request",
      operation: { type: "choice", count: 3 },
    });
    const restored = new AuthoritativeRng(rng.checkpoint());
    const replay = restored.execute({
      requestId: "reconnect-retry",
      idempotencyKey: "persisted-request",
      operation: { type: "choice", count: 3 },
    });

    expect(replay.duplicate).toBe(true);
    expect(replay.value).toBe(first.value);
    expect(restored.getState()).toEqual(rng.getState());
  });

  it("supports representative non-randomizer consumers without #141/#142 semantics", () => {
    const rng = new AuthoritativeRng("team-rotation-seed");
    const participants = ["A", "B", "C", "D"];
    const orderIndexes = rng.execute({
      requestId: "team-rotation",
      idempotencyKey: "round-1-team-rotation",
      operation: { type: "shuffle", count: participants.length },
    }).value as number[];

    expect(orderIndexes.map((index) => participants[index])).toEqual(new AuthoritativeRng("team-rotation-seed").shuffle(participants));
  });

  it("validates primitive operation bounds without product randomizer semantics", () => {
    const rng = new AuthoritativeRng("validation-seed");

    expect(() => rng.boundedInt(3, 3)).toThrow(InvalidRngOperationError);
    expect(() => rng.choice([])).toThrow(InvalidRngOperationError);
  });
});
