import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildGenericWordLadderStudyNote } from "./structured-study-notes.mjs";

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
  {
    start: "ark",
    end: "sea",
    startFlavor: "What Noah built to survive the flood.",
    endFlavor: "Where the Israelites crossed on dry ground.",
    scriptureReference: "Genesis 6:14; Exodus 14:21-22",
    teachingNote: "Genesis 6:14 records God telling Noah to make an ark, and Exodus 14 says Israel crossed the sea on dry ground after the waters divided."
  },
  {
    start: "sin",
    end: "sad",
    startFlavor: "What separates humanity from God.",
    endFlavor: "How the wages of sin leave a life.",
    scriptureReference: "Romans 6:23",
    teachingNote: "Romans 6:23 explains why sin is serious: its wages are death, while God's gift is eternal life through Christ."
  },
  {
    start: "cat",
    end: "dog",
    startFlavor: "One of the animals Noah gathered two by two.",
    endFlavor: "Another animal Noah gathered two by two.",
    scriptureReference: "Genesis 7:8-9",
    teachingNote: "Genesis 7:8-9 says animals entered the ark by pairs; this ladder uses familiar animals as a wordplay reminder of that detail."
  },
  {
    start: "hot",
    end: "old",
    startFlavor: "Neither cold nor this, as Revelation warns.",
    endFlavor: "What the covenant given at Sinai came to be called.",
    scriptureReference: "Revelation 3:15-16; Hebrews 8:13",
    teachingNote: "Revelation rebukes lukewarm faith as neither cold nor hot, while Hebrews contrasts the old covenant with the new."
  },
  {
    start: "law",
    end: "sin",
    startFlavor: "What Moses received on Mount Sinai.",
    endFlavor: "What the law reveals in every heart.",
    scriptureReference: "Exodus 20:1-17; Romans 7:7",
    teachingNote: "Exodus 20 gives the commandments, and Romans 7:7 says the law exposes sin by showing what God forbids."
  },
  {
    start: "king",
    end: "ruler",
    startFlavor: "What Saul, David, and Solomon each became.",
    endFlavor: "Another word for one who reigns.",
    scriptureReference: "1 Samuel 10:1; 2 Samuel 5:3; 1 Kings 1:39",
    teachingNote: "Saul, David, and Solomon were each anointed as king, marking them as rulers over Israel in sequence."
  },
  {
    start: "hope",
    end: "love",
    startFlavor: "One of the three things that abide, per 1 Corinthians 13.",
    endFlavor: "The greatest of the three that abide.",
    scriptureReference: "1 Corinthians 13:13",
    teachingNote: "1 Corinthians 13:13 names faith, hope, and love as abiding virtues, then says love is the greatest."
  },
  {
    start: "rock",
    end: "sand",
    startFlavor: "What the wise man built his house upon.",
    endFlavor: "What the foolish man built his house upon.",
    scriptureReference: "Matthew 7:24-27",
    teachingNote: "Jesus contrasts the wise builder on rock with the foolish builder on sand to picture hearing and doing His words."
  },
  {
    start: "cold",
    end: "warm",
    startFlavor: "Neither this nor hot, as Revelation warns.",
    endFlavor: "A comfort promised to those who trust God.",
    scriptureReference: "Revelation 3:15-16; James 2:16",
    teachingNote: "Revelation uses cold and hot to expose lukewarm faith; the word warm is only a loose comfort image, not the main biblical point."
  },
  {
    start: "wise",
    end: "kind",
    startFlavor: "What Solomon asked God to make him.",
    endFlavor: "A fruit of the Spirit, per Galatians 5.",
    scriptureReference: "1 Kings 3:9-12; Galatians 5:22",
    teachingNote: "Solomon asked for an understanding heart, and Galatians 5:22 lists kindness among the Spirit's fruit."
  },
  {
    start: "dark",
    end: "light",
    startFlavor: "What covered the deep before Creation.",
    endFlavor: "What God called forth on the first day.",
    scriptureReference: "Genesis 1:2-4",
    teachingNote: "Genesis 1 moves from darkness over the deep to God's command, 'Let there be light,' on the first day."
  },
  {
    start: "weak",
    end: "strong",
    startFlavor: "What Paul said he was, so Christ's power could rest on him.",
    endFlavor: "What the Lord told Joshua and Israel to be.",
    scriptureReference: "2 Corinthians 12:9-10; Joshua 1:9",
    teachingNote: "Paul says Christ's strength is made perfect in weakness, while Joshua is commanded to be strong and courageous."
  },
  {
    start: "poor",
    end: "rich",
    startFlavor: "Who Jesus said would inherit the kingdom in spirit.",
    endFlavor: "What the young ruler was, and could not give up.",
    scriptureReference: "Matthew 5:3; Luke 18:22-23",
    teachingNote: "Jesus blesses the poor in spirit, but the rich ruler became sorrowful when asked to give up his possessions."
  },
  {
    start: "lost",
    end: "found",
    startFlavor: "What the prodigal son once was to his father.",
    endFlavor: "What the prodigal son became upon his return.",
    scriptureReference: "Luke 15:24",
    teachingNote: "In the prodigal son parable, the father says his son was dead and alive again, lost and found."
  },
  {
    start: "fear",
    end: "faith",
    startFlavor: "What perfect love casts out.",
    endFlavor: "What is the substance of things hoped for.",
    scriptureReference: "1 John 4:18; Hebrews 11:1",
    teachingNote: "1 John says perfect love casts out fear, and Hebrews defines faith as the substance of things hoped for."
  },
  {
    start: "give",
    end: "take",
    startFlavor: "What Jesus said is more blessed than receiving.",
    endFlavor: "What the thief on the cross had done in his life.",
    scriptureReference: "Acts 20:35; Luke 23:41-43",
    teachingNote: "Acts preserves Jesus's saying that giving is more blessed, while the repentant criminal admits he deserved his punishment."
  },
  {
    start: "peace",
    end: "grace",
    startFlavor: "What Jesus left with His disciples.",
    endFlavor: "What we are saved through, by faith.",
    scriptureReference: "John 14:27; Ephesians 2:8",
    teachingNote: "Jesus promises peace to His disciples, and Ephesians says salvation is by grace through faith."
  },
  {
    start: "least",
    end: "first",
    startFlavor: "What the servant of all is called in the kingdom.",
    endFlavor: "What the last shall become.",
    scriptureReference: "Mark 9:35; Matthew 20:16",
    teachingNote: "Jesus teaches that the one who would be first must become last and servant of all."
  },
  {
    start: "night",
    end: "light",
    startFlavor: "When Nicodemus first came to Jesus.",
    endFlavor: "What Jesus called Himself, for the world.",
    scriptureReference: "John 3:2; John 8:12",
    teachingNote: "Nicodemus came to Jesus by night, and Jesus later declared Himself the light of the world."
  },
  {
    start: "small",
    end: "great",
    startFlavor: "The size of the mustard seed in Jesus's parable.",
    endFlavor: "What the mustard seed becomes when it is grown.",
    scriptureReference: "Matthew 13:31-32",
    teachingNote: "Jesus compares the kingdom to a small mustard seed that grows into something great enough for birds to lodge in its branches."
  }
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
    difficulty: minSteps <= 3 ? "easy" : minSteps <= 5 ? "medium" : "hard",
    scriptureReference: pair.scriptureReference,
    teachingNote: pair.teachingNote
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
  ...(puzzle.scriptureReference ? { scriptureReference: puzzle.scriptureReference } : {}),
  teachingNote: puzzle.teachingNote ?? buildGenericWordLadderStudyNote(puzzle).teachingNote
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
