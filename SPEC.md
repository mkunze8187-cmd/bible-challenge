# Bible Challenge Specification

## 1. Scope

This repository defines content and rules for the hosted party games shipped in the desktop app. Three original board/turn games have a full functional specification in this document:

1. `Five Clues`
2. `Bible Initials`
3. `Verse Reveal`

The app has since grown to 28 games total. The other 25 are specified at reference depth only, in [Section 9](#9-additional-games-reference), rather than with full state-machine and tie-breaker detail — see that section for why, and for where their authoritative behavior actually lives (`GAME_LIBRARY` and the round-creation/action functions in `src/lib/gameEngine.ts`).

The repository is intentionally content-driven. New sessions should be added by extending JSON files under `src/data/` without changing TypeScript.

Each game ships with starter content grouped into authoring sessions. Those sessions are content organization only; runtime play is not locked to them. The desktop app composes random games from the full pool:

- `Five Clues` builds a twenty-five-card random board from the full card pool.
- `Bible Initials` builds a shuffled twenty-five-card random board from the full card pool.
- `Verse Reveal` builds a five-round random deck from the full scripture pool.

## 2. Repository Contract

### File layout

- `SPEC.md`
- `src/data/five-guesses.json`
- `src/data/initials.json`
- `src/data/scripture-puzzles.json`
- `src/data/schemas/five-guesses.schema.json`
- `src/data/schemas/initials.schema.json`
- `src/data/schemas/scripture-puzzles.schema.json`
- `src/types/gameData.ts`
- `src/lib/scoring.ts`

### Shared content rules

- Each pack contains `game`, `version`, `displayName`, `roundsPerSession`, and `sessions`.
- Starter packs in this repo may contain any number of authoring sessions.
- Every session has `id`, `title`, `theme`, and `rounds`.
- Every session has one or more rounds.
- Every round id is unique within its file.
- Answers and aliases are case-insensitive at runtime after normalization.

### Runtime normalization

User-entered guesses should be normalized before comparison:

1. Trim leading and trailing whitespace.
2. Convert to lowercase.
3. Collapse punctuation and repeated whitespace to single spaces.
4. Compare normalized guess to normalized canonical answer and normalized aliases.

Example:

- `road-to-damascus`
- `Road to Damascus`
- `road   to damascus`

All normalize to the same answer.

## 3. Five Clues

### Functional requirements

- The desktop app presents a twenty-five-card board.
- Board positions are random and are not locked to authoring sessions.
- One participant owns the initial turn for the selected card.
- The active participant chooses which available card to open.
- Clue 1 appears immediately when the card is opened.
- After each incorrect primary guess, the app automatically reveals the next clue.
- The same primary participant continues guessing through all five clues.
- If the primary participant fails after clue 5, the remaining participants each get one steal attempt in turn order.
- A correct answer ends the card immediately.
- If all steal attempts fail, the card closes unsolved.
- A full desktop `Five Clues` board is twenty-five cards.

### Round state transitions

`board_ready -> card_selected -> clue_1_open -> clue_2_open -> clue_3_open -> clue_4_open -> clue_5_open -> steal_queue_open -> card_resolved`

`clue_n_open -> card_solved -> card_resolved`

`steal_queue_open -> steal_solved -> card_resolved`

Rules:

- Only one card can be active at a time.
- Only one clue stage is active at a time.
- The primary participant keeps control until solving or exhausting clue 5.
- Steal attempts happen only after the primary participant fails on clue 5.
- Turn order for the next primary card advances from the original primary participant, not from the stealing participant.

### Scoring

- Solve after clue 1: `5` points
- Solve after clue 2: `4` points
- Solve after clue 3: `3` points
- Solve after clue 4: `2` points
- Solve after clue 5: `1` point
- Steal solve after the full clue ladder: `1` point
- Unsolved round: `0` points

### Tie-breakers

1. Highest total points
2. Most round wins
3. Most early solves, defined as solves on clue 1 or clue 2
4. Fewest incorrect guesses across the session
5. Host-controlled extra round

### JSON format

Each round contains:

- `id`
- `category`
- `answer`
- `aliases`
- `clues`

Constraints:

- `clues` must contain between five and twenty clue strings.
- Clues should move from least direct to most direct.
- `aliases` must include the canonical answer or an equivalent normalized form.
- Runtime uses five randomly selected clues from each card's clue pool.

## 4. Bible Initials

### Functional requirements

- The desktop app presents a shuffled twenty-five-pick board.
- Board positions are random and are not locked to authoring sessions.
- One participant owns the initial turn for the selected tile.
- The active participant chooses which available card to open.
- A tile begins by showing only the initials.
- If the primary participant misses, the app automatically reveals clue 1 through clue 6 after each miss.
- The same primary participant continues guessing until solving or exhausting all six clues.
- If the primary participant still misses after clue 6, the remaining participants each get one steal attempt in turn order.
- A correct answer ends the tile immediately.
- If all steal attempts fail, the tile closes unsolved.
- A full desktop `Bible Initials` board is twenty-five picks.

### Round state transitions

`board_ready -> tile_selected -> initials_open -> clue_1_open -> clue_2_open -> clue_3_open -> clue_4_open -> clue_5_open -> clue_6_open -> steal_queue_open -> tile_resolved`

`initials_open -> tile_solved -> tile_resolved`

`hint_n_open -> tile_solved -> tile_resolved`

Rules:

- Initials are visible for the entire round.
- Hints accumulate; later hints do not replace earlier ones.
- The app itself controls clue progression and turn advancement.
- Turn order for the next primary tile advances from the original primary participant, not from the stealing participant.

### Scoring

- Solve from initials only: `7` points
- Solve after clue 1: `6` points
- Solve after clue 2: `5` points
- Solve after clue 3: `4` points
- Solve after clue 4: `3` points
- Solve after clue 5: `2` points
- Solve after clue 6: `1` point
- Steal solve after all hints are visible: `1` point
- Unsolved round: `0` points

### Tie-breakers

1. Highest total points
2. Most round wins
3. Most initials-only solves
4. Fewest incorrect guesses across the session
5. Host-controlled extra round

### JSON format

Each round contains:

- `id`
- `category`
- `initials`
- `answer`
- `aliases`
- `hints`

Constraints:

- `hints` must contain between six and twenty clue strings.
- Hints should move from broad to direct.
- `initials` should match the displayed answer words the host expects players to identify.
- Runtime uses six randomly selected clues from each initials card's clue pool.

## 5. Verse Reveal

### Functional requirements

- A round is based on a single Bible verse reference.
- Starter Verse Reveal content in this repository uses `KJV` verse text because it is shippable public-domain text.
- The content model may also represent locally added licensed translations such as `NIV`.
- The puzzle board is generated from the verse text.
- Alphabetic characters start hidden.
- Spaces, punctuation, and verse numbers remain visible.
- On a turn, a player may guess one letter or attempt to solve the full verse.
- The app, not a human host, controls turn order.
- Turns rotate automatically after each letter guess or solve attempt.
- A correct letter guess reveals every currently hidden occurrence of that letter.
- An incorrect letter guess reveals nothing and scores nothing.
- A correct full solve ends the round immediately.
- An incorrect full solve scores nothing; the round continues.
- A full `Verse Reveal` game is five rounds drawn randomly from the full scripture pool.

### Round state transitions

`not_started -> board_initialized -> turn_open -> letter_resolved -> turn_open`

`turn_open -> solve_correct -> round_scored`

`turn_open -> solve_incorrect -> turn_open`

`turn_open -> puzzle_fully_revealed -> round_scored`

Rules:

- `board_initialized` requires a verse text source.
- The board tracks guessed letters so already-revealed letters cannot score again.
- `puzzle_fully_revealed` can occur through accumulated correct letter guesses even if nobody calls a full solve.

### Scoring

Letter guesses:

- A player receives `1` point for each currently hidden letter space revealed by a correct letter guess.
- Re-guessing a letter that is already fully revealed awards `0`.
- Incorrect letter guesses award `0`.

Full solves:

- A player who correctly solves the full scripture receives `10` points plus `1` point for every still-hidden letter space remaining at the time of the solve.
- Formula: `10 + remaining_hidden_letter_spaces`

Game winner:

- A full game is five rounds.
- Highest total score wins.

### Tie-breakers

1. Highest total points
2. Most correct full solves
3. Highest total letter-reveal points
4. Highest total hidden-letter solve bonus captured
5. Host-controlled extra round

### JSON format

Each round contains:

- `id`
- `reference`
- `referenceAliases`
- `sourceTranslation`
- `theme`
- `contextClue`
- `contentMode`
- `placeholderText` or `verseText`
- optional `solutionAliases`

Content modes:

- `placeholder`
  - Used when a verse reference is known but the verse text is intentionally not distributed in shared data.
  - Requires `placeholderText`
  - Must set `verseText` to `null` or omit it
- `public-domain-text`
  - Used for shippable public-domain text such as `KJV`
  - Requires `verseText`
  - Requires `solutionAliases`
- `licensed-text`
  - Used only in local/private content once a restricted translation such as `NIV` is lawfully available
  - Requires `verseText`
  - Requires `solutionAliases`

### Verse masking rules

- Hide only alphabetic characters.
- Preserve spaces and punctuation.
- Preserve apostrophes and commas as visible separators.
- Comparison for solve attempts should normalize casing and repeated whitespace.
- Punctuation may be ignored in answer matching if the host wants forgiving input handling, but the displayed board should preserve punctuation placement.

## 6. Validation Rules

### Structural validation

- Every data file must remain valid JSON.
- Every data file must satisfy its matching schema under `src/data/schemas/`.
- `roundsPerSession` must remain an integer greater than zero.
- Each session in starter content must contain at least one round.
- Required properties may not be omitted.

### Identity validation

- Session ids must be unique within each file.
- Round ids must be unique within each file.
- Canonical answers must be represented in aliases for `Five Clues` and `Bible Initials`.
- Reference aliases must include at least one abbreviated or alternate formatting form for `Verse Reveal`.

### Content validation

- No empty strings in required text fields.
- `Five Clues` rounds must have between five and twenty clues.
- `Bible Initials` rounds must have between six and twenty hints.
- `Verse Reveal` must set `sourceTranslation` to a supported translation value.
- Shared starter data may include public-domain verse text such as `KJV`.
- Shared starter data must not include copyrighted `NIV` verse text unless supplied by the user or licensed for use.

### Local verification workflow

Use:

```powershell
npm run check:data
```

Current validation script checks:

- pack identity
- starter session counts
- round counts
- duplicate ids
- required answer aliases
- required Scripture placeholder constraints

## 7. Manual Content Authoring

## 7A. Player And Team Rotation

- The app supports `individual` mode and `team` mode.
- In `individual` mode, each participant has one member and takes full turns directly.
- In `team` mode, each team may have up to five members.
- Each time a team receives a turn, the active member rotates to the next person on that team.
- In board games, the primary turn for a card or tile is one team turn.
- In board-game steal phases, each steal attempt counts as a team turn for the stealing team.
- In `Verse Reveal`, every letter guess or solve attempt counts as one turn.

### General authoring workflow

1. Pick the target JSON file under `src/data/`.
2. Duplicate an existing session or round object as a template.
3. Assign a new unique `id`.
4. Keep session round count at exactly five.
5. Run `npm run check:data`.

### Writing Five Clues rounds

- Choose answers that are recognizable but not trivial.
- Write five clues in strict order from least direct to most direct.
- Avoid quoting copyrighted Bible translations directly.
- Include common spelling or article variants in `aliases`.
- Keep clues original rather than copy-pasted from study notes or websites.

### Writing Bible Initials rounds

- Prefer answers with clear displayed initials.
- Use three hints that escalate cleanly.
- Include expected alternate forms in `aliases`.
- Avoid obscure abbreviations unless the audience already knows them.

### Writing Verse Reveal rounds

- Use a supported translation marker in `sourceTranslation`.
- For shippable shared data, prefer `KJV` with `contentMode` set to `public-domain-text`.
- Use `contextClue` for original, non-quoted guidance.
- If using a restricted translation locally, keep shared starter data as `placeholder` or move the verse text to a private/local content source.
- Do not commit actual `NIV` verse text to shared starter data without permission.

### Converting a Verse Reveal round from placeholder to local licensed text

1. Change `contentMode` from `placeholder` to `licensed-text`.
2. Replace `placeholderText` with either `null` or remove it.
3. Set `sourceTranslation` to the intended licensed translation, such as `NIV`.
4. Set `verseText` to the licensed verse text.
5. Add `solutionAliases` for acceptable punctuation or spacing variants.
6. Keep `reference` aligned with the selected translation.
7. Re-run validation and any app-specific tests.

### Converting a Verse Reveal round to public-domain shipped text

1. Set `sourceTranslation` to `KJV`.
2. Change `contentMode` to `public-domain-text`.
3. Set `verseText` to the public-domain text.
4. Add `solutionAliases` for acceptable punctuation or spacing variants.
5. Remove or null `placeholderText`.
6. Re-run validation and any app-specific tests.

Example shipped KJV shape:

```json
{
  "id": "sp-s3-r3",
  "reference": "John 3:16",
  "referenceAliases": ["John 3:16", "Jn 3:16"],
  "sourceTranslation": "KJV",
  "theme": "Salvation",
  "contextClue": "A central gospel summary from Jesus' conversation with Nicodemus.",
  "contentMode": "public-domain-text",
  "verseText": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
  "solutionAliases": [
    "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
  ]
}
```

Example local licensed shape:

```json
{
  "id": "sp-s3-r3",
  "reference": "John 3:16",
  "referenceAliases": ["John 3:16", "Jn 3:16"],
  "sourceTranslation": "NIV",
  "theme": "Salvation",
  "contextClue": "A central gospel summary from Jesus' conversation with Nicodemus.",
  "contentMode": "licensed-text",
  "verseText": "[licensed NIV text added locally]",
  "solutionAliases": [
    "[normalized local solution variant 1]",
    "[normalized local solution variant 2]"
  ]
}
```

## 8. TypeScript Expectations

- TypeScript should treat JSON content as the source of truth.
- Adding new sessions should not require changing union types or switch statements.
- Scoring helpers in `src/lib/scoring.ts` should remain pure functions.
- Application code that consumes these files should fail fast on invalid content rather than silently skipping broken rounds.

## 9. Additional Games (Reference)

Sections 3–5 above are full functional specifications written before the app grew past its original three games. They cover round state transitions, scoring formulas, and tie-breakers in detail, and that detail is verified against the runtime.

The 19 games below were added later. This section documents them at reference depth only — display copy, file locations, and JSON round shape — rather than duplicating full state-machine and scoring specs for each one. Two reasons:

- Their real behavior (turn order, scoring, steal/reveal rules) lives in `src/lib/gameEngine.ts`, in the `GAME_LIBRARY` table and each game's `create*Prompt` / `submit*` / `pass*` functions. Restating that logic here in prose would create a second copy that can drift from the code.
- Unlike Sections 3–5, this section is not meant to be an independent authoring contract; treat `gameEngine.ts` and the matching schema under `src/data/schemas/` as authoritative, and this table as a map to find them.

Every game listed here follows the same content rules as Sections 2 and 6: JSON lives under `src/data/<game-id>.json`, its schema lives under `src/data/schemas/<game-id>.schema.json`, sessions/rounds need unique ids, required text fields may not be empty, and `npm run check:data` validates all of it. Each round also carries `difficulty` and `teachingNote` fields not present in the original three games' rounds.

| Game ID | Label | Summary | Rounds per game | Round JSON fields (beyond `id`) |
|---|---|---|---|---|
| `bible-timeline` | Bible Timeline | Arrange Bible events in chronological order before submitting the full timeline. A full correct order scores 10 points. | 5 | `prompt`, `events`, `difficulty`, `teachingNote` |
| `verse-scramble` | Verse Scramble | Rebuild a short KJV verse from scrambled word tiles. | 5 | `reference`, `referenceAliases`, `sourceTranslation`, `theme`, `verseText`, `difficulty`, `teachingNote` |
| `bible-connections` | Bible Connections | Find four connected sets of four Bible terms from a shuffled sixteen-tile board. Each correct group scores 5 points. | 3 | `title`, `groups`, `difficulty`, `teachingNote` |
| `name-that-book` | Name That Book | Guess the Bible book from a five-clue ladder with one-point steal attempts. Earlier clues score more points. | 10 | `book`, `testament`, `category`, `aliases`, `clues`, `difficulty`, `teachingNote` |
| `before-or-after` | Before Or After | Choose which of two Bible events happened first. Each correct answer scores 3 points. | 15 | `leftEvent`, `rightEvent`, `earlierEvent`, `explanation`, `theme`, `difficulty`, `teachingNote` |
| `reference-rush` | Reference Rush | Read a KJV verse and name its scripture reference before the round moves on. A correct reference scores 5 points. | 10 | `reference`, `referenceAliases`, `sourceTranslation`, `theme`, `verseText`, `difficulty`, `teachingNote` |
| `chapter-finder` | Chapter Finder | Identify the Bible book and chapter for a prompt, event, quote, person, or theme. A correct answer scores 5 points. | 10 | `prompt`, `answerBook`, `answerChapter`, `aliases`, `theme`, `clue`, `difficulty`, `teachingNote` |
| `who-said-it` | Who Said It? | Identify the speaker of a recognizable KJV Bible quote or statement. A correct speaker scores 5 points. | 10 | `quote`, `speaker`, `speakerAliases`, `reference`, `context`, `sourceTranslation`, `theme`, `difficulty`, `teachingNote` |
| `bible-books-relay` | Bible Books Relay | Arrange shuffled Bible book tiles into canonical order. A perfect order scores 10 points. | 5 | `title`, `section`, `books`, `difficulty`, `teachingNote` |
| `missing-word` | Missing Word | Fill in one to three missing words from a KJV verse. More missing words score more points. | 10 | `reference`, `sourceTranslation`, `theme`, `verseText`, `missingWords`, `acceptedAnswers`, `difficulty`, `teachingNote` |
| `prophecy-match` | Prophecy Match Challenge | Match Old Testament prophecy cards with New Testament fulfillment cards. | 5 pairs | `title`, `theme`, `prophecyReference`, `prophecySummary`, `prophecyTextShort`, `fulfillmentReference`, `fulfillmentSummary`, `fulfillmentTextShort`, `answerKey`, `difficulty`, `teachingNote` |
| `messiah-prophecy` | Messiah Prophecy Challenge | Identify the messianic fulfillment, event, person, or theme tied to a prophecy. Wrong choices disappear and scoring steps down. | 10 | `title`, `theme`, `prophecyReference`, `prophecyTextShort`, `prompt`, `correctAnswer`, `choices`, `fulfillmentReference`, `fulfillmentSummary`, `difficulty`, `teachingNote` |
| `prophecy-clue-ladder` | Prophecy Clue Ladder | Name the prophecy theme, reference, fulfillment, person, or event from five clues. Each miss or timer expiry reveals the next clue. | 10 | `title`, `theme`, `answer`, `acceptedAnswers`, `reference`, `fulfillmentReference`, `clues`, `difficulty`, `teachingNote` |
| `fulfillment-finder` | Fulfillment Finder Challenge | Choose the Old Testament prophecy connected to a New Testament fulfillment. Wrong prophecy references are disabled. | 10 | `title`, `theme`, `fulfillmentReference`, `fulfillmentSummary`, `fulfillmentText`, `prompt`, `correctProphecyReference`, `correctProphecySummary`, `choices`, `difficulty`, `teachingNote` |
| `prophecy-categories` | Prophecy Categories Challenge | Sort prophecy cards into five reference-based categories. One fifteen-card sorting board per game. | 1 board | `title`, `theme`, `categories`, `cards`, `difficulty`, `teachingNote` |
| `complete-the-verse` | Complete the Verse Challenge | Complete a well-known KJV verse from Psalms or Proverbs from four endings. Wrong endings disappear and scoring steps down. | 10 | `title`, `book`, `reference`, `verseStart`, `correctEnding`, `choices`, `theme`, `difficulty`, `teachingNote` |
| `wisdom-match` | Wisdom Match Challenge | Match a Proverbs excerpt to its wisdom theme. Wrong themes disappear and scoring steps down. | 10 | `title`, `reference`, `verseTextShort`, `correctTheme`, `choices`, `difficulty`, `teachingNote` |
| `psalm-theme` | Psalm Theme Challenge | Identify the major theme of a short Psalm excerpt. Wrong themes disappear and scoring steps down. | 10 | `title`, `reference`, `excerpt`, `correctTheme`, `choices`, `difficulty`, `teachingNote` |
| `proverb-categories` | Proverb Categories Challenge | Sort Proverbs cards into five wisdom categories. One sorting board per game. | 1 board | `title`, `theme`, `categories`, `cards`, `difficulty`, `teachingNote` |
| `psalm-reference-finder` | Psalm Reference Finder | Choose the correct Psalm reference for a familiar KJV phrase. Wrong references disappear and scoring steps down. | 10 | `title`, `excerpt`, `correctReference`, `choices`, `theme`, `difficulty`, `teachingNote` |
| `two-truths-and-a-lie` | Two Truths and a Lie | Spot the false statement among three about a Bible figure or event. Wrong picks disappear and scoring steps down. | 10 | `subject`, `subjectType`, `statements`, `lieIndex`, `explanation`, `reference`, `theme`, `difficulty`, `teachingNote` |
| `relay-verse-build` | Relay Verse Build | Take turns typing one word at a time to rebuild a hidden KJV verse. A miss keeps the same player guessing; Skip Word reveals that word and passes the turn. | 5 | `reference`, `sourceTranslation`, `theme`, `verseText`, `difficulty`, `teachingNote` |
| `verse-typing-race` | Verse Typing Race | Type a short KJV verse as fast and accurately as you can. Score is based on words-per-minute and accuracy. | 5 | `reference`, `sourceTranslation`, `theme`, `verseText`, `difficulty`, `teachingNote` |
| `word-ladder` | Word Ladder | Change one letter at a time to turn the start word into the end word, taking turns submitting the next valid word. Any dictionary-valid path counts, not just one authored solution. | 6 | `startWord`, `endWord`, `wordLength`, `minSteps`, `revealPath`, `startFlavorText`, `endFlavorText`, `theme`, `difficulty`, `teachingNote` |
| `bible-anagrams` | Bible Anagrams | Unscramble letter tiles to name a Bible person, place, thing, or event. Easy/medium rounds show a clue; hard rounds do not. | 10 | `answer`, `category`, `clue`, `theme`, `difficulty`, `teachingNote` |
| `bible-cryptogram` | Bible Cryptogram | Crack a letter-substitution cipher, generated fresh each round, to reveal a Bible name, phrase, or short verse. Guess a letter to reveal every occurrence, or attempt a full solve for a bonus. | 5 | `reference`, `sourceTranslation`, `theme`, `verseText`, `difficulty`, `teachingNote` |

Notes:

- "Rounds per game" reflects the random-selection count the desktop app draws from the full content pool at runtime (see the `*_ROUNDS_PER_GAME` / `*_PER_GAME` constants in `gameEngine.ts`), the same way Section 1 describes for the original three games — it is not a constraint on how many rounds a content file may contain.
- Current starter-session counts vary by file: `prophecy-match`, `messiah-prophecy`, `prophecy-clue-ladder`, and `fulfillment-finder` ship 5 sessions each; `name-that-book` ships 7; `complete-the-verse`, `wisdom-match`, `psalm-theme`, `proverb-categories`, and `psalm-reference-finder` ship 1 each; `two-truths-and-a-lie` ships 8; `bible-anagrams` ships 11; `bible-cryptogram` ships 3; `word-ladder` ships 25; `verse-typing-race` ships 74; `relay-verse-build` ships 119; every other game in this table ships 25. These counts will change as content is authored — treat them as a snapshot, not a constraint.
- Unlike every other verse-text-bearing game, `bible-cryptogram`'s `verseText` content deliberately spans three lengths tied to `difficulty` rather than one fixed shape: short names/titles (as few as two words) for `easy`, short phrases for `medium`, and longer verse-like text (roughly 15-20 words) for `hard`. The substitution cipher mapping itself is never stored in content — it's generated at runtime per prompt (`buildCipherMap`/`createBibleCryptogramPrompt` in `gameEngine.ts`), the same way Bible Anagrams shuffles its tile order and Word Ladder validates against a runtime dictionary rather than authored data.
- Import support for custom content packs (Section "Manual Content Authoring" workflows) currently covers `five-guesses`, `initials`, `scripture-puzzles`, `complete-the-verse`, `wisdom-match`, and `psalm-reference-finder` — see `SUPPORTED_CUSTOM_GAME_IDS` in `src/lib/content.ts`. The remaining games in this table are not yet importable as custom content.

### Word Ladder's dictionary asset

Unlike every other game, `word-ladder` depends on a second, non-round-pack content file: `src/data/word-ladder-dictionary.json` (schema: `src/data/schemas/word-ladder-dictionary.schema.json`) — a flat, curated list of common English words (3-7 letters) used to live-validate player-typed chain steps. It is loaded via a dedicated one-off loader (`loadWordLadderDictionary` in `src/lib/content.ts`), not through the `PACK_LOADER_ENTRIES`/`ContentPackByGame` machinery every other game uses, since it isn't shaped like a `GameId` round pack. `submitWordLadderStep` is also the one action function in `gameEngine.ts` that takes an extra parameter (the loaded dictionary) beyond `(state, ...)`, because the dictionary is too large to embed in `SessionState` (which must stay cloneable via `structuredClone`).

Each `word-ladder` round also carries a `revealPath` field — one valid, BFS-verified shortest path from `startWord` to `endWord`, computed once at content-generation time (`scripts/generate-word-ladder-data.mjs`) and shown once a round ends without being solved (every participant has passed on it, or the round's timer expires). It is never used to validate player guesses; any dictionary-valid one-letter-at-a-time path counts as correct, and a wrong guess never ends a player's turn by itself — see `submitWordLadderStep`/`passWordLadderTurn`/`resolveWordLadderOnTimer` in `gameEngine.ts`.

### Content generation scripts

Starter content for `two-truths-and-a-lie`, `relay-verse-build`, `verse-typing-race`, `word-ladder`, the Word Ladder dictionary, `bible-anagrams`, and `bible-cryptogram` is produced by dedicated Node scripts under `scripts/` (`generate-two-truths-data.mjs`, `generate-relay-verse-build-data.mjs`, `generate-verse-typing-race-data.mjs`, `generate-word-ladder-data.mjs`, `generate-word-ladder-dictionary.mjs`, `generate-bible-anagrams-data.mjs`, `generate-bible-cryptogram-data.mjs`), following the same pattern as `scripts/generate-prophecy-games.mjs`. Notably, the verse-based games draw their verse text from `scripts/shared-verse-pool.mjs`, which harvests already-shipped, already-validated KJV verses out of `scripture-puzzles.json`/`missing-word.json`/`reference-rush.json`/`verse-scramble.json` (deduplicated by reference) rather than re-transcribing verse text — this avoids introducing new transcription-accuracy risk for a scripture app. `bible-cryptogram` is hand-authored rather than pool-sourced, since its content spans short names/phrases as well as verse-length text (see the note above the game table). Re-run the relevant generator script and `npm run check:data` after editing any of these games' source lists.
