import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const ROUNDS_PER_SESSION = 6;
const MIN_STEPS = 3;
const MAX_STEPS = 8;

// Hand-picked Bible-flavor-worthy start/end word pairs. Each pair must be reachable by the
// bundled dictionary via one-letter-at-a-time steps — this script verifies that with BFS
// and rejects/reports any pair that isn't, rather than trusting it was authored correctly.
const flavorPairs = [
  { start: "ark", end: "sea", startFlavor: "What Noah built to survive the flood.", endFlavor: "Where the Israelites crossed on dry ground." },
  { start: "sin", end: "sad", startFlavor: "What separates humanity from God.", endFlavor: "How the wages of sin leave a life." },
  { start: "cat", end: "dog", startFlavor: "One of the animals Noah gathered two by two.", endFlavor: "Another animal Noah gathered two by two." },
  { start: "hot", end: "old", startFlavor: "Neither cold nor this, as Revelation warns.", endFlavor: "What the covenant given at Sinai came to be called." },
  { start: "law", end: "sin", startFlavor: "What Moses received on Mount Sinai.", endFlavor: "What the law reveals in every heart." },
  { start: "king", end: "ruler", startFlavor: "What Saul, David, and Solomon each became.", endFlavor: "Another word for one who reigns." },
  { start: "hope", end: "love", startFlavor: "One of the three things that abide, per 1 Corinthians 13.", endFlavor: "The greatest of the three that abide." },
  { start: "rock", end: "sand", startFlavor: "What the wise man built his house upon.", endFlavor: "What the foolish man built his house upon." },
  { start: "cold", end: "warm", startFlavor: "Neither this nor hot, as Revelation warns.", endFlavor: "A comfort promised to those who trust God." },
  { start: "wise", end: "kind", startFlavor: "What Solomon asked God to make him.", endFlavor: "A fruit of the Spirit, per Galatians 5." },
  { start: "dark", end: "light", startFlavor: "What covered the deep before Creation.", endFlavor: "What God called forth on the first day." },
  { start: "weak", end: "strong", startFlavor: "What Paul said he was, so Christ's power could rest on him.", endFlavor: "What the Lord told Joshua and Israel to be." },
  { start: "poor", end: "rich", startFlavor: "Who Jesus said would inherit the kingdom in spirit.", endFlavor: "What the young ruler was, and could not give up." },
  { start: "lost", end: "found", startFlavor: "What the prodigal son once was to his father.", endFlavor: "What the prodigal son became upon his return." },
  { start: "fear", end: "faith", startFlavor: "What perfect love casts out.", endFlavor: "What is the substance of things hoped for." },
  { start: "give", end: "take", startFlavor: "What Jesus said is more blessed than receiving.", endFlavor: "What the thief on the cross had done in his life." },
  { start: "peace", end: "grace", startFlavor: "What Jesus left with His disciples.", endFlavor: "What we are saved through, by faith." },
  { start: "least", end: "first", startFlavor: "What the servant of all is called in the kingdom.", endFlavor: "What the last shall become." },
  { start: "night", end: "light", startFlavor: "When Nicodemus first came to Jesus.", endFlavor: "What Jesus called Himself, for the world." },
  { start: "small", end: "great", startFlavor: "The size of the mustard seed in Jesus's parable.", endFlavor: "What the mustard seed becomes when it is grown." }
];

function hammingDistanceOne(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let differences = 0;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      differences += 1;
      if (differences > 1) {
        return false;
      }
    }
  }

  return differences === 1;
}

function buildAdjacency(words) {
  const byLength = new Map();
  for (const word of words) {
    if (!byLength.has(word.length)) {
      byLength.set(word.length, []);
    }
    byLength.get(word.length).push(word);
  }

  const adjacency = new Map();
  for (const bucket of byLength.values()) {
    for (const word of bucket) {
      adjacency.set(word, []);
    }
    for (let i = 0; i < bucket.length; i += 1) {
      for (let j = i + 1; j < bucket.length; j += 1) {
        if (hammingDistanceOne(bucket[i], bucket[j])) {
          adjacency.get(bucket[i]).push(bucket[j]);
          adjacency.get(bucket[j]).push(bucket[i]);
        }
      }
    }
  }

  return adjacency;
}

