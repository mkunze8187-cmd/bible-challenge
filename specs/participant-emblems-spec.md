# Agon Team & Player Emblems Spec

## 1. Purpose

Today each player or team chooses a **name and color** (`Participant.color`, `DEFAULT_PARTICIPANT_COLORS` in `gameEngine.ts`; Players tab `playerColors`). This spec adds an **emblem**: an icon chosen from a curated set of Agon-style Bible symbols (Lion, Dove, Crown, Harp, Ark, …).

The color + emblem pair becomes the participant's identity everywhere: scoreboards, turn indicators, buzz order, Player Controllers, Host Remote, results, tournaments, and game boards.

Why:
- **Visual identity and energy:** it matches the game-show direction in `docs/designs/agon/Agon-Mockups.png`, where score cards currently show a generic person glyph.
- **Accessibility:** the design system requires that color never be the only signal (`agon-ui-ux-design-system-spec.md`, Product principles #5). An emblem distinguishes teams for color-blind players and in grayscale.
- **Pre-readers:** Kids Mode (#234) players aged 3–5 can recognize "we're the Lions" without reading team names.
- **Scripture:** every emblem carries a Bible reference and a one-line meaning, shown when it is picked ("Lion — the Lion of the tribe of Judah, Revelation 5:5"). Choosing a team emblem becomes a tiny Bible moment, in line with Agon's goal of sending players into the text.

## 2. Scope

In scope:
- A bundled, offline Agon Emblem set (SVG) with metadata.
- Emblem on every participant (individual player or team), and optionally on each team member.
- Emblem pickers in Players tab, game/Event setup, Phone join, and Host Remote.
- A shared `ParticipantEmblem` presentation component used across all surfaces.
- Persistence through settings, sessions, Events, and tournaments.

Out of scope (initially):
- User-uploaded images (style consistency, moderation, and licensing). See §12.
- Animated emblems beyond the shared celebration motion.

## 3. The Agon Emblem set

### 3.1 Style

- Consistent with the approved Agon brand (`Agon-Logo-and-Icon.png`): clean symbol silhouettes with a subtle gold accent, sitting on a **medallion** (circle with a thin gold rim) filled with the participant's color.
- Two drawings per emblem: **detailed** (≥48 px: projector, podiums, controller headers) and **simplified** (16–32 px: tables, buzz order, brackets), matching the logo's small-size rule in #99.
- Recognizable by silhouette alone at 24 px and in grayscale. No text inside emblems.
- Single-color symbol (white or near-white by default) on the colored medallion; the symbol color flips to dark automatically when the participant color is light, to maintain ≥3:1 contrast.
- No depictions of the face of God or Jesus; no violent imagery (the sword is the "sword of the Spirit," drawn sheathed/upright).

### 3.2 Starter set (36 emblems, 6×6 picker)

Each has an `id`, display name, reference, and short meaning. Card suit symbols from #131 (Scroll, Crown, Trumpet, Fish) are included and must share their drawings with the card system.

| Row | Emblems (reference) |
|---|---|
| Creatures | Lion (Rev 5:5) · Lamb (John 1:29) · Dove (Matt 3:16) · Eagle (Isa 40:31) · Fish (Matt 4:19) · Raven (1 Kings 17:6) |
| Creation | Sun (Mal 4:2) · Star (Matt 2:2) · Mountain (Ps 121:1) · Rainbow (Gen 9:13) · Vine (John 15:5) · Olive Branch (Gen 8:11) |
| Worship & Word | Scroll (Neh 8:5) · Lamp (Ps 119:105) · Harp (Ps 150:3) · Trumpet (Josh 6:20) · Tablets (Exod 31:18) · Cross (1 Cor 1:18) |
| Armor & Victory | Crown (2 Tim 4:8) · Laurel (1 Cor 9:25) · Shield (Eph 6:16) · Helmet (Eph 6:17) · Sword of the Spirit (Eph 6:17) · Sling (1 Sam 17:40) |
| Journey | Ark (Gen 6:14) · Boat (Mark 4:39) · Tent (Heb 11:9) · Shepherd's Staff (Ps 23:4) · Anchor (Heb 6:19) · Key (Matt 16:19) |
| Provision | Bread (John 6:35) · Basket (Mark 6:43) · Wheat Sheaf (Gen 37:7) · Oil Jar (1 Kings 17:16) · Water Jar (John 4:14) · Burning Bush (Exod 3:2) |

References are reviewed with the same biblical QA as content (#127 pattern). The set is extensible (§8).

### 3.3 Metadata

```ts
export type AgonEmblemId = string; // "lion", "dove", "crown", ...

export interface AgonEmblem {
  id: AgonEmblemId;
  name: string;                 // "Lion"
  category: "creatures" | "creation" | "worship" | "armor" | "journey" | "provision" | string;
  reference: string;            // "Revelation 5:5"
  meaning: string;              // "Jesus is called the Lion of the tribe of Judah."
  svgDetailed: string;          // bundled asset path
  svgSimple: string;            // bundled asset path
  packId: string;               // "core" for the starter set
  kidsFriendly: boolean;        // true for all starter emblems
  enabled: boolean;             // Admin can disable
}
```

Assets live with the core pack (`src/data/packs/core/emblems/` after #24; `src/renderer/assets/emblems/` before). SVGs are sanitized at build time and rendered as trusted bundled assets, never from user input.

## 4. Data model

```ts
export interface ParticipantMember {
  id: string;
  name: string;
  difficulty?: DifficultyFilter;
  emblemId?: AgonEmblemId;      // optional personal emblem (team members)
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  emblemId: AgonEmblemId;       // required after migration
  members: ParticipantMember[];
  turnCounter: number;
  difficulty?: DifficultyFilter;
}
```

- Session config gains `individualEmblems?: AgonEmblemId[]` and `teams[].emblemId`, `teams[].memberEmblems?`, alongside the existing `individualColors` / `teams[].color`.
- Persisted settings (Players tab) store emblems next to colors (`playerEmblems`, `teamEmblems`), with the same cleaning/migration path as colors (`cleanAppSettings`).
- Events and tournaments snapshot each entrant's identity (name, color, emblem) so brackets and history keep the emblem even if settings later change (#190–#197).

### 4.1 Rules

- **Unique per session/Event:** no two participants share an emblem. Colors keep their current rules; the pair (color, emblem) is always unique.
- **Defaults:** when none is chosen, assign deterministically from a default rotation (Lion, Eagle, Dove, Lamb, Crown, Shield, Star, Fish), skipping emblems already in use, so migration and quick-start always produce distinct emblems.
- **Members:** member emblems are optional and may repeat across teams (they're only shown alongside the team emblem). If absent, the member displays with the team emblem.
- **Disabled emblems:** if Admin disables an emblem that a saved team uses, the team keeps it (no silent changes); it just can't be newly picked.
- **Migration:** saved settings, snapshots, and sessions without emblems load with default assignment; nothing else changes.

## 5. Picker UX

- **Players tab / game setup:** each player/team card shows the medallion preview (color + emblem). Tapping it opens the **Emblem Picker**: a 6×6 grid grouped by row/category, emblems already taken shown as unavailable with who has them, the color palette alongside, and a detail line with name, reference, and meaning for the focused emblem. A "Surprise me" button picks a random available emblem.
- **Event setup (#195):** entrants carry their emblem into the Event; conflicts between saved teams resolve in setup before start.
- **Phone join (#13):** when a phone proposes a player/team, it may also propose an emblem from the available ones (shown on the phone at controller size). The host accepts as today; conflicts show "Taken, choose another."
- **Host Remote (#109):** view and change emblems before the game starts; locked during a game (change between games only), matching color behavior.
- **Admin:** enable/disable emblems, reorder the default rotation, preview all emblems on all participant colors (contrast check), and view references/meanings.
- **Accessibility:** the picker is fully keyboard and screen-reader navigable (grid semantics; each emblem's accessible name is its name plus "taken by Team X" when unavailable). Minimum 44 px touch targets.

## 6. Presentation (`ParticipantEmblem` component)

One shared component, `ParticipantEmblem`, renders the medallion at named sizes (`xs` 16, `sm` 24, `md` 40, `lg` 72, `xl` 160+) and chooses detailed vs simplified drawings automatically. It is used by `PlayerBadge`, `TeamBadge`, and `ScoreCard` (#101), so it appears everywhere those do:

- **Scoreboards / projector (#105–#107):** emblem replaces the generic person icon on score cards; active team's emblem gets the active-state treatment.
- **Turn and buzz:** turn indicator, buzz order list, "You're first!" winner screen shows the emblem large.
- **Player Controller (#111–#113):** header shows team emblem; buzzer screen may show the emblem subtly behind or above the buzzer; member-linked phones show the member's emblem when set.
- **Host Remote (#108–#110):** player/score lists and answering-participant selector.
- **Results and recap:** podium with large emblems; celebration motion (#114) uses the emblem, with Reduced/Off motion alternatives.
- **Tournaments (#192–#196):** bracket slots, standings tables, Event Championship seeding, saved Events dashboard.
- **Game boards:** Image Board team markers and route tokens (#282), board-game pieces (e.g., Bible Baseball runners, Wayfinder tokens), card-table seat markers (#136).
- **Team Play Styles (#294):** Random Tag reveal shows the team emblem with the chosen member.
- **Activity log:** small emblem before the participant name.
- **Text fallback:** everywhere an emblem appears, the participant name is also present or available as its accessible label; the emblem is never the only identifier.

## 7. Controller protocol and privacy

- `assignment` and `roster` messages gain `emblemId` (and member emblems for linked members). `roster-proposal` gains an optional proposed `emblemId`.
- Emblem SVGs are served to phones from the LAN server's fixed asset allow-list (security rule S3), cached by hash.
- Emblems are public identity, not secret; no privacy change beyond validating proposed ids against the enabled set (reject unknown ids).

## 8. Extensibility

- Themed or expansion packs may add emblems (e.g., a Christmas pack adds Manger, Shepherd's Lamp; a Pentecost pack adds Flame, Wind). Pack emblems follow the same style guide and metadata, and appear in the picker while the pack is available.
- Licensed-pack emblems load through the main process like other licensed assets.
- If a saved team uses a pack emblem that is no longer available, it falls back to its default rotation emblem with a one-time notice to the host.

## 9. Performance and offline

All emblems are bundled SVG, loaded once, and inlined as a sprite for the renderer. No network access. Controller copies are served locally. Total starter set target: ≤ 250 KB.

## 10. Testing

- Unit: default assignment is unique and deterministic; migration of legacy settings/sessions; uniqueness validation; disabled/pack-removed fallback.
- Data: every emblem has both drawings, a reference, a meaning, and passes contrast against every default participant color (automated check).
- Visual regression: `ParticipantEmblem` at every size on every default color, light/dark; score cards, buzz order, bracket, podium, controller header.
- Accessibility: picker keyboard/screen-reader flow; accessible names on every emblem instance; grayscale snapshot confirms teams remain distinguishable.
- E2E: set emblems in setup, play a game, confirm emblems on projector and a simulated controller; phone-proposed emblem accepted and rejected when taken.

## 11. Implementation phases (issues)

1. **Emblem set design and production:** style guide, 36 detailed + simplified SVGs, metadata with references/meanings and biblical QA, contrast check, bundling. (Card suit emblems shared with #131.)
2. **Data model, persistence, and migration:** `emblemId` on participants/members, config and settings fields, uniqueness and default assignment, Event/tournament identity snapshot, controller protocol fields.
3. **Picker UX:** Players tab and game setup picker, "Surprise me", phone join proposal, Host Remote, Admin enable/disable/order/preview.
4. **Presentation everywhere and release validation:** `ParticipantEmblem` component; integrate into badges, score cards, turn/buzz, controllers, Host Remote, results/podium, tournaments, boards, activity log; visual/accessibility/E2E tests.

## 12. Open decisions

- Whether to allow custom uploaded emblems later (for church or school logos). If yes: Admin-only upload, auto-fit to the medallion, local only, and a clear note that uploads aren't shared.
- Whether the Cross should be in the default rotation or only selectable (recommended: selectable, not a default, so default assignment never ranks teams by symbol).
- Whether individual players in `individual` mode should also get a personal member emblem distinct from their participant emblem (recommended: no; they're the same).
