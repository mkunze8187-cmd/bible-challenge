# Game Show Expansion Spec

## Contents

1. Overview and Source
2. Reconciliation: What This Spec Changes vs. Existing Specs
3. Controller Interaction Model (extends Phone Mode Stage 3)
4. Shared Game Engines
5. Game Triage: Build / Extend / Defer / Drop
6. Bible Baseball (New Engine)
7. Bible Blockbusters (New Engine)
8. Content Pack Interaction
9. Answer Normalization and Host Override
10. Admin Console Impact
11. Milestones and Issues
12. Open Decisions

---

# 1. Overview and Source

This spec is derived from a product/game-design brainstorming document ("Bible Challenge — Consolidated Game Design & Phone Controller Architecture Handoff") that proposed roughly 60 new game concepts, a generalized "player/team controller" abstraction, and a "~6-8 shared game engine" strategy, plus a revised Bible Baseball design where the defense privately selects pitch difficulty from a limited inventory.

That document was written without access to this repository. It explicitly asked for a repo-inspection pass before anything in it was treated as a build plan. This spec is that pass: it reconciles the source document against the actual codebase and the existing specs in `specs/`, and turns the parts that hold up into scoped, sequenced work.

**What carries over unchanged:** the product framing (2-5 minute games, phone controllers, keep-every-team-engaged principle), the Bible Baseball pitch-inventory redesign, the shared-engine grouping idea, and about a dozen of the ~60 game concepts that don't already exist under another name.

**What does not carry over:** the controller message protocol, session model, buzz fairness rules, privacy projection, and phased delivery plan. All of that already exists, in more implementation-ready detail, in `specs/phone-buzzer-spec.md` and the Host Mode section of `specs/enhancement-spec-tournament-daily-host-map.md`. This spec extends those rather than re-deriving them.

---

# 2. Reconciliation: What This Spec Changes vs. Existing Specs

This section is the direct answer to "identify what conflicts/enhances/overrides current issues." Read this before the milestone/issue list in section 11.

## 2.1 Direct naming/mechanic collisions (source doc vs. shipped game)

