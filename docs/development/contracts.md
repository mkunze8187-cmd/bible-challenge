# Agon Inter-Layer Contract / API Reference

**Status:** STABLE — normative contract baseline  
**Change policy:** additive compatible changes preferred; breaking semantic/serialization changes require ADR + version/migration plan + conformance tests.  
**Language:** TypeScript-like definitions are normative shapes/semantics, not necessarily current source paths until implementation lands.

> This document intentionally defines boundaries before every interface is implemented. Implementations may add private methods, but must not weaken these semantics.

## 1. Contract versioning

```ts
type ContractVersion = `${number}.${number}`;

interface VersionedContract {
  contractVersion: ContractVersion;
}
```

Rules:
- major = incompatible semantic/required-field/serialization change;
- minor = additive backward-compatible capability;
- unknown optional fields must be ignored where serialization permits;
- unknown required command/event types are rejected explicitly, never guessed;
- persisted/wire/package schemas carry explicit versions;
- compatibility negotiation occurs before Shared/Hosted session admission where versions differ.

## 2. Stable identifiers

```ts
type SessionId = string;
type EventId = string;
type TournamentId = string;
type MatchId = string;
type GameId = string;
type VariantId = string;
type ParticipantId = string;
type TeamId = string;
type EndpointId = string;
type SiteId = string;
type DisplayId = string;
type ContentId = string;
type AssetId = string;
```

IDs are opaque. UI labels/names are never identifiers. Persisted references use stable IDs + required revision/version.

## 3. SessionRuntime — authoritative mutation boundary

```ts
interface SessionRuntime {
  readonly sessionId: SessionId;
  getDescriptor(): SessionDescriptor;
  submit(command: CommandEnvelope): Promise<CommandResult>;
  getProjection(request: ProjectionRequest): Promise<ProjectionEnvelope>;
  getSnapshot(): Promise<AuthoritativeSnapshot>;
}
```

`submit` is the only normal external mutation path. Implementations must authenticate/identify actor, authorize capability, validate phase/schema/state preconditions, enforce idempotency/replay policy, then dispatch semantic intent.

### Command envelope

```ts
interface CommandEnvelope<T = unknown> extends VersionedContract {
  commandId: string;          // correlation/idempotency identity
  sessionId: SessionId;
  actor: ActorRef;
  endpointId: EndpointId;
  commandType: string;
  payload: T;
  expectedStateVersion?: number;
  authorityEpoch?: number;
  clientObservedAt?: string;  // advisory only; never authoritative clock
}

interface CommandResult {
  commandId: string;
  status: 'ACCEPTED' | 'REJECTED' | 'DUPLICATE';
  stateVersion: number;
  reasonCode?: string;
}
```

Clients do not submit authoritative score, correctness, RNG outcome, timer expiration, tournament advancement or final first-response ordering.

## 4. Game runtime contract

```ts
interface GameRuntime<TState = unknown> {
  readonly gameId: GameId;
  initialize(ctx: GameContext): Promise<TState>;
  handle(command: SemanticGameCommand, ctx: GameContext): Promise<GameTransition<TState>>;
  getStatus(state: TState): GameStatus;
}

interface GameTransition<TState> {
  nextState: TState;
  events: DomainEvent[];
  scoreOperations?: ScoreOperation[];
  presentationHints?: PresentationHint[];
}
```

Games are deterministic relative to injected authoritative services. They do not directly call wall-clock/random/browser/network/storage APIs.

## 5. GameContext / injected authority services

```ts
interface GameContext {
  clock: AuthorityClock;
  random: RandomSource;
  challenges: ChallengeService;
  answers: AnswerEvaluationService;
  score: ScoreLedgerPort;
  content: ContentRegistry;
  bibleText: BibleTextService;
  assets: AssetRegistry;
  capabilities: RuntimeCapabilities;
}
```

All time/RNG affecting outcomes flows through injected services so tests/replay can reproduce behavior.

## 6. GameDefinition contract

