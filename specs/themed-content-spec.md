# Themed Content Spec

## Contents

1. Overview
2. Current State
3. Themed Categories
4. Visibility Rules
5. Seasons and the Season Calendar
6. Pack Format and Loading
7. Predefined Events
8. Featured Seasonal Event
9. Daily Challenge Integration
10. Authoring Standards
11. Game Suitability
12. Admin Console
13. Host Mode and Phone Mode
14. Testing
15. Pack Spec Template
16. Groundwork Steps
17. Acceptance Criteria
18. Open Decisions
19. Pack Model and Core Split
20. Randomness

---

# 1. Overview

## Summary

This spec defines the shared framework for themed content packs such as Christmas, Easter / Resurrection Day, and Thanksgiving. It covers what every pack has in common:

- How themed categories are defined and shown
- How seasons are calculated each year
- How packs are stored, loaded, and validated
- **Predefined events:** static, built-in event line-ups for each theme
- **Featured seasonal event:** an automatic home-screen event for whichever theme is in season
- Content authoring standards

Each pack spec then only describes its own content: themes, game mix, round targets, content ideas, and its predefined events.

Section 19 applies the same pack model to the existing (evergreen) content: today's content is split into a smaller Core pack plus several other packs, so every piece of content, themed or not, ships and loads the same way.

## Pack Specs

| Category ID | Label | Spec |
|---|---|---|
| `christmas` | Christmas | `christmas-content-pack-spec.md` |
| `resurrection-day` | Easter / Resurrection Day | `easter-resurrection-day-content-pack-spec.md` |
| `pentecost` | Pentecost | `pentecost-content-pack-spec.md` |
| `thanksgiving` | Thanksgiving Day | `thanksgiving-content-pack-spec.md` |
| `mothers-day` | Mother's Day | `mothers-day-content-pack-spec.md` |
| `fathers-day` | Father's Day | `fathers-day-content-pack-spec.md` |
| `new-year` | New Year | `new-year-content-pack-spec.md` |
| `biblical-feasts` | Biblical Feasts | `biblical-feasts-content-pack-spec.md` |

Related seasons are folded into a parent pack instead of getting their own category:

- **Advent** and **Epiphany** are part of Christmas.
- **Lent**, **Palm Sunday**, and **Holy Week** are part of Easter / Resurrection Day.
- **Shavuot (Weeks)** is covered in Biblical Feasts; **Pentecost** as the Acts 2 event has its own pack.

## Goals

- Every themed pack looks and behaves the same way.
- Adding a new pack after the groundwork is a content task, not a code task.
- Themed content never leaks into the evergreen categories.
- Hosts get a ready-to-play themed event in one click during each season.
- Seasonal packs stay available all year for hosts planning ahead.

## Non-Goals

- New game engines. Themed packs use existing games.
- Culture or holiday trivia not grounded in Scripture.
- Online content downloads. Packs ship with the app or are imported locally.

---

# 2. Current State

Findings as of this writing.

- **Content categories** are a fixed union `ContentPackId` in `src/renderer/App.tsx`: `all`, `popular`, `core`, `scripture`, `psalms-proverbs`, `prophecy`, `life-of-christ`, `old-testament`, `new-testament`, `custom`.
- **Category colors and labels** are in `CONTENT_PACKS`.
- **Game-to-category mapping** is a static table `GAME_CONTENT_PACKS: Record<GameId, ContentPackId[]>`. It maps whole games to categories and cannot filter individual sessions or rounds.
- **Custom packs** (`CustomContentPack` in `src/lib/content.ts`) have `packId`, `packName`, `accentColor`, and `games[]`. Each game entry is validated against that game's schema. Custom packs have no category metadata; they all surface under `custom`.
- **Content loading:** `loadGameContent(mode, { customOnly })` can load built-in plus custom or custom only. It cannot filter by category.
- **Session size:** content packs set `roundsPerSession`, clamped to 1-10 for custom content (`content.ts:346`).
- **Events:** `SavedEventDefinition` is `{ id, name, gameIds }`. It has no content category, so an event cannot say "play these games using Christmas content."
- **Color collision:** the Christmas spec's proposed accent `#7f3b4a` is identical to the existing Prophecy category color.
- **Text rules:** `SPEC.md` requires shippable verse text to be public domain (KJV). Licensed translations may only be added locally.

---

# 3. Themed Categories

## 3.1 Category Registry

Themed categories are defined in one static registry, `src/lib/themes/categories.ts`:

