# Agon Core Foundations & Stage Orchestration Architecture

## Purpose
Define cross-cutting foundations that should be stable before Agon migrates its full game catalog (#331) and before Local/Shared/Hosted runtimes diverge. These services sit below games and above deployment technology so games remain composable, testable, deterministic and portable.

This specification covers:
1. canonical domain model and stable IDs
2. unified domain action/event vocabulary
3. score/rules ledger
4. authorization/capability model
5. configuration inheritance and immutable resolved session configuration
6. common schema/version/migration framework
7. feature/capability flags
8. error/diagnostic model
9. Scripture learning metadata
10. optional learning-history boundary
11. observability/privacy/redaction contract
12. deterministic replay/debugging
13. mechanic/game/variant/match/event ownership boundaries
14. Stage/Display Endpoint architecture and remote Shared projection/control

The goal is not to implement every future feature now. The goal is to establish contracts so #321/#331 and new games do not create incompatible local conventions.

---

# 1. Canonical domain model and stable IDs

Define shared identifiers and lifecycle semantics for at least:
- GameDefinitionId / GameVersion
- VariantId
- Mechanic/Engine capability IDs
- ContentId / ChallengeId / ChallengeVersion
- PlayerId / TeamId / ParticipantId
- SiteId / EndpointId / DisplayEndpointId
- SessionId / RoundId / AttemptId
- EventId / TournamentId / MatchId
- TranslationId / ProviderId
- AssetId / PackId
- ScoreEntryId / DomainEventId / CommandId

Rules:
- IDs are opaque and never derived from display names.
- Display names can change without breaking persistence.
- persisted references include version/dependency metadata where behavior/content matters.
- identity IDs and participant IDs are distinct.
- IDs are serializable across Local/Shared/Hosted.
- games use canonical domain types rather than redefining Team/Player/Round.

Publish ownership/lifecycle diagrams and serialization conventions.

---

# 2. Unified action/event model

Build on SessionRuntime #350 with a common event vocabulary. Commands express intent; domain events record accepted authoritative facts.

Common event families:
- session lifecycle
- participant/team/site/endpoint lifecycle
- round/turn/attempt lifecycle
- challenge presented/answered/evaluated
- buzz opened/received/awarded/locked
- randomizer requested/result committed
- card/tile/die/wheel/lot actions
- timer/deadline events
- score ledger changes
- Host/Admin corrections
- stage presentation changes
- tournament/match advancement
- persistence/recovery/version events

Events include stable ID, type/version, session, causal command/correlation, actor when applicable, authoritative sequence/version, timestamp metadata, and typed payload.

Not every UI animation is a domain event. Presentation events are separate but may reference domain events.

---

# 3. Score & Rules Ledger

Games MUST NOT directly mutate aggregate scores (`score += 100`). All authoritative score changes are ledger entries.

Score entry concept:
- entry ID
- session/event/match/team/player scope
- source game/challenge/round/attempt
- reason code
- points delta
- scoring rule/version
- causal domain event
- actor if Host correction
- timestamp/sequence
- optional reversal/replacement reference

Aggregate score is derived/materialized from ledger.

Support:
- challenge points
- difficulty/efficiency bonuses
- penalties where game rules require them
- steals
- finish/placement bonuses
- Tournament/Event cumulative scoring
- Gauntlet stage scoring
- Host corrections as auditable ledger adjustments
- score scopes: game/match/tournament/event

Rules/policies should be declarative where practical and version-pinned in sessions.

No betting, wagering, stakes, gambling balances or betting odds are part of Agon scoring.

---

# 4. Authorization and capability model

Identity answers WHO; capabilities answer WHAT THEY MAY DO.

Roles may map to capabilities but game/runtime code authorizes capabilities, not role-name strings.

Example capabilities:
- SESSION_START / PAUSE / RESUME / END
- ANSWER
- BUZZ
- CHOOSE_GAME_ACTION
- CONTROL_LOCAL_STAGE
- CONTROL_ALL_STAGES
- CORRECT_SCORE
- ADVANCE_ROUND
- MANAGE_EVENT
- MANAGE_TEAMS
- VIEW_HOST_DIAGNOSTICS
- ADMIN_CONFIGURE_PLATFORM

Scopes can include session/site/team/display/event.

Local remains simple: default Host and guest participants. Shared/Hosted can add authenticated identities without changing game authorization contracts.

All privileged corrections/actions create audit events.

---

# 5. Configuration architecture

Use typed configuration with explicit inheritance:

`Platform defaults -> Installation/User -> Event -> Game/Variant -> Session`

The exact allowed override levels are schema-defined per setting.

At session start, resolve an immutable `ResolvedSessionConfiguration` containing effective values and source/version metadata. Mid-session changes are explicit commands/events and only allowed for settings declared mutable.

Candidate settings:
- difficulty
- timers
- scoring policies
- team/player limits
- motion/accessibility
- translation
- game variants
- randomizer policies
- controller behavior
- stage/presentation preferences
- tournament/event options

Games consume typed resolved configuration, not arbitrary environment/preferences stores.

---

# 6. Common schema/version/migration framework

Provide one framework for versioned persisted/platform data:
- GameDefinitions
- content/challenges
- pack manifests
- settings/configuration
- saved sessions
- Events/Tournaments
- translation manifests
- stage/display persisted preferences

Every schema has stable type ID + version. Migrations are explicit, deterministic and testable. Never silently reinterpret old rules/content.

Support migration planning, dry validation, backups/transactional replacement where persistence is mutable, compatibility diagnostics and migration telemetry without sensitive payloads.

Subsystems should not invent unrelated ad-hoc migration conventions.

---

# 7. Feature/capability flags

Separate three concepts:
- runtime capability: implementation can do X
- compatibility: this definition/version can use X
- rollout flag: feature is intentionally enabled here

Flags are typed, centrally registered and observable in diagnostics. Games must not probe deployment mode or random environment variables to infer features.

Examples: `cards.v2`, `stage.remote`, `translation.external-provider`, `runtime.hosted`, `runtime.shared`.

Do not use flags to permanently maintain duplicate architectures.

---

# 8. Error and diagnostic model

Define stable machine error codes + safe user/Host presentation.

Examples:
- CONTENT_NOT_AVAILABLE
- TRANSLATION_INCOMPATIBLE
- SESSION_VERSION_UNSUPPORTED
- ACTOR_NOT_AUTHORIZED
- PACK_DEPENDENCY_MISSING
- TRANSPORT_DISCONNECTED
- GAME_CAPABILITY_UNAVAILABLE
- DISPLAY_ENDPOINT_UNAVAILABLE
- STAGE_COMMAND_REJECTED
- PERSISTENCE_CONFLICT

Diagnostic object includes code, severity, correlation ID, safe message, optional Host remediation, retryability, component and structured safe details.

Never leak secrets, hidden answers/private hands, provider credentials or sensitive participant data.

---

# 9. Scripture learning metadata

Agon's educational purpose is first-class. Content/challenges can carry canonical learning metadata independent of game mechanics.

Suggested fields:
- Scripture reference(s)
- testament/book/passages
- people/places/events/topics
- Bible chronology/category tags
- learning objective(s)
- skill type: recall, recognition, ordering, navigation, comprehension, application/discussion, etc.
- difficulty
- age/audience profile
- prerequisite/follow-up references
- Dig Deeper metadata
- translation dependency classification from Bible Translation architecture

Games query/select content by learning metadata rather than maintaining isolated question pools where possible.

Metadata must be curated/versioned; AI-generated enrichment, if ever used, requires review before becoming authoritative content metadata.

---

# 10. Learning-history boundary

Define an OPTIONAL interface now; personalized mastery implementation can come later.

Keep learning history distinct from score/win history.

Potential records:
- content/challenge exposure
- Scripture passage exposure
- concept/topic exposure
- correct/incorrect outcome where educationally meaningful
- hint/retry context
- review/mastery state derived by a future policy

Privacy principles:
- disabled/no persistent profile is valid
- Local family play must not require cloud learning profiles
- children's data requires conservative defaults and future policy/legal review before Hosted persistence
- do not infer spiritual maturity, belief, character or personal worth from gameplay
- team results must not automatically become individual mastery records

Initial implementation may be a no-op/local-only provider.

---

# 11. Observability/privacy/redaction

Provide structured Logging/Metrics/Tracing APIs with session/correlation IDs and component context.

Runtime implementations choose sinks:
- Local: local diagnostics/logs
- Hosted/Shared: operational telemetry
- tests: in-memory capture

Classify fields as PUBLIC_OPERATIONAL / PRIVATE_GAME_STATE / PERSONAL / SECRET. Redaction policy prevents hidden answers, card hands, API keys, join credentials and sensitive participant data from accidental logging.

Telemetry must not become a second persistence path for game content/player history.

---

# 12. Deterministic replay/debugging

Use snapshots + authoritative domain events + seeded RNG + authoritative clock semantics to reproduce sessions for debugging where feasible.

Replay modes:
- state reconstruction/recovery
- headless diagnostic replay
- optional future spectator/review replay (separate product feature)

Replay MUST respect content/licensing/privacy. A diagnostic replay should use stable IDs/hashes/redacted payloads where full copyrighted/private content cannot be retained.

Do not rerun external provider calls to determine historical outcomes.

---

# 13. Ownership hierarchy

Formalize:
- **Mechanic/Engine** — reusable rule primitive (cards, buzzer, ordering, dice)
- **Game** — named playable ruleset/composition
- **Variant** — constrained overlay on a GameDefinition
- **Match** — one competitive instance between participants/teams
- **Tournament** — structure composed of Matches
- **Event** — broader multi-game/multi-session gathering structure

Round/Turn/Attempt are session/game execution concepts and must not be confused with Tournament rounds.

Ownership rules prevent a Card Engine from owning Event score, a Game from owning transport, or a Variant from duplicating an entire GameDefinition.

---

# 14. Stage & Display Endpoint architecture

## Problem
Shared play requires more than synchronized state. An authoritative Host must be able to orchestrate what remote physical Agon stages display without screen/video streaming. Hosted must use the same model.

## Core distinction
- `ProjectionService`: **what data may this audience see?**
- `StageOrchestrationService`: **what presentation should this display show now?**

Stage orchestration never bypasses ProjectionService privacy rules.

## DisplayEndpoint
A site may register zero or more display endpoints.

Descriptor includes:
- DisplayEndpointId
- SiteId
- display role (MAIN_STAGE, SECONDARY_STAGE, CONFIDENCE/HOST_DISPLAY, future roles)
- supported presentation protocol/version
- resolution/aspect ratio hints
- audio capability
- animation/motion capability
- fullscreen/local-device capability metadata
- connected/presence state
- installed/available asset/content capabilities where needed

Local starts with one default Main Stage. Architecture supports multiple displays without requiring them.

## StageOrchestrationService
Responsibilities:
- register/unregister/observe displays
- maintain authoritative current `StagePresentationState`
- issue semantic presentation commands
- target all stages/site/display/display-role
- validate actor capability and display capability
- coordinate scheduled presentation transitions
- resynchronize reconnecting/late displays
- expose safe Host diagnostics
- integrate assets/audio/animation semantically

## Semantic stage commands
Never remotely manipulate DOM/window controls.

Examples:
- SHOW_LOBBY
- SHOW_GAME_INTRO
- SHOW_ROUND_INTRO
- SHOW_CHALLENGE
- LOCK_ANSWERS
- REVEAL_ANSWER
- SHOW_RESULT
- SHOW_SCOREBOARD
- SHOW_BRACKET
- SHOW_SCRIPTURE
- SHOW_REVIEW
- SHOW_INTERMISSION
- SHOW_EVENT_COMPLETE
- BLACKOUT / SAFE_HOLD
- PLAY_EFFECT(assetId)
- PLAY_NARRATION(assetId/reference) where policy permits

Game-specific presentation commands are versioned extensions only when common states cannot express the mechanic.

## Stage presentation state machine
Common conceptual states:
`LOBBY -> GAME_INTRO -> ROUND_INTRO -> CHALLENGE -> ANSWER_LOCKED -> ANSWER_REVEAL -> RESULT -> SCOREBOARD/next round -> GAME_COMPLETE`

Also support REVIEW, INTERMISSION, BRACKET/EVENT views and SAFE_HOLD/reconnecting states.

State transitions are authoritative presentation events and reference relevant session/domain versions.

## Targeting
Targets:
- ALL_STAGES
- SITE(siteId)
- DISPLAY(displayId)
- DISPLAY_ROLE(role)

Default gameplay presentation normally targets all compatible Main Stages.

Site-specific operational messaging can target only an affected site.

## Permissions
Example:
- SESSION_HOST: CONTROL_ALL_STAGES
- SITE_HOST: CONTROL_LOCAL_STAGE only
- DISPLAY_OPERATOR: local physical display settings only
- PLAYER: no stage control

Local physical operations such as monitor selection, fullscreen and local volume need not alter authoritative game state.

## Remote rendering, not video streaming
Shared/Hosted stage receives semantic command + permitted projection + referenced assets and renders locally. Do not stream the Host desktop as the core architecture.

Benefits:
- low bandwidth
- native resolution/aspect ratio
- local animation/audio assets
- privacy via projections
- reconnect/resync
- same Stage UI works Local/Shared/Hosted

Video/screen sharing, if ever added, is a separate optional feature and not the game synchronization mechanism.

## Synchronized presentation scheduling
For reveals, countdowns, Joust impacts, simultaneous answer display, etc., authority can issue a presentation transition with an authoritative target/deadline time or sequence barrier.

Stage transport accounts for clock offset and uses a small configurable presentation buffer where appropriate. Exact frame synchronization across Internet sites is not promised; goal is perceptually synchronized presentation with deterministic authoritative outcome.

Late commands do not rewind authoritative game state. Display catches up to current presentation state.

## Reconnect/resync
A display is disposable projection/presentation client.

On reconnect:
1. re-establish endpoint/site/session authorization
2. negotiate protocol/capabilities
3. request current StagePresentationState + current permitted projection
4. resolve required assets
5. render current state

Do not replay stale animations unless explicitly needed to reconstruct the current presentation.

## Audio/animation/assets
Stage commands reference semantic AssetIds through Asset Registry. Remote site plays locally installed/authorized asset. Motion accessibility preference can reduce/disable animation without changing game timing/outcome.

Copyright/licensing policy applies to remote delivery of Scripture/media. Do not synchronize restricted source content merely because a Stage asks for it.

## Local Stage adapter
Today's installed Main Stage is adapted to the Stage/Display contracts first. This proves the contract without requiring Shared/Hosted infrastructure.

## Shared Stage adapter — future
Remote installed Agon site registers display endpoints over Shared transport. Authoritative Host can target them according to capability/role. Site initiates outbound secure connection; no inbound router configuration required.

## Hosted Stage adapter — future
Browser Stage registers as DisplayEndpoint and consumes the same presentation/projection protocol.

---

# Dependency and implementation priorities

## Hard foundation before broad #331 migration
- canonical domain/IDs
- Score Ledger
- configuration resolution
- schema/version/migration framework
- authorization/capability model
- SessionRuntime/Projection/Persistence contracts (#350/#351/#353)
- authority-safe Clock/RNG/Buzzer (#355)
- Stage/Display contract + StageOrchestration core + Local Stage adapter
- learning metadata schema

## Establish interfaces now, deeper implementation can follow
- unified event vocabulary/replay
- feature rollout flags
- diagnostic model
- observability/redaction
- learning-history provider
- remote Shared Stage adapter
- Hosted Stage adapter

## Catalog migration rule
#321/#331 migrations must use canonical IDs/domain types, Score Ledger, resolved configuration, versioned persistence, platform runtime contracts and Stage/Projection boundaries. Do not migrate games onto new GameDefinitions while retaining direct score mutation, direct Stage DOM control, direct filesystem/network access or KJV-specific access.

---

# Definition of done for foundation phase
- canonical domain/ID package used by reference games
- common command/domain-event envelopes and event taxonomy established
- score changes go through auditable ledger
- typed resolved session configuration exists
- common schema migration framework exists
- capability authorization protects privileged actions
- learning metadata schema is usable by Content Registry
- structured diagnostic/observability contracts exist with redaction
- deterministic replay proof exists for a reference scenario
- DisplayEndpoint and StageOrchestration contracts implemented
- current Local Main Stage operates through StageOrchestration + ProjectionService
- remote Stage protocol can be implemented later without changing game APIs
- #321 reference games demonstrate the combined architecture before #331 migrates the entire catalog