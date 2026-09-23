# Bible Challenge Admin Console

Companion app to [Bible Challenge](..) — handles anything not directly related
to game play: content editing (create/edit rounds for any of the 28 games), play stats,
challenge ratings, and app updates.

## Setup

```
npm install
npm run sync-schemas --workspace bible-challenge-admin -- --source ..
npm run typecheck:admin
npm run build:admin
npm run start --workspace bible-challenge-admin
```

For the full build, run, test, package, and release workflow for both apps, see
the root [Developer Guide](../README.md).

## Keeping schemas in sync

This repo vendors (copies) the main app's JSON Schemas rather than reading them live from
its source tree — see the comment at the top of `scripts/sync-schemas.mjs` for why.
Whenever the main app adds or changes a game:

```
npm run sync-schemas --workspace bible-challenge-admin -- --source ..
npm run verify-schemas-fresh --workspace bible-challenge-admin -- --source ..   # run before cutting a release
```

## userData sharing

This app's `electron/main.js` calls `app.setName("Bible Challenge")` so it resolves the
same `userData` folder as the installed main app (Electron derives that path from
`app.name`, which two separate Electron apps do NOT share automatically). See
`scripts/smoke-test-user-data.mjs` for how to verify this by hand.

## Status

Content editor, stats/ratings tab, and the userData-sharing setup are implemented.
The Updates tab (porting the main app's GitHub-Releases update mechanism) and the
combined release-packaging script are still to come — see the project plan.
