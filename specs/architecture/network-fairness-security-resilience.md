# Agon Network Fairness, Security & Resilience Architecture

## Purpose
Define cross-cutting policies and contracts required for fair, secure and resilient controller, Shared and Hosted play without putting network/security logic into individual games.

This specification extends the Multi-Runtime Platform and Core/Stage foundations. Local remains offline-first; Internet infrastructure is implemented later, but game/runtime contracts must be safe to carry into Shared/Hosted.

## Principles
1. Authority decides outcomes; clients submit intent.
2. Never trust client wall-clock timestamps, RNG results, scores, answers, roles or hidden state.
3. Fairness is mechanic-specific; do not blindly subtract ping from response time.
4. Measure RTT, jitter, loss/reconnect and clock offset/uncertainty continuously enough to make bounded decisions.
5. Hidden information is not sent until the audience is authorized to know it.
6. Reconnect restores from authority; client state never becomes authoritative.
7. Security controls are centralized and reusable across games.
8. Degraded network/service conditions produce explicit policies and Host diagnostics.
9. Local play remains account-free and Internet-independent.
10. Collect/store the minimum personal data required, especially for children.

---

# Network sensitivity classification
Every realtime mechanic/GameDefinition declares a network sensitivity profile rather than implementing its own compensation.

## TURN_BASED
Latency normally affects convenience, not competitive ordering. Examples: turn-based cards/strategy/choices.

## DEADLINE_BASED
Responses must arrive before an authoritative deadline. Client countdown is presentation only.

## SIMULTANEOUS_PRIVATE
Participants answer independently; authority collects until all required responses/deadline then reveals together. Examples: Joust and Wayfinder simultaneous questions.

## FIRST_RESPONSE
Ordering matters. Examples: buzzers. Requires explicit arbitration/fairness policy and network-quality bounds.

## SYNCHRONIZED_PRESENTATION
Outcome is already authoritative; multiple displays should present a reveal/countdown/animation at approximately the same intended time using Stage scheduling/buffering.

A game may use multiple profiles for different phases.

---

# Network Quality Service
Create a runtime service that maintains endpoint/site network estimates:
- smoothed RTT
- RTT distribution/percentiles where useful
- jitter/variance
- packet/message loss or failed-heartbeat indicators where observable
- reconnect frequency
- clock offset estimate
- clock uncertainty
- last sample/freshness
- quality classification

Measurements are advisory inputs to fairness/readiness policies, never proof that a client acted at a claimed local timestamp.

Use robust sampling/outlier rejection and bounded windows. Do not expose precise infrastructure/network details unnecessarily to players.

## Readiness
Before realtime Shared/Hosted play, evaluate connection quality against the mechanics likely to be used.

Possible states:
- GOOD
- DEGRADED
- UNSUITABLE_FOR_FIRST_RESPONSE
- DISCONNECTED/UNKNOWN

Host receives actionable explanation. Agon may recommend a compatible mechanic (e.g. simultaneous/deadline/turn-based) rather than silently running an unfair buzzer round. Automatic substitution must be explicitly enabled by Event/game policy.

---

# Authoritative clock synchronization
Authority owns deadlines and ordering.

Clients periodically exchange timing probes sufficient to estimate offset/uncertainty for presentation and bounded fairness calculations. A client timestamp is never accepted as authoritative merely because it is synchronized.

Clock service exposes:
- authoritative now/deadline
- client offset estimate
- uncertainty
- synchronization freshness
- scheduled presentation time conversion

System clock jumps/sleep/resume require re-synchronization. Tests use injectable deterministic clocks.

---

# Fairness Policy Engine
Central engine maps network sensitivity + measured quality + game configuration into arbitration behavior.

## First-response/buzzer policy
Do not define fairness as `arrival - ping`.

A production policy should consider:
- multiple recent RTT samples rather than one ping
- jitter/uncertainty
- bounded maximum compensation
- sample freshness
- minimum quality requirements
- server/authority arrival order
- configurable near-simultaneous/tie window where appropriate
- abuse-resistant treatment of suspicious/outlier latency measurements

Policy returns an auditable decision containing observed authority times, allowed compensation/tie rule, quality state and winner/tie/rejected result. Player-facing UI need not expose raw network details.

If uncertainty exceeds the configured fairness threshold, the round can be declared unsuitable/retried/switched according to game/Event policy rather than pretending precision exists.

## Deadline-based policy
Authority deadline is final. Optional grace is centrally configured and bounded; it must not be based solely on client claims.

## Simultaneous-private policy
Arrival order does not determine outcome. Hold private responses until completion/deadline; reveal together.