```ts
interface GameDefinition extends VersionedContract {
  id: GameId;
  revision: string;
  titleKey: string;
  participantRules: ParticipantRules;
  engines: EngineRequirement[];
  inputRequirements: InputRequirement[];
  networkRequirements: NetworkRequirements;
  contentRequirements: ContentRequirement[];
  assetRequirements: AssetRequirement[];
  persistencePolicy: PersistencePolicy;
  variants?: VariantDefinition[];
}
```

A definition describes requirements/composition. It does not instantiate runtime-mode-specific networking/UI.

## 7. Engine contract

```ts
interface MechanicEngine<TConfig, TState, TCommand, TResult> {
  readonly engineId: string;
  readonly contractVersion: ContractVersion;
  validate(config: TConfig): ValidationResult;
  initialize(config: TConfig, ctx: EngineContext): TState;
  execute(state: TState, command: TCommand, ctx: EngineContext): EngineTransition<TState, TResult>;
}
```

Engine outputs are semantic results/events, not React components. Reusable engines may provide presentation metadata but do not own Stage rendering.

## 8. Challenge and answer evaluation

```ts
interface ChallengeService {
  next(request: ChallengeRequest): Promise<ChallengeInstance>;
  get(contentId: ContentId, revision: string): Promise<ChallengeInstance>;
}

interface AnswerEvaluationService {
  evaluate(attempt: AnswerAttempt, policy: AnswerPolicy, ctx: EvaluationContext): Promise<EvaluationResult>;
}

type EvaluationStatus = 'CORRECT' | 'INCORRECT' | 'NEEDS_ADJUDICATION' | 'INVALID';

interface EvaluationResult {
  status: EvaluationStatus;
  reasonCode: string;
  evaluationVersion: string;
  matchedRuleId?: string;
}
```

Aliases are scoped to content/context. Fuzzy/ambiguous cases may route to Host adjudication; implementations must not silently invent equivalence.

## 9. Score Ledger

```ts
interface ScoreLedgerPort {
  apply(operation: ScoreOperation): Promise<ScoreLedgerEntry>;
  reverse(entryId: string, reason: AdjudicationReason): Promise<ScoreLedgerEntry>;
  totals(scope: ScoreScope): Promise<ScoreTotals>;
}

interface ScoreOperation {
  operationId: string;
  sessionId: SessionId;
  target: ParticipantId | TeamId;
  amount: number;
  category: string;
  sourceEventId: string;
  reasonCode: string;
}
```

No game/UI performs authoritative `score += x`. Corrections are new ledger operations/reversals; history is not silently rewritten.

## 10. Domain events

```ts
interface DomainEvent<T = unknown> extends VersionedContract {
  eventId: string;
  sessionId: SessionId;
  eventType: string;
  sequence: number;
  authorityEpoch: number;
  occurredAt: string; // authority time
  payload: T;
}
```

Events use a unified vocabulary. Consumers must not depend on UI-specific events as domain truth.

## 11. ProjectionService — information boundary

```ts
type ProjectionAudience =
  | { kind: 'PUBLIC' }
  | { kind: 'HOST'; participantId: ParticipantId }
  | { kind: 'TEAM'; teamId: TeamId }
  | { kind: 'PLAYER'; participantId: ParticipantId }
  | { kind: 'SITE'; siteId: SiteId };

interface ProjectionRequest {
  sessionId: SessionId;
  audience: ProjectionAudience;
  stateVersion?: number;
}

interface ProjectionService {
  project(request: ProjectionRequest): Promise<ProjectionEnvelope>;
}
```

**Invariant:** unauthorized hidden state is absent from serialized output, not merely visually hidden.

## 12. Stage orchestration

```ts
type StagePresentation =
  | 'LOBBY' | 'GAME_INTRO' | 'ROUND_INTRO' | 'CHALLENGE'
  | 'ANSWER_LOCKED' | 'ANSWER_REVEAL' | 'RESULT' | 'SCOREBOARD'
  | 'REVIEW' | 'INTERMISSION' | 'GAME_COMPLETE' | 'EVENT_COMPLETE';

interface StageCommand<T = unknown> {
  commandId: string;
  presentation: StagePresentation;
  target: StageTarget;
  payload: T;
  executeAtAuthorityTime?: string;
}

interface StageOrchestrationService {
  present(command: StageCommand): Promise<void>;
  currentState(target: StageTarget): Promise<StagePresentationState>;
}
```

