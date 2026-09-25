# Agon Multi-Runtime Platform Architecture

## Purpose
Design Agon so the same games, engines, content, assets, rules, scoring and projections can run on three deployment/runtime models without creating separate game implementations:

- **Agon Local** — installed application, local host authority, LAN controllers/stage, Internet optional/not required.
- **Agon Shared** — multiple Agon installations/groups participate in the same session over the Internet.
- **Agon Hosted** — web-hosted Agon where session authority and persistence run in hosted services and Host/Main Stage/Player Controller use browser-capable clients.

This architecture defines the common contracts now, adapts the current Local product to them first, and leaves Shared/Hosted as later implementations. Games MUST target the common platform APIs, never a deployment mode.

## Core rule
`Game -> Game Runtime -> Platform contracts -> Local | Shared | Hosted implementation`

Game code must not contain `if desktop`, `if hosted`, vendor WebSocket/database calls, filesystem persistence, LAN IP addressing, or cloud-specific behavior.

---

# Relationship to existing architecture
This specification sits beneath/alongside:
- GameDefinition/capability runtime
- shared mechanic engines
- Content/Asset/Translation registries
- Event/Tournament/Gauntlet
- persistent sessions
- Player Controller / Host Remote / Main Stage projections
- modular package architecture

It does not replace those systems. It provides runtime-neutral interfaces through which they execute.

Implement these boundaries before the catalog-wide migration #331 wherever practical so existing games are not migrated onto new abstractions that still assume the authoritative process is always one desktop PC.

---

# Runtime modes

## Agon Local
Initial/reference implementation.
- installed Agon host owns authoritative session state
- local persistence provider
- LAN/in-process transport as appropriate
- Main Stage, Host and Player Controllers receive projections through common projection/transport contracts
- no Internet/account required for ordinary local play
- existing functionality preserved while moved behind interfaces

## Agon Shared
Future implementation for geographically separate groups, each potentially running an installed Agon host.

Conceptual topology:
`Local Group A <-> Shared Coordinator/Authority <-> Local Group B ...`

Each site may have:
- local Main Stage
- local Host controls subject to session role
- local phones/controllers
- local participant/team membership

Shared mode MUST define exactly one authoritative ordering/state decision for every game action. Do not independently simulate authoritative randomizers/scoring at every site and reconcile afterward.

The eventual authority model may support designated-host authority and/or hosted authority, but that choice is below the game API and explicitly declared in session metadata.

## Agon Hosted
Future web-hosted runtime.
- hosted authoritative session runtime
- hosted persistence
- Internet transport/gateway
- browser-capable Host/Main Stage/Player Controller surfaces
- same GameDefinitions/engines/content contracts where compatible

Hosted is not a fork of the game catalog.

---

# Platform contracts

## SessionRuntime
Authoritative command/query boundary for gameplay.

Responsibilities:
- create/start/pause/resume/end session
- validate participant/role/game phase
- accept semantic commands such as submit answer, buzz, choose option, draw, roll, move, reveal, pass, etc.
- dispatch to Game Runtime/shared engine
- commit authoritative result/state transition
- append event/audit information
- update projections
- support idempotency/correlation IDs
- expose capability/version metadata

Games call domain/runtime APIs rather than network transports.

Commands must be semantic and versionable. Do not expose UI click coordinates or transport-specific payloads as game contracts.

## SessionTransport
Moves commands/events/projections between authorized endpoints.

Possible implementations:
- in-process/local
- LAN WebSocket/local HTTP
- Internet WebSocket/realtime gateway
- test/in-memory

Transport does not decide game outcomes.

Requirements:
- connection/session identity
- message versioning
- correlation/idempotency IDs
- reconnect/resubscribe
- ordering semantics documented per channel
- heartbeat/presence where needed
- payload size limits
- backpressure/rate limiting hooks
- no game-specific business rules

## ProjectionService
Produces audience-specific state.

Audience types include:
- PUBLIC_MAIN_STAGE
- HOST
- PLAYER(playerId)
- TEAM(teamId)
- ADMIN where appropriate
- LOCAL_SITE(siteId) for Shared mode where appropriate

Authoritative state is never automatically serialized to clients. Each projection is explicit and least-privilege.

Examples:
- Main Stage sees card counts, not private hands.
- Player A sees Player A hand, not Player B hand.
- Host sees only information Host role is allowed to see; hidden answers may remain hidden even from Host until reveal depending on game policy.

Projection rules must behave identically in Local, Shared and Hosted.

## SessionPersistence
Runtime-neutral persistence contract.

Responsibilities:
- snapshots
- event/audit append where architecture uses event records
- load/resume
- optimistic/version concurrency where needed
- transaction/idempotency boundary
- session metadata/dependency versions
- retention/archive hooks

Implementations may use local files/SQLite/etc. or hosted database/storage. Games never write directly to either.

## Identity/Presence contract
Separate persistent identity from temporary game participant identity.

Initial Local:
- guest/player/team identity without account requirement