## Turn-based policy
Normally no latency compensation.

## Presentation policy
Use Stage scheduled presentation buffering; presentation delay does not change game outcome.

All fairness decisions should be reproducible from permitted diagnostic metadata/events.

---

# Reconnect and interruption policy
Centralize phase-aware behavior for endpoint/site disconnects.

States include CONNECTED, DEGRADED, DISCONNECTED, RECONNECTING, TIMED_OUT, REMOVED and optional PAUSED_BY_POLICY. `FORFEIT` is game/Event policy, not an automatic synonym for disconnect.

Policies define behavior when disconnect occurs:
- before challenge exposure
- after exposure but before response
- after response accepted
- while holding simultaneous responses
- during buzzer window
- during a turn
- between rounds/matches
- entire Shared site disconnect

Authority records whether a response/action was committed before disconnect. Reconnect cannot resubmit an already committed action unless the command is idempotently recognized.

---

# Threat model / trust boundaries
Treat as untrusted:
- Player Controller/browser
- Hosted browser Host UI
- remote Shared installation/site connection
- network messages
- join codes/links presented by users
- imported/downloaded data packs until verified
- user-entered text/content

Trusted authority validates every command for:
- session
- actor/endpoint/site
- authenticated/guest identity as applicable
- role/capability
- game phase
- command schema/version
- target ownership/team
- idempotency/replay
- rate limits
- state/version preconditions

Never accept client-computed score, RNG, card draw, timer expiration, answer correctness or tournament advancement as authoritative.

---

# Hidden-information security
ProjectionService is the only normal path from authoritative state to clients.

Rules:
- do not send unrevealed answers/clues/cards/maze paths/private hands and hide them with CSS/JavaScript
- do not include secrets in generic debug/state payloads
- Player/Team/Site projections are least-privilege
- Stage public projection contains only currently public state
- Host does not automatically receive hidden answers if game policy says Host should not know before reveal
- delayed reveal sends/authorizes data only when reveal state is committed

Automated projection tests inspect serialized payloads for forbidden fields/values.

---

# Session join/invite security
Local LAN joining can remain simple, but Shared/Hosted credentials must be scoped.

Define separate concepts:
- public/discoverable session identifier
- short join code/QR/link token
- participant/endpoint session credential after admission
- Host/session-owner authentication where required
- Shared site pairing credential

Requirements:
- expiration/rotation
- Host can revoke/remove participant/site
- optional Host approval/waiting room
- brute-force/rate-limit protection
- join token is not a long-term account credential
- do not expose Host/admin capability through ordinary join code
- Shared site pairing stronger/longer-lived than player join and revocable

Do not select an identity vendor in this architecture.

---

# Command integrity, idempotency and replay protection
Every mutable command uses SessionRuntime envelope metadata from the multi-runtime architecture.

At minimum:
- session ID
- actor/endpoint identity
- protocol/schema version
- correlation ID
- idempotency key/sequence where applicable
- authority epoch/fencing token where authority transfer can occur
- state/version precondition where needed

Duplicate/replayed commands cannot double-score, redraw, rebuzz or repeat advancement. Stale authority epochs are rejected.

Transport security (TLS for Internet modes) protects messages in transit; application-level authorization/idempotency remains required.

---

# Rate limiting and abuse resilience
Central policies protect Shared/Hosted runtime from accidental or malicious floods.

Scopes may include:
- join attempts per source/session
- buzz/action rate per endpoint/player
- answer submissions
- reconnect attempts
- session creation
- Host/Admin mutations
- chat/messages if communications are later implemented
- asset/content requests

Limits must account for legitimate game behavior and accessibility; a rate limit must not silently decide a competitive result. Authority returns stable diagnostics and logs security-relevant abuse with privacy-safe metadata.

---

# Package/content integrity
Data packs/assets/content/translation packs use manifest hashes/integrity validation from modular packaging.

Rules:
- reject corrupted/tampered packs
- prevent path traversal/overwrite outside package root
- validate schema before activation
- executable modules remain trusted/first-party under existing novel-module architecture; do not turn packs into arbitrary remote code
- Hosted/Shared negotiate compatible definition/module/content versions
- remote site cannot claim a package version/capability and then send authoritative game results; authority remains authoritative

Future signing may be added where distribution model requires it.

---

# Privacy and data lifecycle
Define data classes:
- public game presentation
- session/game operational data
- participant identifiers/display names
- private gameplay responses/hands
- learning history
- diagnostics/network telemetry
- credentials/secrets
- provider/licensed content

For each class define purpose, Local/Hosted/Shared storage, retention, export/delete behavior, logging prohibition/redaction, and whether synchronization is required.