function findShortestPath(adjacency, start, end) {
  if (!adjacency.has(start) || !adjacency.has(end)) {
    return null;
  }

  const queue = [start];
  const cameFrom = new Map([[start, null]]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === end) {
      const path = [];
      let node = end;
      while (node !== null) {
        path.unshift(node);
        node = cameFrom.get(node);
      }
      return path;
    }

    for (const neighbor of adjacency.get(current) ?? []) {
      if (!cameFrom.has(neighbor)) {
        cameFrom.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return null;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const dictionaryFile = JSON.parse(await readFile(path.join(dataDir, "word-ladder-dictionary.json"), "utf8"));
const words = dictionaryFile.words;
const adjacency = buildAdjacency(words);

const puzzles = [];
const usedPairs = new Set();

for (const pair of flavorPairs) {
  const start = pair.start.toLowerCase();
  const end = pair.end.toLowerCase();

  if (start.length !== end.length) {
    console.warn(`Skipping "${start}" -> "${end}": lengths differ.`);
    continue;
  }

  const solutionPath = findShortestPath(adjacency, start, end);
  if (!solutionPath) {
    console.warn(`Skipping "${start}" -> "${end}": no path found in the dictionary graph.`);
    continue;
  }

  const minSteps = solutionPath.length - 1;
  if (minSteps < MIN_STEPS || minSteps > MAX_STEPS) {
    console.warn(`Skipping "${start}" -> "${end}": ${minSteps} steps is outside the ${MIN_STEPS}-${MAX_STEPS} range.`);
    continue;
  }

  usedPairs.add(`${start}:${end}`);
  puzzles.push({
    startWord: start,
    endWord: end,
    wordLength: start.length,
    minSteps,
    revealPath: solutionPath,
    startFlavorText: pair.startFlavor,
    endFlavorText: pair.endFlavor,
    theme: "Bible Word Ladder",
    difficulty: minSteps <= 3 ? "easy" : minSteps <= 5 ? "medium" : "hard"
  });
}

// Auto-generate additional valid pairs (generic flavor text) to reach volume, since Word
// Ladder's puzzle content is "any two connected same-length words" rather than content that
// needs Bible-specific authorship the way trivia/verse content does.
const random = seededRandom(20260910);
const wordsByLength = new Map();
for (const word of words) {
  if (!wordsByLength.has(word.length)) {
    wordsByLength.set(word.length, []);
  }
  wordsByLength.get(word.length).push(word);
}

const TARGET_TOTAL_PUZZLES = 150;
let attempts = 0;
const maxAttempts = 20000;

while (puzzles.length < TARGET_TOTAL_PUZZLES && attempts < maxAttempts) {
  attempts += 1;
  const lengths = Array.from(wordsByLength.keys());
  const length = lengths[Math.floor(random() * lengths.length)];
  const bucket = wordsByLength.get(length);
  if (bucket.length < 2) {
    continue;
  }

  const start = bucket[Math.floor(random() * bucket.length)];
  const end = bucket[Math.floor(random() * bucket.length)];
  if (start === end) {
    continue;
  }

  const pairKey = `${start}:${end}`;
  const reverseKey = `${end}:${start}`;
  if (usedPairs.has(pairKey) || usedPairs.has(reverseKey)) {
    continue;
  }

  const solutionPath = findShortestPath(adjacency, start, end);
  if (!solutionPath) {
    continue;
  }

  const minSteps = solutionPath.length - 1;
  if (minSteps < MIN_STEPS || minSteps > MAX_STEPS) {
    continue;
  }

  usedPairs.add(pairKey);
  puzzles.push({
    startWord: start,
    endWord: end,
    wordLength: start.length,
    minSteps,
    revealPath: solutionPath,
    startFlavorText: "A starting word for this ladder.",
    endFlavorText: "The target word for this ladder.",
    theme: "Word Ladder",
    difficulty: minSteps <= 3 ? "easy" : minSteps <= 5 ? "medium" : "hard"
  });
}

const rounds = puzzles.map((puzzle, index) => ({
  id: `wl-r${(index + 1).toString().padStart(3, "0")}-${slugify(puzzle.startWord)}-${slugify(puzzle.endWord)}`,
  startWord: puzzle.startWord,
  endWord: puzzle.endWord,
  wordLength: puzzle.wordLength,
  minSteps: puzzle.minSteps,
  revealPath: puzzle.revealPath,
  startFlavorText: puzzle.startFlavorText,
  endFlavorText: puzzle.endFlavorText,
  theme: puzzle.theme,
  difficulty: puzzle.difficulty,
  teachingNote: `Change one letter at a time to turn "${puzzle.startWord}" into "${puzzle.endWord}".`
}));

const sessions = [];
for (let index = 0; index < rounds.length; index += ROUNDS_PER_SESSION) {
  const sessionNumber = Math.floor(index / ROUNDS_PER_SESSION) + 1;
  const chunk = rounds.slice(index, index + ROUNDS_PER_SESSION);

  if (chunk.length < ROUNDS_PER_SESSION) {
    break;
  }

  sessions.push({
    id: `wl-session-${sessionNumber.toString().padStart(2, "0")}`,
    title: `Word Ladder Deck ${sessionNumber}`,
    theme: "Word Ladder",
    rounds: chunk
  });
}

const pack = {
  $schema: "https://example.local/schemas/word-ladder.schema.json",
  game: "word-ladder",
  version: 1,
  displayName: "Word Ladder",
  roundsPerSession: ROUNDS_PER_SESSION,
  sessions
};

const handPickedCount = puzzles.filter((puzzle) => puzzle.theme === "Bible Word Ladder").length;

await mkdir(dataDir, { recursive: true });
await writeFile(path.join(dataDir, "word-ladder.json"), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(
  `Generated word-ladder.json with ${sessions.length} sessions (${sessions.length * ROUNDS_PER_SESSION} rounds) ` +
    `from ${puzzles.length} verified puzzles (${handPickedCount} hand-picked with Bible flavor text, ${puzzles.length - handPickedCount} auto-generated).`
);