| Source doc concept | Shipped game | Collision |
|---|---|---|
| §11 Bible Connections — clue ladder ("ARK / RAINBOW / DOVE / FLOOD → Noah", progressive 400/300/200/100 scoring) | `bible-connections` (`src/data/bible-connections.json`) — a Connections-style **grouping** game: sort items into 4 categories | **Same name, different mechanic.** The source doc's "Connections" is actually a progressive-reveal guessing game. This spec calls it **Clue Ladder** to avoid clashing with the shipped `bible-connections` game, which keeps its name and mechanic unchanged. |
| §54 Dodge the Decoy (five items belong to a category, one doesn't) | `odd-one-out` (`src/data/odd-one-out.json`) | **Same mechanic**, already shipped under a different name and already has a JSON schema and content library. No new engine or game needed — see §5.1. |
| §24 Which One Is True? / §58 Director's Cut (find the false/inaccurate statement) | `two-truths-and-a-lie` (`src/data/two-truths-and-a-lie.json`) | **Overlapping mechanic.** `two-truths-and-a-lie` already presents statements and asks which is false. Director's Cut's specific value-add (a short *narrated account* with one planted error, not three flat statements) is a distinct enough presentation to justify as a variant — see §5.1 — but it should be pitched as a content/presentation variant of the existing game, not a new engine. |
| §14 Bible Timeline ("Which Came First?", "Order These", "Insert Event") | `bible-timeline` (`src/data/bible-timeline.json`) — already an ordering game | **Mostly already covered.** "Order These" is the shipped mechanic. "Which Came First?" (pairwise comparison) and "Insert Event" (place one new event into an existing sequence) are genuinely new sub-modes, not new games — see §5.2. |

## 2.2 Architecture the source document assumed didn't exist, but does

- **The controller/session/protocol layer.** The source doc's section 2 asks for a generic `Game -> RequestBuzz() / RequestTextAnswer() / RequestChoice() / SendPrivateInformation()` abstraction "so the game doesn't need to know whether an answer arrived from a phone or keyboard." `phone-buzzer-spec.md` section 2.1 already implements this shape: main-process buzzer state machine, IPC-mediated `PhonePromptModel`, `toPhoneView()` privacy projection, and a `PhoneInteraction` union (`buzz | text-answer | choice-select | map-select | sequence-control | tile-control`) that is exactly the doc's Buzz/Text/Choice/Number/Private-info taxonomy, minus a distinct "Number" type and a first-class "Private Information" push (see §3).
- **Simultaneous/collect-all answers.** The source doc's section 5 ("Simultaneous Answer Mode") is Stage 3 Step 2 (Collect All) in `phone-buzzer-spec.md` section 5, including per-participant scoring models (`first-correct`, `everyone-scores`, `host-awarded`) that already cover the doc's "correctness / speed / placement bonus" options.
- **Buzzer lockout/re-arm rules.** The source doc's section 4 common buzzer behavior (wrong answer locks out vs. re-arms, penalty vs. no-penalty) is `phone-buzzer-spec.md` section 3 (Reset Rules) plus the Host Mode `BuzzTurnPolicy`. Nothing new to design here.
- **Content pack / game-support matrix.** The source doc's section 65 ("pack.gameSupport") is already live as `GAME_CONTENT_PACKS: Record<GameId, ContentPackId[]>` (`src/renderer/App.tsx`) and is being generalized further in `themed-content-spec.md` section 11 (Game Suitability) for the themed-pack groundwork already on the roadmap (milestone "1.x — Themed Content Groundwork").
- **Networking, session code, reconnect, venue readiness.** All of the source doc's sections 3, 4, and most of 68-69 are superseded wholesale by `phone-buzzer-spec.md` sections 2.4-2.16, which are far more specific (device policies, session codes, Windows firewall/network-profile handling, screen-wake workaround, validation tests, real-device matrix) than anything in the source document. Treat `phone-buzzer-spec.md` as authoritative; nothing in this spec revisits it.
- **Host override.** Source doc section 68 is already Host Mode (milestone "0.2.0 — Host Mode / Game Master Controls", issues #8-#10): Mark Correct/Incorrect, undo, score reassignment are already scoped and sequenced ahead of everything in this spec.

## 2.3 What this spec adds that is genuinely new

- A **Number Input** interaction type and a **Private Information Push** interaction type, neither of which exists in the Stage 3 `PhoneInteraction` union today (needed for Baseball's pitch inventory and wager-style games — see §3).
- The **shared engine catalogue** in §4, mapped onto actual `GameId`s and existing engine code, as a planning lens for future game additions (this does not require new code by itself).
- **Bible Baseball** as a new game engine (§6) — genuinely new; nothing shipped resembles it.
- **Bible Blockbusters** as a new game engine (§7) — genuinely new (hex-grid buzzer board), though it reuses the buzzer arena wiring end to end.
- A curated shortlist of new *content-only or thin-rule* games (§5.1) that fit existing engines and mostly need content, not code.

## 2.4 Non-conflicts worth naming explicitly

Nothing in this spec changes `phone-buzzer-spec.md`'s stage order, the Host Mode prerequisite, or the version map's existing minor-version slots (0.2.0, 0.3.0, the 1.x Phone Mode stages). Baseball and Blockbusters are **new games**, so per `versions-map.md`'s bump rules they each land as their own `1.x.0` (minor) slot, ordered after Phone Mode Stage 3 Step 1 (Choice Select) since Baseball's pitch-selection UI needs Private Choice/Number Input, which is a Stage-3-shaped interaction.

---

# 3. Controller Interaction Model (extends Phone Mode Stage 3)

This section adds to, and does not replace, `phone-buzzer-spec.md` Appendix A/C and section 5.

## 3.1 New interaction types

```ts
// Extends PhoneInteraction in phone-buzzer-spec.md section 2.2
type PhoneInteraction =
  | "buzz"
  | "text-answer"
  | "choice-select"
  | "number-input"        // NEW
  | "private-choice"       // NEW — choice list not shown on the projector (pitch/wager/route selection)
  | "map-select"
  | "sequence-control"
  | "tile-control";
```

- **`number-input`**: a numeric keypad-style entry (wagers, estimates, numeric answers). Reuses the Stage 2 text-answer wire format with `inputMode: "numeric"` and server-side numeric validation (reject non-numeric, clamp to a configured range) rather than a new message type. No protocol change needed beyond a `numberConfig: { min, max, step }` field on `PhonePromptModel`.
- **`private-choice`**: mechanically identical to `choice-select`, except the choice list is **never** sent to the projector and the prompt text differs from what the projector shows (e.g., pitcher's phone shows "PITCH TO TEAM 2 — Fastball (Easy, 3 left) / Curveball..." while the projector shows only "THE PITCH..."). This is the piece the source document's "Private Choice" and "Private Information" categories actually need, and Stage 3 as spec'd doesn't have it: `toPhoneView()` today assumes a phone's prompt text is a redacted view of the *same* prompt the projector shows. Baseball's pitcher screen has **no projector equivalent at all** until after the pitch is chosen.

## 3.2 `toPhoneView()` extension

`toPhoneView(state, participantId, context)` needs a second, optional per-participant override so a private-choice or private-information prompt can differ entirely from the public one, rather than being a redaction of it:

```ts
interface PhonePromptModel {
  // existing fields unchanged
  privateOverride?: {
    promptText: string;         // shown only to this participant's phone
    choices?: PhoneChoice[];    // not present in the public model at all
    numberConfig?: { min: number; max: number; step: number };
  };
}
```

The existing leak test (`phone-buzzer-spec.md` section 2.12) extends naturally: assert that `privateOverride` content for participant A never appears in participant B's model or in the projector snapshot.

## 3.3 Non-goal

This spec does not add a distinct "Private Information" *push* message type beyond `privateOverride`. The source document's Forbidden Words / Bible Draw clue-giver use case (§22-23) is the same shape as `private-choice`/`privateOverride` with no choices, just text — no new wire message needed.

---

# 4. Shared Game Engines

The source document's six-to-eight-engine idea is sound as a planning lens, but this repo's actual unit of reuse is finer-grained: `GameId` + a per-game `submit*Guess` function + a JSON content schema, orchestrated by common session/scoring/timer code already in `gameEngine.ts`, `gameCore.ts`, and `scoring.ts`. "Engines" below are groupings of *existing and proposed* `GameId`s that already share (or should share) code, not new abstraction layers to build up front.

| Engine grouping | Already-shipped games | New games this spec proposes |
|---|---|---|
| **A. Buzzer Arena** | Every existing game via `BuzzTurnPolicy` (all of them once Phone Mode Stage 1 ships) | Bible Blockbusters (§7), Clue Ladder (§5.1) |
| **B. Progressive Reveal** | `prophecy-clue-ladder` (structurally identical: clues reveal, earlier guess scores more) | Clue Ladder / Who Am I? / Name That Story content variants (§5.1) — same engine as `prophecy-clue-ladder`, different content, **not** a new engine |
| **C. Risk/Reward (pitch/shot/route difficulty maps to reward)** | none | Bible Baseball (§6) is the first; Basketball/Football/Expedition are explicitly deferred (§5.3) pending Baseball validating the pattern |
| **D. Sequence/Assembly** | `bible-timeline`, `bible-books-relay`, `verse-scramble` | "Insert Event" and "Which Came First?" timeline sub-modes (§5.2) |
| **E. Classification/Set Membership** | `odd-one-out`, `bible-connections`, `prophecy-categories`, `proverb-categories` | None — fully covered |
| **F. Visual Progress** | none | Explicitly deferred (§5.3); no existing game needs it yet |
| **G. Mini-Game Orchestrator** | none | Explicitly deferred (§5.3); depends on several engines maturing first |
| **H. Private-Information Team Engine** | none (protocol groundwork is §3) | Forbidden Words is the only one scoped as a candidate (§5.1), and only after §3 ships |

This table is the mapping the source document's section 74.G asked for. It is intentionally not a new abstraction to build — engines A, D, and E are already real via shared engine code; B is one existing pattern (`prophecy-clue-ladder`) to be reused as content, not rebuilt.

---

# 5. Game Triage: Build / Extend / Defer / Drop

Sixty-plus concepts is not a scoped plan. This section sorts the source document's games into four buckets so the milestone list in §10 stays small and defensible.

## 5.1 Build now: content or thin-rule additions to existing engines

These need little or no new engine code — mostly new JSON content packs, and in two cases a small new sub-mode:

| Game (source doc §) | Existing engine | What's actually new |
|---|---|---|
| Clue Ladder (§11, renamed from "Bible Connections" per §2.1) | Same pattern as `prophecy-clue-ladder` (Progressive Reveal) | New `GameId` + content schema; zero new engine code |
| Who Am I? / Name That Story / Quick Bible Mystery (§12, §13, §19) | Same Progressive Reveal pattern | New `GameId`s + content; these three are similar enough to justify sharing one schema shape with a `subjectType: "person" | "story" | "mystery"` discriminator rather than three near-identical schemas |
| Scripture Stumpers (§8) | New but simple: decode a plate-style abbreviation, checked like any text-answer game | New `GameId`, new content schema (matches source doc's proposed shape closely), reuses Buzzer Arena + Stage 2 typed answer wholesale |
| Director's Cut (§58) | Content variant of `two-truths-and-a-lie` | Add a `presentationStyle: "statements" | "narrated-account"` field to the existing schema rather than a new game — see §2.1 |
| Movie Trailer / Casting Call / Investigator / Archaeologist (§37, §56, §59) | Progressive Reveal (Movie Trailer, Investigator, Archaeologist) or Choice Select (Casting Call) content skins | New `GameId`s, reusing existing engines end to end; lowest-risk batch to build once Clue Ladder validates the pattern |
| Forbidden Words (§22) | Buzzer Arena + `private-choice`/`privateOverride` (§3) | Needs §3 shipped first; otherwise it's a timer + team-turn game with no new scoring |

## 5.2 Extend an existing game: new sub-modes on `bible-timeline`

- **"Which Came First?"** (pairwise) and **"Insert Event"** (place a new event in an existing sequence) join `bible-timeline` as round-type variants alongside the shipped "Order These." This is a content-schema extension (`roundType` field) plus a small UI branch in the existing timeline component, not a new `GameId`.

## 5.3 Defer: real value, but blocked or premature

- **Bible Baseball (§9)** and **Bible Blockbusters (§10)** — scoped in full below (§6, §7). Not deferred; sequenced after Stage 3 Step 1.
- **Basketball, Football, Soccer, Expedition, Hit the Mark, Sow & Reap, Fishing, Build It!, Race Through the Bible, David vs. Goliath** (§28-33, 40-41) — all Risk/Reward or Visual Progress engines. Deferred until Baseball ships and validates the pitch-inventory / difficulty-reward pattern in a real engine; building five variants of an unvalidated pattern is the exact anti-pattern the source document's own section 7 warns against ("investigate whether 6-8 reusable engines can support many game presentations" — building the first of a kind before generalizing).
- **Bible Escape, Bible Training Camp, Treasure Hunt (§34-35, 43)** — Mini-Game Orchestrator engine. Deferred until at least two of the engines it would orchestrate exist as real games (Baseball + Blockbusters gets partway there).
- **Bible Draw, Bible Music Challenge (§23, §44)** — deferred; Bible Draw is explicitly MVP-able with paper/whiteboard per the source doc, so it has no engine dependency, but it also has no scoring hook into anything, making it a standalone low-priority add. Music Challenge is blocked on licensing review (source doc's own flag in §44), which is a `content-licensing-spec.md` concern, not a game-engine concern.
- **Bible Board / Bible Ladder (§25-26)** — deferred; both are larger structured-board games (Jeopardy-style, ladder-with-lifelines) that need their own design pass once Baseball and Blockbusters establish patterns for defense/opponent choices and board claiming.
- **Everything in source doc §62-63 "other previous designs"** — explicitly preserved as a candidate list, not scoped. No action.

## 5.4 Drop or fold in: redundant with shipped games

- **Dodge the Decoy (§54)** — fold into `odd-one-out`. No new game. If the "every team privately selects, then simultaneous reveal" mode from the source doc is wanted, that's a Collect-All content flag on the existing game, not a new `GameId`.
- **Which One Is True? (§24)** — fold into `two-truths-and-a-lie` (already the same mechanic with the polarity flipped). Do not build separately.
- **Movie Mashup (§61)**, **Four Square (§55)** — both are classification variants that map directly onto the existing `prophecy-categories`/`proverb-categories` engine shape. Treat as future content packs for that engine, not new games, once entity-tag metadata (source doc §16, §66) is actually designed — which it isn't yet anywhere in this repo. No ticket yet; revisit if/when entity tagging is scoped.
- **Bible Grid, Bible Categories (§16-17)** — both depend on the same not-yet-designed structured Bible-entity metadata. Do not scope tickets until that metadata model exists. This is the one piece of the source document (§16 entity concept, §66 content reuse) that is a real gap, not a duplicate — but it's a data-modeling project, not a game, and belongs in its own future spec.

---

# 6. Bible Baseball (New Engine)

This is the source document's strongest, most-detailed design (source §9) and the one piece of this spec sequenced as its own milestone.

## 6.1 Core rule set (MVP)

- Two teams per game (offense/defense), matching `ParticipantMode` today with exactly 2 participants.
- Defense privately selects pitch difficulty via `private-choice` (§3) from a **fixed pitch inventory** consumed per half-inning:
  - Standard deck: 3 Easy, 3 Medium, 2 Hard, 1 Expert (9 pitches).
  - Configurable presets (Young / Standard / Advanced) stored the same way `DifficultyFilter` presets are today.
- One question = one at-bat. Correct = hit (MVP: every correct answer is a single; speed-based hit quality is a post-MVP enhancement per source doc §9). Wrong or timeout = out.
- Deterministic base-running: single/double/triple/home run advance runners by fixed rules; three outs switch offense/defense; unused pitches in the inventory are discarded at the side change.
- Short format: one inning per team (configurable), sudden-death extra at-bat on a tie.

## 6.2 What's genuinely new vs. existing engine code

- **Difficulty-gated content retrieval keyed to a consumable resource.** No existing game retrieves content by difficulty *and* decrements a per-team, per-half-inning inventory. This is new state (`PitchInventory: Record<Difficulty, number>` per team per half-inning) and a new pure reducer, not a reuse of any existing `submit*Guess` function.
- **Base-running state machine.** New pure module (`baseballState.ts`, unit-testable like `buzzerState.js`): bases occupied, outs, runs, inning, half (offense/defense), sudden death.
- **Role-switching participants.** Today's `Participant` model has no offense/defense role; Baseball needs a per-game role field that flips at three outs, independent of turn order/`turnCounter`.

## 6.3 What reuses existing infrastructure directly

- Question retrieval by difficulty reuses `DifficultyFilter` and existing content schemas — any existing text-answer game's content can back a pitch (source doc's own suggestion). No new content authoring is required for MVP; Baseball can run entirely on existing question banks tagged by difficulty.
- Text/choice answer submission reuses Stage 2 (typed answer) and Stage 3 Step 1 (choice select) wiring as-is.
- Scoring/stats reuse `PlayerStats` and `scoring.ts` with new fields (`hits`, `runs`, `outs`) added the same way other games add game-specific stat fields.
- Host override (mark correct/incorrect on a disputed spoken answer) is Host Mode as already spec'd — no changes needed.

## 6.4 Dependencies

- Needs Host Mode (0.2.0) for `setCurrentActor`/mark-correct-incorrect, same as every buzzer game.
- Needs Phone Mode Stage 3 Step 1 (Choice Select) for the pitcher's `private-choice` inventory screen, plus the `privateOverride` extension in §3.2.
- Does **not** need Stage 3 Step 2 (Collect All) — Baseball is strictly turn-based (one team pitches, one bats at a time).

## 6.5 Non-goals (MVP)

- Speed-based hit quality (Home Run/Triple/Double/Single by response time) — post-MVP per source doc.
- Batter pitch-prediction mechanic (source doc's "future advanced rule") — explicitly not MVP; the architecture (private-choice, per-participant prompt override) does not block adding it later.

---

# 7. Bible Blockbusters (New Engine)

Source doc §10.

## 7.1 Core rule set (MVP)

- Small hex grid (suggest 5x5 for a 3-5 minute target); each hex has a letter, generated **only from letters that have available question content** (source doc's own requirement — no orphan hexes).
- Buzzer Arena engine end to end: reveal question, arm, first buzz wins, correct answer claims the hex, incorrect locks that team out and re-arms remaining teams (standard `BuzzTurnPolicy`/Reset Rules from `phone-buzzer-spec.md`).
- 2-team MVP (connect opposite sides). Explicitly defer >2-team board-control variants (source doc flags this itself as needing separate design) to a follow-up issue, not MVP.

## 7.2 What's genuinely new

- Hex-grid board state and adjacency/path-connection win-check (new pure module, unit-testable).
- Board generator that filters to letters with available content rather than a fixed letter set.

## 7.3 What reuses existing infrastructure directly

- The entire buzz/lock/re-arm/score flow is Phone Mode Stage 1 plus Host Mode judging, unchanged.
- Content is a new schema (`letter`, `question`, `answer`, `aliases[]` — same shape as `initials` or `five-guesses`), reusing existing answer-checking (`isCorrectGuess`/`normalizeText`).

## 7.4 Dependencies

- Host Mode (0.2.0), Phone Mode Stage 1 (0.3.0). No Stage 2/3 dependency — Blockbusters is a pure buzz-and-claim game and can ship as soon as Stage 1 does.

---

# 8. Content Pack Interaction

No new mechanism needed. `themed-content-spec.md` section 11 (Game Suitability) already defines exactly the "which games fit which theme" matrix the source document's section 65 asked for; new games added under this spec (Clue Ladder, Scripture Stumpers, Baseball, Blockbusters, etc.) get a row added to that table as part of their own implementation, the same way every existing game already has one. No separate ticket.

---

# 9. Answer Normalization and Host Override

Both already exist as scoped work: `isCorrectGuess`/`normalizeText` (answer checking) and Host Mode's Mark Correct/Incorrect/Undo (source doc §67-68) are shipped-or-in-progress, not new asks. Scripture Stumpers, Clue Ladder, and Baseball all consume this as-is; no new ticket.

---

# 10. Admin Console Impact

The original pass of this spec omitted this section entirely, unlike every other content-affecting spec in this repo (`themed-content-spec.md` section 12, and the Admin Console subsections under Tournament and Bible Map Challenge in `enhancement-spec-tournament-daily-host-map.md`). Corrected here.

## 10.1 Why every new game or schema change touches the admin console

The admin console renders its content-editing forms **generically from each game's JSON Schema**, driven by a vendored manifest (`admin/src/data/games.json`, mapping `gameId` to `label`/`shortDescription`/`schemaFile`) that is copied from the main app via `scripts/sync-schemas.mjs` — a deliberate one-way vendor, not a live cross-repo read (see that script's own header comment). This means:

- **A brand-new `GameId`** is not editable in the admin console until (a) `sync-schemas` is re-run to vendor its schema, and (b) it gets an entry in `games.json` with a label and description. This is a manual step (`npm run sync-schemas --workspace bible-challenge-admin -- --source ..` from the repository root), not automatic.
- **A new field on an existing game's schema** (e.g. `roundType` on `bible-timeline`, `presentationStyle` on `two-truths-and-a-lie`) should be picked up by the generic form renderer once `sync-schemas` is re-run, since the form is schema-driven rather than hand-built per game — but this should be verified per change, not assumed, since the generic renderer's coverage of schema features (enums, discriminated unions, nested arrays) is not guaranteed to be complete for every shape a new field might take.
- **`verify-schemas-fresh.mjs`** exists specifically to catch a stale vendor copy. Any PR that changes a game's schema in the main app should run `npm run verify-schemas-fresh --workspace bible-challenge-admin -- --source ..`; if schemas changed without re-running `sync-schemas`, that check reports the drift.

## 10.2 Per-issue admin console impact

| Issue | Admin console change needed |
|---|---|
| #52 Clue Ladder | New `GameId` + schema: run `sync-schemas`, add `games.json` entry |
| #53 Who Am I? / Name That Story / Quick Bible Mystery | New `GameId`(s) + schema: run `sync-schemas`, add `games.json` entries |
| #54 Movie Trailer / Investigator / Archaeologist / Casting Call | New `GameId`(s) + schema: run `sync-schemas`, add `games.json` entries |
| #55 Scripture Stumpers | New `GameId` + schema: run `sync-schemas`, add `games.json` entry |
| #56 `bible-timeline` `roundType` field | Re-run `sync-schemas`; verify the generic form renderer handles the new field (round-type discriminator) correctly, not just assume it |
| #57 `bible-timeline` "Insert Event" mode | Same schema-refresh verification as #56 |
| #58 `two-truths-and-a-lie` `presentationStyle` field | Re-run `sync-schemas`; verify the generic form renderer handles narrated-account content authoring (likely a longer free-text field than the existing statement list) |
| #60 Baseball pitch inventory presets (Young/Standard/Advanced) | Per `phone-buzzer-spec.md` section on Settings ("the admin console can later expose per-game defaults"), these presets are a natural admin-exposed per-game default, same shape as `defaultPlayStyleByGame`. Add an admin settings surface for the active preset, or explicitly defer with a note if out of scope for MVP |
| #64 Baseball stats fields | New `PlayerStats` fields (hits, runs, outs) — check whether the admin console's stats view (existing `gameStats`/`GamePlayStats`, per this project's separate content-editor/admin-console plans) needs to know about them, or whether it already displays arbitrary stat fields generically |
| #66 Blockbusters board generator | Board size is a per-game default in the same shape as Baseball's presets; same admin-exposure question |
| #67 Blockbusters schema/content | New `GameId` + schema: run `sync-schemas`, add `games.json` entry |
| #71 Forbidden Words content | New `GameId` + schema: run `sync-schemas`, add `games.json` entry |

No admin console change is needed for #49-51 (controller/protocol-only, no content schema) or #59/#61/#62/#63/#65/#68/#69/#70 (state machines and host/projector/timer UI, no schema or settings surface of their own).

---

# 11. Milestones and Issues

These are created as **new milestones after the existing roadmap**, not inserted into it — everything currently scheduled (Host Mode, Phone Mode Stages 1-3, Tournament, Daily Challenge, Bible Map Challenge, Themed Content, Licensing) is unaffected and unreordered. New milestones depend on Phone Mode Stage 1, Host Mode Phase 1, or Stage 3 Step 1 via native `blockedBy` edges, same convention as the rest of the tracker.

## 11.1 Priority tiering

Lumping all seven new milestones at a flat `priority: later` obscured real differences in dependency depth. They were re-tagged after review:

| Tier | Milestones | Priority | Why |
|---|---|---|---|
| **No dependency on unshipped work** | New Games: Progressive Reveal Content Batch, Timeline Sub-Modes, Director's Cut Presentation Variant | `priority: next` | Pure schema/content extensions to games that already ship. Zero architectural risk; nothing to build first. |
| **Reachable once Phone Mode Stage 1 ships** (already `priority: next`) | Bible Blockbusters | `priority: next` | Depends only on Phone Mode Stage 1, Step 1 (issue #12) — not Host Mode, not the controller extension. Shallower than Baseball by a full milestone; sequence its build *ahead* of Baseball to validate the buzzer-arena-as-board-game pattern first. |
| **Reachable once Stage 3 Step 1 / Host Mode Phase 1 ship** | Controller: Private Choice & Number Input, Forbidden Words | `priority: later` | Real prerequisites (Phone Mode Stage 3 Step 1; the controller extension) haven't shipped yet. |
| **Deepest chain in the new batch** | Bible Baseball | `priority: later` | Needs Host Mode Phase 1 *and* the controller extension *and* four internal issues before a host console exists. Build after Blockbusters proves the pattern, not in parallel with it. |

| Milestone | Priority | Depends on (blockedBy) | Issues |
|---|---|---|---|
| **1.x — New Games: Progressive Reveal Content Batch** | `next` | none beyond existing engine (ships any time) | 1. Clue Ladder (`GameId`, schema, content); 2. Who Am I? / Name That Story / Quick Bible Mystery (shared schema shape); 3. Movie Trailer / Investigator / Archaeologist; 4. Casting Call (Choice Select skin); 5. Scripture Stumpers (`GameId`, schema, ~100 main-pack puzzles) |
| **1.x — Timeline Sub-Modes** | `next` | none (extends shipped `bible-timeline`) | 1. Add `roundType` field and "Which Came First?" pairwise mode; 2. Add "Insert Event" mode |
| **1.x — Director's Cut Presentation Variant** | `next` | none (extends shipped `two-truths-and-a-lie`) | 1. Add `presentationStyle` field and narrated-account content |
| **1.x — Bible Blockbusters** | `next` | Phone Mode Stage 1 (0.3.0), issue #12 | 1. Hex board state + adjacency/win-check + unit tests; 2. Content-aware board generator; 3. `GameId`, schema, content; 4. Host console + projector board UI |
| **1.x — Controller: Private Choice & Number Input** | `later` | Phone Mode Stage 3, Step 1 (Choice Select), issue #17 | 1. Add `number-input` and `private-choice` to `PhoneInteraction`; 2. Add `privateOverride` to `PhonePromptModel` and extend `toPhoneView()`; 3. Extend the Stage 3 leak test for `privateOverride` |
| **1.x — Forbidden Words** | `later` | Controller: Private Choice & Number Input | 1. Team-turn clue-giver flow using `privateOverride`; 2. Timer + scoring; 3. Content (target word + forbidden list) |
| **1.x — Bible Baseball** | `later` | Host Mode (0.2.0), issue #8; Controller: Private Choice & Number Input | 1. Base-running state machine + unit tests; 2. Pitch inventory reducer + presets; 3. Role-switching participant support; 4. Pitcher private-choice UI + batter answer UI; 5. Host console + projector views; 6. Stats fields and scoring integration |

Everything in §5.3/§5.4 (Basketball, Football, Bible Grid, Movie Mashup, Bible Escape, etc.) is intentionally **not** filed as an issue yet — it stays as a candidate list in this spec per the triage rationale, to avoid inflating the tracker with unscoped work. File issues for those only after Baseball and Blockbusters ship and the risk/reward and board-claiming patterns they establish can inform the design.

Apply the existing labels: `spec`, `enhancement`, the priority tier from §11.1, and `content-pack` for the content-only issues (Scripture Stumpers puzzles, Clue Ladder content, etc.). Every issue that adds a `GameId` or a content schema also needs the admin console follow-through in §10.2.

---

# 12. Open Decisions

1. **Baseball hit-quality timing model.** Source doc suggests either fixed thresholds or percentage-of-allowed-time. Deferred to implementation; not a blocker for MVP (every correct answer is a single).
2. **Blockbusters board size and >2-team variant.** 5x5/2-team is the MVP assumption in this spec; needs play-testing before locking the size, and the >2-team variant needs its own design pass (source doc flags this itself).
3. **Entity-tag metadata model** (Bible Grid, Categories, Movie Mashup, Four Square's shared dependency) is unscoped. Worth its own short spec once the higher-priority items in this document ship, since several §5.4 "fold in" candidates become buildable once it exists.
4. **Whether Clue Ladder's schema should be unified with `prophecy-clue-ladder`'s** (literally the same engine) or kept as a sibling schema. Leaning toward unifying under one generic "clue ladder" schema with a `theme`/`category` field, but that's a judgment call for whoever picks up that issue.
5. **Whether the admin console's stats view displays new per-game stat fields generically or needs per-field awareness.** Baseball adds `hits`/`runs`/`outs` to `PlayerStats` (§10.2, issue #64). If the admin console's stats view (or the separate planned admin-console stats/ratings migration) already renders arbitrary `PlayerStats` fields generically, no admin work is needed there; if it hand-lists known fields, Baseball's stats need to be added explicitly. Whoever picks up #64 should check the admin console's current stats-rendering code before assuming either way.
