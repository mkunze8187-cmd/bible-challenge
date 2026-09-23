# Bible Challenge Developer Guide

Bible Challenge is a Windows Electron desktop app with a companion Admin Console. The root package owns the main app and also declares the `admin` workspace, so most developer commands can be run from the repository root.

## Prerequisites

- Windows development machine.
- Node.js and npm.
- GitHub CLI (`gh`) only for release and PR work.

Install dependencies from the repository root:

```powershell
npm install
```

## Project Layout

- `src/` - Bible Challenge app source.
- `electron/` - Bible Challenge Electron main/preload files.
- `admin/` - Admin Console workspace.
- `tests/` - root Vitest and Playwright tests.
- `src/data/` - built-in game content and JSON schemas.
- `admin/src/data/schemas/` - vendored schema copies used by the Admin Console.
- `dist/` - generated root app build output.
- `release/` - generated root app installer output.
- `admin/dist/` - generated Admin Console build output.
- `admin/release/` - generated Admin Console installer output.

Generated folders are ignored by Git.

## Build

Build the Bible Challenge app:

```powershell
npm run build
```

This validates game data, typechecks the root app, and writes the Vite output to `dist/`.

Build the Admin Console:

```powershell
npm run build:admin
```

This runs the `admin` workspace build and writes output to `admin/dist/`.

Run typechecks without building:

```powershell
npm run typecheck
npm run typecheck:admin
```

## Run Locally

Launch the Bible Challenge desktop app:

```powershell
npm run start
```

Launch the Admin Console:

```powershell
npm run start --workspace bible-challenge-admin
```

Both `start` scripts build first, then launch Electron against the built `dist/` output.

## Test

Run root unit and game-engine tests:

```powershell
npm run test:run
```

Run Admin Console unit tests:

```powershell
npm run test:admin
```

Run Playwright/Electron smoke tests:

```powershell
npm run test:e2e
```

`test:e2e` builds both apps, then runs the `challenge`, `admin`, and `cross-app` Playwright projects through `scripts/run-e2e-smoke.mjs`.

Run E2E tests without rebuilding first:

```powershell
npm run test:e2e:fast
```

Use this only after `dist/` and `admin/dist/` are current.

Run visual regression tests:

```powershell
npm run test:visual
```

Update visual snapshots:

```powershell
npm run test:visual:update
```

Run the full local validation suite:

```powershell
npm run test:all
```

`test:all` runs data validation, both typechecks, root tests, admin tests, E2E smoke tests, and visual tests.

## Data And Schemas

Validate built-in game data:

```powershell
npm run check:data
```

When root game schemas change, refresh the Admin Console schema copies:

```powershell
npm run sync-schemas --workspace bible-challenge-admin -- --source ..
```

Before a release, verify the Admin Console schema copies are current:

```powershell
npm run verify-schemas-fresh --workspace bible-challenge-admin -- --source ..
```

## Package

Build the Bible Challenge Windows installer:

```powershell
npm run package
```

The installer is written to `release/BibleChallenge-Setup-<version>.exe`.

Build the Admin Console Windows installer:

```powershell
npm run package --workspace bible-challenge-admin
```

The installer is written to `admin/release/BibleChallengeAdmin-Setup-<version>.exe`.

If packaging fails with an `EBUSY` error under `release/win-unpacked` or `admin/release/win-unpacked`, close any running packaged app instance and rerun the command.

## Release Checklist

1. Confirm `main` is current and clean:

   ```powershell
   git switch main
   git pull
   git status --short --branch
   ```

2. Update both package versions together:

   ```powershell
   npm version <version> --no-git-tag-version
   npm version <version> --workspace bible-challenge-admin --no-git-tag-version
   ```

3. Update roadmap or release notes files as needed.

4. Run validation:

   ```powershell
   npm run test:all
   npm run package
   npm run package --workspace bible-challenge-admin
   ```

5. Commit, push, open a PR, and merge through GitHub.

6. Create or publish the GitHub release and upload the installer assets from `release/` and `admin/release/`.

## Common Commands

```powershell
npm install
npm run build
npm run build:admin
npm run start
npm run start --workspace bible-challenge-admin
npm run test:run
npm run test:admin
npm run test:e2e
npm run test:all
npm run package
npm run package --workspace bible-challenge-admin
```