Principles:
- Local does not require cloud identity
- avoid collecting birth dates/precise child profiles merely to select age-appropriate games
- learning history remains optional/separate from scoring
- do not infer spiritual maturity/belief/character from performance
- secrets never enter telemetry
- private answers/hands are not routine logs
- diagnostics prefer IDs/categories/latency aggregates over content

Hosted implementation must review applicable legal/privacy requirements before collecting persistent child-related account/profile data.

---

# Resilience and degraded modes
Create a dependency-health model for:
- client/controller connection
- Shared coordinator/realtime transport
- authoritative runtime
- persistence
- content/assets
- Bible translation provider
- optional external services

Game/Event declares which dependencies are REQUIRED_AT_START, REQUIRED_CONTINUOUSLY, PREFETCHABLE, or OPTIONAL.

Examples:
- installed KJV Local play continues without Internet
- cached/permitted translation content may continue when provider is down
- a remote Stage may enter SAFE_HOLD while authority continues according to Event policy
- loss of authoritative Shared runtime pauses/fails safely; never creates two authorities
- persistence outage may pause mutation if durable commit is required rather than acknowledging state that cannot safely recover

Host receives clear status/remediation. Player UI receives concise appropriate state.

---

# Authority failure / split-brain prevention
Shared/Hosted must have one active authority for a session epoch.

If future authority transfer/failover is implemented:
- monotonically increasing epoch/term
- fencing token on mutable operations
- old authority cannot continue committing after replacement
- RNG/timer/score/event position transferred from durable authoritative state
- clients rebind and resynchronize

Until safe transfer exists, prefer pause/fail-safe over split brain.

---

# Security diagnostics and audit
Security/fairness events integrate with domain events/observability:
- admission/revocation
- capability denial
- suspicious/replayed/duplicate command
- rate-limit action
- fairness decision summary
- network-quality state transition
- authority epoch transition
- Host correction

Do not log credentials, raw private hands, unrevealed answers or full copyrighted provider content.

---

# GameDefinition integration
Add/extend runtime metadata conceptually:
```yaml
networkRequirements:
  sensitivity:
    - FIRST_RESPONSE
    - SYNCHRONIZED_PRESENTATION
  minQualityProfile: REALTIME
  disconnectPolicy: STANDARD_COMPETITIVE
  fairnessPolicy: BUZZER_STANDARD
securityRequirements:
  privatePlayerProjection: true
```

Engines may declare their own requirements inherited by games. Validation computes effective requirements rather than making every game repeat boilerplate.

---

# Testing
Provide deterministic/simulated tests for:
- asymmetric latency
- high jitter
- stale/outlier RTT samples
- near-simultaneous buzzes
- deadline arrival around boundary
- client clock manipulation
- disconnect before/after commit
- duplicate/replayed commands
- join-code brute-force/rate limiting
- unauthorized role/action
- hidden-state payload scanning
- site disconnect/reconnect
- authority epoch/fencing
- provider/persistence outage
- pack tamper/path traversal
- privacy/redaction

Fairness algorithms require property/scenario tests and recorded decision explanations.

---

# Implementation sequencing
## P0 before/with catalog migration
- network sensitivity metadata contract
- authoritative clock sync interface
- hidden-information projection rule/tests
- reconnect/interruption policy interface
- threat/trust model incorporated into SessionRuntime authorization

## P1 before production Hosted/Shared
- Network Quality Service
- Fairness Policy Engine including buzzer policy
- readiness/admission checks
- join/invite credential architecture
- replay/idempotency/fencing hardening
- centralized rate limits
- privacy/data lifecycle implementation
- resilience/dependency health/degraded-mode framework
- security/fairness observability

## P2 deployment-specific
- production Internet identity/auth provider
- production DDoS/edge/WAF/service protections
- Hosted/Shared operational security controls
- safe authority failover if product requires it

---

# Definition of done
- games declare/derive network sensitivity rather than implementing latency logic
- authority clock and fairness interfaces are centralized
- buzzer policy is bounded/auditable and does not simply subtract ping
- readiness can identify unsuitable first-response connections
- hidden state is absent from unauthorized serialized projections
- disconnect/reconnect semantics are centralized
- session/invite credentials are scoped/revocable
- mutable commands are idempotent/replay-resistant
- rate limiting is centralized
- package integrity and path safety enforced
- privacy/retention classes documented/enforced
- dependency health/degraded-mode behavior exists
- split brain is prevented by authority epoch/fencing or fail-safe pause
- Local remains offline-first and account-free
- Shared/Hosted can implement production controls without changing game logic