Future Shared/Hosted:
- Host/session-owner authenticated identity where required
- guest join by code/QR/link where allowed
- optional persistent profiles later
- roles/capabilities
- site/group identity for Shared
- presence/reconnect identity

Do not require accounts for ordinary Local play.

## Clock/Timer contract
Timers cannot depend on client wall clocks for authoritative outcomes.
- authoritative runtime owns deadlines
- clients receive deadline/remaining-time projection
- latency tolerance rules explicit
- reconnect reconstructs current timer from authority
- test clock injectable

## Randomness contract
All authoritative randomness uses shared seeded RNG/event mechanism.
- result generated once by authority
- seed/state/result committed before/atomically with exposure
- clients animate authoritative result; they do not determine it
- reconnect does not reroll/redraw/regenerate

Applies to cards, dice, spinner/wheel, casting lots, random challenge selection, maze/course generation, etc.

---

# Command/event model
Use versioned envelopes conceptually containing:
- protocol version
- session ID
- command/event type
- actor/role/site identity
- correlation ID
- idempotency key
- client-known state/version where useful
- timestamp metadata (not trusted for authoritative deadlines)
- payload

The exact serialization is implementation-specific, but contracts should be serializable so Local and Hosted can exercise the same conformance tests.

Prefer semantic commands and authoritative result events.

Example:
`RollDiceCommand -> authority -> DiceRolled(result=5, rngPosition=...)`

Not:
`client generates 5 -> server accepts 5`.

---

# Authority model
Every session records an `AuthorityProfile`.

Initial:
- `LOCAL_HOST_AUTHORITY`

Future candidates:
- `SHARED_PRIMARY_HOST_AUTHORITY`
- `HOSTED_AUTHORITY`

Game code does not branch on profile. Platform/runtime implementations satisfy the same contracts.

For Shared primary-host authority, coordinator/relay failure and primary-host loss require explicit behavior; never permit split-brain scoring/randomness. A future authority transfer protocol requires its own design and fencing/epoch mechanism.

Hosted authority is preferred where strong cross-site fairness/recovery is required, but Shared implementation decision remains separate from this interface architecture.

---

# Local site abstraction
Introduce optional `siteId` below game/team concepts so Shared mode can represent multiple physical groups without games assuming all players share one LAN/display.

A site can own:
- one or more display endpoints
- controllers
- local host/operator role
- participants/teams

Games normally reason about players/teams, not sites. Site metadata is used by transport/projection/presence and only exposed to a game mechanic when explicitly relevant.

Local mode has one implicit/default site.

---

# Reconnect and resynchronization
Clients are disposable projections, not authoritative replicas.

Reconnect flow:
1. authenticate/re-establish session participant/endpoint
2. negotiate protocol/capabilities
3. provide last acknowledged projection/event version where supported
4. authority returns delta or fresh projection
5. client replaces/reconciles view

Never trust a reconnecting client to restore authoritative score, private hands, RNG state or timer state.

Shared site reconnect follows the same principle.

---

# Latency and fairness
Network play introduces latency. Platform contract must support:
- authority-received timestamp/order
- configurable grace policy for timed responses where game design permits
- simultaneous-answer collection windows
- buzz arbitration
- no client self-awarding due to local latency
- UI indication of disconnected/reconnecting participants

Do not hide latency rules inside individual games. Engines such as Buzzer/Timer consume common policy.

For synchronized games (Joust, Wayfinder, Gauntlet head-to-head, etc.), collect private responses until completion/deadline and reveal authoritative results together.

---

# Version/protocol compatibility
Installed Shared participants may run different Agon versions.

Handshake declares:
- platform protocol range
- GameDefinition/module versions
- engine contract versions
- content/asset/translation dependencies relevant to session
- supported capabilities

Coordinator refuses incompatible participation with a clear diagnostic rather than allowing undefined behavior.

Where safe, protocol supports backward-compatible additive fields and negotiated capability levels.

Hosted clients should normally serve compatible UI/runtime versions from the same deployment, but persisted sessions still require definition/content version protection.

---

# GameDefinition integration
Add runtime capability declaration, e.g. conceptually:
```yaml
runtimeCapabilities:
  local: true
  shared: true
  hosted: true
requirements:
  privatePlayerProjection: true
  realtime: true
  maxExpectedCommandLatencyMs: ...
```

Do not mark a game incompatible simply because it has not yet been validated. Track `SUPPORTED`, `NOT_VALIDATED`, `UNSUPPORTED_REASON` separately where useful.

Most games should become runtime-neutral by construction.

---

# Content/assets/translations
Games use existing registries regardless of runtime.

Local:
- installed local packs/providers

Shared:
- session compatibility negotiation ensures required content/definitions are compatible across authoritative runtime and presentation sites; copyrighted translation/content policy still applies

Hosted:
- hosted/runtime-authorized content and browser-deliverable assets under pack/provider policy

Never copy copyrighted Bible translation text to remote peers merely to synchronize a game unless provider policy permits it.

---

# Security boundaries
Online modes require explicit trust boundaries.

