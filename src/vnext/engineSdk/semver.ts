import { InvalidEngineDescriptorError } from "./types";

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

const VERSION_PATTERN = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;

export function parseVersion(version: string): ParsedVersion {
  const match = VERSION_PATTERN.exec(version);
  if (!match) {
    throw new InvalidEngineDescriptorError(`Invalid semantic version "${version}".`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2] ?? 0),
    patch: Number(match[3] ?? 0),
  };
}

export function compareVersions(left: string, right: string): number {
  const a = parseVersion(left);
  const b = parseVersion(right);

  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

export function satisfiesVersionRange(version: string, range: string): boolean {
  parseVersion(version);
  const trimmed = range.trim();
  if (trimmed === "*" || trimmed === "x") return true;

  if (trimmed.startsWith("^")) {
    const floor = trimmed.slice(1);
    const parsedFloor = parseVersion(floor);
    const parsedVersion = parseVersion(version);
    return parsedVersion.major === parsedFloor.major && compareVersions(version, floor) >= 0;
  }

  if (trimmed.startsWith(">=")) {
    return compareVersions(version, trimmed.slice(2).trim()) >= 0;
  }

  return compareVersions(version, trimmed) === 0;
}

export function assertValidVersionRange(range: string): void {
  const trimmed = range.trim();
  if (trimmed === "*" || trimmed === "x") return;

  if (trimmed.startsWith("^")) {
    parseVersion(trimmed.slice(1));
    return;
  }

  if (trimmed.startsWith(">=")) {
    parseVersion(trimmed.slice(2).trim());
    return;
  }

  parseVersion(trimmed);
}
