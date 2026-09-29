import { satisfiesVersionRange } from "./semver";
import type { EngineRegistry } from "./registry";
import type { CapabilityRequirement, EngineCapability, ResolvedEngineCapability } from "./types";

export interface EnginePackageManifest {
  manifestVersion: "engine-package-manifest.v1";
  packageId: string;
  engineRequirements: CapabilityRequirement[];
}

export type EngineReadinessIssueCode = "MISSING_ENGINE_CAPABILITY" | "INCOMPATIBLE_ENGINE_CAPABILITY";

export interface EngineReadinessIssue {
  code: EngineReadinessIssueCode;
  capability: string;
  versionRange: string;
  availableVersions: string[];
  message: string;
}

export interface PrepareEventEngineReadiness {
  ready: boolean;
  resolved: ResolvedEngineCapability[];
  issues: EngineReadinessIssue[];
}

export interface SharedEngineNegotiationResult {
  compatible: boolean;
  accepted: EngineCapability[];
  issues: EngineReadinessIssue[];
}

export function evaluatePrepareEventEngineReadiness(
  manifest: EnginePackageManifest,
  registry: EngineRegistry,
): PrepareEventEngineReadiness {
  const resolved: ResolvedEngineCapability[] = [];
  const issues: EngineReadinessIssue[] = [];

  for (const requirement of manifest.engineRequirements) {
    const match = registry.resolveCapability(requirement);
    if (match) {
      resolved.push(match);
      continue;
    }

    issues.push(createReadinessIssue(requirement, registry.listCapabilities().map((entry) => entry.capability)));
  }

  return { ready: issues.length === 0, resolved, issues };
}

export function negotiateSharedEngineCapabilities(
  requirements: CapabilityRequirement[],
  remoteCapabilities: EngineCapability[],
): SharedEngineNegotiationResult {
  const accepted: EngineCapability[] = [];
  const issues: EngineReadinessIssue[] = [];

  for (const requirement of requirements) {
    const match = remoteCapabilities.find(
      (capability) =>
        capability.capability === requirement.capability &&
        satisfiesVersionRange(capability.version, requirement.versionRange),
    );
    if (match) {
      accepted.push(match);
      continue;
    }

    issues.push(createReadinessIssue(requirement, remoteCapabilities));
  }

  return { compatible: issues.length === 0, accepted, issues };
}

function createReadinessIssue(
  requirement: CapabilityRequirement,
  availableCapabilities: EngineCapability[],
): EngineReadinessIssue {
  const availableVersions = availableCapabilities
    .filter((capability) => capability.capability === requirement.capability)
    .map((capability) => capability.version);
  const code: EngineReadinessIssueCode =
    availableVersions.length === 0 ? "MISSING_ENGINE_CAPABILITY" : "INCOMPATIBLE_ENGINE_CAPABILITY";

  return {
    code,
    capability: requirement.capability,
    versionRange: requirement.versionRange,
    availableVersions,
    message:
      code === "MISSING_ENGINE_CAPABILITY"
        ? `No engine capability "${requirement.capability}" is installed.`
        : `Engine capability "${requirement.capability}" is installed, but no version satisfies "${requirement.versionRange}".`,
  };
}