- clients are untrusted
- validate every command server/authority-side
- authorize actor, role, team, phase and command
- never expose hidden authoritative state through projection/debug payloads
- rate-limit buzz/answer/action endpoints
- session join codes are not long-term credentials
- protect hosted/shared service secrets
- TLS for Internet transport
- anti-replay/idempotency protections
- audit Host/Admin corrections
- sanitize user-entered team/player text
- no remote arbitrary code/module execution
- package/module compatibility and integrity checks remain in force

Local mode should still use projection/authorization boundaries so Hosted does not require rewriting games later.

---

# Hosted platform conceptual services
Future Hosted implementation may decompose into:
- Web/UI delivery
- Session/API service
- Realtime gateway
- authoritative Game Runtime workers
- persistence/database
- content/asset delivery
- identity/invite service
- observability/operations

Do not prematurely force microservices. Start as a modular deployable application if simpler; preserve logical contracts so components can split later based on measured scale.

Hosted requirements include horizontal session isolation, deployment/version migration, backups, secrets, rate limits, abuse controls, logs/metrics/traces, health checks and cost controls.

---

# Shared platform conceptual services
Future Shared implementation may include:
- Shared coordinator/session directory
- secure relay/realtime gateway
- invitation/join-code service
- presence/site membership
- compatibility negotiation
- optional hosted authority

Avoid requiring inbound ports/NAT configuration on household/church networks; installed hosts should initiate outbound secure connections to Shared services.

Local controllers at each site may continue communicating locally where appropriate while site-to-site state flows through common Shared transport/authority.

---

# Testing architecture
Provide in-memory implementations:
- `InMemorySessionTransport`
- `InMemorySessionPersistence`
- test identity/presence
- deterministic test clock
- deterministic seeded RNG

Game/engine conformance tests should execute without desktop UI/network/database.

Reusable runtime conformance suite runs against Local and eventually Hosted/Shared implementations.

Test scenarios:
- answer/buzz/action authorization
- simultaneous actions
- private projections
- disconnect/reconnect
- duplicate command/idempotency
- stale command/state version
- timer deadline
- RNG recovery
- save/restore
- Host correction audit
- site disconnect
- protocol incompatibility
- simulated latency/reordering/loss where applicable

---

# Implementation strategy
## Phase 1 — contracts + Local proof
1. inventory desktop/LAN/filesystem assumptions in runtime/game code
2. define versioned contracts/envelopes
3. build in-memory test implementations/conformance suite
4. implement Local SessionRuntime/Transport/Persistence/Identity adapters around current behavior
5. route one reference game end-to-end through contracts
6. route Main Stage/Player Controller/Host projection through ProjectionService
7. migrate shared Timer/RNG/Buzzer semantics to authority-safe contracts
8. use this pattern in #321/#331 catalog migration

## Phase 2 — Hosted reference implementation
Implement Hosted against the same contracts:
- hosted authority
- realtime Internet transport
- hosted persistence
- web-capable surfaces
- identity/invites
- observability/security

Start with a small reference game set, then validate additional GameDefinitions via conformance tests. Do not fork games.

## Phase 3 — Shared implementation
Implement cross-site installed play against the same contracts after Hosted/realtime authority patterns are proven. Reuse Hosted coordinator/realtime/identity infrastructure where practical.

This order is architectural guidance, not a requirement that Hosted product launch precede all Shared experiments.

---

# Migration coordination
Before #331 migrates every game, establish at least:
- SessionRuntime contract
- ProjectionService audience model
- SessionPersistence contract
- authority-safe Timer/RNG rules
- Local adapter/reference implementation

Then #331 migrates games to GameDefinition/shared engines **and** runtime-neutral APIs in one pass where practical.

#316 shared UI components should avoid desktop-only APIs and consume projections/actions through platform contracts.
#320 novel modules must use platform contracts.
Bible translation platform remains provider/policy-driven across all runtime modes.

---

# Non-goals for initial architecture phase
- deploy production Hosted infrastructure
- implement Shared Internet play
- select a cloud vendor
- choose final database/realtime vendor
- build public matchmaking
- require accounts for Local
- support arbitrary third-party servers/plugins
- solve global-scale multi-region deployment

The goal now is to prevent game/platform code from making choices that would require catalog-wide rewrites later.

---

# Definition of done — architecture/local foundation
- versioned SessionRuntime, SessionTransport, ProjectionService, SessionPersistence, Identity/Presence, Clock and authority contracts documented/implemented
- command/event envelopes are serializable and versioned
- Local runtime implements the contracts without losing offline functionality
- in-memory conformance/test runtime exists
- at least one representative game runs end-to-end solely through platform contracts
- private/public/Host projections proven
- authoritative RNG/timer/reconnect behavior proven
- GameDefinition can declare runtime compatibility/capabilities
- #321/#331 migration guidance references these contracts
- no new game is permitted to depend directly on desktop filesystem/LAN transport/cloud vendor APIs for game logic
- Hosted and Shared can be implemented later by satisfying the same conformance suite without forking game implementations