Stage commands are semantic. They must not contain DOM selectors/component internals. Presentation scheduling never changes authoritative gameplay outcome.

## 13. DisplayEndpoint

```ts
interface DisplayEndpoint {
  descriptor(): DisplayDescriptor;
  render(state: StagePresentationState): Promise<void>;
  health(): Promise<EndpointHealth>;
}

interface DisplayDescriptor {
  displayId: DisplayId;
  siteId: SiteId;
  role: 'MAIN_STAGE' | 'SECONDARY_STAGE' | 'HOST_CONFIDENCE';
  capabilities: DisplayCapabilities;
}
```

Local, remote Shared and Hosted browser Stages implement the same semantic endpoint contract.

## 14. InputAction

```ts
type InputActionType =
  | 'BUZZ' | 'SELECT' | 'NAVIGATE' | 'SUBMIT' | 'PASS' | 'NO_BID'
  | 'CONFIRM' | 'CANCEL' | 'TEXT_INPUT' | 'ORDER_ITEMS';

interface InputAction<T = unknown> {
  type: InputActionType;
  payload?: T;
}

interface InputAdapter {
  capabilities(): InputCapability[];
  toAction(nativeInput: unknown): InputAction | null;
}
```

Games consume semantic actions/commands, never physical key codes/device APIs.

## 15. Identity and capabilities

```ts
interface ActorRef {
  participantId?: ParticipantId;
  siteId?: SiteId;
  role: string;
}

interface AuthorizationService {
  hasCapability(actor: ActorRef, capability: string, resource: ResourceRef): Promise<boolean>;
}
```

Identity answers *who/what is this?* Capability answers *what may it do?* Roles are not hard-coded authorization shortcuts inside games.

## 16. Authority clock

```ts
interface AuthorityClock {
  now(): AuthorityInstant;
  deadlineAfter(ms: number): AuthorityInstant;
}

interface ClockSynchronizationService {
  estimate(endpointId: EndpointId): ClockEstimate;
}

interface ClockEstimate {
  offsetMs: number;
  uncertaintyMs: number;
  sampledAt: string;
  quality: 'GOOD' | 'DEGRADED' | 'UNKNOWN';
}
```

Client time is advisory. Deadline acceptance uses authority time/policy.

## 17. RandomSource

```ts
interface RandomSource {
  nextInt(minInclusive: number, maxExclusive: number): number;
  shuffle<T>(values: readonly T[]): T[];
  snapshot(): RandomState;
}
```

Outcome-affecting randomization must be authority-controlled and reproducible when session replay requires it.

## 18. Network quality and fairness

```ts
interface NetworkQualityService {
  get(endpointId: EndpointId): NetworkQuality;
  readiness(requirements: NetworkRequirements, endpoints: EndpointId[]): ReadinessResult;
}

interface FairnessPolicyEngine {
  adjudicate(input: FairnessInput): FairnessDecision;
}
```

First-response arbitration considers authority arrival, robust recent measurements, jitter/uncertainty, bounded compensation and policy. `arrival - ping` is explicitly not the contract.

## 19. Persistence

```ts
interface SessionRepository {
  load(sessionId: SessionId): Promise<PersistedSession | null>;
  commit(commit: SessionCommit): Promise<CommitResult>;
  listResumable(): Promise<SessionSummary[]>;
}

interface SessionCommit {
  sessionId: SessionId;
  expectedVersion: number;
  snapshot?: AuthoritativeSnapshot;
  events: DomainEvent[];
}
```

Commit uses optimistic/state-version semantics. Persistence failures must not be reported as durable success when recovery guarantees require durability.

## 20. ContentRegistry

```ts
interface ContentRegistry {
  resolve(ref: ContentRef): Promise<PublishedContent>;
  validate(content: unknown): ValidationResult;
}

interface ContentRef {
  contentId: ContentId;
  revision: string;
}
```

Published content is revisioned and provenance-aware. Saved sessions pin revisions.

## 21. BibleTextService

