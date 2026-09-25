# Agon Modular Game Platform & Distribution Architecture

## Purpose
Prevent Agon's installed footprint and implementation complexity from growing roughly linearly with every new game. Evolve Agon from a collection of separately implemented games into a **modular game platform** where games and variants are primarily definitions composed from shared engines, UI components, content, assets, and capability adapters.

This architecture must make the next 50 games materially cheaper and smaller than the first 30 while preserving offline use, Agon's visual identity, responsive surfaces, persistence, accessibility, and game-specific creativity.

## Core principles
1. **Reuse before implementation.** If a mechanic exists, games consume it rather than reimplement it.
2. **Configuration before code.** A new game/variant that can be expressed with existing engines should require a manifest/config/content rather than a new runtime implementation.
3. **Novel mechanics remain possible.** Wayfinder-style maze generation or other truly unique mechanics can ship as modular engine/plugins without contaminating Core.
4. **Content is not game code.** Bible questions, verses, clues, mappings and references are reusable content objects.
5. **Assets are shared by semantic identity.** Do not duplicate the same icons/backgrounds/audio/animations in multiple games.
6. **Variants are overlays.** Kids/Expert/Wheel/Gauntlet/Event variants should not fork an entire game implementation.
7. **Load what is needed.** Optional engines, games, media and content should be lazy-loadable/installable where platform technology permits.
8. **Offline remains first-class.** Downloadable packs remain locally usable after installation.
9. **Deterministic/versioned sessions.** Manifests, engines, content and asset dependencies needed by a saved session are version-aware and recoverable.
10. **No gambling/betting features.** Modular randomizers must not enable prohibited wagering semantics.

---

# Layered architecture

## 1. Agon Core
Keep the always-installed/runtime-critical layer small and stable:
- app bootstrap/shell
- routing/navigation
- identity/team/session primitives
- game runtime/orchestrator
- capability registry
- package/manifest registry
- persistence/versioning/migrations
- scoring ledger
- Event/Tournament orchestration interfaces
- controller/Host/Main Stage/Admin projection transport
- accessibility/localization foundations
- theme/design tokens
- asset resolver
- content resolver
- seeded RNG service
- diagnostics/telemetry hooks where enabled

Core should not contain game-specific questions, large media packs, or duplicate mechanic implementations.

## 2. Shared mechanic engines
Examples:
- Challenge
- Card/Tile/Deck
- Ordering/Sequence
- Match/Grouping
- Progressive Clue
- Reveal
- Timer
- Buzzer/lockout
- Dice
- Spinner/Wheel
- Casting Lots
- Bible Navigation/Reference
- Maze/Path if generalized later
- Tournament/Event adapters
- Gauntlet orchestration/adapters

Each engine exposes a versioned contract and reusable projections rather than importing individual games.

## 3. Shared Agon UI component library
Reusable responsive components across Main Stage, Player Controller, Host Remote and Admin where appropriate:
- `AgonChallengePanel`
- `AgonTeamBadge`
- `AgonCard` / `AgonTile`
- `AgonTimer`
- `AgonBuzzerStatus`
- `AgonDice`
- `AgonSpinner` / `AgonWheel`
- `AgonAnswerReveal`
- `AgonScoreDisplay`
- `AgonStage`
- `AgonCourse`
- `AgonBracket`
- `AgonProgressMarker`
- standard dialogs/panels/forms
- responsive shell/layout primitives

Components use Agon design tokens and semantic variants. Games should not copy CSS/components simply to alter labels or imagery.

## 4. Game definitions
Most games should become declarative `GameDefinition` packages interpreted by the Game Runtime.

Conceptual schema:
```yaml
id: before-after
version: 1
metadata:
  name: Before or After
  family: chronology
capabilities:
  players: { min: 1, max: 4 }
  tournament: false
  gauntletStage: true
mechanics:
  - challenge: chronology
  - response: binary-choice
challengeRequirements:
  contentTypes: [bible-event]
randomizers:
  default: seeded-selection
scoringPolicy: standard-challenge
roundPolicy: configured-rounds
difficultyPolicy: standard
projections:
  mainStage: before-after
  playerController: binary-choice
  host: standard-challenge-host
persistencePolicy: challenge-session-v1
assetDependencies:
  - agon.core.ui
variants:
  - id: chronology-wheel
    overlay: variants/before-after-wheel.yaml
```

The actual implementation may use JSON/TypeScript/etc.; schema above is illustrative.

### Definition requirements
A definition declares rather than owns:
- metadata/catalog information
- player/team capabilities
- mechanic engine dependencies
- challenge/content requirements
- randomizer policy
- scoring/round/difficulty policy
- projections/components
- Host capabilities
- Tournament/Event/Gauntlet capabilities
- persistence contract/version
- asset/content dependencies
- variants

Definitions are schema-validated at build/install time and again defensively at runtime.

