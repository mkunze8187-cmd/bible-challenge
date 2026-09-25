# Agon: The Bible Challenge — UI/UX & Design System Specification

## Purpose
This specification defines the product-wide visual redesign and adaptive interaction system for **Agon: The Bible Challenge**: Challenge app, projector/audience view, Admin app, Player Controller (phone/tablet; formerly Phone Mode/Buzzer), and Host Remote (phone/tablet).

Existing functional specifications remain authoritative: `enhancement-spec-tournament-daily-host-map.md` (#94–#96), `phone-buzzer-spec.md` (#11–#20), `automated-testing-spec.md`, and `game-show-expansion-spec.md`. This spec adds branding, shared design architecture, adaptive layouts, accessibility, interaction presentation, and migration requirements without changing game rules/security/privacy unless an implementation issue explicitly says so.

## Authoritative visual references
The following files are part of this specification and are the **approved visual-design references** for implementation:

- `docs/design/agon/Agon-Logo-and-Icon.png` — approved logo, emblem/icon, navy/gold material treatment, crown/laurel/Bible/mountain visual language.
- `docs/design/agon/Agon-Mockups.png` — approved cross-surface design direction for Challenge home/game selection, standard gameplay, Bible Baseball, Player Controller/Buzzer phone + tablet, Host Remote phone, and Host Remote tablet.

These images are **design authority, not fixed pixel specifications**. Implementations must preserve their visual language while adapting according to this document's responsive, accessibility, role, and interaction requirements. Do not distort a mockup to fit another aspect ratio; reflow/recompose it.

When written requirements and a mockup differ because the mockup is illustrative, the written functional/security/accessibility requirements win. When the written spec leaves a visual choice open, follow the reference images before inventing a different style.

### What must remain visually consistent with the references
- deep navy base with warm metallic-gold identity/accent treatment
- premium, energetic game-show feel without neon-arcade excess
- mountain/sunrise imagery used selectively as atmosphere, not as visual clutter
- strong, readable light-on-dark hierarchy and dimensional but controlled panels/borders
- large, obvious primary actions and game-state hierarchy
- consistent Agon branding and logo placement appropriate to available space
- clear player/team color identity, large scores, and high-contrast timer/status presentation
- game-specific personality inside the common Agon shell
- touch-first controller controls with generous spacing and unmistakable states
- Host Remote phone = action-first; tablet = information-rich producer console

### What is illustrative rather than literal
- exact wording/question content, scores, player/team names, inning/count values, and example game catalog
- exact pixel positions/sizes at any one viewport
- the exact number of columns/panels when another viewport requires reflow
- the exact background artwork for every game
- controls shown only to illustrate a role; actual visibility remains governed by existing functional/privacy specs

### Mockup panel guidance
1. **Desktop Home / Game Selection** — visual target for branded Challenge navigation, game-card hierarchy, search, theme atmosphere, and scalable catalog presentation.
2. **Gameplay / Quiz Example** — visual target for GameShell, title/progress, large prompt, answer choices, timer, and player score strip. This is a family reference, not a requirement that every game use multiple-choice layout.
3. **Bible Baseball** — visual target for allowing a game-specific stadium/field personality while retaining Agon header, scoring, team identity, and control language. Private pitch selection must still obey the game/Phone Mode privacy requirements.
4. **Player Controller / Buzzer** — visual target for phone Ready/Winner states and a richer shared-team tablet state. Buzzer is only one Player Controller interaction; typed answers, choices, ordering, tiles, maps, etc. use the same design language.
5. **Host Remote / Phone** — visual target for one-handed prioritization of answerer, expected answer, judgment, timer, reveal/skip/next, undo, with secondary information progressively disclosed.
6. **Host Remote / Tablet** — visual target for the producer-console concept: controls + question/answer/teaching notes + timer/scores/buzz order visible together when space permits.

The Admin app is intentionally not pictured in `Agon-Mockups.png`; it must inherit the same brand/tokens/components while using the restrained productivity-console rules in this specification rather than copying game-show ornament literally.

## Product principles
1. One product family, role-specific experiences.
2. Adaptive, not merely responsive: layout and hierarchy change by available dimensions, aspect ratio, orientation, input capabilities, and role.
3. Game personality inside a consistent Agon shell.
4. Offline/event resilient; no essential runtime CDN dependency.
5. Accessibility is structural: color is never the only signal, keyboard/focus/reduced-motion/touch/readability are designed in.
6. Privacy by projection: Audience, Player, and Host render only role-appropriate data.
7. Incremental migration: shared primitives/shells first; games remain playable throughout.

## Brand
Product name: **Agon: The Bible Challenge**. Compact label: **Agon**.

Approved direction: deep navy, warm/dimensional gold, restrained mountain/sunrise imagery, laurel/crown competition motif, open-Bible motif, premium game-show energy without neon-arcade excess. Logo may be ornate; application chrome is cleaner and uses gold mainly as an accent.

Required asset family: full logo, horizontal logo, compact mark, detailed A icon, simplified 16–32px A icon, light/dark/monochrome variants, multi-resolution Windows `.ico`, favicon/web/controller icons. Document clear space/minimum sizes. Do not put essential UI text in raster artwork.

## Design tokens
Create shared semantic tokens for brand colors; correct/incorrect/unsolved/info/selected/active/disabled/connection/buzz states; surfaces; text; borders/focus; typography; spacing; radii; elevation; animation; layering; touch targets; audience safe margins.

Existing themes are retained and reinterpreted through tokens. Agon navy/gold becomes the flagship/default. Semantic meaning must remain stable across themes.

Correct = success + check + label. Incorrect = danger + X + label. Unsolved/timeout = warning + icon + label. Never color-only.

## Typography and icons
Define Display, Game Title, Prompt, Section, Body, Label, Caption, Numeric/Score scales. Essential fonts/icons are local/bundled. Use tabular numerals where useful. Projector typography scales with available space while enforcing readable minimums. One coherent icon style; interactive icons have accessible names.

## Shared component architecture
Create token-driven primitives such as `AgonButton`, `AgonIconButton`, `AgonCard`, `AgonModal`, `AgonDrawer`, `AgonTabs`, `AgonInput`, `AgonTextArea`, `AgonSelect`, `AgonToggle`, `AgonBadge`, `AgonCallout`, `AgonTable`, `AgonSidebar`, `AgonToolbar`, `ConnectionBadge`, `PlayerBadge`, `TeamBadge`, `ScoreCard`, `TimerDisplay`, `ProgressDisplay`, `AnswerOutcome`, `EmptyState`, `LoadingState`.

Host components are behaviorally shared between laptop and Host Remote through #94–#96: `HostAnswererPicker`, `HostJudgmentControls`, `HostTimerControls`, `HostScoreboard`, `HostAnswerPanel`, `HostNotesPanel`, `HostNavigation`, `HostBuzzOrder`, `HostConnectionStatus`. Do not build a duplicate remote-only behavior tree when a shared component fits.

## Adaptive layout model
Adapt to dimensions/aspect/input/role rather than named devices. Representative verification sizes:
- phones: 360x640, 390x844, 640x360, 844x390
- tablets: 768x1024, 820x1180, 1024x768
- laptops: 1280x720, 1366x768
- desktop: 1920x1080, 1920x1200, 2560x1440
- projector/TV: 1024x768, 1280x800, 1920x1080, 3840x2160

Use Grid/Flexbox, container queries where useful, `clamp()`, `aspect-ratio`, and safe-area variables. Reflow/orientation changes must never reset gameplay or in-progress controller input.

## Surface roles
### Challenge/operator
Information-rich but uncluttered. Home/game selection supports catalog growth via clear cards and filtering. Active games use a common Game Presentation Shell around game-specific content.

### Projector/audience
Oversized content, minimal chrome, clear timer/progress/player/scores, configurable safe margin, explicit 4:3/16:10/16:9 support. Never show host answers/notes/admin controls/debug/pairing/private submissions.

### Admin
Same brand/primitives but productivity-oriented: restrained gold, efficient sidebar/tables/forms/editors, Comfortable/Compact density where useful, keyboard-first workflows. Avoid decorative game-show styling that harms editing efficiency.

### Player Controller
“Buzzer” is one interaction mode. Support `buzz`, `choice-select`, `text-answer`, `number-input`, `private-choice`, `map-select`, `sequence-control`, `tile-control`, and grouping/matching where existing specs require them.

Text answers use native device keyboard and preserve Phone Mode requirements for Bible-name-friendly autocorrect settings, IME safety, visible submit, validation, stale-prompt protection, and review rules.

Ordering: large touch may use drag/reorder; phone may offer drag but always provides reliable tap/up/down movement; keyboard/accessibility always has a non-drag path; orientation changes preserve state.

Buzzer states are unmistakable: Joining, Ready, Armed, Buzz Received/Winner, Locked, Paused, Disconnected/Reconnecting. Armed buzz surface is extremely large and retains `pointerdown` behavior.

### Host Remote
#94–#96 remain functional/security authority. Phone portrait is action-first/one-handed with progressive disclosure. Tablet/landscape is a producer console with prompt/answer/notes/judgment beside timer/scoreboard/buzz order/game state.

Host Remote also presents game-board controls when required, including card ordering/board manipulation and native-keyboard text entry. All actions go through the shared host dispatcher; no second gameplay truth.

## Game Presentation System
Separate generic Design System primitives from `GameShell`, `GameHeader`, `PromptArea`, `GameBoard`, `PlayerStrip`, `ScoreStrip`, `RoundProgress`, `ResultReveal`, `RoundTransition`, `ControllerInteraction`, `ProjectorPresentation`.

Each game defines minimum playable dimensions, preferred aspect if any, compact/standard/expanded/projector layouts, Player Controller interactions, and Host Remote board interactions when needed. Game-specific art lives inside presentation regions while shared controls stay consistent.

## Interaction feedback
Standardize hover/focus/pressed/disabled/loading, selected/locked/submitted, correct/incorrect/unsolved, active/current-answerer, armed/winner/too-close, connection states, stale-command refresh, and network warnings.

Standardize optional audio for buzz winner/correct/incorrect/timer warning/round start/reveal/score. Optional controller haptics for armed/buzz/winner. Motion levels: Full, Reduced, Off; respect `prefers-reduced-motion`.

## Accessibility
Target WCAG 2.2 AA where applicable. Minimum 44x44 CSS-px targets; primary touch actions generally larger. Visible focus, logical tab order, accessible labels/roles, no hover-only controls, contrast across themes, reduced motion, screen-reader-friendly Admin/Host, non-drag controller alternatives, distance-readable projector content.

## Event resilience
Design explicit UI for reconnect/disconnect, wrong/expired session/pairing, paused/locked, stale prompt/state, device removal/reassignment, limited/unsupported interaction fallback, Public profile/firewall/client isolation, sleep recovery, server disabled, and mixed rooms. Failures explain the next useful action and never remove laptop fallback.

## Performance/offline
No essential runtime CDN. Lazy-load heavy game art where practical. Avoid layout-thrashing animation. Support older Windows laptops/lower-end phones; reduced effects where needed. Keep Player Controller payload/bundle small and preserve privacy projection architecture.

## Testing
Extend existing Vitest/Playwright/visual infrastructure. Add representative visual baselines across Challenge/Projector/Admin/Player/Host viewports; orientation preservation; keyboard/focus; touch/no-hover; theme state/contrast; optional axe scans; privacy leak tests; #95/#96 security tests. Use a matrix: all games at a standard viewport plus representative game families at compact/4:3/widescreen/controller layouts.

Visual regression review must compare implementation against the approved reference images for design-language drift as well as against automated baselines. Automated screenshot equality alone does not prove conformity to the Agon design direction.

## Ordered migration milestones
1. **Agon 1 — Foundation:** brand assets/name, tokens, primitives, adaptive shell, accessibility foundations.
2. **Agon 2 — Core Apps:** Challenge home/settings/common dialogs and Admin shell/forms/tables.
3. **Agon 3 — Game Presentation:** game shell/projector/result states/representative families, then all games.
4. **Agon 4 — Host Experience:** desktop Host Controls + responsive Host Remote using shared components; host board interactions.
5. **Agon 5 — Player Controller:** branded/adaptive controller and interaction primitives as underlying functional Phone Mode issues land.
6. **Agon 6 — Polish & Validation:** audio/motion/haptics, themes, accessibility, responsive/visual matrix, real-device/projector validation.

Existing feature issues can land before visual migration. Agon issues must not duplicate engine/network work already owned by #11–#20, #49–#51, #59–#71, #94–#96, etc.

## Redesign definition of done
- Branded Agon product family across Challenge/Admin/Projector/Host/Player.
- Implemented visual language remains recognizably consistent with `docs/design/agon/Agon-Logo-and-Icon.png` and `docs/design/agon/Agon-Mockups.png` while adapting rather than copying fixed pixels.
- Existing rules/scoring/content behavior retained.
- Projector usable at 4:3, 16:10, 16:9 and 4K-class resolutions.
- Desktop usable at representative 1280x720/1366x768 and above.
- Player/Host work phone portrait/landscape and tablet portrait/landscape.
- Ordering has non-drag fallback; typed entry uses native keyboards.
- Admin supports efficient keyboard workflows.
- State is never color-only.
- Essential operation remains offline.
- Existing privacy/security boundaries remain intact.
- Responsive, accessibility, visual, real-device and projector validation pass.