```ts
type ThemedCategoryId =
  | "christmas"
  | "resurrection-day"
  | "pentecost"
  | "thanksgiving"
  | "mothers-day"
  | "fathers-day"
  | "new-year"
  | "biblical-feasts";

type ThemedCategoryKind =
  | "christian-calendar"
  | "civic-holiday"
  | "biblical-feast";

interface ThemedCategoryDefinition {
  id: ThemedCategoryId;
  label: string;
  searchAliases: string[];      // e.g. ["Easter", "Holy Week", "Passion Week"]
  accentColor: string;
  kind: ThemedCategoryKind;
  season: RegionalSeasonRule;   // see section 5
  featurePriority: number;      // higher wins when seasons overlap
  sessionTags: string[];        // allowed sub-season tags, e.g. ["advent", "epiphany"]
}
```

- `ContentPackId` becomes `EvergreenCategoryId | ThemedCategoryId`, where `EvergreenCategoryId` is today's list.
- **All themed categories are registered in the groundwork release**, even before their content exists. A category with no installed content is hidden. Adding a pack later needs no code change.

## 3.2 Accent Colors

| Category | Accent |
|---|---|
| `christmas` | `#8c2f39` (changed from `#7f3b4a`, which collides with Prophecy) |
| `resurrection-day` | `#2f6653` |
| `pentecost` | `#b5532a` |
| `thanksgiving` | `#8a5c24` |
| `mothers-day` | `#9a4f74` |
| `fathers-day` | `#2d5470` |
| `new-year` | `#3d4f86` |
| `biblical-feasts` | `#6b5b2e` |

Rules:

- No themed accent may equal an evergreen category color.
- Card text on each accent must meet WCAG AA contrast in every app theme. Verify during the groundwork release and adjust shades as needed.

---

# 4. Visibility Rules

These rules replace the per-pack "Category Visibility Requirement" sections.

## 4.1 Exclusive Categories

- Themed content appears **only** in its own themed category.
- Themed content never appears in evergreen categories (`core`, `scripture`, `psalms-proverbs`, `prophecy`, `life-of-christ`, `old-testament`, `new-testament`, `popular`), even when the game type matches. Christmas prophecy rounds do not appear in Prophecy.
- Themed custom packs do not appear under `custom`. `custom` shows only custom packs without a themed category.
- Random round selection in any evergreen category never draws themed sessions.

## 4.2 All-Inclusive Views

- `All Challenges` becomes evergreen-only and excludes themed content.
- Add `All Installed Challenges`, which includes evergreen and all installed themed content. Its label makes the seasonal inclusion clear.

## 4.3 Themed Category Behavior

When a themed category is selected on the home screen:

- Show only games with content in that category.
- Use the category's accent color for cards.
- Starting a game draws from that category's sessions only.
- An installed category with no content for any game is hidden. A category with some content shows only those games.

## 4.4 Availability Versus Featuring

- **Availability:** a themed category is selectable **all year** whenever it has installed content. Hosts often plan events weeks ahead.
- **Featuring:** during its season window, a category is highlighted (section 8) and its tab moves to the front of the category list.
- Setting `themedCategoriesOutOfSeason: "show" | "hide"` (default `show`) lets a host hide out-of-season themed tabs. Hidden categories remain reachable from a "More themes" menu.

---

# 5. Seasons and the Season Calendar

## 5.1 Season Rules

```ts
type MonthDay = { month: number; day: number };

type SeasonRule =
  | { type: "fixed"; start: MonthDay; end: MonthDay }                          // may wrap the year end
  | { type: "easter-relative"; startOffsetDays: number; endOffsetDays: number }
  | { type: "christmas-relative"; start: "advent-1" | MonthDay; end: MonthDay }
  | { type: "nth-weekday"; month: number; weekday: number; n: number | "last"; startOffsetDays: number; endOffsetDays: number }
  | { type: "date-table"; windows: Record<number, Array<{ start: string; end: string; tag?: string }>> }
  | { type: "none" };

type SeasonRegion = "us" | "ca" | "uk";

type RegionalSeasonRule = { default: SeasonRule } & Partial<Record<SeasonRegion, SeasonRule>>;
```

- `easter-relative` uses the Western (Gregorian) Easter date.
- `advent-1` is the fourth Sunday before December 25.
- `nth-weekday` covers holidays like US Thanksgiving (fourth Thursday of November) and Mother's Day (second Sunday of May, US).
- `date-table` holds precomputed dates for feasts that follow the Hebrew calendar (section 5.3).
- `none` means the category is never featured, only available.

## 5.2 Season Calendar Module

`src/lib/themes/seasonCalendar.ts`:

