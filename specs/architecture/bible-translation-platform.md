# Agon Bible Translation Platform Architecture

## Purpose
Make Bible translation selection a first-class Agon platform capability instead of embedding KJV wording/assumptions in individual games. Agon must support KJV and optional additional translations through a common, licensing-aware, offline-aware architecture that integrates with GameDefinition, Content Registry, Events, Gauntlet, saved sessions, Player Controller, Main Stage, Host Remote, and future content/game packs.

This specification defines technical capability and policy enforcement hooks; it does not grant rights to distribute or use any copyrighted translation. Every provider/translation must be configured according to the actual license/permission obtained for Agon's distribution and use model.

## Core principles
1. Games request Scripture through `BibleTextService`; they do not directly load KJV files or call vendor APIs.
2. Translation selection is data/configuration, not a separate game implementation.
3. Licensing/caching/attribution capabilities are centralized in translation manifests/providers, not duplicated in game code.
4. Translation-independent content remains reusable across translations.
5. Exact-wording games explicitly declare translation dependency.
6. Offline use is first-class, but only where the translation's declared rights/policy allow local storage/caching.
7. A saved session pins enough translation/provider/content state to resume deterministically.
8. Agon must fail safely when a selected translation cannot satisfy a game's text/offline/exact-wording requirements.
9. Providers are replaceable; games never depend on API.Bible, ESV, or another vendor directly.
10. Translation licenses/permissions are configuration/legal inputs and must not be inferred by code.

---

# Architecture

## BibleTextService
Single application-facing Scripture text API.

Conceptual responsibilities:
- resolve selected translation
- normalize canonical Scripture references
- request verse/passage text from provider
- return structured passage/verse data rather than presentation HTML where possible
- expose attribution/copyright metadata
- enforce provider storage/cache/use capabilities
- support offline readiness checks
- provide stable errors/capability diagnostics
- integrate cache without allowing games to bypass policy

Conceptual calls:
- `getPassage(reference, translationContext)`
- `getVerses(reference, translationContext)`
- `getBookMetadata(translationContext)`
- `checkAvailability(references, translationContext)`
- `getAttribution(translationContext)`
- `getCapabilities(translationContext)`

Do not require this exact programming interface; preserve the responsibilities.

## TranslationProvider contract
Providers implement a versioned contract beneath BibleTextService.

Provider examples may include:
- bundled/local KJV provider
- another legally distributable local/public-domain/open translation
- API.Bible provider
- direct publisher/provider integration where justified

Provider contract declares:
- provider ID/version
- available translation descriptors
- fetch/reference capabilities
- online requirement
- local-storage/cache capability and policy
- cache expiration/refresh policy when applicable
- maximum storage/quotation constraints if technically enforceable
- attribution/copyright metadata requirements
- supported canon/book identifiers
- exact-wording suitability
- provider-specific availability/authorization errors

Games must never branch on provider identity.

---

# Translation Registry and manifest
Each selectable translation has a versioned descriptor/manifest independent of the game catalog.

Suggested fields:
- translation ID
- abbreviation/display name
- language/locale
- provider ID
- provider translation/resource ID
- canon/book mapping
- delivery mode: LOCAL / REMOTE / HYBRID
- offline capability: FULL / CACHE_LIMITED / ONLINE_ONLY / UNKNOWN_DISABLED
- exact-wording capability
- attribution requirement and attribution content/reference
- copyright/rights notice
- license/permission record identifier and review date
- cache/storage policy identifier
- enabled/disabled status
- compatible provider version range

Do not encode a copyrighted translation as distributable merely because its name is known. It is enabled only when Agon's configured provider/rights permit it.

## Rights/policy separation
Keep legal/permission metadata separate from game rules. A translation policy may say what the installed Agon configuration is permitted to do; it must not claim legal conclusions beyond configured permissions.

Recommended operational states:
- ENABLED
- DISABLED_NO_PROVIDER
- DISABLED_NO_PERMISSION
- DISABLED_CONFIGURATION
- UNAVAILABLE_OFFLINE
- PROVIDER_ERROR

---

# Translation selection and inheritance
Translation selection follows explicit inheritance:
1. Application/installation default
2. Event override
3. Game Session override

The effective translation is resolved when a session starts and is persisted with the session. Changing the application default must not silently change an in-progress/saved Event or game.

Admin/Host UI should clearly show the effective translation and source of selection.

Optional future participant-specific translations are out of scope for initial implementation because exact-wording competitive games require fairness and shared review text. Add only through a separately designed feature.

---

# Content translation dependency
Extend Content Registry/challenge metadata with a required classification.