## 5. Variant overlays
A variant contains only differences from its base game. Examples:
- Before or After + chronology wheel
- Kids difficulty/presentation profile
- Expert typed-answer mode
- Gauntlet compact adapter
- Event-specific round policy

Overlay resolution must be deterministic and validated. A variant cannot silently replace unrelated base rules. Persist base definition version + ordered overlay IDs/versions in saved sessions.

## 6. Content packs
Separate reusable Bible content from mechanics.

Content objects may contain:
- canonical IDs
- Scripture references
- translation/profile metadata
- question/prompt
- accepted answers/normalization
- difficulty
- category/tags
- learning objectives
- age/content profile
- explanation/review text
- relationships/cross-references
- compatible challenge types

One content object can feed multiple games when semantically appropriate: Trivia, Joust, Gauntlet, Wheel, tournament challenge, etc.

Avoid duplicating equivalent question data per game. Game-specific authored content remains possible when the mechanic requires it.

## 7. Asset registry and asset packs
Games reference semantic asset IDs, never copied relative files when a shared asset exists.

Examples:
- `agon.icon.cards`
- `agon.icon.dice`
- `agon.icon.scroll`
- `agon.station.bridge`
- `agon.station.scroll-room`
- `agon.animation.correct`
- `agon.animation.incorrect`
- `agon.audio.reveal`

Registry resolves semantic ID -> installed asset/version/variant appropriate for surface/resolution/motion profile.

Potential packs:
- Core UI Assets
- Tournament/Medieval
- Kids
- Bible Lands
- Cards & Table
- Seasonal/Christmas

Do not duplicate assets solely because two games use different directories.

### Asset optimization
Build pipeline should support appropriate:
- vector/SVG reuse for icons where supported
- compressed raster formats
- responsive image variants only when justified
- audio compression
- animation reuse/spritesheets/atlases where beneficial
- hash-based deduplication
- dead/unreferenced asset detection
- license/source metadata

Do not bundle original/source design files into production installers unless required.

---

# Packaging/distribution

## Base installation
Target a compact base containing Core, required shared UI/runtime, starter content/games as product decides, and essential assets.

## Optional installable packs
Architecture should permit optional locally installed packs containing any combination of:
- game definitions
- engine module if genuinely required
- content
- assets
- variants

Examples: Kids collection, Tournament games, Strategy games, Christmas collection. Names/composition are product decisions, not hard-coded architecture.

A pack manifest declares:
- pack ID/version
- compatible Agon Core range
- dependencies
- conflicts/replacements if ever needed
- games/variants/content/assets provided
- installed footprint
- integrity hashes/signature metadata
- offline availability

Pack installation is transactional: validate compatibility/dependencies/integrity before activation. Uninstall must refuse or warn when saved sessions require the pack, according to retention policy.

Initial implementation may keep all packs bundled while honoring package boundaries; remote/downloadable distribution can follow later without redesigning games.

## Lazy loading / code splitting
Where supported by the current desktop/web stack:
- split game/engine modules by stable boundaries
- lazy-load game-specific novel engine code only when game starts
- lazy-load Admin-only modules from gameplay surfaces
- avoid importing whole icon/media libraries
- ensure dynamic imports remain deterministic/offline for installed modules

Code splitting primarily reduces startup/runtime load; optional packs reduce installed footprint. Do not confuse the two.

---

# Dependency and bundle governance

## Production bundle audit
Establish repeatable reports for:
- installer total size
- unpacked size
- JS/runtime bundle sizes by chunk
- dependency contribution
- asset contribution by type/pack
- content contribution
- duplicate files/assets
- source maps/dev artifacts accidentally shipped
- unused/dead assets
- duplicate libraries solving the same problem
- full icon/font libraries imported for a handful of glyphs

Store baseline artifact in CI and compare changes.

## Size budgets
Define configurable budgets after obtaining baseline, for example:
- Core runtime budget
- per shared engine budget
- per game-definition budget
- per optional engine module budget
- per asset/content pack budget
- maximum unexplained installer growth per PR

Do not choose arbitrary hard limits before measuring current build. CI should initially report, then enforce agreed thresholds.

## Dependency policy
New dependency PRs must state:
- why existing code/dependency cannot satisfy need
- production footprint
- tree-shaking behavior
- license/security compatibility
- whether dependency is Core or lazy/pack scoped

Prefer one capable shared library over multiple overlapping libraries, but do not replace stable code solely to reduce dependency count without measured benefit.

---

# Game creation workflow
When adding a game:
1. search capability/engine registry for existing mechanic
2. compose existing engines/components where possible
3. define content requirements
4. create GameDefinition
5. add variant overlays rather than forks
6. reference semantic shared assets
7. implement only genuinely novel mechanic code
8. declare package dependencies and capabilities
9. add schema/contract/recovery/accessibility tests
10. produce bundle-size delta report

### Architecture rule
**If a reusable mechanic already exists, a game MUST reuse it unless an architecture decision records why it cannot.**

