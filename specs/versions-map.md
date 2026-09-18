# Versions Map

## Summary

Maps planned features to release versions for Bible Challenge and the Admin Console, and defines how version numbers are chosen.

- **Current version:** 0.1.9 (both apps, tag `v0.1.9`)
- **History:** every release so far (`v0.1.0` through `v0.1.9`) has been a patch bump, including the release that added six games and split out the admin console.

## Version Rules

The project uses `MAJOR.MINOR.PATCH`.

### Before 1.0.0

| Bump | Use for |
|---|---|
| **Minor** (0.x.0) | A new feature, game, mode, or player-facing capability. Any change to persisted data (`app-settings.json`, content pack schema). Any new system-level behavior (network listener, firewall prompt, new runtime dependency). |
| **Patch** (0.x.y) | Bug fixes, content updates, study notes, visual polish, dev-only changes (tests, scripts), and groundwork with no user-visible change. |

No major bumps before 1.0.0.

### From 1.0.0

| Bump | Use for |
|---|---|
| **Major** | A change that breaks existing saved data or custom content packs without automatic migration, or removes a feature users rely on. |
| **Minor** | Same as before 1.0.0. |
| **Patch** | Same as before 1.0.0. |

### Both Apps Move Together

- Bible Challenge and the Admin Console always share one version number.
- One GitHub release carries both installers (`BibleChallenge-Setup-*.exe` and `BibleChallengeAdmin-Setup-*.exe`), and each app's update check compares against its own version. Versions that drift make update prompts confusing.
- Bump both `package.json` and `admin/package.json` in the same commit, even when only one app changed.

## Release Map

| Version | Feature | Spec | Bump | Notes |
|---|---|---|---|---|
| 0.1.x | Automated testing, Steps 1-3 plus game tests and core screenshot baselines | `automated-testing-spec.md` | Patch | Dev-only apart from seeded randomness and `maxPrompts`. Ships with the next fix release, or no release at all. |
| **0.2.0** | Host Mode / Game Master Controls | `enhancement-spec-tournament-daily-host-map.md`, section 3 | Minor | Refactors every game's submit path. Adds Select Answering Participant, Mark Correct, Mark Incorrect, participant score selector, and multi-level undo. |
| **0.3.0** | Phone Mode, Stage 1: Buzz Only | `phone-buzzer-spec.md`, section 3 | Minor | First release that opens a network port. Triggers a Windows firewall prompt. Adds `ws` and `qrcode` runtime dependencies. |
| **1.0.0** | Stabilization milestone | — | Major (milestone) | No new features. Released once the 1.0.0 criteria below are met. |
| 1.x.0 | Phone Mode, Stage 2: Typed Answer | `phone-buzzer-spec.md`, section 4 | Minor | Or Stage 3 Choice Select first; see the open decision in the phone spec. |
| 1.x.0 | Phone Mode, Stage 3: Full Phone Interaction | `phone-buzzer-spec.md`, section 5 | Minor | Can split into several minors by step (Choice Select, Collect All, Map/medium games, board games). |
| 1.x.0 | Tournament / Season Mode | `enhancement-spec-tournament-daily-host-map.md`, section 1 | Minor | New persisted tournament data. |
| 1.x.0 | Daily Challenge Pack | `enhancement-spec-tournament-daily-host-map.md`, section 2 | Minor | Depends on seeded randomness from the testing spec for repeatable daily selection. |
| 1.x.0 | Bible Map Challenge | `enhancement-spec-tournament-daily-host-map.md`, section 4 | Minor | New game, new content schema, and map assets. Prerequisite for Phone Mode map interaction. |
| 1.x.0 | Themed content groundwork: pack model and Core split, categories, season calendar, predefined events, featured seasonal event | `themed-content-spec.md` | Minor | Moves all existing content into pack folders (no content change while every pack is free). Changes `All Challenges` to evergreen-only and extends saved event definitions. Ship with at least one pack (Christmas or Easter) so the feature is visible. |
| 1.x.0 | Content licensing: encrypted packs, offline license keys, locked previews | `content-licensing-spec.md` | Minor | Must ship before the first paid pack. Payments are deferred. Requires the public releases-only repo (spec section 11) before outside users get builds. |
| 1.x.y | Each themed content pack (Christmas, Easter / Resurrection Day, Pentecost, Thanksgiving, Mother's Day, Father's Day, New Year, Biblical Feasts) | `*-content-pack-spec.md` | Patch | Content only once the groundwork has shipped. Time each pack to land a few weeks before its season. |
| — | Remaining automated testing (admin, cross-app, full screenshots, CI) | `automated-testing-spec.md` | None or patch | Build when the admin console is next changed, or between features. |

The order of the `1.x.0` rows is not fixed. Each gets the next minor number when it is scheduled.

## Dependencies Between Releases

- **0.2.0 Host Mode** needs the Layer 1 game play-through tests first. They are the safety net for the submit-path refactor.
- **0.3.0 Phone Mode Stage 1** needs Host Mode (prompt identity, host judging actions, buzz turn policy).
- **Themed content packs** need the themed content groundwork. Pack Daily pools need Daily Challenge; pack map mini-packs need Bible Map Challenge. Neither blocks a pack from shipping.
- **Phone Mode Stages 2 and 3** need Stage 1.
- **Phone Mode map interaction** needs Bible Map Challenge.
- **Daily Challenge** needs seeded randomness.

## 1.0.0 Criteria

Release 1.0.0 when all of these are true:

- Host Mode (0.2.0) and Phone Mode Stage 1 (0.3.0) are released and have been used in at least one real event without a blocking issue.
- Layer 1 game play-through tests and the Layer 2 game tests pass for every game.
- Screenshot baselines exist for the menu, all themes, and every game screen.
- Both apps tolerate settings keys they do not recognize (see Release Checklist).
- No known bugs that lose data or block running a game.

## Release Checklist

For every minor or major release:

- [ ] Bump `package.json` and `admin/package.json` to the same version.
- [ ] Run `npm run test:all` (once available) or the current test and check scripts.
- [ ] **Settings compatibility:** new keys in `app-settings.json` are optional with defaults, and each app preserves keys it does not recognize when writing the file. The two apps share this file, so an older admin console next to a newer game app must not wipe newer settings.
- [ ] **Content compatibility:** existing custom content packs still load. A schema change includes a migration or keeps old packs valid.
- [ ] Release notes list new features, changed behavior, and anything the host must do (for example, allow the firewall prompt).
- [ ] Tag `vX.Y.Z` and publish both installers in one GitHub release.

Additional items for specific releases:

- **0.2.0 Host Mode:** release notes explain Mark Correct / Mark Incorrect and that score buttons now target a chosen participant.
- **0.3.0 Phone Mode:** release notes include firewall guidance, the Private network profile requirement, the Mobile Hotspot fallback for guest Wi-Fi, and the venue checklist.
- **Bible Map Challenge:** check the installer size increase from map assets.

## Open Decisions

1. **1.0.0 timing.** This map places 1.0.0 right after Phone Mode Stage 1. The alternative is to wait until more of the 1.x features ship.
2. **Order of 1.x features.** Phone Mode Stages 2-3, Tournament, Daily Challenge, and Map Challenge have no fixed order yet.
3. **Phone Mode Stage 3 packaging.** Ship as one minor or one minor per step.