## `NONE`
Challenge meaning/correctness does not depend on wording.
Example: `Who built the ark?` / Noah.

## `REFERENCE_ONLY`
Challenge uses a Scripture reference and may display selected text for review, but correctness is not tied to exact wording.

## `TEXT`
Selected translation text is displayed/used by the challenge, but evaluation is semantic or otherwise not exact-word dependent.

## `EXACT_WORDING`
Challenge construction/evaluation depends materially on the selected translation's words/order/punctuation/verse text.
Examples may include:
- Missing Word
- Complete the Verse
- Verse Scramble
- Verse Typing Race
- exact quotation identification variants

Every content/challenge type that uses Scripture must declare its dependency level; do not guess at runtime.

---

# Translation-aware challenge generation
Prefer canonical challenge definitions plus translation-time generation where safe.

Example conceptual source:
- challenge type: `missing-word`
- reference: John 3:16
- generation policy: choose eligible word(s)

At session/attempt generation:
1. resolve effective translation
2. retrieve permitted text through BibleTextService
3. normalize only according to the challenge's declared rules
4. generate the challenge from that exact translation text
5. persist enough generated prompt/answer/version/hash state to guarantee deterministic recovery

Do not maintain KJV/ESV/NIV/etc. copies of the same generated challenge when one canonical definition can safely generate them.

Manually authored translation-specific challenges remain supported and must declare allowed translation IDs/version constraints.

## Exact-wording fairness
For competitive games, all participants in the same exact-wording challenge use the same effective translation unless a future feature explicitly defines a fair multilingual/multi-translation mode.

---

# GameDefinition integration
Add Scripture requirements to GameDefinition/module capabilities.

Conceptual fields:
```yaml
scriptureRequirements:
  dependency: EXACT_WORDING
  requiresFullText: true
  requiresOfflineText: false
  supportedTranslationCapabilities:
    - exact-wording
```

Runtime compatibility check occurs before game/session start and before a dynamic Gauntlet/Event stage is selected.

A game must not start if the effective translation cannot satisfy mandatory requirements. Provide a useful Host diagnostic and valid alternatives: choose another enabled translation, connect/prepare content if permitted, or choose a compatible game/stage.

---

# Gauntlet/Event/Tournament integration
Gauntlet course generation must filter stage adapters by effective translation capability. It must not select an exact-wording stage when required text is unavailable or prohibited from the needed delivery mode.

Events run a translation readiness check covering scheduled/eligible games where known. Tournament match creation inherits the Event/session translation and pins it for match recovery.

Random challenge generation must validate translation availability before exposing a randomizer result that would require unavailable content.

---

# Offline and caching
Offline behavior is provider/translation-policy driven.

## Capability model
Support at least:
- FULL_OFFLINE: legally/configurationally installed local corpus
- PREPARED_CACHE: selected passages may be cached under declared policy
- SESSION_CACHE_ONLY: temporary permitted cache for current session/process
- ONLINE_ONLY

Never assume a remote translation can be permanently downloaded.

## Readiness check
Before an Event/game, Agon can report:
- translation selected
- provider status
- online/offline status
- required passages/content known and available
- exact-wording game compatibility
- cache freshness/expiration where applicable
- attribution metadata present

Where policy permits prefetch, Host may prepare needed passages before going offline. Prefetch must use provider policy and should not indiscriminately download an entire copyrighted corpus.

## Cache policy enforcement
Central cache layer honors provider-declared:
- expiration/refresh
- storage scope
- maximum allowed cache where applicable
- purge requirements
- encryption-at-rest if required by future provider agreement

Games cannot write provider Scripture responses into their own permanent caches.

---

# Attribution and copyright UI
Create centralized reusable Scripture attribution presentation.

Surfaces may include:
- compact reference/translation label adjacent to Scripture when required
- full attribution/copyright notice in About/Translations/Admin
- Event/game review screen attribution
- exported/printed content if Agon later supports it, subject to provider policy

Translation/provider manifest determines required attribution mode. Games render shared attribution components and do not hard-code copyright strings.

Attribution text must be versioned/configurable because publisher requirements can change.

---

# KJV migration
Inventory all current KJV-specific assumptions:
- embedded verse/text files
- hard-coded labels
- challenge generation
- answer fixtures
- exact-word evaluation
- tests/snapshots
- game registration/config
- exports/review screens

Wrap existing KJV source behind a local `TranslationProvider` first, preserving current behavior. Then refactor consumers to BibleTextService incrementally.

Do not remove or transform existing KJV content until equivalence tests prove verse/reference text behavior required by current games.

---