```ts
function getEasterDate(year: number): Date;                   // Western Easter, anonymous Gregorian algorithm
function getSeasonWindow(rule: SeasonRule, year: number): Array<{ start: Date; end: Date; tag?: string }>;
function getActiveThemedCategories(date: Date, region: SeasonRegion): ThemedCategoryId[]; // sorted by featurePriority
function getActiveSessionTags(categoryId: ThemedCategoryId, date: Date, region: SeasonRegion): string[];
```

- Pure functions using local dates, fully unit-tested.
- Setting `seasonRegion` (default `us`) selects the regional rule.
- **Season preview:** the host can choose "Preview season as of [date]" in settings to see what will be featured on a future date, for example to plan a Christmas event in November. Preview never changes stored data.

## 5.3 Hebrew-Calendar Dates

Feasts such as Passover, Tabernacles, and Purim follow the Hebrew calendar. Instead of implementing Hebrew calendar math:

- Store a precomputed `date-table` covering at least 10 years in `src/lib/themes/feastDates.ts`.
- Populate it from an authoritative source (for example Hebcal) and record the source and retrieval date in a comment.
- Years missing from the table fall back to `none`: the category stays available but is not featured. A data check warns when the table covers fewer than 3 future years.

## 5.4 Overlapping Seasons

- More than one category can be in season (for example Christmas and New Year in late December).
- The home screen lists all in-season categories first, ordered by `featurePriority`.
- Only the highest-priority in-season category gets the featured event card (section 8), unless the host enables `showAllFeaturedEvents`.

---

# 6. Pack Format and Loading

## 6.1 One Format for Built-In and Custom Packs

Themed packs use the existing `CustomContentPack` format, extended with category metadata:

```ts
interface CustomContentPack {
  packId: string;
  packName: string;
  accentColor: string;
  categoryId?: ThemedCategoryId;   // new; omitted for ordinary custom packs
  packVersion?: number;            // new; content revision for shipped packs
  games: CustomContentGame[];
}
```

Optional session-level metadata:

```ts
interface ThemedSessionMetadata {
  tags?: string[];          // must be in the category's sessionTags, e.g. "advent", "holy-week"
  sequenceDay?: number;     // for day-by-day rotations such as Holy Week (1 = first day)
  audience?: "family" | "kids" | "teaching";
}
```

- Session metadata is optional. Game round schemas are unchanged.
- Validation rejects tags that are not in the category's `sessionTags`.

## 6.2 Built-In Themed Packs

- Shipped packs use the built-in pack folder layout in section 19.3 (`src/data/packs/<packId>/`), with `categoryId` in the manifest. User-imported custom packs keep the single-file format above.
- Both are loaded through the same validation (`validateCustomGame` in `content.ts`), so admin tooling and validation apply to both.
- Built-in packs are read-only. To extend one, the admin duplicates it into a custom pack with the same `categoryId`. Content from both merges in the category.
- Packs sold separately are encrypted and unlocked by license; see `content-licensing-spec.md`. Keep duplicate and export in one code path so they can be disabled for licensed packs.
- `npm run check:data` validates built-in themed packs, including `categoryId` and session tags.

## 6.3 Loading and Filtering

- `loadGameContent(gameId, { category })` replaces `customOnly`, where `category` is an evergreen ID, a themed ID, `custom`, or `all-installed`.
- For themed categories, the set of visible games is derived at load time from installed packs with that `categoryId`. `GAME_CONTENT_PACKS` stays the static mapping for evergreen categories only.
- `roundsPerSession` continues to control session length (1-10).

## 6.4 Versioning

- The groundwork release (registry, visibility, calendar, predefined events, featured event) is a **minor** release per `versions-map.md`.
- After that, adding or expanding a themed pack is content-only and ships as a **patch**.
- Bump a pack's `packVersion` whenever its content changes.

---

# 7. Predefined Events

## 7.1 Concept

Predefined events are built-in, read-only event line-ups defined in static configuration. Every themed category has at least one; evergreen predefined events are also allowed. They sit alongside the user's saved events.

## 7.2 Registry

`src/lib/themes/predefinedEvents.ts`:

```ts
type EventAudience = "family" | "kids" | "teaching" | "event-night";

interface PredefinedEventDefinition {
  id: string;                          // e.g. "christmas-family-mix"
  categoryId: ThemedCategoryId | EvergreenCategoryId;
  name: string;
  description: string;
  audience: EventAudience;
  gameIds: GameId[];                   // play order
  difficulty?: DifficultyFilter;
  sessionTags?: string[];              // restrict to tagged sessions, e.g. ["advent"]
  featured: boolean;                   // eligible for the featured seasonal event
  minimumGames: number;                // default 3
}
```

