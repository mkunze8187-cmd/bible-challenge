import { describe, expect, it } from "vitest";
import { findDuplicates, fingerprintRound, normalizeText } from "../src/lib/dedupe";

describe("dedupe.normalizeText", () => {
  it("normalizes case, punctuation, and whitespace", () => {
    expect(normalizeText("Road-to-Damascus")).toBe(normalizeText("road   to damascus"));
    expect(normalizeText("  Genesis 1:1  ")).toBe("genesis 1 1");
  });
});

describe("dedupe.fingerprintRound", () => {
  it("builds the same fingerprint for equivalent string field values", () => {
    const a = fingerprintRound({ reference: "Genesis 1:1" }, ["reference"]);
    const b = fingerprintRound({ reference: "genesis   1:1" }, ["reference"]);
    expect(a).toBe(b);
  });

  it("sorts array fields so order doesn't affect the fingerprint", () => {
    const a = fingerprintRound({ aliases: ["Moses", "Moshe"] }, ["aliases"]);
    const b = fingerprintRound({ aliases: ["moshe", "MOSES"] }, ["aliases"]);
    expect(a).toBe(b);
  });
});

describe("dedupe.findDuplicates", () => {
  it("flags a candidate matching an existing round without dropping it silently", () => {
    const existing = [{ reference: "Genesis 1:1", verseText: "..." }];
    const candidates = [
      { reference: "Genesis 1:1", verseText: "different text but same reference" },
      { reference: "Genesis 1:2", verseText: "a new verse" }
    ];

    const result = findDuplicates(candidates, existing, ["reference"]);

    expect(result.accepted).toHaveLength(1);
    expect(result.accepted[0].reference).toBe("Genesis 1:2");
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0].reason).toBe("existing");
  });

  it("flags duplicates within the same batch", () => {
    const candidates = [
      { reference: "John 3:16" },
      { reference: "john   3:16" },
      { reference: "Romans 8:28" }
    ];

    const result = findDuplicates(candidates, [], ["reference"]);

    expect(result.accepted).toHaveLength(2);
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0].reason).toBe("within-batch");
  });

  it("accepts everything when nothing matches", () => {
    const result = findDuplicates([{ reference: "A" }, { reference: "B" }], [{ reference: "C" }], ["reference"]);
    expect(result.accepted).toHaveLength(2);
    expect(result.duplicates).toHaveLength(0);
  });
});
