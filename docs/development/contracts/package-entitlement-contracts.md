# Package, Entitlement & Event Preparation Contracts

**Status:** STABLE target contracts  
**Architecture:** PR #424 / `specs/architecture/packaging-installation-entitlements.md`

These contracts extend the main inter-layer API reference. Names may be refined during implementation, but responsibilities and authority boundaries are STABLE.

## PackageManifest

```ts
type PackageType =
  | 'GAME'
  | 'CONTENT'
  | 'BIBLE_TRANSLATION'
  | 'MEDIA_ASSET'
  | 'DOCUMENTATION'
  | 'BUNDLE';

interface PackageManifest {
  manifestVersion: number;
  packageId: string;
  packageType: PackageType;
  version: string;
  agonCompatibility: VersionRange;
  dependencies: PackageDependency[];
  capabilities: string[];
  resourceClass: 'CORE_REQUIRED' | 'INSTALLED' | 'OPTIONAL' | 'ON_DEMAND' | 'EVENT_REQUIRED' | 'CACHEABLE';
  entitlement?: PackageEntitlementRequirement;
  integrity: IntegrityDescriptor;
  documentation?: DocumentationContribution;
  migrations?: PackageMigrationDescriptor[];
}
```

Normal package payloads are data/resources, not arbitrary executable code.

## PackageManager

```ts
interface PackageManager {
  inspect(source: PackageSource): Promise<PackageInspection>;
  install(request: InstallRequest): Promise<InstallResult>;
  remove(request: RemoveRequest): Promise<RemoveResult>;
  update(request: UpdateRequest): Promise<UpdateResult>;
  repair(packageId: string): Promise<RepairResult>;
  resolve(requirements: PackageRequirement[]): Promise<ResolutionPlan>;
}
```

Mutation operations validate schema, integrity/signature, path safety, compatibility, dependencies, entitlement activation requirements where applicable, and saved-session/Event pins. Install/update uses staging and transactional/rollback semantics where practical.

## PackageRegistry

```ts
type PackageAvailability =
  | 'NOT_INSTALLED'
  | 'INSTALLED_LOCKED'
  | 'INSTALLED_AVAILABLE'
  | 'INCOMPATIBLE'
  | 'UPDATE_AVAILABLE'
  | 'REPAIR_REQUIRED'
  | 'PINNED';

interface PackageRegistry {
  get(packageId: string): PackageState | undefined;
  list(filter?: PackageFilter): PackageState[];
  getCapabilityProviders(capability: string): PackageState[];
}
```

`PackageRegistry` reports state. It does not make commercial licensing policy. Availability is derived from installation + compatibility + dependency + entitlement state.

## EntitlementService

```ts
interface EntitlementService {
  getStatus(entitlementId: string, context: EntitlementContext): Promise<EntitlementStatus>;
  listEntitlements(context: EntitlementContext): Promise<Entitlement[]>;
  activate(request: ActivationRequest): Promise<ActivationResult>;
  importOfflineEntitlement(blob: Uint8Array): Promise<ActivationResult>;
}
```

Product keys are accepted only by activation flows; games never receive or validate them. Durable offline authorization uses signed entitlement material validated with trusted public keys. Raw keys/certificates are sensitive and are not routine telemetry/log data.

Entitlement failure must not be represented as package absence. Stable reason/status codes distinguish `LICENSE_REQUIRED`, expired/invalid entitlement, missing package, incompatibility and provider-online requirements.

## Bible translation package/provider boundary

A translation package contributes a provider/corpus to `BibleTextService`; games never read translation package storage directly.

```ts
interface BibleTranslationDescriptor {
  translationId: string;
  language: string;
  publisher?: string;
  attribution: string;
  deliveryModel: 'LOCAL_REDISTRIBUTABLE' | 'LOCAL_ENTITLEMENT_CONTROLLED' | 'PROVIDER_BACKED';
  capabilities: BibleTranslationCapability[];
  entitlementId?: string;
  offlinePolicy: string;
  redistributionPolicy: string;
}
```

Shared mode exchanges capability/availability/entitlement-satisfaction metadata, not raw protected translation corpora or license credentials. Redistribution requires explicit package/license permission.

## EventPreparationService

```ts
interface EventPreparationService {
  analyze(eventId: string, sites?: SiteCapabilitySnapshot[]): Promise<EventPreparationReport>;
  prepare(plan: EventPreparationPlan): Promise<EventPreparationResult>;
}
```

Analysis resolves games/modules, content revisions, translations, assets/media, documentation, endpoint/runtime capabilities, package versions and entitlements before play.

Stable readiness classes include:
- `READY`
- `DOWNLOAD_REQUIRED`
- `PACKAGE_LOCKED`
- `LICENSE_REQUIRED`
- `INCOMPATIBLE`
- `REMOTE_SITE_MISSING_DEPENDENCY`
- `PROVIDER_ONLINE_REQUIRED`

Preparation may download/install/cache only resources the site is permitted to acquire. It cannot override entitlement or redistribution policy.

## Saved-session package pins

Persisted resumable state records effective package/content/translation dependencies required for safe restoration. PackageManager must query these pins before removal/update/cleanup. An operation either proves compatibility/migration, retains a compatible pinned version where supported, or is rejected with a stable dependency reason code.

## Shared negotiation

Shared sites negotiate safe metadata: protocol/runtime version, package IDs/version ranges/capabilities, translation availability/capabilities, required assets/content and entitlement satisfaction. Raw product keys, entitlement certificates and provider secrets are never part of session negotiation.

Sites require compatible capabilities, not byte-identical installations.

## Contract testing

Serialized manifests/certificates/readiness snapshots require versioned fixtures. Boundary tests must cover unknown schema versions, tampering, dependency conflicts, locked/unlocked transitions, offline entitlement validation, saved-session pins, protected translation non-redistribution and Shared compatibility.