## 7.3 Event Definitions Gain a Category

`SavedEventDefinition` is extended so an event plays each game from the right content:

```ts
interface SavedEventDefinition {
  id: string;
  name: string;
  gameIds: GameId[];
  categoryId?: ContentPackId;          // new; default: evergreen behavior
  difficulty?: DifficultyFilter;       // new
  sourcePredefinedEventId?: string;    // new; set when copied from a predefined event
}
```

`cleanSavedEventDefinitions` (`App.tsx:1516`) accepts the new optional fields and keeps unknown fields intact.

## 7.4 Behavior

- Predefined events appear in Event setup under a **Predefined** section, grouped by category.
- The host can start a predefined event directly, or **Copy to My Events** to create an editable `SavedEventDefinition` with `sourcePredefinedEventId` set.
- Predefined events are never edited or deleted by the user. They update only with app releases.
- **Resolution at start:** games with no content in the event's category are skipped. If fewer than `minimumGames` remain, the event is shown as unavailable with the reason ("Christmas content is not installed for enough games").
- When `sessionTags` is set, sessions are drawn only from matching tags. If a game has no tagged sessions, it falls back to all sessions in the category.

---

# 8. Featured Seasonal Event

## 8.1 Behavior

- When a themed category is in season (section 5), the home screen shows a **featured event card** for that category's `featured` predefined event.
- The card shows the theme name, accent color, event name, audience, game list, and a Start button.
- If a category has several featured events, the one matching the current session tags wins (for example the Advent event during Advent), otherwise the first in registry order.
- The featured event obeys the same resolution rules as any predefined event (section 7.4). It is hidden if it would be unavailable.
- Setting `showFeaturedSeasonalEvent` (default on) turns the card off.
- The card never changes the selected category or settings until the host starts it.

## 8.2 Sub-Season Rotations

Some packs progress through a season, such as the Holy Week day-by-day rotation or the four weeks of Advent.

- A category's season window can produce active session tags (for example `holy-week` plus `sequenceDay` 1-8, or `advent-week-2`).
- The featured event and Daily Challenge prefer sessions matching the active tags and `sequenceDay`.
- Tags and `sequenceDay` only narrow the pool of rounds. The rounds themselves are still picked and ordered randomly (section 20).

---

# 9. Daily Challenge Integration

Applies once Daily Challenge (enhancement spec section 2) exists.

- Daily configuration gains `includeSeasonal: boolean` (default on).
- When on and a themed category is in season, the daily mix is drawn from that category's **daily pool** (defined in each pack spec), using the Daily Challenge spec's deterministic date seeding.
- When off, themed content is included only if the host explicitly adds the category to the daily configuration.
- Daily mixes prefer 3 games with 1-3 prompts each and avoid board-heavy games.
- Sub-season tags and `sequenceDay` apply (for example, Holy Week dailies progress from Palm Sunday to Resurrection Day).

---

# 10. Authoring Standards

These apply to every themed pack.

## 10.1 Scripture Text

- Quoted verse text in shipped packs is KJV (public domain), per `SPEC.md`.
- Every round carries a scripture reference.
- Paraphrased prompts must not be presented as quotations.

## 10.2 Tradition Versus Text

Holidays attract traditions the Bible does not state. Rules:

- Statements describe what the text says or does not say. For example, "The Bible says there were three wise men" is false, because Matthew 2 does not give a number.
- Tradition-versus-text rounds, especially in `two-truths-and-a-lie`, must include a study note citing the relevant verse.
- Do not mock or dismiss traditions. The goal is to teach what the text says.
- Culture-only trivia (Santa, Easter eggs, turkeys) is excluded.

## 10.3 Parallel Accounts

- When Gospel accounts differ in detail (for example the number of angels at the tomb), the prompt names the specific Gospel.
- Do not flatten or harmonize differing accounts inside a single answer.

## 10.4 Interpretive Claims

- Typology and interpretive links (for example Passover and the crucifixion) are phrased as teaching ("Christians have long connected...") and backed by an explicit New Testament reference where one exists (for example 1 Corinthians 5:7).
- Interpretive claims are never used as the "lie" in `two-truths-and-a-lie`.

## 10.5 Sensitivity

- Family-themed packs (Mother's Day, Father's Day) must not assume every child has a living, present, or safe parent. Include content about God as Father, spiritual mothers and fathers, and caregivers.
- Content about Jewish feasts respects Jewish observance. Keep what the Bible commands separate from later Jewish tradition, and label any later tradition as such.