```ts
interface BibleTextService {
  getPassage(request: PassageRequest): Promise<PassageResult>;
  capabilities(): BibleTextCapabilities;
}
```

Games request Scripture through this abstraction. They do not read KJV files/provider APIs directly. Translation licensing/caching/attribution rules remain provider/policy concerns behind the contract.

## 22. AssetRegistry

```ts
interface AssetRegistry {
  resolve(request: AssetRequest): Promise<ResolvedAsset>;
  readiness(requirements: AssetRequirement[]): Promise<ReadinessResult>;
}
```

Games reference logical asset IDs. Variant selection considers endpoint capability, locale, reduced motion and availability.

## 23. Runtime capabilities

```ts
interface RuntimeCapabilities {
  mode: 'LOCAL' | 'SHARED' | 'HOSTED';
  has(capability: string): boolean;
}
```

Games may ask for a capability when behavior genuinely depends on it; they should not branch on deployment mode when a capability/adapter can express the requirement.

## 24. Reconnect/resynchronization

```ts
interface ResynchronizationService {
  resume(request: ResumeRequest): Promise<ResumeResult>;
}
```

Authority decides committed state. Resume returns current authoritative projection/snapshot position and does not trust client state as truth. Duplicate submitted commands are handled idempotently.

## 25. Package manifest

```ts
interface PackageManifest extends VersionedContract {
  packageId: string;
  version: string;
  kind: 'GAME' | 'CONTENT' | 'ASSET' | 'TRANSLATION' | 'BUNDLE';
  dependencies: PackageDependency[];
  resources: PackageResource[];
  integrity: IntegrityDescriptor;
}
```

Activation requires integrity, schema and dependency validation. Data packages do not become arbitrary executable remote code.

## 26. CommunicationsProvider

```ts
interface CommunicationsProvider {
  capabilities(): CommunicationsCapability[];
  connect(ctx: CommunicationsContext): Promise<CommunicationsSession>;
  disconnect(): Promise<void>;
}
```

Communications is optional. It never carries authoritative gameplay state/commands and game runtime does not depend on media availability.

## 27. Host adjudication

```ts
type AdjudicationAction =
  | 'ACCEPT_ANSWER' | 'REJECT_ANSWER' | 'VOID_CHALLENGE'
  | 'REPLAY_CHALLENGE' | 'ADJUST_SCORE' | 'RESTORE_PARTICIPANT'
  | 'FLAG_CONTENT_PROBLEM';

interface AdjudicationCommand {
  action: AdjudicationAction;
  targetId: string;
  reason: AdjudicationReason;
}
```

Adjudication requires capability authorization and produces domain/ledger events. It does not silently mutate stored state.

## 28. Error contract

Cross-layer errors use stable reason codes rather than parsing English messages.

```ts
interface AgonError {
  code: string;
  category: 'VALIDATION' | 'AUTHORIZATION' | 'CONFLICT' | 'NOT_READY' |
            'NOT_FOUND' | 'DEPENDENCY' | 'INTERNAL';
  retryable: boolean;
  safeMessageKey: string;
  details?: Record<string, unknown>; // must obey privacy rules
}
```

User-facing/localized messages are presentation concerns. Sensitive state is not embedded in errors.

## 29. Compatibility rules

A change is **compatible** when old consumers can continue correctly without semantic reinterpretation. Examples: adding an optional field with defined default, adding a capability that is negotiated, or adding a new event type to a consumer explicitly designed to ignore unknown non-required event types.

A change is **breaking** when it changes meaning, removes/renames fields, makes optional data required, changes authority/ordering/security semantics, changes serialized enum meaning, or invalidates persisted data.

Breaking STABLE/LOCKED changes require:
1. ADR;
2. major contract/schema version change where externally serialized;
3. migration/negotiation strategy;
4. compatibility/conformance tests;
5. documentation and release note.

## 30. Contract test requirement

Each implemented contract must have at least one test at its boundary. Wire/persisted/package contracts require serialized fixture tests. Projection contracts require hidden-state leak tests. Runtime adapters must pass the same conformance suite. A game migration is not complete if it bypasses these contracts.