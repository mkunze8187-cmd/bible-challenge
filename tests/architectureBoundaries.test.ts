import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { collectSourceFiles, findLegacyImportViolations, LEGACY_ENTRY_POINTS } from "../scripts/lib/architectureBoundaries";

const ROOT = path.resolve(__dirname, "..");

describe("ADR-001 legacy-freeze guard", () => {
  it("GameId union has not grown beyond the current baseline", () => {
    const source = readFileSync(path.join(ROOT, "src/types/gameData.ts"), "utf8");
    const match = source.match(/export type GameId =([\s\S]*?);/);
    if (!match) throw new Error("Could not locate the GameId union in src/types/gameData.ts");
    const members = match[1].match(/"[a-z0-9-]+"/g) ?? [];

    // Extending this union is a legacy-freeze violation (ADR-001 guardrail 5) unless the PR
    // carries the `legacy-only` label with a justification (migration spec: exceptions need
    // an explicit issue note). If this intentionally changed, update the baseline here as
    // part of that justification, not as a silent fix.
    expect(members.length).toBe(32);
  });

  it("PlayerStats has not grown a new per-game field", () => {
    const source = readFileSync(path.join(ROOT, "src/lib/gameCore.ts"), "utf8");
    const match = source.match(/export interface PlayerStats \{([\s\S]*?)\}/);
    if (!match) throw new Error("Could not locate the PlayerStats interface in src/lib/gameCore.ts");
    const fields = match[1].split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

    // Growing this interface per-game is exactly what ADR-001 guardrail 4 forbids: stats/results
    // must use generic and namespaced/extensible models, not a field per game. If this
    // intentionally changed, update the baseline here as part of an explicit `legacy-only`
    // justification, not as a silent fix.
    expect(fields.length).toBe(19);
  });
});

describe("import-boundary enforcement", () => {
  it("no file outside the legacy renderer imports gameEngine.ts or App.tsx", () => {
    const files = collectSourceFiles(ROOT);
    const violations = findLegacyImportViolations(ROOT, files);
    expect(violations).toEqual([]);
  });

  it("flags a fixture file that imports a legacy entry point from outside the legacy renderer", () => {
    const fixtureRelativePath = "src/vnext/exampleCapability.ts";
    const fixtureFiles = new Map<string, string>([
      [fixtureRelativePath, `import { GameEngine } from "../lib/gameEngine";\n\nexport const capability = GameEngine;\n`],
    ]);

    const violations = findLegacyImportViolations(ROOT, [...fixtureFiles.keys()], fixtureFiles);

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      file: fixtureRelativePath,
      importedEntryPoint: LEGACY_ENTRY_POINTS.gameEngine,
    });
  });
});