## 10.6 Difficulty and Audience

- Every game in a pack has at least 40% `easy` rounds and at least 15% `hard` rounds.
- Every pack has a family/kids path: at least one predefined event with `audience: "kids"` or `"family"` using mostly easy content.

## 10.7 Volume

- Sessions use up to 10 rounds. Each game should have enough rounds for at least 2 full sessions without repeats (20+ rounds, or 2+ boards for board games), unless the pack spec explains why the source material is thinner.
- If a game cannot reach its minimum from good source material, drop it from the pack rather than padding it with weak rounds.

## 10.8 Review

Each pack goes through a content review checklist before release:

- [ ] Every reference checked against the KJV text
- [ ] Tradition-versus-text rounds have study notes
- [ ] Parallel-account rounds name the Gospel
- [ ] Difficulty mix meets 10.6
- [ ] Sensitivity rules in 10.5 met
- [ ] Reviewed by a second person for doctrinal accuracy
- [ ] `npm run check:data` and the content solvability test pass

---

# 11. Game Suitability

General guidance for choosing games in a themed pack:

| Fit | Games | Why |
|---|---|---|
| **Strong** | `before-or-after`, `bible-timeline` | Holiday narratives are event sequences |
| **Strong** | `who-said-it` | Memorable speakers in each story |
| **Strong** | `two-truths-and-a-lie` | Tradition versus text |
| **Strong** | `complete-the-verse`, `missing-word` | Every season has well-known verses |
| **Strong** | `bible-anagrams` | Kid-friendly word play on names, places, objects |
| **Strong** | Prophecy games (`messiah-prophecy`, `fulfillment-finder`, `prophecy-match`, `prophecy-clue-ladder`) | Christmas, Easter, and Pentecost fulfill prophecy |
| **Good** | `five-guesses`, `initials`, `odd-one-out`, `bible-connections` | People, places, and objects from any story |
| **Good** | `verse-scramble`, `bible-cryptogram`, `scripture-puzzles`, `relay-verse-build`, `verse-typing-race` | Key verses; limited only by verse count |
| **Good** | `genealogy` | Where the pack has a real genealogy (Christmas) |
| **Good** | Psalms and Proverbs games | Thanksgiving, New Year, Mother's and Father's Day |
| **Weak** | `chapter-finder`, `reference-rush`, `name-that-book` | Few distinct source chapters; wears thin quickly |
| **Avoid** | `bible-books-relay`, `word-ladder` | No thematic angle |

Each pack spec lists anchor, daily-ready, event, and optional games, and explains any exclusions.

---

# 12. Admin Console

- Pack editor has a **Category** field: none (ordinary custom pack) or a themed category from the registry.
- Validation fails when `categoryId` is not in the registry, or session tags are not allowed for the category.
- Library view filters by category and shows themed packs under their category label.
- Built-in themed packs are listed as read-only with a **Duplicate to custom pack** action. Licensed packs never offer duplicate or export (`content-licensing-spec.md` section 9).
- A read-only **Predefined Events** view lists predefined events per category with their availability (based on installed content).
- Preview shows only the selected category's rounds.

---

# 13. Host Mode and Phone Mode

- No themed-specific behavior is required.
- Choice-heavy themed games suit Phone Mode Collect All; text-answer games suit Buzz + Typed Answer; board games suit host-led play.
- The featured seasonal event works with Phone Mode like any other event.

---

# 14. Testing

Extends `automated-testing-spec.md`.

- **Season calendar:** Western Easter matches known dates (2026-04-05, 2027-03-28, 2028-04-16, 2029-04-01, 2030-04-21); Advent 1, US Thanksgiving, Mother's Day, and Father's Day for five years; windows that wrap the year end; overlap ordering.
- **Feast date table:** covers at least 3 future years (data check warning, not failure).
- **Visibility:** a fixture themed pack never appears in any evergreen category, `All Challenges`, or `custom`; it does appear in its own category and `All Installed Challenges`.
- **Loading:** starting a game in a themed category draws only that category's sessions.
- **Predefined events:** every predefined event references valid game IDs and a registered category; resolution skips games without content and reports unavailable events.
- **Featured event:** with a fixed clock, the correct card shows on sample dates, and none shows out of season.
- **Content:** every shipped themed pack passes schema validation, tag validation, the content solvability test, and the difficulty mix rule (10.6).
- **Visual:** screenshot of the home screen with a featured event card in two themes.

---

# 15. Pack Spec Template

Every pack spec uses these sections, in this order. Shared behavior is referenced, not repeated.

