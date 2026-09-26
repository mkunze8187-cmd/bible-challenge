# Agon Experience, Content & Operational Foundations

## Purpose
Complete the remaining cross-cutting foundations before the catalog-wide migration by defining reusable contracts for input/accessibility, content provenance, answer evaluation, Host adjudication, localization, media/resources, compatibility certification, portability, updates, administration and communications.

These foundations extend the Core Domain, Multi-Runtime, Stage Orchestration, and Network Fairness/Security/Resilience architectures. The objective is not to implement every future feature before #331; it is to establish boundaries that prevent games from accumulating incompatible one-off behavior.

## Principles
- Games consume semantic actions, not physical-device events.
- Accessibility is a platform capability, not a per-game afterthought.
- Bible-learning content has provenance, revision and review status.
- Answer correctness is evaluated through reusable policies, with authoritative human adjudication available when appropriate.
- Host corrections are ledgered domain actions, never silent database edits.
- Application language is independent from Bible translation.
- Media/assets are referenced by logical IDs and capabilities, not bundled ad hoc into games.
- Optional content should not force permanent binary growth.
- Compatibility claims should be proven by automated conformance where practical.
- User-created Events/content/settings should be portable and safely recoverable.
- Updates must respect saved sessions, schema migrations, package compatibility and upcoming Events.
- Gameplay and administration are separate capability surfaces even if shipped in one application.
- Communications may share session identity/presence but never carry authoritative game state.

---

# 1. Semantic Input & Accessibility Platform

## InputAction abstraction
Define semantic actions independent of physical input device, for example:
- BUZZ
- SELECT / NAVIGATE
- SUBMIT
- PASS / NO_BID
- CANCEL / BACK
- CONFIRM
- DRAW / ROLL / SPIN where exposed directly
- TEXT_INPUT
- ORDER_ITEMS
- HOST_NEXT / HOST_REVEAL where authorized

Input adapters translate keyboard, mouse/touch, Player Controller, gamepad, adaptive switch or future device input into semantic commands. Games consume actions/SessionRuntime commands rather than key codes, DOM events, screen coordinates or device APIs.

Bindings may vary by surface and accessibility profile. Competitive commands still pass through authority/fairness/security policies.

## AccessibilityProfile
Support platform-level capabilities/preferences such as:
- text scaling
- reduced motion / animation level
- high contrast / theme-compatible contrast
- color-independent status cues
- keyboard-only navigation
- screen-reader semantics where surface supports it
- captions/text alternatives for meaningful audio
- audio/visual alternatives for important alerts
- configurable response-time accommodation where game policy permits
- simplified controller presentation for young players/accessibility needs

Do not encode medical diagnoses in the gameplay model. Store functional preferences/accommodations only when needed.

Accessibility cannot reveal hidden answers/private state or alter authoritative outcomes except through explicit rules/accommodation policy.

## GameDefinition integration
Games/engines declare required interaction capabilities (e.g. TEXT_INPUT, DRAG_ORDER, RAPID_BUZZ) and available alternatives. Readiness can warn when a selected endpoint/accessibility configuration cannot operate a mechanic.

---

# 2. Content Provenance, Lifecycle & Quality

Every authored/imported/generated challenge/content item receives stable identity and provenance metadata sufficient to understand where it came from and which revision was played.

