# Admin Console — Additional Features Spec

## Status

Not started for the net-new items. This is a planning/discovery document, not a
finished design — several items below already exist in some form in
`bible-challenge-admin` (a sibling repo at `../bible-challenge-admin` relative to this
one) and just need UI exposed; others are genuinely new work needing their own design
decisions before implementation. Each section says which is which.

## Requested items (as given)

1. Reset all local ratings.
2. Clear/import/export app settings.
3. Manage feedback endpoint/form ID.
4. Manage custom content packs.
5. Projector preview: preview how a round will look in projector mode.
6. Admin password/lock: keep editing tools away from players during gameplay.
7. Study Notes Editor (dedicated view, missing-notes report, richer note fields,
   leader-only vs. player-facing split).
8. Content Library Manager (full CRUD across all rounds, bulk edit, search/filter).

---

## 1. Reset all local ratings — mostly exists, needs a UI location decision

Already implemented: `clearRatings()` IPC handler (`bible-challenge-admin/electron/main.js:495-497`,
reads the whole shared `app-settings.json`, zeroes only `challengeRatings`, writes the
rest back untouched) and a "Clear Ratings" button in the admin console's Stats & Ratings
tab (`src/renderer/App.tsx:434-533`, `StatsTab` component, wired at line 475).

**What's actually left**: nothing functionally — this item may already be satisfied by
the existing Stats & Ratings tab. Worth confirming with the user whether "reset all
local ratings" meant something distinct from the existing per-installation
`challengeRatings` reset (e.g. did they mean the in-app star ratings on challenge cards,
or something else like per-round difficulty ratings that don't exist yet?) before
assuming this is done.

## 2. Clear/import/export app settings — partially exists, "import/export" is new

**Exists**: `clearStats()`/`clearRatings()` already clear specific keys of the shared
`app-settings.json` blob (`electron/main.js:491-497`). There is no generic "clear all
app settings" action, and no import/export of the settings file at all today.

**New work needed**:
- An **export** action: read the current `app-settings.json` (via a new IPC handler,
  e.g. `app-settings:export`, or by extending the existing `readAppSettings`-based
  handlers) and let the admin write it to a chosen location via `dialog.showSaveDialog`
  (mirrors the existing `dialog.showOpenDialog` pattern already used for custom-content
  import, `electron/main.js:511-553`).
- An **import** action: `dialog.showOpenDialog` for a JSON file, validate its shape
  (open question: how strictly? `app-settings.json` is currently unvalidated opaque
  JSON on the main app's side too — `readAppSettings`/`writeAppSettings` in the main
  app's `electron/main.js` do zero shape checking. The admin console could add real
  validation here as the first place that ever does, or continue the existing
  "trust the blob" convention. Recommend adding at least a minimal sanity check —
  reject anything that isn't a JSON object — before writing over the live file the
  main app depends on, since this file also contains all of the main app's
  live-gameplay settings, not just admin-managed data), then write it via
  `writeAppSettings`.
- A **clear all settings** action (distinct from clear-stats/clear-ratings): needs a
  decision on what "clear" means here — reset to the main app's defaults (requires the
  admin console to know or duplicate the main app's `cleanAppSettings`/default-value
  logic, `App.tsx:1588-1635` in the main app), or simply delete `app-settings.json`
  entirely and let the main app's own load-time fallback logic regenerate defaults on
  next launch (simpler, reuses existing behavior, recommended)?