1. **Purpose**
2. **Category:** ID, label, search aliases, kind, accent color, season rule, feature priority, session tags
3. **Target Users**
4. **Content Themes:** primary themes and what to avoid
5. **Tradition Versus Text** (pack-specific examples)
6. **Sensitivity Notes** (if applicable)
7. **Game Mix:** anchor, daily-ready, event, optional, and excluded games with reasons
8. **Round Targets:** table of minimum rounds per game
9. **Content Ideas:** per game or theme
10. **Sub-Seasons** (if applicable)
11. **Predefined Events:** table
12. **Daily Pool**
13. **Future Map Support** (if applicable)
14. **Acceptance Criteria:** pack-specific, plus "meets `themed-content-spec.md`"
15. **Open Decisions**

---

# 16. Groundwork Steps

These are the "pre-implementations" that make every pack a content-only task.

### Step 0: Pack Model and Core Split

- Rename today's categories and move existing content into pack folders (section 19).
- Must be done first: every later step assumes content arrives in packs.

### Step 1: Categories and Visibility

- Category registry with all eight categories.
- `ContentPackId` split into evergreen and themed IDs.
- `categoryId` and `packVersion` on packs; session metadata.
- `loadGameContent` category filtering; derived game lists for themed categories.
- `All Challenges` becomes evergreen-only; add `All Installed Challenges`.
- Accent color and contrast checks.
- Round selection rules from section 20: tag filtering before the shuffle, recently played avoidance.

### Step 2: Season Calendar

- `seasonCalendar.ts` with all rule types and unit tests.
- `seasonRegion` setting and season preview.
- Feast date table scaffold with source note (dates populated by the Biblical Feasts pack work).

### Step 3: Predefined Events

- `predefinedEvents.ts` registry.
- `SavedEventDefinition` gains `categoryId`, `difficulty`, `sourcePredefinedEventId`.
- Predefined section in Event setup; Copy to My Events; resolution and availability rules.

### Step 4: Featured Seasonal Event

- Home-screen featured card, sub-season tag preference, overlap handling, settings.

### Step 5: Admin and Data Checks

- Admin category field, validation, library filtering, predefined events view, duplicate built-in pack.
- `check:data` coverage for built-in themed packs.

### Step 6: First Packs

- Christmas and Easter / Resurrection Day, which have the richest material and biggest events.
- Then the others in any order as content.

---

# 17. Acceptance Criteria

- All eight themed categories are registered. Categories with no installed content are hidden.
- Themed content appears only in its own category and `All Installed Challenges`.
- The season calendar returns correct windows for every category across five test years, including Western Easter.
- Every themed category with content is selectable all year.
- The featured event card appears only in season, respects overlap priority, and can be turned off.
- Predefined events can be started or copied to My Events, and skip games without content.
- Built-in and custom themed packs validate through the same rules, and the admin console can create, validate, filter, and duplicate them.
- Adding a new themed pack after the groundwork requires no code changes.
- All existing content lives in built-in pack folders, and with every pack available the home screen shows exactly the same games per category as before the split (section 19.6).
- Every game plays its rounds in random order for every pack, and prefers rounds not recently played (section 20).

---

# 18. Open Decisions

1. **Orthodox Easter.** Support an alternate Easter calculation as a setting, or Western only.
2. **Out-of-season default.** `themedCategoriesOutOfSeason` defaults to `show`; switch to `hide` if the category list gets crowded.
3. **Region list.** Start with `us`, `ca`, `uk`, or US only.
4. **Future categories.** Candidates not yet specced: Reformation Day, All Saints, Ascension as its own pack.

---

# 19. Pack Model and Core Split

## 19.1 Summary

All content, not only themed content, ships as **packs**. Today's evergreen content is split into a smaller **Core** pack and several other packs. Which packs are free and which are licensed is **decided later** (section 19.8); the split works the same either way.

## 19.2 Terms

| Term | Meaning | Examples |
|---|---|---|
| **Game** | A game type: rules, engine, and screens. Every game ships in every install. | `five-guesses`, `bible-timeline` |
| **Pack** | The unit of content that ships (and may later be licensed): a manifest plus content for one or more games | Core, Prophecy, Christmas |
| **Category** | A home-screen browsing filter | Core Bible Challenge, Prophecy, Christmas |
| **Session** | A titled set of rounds within one game's content | as today |

Renames required first, because "pack" currently means three different things:

