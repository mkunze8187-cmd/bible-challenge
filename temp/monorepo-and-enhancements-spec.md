# Monorepo Migration + Suggested Enhancements

## Status

Not started. This is a discovery/decision document, not a finished implementation
plan — the monorepo migration section names a concrete recommendation and a rough
shape, but still needs an `EnterPlanMode` pass to nail down exact tooling (npm
workspaces vs. two independent `package.json`s in subfolders) before implementation.
The enhancements section is a set of suggestions, not commitments — each would need
its own scoping (and likely its own `AskUserQuestion`/plan pass for anything beyond
the smallest items) before being built.

---

## Part 1: Should the admin console move into this repo?

### The question as asked

"Can the admin app reside in the same repo? Especially since the two apps will be
sharing a single app-settings file?"

### Answer: yes, and it's worth doing

**What repo-locality does NOT affect** (already true regardless of repo layout): the
two apps share `app-settings.json` purely through the filesystem — both resolve the
same Electron `userData` folder because the admin console's `electron/main.js` calls
`app.setName("Bible Challenge")` (matching this app's `productName`) before touching
`app.getPath("userData")`. That mechanism is completely independent of git history;
merging repos would not change how the *running* apps talk to each other, and keeping
them separate does not put that sharing at risk. Packaging is also unaffected either
way — two separate NSIS installers are produced regardless of repo layout, since
electron-builder has no supported path to one installer for two independent Electron
apps (documented in the admin-console's own plan/spec history).

**What repo-locality DOES affect** (the real arguments for merging):

1. **Schema duplication and staleness risk.** The admin console currently *vendors*
   (copies) all 28 games' JSON Schemas from this repo via a manual sync script
   (`bible-challenge-admin/scripts/sync-schemas.mjs`, run as
   `npm run sync-schemas -- --source ../Personal`) plus a checksum-based staleness
   detector (`verify-schemas-fresh.mjs`) that must be run by hand before every release.
   This was a deliberate tradeoff at the time — reading the main app's schemas
   *directly* from a separate repo's checkout would make the admin console fail to
   build standalone unless that other repo happened to be checked out at an assumed
   relative path on every machine, which is a worse, silent failure mode than
   staleness. **In one repo, this tradeoff disappears entirely**: both apps can
   `import`/read the literal same `src/data/schemas/*.schema.json` files with no
   copying, no sync script, no staleness possible by construction.
2. **Duplicated TypeScript types.** The admin console hand-maintains its own copies of
   shared shapes that must match the main app exactly — `GameId` (vendored into
   `bible-challenge-admin/src/types/gameData.ts`), and `GamePlayStats`/`ChallengeRating`/
   `StatsAndRatings` (hand-written in `bible-challenge-admin/src/lib/statsTypes.ts` to
   mirror the main app's `src/renderer/appTypes.ts`). One repo means one source of
   truth for these, imported by both apps, with the compiler catching drift instead of
   a human needing to notice it.
3. **Version drift.** Building the admin console already surfaced a real instance of
   this: the two `package.json` versions had drifted (main app 0.1.4, admin console
   0.1.0) before the release-orchestration script's version-match assertion caught it.
   One repo with one version number (or a single version-bump commit touching both
   subfolders) removes this failure mode at the source rather than relying on an
   assertion to catch it after the fact.
4. **Cognitive/workflow locality.** Given the two apps are permanently coupled — same
   settings file, same schemas, same release cadence (per the existing "one release
   with two installers, versions must match" design) — treating them as one product
   with two entry points is a more honest reflection of that coupling than two
   independently-versioned repos that happen to depend on each other.

**Recommended shape**: `Personal` becomes the root of both. A layout like:

```
Personal/
  apps/
    game/          (today's root-level electron/, src/, etc. — move, don't rewrite)
    admin/         (today's bible-challenge-admin contents)
  packages/
    schemas/       (or: keep schemas at src/data/schemas/ under apps/game/, and have
                     apps/admin import them via a relative path or a small shared
                     package — pick based on how npm workspaces are set up)
```

or, more conservatively (less restructuring of the existing, working main-app layout):

```
Personal/
  (today's root-level game app, unchanged)
  admin/          (bible-challenge-admin's contents, moved in as a sibling folder)
```

The second option is likely the pragmatic choice: it avoids reshuffling the main app's
already-working `src/`/`electron/` layout (which every existing script, test, and this
project's SPEC.md already reference by their current paths) and only asks the admin
console to relocate. **This needs an explicit decision during the real planning pass**:
how much of the main app's existing structure is worth disturbing for a "cleaner"
monorepo layout versus doing the minimum-disruption move.

**Tooling**: npm workspaces (`"workspaces": ["admin"]` in a root `package.json`, or
keeping two fully independent `package.json`s in subfolders and just not deduplicating
`node_modules`) is the natural fit — needs a decision on which, since it changes how
`npm install`, `npm run <script>`, and CI/local scripts are invoked (workspace-scoped
`npm run build -w admin` vs. `cd admin && npm run build`).

**Migration mechanics** (once shape/tooling are decided): `git mv` or plain file-move
the admin console's tracked files into the chosen subfolder, preserving its git
history if that matters (a subtree merge or `git filter-repo`-based history import can
carry the admin console's existing 3 commits into the monorepo's history rather than
starting it fresh as an unattributed folder — worth doing if the history has value,
skippable if not). Delete `sync-schemas.mjs`/`verify-schemas-fresh.mjs` and their
generated `games.json`/`schemas.checksum.json` once the admin console reads the real
schema files directly. Update the admin console's `content.ts`/`formRenderer.ts`
imports to point at the shared location. Update the release-orchestration script
(`release-scripts/build-release.mjs`) to build both apps from one checkout instead of
two.

**What stays the same**: `app.setName("Bible Challenge")`, the narrow
read-whole/mutate-one-key/write-whole IPC pattern for shared settings, two separate
NSIS installers, one GitHub Release with two assets, the version-match convention (now
enforceable more simply — one version number, no assertion needed if both apps read it
from the same root `package.json` or a shared version file).

---

## Part 2: Suggested enhancements

Grouped by app, roughly in order of how self-contained/low-risk they are. None of
these are committed work — each is a suggestion worth considering, and the larger ones
would want their own `AskUserQuestion`/plan pass before implementation.

### Game app

1. **Session/game history log.** Today `GamePlayStats` (main app's
   `src/renderer/appTypes.ts:30-43`) tracks only aggregates per game — total plays,
   best score, last-played timestamp — with no record of individual sessions (who
   played, what they scored, when, in what mode). A simple append-only local history
   (e.g. a capped list of `{gameId, timestamp, participantMode, standings}` entries,
   persisted the same way `gameStats`/`challengeRatings` already are, inside
   `app-settings.json` or a new sibling file) would make a family's play history much
   more visible, and gives the admin console's Stats tab something richer to show than
   aggregates alone. Natural pairing with the admin console's existing Stats & Ratings
   tab.
2. **In-app single-round content preview/test.** Now that the admin console can create
   and edit rounds for all 28 games, there's no way to actually *see* a freshly-authored
   round rendered by the real game UI before using it in a live session — an admin has
   to trust the schema-driven form's field values are sane. A "test this round" action
   (launch the main app, or a lightweight preview mode within it, showing one round in
   its real `<...View>` component with no scoring/turn consequences) would close that
   loop. This is a natural building block for (and possibly should be unified with) the
   admin console's already-requested "projector preview" feature, per
   `temp/admin-console-features-spec.md` — recommend designing them together rather
   than as two separate preview mechanisms.
3. **Per-game difficulty-distribution report.** Several games' starter content batches
   (documented honestly in SPEC.md's per-game notes) have uneven easy/medium/hard
   splits depending on how they were authored (hand-written vs. generator-script-filled).
   A small script (or, longer-term, a admin-console content-library view per
   `temp/admin-console-features-spec.md`'s Content Library Manager section) reporting
   each game's actual difficulty distribution would help keep future content additions
   balanced, and is a natural fit once that Content Library Manager's search/filter
   layer exists.

### Admin console

4. **A dedicated Settings tab.** Feedback-endpoint management already has full IPC
   support (`getFeedbackEndpoint`/`setFeedbackEndpoint`,
   `electron/main.js:499-505`) but no UI — flagged already in
   `temp/admin-console-features-spec.md` item 3 as a quick win. Listed again here
   because it's small, already-scoped, and worth doing early regardless of what else
   from that spec gets picked up.
5. **In-app content validation surface.** Right now, confirming a custom content pack
   is schema-valid happens implicitly at save time (`validateGameRounds` in the admin
   console's `src/lib/content.ts` runs Ajv against the same vendored schema before
   writing) — but there's no way to see a full validation report across an entire pack
   or across all packs at once, the way the main app's `npm run check:data` does for
   its own bundled content. A "Validate All" action in the admin console (walk every
   pack's every round through the same Ajv compile+validate the individual-round save
   path already uses, surface a report) would let an admin catch problems without
   dropping to a terminal — useful on its own, and especially valuable once bulk-edit
   (from the Content Library Manager spec) exists and can touch many rounds at once.
6. **Backup-before-write for custom content saves.** `writeCustomContentPack`
   (`electron/main.js`) overwrites a pack's JSON file directly on every save, with no
   versioning or backup — a bad bulk-edit or a mistaken pack-level change has no undo
   path today. A cheap mitigation: keep the last N versions of each pack file (e.g.
   `<packId>.json.bak-1` rotating, or a numbered `.history/` subfolder under
   `custom-content/`), or at minimum a single `.bak` written before every overwrite.
   This becomes more important, not less, once bulk-edit ships (per the Content
   Library Manager spec) — recommend building this before or alongside bulk-edit
   rather than after, since bulk-edit is exactly the kind of operation most likely to
   need an undo.

## Suggested sequencing across everything currently in `temp/`

Given the full set of in-flight specs (`admin-console-features-spec.md`,
`projector-window-spec.md`, `before-or-after-randomization-spec.md`, and this one),
a reasonable order, cheapest/most-isolated first:

1. `before-or-after-randomization-spec.md` — small, isolated, verified bug fix.
2. This spec's items 4–6 (admin console quick wins: Settings tab, validation surface,
   backup-before-write) — small, no cross-repo schema changes, no open design
   questions blocking them.
3. The monorepo migration (this spec's Part 1) — worth doing before the Content
   Library Manager / Study Notes Editor work in `admin-console-features-spec.md`,
   since those features will touch schemas across both apps repeatedly, and doing that
   inside one repo (no vendoring/sync step) is meaningfully less friction than doing it
   across two.
4. `admin-console-features-spec.md`'s items 1/3/4 UI wiring, then item 6 (admin lock),
   per that spec's own suggested build order.
5. The cross-pack indexing layer + Content Library Manager + Study Notes Editor (the
   largest remaining items), once the monorepo move and any agreed schema-widening are
   settled.
6. `projector-window-spec.md`'s open questions, then the admin console's projector
   preview (item 5 of `admin-console-features-spec.md`), which is explicitly blocked
   on the projector window's design landing first.
7. Game-app enhancement items 1–3 from this spec, opportunistically alongside whichever
   admin-console work they naturally pair with (session history pairs with Stats tab
   work; content preview pairs with projector preview; difficulty reporting pairs with
   the Content Library Manager's search/filter layer).

## Explicitly out of scope for this document

- Any actual code changes or repo restructuring.
- A final decision on npm-workspaces-vs-independent-package.json, or on how much of
  the main app's existing layout to disturb during the monorepo move — these are named
  as open questions for the real planning pass, not decided here.
- Committing to build any of the "suggested enhancements" — they are suggestions, not
  a backlog the user has approved.
