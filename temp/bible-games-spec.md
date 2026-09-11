# Bible Learning App — New Game Specs for Claude Code

> **Note on scope:** The original list included both "Bible Word Ladder" and "Word Ladder" — these are the same mechanic, so this spec covers **one** Word Ladder game (with Bible-themed flavor text on the bookend words). That gives you 5 games total: Word Ladder, Relay Verse Build, First Letter Recall, Verse Typing Race, Two Truths and a Lie.

## How to use this document
Paste this whole file to Claude Code as the spec. Each game section is self-contained: purpose, data schema, gameplay/state flow, and either full seed data or (where hand-authoring isn't the right approach — see Word Ladder) a data-generation strategy. Wire each into your existing hooks for stats/scoring/data format/look-and-feel — placeholders below show where those should plug in; replace with your actual hook names/imports.

```ts
// Placeholder imports — replace with your actual paths
import { useGameStats } from "@/hooks/useGameStats";
import { useScoring } from "@/hooks/useScoring";
import { GameShell, GameHeader, GameControls } from "@/components/shared";
import type { GameSessionMode } from "@/types/game"; // "solo" | "turns" | "teams"
```

All five games should:
- Accept `mode: GameSessionMode` and a `players: Player[]` array (already defined in your app).
- Pull from a shuffled, non-repeating queue of the data pool below; when the pool is exhausted, reshuffle before repeating (so a single 25–100 round session never repeats an item, and repeats only become possible after a full pass).
- Report round results through your existing scoring hook, not local state.
- Use your standard look-and-feel wrapper (`GameShell`/`GameHeader`/`GameControls`) rather than custom chrome.

---

## 1. Word Ladder

**Concept:** Player is shown a start word and end word (same length). They must transform one into the other by changing one letter per step, with every intermediate step a valid word. Bible framing is in the flavor text ("Sin → Sad", "Rock → Sand", etc.), not in the letters themselves — proper nouns don't ladder well, so don't force it.

### Data schema
```ts
interface WordLadderPuzzle {
  id: string;
  startWord: string;
  endWord: string;
  wordLength: number;
  minSteps: number;           // steps in the shortest known solution
  solutionChain: string[];    // one valid shortest path, start..end inclusive
  flavorText: string;         // Bible-themed framing shown to the player
  difficulty: "easy" | "medium" | "hard";
}
```

### Gameplay
- Show `startWord` and `endWord`. Player types each intermediate word one at a time.
- Validate each entry: (a) same length, (b) differs from previous word by exactly one letter, (c) is a real word (check against a dictionary word list, not just against `solutionChain` — players may find a different valid, possibly longer, path).
- Win when player reaches `endWord`. Score based on steps taken vs. `minSteps` (fewer/equal = bonus).
- Team/turn mode: rotate who submits the next word in the chain; wrong guess passes turn without penalty-loss of progress (configurable).

### ⚠️ On data volume for this game specifically
Word ladders are the one game type here where I'd steer you away from a large hand-typed data set — verifying "each step changes exactly one letter and is a real English word" by hand doesn't scale reliably to 100 items without transcription errors, and a broken ladder is a hard bug for a player to hit mid-game. The correct approach is to **generate these programmatically**:

1. Take a common English word list filtered by length (e.g. the `word-list` or `an-array-of-english-words` npm package, or `/usr/share/dict/words`).
2. For a chosen word length (start with 3–4 letters), build a graph where two words are connected if they differ by exactly one letter in the same position.
3. Run BFS between random word pairs to get `minSteps` and `solutionChain`; keep only pairs with `minSteps` between 2 and 6 (too short is trivial, too long is frustrating).
4. Generate as many as you want (100+ is trivial this way) and hand-pick `flavorText` afterward for the ones you like, or auto-assign generic flavor text ("Ladder #1", theme tags by difficulty tier).

Below are **6 fully hand-verified seed puzzles** (already checked letter-by-letter) to unblock development immediately and to unit-test your BFS generator against:

```json
[
  {
    "id": "wl-001",
    "startWord": "CAT",
    "endWord": "DOG",
    "wordLength": 3,
    "minSteps": 3,
    "solutionChain": ["CAT", "COT", "COG", "DOG"],
    "flavorText": "From the animals Noah gathered two by two...",
    "difficulty": "easy"
  },
  {
    "id": "wl-002",
    "startWord": "SIN",
    "endWord": "SAD",
    "wordLength": 3,
    "minSteps": 3,
    "solutionChain": ["SIN", "SIT", "SAT", "SAD"],
    "flavorText": "The wages of sin...",
    "difficulty": "easy"
  },
  {
    "id": "wl-003",
    "startWord": "HEAD",
    "endWord": "TAIL",
    "wordLength": 4,
    "minSteps": 5,
    "solutionChain": ["HEAD", "HEAL", "TEAL", "TELL", "TALL", "TAIL"],
    "flavorText": "The LORD shall make thee the head, and not the tail (Deut. 28:13).",
    "difficulty": "medium"
  },
  {
    "id": "wl-004",
    "startWord": "COLD",
    "endWord": "WARM",
    "wordLength": 4,
    "minSteps": 4,
    "solutionChain": ["COLD", "CORD", "CARD", "WARD", "WARM"],
    "flavorText": "Neither cold nor hot... (Rev. 3:16)",
    "difficulty": "medium"
  },
  {
    "id": "wl-005",
    "startWord": "ROCK",
    "endWord": "SAND",
    "wordLength": 4,
    "minSteps": 4,
    "solutionChain": ["ROCK", "SOCK", "SACK", "SANK", "SAND"],
    "flavorText": "The wise man built his house upon the rock; the foolish man upon the sand.",
    "difficulty": "medium"
  },
  {
    "id": "wl-006",
    "startWord": "LOVE",
    "endWord": "HATE",
    "wordLength": 4,
    "minSteps": 7,
    "solutionChain": ["LOVE", "LOSE", "ROSE", "ROPE", "RIPE", "RITE", "RATE", "HATE"],
    "flavorText": "Perfect love casteth out fear... choose love over hate.",
    "difficulty": "hard"
  }
]
```

---

## 2. Shared Verse Bank (used by Relay Verse Build, First Letter Recall, and Verse Typing Race)

**Translation:** Use the **King James Version (KJV)** — it's public domain, which sidesteps the licensing restrictions on modern translations (NIV, ESV, NLT, etc. are copyrighted and licensing their text for an app has real restrictions). All data below is KJV.

> ⚠️ **Accuracy note:** The 20 verses below are transcribed from memory and are very well-known/commonly quoted, but for a scripture-memorization app, exact wording matters. Before shipping, run each one against a clean public-domain KJV source file (there are several complete KJV JSON/text datasets on GitHub) to confirm punctuation and wording exactly, and use that same source to generate the remaining verses up to your 100-item target — that's also the fastest path to volume, rather than hand-typing further verses.

### Data schema
```ts
interface VerseEntry {
  id: string;
  reference: string;      // e.g. "John 3:16"
  text: string;           // full KJV text
  wordCount: number;
  difficulty: "easy" | "medium" | "hard"; // by length/familiarity
}
```

### Seed data (20 verses)
```json
[
  { "id": "v-001", "reference": "Genesis 1:1", "text": "In the beginning God created the heaven and the earth.", "wordCount": 10, "difficulty": "easy" },
  { "id": "v-002", "reference": "Psalm 23:1", "text": "The LORD is my shepherd; I shall not want.", "wordCount": 8, "difficulty": "easy" },
  { "id": "v-003", "reference": "Psalm 100:1", "text": "Make a joyful noise unto the LORD, all ye lands.", "wordCount": 9, "difficulty": "easy" },
  { "id": "v-004", "reference": "Proverbs 3:5", "text": "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", "wordCount": 14, "difficulty": "medium" },
  { "id": "v-005", "reference": "Philippians 4:13", "text": "I can do all things through Christ which strengtheneth me.", "wordCount": 10, "difficulty": "easy" },
  { "id": "v-006", "reference": "John 3:16", "text": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", "wordCount": 25, "difficulty": "hard" },
  { "id": "v-007", "reference": "Romans 8:28", "text": "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", "wordCount": 23, "difficulty": "hard" },
  { "id": "v-008", "reference": "Romans 3:23", "text": "For all have sinned, and come short of the glory of God.", "wordCount": 11, "difficulty": "easy" },
  { "id": "v-009", "reference": "Romans 6:23", "text": "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.", "wordCount": 18, "difficulty": "medium" },
  { "id": "v-010", "reference": "Joshua 1:9", "text": "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", "wordCount": 27, "difficulty": "hard" },
  { "id": "v-011", "reference": "Jeremiah 29:11", "text": "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", "wordCount": 24, "difficulty": "hard" },
  { "id": "v-012", "reference": "Matthew 6:33", "text": "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", "wordCount": 19, "difficulty": "medium" },
  { "id": "v-013", "reference": "Isaiah 41:10", "text": "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", "wordCount": 32, "difficulty": "hard" },
  { "id": "v-014", "reference": "Psalm 46:1", "text": "God is our refuge and strength, a very present help in trouble.", "wordCount": 11, "difficulty": "easy" },
  { "id": "v-015", "reference": "Psalm 119:105", "text": "Thy word is a lamp unto my feet, and a light unto my path.", "wordCount": 13, "difficulty": "medium" },
  { "id": "v-016", "reference": "1 Corinthians 13:4", "text": "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.", "wordCount": 15, "difficulty": "medium" },
  { "id": "v-017", "reference": "Galatians 5:22-23", "text": "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.", "wordCount": 19, "difficulty": "hard" },
  { "id": "v-018", "reference": "Ephesians 2:8", "text": "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.", "wordCount": 18, "difficulty": "medium" },
  { "id": "v-019", "reference": "Matthew 28:19", "text": "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.", "wordCount": 21, "difficulty": "medium" },
  { "id": "v-020", "reference": "John 14:6", "text": "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.", "wordCount": 21, "difficulty": "medium" }
]
```

---

## 3. Relay Verse Build

**Concept:** Team-relay mode built for your "teams" `GameSessionMode`. Verse text is hidden; players take turns typing exactly one word at a time in order, passing the turn to the next teammate after each word (or after each correct word — configurable). Team completes the verse together.

### Gameplay
- Draw a `VerseEntry` from the Shared Verse Bank not yet used this session.
- Show reference only (or reference + first word as a starting hint, configurable per difficulty).
- Split `text` into a word queue (strip trailing punctuation for matching, keep it for display).
- Active player types the next word; case-insensitive match, punctuation-tolerant. Correct → word is revealed and turn passes to next teammate; incorrect → configurable (skip turn / one retry / team can "help").
- On completion, show full verse; score = based on wrong attempts and time.
- Solo mode: same flow, just no turn-passing (good for practice).

---

## 4. First Letter Recall

**Concept:** Verse is shown only as its first letters (a classic memorization technique) — player must produce (type) the full verse from that scaffold.

### Gameplay
- Draw a `VerseEntry`. Generate the prompt by taking the first letter of each word (preserving punctuation placement optionally): e.g. `John 3:16` → `F G s l t w, t h g h o b S, t w b i h s n p, b h e l.`
- Show reference + the letter-prompt string.
- Player types the full verse in an input; validate by normalizing (lowercase, strip extra whitespace/punctuation) and comparing word-for-word against `text`.
- Partial credit: score per correctly-placed word, not just all-or-nothing, so near-misses aren't devastating for younger family members.
- Turn/team mode: each player attempts a different verse per round, or a team collaborates on one attempt (configurable).

---

## 5. Verse Typing Race

**Concept:** Straightforward typing-speed drill — good solo practice tool, also works head-to-head.

### Gameplay
- Draw a `VerseEntry`. Show reference, then reveal `text` and start a timer as soon as the player begins typing into the input.
- Live-render the verse with per-character correct/incorrect styling as they type (standard typing-test UX).
- On completion (or time limit), compute WPM = (correct characters / 5) / (elapsed minutes), and accuracy = correct chars / total chars typed.
- Multiplayer/turns: each player races the *same* verse for a fair comparison, then rotate to a new verse next round; teams: aggregate average WPM/accuracy across teammates, or relay-type (each teammate types a portion).
- Feed WPM + accuracy into your scoring hook as the round's scoring inputs.

---

## 6. Two Truths and a Lie

**Concept:** Three statements about a Bible figure/event are shown; players identify the false one.

### Data schema
```ts
interface TwoTruthsSet {
  id: string;
  subject: string;          // e.g. "Noah", "The Feeding of the 5,000"
  statements: [string, string, string];
  lieIndex: 0 | 1 | 2;
  explanation: string;      // shown after the guess, brief
  difficulty: "easy" | "medium" | "hard";
}
```

### Gameplay
- Show `subject` + the three `statements` (order can be shuffled at render time — just track which shuffled position maps back to `lieIndex`).
- Player(s) pick one; reveal correctness + `explanation`.
- Teams: each team locks in an answer before reveal (avoid one team overhearing another's guess — stagger or use a "lock in" UI state per your existing pattern).

### Seed data (25 sets)
```json
[
  {
    "id": "ttl-001", "subject": "Noah", "difficulty": "easy",
    "statements": ["Noah built the ark according to God's instructions.", "The ark had four stories/decks.", "The ark had three stories/decks."],
    "lieIndex": 1,
    "explanation": "Genesis 6:16 describes the ark with lower, second, and third stories — three levels, not four."
  },
  {
    "id": "ttl-002", "subject": "Moses", "difficulty": "easy",
    "statements": ["Moses was found as a baby in a basket among the reeds.", "Moses parted the Jordan River to lead Israel out of Egypt.", "Moses led the Israelites out of Egypt through the Red Sea."],
    "lieIndex": 1,
    "explanation": "Moses parted the Red Sea (Exodus 14), not the Jordan — Joshua later led Israel across the Jordan."
  },
  {
    "id": "ttl-003", "subject": "David and Goliath", "difficulty": "easy",
    "statements": ["David defeated Goliath with a sling and a stone.", "Goliath was a Philistine giant.", "David used King Saul's armor and sword to fight Goliath."],
    "lieIndex": 2,
    "explanation": "David actually refused Saul's armor because it didn't fit and he wasn't used to it (1 Samuel 17:39)."
  },
  {
    "id": "ttl-004", "subject": "Samson", "difficulty": "medium",
    "statements": ["Samson's strength was tied to his uncut hair.", "Delilah cut Samson's hair to weaken him.", "Samson was one of the twelve original apostles."],
    "lieIndex": 2,
    "explanation": "Samson was a judge of Israel, long before the New Testament apostles — not one of the twelve."
  },
  {
    "id": "ttl-005", "subject": "Daniel", "difficulty": "easy",
    "statements": ["Daniel was thrown into a lions' den for praying.", "Daniel interpreted the king's dreams.", "Daniel was killed by the lions."],
    "lieIndex": 2,
    "explanation": "God shut the lions' mouths and Daniel was unharmed (Daniel 6:22)."
  },
  {
    "id": "ttl-006", "subject": "Jonah", "difficulty": "easy",
    "statements": ["Jonah was swallowed by a great fish.", "Jonah was sent to preach to Nineveh.", "Jonah eagerly obeyed God's call from the start."],
    "lieIndex": 2,
    "explanation": "Jonah initially fled from God's call and boarded a ship to Tarshish instead (Jonah 1:3)."
  },
  {
    "id": "ttl-007", "subject": "Esther", "difficulty": "medium",
    "statements": ["Esther became queen of Persia.", "Esther risked her life to save the Jewish people.", "Esther's story is set during the Babylonian exile under Nebuchadnezzar."],
    "lieIndex": 2,
    "explanation": "Esther's story takes place in Persia under King Ahasuerus (Xerxes), not Babylon under Nebuchadnezzar."
  },
  {
    "id": "ttl-008", "subject": "Ruth", "difficulty": "medium",
    "statements": ["Ruth was a Moabite who stayed loyal to her mother-in-law Naomi.", "Ruth gleaned grain in the fields of Boaz.", "Ruth was the mother of King David."],
    "lieIndex": 2,
    "explanation": "Ruth was David's great-grandmother — her son Obed was the father of Jesse, who was David's father."
  },
  {
    "id": "ttl-009", "subject": "Joseph (son of Jacob)", "difficulty": "easy",
    "statements": ["Joseph's brothers sold him into slavery.", "Joseph became a powerful official in Egypt.", "Joseph was the firstborn son of Jacob."],
    "lieIndex": 2,
    "explanation": "Reuben was Jacob's firstborn; Joseph was the eleventh of twelve sons (and Jacob's favorite)."
  },
  {
    "id": "ttl-010", "subject": "Abraham", "difficulty": "medium",
    "statements": ["God changed Abram's name to Abraham.", "Abraham was asked to sacrifice his son Isaac.", "Abraham was the father of the twelve tribes of Israel."],
    "lieIndex": 2,
    "explanation": "That was Abraham's grandson Jacob, whose twelve sons became the twelve tribes."
  },
  {
    "id": "ttl-011", "subject": "Jacob", "difficulty": "medium",
    "statements": ["Jacob wrestled with an angel/God and was renamed Israel.", "Jacob had twelve sons.", "Jacob was Isaac's younger brother."],
    "lieIndex": 2,
    "explanation": "Jacob was Isaac's son (Isaac's twin sons were Jacob and Esau)."
  },
  {
    "id": "ttl-012", "subject": "Elijah", "difficulty": "medium",
    "statements": ["Elijah defeated the prophets of Baal on Mount Carmel.", "Elijah was taken up to heaven in a whirlwind/chariot of fire.", "Elijah never experienced discouragement or fear."],
    "lieIndex": 2,
    "explanation": "Elijah fled in fear from Jezebel and even asked God to let him die (1 Kings 19)."
  },
  {
    "id": "ttl-013", "subject": "Solomon", "difficulty": "easy",
    "statements": ["Solomon asked God for wisdom.", "Solomon built the first temple in Jerusalem.", "Solomon was the first king of Israel."],
    "lieIndex": 2,
    "explanation": "Saul was Israel's first king; Solomon was the third, after Saul and his father David."
  },
  {
    "id": "ttl-014", "subject": "Job", "difficulty": "medium",
    "statements": ["Job lost his wealth, health, and children in a series of trials.", "Job cursed God and rejected his faith by the end of the story.", "In the end, God restored Job's fortunes."],
    "lieIndex": 1,
    "explanation": "Job never cursed God — he struggled and questioned, but remained faithful (Job 1:22)."
  },
  {
    "id": "ttl-015", "subject": "Paul (the Apostle)", "difficulty": "medium",
    "statements": ["Paul was blinded on the road to Damascus.", "Paul was originally named Saul and persecuted Christians.", "Paul was one of Jesus's twelve original disciples during His earthly ministry."],
    "lieIndex": 2,
    "explanation": "Paul (Saul) wasn't among the original twelve — he encountered the risen Jesus later and became an apostle afterward."
  },
  {
    "id": "ttl-016", "subject": "Peter", "difficulty": "easy",
    "statements": ["Peter denied knowing Jesus three times.", "Peter walked on water toward Jesus, briefly.", "Peter was the brother of the apostle John."],
    "lieIndex": 2,
    "explanation": "Peter's brother was Andrew; James and John were a separate pair of brothers among the apostles."
  },
  {
    "id": "ttl-017", "subject": "John the Baptist", "difficulty": "medium",
    "statements": ["John the Baptist baptized Jesus in the Jordan River.", "John the Baptist ate locusts and wild honey.", "John the Baptist was Jesus's biological brother."],
    "lieIndex": 2,
    "explanation": "John was Jesus's relative through Elizabeth and Mary (often described as cousins), not a brother."
  },
  {
    "id": "ttl-018", "subject": "Mary, mother of Jesus", "difficulty": "easy",
    "statements": ["The angel Gabriel appeared to Mary to announce her pregnancy.", "Mary traveled to Bethlehem with Joseph before Jesus was born.", "Mary was present when Jesus performed His first miracle at a wedding in Nazareth."],
    "lieIndex": 2,
    "explanation": "The wedding at Cana (John 2) took place in Cana, not Nazareth."
  },
  {
    "id": "ttl-019", "subject": "Feeding of the 5,000", "difficulty": "medium",
    "statements": ["Jesus fed the crowd using five loaves and two fish.", "Twelve baskets of leftovers were gathered afterward.", "The miracle took place in Jerusalem's temple courts."],
    "lieIndex": 2,
    "explanation": "The feeding of the 5,000 happened in a remote, rural location near the Sea of Galilee, not Jerusalem."
  },
  {
    "id": "ttl-020", "subject": "Adam and Eve", "difficulty": "easy",
    "statements": ["Adam and Eve were placed in the Garden of Eden.", "Eve was created from one of Adam's ribs.", "Adam and Eve had only one son, Cain."],
    "lieIndex": 2,
    "explanation": "Adam and Eve had multiple sons named in Scripture, including Cain, Abel, and Seth."
  },
  {
    "id": "ttl-021", "subject": "Cain and Abel", "difficulty": "easy",
    "statements": ["Cain and Abel were the sons of Adam and Eve.", "Cain killed his brother Abel out of jealousy.", "Abel was a farmer and Cain was a shepherd."],
    "lieIndex": 2,
    "explanation": "It was the reverse: Cain worked the soil (farmer) and Abel kept flocks (shepherd), per Genesis 4:2."
  },
  {
    "id": "ttl-022", "subject": "Joshua and Jericho", "difficulty": "medium",
    "statements": ["The walls of Jericho fell after the Israelites marched around the city.", "The Israelites marched around Jericho for seven days.", "Joshua personally knocked down the walls with a battering ram."],
    "lieIndex": 2,
    "explanation": "The walls fell miraculously after trumpets sounded and the people shouted — no battering ram involved (Joshua 6)."
  },
  {
    "id": "ttl-023", "subject": "Gideon", "difficulty": "hard",
    "statements": ["Gideon used a fleece of wool to test/confirm God's will.", "Gideon defeated a massive Midianite army with only 300 men.", "Gideon started out as a confident, fearless military leader."],
    "lieIndex": 2,
    "explanation": "Gideon was hiding and threshing wheat in a winepress out of fear when God's angel first called him (Judges 6:11)."
  },
  {
    "id": "ttl-024", "subject": "Deborah", "difficulty": "hard",
    "statements": ["Deborah was a judge and prophetess who led Israel.", "Deborah helped lead Israel to victory over a Canaanite army.", "Deborah was a queen who ruled from a royal palace."],
    "lieIndex": 2,
    "explanation": "Deborah held court under a palm tree as a judge and prophetess (Judges 4:5) — she wasn't a queen with a palace."
  },
  {
    "id": "ttl-025", "subject": "Lazarus", "difficulty": "easy",
    "statements": ["Jesus raised Lazarus from the dead after he had been in the tomb four days.", "Lazarus was the brother of Mary and Martha.", "Lazarus doubted Jesus and refused to come out of the tomb."],
    "lieIndex": 2,
    "explanation": "Lazarus came out when Jesus called him — there's no account of doubt or refusal (John 11:43-44)."
  }
]
```

---

## Implementation checklist for Claude Code
- [ ] Wire all five games into `GameShell` + existing stats/scoring hooks (don't roll new UI chrome).
- [ ] Build a shared `useNonRepeatingQueue(pool, sessionKey)` hook if one doesn't exist yet — every game here needs "shuffle, don't repeat until exhausted."
- [ ] Word Ladder: implement the BFS generator per the strategy above; validate the 6 seed puzzles as unit tests for the generator/validator logic.
- [ ] Verse-based games: swap the 20 seed verses for a verified full KJV dataset before shipping; target 40–100 verses across difficulty tiers.
- [ ] Two Truths and a Lie: 25 sets provided is enough for a 25-round session with zero repeats; add more subjects following the same schema if you want deeper pools.
- [ ] Respect `GameSessionMode` (`solo` / `turns` / `teams`) branching described in each game's Gameplay section.