| Today | Meaning today | Rename to |
|---|---|---|
| `ContentPackId`, `CONTENT_PACKS`, `CONTENT_PACK_IDS` (`App.tsx`) | Home-screen categories | `ContentCategoryId`, `CONTENT_CATEGORIES`, `CONTENT_CATEGORY_IDS` |
| `defaultContentPackId` (persisted setting) | Default category | `defaultContentCategoryId`, reading the old key as a fallback |
| `SessionPackBase` and the per-game data files (called "packs" in `SPEC.md`) | One game's content file | "game content file" (`GameContentFile`) |
| `CustomContentPack` | User-imported pack | unchanged |

## 19.3 Rules

1. **Games are always installed.** Packs only supply content.
2. **Each game's existing content belongs to exactly one pack.** A game's pre-split content is never divided across packs, so no game is "half locked."
3. **Themed and future expansion packs may add content for any game.** A Christmas owner can play `messiah-prophecy` with Christmas content without owning the Prophecy pack.
4. **A game with no available content** (no free, unlocked, or custom content) does not appear as a playable tile. It appears only inside the preview of a pack that contains it.
5. **Categories come from session tags**, not from the fixed game-to-category table. `GAME_CONTENT_PACKS` is removed after migration.

## 19.4 Built-In Pack Layout

Each built-in pack is a folder, which keeps today's per-game lazy loading:

```txt
src/data/packs/
  core/
    manifest.json
    games/
      five-guesses.json        (existing file, unchanged format)
      initials.json
      ...
  prophecy/
    manifest.json
    games/
      messiah-prophecy.json
      ...
  christmas/
    manifest.json               (themed: has categoryId)
    games/
      ...
```

```ts
interface BuiltInPackManifest {
  packId: string;
  packName: string;
  description: string;
  kind: "evergreen" | "themed" | "expansion";
  categoryId?: ThemedCategoryId;          // themed packs only
  accentColor: string;
  packVersion: number;
  games: Array<{ gameId: GameId; file: string }>;
  supportingFiles?: string[];             // e.g. word-ladder-dictionary.json
}
```

- Game content files keep their current format and schemas.
- Supporting data travels with the pack that uses it (`word-ladder-dictionary.json` goes with `word-ladder`).
- Loading: replace the hand-maintained dynamic `import()` table in `content.ts` (around line 125) with Vite's `import.meta.glob("../data/packs/*/games/*.json")` in lazy mode, so adding a pack or game needs no loader change.
- Licensed packs, once licensing exists, load through the main process instead (`content-licensing-spec.md`).

## 19.5 Proposed Split

A **proposal** to adjust before migration. The rule that matters is 19.3 (2): each game's existing content in exactly one pack.

| Pack | Games | Count |
|---|---|---:|
| **Core** | `five-guesses`, `initials`, `name-that-book`, `who-said-it`, `before-or-after`, `bible-timeline`, `odd-one-out`, `two-truths-and-a-lie`, `bible-anagrams`, `bible-connections`, `missing-word`, `complete-the-verse` | 12 |
| **Scripture Memory** | `scripture-puzzles`, `verse-scramble`, `reference-rush`, `relay-verse-build`, `verse-typing-race`, `bible-cryptogram` | 6 |
| **Psalms and Proverbs** | `wisdom-match`, `psalm-theme`, `proverb-categories`, `psalm-reference-finder` | 4 |
| **Prophecy** | `messiah-prophecy`, `fulfillment-finder`, `prophecy-match`, `prophecy-clue-ladder`, `prophecy-categories` | 5 |
| **Bible Explorer** | `chapter-finder`, `bible-books-relay`, `genealogy`, `parable-match`, `word-ladder` | 5 |

Criteria used for Core:

- Broad, kid-friendly appeal; the games most people think of as Bible trivia
- A variety of play styles (clue boards, typed answers, choices, ordering, grouping, word play)
- The games themed packs rely on most (Who Said It, Before or After, Two Truths and a Lie, Bible Anagrams, Missing Word, Complete the Verse)
- Coverage of every Phone Mode interaction type, so Phone Mode works fully with Core alone

Play statistics and the Popular category are **not** a criterion: current stats come from development testing.

## 19.6 Migration

1. Apply the renames in 19.2.
2. Move each existing game content file, unchanged, into its pack folder per 19.5. Create manifests.
3. Tag every existing session with the categories its game has today in `GAME_CONTENT_PACKS` (for example, every `initials` session gets `core`, `old-testament`, `new-testament`, `life-of-christ`).
4. Switch category browsing to session tags and remove `GAME_CONTENT_PACKS`.
5. Switch loading to the pack folders (19.4).

Migration tests (Layer 1 in `automated-testing-spec.md`):

