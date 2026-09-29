import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * ADR-001 guardrail 1/2/3: the legacy monolith (`src/lib/gameEngine.ts`) and the legacy
 * renderer shell (`src/renderer/App.tsx`) may keep depending on each other, but nothing
 * outside the legacy renderer/lib area may import them. vNext contracts/runtime/capabilities
 * and games must not import legacy implementations.
 */
export const LEGACY_ENTRY_POINTS = {
  gameEngine: "src/lib/gameEngine.ts",
  legacyApp: "src/renderer/App.tsx",
} as const;

const LEGACY_ALLOWED_DIRS = ["src/lib", "src/renderer"];

const SCAN_ROOTS = ["src", "electron", path.join("admin", "src")];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js"]);
const SKIP_DIR_NAMES = new Set(["node_modules", "dist"]);

export interface ImportViolation {
  file: string;
  importedEntryPoint: string;
}

function walk(root: string, dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIR_NAMES.has(entry)) continue;
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(root, fullPath, out);
    } else if (SCAN_EXTENSIONS.has(path.extname(entry)) && !entry.endsWith(".d.ts")) {
      out.push(path.relative(root, fullPath).replace(/\\/g, "/"));
    }
  }
}

export function collectSourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const scanRoot of SCAN_ROOTS) {
    const absolute = path.join(root, scanRoot);
    try {
      walk(root, absolute, files);
    } catch {
      // scan root doesn't exist yet (e.g. no electron/ TS files) - nothing to collect
    }
  }
  return files;
}

function isWithinLegacyAllowedDirs(relativeFilePath: string): boolean {
  const normalized = relativeFilePath.replace(/\\/g, "/");
  if (LEGACY_ALLOWED_DIRS.some((dir) => normalized.startsWith(`${dir}/`))) return true;
  // Top-level src/*.ts files (e.g. src/index.ts) are the package's public barrel today,
  // not vNext code - they may re-export the legacy engine until it's actually migrated.
  return /^src\/[^/]+\.tsx?$/.test(normalized);
}

function resolveImportTarget(relativeFilePath: string, importSpecifier: string): string | null {
  if (!importSpecifier.startsWith(".")) return null;
  const fileDir = path.posix.dirname(relativeFilePath.replace(/\\/g, "/"));
  const resolved = path.posix.normalize(path.posix.join(fileDir, importSpecifier));
  return resolved;
}

function matchesEntryPoint(resolvedImportPath: string, entryPoint: string): boolean {
  const entryPointNoExt = entryPoint.replace(/\.tsx?$/, "");
  return resolvedImportPath === entryPointNoExt || resolvedImportPath === entryPoint;
}

/**
 * Scans the given files for imports of the legacy entry points from outside the legacy
 * renderer/lib area. `fileContents` lets tests supply fixture content without touching disk;
 * real files are read from `root` when omitted.
 */
export function findLegacyImportViolations(
  root: string,
  files: string[],
  fileContents?: Map<string, string>
): ImportViolation[] {
  const violations: ImportViolation[] = [];
  const importPattern = /(?:import|export)\s+(?:[^"'()]*?from\s+)?["']([^"']+)["']/g;

  for (const relativeFilePath of files) {
    if (isWithinLegacyAllowedDirs(relativeFilePath)) continue;

    const source = fileContents?.get(relativeFilePath) ?? readFileSync(path.join(root, relativeFilePath), "utf8");

    let match: RegExpExecArray | null;
    importPattern.lastIndex = 0;
    while ((match = importPattern.exec(source)) !== null) {
      const resolved = resolveImportTarget(relativeFilePath, match[1]);
      if (!resolved) continue;

      for (const entryPoint of Object.values(LEGACY_ENTRY_POINTS)) {
        if (matchesEntryPoint(resolved, entryPoint)) {
          violations.push({ file: relativeFilePath, importedEntryPoint: entryPoint });
        }
      }
    }
  }

  return violations;
}