If a mechanic almost exists, extend the shared engine only when the extension is broadly reusable and does not pollute the abstraction with one game's special case. Otherwise create a narrow game module/plugin.

---

# Novel mechanic modules/plugins
Unique mechanics remain supported. A module must:
- implement versioned runtime contract
- declare projections and capabilities
- depend on Core/shared engines in one direction; Core never imports a game module
- use shared scoring/RNG/persistence/accessibility/theme systems
- expose optional Gauntlet/Tournament adapters explicitly
- declare asset/content dependencies
- be lazy/pack loadable where supported

This prevents declarative architecture from becoming a lowest-common-denominator constraint.

---

# Persistence/versioning
Saved sessions snapshot/reference enough information to reproduce state:
- GameDefinition ID/version
- variant overlay IDs/versions
- engine contract versions/config snapshots as required
- content IDs/version/hash where content mutation could alter recovery
- installed pack IDs/versions
- asset layout/seed IDs when gameplay depends on stable composition
- RNG state

Pack/game updates require compatibility/migration rules. Never silently reinterpret an in-progress persisted game using incompatible newer rules.

---

# Security/integrity
If packs become downloadable:
- trusted source policy
- manifest/schema validation
- integrity hash/signature verification
- no arbitrary executable script from untrusted content packs
- clear distinction between data-only packs and trusted code-bearing engine modules
- path traversal/file overwrite protections
- dependency/version validation
- atomic activation/rollback

Prefer data-driven definitions/content/assets. Code-bearing extensions should remain first-party/trusted unless a future sandboxed plugin model is explicitly designed.

---

# Admin support
Admin should eventually expose:
- installed games/variants/packs
- dependency status
- content/asset pack versions
- footprint by pack
- enable/disable game/variant where allowed
- missing dependency diagnostics
- compatibility warnings

Authoring UI may later create/edit schema-valid game definitions and variants, but a no-code game builder is not required by this architecture phase.

---

# Migration strategy
1. Measure current production installer/bundle/assets/dependencies and establish baseline.
2. Implement registries/schema/runtime boundaries without rewriting all games at once.
3. Establish shared Agon component library/design tokens.
4. Establish semantic Asset Registry and deduplicate existing assets.
5. Establish reusable Content Registry/pack schema.
6. Convert simplest existing games to GameDefinition as reference implementations.
7. Migrate remaining games opportunistically alongside shared-engine migration work.
8. Introduce variant overlays and eliminate forked variants.
9. Establish logical pack boundaries while still bundled.
10. Add lazy loading/code splitting.
11. Enable optional downloadable/local packs only after pack/integrity/session dependency behavior is proven.
12. Turn CI size reporting into budgets/gates after real baselines are understood.

Coordinate with the existing-games shared-engine migration spec; do not duplicate that work.

---

# Reference migration candidates
Good early declarative candidates after engine migration:
- Before Or After
- Who Said It?
- Missing Word
- Complete the Verse
- simple Trivia-style games
- ordering games using shared Ordering Engine

More custom modules may remain for:
- Wayfinder maze generation
- Unveiled complex board geometry
- Joust presentation/orchestration
- Gauntlet course orchestration

Even custom games still consume shared UI/content/assets/scoring/RNG/persistence.

---

# Testing
## Schema/contracts
- valid/invalid GameDefinition fixtures
- variant overlay compatibility/conflict tests
- engine capability resolution
- dependency graph/cycle detection
- pack compatibility resolution

## Runtime
- load/unload games without leaking state
- two games using same engine remain isolated
- lazy module unavailable gives useful diagnostic
- saved session resumes against compatible definition/pack versions
- incompatible update refuses unsafe resume or runs explicit migration

## Packaging
- deterministic pack manifests/hashes
- duplicate asset detection
- missing semantic asset/content dependency failure
- transactional pack activation/rollback
- offline launch of installed packs

## Size
- CI produces installer/chunk/dependency/asset/content reports
- regression report attributes meaningful growth to owner/package
- production build excludes development/source artifacts

## Cross-surface
Game definitions/components remain responsive and accessible across projector/Main Stage, laptop/windowed host, Player Controller, Host Remote and Admin surfaces as applicable.

---

# Definition of done for architecture phase
- current footprint baseline exists and major contributors are known
- versioned GameDefinition schema and runtime registry exist
- variant overlay model exists
- capability/engine registry exists
- shared component library boundaries established
- semantic Asset Registry and deduplication pipeline exist
- Content Registry/pack format exists
- logical package manifest/dependency model exists
- at least 3 existing games run primarily from GameDefinitions as reference migrations
- at least one variant is an overlay rather than fork
- at least one custom/novel game demonstrates module contract while reusing shared systems
- CI reports size attribution and duplicate assets/dependencies
- logical packs can be enabled/disabled locally without rebuilding Core
- lazy loading/code splitting implemented where supported
- downloadable packs may remain a later delivery milestone, but architecture does not require redesign to add them
- developer documentation enforces reuse-first game creation workflow