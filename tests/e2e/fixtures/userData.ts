import { cp, mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const profilesRoot = path.resolve("tests", "e2e", "fixtures", "profiles");

export async function createUserDataDir(profileName = "clean"): Promise<string> {
  const userDataDir = await mkdtemp(path.join(tmpdir(), `bible-challenge-e2e-${profileName}-`));
  const profileDir = path.join(profilesRoot, profileName);

  if (existsSync(profileDir)) {
    await cp(profileDir, userDataDir, { recursive: true });
  }

  return userDataDir;
}

export async function removeUserDataDir(userDataDir: string): Promise<void> {
  await rm(userDataDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
}
