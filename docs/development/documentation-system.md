# Documentation & Help Development Guide

**Status:** STABLE target architecture  
**Audience:** game developers, platform developers, content authors, Admin developers, reviewers

Agon treats documentation as product functionality. A feature is not complete merely because its code works: the appropriate Player, Host, Admin, Parent/Teacher and/or developer guidance must ship with it.

See `specs/architecture/documentation-help-system.md` for the complete architecture.

## Where documentation lives

| Documentation | Canonical source | Delivered through |
|---|---|---|
| Game How to Play / Quick Start | structured game/package documentation | in-app Help, Help search, optional web/PDF |
| Player Help | core product documentation | Controller/Help Center, offline Local, web/PDF |
| Host Guide | core product documentation | Host Console Help, Help Center, PDF/print |
| Administration Guide | core/Admin documentation | Admin Console Help, Help Center, PDF/print |
| Parent/Teacher material | learning/content/game documentation | game Help, printable Dig Deeper/guide |
| Developer docs | `docs/development` | GitHub/repository; generated Developer Guide optional |
| Architecture specs | `specs/architecture` | repository; linked from developer docs |
| ADRs | `docs/development/adr` | repository |

PDF is a generated publication format, not a second canonical source.

## Required documentation for a game

Every publishable playable game must provide:
1. How to Play topic
2. Quick Start topic
3. objective
4. player/team requirements
5. basic round/turn flow
6. controls/semantic InputActions
7. scoring and completion/winning rules
8. difficulty/variant differences
9. special rules
10. Host-specific notes when needed
11. accessibility/special interaction notes
12. Parent/Teacher learning material when required for a kids/learning game

A game should be understandable without opening an external website.

Conceptual GameDefinition metadata:

```yaml
documentation:
  howToPlayTopic: games.wayfinder.how-to-play
  quickStartTopic: games.wayfinder.quick-start
  hostTopic: games.wayfinder.host
  parentTeacherTopic: null
  tutorialId: null
```

Do not hard-code help file paths or URLs into game logic. Resolve topic IDs through DocumentationRegistry.

## Writing a Quick Start

Quick Start is the material a player/Host reads immediately before playing. Prefer approximately 30-60 seconds for ordinary games.

Answer these four questions first:
- What am I trying to do?
- What do I do when prompted/on my turn?
- How do I score or finish/win?
- What unusual rule is most likely to surprise me?

Detailed edge cases belong in How to Play/Host notes.

## HelpContext integration

Every significant UI surface should be able to construct a HelpContext rather than link to a fixed page.

Examples:

```ts
openHelp({
  surface: 'HOST_CONSOLE',
  featureId: 'tournament.setup',
  role: 'HOST'
});
```

```ts
openHelp({
  surface: 'PLAYER_CONTROLLER',
  gameId: 'wayfinder',
  gamePhase: 'ANSWERING',
  role: 'PLAYER'
});
```

The resolver selects the primary topic and related topics. Do not place answer text/private state in HelpContext.

## Audience boundaries

Player help must never expose Host/Admin-only capabilities or hidden game information. Host help may explain adjudication and operations but should not reveal hidden answers merely because Help is open. Admin help may describe configuration/security operations subject to normal Admin authorization.

DocumentationRegistry participates in audience/surface filtering; it is not a replacement for application authorization.

## Offline rule

Core Local help must work with the network disconnected. Game help required to play an installed game must also be available locally.

External links may provide supplemental material, but cannot be the only explanation for a core feature or installed game's rules.

## Images, diagrams and instructional media

Use logical Asset Registry IDs for packaged documentation media. Provide alt text for meaningful images. Instructional video/audio requires captions/transcript or equivalent text guidance. Animated instruction respects Reduced Motion.

Prefer diagrams/screenshots only when they materially improve understanding; keep them versioned with the documentation they illustrate.

## Parent/Teacher documentation

Kids games should reuse the learning model:

**Hear it -> Play it -> Say it -> Take it home**

Documentation may render:
- Scripture reference/passage guidance
- gameplay-to-passage connection
- memory verse
- Dig Deeper card
- 2-3 authored discussion questions
- related passages/topics

Do not duplicate these values manually when they already exist in LearningMetadata/content schemas.

## Administration documentation

Every Admin feature should identify its documentation topic. Admin guide content should be task-oriented: installation/first run, Events, tournaments, translations, packs, content review, accessibility, controllers, Stages, Shared/Hosted, roles, backup/import/export, updates, diagnostics, privacy/security and recovery.

Host operations and full administration are separate documentation families. A family Host should not have to read package-management documentation to run game night.

## Developer documentation rule

When changing a STABLE/LOCKED contract, update `docs/development/contracts.md` and associated schemas/types/tests in the same change when practical. Significant/breaking architecture changes require an ADR according to `docs/development/adr/README.md`.

Developer guides should eventually include:
- Creating an Agon Game
- Creating/using an Engine
- Creating Content
- Creating a Package
- Translation Provider integration
- Stage/Display integration
- Conformance/game/accessibility testing

## PDF and printable output

PDF/print views are generated from canonical documentation. Do not maintain hand-edited PDF-only manuals.

Expected publications include Player Guide, Host Handbook, Administration Guide, Parent/Teacher materials and optional Developer Guide. Release automation should stamp product/document versions and validate generation.

## Documentation review checklist

For a game/feature PR ask:
- Does the correct audience know this feature exists?
- Can a first-time user perform the task from the documentation?
- Does Help work offline where required?
- Are controls and accessibility alternatives documented?
- Are rules/scoring consistent with executable behavior?
- Are screenshots/media still current?
- Are hidden/private values absent?
- Are topic IDs and links valid?
- Does the documentation version match the feature/game version?
- Does a contract change also update developer documentation?

## Testing expectations

Documentation CI/conformance should validate topic IDs, required game topics, links, assets, locale fallback, HelpContext mappings, package inclusion, PDF/static rendering, version compatibility and basic accessibility.

Game conformance should fail when required How to Play/Quick Start references are missing.

## Documentation Definition of Done

A change is documentation-complete only when its required audience-facing and developer-facing documentation is present, validated, version-compatible, and delivered through the appropriate Help surface. Documentation is part of the feature, not post-release cleanup.