Conceptual metadata:
- contentId + revision/version
- content type
- source/author/provider
- Scripture passage/reference(s)
- translation dependency/wording sensitivity
- topic/person/place/event/learning objective metadata (#368)
- difficulty/age suitability
- creation/update timestamps
- provenance type: CURATED, IMPORTED, GENERATED_DRAFT, USER_AUTHORED
- review status
- reviewer/audit metadata where appropriate
- retirement/replacement relationship

Lifecycle:
`DRAFT -> REVIEWED -> APPROVED -> PUBLISHED -> RETIRED`

Generated content is never implicitly trusted merely because generation succeeded. AI-assisted/generated material begins as GENERATED_DRAFT/DRAFT unless an explicitly configured review policy says otherwise.

Saved sessions/events pin the content revision needed for deterministic resume/replay where policy permits.

Validation checks structural correctness, references, answer-policy compatibility, required assets/translations and duplicate/conflict conditions.

---

# 3. Answer Evaluation Service

Centralize correctness evaluation instead of embedding string comparisons in games.

## AnswerPolicy types
Support extensible policies including:
- EXACT
- NORMALIZED_TEXT
- ACCEPTED_ALIASES
- MULTIPLE_CHOICE
- NUMERIC / RANGE
- ORDERED_SEQUENCE
- UNORDERED_SET
- MULTI_VALUE / category-list
- TRANSLATION_EXACT_WORDING
- HOST_ADJUDICATED
- COMPOSITE policy

Normalization may include configurable whitespace/case/punctuation/Unicode handling. Do not automatically apply aggressive spelling/fuzzy matching where it could change theological/factual meaning.

Aliases are content/context scoped. `Saul` and `Paul`, for example, are not globally interchangeable; content defines accepted aliases for that question/context.

Evaluation result is structured:
- CORRECT / INCORRECT / NEEDS_ADJUDICATION / INVALID
- matched accepted answer/policy rule
- safe explanation/reason code
- scoring eligibility metadata
- evaluation version

Answer evaluation uses effective selected Bible translation when exact wording matters.

## Host adjudication integration
Ambiguous/fuzzy/unsupported cases may be escalated to Host according to policy rather than guessed by the engine.

---

# 4. Host Adjudication & Correction

Define authoritative semantic operations:
- ACCEPT_ANSWER
- REJECT_ANSWER
- VOID_CHALLENGE
- REPLAY_CHALLENGE
- ADJUST_SCORE / AWARD / REVOKE through Score Ledger
- RESTORE_PARTICIPANT where policy allows
- RESOLVE_TIE / MANUAL_RESULT only where game/tournament policy permits
- FLAG_CONTENT_PROBLEM

Every correction:
- requires capability authorization (#365)
- records actor, reason/category, target and prior/new effect
- creates domain/score-ledger events (#363/#364)
- updates projections/Stages
- is idempotent
- persists/replays correctly

Never edit authoritative database/session state silently from an Admin UI.

Host correction UI must avoid exposing hidden information unnecessarily.

---

# 5. Localization / Internationalization

Application/UI language is independent from Bible translation.

All user-facing platform/game strings use localization keys/parameters rather than hard-coded English where practical. Support:
- pluralization
- number/date/time formatting
- longer/shorter translated strings
- locale-aware text normalization where relevant
- future RTL layout capability
- locale-specific asset/narration variants

Content may declare supported locales separately from Bible translation support.

Fallback chain is deterministic and visible in diagnostics; missing localization must not crash a game.

Do not confuse localization rights with Bible translation licensing.

---

# 6. Media & Asset Delivery Pipeline

Extend Asset Registry into a media lifecycle for:
- images/icons
- animations
- sound effects
- music
- narration
- video
- Scripture audio where licensed/permitted

Logical asset descriptors include:
- assetId/version
- media type
- variants by resolution/locale/motion/accessibility/device capability
- size/hash
- licensing/provenance/policy metadata
- preload/cache policy
- fallback
- optional streaming/download metadata for future Hosted/Shared

Games reference logical asset IDs. Stage/Controller chooses a compatible local/deliverable variant.

Event/readiness can preflight required assets so remote/local Stages do not discover missing critical media mid-game.

Meaningful audio has a text/visual alternative where feasible; reduced-motion profile chooses appropriate variants.

---

# 7. Resource Footprint & Optional Delivery

Formalize package/resource installation classes:
- CORE_REQUIRED
- INSTALLED
- OPTIONAL
- ON_DEMAND
- EVENT_REQUIRED
- CACHEABLE

Dependency resolver computes the minimum packs/assets/content/translations required for selected games/Event while respecting licenses and offline policy.

Track installed/download/cache footprint and allow safe cleanup of unused optional resources without breaking pinned saved sessions.

Do not duplicate common media/content in each game pack.

Local must support a fully functional offline baseline. Hosted may deliver assets/content differently while satisfying the same logical registries.

---

# 8. Compatibility Certification & Conformance Matrix

Build compatibility from machine-verifiable capabilities/tests rather than informal assumptions.

Dimensions include:
- Local / Shared / Hosted
- GameDefinition/module version
- engine versions
- content/translation requirements
- keyboard/touch/controller/input capabilities
- Main/remote/browser Stage
- reconnect/save-resume
- accessibility modes such as Reduced Motion
- protocol/package compatibility

Status distinguishes:
- CERTIFIED/TESTED
- SUPPORTED_BY_CONTRACT but not yet certified
- NOT_VALIDATED
- UNSUPPORTED with reason

CI/conformance suite should produce/update compatibility evidence. Do not make a human-maintained badge the source of truth.

Event readiness uses the matrix plus installed capabilities to identify incompatibility before play.

---

# 9. Backup, Export, Import & Portability

Define a versioned `AgonArchive` container/manifest for permitted user-owned/configuration data:
- Events/tournament definitions
- saved sessions/snapshots/events as permitted
- settings/profiles
- custom/user-authored content
- optional learning history if user elects to include it
- references to required packs/translations/assets

Archive does not blindly embed copyrighted Bible corpora, licensed media, credentials/secrets or provider tokens. It references dependencies that must be independently available/authorized.

Import validates schema/version, integrity, IDs/conflicts and migration compatibility before activation. Support dry-run/report and safe rollback.

Archive is suitable for Local backup/machine migration and can later underpin appropriate Hosted export/import.

---

# 10. Update & Release Architecture

Installed Agon and modular packs need controlled lifecycle:
- stable release channel initially; architecture may support additional channels later
- update availability metadata
- package/runtime/protocol compatibility checks
- schema migration compatibility
- saved-session dependency protection
- atomic install/rollback where practical
- Event readiness protection against disruptive updates
- explicit Host/user control over update timing

Do not auto-apply a breaking runtime/pack update immediately before/in the middle of an Event. Active sessions pin effective definitions/dependencies.

Shared compatibility negotiation may recommend/require compatible versions before sites join.

Update signatures/integrity use the package security foundation; vendor/distribution mechanism selected separately.

---

# 11. Play vs Administration Boundary

Define logical surfaces/capabilities:

## Agon Play
- session/event Host controls
- Main Stage
- Player Controllers
- game execution
- limited runtime corrections/adjudication

## Agon Admin
- content authoring/review
- Event templates/setup
- pack/translation/resource management
- application policy/settings
- diagnostics/backup/import/export
- compatibility/readiness management

They may ship in one installed app/web deployment initially, but modules/routes/APIs/capabilities remain separated. Player/Stage clients never receive Admin functionality simply because it exists in the product.

Authoring tools use the same schemas/validators as runtime content ingestion.

---

# 12. Communications Provider Boundary

Reserve a provider-neutral communications contract for future Shared/Hosted audio/video/chat without coupling communications to game-state transport.

Conceptual capabilities:
- NONE
- AUDIO
- VIDEO
- TEXT_CHAT
- SCREEN/PRESENTATION adjunct only if later justified
- embedded vs external-launch presentation capability

CommunicationsProvider may reuse session participant/presence identity but has separate connection/media state and permissions.

Critical rule: game commands, authoritative state, scoring, RNG, Stage orchestration and controller synchronization NEVER depend on media/chat transport. If video fails while SessionTransport is healthy, gameplay can continue according to Event policy.

Local implementation is `NoneCommunicationsProvider` initially. Define contracts only until a communications implementation is deliberately scheduled.

Privacy/moderation/recording policy must be designed before enabling communications, especially for children. No recording by default merely because a provider supports it.

---

# Readiness aggregation
Extend Event/Game readiness to aggregate:
- runtime/platform compatibility
- network/fairness readiness
- required input capabilities
- accessibility compatibility
- content approval/revision availability
- answer policy availability
- translation readiness
- required media/assets
- package/resource availability
- protocol/version compatibility

Return actionable Host diagnostics before Event start rather than discovering incompatibilities mid-round.

---

# Testing
Provide reusable tests for:
- device adapters producing identical semantic action
- keyboard-only navigation and reduced-motion variants
- inaccessible required interaction diagnostics
- content lifecycle/provenance/revision pinning
- answer normalization/aliases/context/translation exact wording
- Host correction audit/score rollback/projection update
- missing localization fallback and layout-safe long strings
- missing/corrupt media fallback/readiness
- resource dependency resolution and saved-session cleanup protection
- compatibility matrix generated from conformance evidence
- archive round-trip/migration/conflict/licensed-resource exclusion
- update rollback/session pinning
- Admin capability isolation from Player/Stage
- communications outage not affecting SessionRuntime

---

# Sequencing
## P0 before/with #331
1. Semantic InputAction contract and basic keyboard/controller adapters
2. AccessibilityProfile contract and minimum platform rules
3. Content provenance/lifecycle schema
4. Answer Evaluation Service and policies
5. Host adjudication/correction contract + Score Ledger/domain events

These prevent catalog-wide games from embedding device, correctness and correction behavior.

## P1 platform maturity
6. Localization framework
7. Media/asset delivery pipeline
8. Resource footprint/optional delivery
9. Compatibility certification/conformance matrix
10. AgonArchive backup/export/import
11. Update/release lifecycle
12. Play/Admin module/capability separation

## P2/future
13. Optional communications provider implementation; contract may exist earlier
14. advanced accessibility/adaptive-device integrations
15. additional locales/RTL after framework exists

---

# Foundation Freeze
After P0 contracts plus the previously specified Core/Multi-Runtime/Stage/Fairness foundations exist, stop adding speculative cross-cutting architecture before #331.

Use #321/reference migrations to exercise 2–3 representative games end-to-end. New foundational changes should then be driven by concrete gaps found by those migrations/conformance tests.

The goal is to avoid both architectural debt and endless pre-implementation architecture.

# Definition of done
- games consume semantic input rather than device events
- minimum accessibility contract exists across Host/Stage/Controller
- content revisions/provenance/review lifecycle are first-class
- answer evaluation is reusable and translation/context aware
- Host corrections are authorized/audited ledger/domain events
- localization is independent from Bible translations
- logical media/assets support variants/preflight/fallback
- optional resources can be installed/cleaned without breaking sessions
- compatibility evidence is generated by conformance tests
- portable archive excludes secrets/unlicensed embedded dependencies
- updates preserve active/saved session compatibility and support safe recovery
- Admin capabilities are isolated from Play clients
- communications are optional and never authoritative game transport
- foundation freeze/reference-validation gate is documented before #331