- Session and round counts per game are identical before and after.
- With every pack available, each category shows exactly the same games as before.
- The play-through, determinism, and content solvability tests still pass.
- User-imported custom packs still load and appear under `custom`.
- A persisted `defaultContentPackId` setting is read correctly after the rename.

## 19.7 Existing Installs

- Until licensing is configured, every pack builds as free (19.8), so the split changes nothing for current users.
- When some packs become licensed, existing installs (currently family machines) receive a hand-issued license covering all packs, using the manual tools in `content-licensing-spec.md` section 7.4.
- **Automatic "legacy" unlocks are not recommended.** The app cannot sign licenses itself, so an automatic grant would require pack keys to ship inside the app, which defeats the encryption for everyone.

## 19.8 Free Versus Licensed

- Deferred. Any pack, evergreen or themed, may end up free or licensed.
- The decision lives only in the private licensing configuration (`content-licensing-spec.md` section 7.1). The pack model has no free/paid field.
- With no packs listed as licensed, the app behaves exactly as it does after migration: everything free.

## 19.9 Open Decisions

1. **Core list.** Confirm or adjust the 12 games in 19.5.
2. **Pack and category naming.** A pack named "Core" and the existing "Core Bible Challenge" category contain different sets of games, which may confuse users. Options: keep both names; rename the pack (for example "Essentials" or "Starter"); or rename the category.
3. **Bible Explorer.** Keep it as one pack, or merge its games into other packs?
4. **Expansion packs.** Whether future new evergreen content ships as updates to these packs or as separate expansion packs (`kind: "expansion"`).

---

# 20. Randomness

## 20.1 Goal

Play should never feel the same twice. Every pack (Core, themed, expansion, custom) is played in random order, and the app avoids repeating recently played rounds when it can.

## 20.2 Current Behavior (Kept)

Today the engine already randomizes play (`src/lib/gameEngine.ts`):

- Rounds from **all sessions** of a game are pooled (`pack.sessions.flatMap(...)`). Sessions are authoring groups, not play units.
- The pool is filtered by difficulty, shuffled, and the first N rounds are used (`pickGameRounds`).
- Within each round, choices, tiles, cards, timeline events, books, and statements are shuffled, and Initials picks a random subset of its clues.

The pack model keeps all of this unchanged.

## 20.3 Rules

1. **Always random.** There is no fixed-order play. No session or pack can force its rounds to play in authored order.
2. **Filter, then shuffle.** Category, session tags, `sequenceDay`, and difficulty narrow the pool **before** the shuffle. For example, during Advent the pool is Advent-tagged rounds, played in random order.
3. **Prefer rounds not recently played** (20.4).
4. **The one deliberate exception is Daily Challenge,** which is seeded by date so everyone gets the same puzzle that day (section 9). It does not use recently played avoidance.
5. **Test mode** uses a fixed seed (`automated-testing-spec.md` 4.2) so tests are repeatable. Normal play is never seeded.

## 20.4 Recently Played Avoidance

Shuffling alone can repeat a round from the previous game, which is most noticeable in smaller packs.

```ts
interface RecentRoundsStore {
  // key: `${gameId}|${categoryId}`
  entries: Record<string, string[]>;   // round IDs, most recent last
}
```

Selection for a game:

1. Build the filtered pool (20.3 rule 2).
2. Split it into **unseen** rounds (not in the recent list for this game and category) and **seen** rounds.
3. Shuffle the unseen rounds and take as many as needed.
4. If more are needed, fill from the seen rounds, **least recently played first**, then shuffle the final selection so seen rounds are not always at the end.
5. After the session starts, append the chosen round IDs to the recent list.

Limits:

- Each list keeps at most `pool size − rounds per session` IDs (minimum 0), so there are always enough unseen rounds for a full session. When the pool is no bigger than one session, avoidance does nothing and play is simply shuffled.
- Stored in userData as `recent-rounds.json`, separate from `app-settings.json` so it never affects settings compatibility. It is not synced or exported.
- Board games (`five-guesses`, `initials`) apply the same preference when choosing board cards.
- Settings: **Reset recently played** (clears the store). No other options.
- Round IDs that no longer exist (content removed or changed) are ignored and pruned.

## 20.5 Testing

- With a fixed seed, a second session prefers rounds not used in the first when the pool allows.
- With a pool equal to one session, every session uses the full pool in shuffled order.
- Tag filtering: with Advent active, only Advent-tagged rounds are selected, in shuffled order.
- Daily Challenge output is identical for the same date regardless of recently played history.
- A missing, empty, or corrupt `recent-rounds.json` falls back to plain shuffling without error.
