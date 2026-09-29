import { assertValidVersionRange, compareVersions, parseVersion, satisfiesVersionRange } from "./semver";
import {
  DuplicateCapabilityProviderError,
  DuplicateEngineError,
  InvalidEngineDescriptorError,
  UnknownCapabilityError,
  type CapabilityRequirement,
  type CapabilityResolution,
  type EngineFactory,
  type ResolvedEngineCapability,
} from "./types";

export class EngineRegistry {
  private readonly factoriesByEngineVersion = new Map<string, EngineFactory>();
  private readonly providersByCapability = new Map<string, ResolvedEngineCapability[]>();

  registerFactory(factory: EngineFactory): void {
    this.validateDescriptor(factory);

    const descriptor = factory.descriptor;
    const engineKey = `${descriptor.engineId}@${descriptor.version}`;
    if (this.factoriesByEngineVersion.has(engineKey)) {
      throw new DuplicateEngineError(descriptor.engineId, descriptor.version);
    }

    for (const capability of descriptor.provides) {
      const providers = this.providersByCapability.get(capability.capability) ?? [];
      if (providers.some((provider) => provider.capability.version === capability.version)) {
        throw new DuplicateCapabilityProviderError(capability.capability, capability.version);
      }
    }

    this.factoriesByEngineVersion.set(engineKey, factory);
    for (const capability of descriptor.provides) {
      const providers = this.providersByCapability.get(capability.capability) ?? [];
      providers.push({ descriptor, capability, factory });
      providers.sort((a, b) => compareVersions(b.capability.version, a.capability.version));
      this.providersByCapability.set(capability.capability, providers);
    }
  }

  resolveCapability(requirement: CapabilityRequirement): ResolvedEngineCapability | undefined {
    const providers = this.providersByCapability.get(requirement.capability) ?? [];
    return providers.find((provider) => satisfiesVersionRange(provider.capability.version, requirement.versionRange));
  }

  requireCapability(requirement: CapabilityRequirement): ResolvedEngineCapability {
    const resolved = this.resolveCapability(requirement);
    if (!resolved) {
      throw new UnknownCapabilityError(requirement);
    }

    return resolved;
  }

  resolveRequirements(requirements: CapabilityRequirement[]): CapabilityResolution {
    const required: ResolvedEngineCapability[] = [];
    const optional: ResolvedEngineCapability[] = [];
    const missingOptional: CapabilityRequirement[] = [];

    for (const requirement of requirements) {
      const resolved = this.resolveCapability(requirement);
      if (resolved && requirement.optional) {
        optional.push(resolved);
      } else if (resolved) {
        required.push(resolved);
      } else if (requirement.optional) {
        missingOptional.push(requirement);
      } else {
        throw new UnknownCapabilityError(requirement);
      }
    }

    return { required, optional, missingOptional };
  }

  listCapabilities(): ResolvedEngineCapability[] {
    return [...this.providersByCapability.values()].flat();
  }

  private validateDescriptor(factory: EngineFactory): void {
    const descriptor = factory.descriptor;
    if (!descriptor.engineId) throw new InvalidEngineDescriptorError("Engine descriptor requires engineId.");
    parseVersion(descriptor.version);

    if (descriptor.provides.length === 0) {
      throw new InvalidEngineDescriptorError(`Engine "${descriptor.engineId}" must provide at least one capability.`);
    }

    for (const capability of descriptor.provides) {
      if (!capability.capability) {
        throw new InvalidEngineDescriptorError(`Engine "${descriptor.engineId}" has a capability without an id.`);
      }
      parseVersion(capability.version);
    }

    for (const requirement of descriptor.requires ?? []) {
      if (!requirement.capability) {
        throw new InvalidEngineDescriptorError(`Engine "${descriptor.engineId}" has a dependency without an id.`);
      }
      assertValidVersionRange(requirement.versionRange);
    }
  }
}
