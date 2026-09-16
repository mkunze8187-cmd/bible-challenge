#!/usr/bin/env node
// Detects drift between this repo's vendored schemas and the main app's current source
// tree, WITHOUT overwriting anything (unlike sync-schemas.mjs). Run before cutting a
// release:
//   node scripts/verify-schemas-fresh.mjs --source ../Personal
//
// Exits non-zero and lists every mismatch if the main app's schemas have changed since the
// last sync-schemas.mjs run. This is the detectable half of the vendor-vs-live-read
// tradeoff documented in sync-schemas.mjs — there is no automated cross-repo enforcement,
// so this must be run manually as part of the release checklist.
import { readFileSync, readdirSync } from "node:fs";
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
  console.error("Usage: node scripts/verify-schemas-fresh.mjs --source <path-to-Personal-checkout>");
  process.exit(1);
}

const mainSchemasDir = path.join(path.resolve(source), "src", "data", "schemas");
const checksumFile = path.join(repoRoot, "src", "data", "schemas.checksum.json");

let recorded;
try {
  recorded = JSON.parse(readFileSync(checksumFile, "utf8"));
} catch {
  console.error(`Could not read ${path.relative(repoRoot, checksumFile)}. Run sync-schemas.mjs at least once first.`);
  process.exit(1);
}

const mainFiles = new Set(readdirSync(mainSchemasDir).filter((name) => name.endsWith(".schema.json")));
const vendoredFiles = new Set(Object.keys(recorded.checksums));

const mismatches = [];
const newInMain = [...mainFiles].filter((name) => !vendoredFiles.has(name));
const removedFromMain = [...vendoredFiles].filter((name) => !mainFiles.has(name));

for (const fileName of vendoredFiles) {
  if (!mainFiles.has(fileName)) {
    continue;
  }
  const currentHash = createHash("sha256").update(readFileSync(path.join(mainSchemasDir, fileName))).digest("hex");
  if (currentHash !== recorded.checksums[fileName]) {
    mismatches.push(fileName);
  }
}

if (mismatches.length === 0 && newInMain.length === 0 && removedFromMain.length === 0) {
  console.log(`Vendored schemas are fresh as of the last sync (recorded ${recorded.generatedAt}).`);
  process.exit(0);
}

console.error("Vendored schemas are STALE:");
if (mismatches.length > 0) {
  console.error(`  Changed since last sync: ${mismatches.join(", ")}`);
}
if (newInMain.length > 0) {
  console.error(`  New in main app, not yet vendored: ${newInMain.join(", ")}`);
}
if (removedFromMain.length > 0) {
  console.error(`  Vendored but no longer in main app: ${removedFromMain.join(", ")}`);
}
console.error("Run: node scripts/sync-schemas.mjs --source " + source);
process.exit(1);
