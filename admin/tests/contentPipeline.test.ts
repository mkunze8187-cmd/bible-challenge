import { describe, expect, it } from "vitest";
import { validateGameRounds, slugify, type CustomContentGame } from "../src/lib/content";

describe("content.validateGameRounds", () => {
  it("accepts a valid round for a flat-schema game (complete-the-verse)", async () => {
    const game: CustomContentGame = {
      gameId: "test-ctv",
      gameTitle: "Test Complete The Verse",
      gameType: "complete-the-verse",
      description: "",
      rounds: [
        {
          id: "ctv-test-1",
          title: "Test Round",
          book: "Psalms",
          reference: "Psalm 23:1",
          verseStart: "The LORD is my shepherd;",
          correctEnding: "I shall not want.",
          choices: ["I shall not want.", "I shall be glad.", "I shall not fear.", "I shall not fall."],
          theme: "Test",
          difficulty: "easy",
          teachingNote: "Test note."
        }
      ]
    };

    await expect(validateGameRounds("test-pack", "Test Pack", game)).resolves.toBeUndefined();
  });

  it("rejects a round missing a required field", async () => {
    const game: CustomContentGame = {
      gameId: "test-ctv-bad",
      gameTitle: "Test Complete The Verse Bad",
      gameType: "complete-the-verse",
      description: "",
      rounds: [
        {
          id: "ctv-test-bad",
          title: "Test Round"
          // missing book, reference, verseStart, correctEnding, choices, theme, difficulty, teachingNote
        }
      ]
    };

    await expect(validateGameRounds("test-pack", "Test Pack", game)).rejects.toThrow(/Invalid/);
  });

  it("rejects a round for a nested-schema game with wrong choice count (bible-connections)", async () => {
    const game: CustomContentGame = {
      gameId: "test-bc-bad",
      gameTitle: "Test Bible Connections",
      gameType: "bible-connections",
      description: "",
      rounds: [
        {
          id: "bc-test-1",
          title: "Test Connections",
          groups: [{ id: "g1", category: "Cat", items: ["a", "b", "c"] }], // items needs exactly 4
          difficulty: "easy",
          teachingNote: "Note."
        }
      ]
    };

    await expect(validateGameRounds("test-pack", "Test Pack", game)).rejects.toThrow(/Invalid/);
  });
});

describe("content.slugify", () => {
  it("produces a safe id fragment", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("   ")).toBe("custom");
  });
});