# Provider adapters
## API.Bible provider
A future/optional adapter may provide multiple authorized translations through one provider integration. The adapter must discover/map only resources authorized/configured for Agon and translate provider IDs into Agon's canonical Translation Registry.

Provider credentials must be stored through Agon's secure configuration/secret mechanism and never shipped in client-visible web/controller payloads.

## Direct publisher providers
Add only when licensing/product needs justify a separate adapter. The same BibleTextService contract prevents game changes.

## Local/open providers
Allow locally bundled translations only when distribution rights/configuration permit. Corpus files should be packaged as content/translation packs rather than compiled repeatedly into games.

---

# Packaging
Translation text/data belongs in translation/content packs, not in every game package.

Pack manifest declares:
- translation IDs
- provider/data version
- language/canon
- installed footprint
- rights/policy identifier
- attribution metadata
- dependency on BibleTextService/provider module
- integrity hash

Optional translation packs integrate with the modular distribution architecture. Disabling/removing a translation pack must protect saved sessions that require it or preserve the minimum permitted snapshot necessary for recovery.

---

# Persistence
Saved session records at minimum:
- effective translation ID
- translation manifest version
- provider ID/version
- provider resource ID/version where needed
- challenge translation dependency
- generated exact-word prompt/answer snapshot or stable permitted content hash/reference sufficient for deterministic resume
- attribution version where required
- cache/content pack dependency where applicable

Never refetch and silently replace the wording of an in-progress exact-wording challenge after provider content changes.

Persist only the amount of copyrighted text permitted by the configured provider/license policy. If full prompt snapshot persistence is not allowed, use a permitted stable reference/version strategy or mark the session's recovery limitation explicitly before play.

---

# Security/privacy
- provider API keys/secrets never sent to Player Controller/Main Stage browser payloads
- server/host process performs provider access
- validate/sanitize remote provider content before presentation
- cache paths protected from traversal
- translation packs integrity-checked
- remote provider failure cannot expose credentials in diagnostics
- no arbitrary executable code in translation data packs

---

# Admin/Host UX
Admin Translation screen should eventually show:
- enabled translations
- abbreviation/name/language
- provider
- delivery/offline capability
- installed/cache footprint
- permission/configuration status
- attribution/copyright information
- provider connectivity/authorization status
- cache readiness/freshness
- default translation selection

Host Event/Game setup shows effective translation and compatibility warnings before start.

Do not expose raw license keys/secrets.

---

# Testing
## Contract
- provider conformance suite
- canonical reference mapping across providers
- translation registry validation
- rights/capability policy validation

## Compatibility
- NONE/REFERENCE_ONLY/TEXT/EXACT_WORDING challenge fixtures
- game refuses incompatible translation capability
- Gauntlet excludes incompatible stages
- Event readiness reports missing text/provider/offline constraints

## Persistence
- exact-word challenge resumes identically
- changing app default does not change saved session
- provider content/version change does not silently alter active challenge
- cache expiration behavior follows provider policy

## Security
- credentials absent from controller/projector payloads/logs
- failed provider response sanitized
- pack integrity/path tests

## KJV regression
- existing KJV game fixtures retain current expected behavior after provider migration
- verse/reference normalization regression
- scoring/evaluation parity for exact-word games

---

# Migration order
1. inventory KJV assumptions and translation-dependent games/content
2. implement BibleTextService + provider contract + Translation Registry
3. wrap current KJV source in local provider without behavior change
4. add GameDefinition Scripture requirements and Content Registry dependency classification
5. refactor translation-independent/reference-only games first
6. refactor exact-word games with translation-aware generation/persistence
7. centralize attribution UI
8. implement offline/cache/readiness policy layer
9. add optional external provider adapter(s), beginning with the provider chosen for product/licensing needs
10. integrate Event/Gauntlet/Tournament readiness/filtering
11. migrate remaining catalog before/alongside #331

This work should begin before catalog-wide modular migration #331 so KJV assumptions are not copied into the new architecture.

---

# Definition of done
- no migrated game directly depends on a KJV file/provider API
- KJV remains functionally equivalent through BibleTextService/local provider
- effective translation selectable at Application/Event/Session levels and pinned in sessions
- content/challenges classify translation dependency
- exact-word games generate/evaluate from selected translation safely
- GameDefinition expresses Scripture requirements
- Gauntlet/Event compatibility honors translation capabilities
- centralized attribution works across surfaces
- offline/cache behavior is policy-driven
- at least one optional non-KJV provider/translation path is demonstrated only with valid configured rights/provider access
- saved sessions recover deterministically within provider/license constraints
- translation text is packaged once through content/translation packs rather than duplicated per game
- tests prevent games from bypassing BibleTextService/provider policy