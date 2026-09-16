import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const BOILERPLATE_PATTERNS = [
  {
    reason: "generic review note",
    pattern: /^Review .+ before continuing\.$/i
  },
  {
    reason: "generic Bible connection note",
    pattern: /^Review .+ and how it connects to the Bible before continuing\.$/i
  },
  {
    reason: "generic full-verse review note",
    pattern: /^Review .+ and the full verse before continuing\.$/i
  },
  {
    reason: "word-ladder mechanic note",
    pattern: /^Change one letter at a time to turn ".+" into ".+"\.$/i
  }
];

function getAllRounds(pack) {
  return Array.isArray(pack.sessions) ? pack.sessions.flatMap((session) => session.rounds ?? []) : [];
}

function getNoteIssue(round) {
  const note = typeof round.teachingNote === "string" ? round.teachingNote.trim() : "";

  if (!note) {
    return { reason: "missing teachingNote", note };
  }

  const patternMatch = BOILERPLATE_PATTERNS.find((entry) => entry.pattern.test(note));
  if (patternMatch) {
    return { reason: patternMatch.reason, note };
  }

  const explanation = typeof round.explanation === "string" ? round.explanation.trim() : "";
  if (explanation && explanation === note && /^.+ comes earlier in the biblical sequence than .+\.$/i.test(note)) {
    return { reason: "circular before-or-after note", note };
  }

  return null;
}

const files = (await readdir(dataDir))
  .filter((fileName) => fileName.endsWith(".json") && fileName !== "word-ladder-dictionary.json")
  .sort();

const results = [];

for (const fileName of files) {
  const pack = JSON.parse(await readFile(path.join(dataDir, fileName), "utf8"));
  const rounds = getAllRounds(pack);
  const issues = [];

  for (const round of rounds) {
    const issue = getNoteIssue(round);
    if (issue) {
      issues.push({
        id: round.id ?? "(missing id)",
        reason: issue.reason,
        note: issue.note
      });
    }
  }

  results.push({
    game: pack.game ?? fileName.replace(/\.json$/, ""),
    fileName,
    totalRounds: rounds.length,
    issueCount: issues.length,
    issues
  });
}

const affected = results.filter((result) => result.issueCount > 0);
const totalRounds = results.reduce((sum, result) => sum + result.totalRounds, 0);
const totalIssues = results.reduce((sum, result) => sum + result.issueCount, 0);

console.log(`Study note audit: ${totalIssues} of ${totalRounds} rounds need review across ${affected.length} games.`);

for (const result of affected) {
  const reasonCounts = new Map();
  for (const issue of result.issues) {
    reasonCounts.set(issue.reason, (reasonCounts.get(issue.reason) ?? 0) + 1);
  }

  const reasons = Array.from(reasonCounts.entries())
    .map(([reason, count]) => `${reason}: ${count}`)
    .join("; ");
  console.log(`- ${result.game}: ${result.issueCount}/${result.totalRounds} (${reasons})`);

  for (const issue of result.issues.slice(0, 3)) {
    console.log(`  - ${issue.id}: ${issue.note}`);
  }
}

if (totalIssues > 0) {
  process.exitCode = 1;
}
