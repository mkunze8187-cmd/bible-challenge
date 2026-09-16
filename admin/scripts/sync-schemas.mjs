#!/usr/bin/env node
// Vendors the JSON Schemas + game manifest from the main Bible Challenge app's checked-out
// source tree into this repo. Run manually whenever the main app adds/changes a game:
//   node scripts/sync-schemas.mjs --source ../Personal
//
// This is a deliberate copy, not a live cross-repo read: reading the main app's schemas
// directly at build/runtime would make this admin console fail to build standalone unless
// the main app's repo happened to be checked out at an assumed relative path on every
// machine. Vendoring trades that silent-failure risk for a staleness risk instead, which
// is detectable — see verify-schemas-fresh.mjs and the checksum file this script writes.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = { source: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--source" && argv[i + 1]) {
      args.source = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

const { source } = parseArgs(process.argv.slice(2));

if (!source) {
  console.error("Usage: node scripts/sync-schemas.mjs --source <path-to-Personal-checkout>");
  process.exit(1);
}

const mainAppRoot = path.resolve(source);
const mainSchemasDir = path.join(mainAppRoot, "src", "data", "schemas");
const mainGameDataFile = path.join(mainAppRoot, "src", "types", "gameData.ts");
const mainGameEngineFile = path.join(mainAppRoot, "src", "lib", "gameEngine.ts");

const targetSchemasDir = path.join(repoRoot, "src", "data", "schemas");
const targetGamesManifest = path.join(repoRoot, "src", "data", "games.json");
const targetChecksumFile = path.join(repoRoot, "src", "data", "schemas.checksum.json");

function extractGameIdUnion(gameDataSource) {
  const match = gameDataSource.match(/export type GameId =\s*([\s\S]*?);/);
  if (!match) {
    throw new Error("Could not find GameId union in the main app's src/types/gameData.ts.");
  }
  return Array.from(match[1].matchAll(/"([a-z0-9-]+)"/g)).map((entry) => entry[1]);
}

function extractGameLibrary(gameEngineSource) {
  const match = gameEngineSource.match(/export const GAME_LIBRARY[\s\S]*?\n};/);
  if (!match) {
    throw new Error("Could not find GAME_LIBRARY in the main app's src/lib/gameEngine.ts.");
  }

  // GAME_LIBRARY's entries are simple `<key>: { label: "...", shortDescription: "...", ... }`
  // object literals, where <key> is either a quoted string ("five-guesses":) or, for keys
  // that are valid bare identifiers, unquoted (initials:) — TypeScript/JS object literal
  // shorthand allows both, and this file uses whichever reads cleaner per key. A small
  // hand-rolled parse handling both forms is safer/more transparent here than eval'ing
  // main-app source, and this admin console only needs label + shortDescription per game.
  const entries = new Map();
  const entryPattern = /^\s{2}(?:"([a-z0-9-]+)"|([a-z][a-zA-Z0-9]*)):\s*\{([^}]*)\}/gm;
  let entryMatch;
  while ((entryMatch = entryPattern.exec(match[0])) !== null) {
    const [, quotedGameId, bareGameId, body] = entryMatch;
    const gameId = quotedGameId || bareGameId;
    const labelMatch = body.match(/label:\s*"([^"]*)"/);
    const shortDescriptionMatch = body.match(/shortDescription:\s*"([^"]*)"/);
    entries.set(gameId, {
      label: labelMatch ? labelMatch[1] : gameId,
      shortDescription: shortDescriptionMatch ? shortDescriptionMatch[1] : ""
    });
  }
  return entries;
}

const gameIds = extractGameIdUnion(readFileSync(mainGameDataFile, "utf8"));
const gameLibrary = extractGameLibrary(readFileSync(mainGameEngineFile, "utf8"));

mkdirSync(targetSchemasDir, { recursive: true });

const schemaFiles = readdirSync(mainSchemasDir).filter((name) => name.endsWith(".schema.json"));
const checksums = {};

for (const fileName of schemaFiles) {
  const content = readFileSync(path.join(mainSchemasDir, fileName));
  writeFileSync(path.join(targetSchemasDir, fileName), content);
  checksums[fileName] = createHash("sha256").update(content).digest("hex");
}

// Remove vendored schema files for games that no longer exist in the main app — this
// script only ever copies IN, so without this a removed game's schema would silently
// linger here forever (a real staleness bug found in practice when First Letter Recall
// was removed from the main app but its schema stayed behind in this repo).
const vendoredFiles = readdirSync(targetSchemasDir).filter((name) => name.endsWith(".schema.json"));
let removedCount = 0;
for (const fileName of vendoredFiles) {
  if (!schemaFiles.includes(fileName)) {
    unlinkSync(path.join(targetSchemasDir, fileName));
    removedCount += 1;
    console.log(`Removed stale vendored schema: ${fileName}`);
  }
}

const games = gameIds.map((gameId) => {
  const libraryEntry = gameLibrary.get(gameId);
  return {
    gameId,
    label: libraryEntry?.label ?? gameId,
    shortDescription: libraryEntry?.shortDescription ?? "",
    schemaFile: `${gameId}.schema.json`
  };
});

const missingSchemas = games.filter((game) => !schemaFiles.includes(game.schemaFile));
if (missingSchemas.length > 0) {
  console.warn(
    `Warning: ${missingSchemas.length} game(s) have no matching schema file: ${missingSchemas.map((g) => g.gameId).join(", ")}`
  );
}

writeFileSync(targetGamesManifest, `${JSON.stringify({ games }, null, 2)}\n`, "utf8");
writeFileSync(targetChecksumFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), checksums }, null, 2)}\n`, "utf8");

console.log(
  `Synced ${schemaFiles.length} schema files and ${games.length} games from ${mainAppRoot}${
    removedCount > 0 ? ` (removed ${removedCount} stale file${removedCount === 1 ? "" : "s"})` : ""
  }.`
);
console.log(`Wrote ${path.relative(repoRoot, targetGamesManifest)} and ${path.relative(repoRoot, targetChecksumFile)}.`);
