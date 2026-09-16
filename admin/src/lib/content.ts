import Ajv2020 from "ajv/dist/2020";
import type { GameId } from "../types/gameData";
import gamesManifest from "../data/games.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });

export interface GameManifestEntry {
  gameId: GameId;
  label: string;
  shortDescription: string;
  schemaFile: string;
}

export const GAMES: GameManifestEntry[] = gamesManifest.games as GameManifestEntry[];
const GAMES_BY_ID = new Map(GAMES.map((game) => [game.gameId, game]));

export function getGameManifestEntry(gameId: GameId): GameManifestEntry {
  const entry = GAMES_BY_ID.get(gameId);
  if (!entry) {
    throw new Error(`Unknown game id "${gameId}" — is games.json stale? Run npm run sync-schemas.`);
  }
  return entry;
}

// Vite's dynamic import() needs a literal, static specifier per module — the same
// constraint the main app documents in its own src/lib/content.ts. Since every vendored
// schema file lives at a predictable path, a template-literal import with the filename
// interpolated in still works here (unlike a fully dynamic string built at runtime from
// arbitrary user input) because Vite can statically discover every matching file under
// src/data/schemas/*.schema.json via import.meta.glob.
const schemaModules = import.meta.glob<{ default: object }>("../data/schemas/*.schema.json");

async function loadSchema(schemaFile: string): Promise<object> {
  const key = `../data/schemas/${schemaFile}`;
  const loader = schemaModules[key];
  if (!loader) {
    throw new Error(`No vendored schema found for "${schemaFile}". Run npm run sync-schemas.`);
  }
  const module = await loader();
  return module.default;
}

function loadValidatedPack<T>(schema: object, data: unknown, label: string): T {
  const validate = ajv.compile(schema);

  if (!validate(data)) {
    const detail = (validate.errors ?? [])
      .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
      .join("; ");
    throw new Error(`Invalid ${label} content: ${detail}`);
  }

  return data as T;
}

export interface CustomContentGame {
  gameId: string;
  gameTitle: string;
  gameType: GameId;
  description: string;
  rounds: unknown[];
}

export interface CustomContentPack {
  packId: string;
  packName: string;
  accentColor: string;
  games: CustomContentGame[];
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "custom";
}

// Validates one game's rounds against its real schema by wrapping them in the same
// synthetic single-session pack shape the main app's validateCustomGame builds — this is
// the exact mechanism that makes "valid" mean the same thing in both apps, since both
// validate against the identical vendored schema file.
export async function validateGameRounds(packId: string, packName: string, game: CustomContentGame): Promise<void> {
  const manifestEntry = getGameManifestEntry(game.gameType);
  const schema = await loadSchema(manifestEntry.schemaFile);
  const sessionPack = {
    $schema: `custom://${packId}/${game.gameType}`,
    game: game.gameType,
    version: 1,
    displayName: game.gameTitle,
    roundsPerSession: Math.max(1, Math.min(10, game.rounds.length)),
    sessions: [
      {
        id: `${slugify(packId)}-${slugify(game.gameId)}`,
        title: game.gameTitle,
        theme: packName,
        rounds: game.rounds
      }
    ]
  };

  loadValidatedPack(schema, sessionPack, `${packName} / ${game.gameTitle}`);
}

export async function loadRoundSchema(gameId: GameId): Promise<object> {
  const manifestEntry = getGameManifestEntry(gameId);
  return loadSchema(manifestEntry.schemaFile);
}