- **Risk to flag explicitly**: `app-settings.json` holds the main app's live-session
  config (players, teams, timers, theme, event definitions) alongside the
  admin-managed data (`gameStats`, `challengeRatings`, `feedbackEndpoint`). An
  import/export/clear-all feature touches ALL of that, not just the admin's slice —
  unlike the existing narrow `clearStats`/`clearRatings` handlers, which were
  deliberately scoped to touch only their one key each. This item needs an explicit
  decision on scope: does "clear/import/export app settings" mean the whole blob
  (including a player's timer preferences and team setup), or should it be redefined
  to only cover the admin-managed subset? Recommend asking the user this directly
  before implementing, since the naming ("app settings") suggests everything but the
  existing precedent in this console leans toward narrow, single-purpose actions.

## 3. Manage feedback endpoint/form ID — IPC exists, UI does not

**Exists**: `getFeedbackEndpoint()`/`setFeedbackEndpoint()` IPC handlers
(`electron/main.js:499-505`) already read/write the `feedbackEndpoint` key of the
shared settings blob using the same narrow read-whole/mutate-one-key/write-whole
pattern as stats/ratings. `window.adminHost.getFeedbackEndpoint`/`setFeedbackEndpoint`
are already exposed in `electron/preload.js`.

**What's missing**: there is no UI anywhere in `bible-challenge-admin/src/renderer/App.tsx`
that calls these — they were built (per the original admin-console plan) but never
wired to a visible settings field. This is a small, low-risk addition: a text input +
save button in a settings/config area of the admin console (there is currently no
generic "Settings" tab in the admin console at all — only Content, Stats & Ratings,
and Updates, per `TABS` in `App.tsx:9-13` — so this needs either a new tab or a section
within an existing one).

The main app's existing `DEFAULT_FEEDBACK_ENDPOINT` / Forminit-vs-Getform
allow-listing logic (`cleanFeedbackEndpoint`, main app's `App.tsx:1526-1549`) validates
the endpoint is an HTTPS Forminit or legacy Getform URL before accepting it — the admin
console's new UI should apply the same validation before calling `setFeedbackEndpoint`,
so an admin can't accidentally point the main app's feedback form at an arbitrary
untrusted URL. "Form ID" specifically (as opposed to the full endpoint URL) isn't a
separate stored value anywhere today — `FORMINIT_FEEDBACK_FORM_ID` is just the last
path segment of the constant `DEFAULT_FEEDBACK_ENDPOINT` in the main app
(`App.tsx:216-217`) baked into a URL, not a separately configurable field. Worth
clarifying with the user whether they want the admin console to manage the endpoint as
one URL field (matches what's already there) or split it into host/form-ID parts.

## 4. Manage custom content packs — exists today via the Content tab

**Exists in full**: the admin console's Content tab (`ContentTab`, `App.tsx:54-...`)
already does create/list/remove for whole packs, and add/remove for individual rounds
within a pack's game sections, via the full custom-content IPC surface
(`custom-content:list/choose-json/save/remove`). This is the feature built in the
original admin-console work.

**Possible gap**: "manage" could imply pack-level metadata editing (renaming a pack,
changing its `accentColor`) which isn't exposed today — `PackEditor`
(`App.tsx`) lets you add game sections and rounds but has no rename/recolor action.
Small, low-risk addition if wanted; confirm with the user whether this is actually a
gap or whether existing create/list/remove covers what they meant.

## 5. Projector preview — new, needs a decision on what "projector mode" means

This depends entirely on the separate **projector-window spec**
(`temp/projector-window-spec.md`, written earlier), which is itself unresolved — the
main app's current "Projector" is a same-window CSS toggle
(`DisplayMode`/`app-display-projector`, main app's `App.tsx:152`), and the user has
asked for it to become a genuinely separate full-screen window. **Do not build a
projector preview in the admin console until the projector-window spec's open
questions (display selection, state sync, rendering approach) are resolved** — a
preview built against the current CSS-toggle behavior would need to be redone once
that feature changes shape, and a preview built against the *future* second-window
behavior can't be accurately mocked without knowing how that window renders.

Once the projector feature's shape is settled, "preview a round" in the admin console
most plausibly means: render one of the admin's per-game `<...View>` components (or
whatever component ends up serving the stage window) in a small embedded frame styled
with the projector CSS/mode, using a round the admin is currently editing as sample
data — this reuses the schema-driven round data the content editor already holds, so
no new content-loading work, just a rendering surface. Flag as blocked on the
projector-window design, not a standalone task.

## 6. Admin password/lock — new, and it's about the admin console itself, not the main app

Read literally ("keep editing tools away from players during gameplay"), this is about
preventing a curious player from opening the *admin console app* (or its content
editor specifically) during a game night — since all editing tools now live in
`bible-challenge-admin`, not the main game app, this is a lock on the admin console's
own launch or its Content tab, not a change to the main game app at all. Confirm this
reading with the user before designing, since "during gameplay" could also imply the
admin console needs to *know* when the main app has a session in progress (which would
require some communication between the two separate apps that doesn't exist today —
see the admin-console spec's discussion of the two apps only sharing state via the
`app-settings.json` file on disk, no live IPC between them).

Open design questions once the target is confirmed:
- **Scope of the lock**: gate the whole admin console app at launch (a PIN/password
  screen before `createWindow()`'s content loads), or just the Content tab specifically
  (Stats/Updates stay open, only editing is gated)?
- **Where is the password stored/set**: a new field in the shared `app-settings.json`
  (simple, but means the main app's settings file now also holds an admin-console-only
  secret — a boundary-crossing concern similar to item 2's scope question above), or a
  separate small file under the admin console's own `userData` (cleaner separation,
  but the admin console's `userData` is the *same* folder as the main app's, per the
  `app.setName("Bible Challenge")` sharing design — so "separate file" still means
  "another file in the same shared folder," not true isolation)?
- **Threat model**: this is explicitly not meant to be robust security (a local kid
  poking around, not an actual access-control system) — recommend a simple stored PIN
  compared in the renderer or main process, no hashing/crypto complexity, and say so
  explicitly in the eventual implementation so nobody over-engineers it.
- **Recovery**: what happens if the PIN is forgotten? A "reset by deleting a file"
  escape hatch is probably sufficient given the low-stakes threat model — worth stating
  outright rather than building a recovery flow.

## 7. Study Notes Editor — new, and the "leader-only vs. player-facing" split needs a schema change

**Current state**: every one of the 28 games' round schemas has exactly one note
field, `teachingNote` (a single required string, always shown to whoever the main app
displays study notes to — there is no player/leader distinction anywhere in any
schema). This is defined once per game in `../Personal/src/data/schemas/*.schema.json`
(vendored into the admin console per its schema-sync process,
`bible-challenge-admin/scripts/sync-schemas.mjs`).

**What's requested, broken into concrete pieces**:
- *Dedicated view for teaching notes*: new — today, `teachingNote` is edited as just
  one more field in the per-round `SchemaForm` (`bible-challenge-admin/src/renderer/components/SchemaForm.tsx`)
  alongside every other field. A "Study Notes Editor" as its own view implies a
  cross-game, cross-pack listing focused only on the notes field(s) — this needs the
  same underlying cross-pack round index that item 8 (Content Library Manager) needs,
  so these two features share a real dependency: **neither is fully buildable without
  first building some kind of "all rounds across all packs, indexed and searchable"
  layer that does not exist today** (today's admin console only ever looks at one pack
  and one game section at a time, per `PackEditor`/`GameSectionEditor`). Recommend
  treating this shared indexing layer as its own first implementation step feeding both
  item 7 and item 8, not building it twice.
- *"Records missing teaching notes"*: a report needs `teachingNote === ""` (or missing)
  to be a valid, detectable state — but the JSON Schemas currently REQUIRE
  `teachingNote` with `minLength: 1` on every round (confirmed in, e.g.,
  `complete-the-verse.schema.json`), meaning a round with no teaching note is
  currently *invalid content*, not a valid-but-incomplete one. Either (a) this report
  only ever finds zero results against schema-valid content (the schemas already
  enforce non-empty notes, so nothing would ever be "missing" in valid data — making
  the report only useful for catching content that somehow bypassed validation), or
  (b) the schemas need to change to make `teachingNote` optional so "missing" becomes
  a real, expected state authors can leave incomplete and come back to. This is a
  real decision to bring back to the user: **does "missing teaching notes" mean truly
  absent (requires loosening 28 schemas in the main app), or does it mean something
  else** (e.g. notes that are present but too short/generic, which is a content-quality
  heuristic, not a schema question)?
- *Scripture context, discussion prompts, follow-up questions*: these are three
  distinct new fields beyond the current single `teachingNote` string. This is a
  **schema change across all 28 games in the main app repo** (not just the admin
  console) — new optional fields like `scriptureContext`, `discussionPrompts` (likely
  `string[]`), `followUpQuestions` (likely `string[]`) would need to be added to every
  round schema, the main app's `src/types/gameData.ts` interfaces, and — if the main
  app is meant to ever *display* these to players/hosts, not just store them — the
  main app's per-game View components and study-note modal
  (`getStudyNoteContent`/`StudyNoteContent`, main app's `App.tsx:865-882`). Scope
  question for the user: are these fields purely for the admin/host's own reference
  (stored, editable, but never rendered to players), or do they need to appear
  somewhere in the main app's actual gameplay UI? The former is a much smaller change
  (schema + admin UI only); the latter touches the main app's rendering layer for
  every game.
- *Leader-only vs. player-facing notes*: this is the same kind of schema-widening
  question as above — today there is one note field with one audience. Splitting it
  into two (e.g. `teachingNote` stays player/host-facing as today, plus a new optional
  `leaderNote` never shown to players) is a schema change with the same "which 28
  files, which types, does the main app need to gate visibility anywhere" scope as the
  discussion-prompts item. Recommend batching all of items 7's new-field asks into one
  schema-migration pass across the main app rather than four separate ones, if the
  user confirms these are wanted, since they're all "add an optional field to every
  round schema" changes of the same shape.

**Recommended sequencing**: build the cross-pack round-indexing layer first (shared
with item 8), ship a first version of the Study Notes Editor against the *existing*
single `teachingNote` field (dedicated view + a "short/likely-generic note" heuristic
report, since true "missing" isn't representable without a schema change), then treat
the new fields (scripture context, discussion prompts, follow-ups, leader-only split)
as a separate, explicitly-scoped follow-up once the user confirms which fields are
wanted and whether they're ever player-visible.

## 8. Content Library Manager — new, the largest item, and it changes the admin console's core architecture

**Current architecture, for contrast**: the admin console today is pack-scoped —
`ContentTab` lists packs, `PackEditor` shows one pack's game sections, `GameSectionEditor`
shows one game's rounds within that pack, and the schema-driven `SchemaForm` edits one
round at a time. There is no view of "all rounds of game X across every pack" or "every
round anywhere with theme Y," and no bulk-edit capability at any level (each round save
is an individual `saveCustomContentPack` IPC call touching one whole pack file, per
`electron/main.js`'s `writeCustomContentPack`).

**What's requested, broken into concrete pieces**:
- *Create/edit/delete questions, rounds, clues, answers, aliases, study notes*: create
  and delete already exist per-round within a pack/game section (`GameSectionEditor`'s
  "Add Round"/"Remove" — confirmed directly against `bible-challenge-admin/src/renderer/App.tsx`).
  Edit-in-place of an *existing* round does NOT exist today — confirmed by inspection,
  there is no "Edit" action anywhere in the file, only add-new and remove-whole.
  Adding true edit-in-place (open an existing round's data back into `SchemaForm`,
  validate, save in place) is a
  moderate, well-scoped addition using components that already exist.
- *Assign difficulty, time category, content pack, theme, scripture reference*:
  difficulty/theme/scripture-reference-equivalent fields already exist per-game in most
  schemas (field names vary by game — e.g. `theme`, `difficulty`, `reference` — the
  schema-driven form already surfaces whatever fields a given game's schema defines,
  so this is largely already covered by the existing generic form renderer). "Time
  category" doesn't map to any existing field in any of the 28 schemas — clarify with
  the user what this means (a timer-preset tag per round? A duration estimate?) before
  assuming it needs a new field. "Content pack" assignment (moving a round between
  packs, or duplicating it into another pack) is genuinely new — today a round lives in
  exactly the pack/game-section it was created in, with no move/copy action.
- *Bulk edit difficulty/content pack*: entirely new. Requires: (a) a multi-select UI
  over a list of rounds (doesn't exist — today's UI shows one round's fields or one
  pack's round list, never a selectable table), (b) a batch-write path (today every
  save round-trips through `saveCustomContentPack`, which writes one whole pack file —
  a bulk edit across multiple packs would mean multiple such round-trips, one per
  affected pack, which is fine functionally but should be designed as an explicit
  "apply to N packs" operation with a clear success/failure report per pack, not a
  silent loop that can partially fail with no visibility).
- *Search/filter by book, topic, game type, difficulty, missing study notes*: this is
  the feature that most directly requires the cross-pack indexing layer named in item
  7 — "book" and "topic" aren't literal field names in most schemas (closest
  equivalents vary by game: `theme`, `reference`, `category` depending on the game),
  so search/filter needs either (a) a per-game mapping of "which field(s) count as
  book/topic for this game" (more accurate, more upfront mapping work across 28
  games), or (b) a generic full-text search across all of a round's string fields
  (simpler to build, less precise, may return false positives on unrelated fields).
  Recommend (b) as a first version — full-text search across all fields plus explicit
  filters for the fields that ARE common across every schema today (`difficulty`
  always exists; `theme` exists on nearly every game per the SPEC.md reference table
  in the main app) — with book/topic-specific filtering as a possible refinement once
  real usage shows it's needed.

**This item is the one most likely to warrant being split into its own dedicated
planning pass** (separate from this discovery doc) given its size: it effectively asks
for a new cross-pack data layer, a new list/table UI paradigm (vs. today's
single-pack-at-a-time editor), a bulk-write operation with its own error-handling
model, and a search/filter system — each of which is a real design surface on its own.
Recommend treating "build the cross-pack round index + a basic searchable list view"
as a first, smaller milestone, then layering bulk-edit and richer filters on top once
that foundation exists and is validated against real usage.

---

## Cross-cutting observations

- **Shared foundation**: items 7 and 8 both need a cross-pack "all rounds, indexed"
  layer that doesn't exist today. Building it once, shared by both features, is very
  likely the right sequencing — building two separate ad hoc indexes would duplicate
  work and risk drift.
- **Schema-widening risk**: several asks (missing-notes detection as a real state,
  scripture context / discussion prompts / follow-ups, leader-only notes, "content
  pack" as an assignable field, "time category") imply changing the *main app's*
  round schemas — a cross-repo change, not something containable inside the admin
  console alone. Every such change needs: (1) the main app's schema file(s) updated,
  (2) `src/types/gameData.ts` interfaces updated, (3) `scripts/validate-data.mjs`
  updated if new required/optional fields need validation, (4) the admin console's
  vendored schema copies re-synced (`npm run sync-schemas`), and (5) a decision on
  whether the main app's own UI needs to change to ever show the new data to players/
  hosts. Recommend batching these into one deliberate schema-migration pass, agreed
  with the user up front, rather than drifting into it piecemeal across items 7 and 8.
- **`app-settings.json` blast radius**: items 1, 2, 3, and 6 (ratings, settings
  import/export, feedback endpoint, and — if stored there — an admin PIN) all touch
  the one shared, unvalidated `app-settings.json` blob that also holds every one of
  the main app's live-gameplay settings. The existing convention (narrow,
  single-key-scoped IPC handlers) has served items 1 and 3 well; item 2's "import/
  export/clear all settings" framing is the one place that conflicts with that
  convention by nature, and needs an explicit scope decision (whole blob vs.
  admin-managed subset) before building.
- **Suggested build order** if all of these are picked up together: (a) items 1, 3, 4
  are already mostly done — wire up the missing UI pieces first as quick wins; (b) item
  6 (admin lock) next, since it's small, self-contained, and worth having before more
  editing surface area is added; (c) item 2 (settings import/export), once its scope
  question is answered; (d) the shared cross-pack indexing layer, then item 8's basic
  list/search view; (e) item 7's dedicated notes view, reusing the indexing layer;
  (f) any schema-widening sub-asks from items 7/8, as one batched migration; (g) item 5
  (projector preview), only once the separate projector-window feature's design
  questions are resolved.

## Explicitly out of scope for this document

- Any actual code changes.
- Final answers to the open questions raised above (schema-widening scope, "app
  settings" clear/import/export scope, admin-lock storage location, "time category"
  meaning, book/topic filtering precision) — these should go back to the user via
  `AskUserQuestion` in the actual planning pass for whichever item(s) are picked up
  next, the same way prior admin-console and games work in this project resolved
  comparable decisions.
