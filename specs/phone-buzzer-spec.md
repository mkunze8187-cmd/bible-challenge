# Phone Buzzer Spec

## Contents

1. Overview
2. Shared Foundation
3. Stage 1: Buzz Only
4. Stage 2: Buzz + Typed Answer
5. Stage 3: Full Phone Interaction
6. Appendix A: Message Reference
7. Appendix B: Settings
8. Appendix C: Game Support Matrix

---

# 1. Overview

## Summary

Phone Mode lets players and teams use their phones in Bible Challenge, with no app install and no internet. It is delivered in three stages, each useful on its own:

| Stage | What phones do |
|---|---|
| 1. Buzz Only | Buzz in. The host judges spoken answers. |
| 2. Buzz + Typed Answer | The answering participant types the answer on the phone. |
| 3. Full Phone Interaction | Choices, collect-all classroom rounds, map taps, tiles, and sequences. |

This feature is intended for groups of kids. Many will not have their own phone, so shared team phones are a first-class case throughout.

## Prerequisite: Host Mode

Phone Mode requires the Host Mode work in section 3 of `enhancement-spec-tournament-daily-host-map.md`. The game engine is strictly turn-based today, and without Host Mode the buzz winner cannot be the one who answers or scores. Phone Mode depends on these Host Mode pieces:

- `getPromptId` and `sessionInstanceId`
- `setCurrentActor`, `markCorrectForHost`, `markIncorrectForHost`, `getHostAwardPoints`
- The grade / apply-outcome refactor of engine submit functions
- `BuzzTurnPolicy` and its per-game mapping
- Answerer-aware timer key and `answererTimerBehavior`
- Participant selector on score buttons
- Undo history with `promptId` and `buzzerSnapshot`

## Build Order

1. Host Mode Phases 1 and 2 (enhancement spec)
2. Stage 1: Buzz Only
3. Stage 2: Buzz + Typed Answer
4. Stage 3: Full Phone Interaction, starting with Choice Select and Collect All

**Open decision: Choice Select before Typed Answer.** Choice Select (Stage 3, Step 1) is a strong candidate to build before or alongside Stage 2:

- About ten games already accept a choice through a single engine call (Appendix C).
- Choices are already visible on the projector, so nothing private is exposed.
- Auto-apply is safe because there is no spelling ambiguity or host review.
- A classroom "everyone answers" mode has high value for kids' groups.

Typed answers bring phone autocorrect, spelling variance, and host-review overhead. Decide before starting Stage 2.

## Naming

- **Stages** are the three deliveries in this document.
- **Steps** are the work breakdown inside a stage.
- **Phase** is reserved for game prompt phases in the engine (`primary`, `steal`, `active`, `resolved`) and for the enhancement spec's own phases.

## Goals

- Let players buzz and answer from phones instead of the host keyboard or hand raising.
- No app install, no accounts, no cloud services, no internet dependency.
- Keep scoring, judging, reveals, and game flow under host control.
- Keep the projector as the shared display.
- Never block the host: the game always works without phones.

## Non-Goals

- Phones do not replace the host console or mirror the desktop UI.
- No remote internet play or online matchmaking.
- Not every game needs every interaction type.

---

# 2. Shared Foundation

Everything in this section applies to all stages.

## 2.1 Architecture

### Ownership

- **Renderer (React, `src/renderer/App.tsx`)** owns canonical game state (`SessionState`), scoring, and game rules. It remains the single source of truth.
- **Electron main process** owns the phone server, the device registry, and the **buzzer state machine**.
- **Phones** own nothing. They render a limited view and send requested actions.

The buzzer state machine lives in main, not the renderer, because the first-buzz lock must happen at packet receive time with no IPC round trip. The renderer tells main what the current prompt is and when to arm; main decides the winner and reports it.

```txt
Phone ──WebSocket──> Main process ──IPC──> Renderer (SessionState)
  ^                  • HTTP server          • engine + Host Mode actions
  │                  • WS server            • host UI
  │                  • device registry      • toPhoneView()
  │                  • buzzer state machine
  └──────────────────────── phone view <────────┘
```

Flow for a buzz:

1. Renderer sends `prompt-changed { promptId }` and `arm` over IPC.
2. Phone sends `buzz`. Main records receive time, applies fairness rules, and locks.
3. Main sends `buzz-winner` (with full buzz order) to the renderer and `state` to phones.
4. Renderer calls Host Mode `setCurrentActor`, then the host judges with Mark Correct or Mark Incorrect. The renderer sends an updated phone view back through main.

### Module Layout

- `electron/phone/server.js`: HTTP + WebSocket server lifecycle.
- `electron/phone/buzzerState.js`: pure state machine (no I/O), unit-testable with vitest.
- `electron/phone/devices.js`: device registry, tokens, assignments.
- `electron/phone/network.js`: adapter/IP selection, port selection, network profile checks.
- `src/lib/phoneView.ts`: pure `toPhoneView()` projection (see 2.12 Privacy).
- Phone page: a small static HTML/JS bundle with no framework, targeting older mobile browsers (ES2017). It must not load the main React bundle.

### Dependencies

- `ws`: WebSocket server. Node includes a WebSocket client but not a server.
- `qrcode` (or equivalent): QR code generation for the join URL.

Both are runtime `dependencies`, so electron-builder packages them.

### Server Lifecycle

- Start only when the host enables Phone Mode.
- Prefer port 4179. If it is in use, try the next ports in a small range and show the actual port.
- Stop when Phone Mode is disabled, and explicitly in `app.on("before-quit")`, not only in `window-all-closed`.
- Plain HTTP only. See 2.8 Screen Wake for why HTTPS is not used.

## 2.2 Protocol Conventions

Full message definitions are in Appendix A.

### Envelope

- Every message carries `v: 1`.
- Every gameplay message carries `promptId` (from Host Mode `getPromptId`). It identifies the question, not whose turn it is.
- Main and renderer reject any gameplay action whose `promptId` is not the current prompt.
- Main attaches `clientId` and `participantId` from the device registry. Phones never supply their own participant identity.

### Heartbeats

- Phones send `heartbeat` every 2 seconds while the page is visible.
- Frequent traffic keeps the phone's Wi-Fi radio out of deep power-save, which reduces buzz latency.
- Main marks a device `Disconnected` after about 6 seconds without traffic, but keeps its registry entry.
- Heartbeat responses carry timestamps so round-trip latency can be measured.

### Capability Reporting

Phones report only what a browser can actually detect. Whether a phone can perform an interaction (text entry, choices, map taps, tiles) is **not** detectable. It is established by the validation test.

```ts
interface PhoneCapabilities {
  viewportWidth: number;
  viewportHeight: number;
  orientation: "portrait" | "landscape";
  touch: boolean;
  pointer: "coarse" | "fine" | "unknown";
  vibrate: boolean;
  webSocket: boolean;
  userAgent: string;
}
```

Capabilities are sent on join and re-sent on orientation or viewport change.

### Interaction Readiness

```ts
type PhoneInteraction =
  | "buzz"
  | "text-answer"
  | "choice-select"
  | "map-select"
  | "sequence-control"
  | "tile-control";

type ReadinessResult = "passed" | "warning" | "failed" | "untested";

type PhoneInteractionReadiness = Record<PhoneInteraction, ReadinessResult>;
```

Readiness is derived from validation test results only.

## 2.3 Buzz Timing and Fairness

### Winner Determination

- Server receive time is authoritative. Phone clocks are never used.
- Only one buzz per participant (team or player) counts per buzz window.
- Main records the **full buzz order** with each buzz's offset from the first, not only the winner.
- If the second buzz is within `tooCloseThresholdMs` (default 50 ms) of the first, main still picks a winner but flags the result as **Too close**. The host decides whether to keep it or pick the other participant.

Wi-Fi delay varies by 100 ms or more between phones, especially when a phone's radio is in power-save mode. The Too close flag is an honest signal to the host, not a claim of precision.

### Phone Input Rules

- The buzz button fires on `pointerdown`, not `click`. `click` fires on release and adds delay.
- The phone **always sends** a buzz when pressed, regardless of what state it thinks the server is in. Players react to the projector and the host's voice, and the phone's "Armed" message may arrive late. Main decides whether the buzz counts.

### Arming Modes

```ts
type ArmingMode = "host-arms" | "auto-on-prompt" | "auto-after-delay";
```

- `host-arms` (default): the host arms buzzers after reading the question. Arm has a large button in the host panel and a keyboard shortcut.
- `auto-on-prompt`: buzzers arm as soon as a new prompt appears. Suitable for casual play where the question is read from the screen.
- `auto-after-delay`: buzzers arm `armDelayMs` after a new prompt appears.

Auto-arming at prompt start lets players buzz before the question has been read, which is why `host-arms` is the default.

### Early Buzzes

- A buzz received before arming is rejected with reason `too-early`.
- Optional early-buzz lockout: if `earlyBuzzLockoutMs` is greater than 0, a participant who buzzes early cannot buzz again until that time has passed after arming. Default 250 ms. Set to 0 to disable.
- The phone shows "Too early" feedback so players learn the rule.

### Host Feedback

- The desktop plays a buzz sound through the existing `src/renderer/audio.ts` when a winner is captured. The host is usually watching the room, not the screen.
- The host panel shows the buzz order with offsets, for example: `Red +0 ms, Blue +42 ms (Too close), Green +310 ms`.

## 2.4 Roster and Device Assignment

### Lobby Builds the Roster

The player roster is deliberately not persisted between launches (see the comment on `PersistedAppSettings` in `App.tsx`). Phone joins can fill in roster setup so the host types less.

Before a game starts:

- **Individual mode:** a phone that joins with a new name creates a **pending player**. The host accepts it into Players setup with one click, or merges it into an existing player.
- **Teams mode:** a phone picks an existing team or proposes a new team name, which the host accepts. A phone may also propose member names for its team, which the host accepts.

After a game starts, participants are fixed for the session. New phones can only be assigned to existing participants.

### Team Member Linking Is Optional

Many kids will not have their own phone, so one phone is often shared by several members of a team.

- The default link is **phone → team**. A team-linked phone is treated as a shared team phone.
- The host (or the phone, if allowed) may **optionally** link a phone to one or more specific members of that team.
- A member can be linked to at most one phone at a time. Linking a member to a new phone moves the link.
- Members with no linked phone are fine. They use a teammate's shared phone.
- Buzz ownership and scoring always belong to the **team**, regardless of member links.

What the phone shows on its team's turn:

- **Shared team phone:** "Your team's turn: Sarah is up", using the engine's existing member rotation (`Participant.members` and `turnCounter`). This helps kids know who should hold the phone.
- **Member-linked phone:** "Your turn, Sarah" when a linked member is up, otherwise "Your team's turn: Sam is up".

When no member rotation applies to the current game, the phone shows only the team name.

### Mixed Rooms (Some Participants Without Phones)

- In **teams mode**, a team without any phone plays through host selection (Host Mode Select Answering Participant) and verbal buzzing.
- In **individual mode**, a player without a phone cannot buzz fairly against phone players. The host panel shows a hint recommending teams mode when fewer phones are connected than players.
- The host can always record a buzz for a participant manually. A manual buzz is labeled "Host recorded" in the buzz order.

### Device Reassignment

The host can, without the player reconnecting:

- Assign a phone to a player or team
- Reassign a phone to a different player or team
- Link or unlink team members on a phone
- Rename the visible device label
- Unassign a phone
- Remove a phone from the session

Changes take effect immediately and are pushed to the phone.

### Multiple Devices Per Team

```ts
type TeamDevicePolicy =
  | "single-device"
  | "multiple-devices-first-counts"
  | "multiple-devices-all-submit";
```

- Multiple phones may be assigned to one team.
- Only the first valid buzz per team counts during a buzz window.
- The host sees which physical device buzzed first, but turn ownership and scoring belong to the team.
- In answer-submitting stages, the policy decides which team devices can submit (see Stages 2 and 3).

### Name Handling

Phone-entered names end up on the projector, so:

- Trim, strip control characters, and cap at 24 characters.
- A phone-entered name is not shown on the projector until the host has accepted or assigned it.
- The host can rename any team, player, member, or device label.
- Host approval of new devices is optional (`requireHostApproval`). When off, phones join the lobby automatically but still need assignment before their buzzes count.

## 2.5 Session Code and Security

### Threat Model

This is a local trivia game for groups, often kids. The goals are to stop unrelated devices on the same Wi-Fi from joining by accident or casual guessing, and to stop players from seeing answers or host controls.

It is **not** a goal to resist an attacker who can capture traffic on the local network. Traffic is plain HTTP, so the session code is visible to anyone sniffing the network. That is accepted for this use case.

### Session Code

- Generate a new 6-digit session code each time Phone Mode starts.
- Include it in the QR join URL. Require it for manual join.
- The host can regenerate the code. Devices already joined keep their session; new joins need the new code.
- Rate-limit join attempts per IP address (for example, 5 failures per minute).

```txt
http://192.168.1.42:4179/join?session=482913
```

### Input Limits

- Cap message size. Drop anything larger.
- Rate-limit buzzes and submissions per device.
- Validate every message shape. Ignore unknown types.
- Ignore gameplay actions from unassigned devices.
- Validate every action against the current canonical prompt.

## 2.6 Reconnect Handling

Reconnect is part of Stage 1, Step 1. Phones sleep, rotate, refresh, and drop Wi-Fi constantly.

- On first join, the phone generates a client token with `crypto.getRandomValues` and stores it in `localStorage`. (`crypto.randomUUID` is not available over plain HTTP.)
- On reconnect, the phone presents its token and session code. If the session is active, main restores its assignment and member links.
- Disconnected phones are marked in the host console, not deleted. The host removes stale devices manually.
- A phone that reconnects during a locked or resolved prompt rejoins in that state. It never reopens old controls.
- Some QR scanner apps open the link in a temporary browser view that does not keep `localStorage`. If a token is missing, the phone can **rejoin by name**: it picks its previous name from the list and the host confirms.

## 2.7 Phone Page UX Rules

- `touch-action: manipulation` to remove double-tap zoom delay.
- `overscroll-behavior: none` to stop pull-to-refresh, which reloads the page and drops the connection.
- Fill the screen with the team or player color when the phone wins a buzz, so the room can see who buzzed.
- Never use color as the only indicator. Always pair it with text ("You buzzed first").
- Vibration on buzz win is optional. It does not work on iOS Safari, so nothing may depend on it.
- Touch targets at least 44 px.
- Works in portrait and landscape.
- Dark, lightweight UI for battery life during long events.

## 2.8 Screen Wake

Phone Mode uses **plain HTTP**. The Screen Wake Lock API requires a secure context (HTTPS or localhost), so it is **not available** to phones on the LAN.

HTTPS was considered and rejected:

- Self-signed certificates show a full-page security warning on every phone, and WebSocket connections to self-signed certificates are unreliable on iOS Safari.
- Installing a local certificate authority on each phone is unrealistic for guests.
- A publicly trusted certificate would require internet access and a cloud service to issue per-install certificates, and would be blocked by many routers' DNS rebinding protection.

Instead:

- **Hidden looping video:** a tiny muted, inline video starts on the player's first tap and keeps most phones awake. This is the technique used by NoSleep.js. It is best-effort.
- **Fast reconnect:** a phone that sleeps rejoins in the current state within a second or two of waking.
- **Lobby guidance:** show "Keep this screen open" and optionally suggest setting auto-lock to 5 minutes for the event.
- Show a notice on the phone if it reconnects after sleeping.

## 2.9 Networking and Venue Readiness

### Adapter and URL

- Laptops often have several network adapters (VPN, Hyper-V, WSL, Docker). The auto-selected IP address is often wrong.
- The host panel shows the selected adapter and IP, and lets the host choose a different adapter. The choice is remembered.
- The host panel always shows the IP, port, and session code as text for manual entry, in addition to the QR code.

### Windows Firewall and Network Profile

- Windows may show a firewall prompt the first time Phone Mode starts. Host-facing text explains that Bible Challenge needs to be allowed on private networks.
- If the active network's Windows profile is **Public**, inbound connections are blocked even after allowing the app on private networks. Detect the profile (for example via `Get-NetConnectionProfile`) and warn the host with steps to fix it.
- Optional: the NSIS installer adds an inbound firewall rule for the app, since it already runs elevated.

### Wi-Fi That Blocks Phones

- Many guest and church networks use **client isolation**, which stops devices on the same Wi-Fi from reaching each other. No firewall setting on the laptop fixes this.
- Documented fallback: turn on **Windows Mobile Hotspot** on the host laptop and have phones join that network.
- Help text and the troubleshooter both mention this.

### Phones on Cellular Data

- A phone that is not on the same Wi-Fi fails silently.
- The host panel shows "Phones must join Wi-Fi network: *SSID*" (read from `netsh wlan show interfaces`).
- Optional: a second QR code that joins the Wi-Fi network (`WIFI:S:...;T:WPA;P:...;;`). The host enters the password; it is not persisted unless the host opts in.

### Troubleshooter

When no phones have joined after the QR code has been shown for a while, the host panel offers a checklist:

1. Is the phone on the Wi-Fi network shown?
2. Is the Windows network profile Private?
3. Was the firewall prompt allowed?
4. Can the host laptop's own browser open the join URL?
5. If all of the above pass, the Wi-Fi likely blocks device-to-device traffic. Use Windows Mobile Hotspot.

## 2.10 Device Readiness and Validation

### Device Statuses

- `Ready`: connected, assigned, and passed validation for the interactions the current round needs
- `Untested`: connected but validation was skipped. Never shown as Ready.
- `Limited`: connected but needs a fallback for at least one required interaction
- `Unsupported`: cannot perform the current round's interaction
- `Disconnected`: was connected and is no longer reachable

### Validation Test

Every stage includes a skippable validation test run from the host panel before play. The host clicks Test Phones, each phone runs the checks for the interactions enabled in the current event, and the host sees results per phone and per interaction.

Common checks:

- Phone can connect to the local server.
- Phone can receive server messages.
- Server can identify the assigned participant.
- Round-trip latency from heartbeats is within range (warning above 150 ms, failure above 500 ms).

Per-interaction checks:

| Interaction | Check | Stage |
|---|---|---|
| Buzz | Tap Test Buzz; main receives it | 1 |
| Text answer | Type and submit a shown test phrase; it arrives exactly. Connection survives the keyboard opening and closing, and Submit stays reachable with the keyboard open. | 2 |
| Choice select | Tap a named test choice and lock in | 3 |
| Map select | Tap a marked test pin | 3 |
| Sequence control | Reorder a three-item list into a shown order | 3 |
| Tile control | Build a short test word from tiles | 3 |

```ts
interface PhoneValidationResult {
  clientId: string;
  participantId?: string;
  status: "passed" | "warning" | "failed";
  readiness: PhoneInteractionReadiness;
  roundTripMs?: number;
  message: string;
}
```

After the test, the host can proceed, use a fallback, or remove a device. A phone that fails an interaction stays connected and falls back per participant (for example, Buzz Only fallback when text answer fails).

### Compatibility Matrix

The host panel shows one row per phone with a column for each interaction enabled in the event:

| Phone | Assigned To | Connected | Buzz | Text | Choice | Current Round |
|---|---|---:|---:|---:|---:|---|
| Team Blue phone | Team Blue (shared) | Yes | Passed | Passed | Passed | Ready |
| Old Android | Team Red | Yes | Passed | Failed | Passed | Buzz Only fallback |
| Sam's iPhone | Team Green (Sam) | Yes | Untested | Untested | Untested | Untested |

Round-level statuses: `Ready`, `Limited`, `Untested`, `Unsupported`, `Disconnected`.

Host round controls:

- Use full interaction for this round
- Use Typed Answer fallback
- Use Buzz Only fallback
- Disable phones for this round

## 2.11 Host Emergency Controls

Available at all times, including during an active round:

- Lock All
- Clear Current Buzz
- Reset Buzzers
- Record Buzz for Participant
- Disable Phones
- Remove Device
- Regenerate Session Code
- Fall Back to Host Control

## 2.12 Privacy

Phones receive only what their interaction needs.

Phones must not receive:

- Correct answers or aliases before reveal
- Study or teaching notes before reveal
- Admin settings or score override controls
- Full activity logs, unless intentionally shown
- Other participants' private submissions before host reveal

### Phone View Projection

- All data sent to phones goes through a pure, allow-list projection: `toPhoneView(state, participantId, context)` in `src/lib/phoneView.ts`.
- **Do not reuse `ProjectorSnapshot`.** It sends the full `sessionState`, including answers, to the projector window. That is acceptable for a local window and not for phones.
- Choice, tile, and sequence IDs are opaque per prompt, so answers cannot be inferred from IDs.
- A unit test builds a state for every game and interaction, serializes `toPhoneView()` output, and asserts that no answer, alias, or study-note string appears in it.

## 2.13 Projector Behavior

- The projector never shows the QR code or device management.
- Only host-accepted names appear.
- Optional displays: buzz winner after lock, connected teams during the lobby, submission count ("Answers submitted: 4/6"), selected team after host accepts, results after reveal.
- Private submissions are never shown before reveal unless the host enables it.
- The projector updates only from canonical desktop state.

## 2.14 Offline Fallback

Phone Mode never blocks the host from running the game.

- Disable phones for the current round.
- Continue with spoken answers and host-entered results.
- Use hand raising or verbal buzz-in, with Host Mode Select Answering Participant.
- Turning Phone Mode off keeps projector and game state intact.

The host can switch to fallback without restarting the app or losing the current round.

## 2.15 Persistence

Phone settings persist in the existing app settings file as a `phoneMode` object (Appendix B). Active device sessions, tokens, and assignments are **not** persisted across app restarts.

## 2.16 Testing

### Automated

- `buzzerState.js` unit tests: arming modes, early buzz lockout, first-buzz lock, one buzz per team, too-close flag, exclusion after incorrect, stale `promptId` rejection, reset and clear, snapshot restore.
- `toPhoneView()` leak test for every game and interaction.
- Protocol validation tests: malformed, oversized, unknown, stale, and ineligible messages are dropped.

### Phone Simulator

A dev-only page that opens N simulated phones in one browser tab. It can join, buzz with random or scripted timing, drop and restore connections, and submit answers. Used for:

- Load testing at the target scale of **50 connected phones**
- Reconnect and stale-prompt scenarios
- Demoing without real devices

### Real-Device Matrix

Before an event release, test on:

- Current iOS Safari
- An older iPhone (two iOS versions back)
- Current Android Chrome
- An older or low-end Android phone
- A phone that opens the QR link from a scanner app instead of the camera

### Venue Checklist

Include a short printable checklist in help content: laptop on power, Wi-Fi network name, Private network profile, firewall allowed, hotspot fallback ready, validation test run.

---

# 3. Stage 1: Buzz Only

## Summary

Phones act as wireless buzzers while the host keeps full control from the desktop. Phones do not submit answers. They only identify who buzzed first. This is the MVP: major live-event value with the smallest phone-side surface.

## Goals

- Players buzz from phones instead of the host keyboard or hand raising.
- Scoring and answer judging stay with the host.
- Integrates with Host Controls and projector mode.

## Non-Goals

- Phones do not submit answers or control boards.

## User Flow

1. Host starts Bible Challenge on the desktop.
2. Host enables Phone Buzzers from Host Controls.
3. App starts the local server and shows a QR code, join URL, Wi-Fi network name, and session code.
4. Players scan the QR code.
5. Each phone joins with a player or team name, or picks from the roster. In teams mode, member linking is optional; a shared team phone is the default.
6. Before the game starts, new names become pending roster entries the host accepts.
7. Host optionally runs Test Phones.
8. When a question is ready, buzzers arm (by default when the host clicks Arm).
9. First valid buzz locks the buzzers. The desktop plays a buzz sound, shows the buzz order, and makes the buzz winner the answering participant.
10. Host listens to the spoken answer and uses Mark Correct, Mark Incorrect, or Skip.
11. On Mark Incorrect, the host re-arms (or auto-rearm fires). The participant who missed cannot buzz again on this prompt.
12. On the next prompt, buzzers reset.

## Buzzer States

```ts
type BuzzerState =
  | "disabled"
  | "joining"
  | "ready"
  | "armed"
  | "locked"
  | "paused";
```

- `disabled`: server off or unavailable
- `joining`: lobby; phones may connect, buzzes do not count
- `ready`: a prompt is active but not yet armed; buzzes are rejected as `too-early`
- `armed`: first valid buzz wins
- `locked`: a winner is captured, or the prompt is resolved or timed out; further buzzes are ignored
- `paused`: host temporarily blocks buzzing

The state machine is keyed by `promptId`. A buzz carrying a different `promptId` than the current prompt is ignored.

## Reset Rules

- New prompt (`promptId` changes): state becomes `ready`; buzz order and exclusions clear. With `auto-on-prompt` it immediately becomes `armed`; with `auto-after-delay` it becomes `armed` after `armDelayMs`.
- Host clicks Arm: `armed`.
- First valid buzz: `locked`. Buzz winner becomes the answering participant (`setCurrentActor`). Timer follows Host Mode `answererTimerBehavior`.
- Host marks correct: prompt resolves; state stays `locked`.
- Host marks incorrect and the game allows another attempt: participant is excluded for this prompt. Host re-arms, or state returns to `armed` after `autoRearmDelayMs` when auto-rearm is on.
- `buzz-orders-steals` games: the primary attempt is turn-based with buzzers `ready`. When the prompt moves to steal, buzzers arm and buzz order sets steal order.
- `buzz-to-solve` games: buzzers stay armed during turn-based play; a buzz gives a solve attempt.
- `turn-based-only` and `not-supported` games: buzzers stay `ready` unless the host enables buzzing.
- Timer expires: `locked`.
- Game paused: `paused`.
- Undo: restores the buzzer snapshot saved with the Host Mode history entry.

Host buttons: Arm, Lock, Reset, Clear Winner, Record Buzz for Participant.

## Host UI

Phone Buzzers panel in Host Controls:

- Server status, selected network adapter, IP, port, session code, Wi-Fi network name
- QR code (host screen only)
- Connected phones with status, assignment dropdown, optional member links, rename, remove
- Pending roster proposals with Accept / Merge / Reject
- Buzzer state indicator
- Winner card with buzz order, offsets, and Too close flag
- Arm (large, with keyboard shortcut), Lock, Reset, Clear Winner, Record Buzz
- Mark Correct (with points) and Mark Incorrect next to the winner card
- Arming mode and auto-rearm settings
- Troubleshooter link when no phones have joined
- Teams-mode hint when individual players outnumber connected phones

## Phone UI

- Assigned team or player name, color, and optional linked member names
- Turn label for shared team phones
- Large Buzz button (fires on `pointerdown`)
- State text: Waiting, Get ready, Buzz now, Too early, You buzzed first, Someone else buzzed, Already tried
- Full-screen team color on buzz win
- Connection status and "Keep this screen open" guidance
- Lobby: choose an existing name or propose a new one; in teams mode, optionally pick "Who's using this phone?" with "Whole team (shared phone)" preselected

## Acceptance Criteria

- Host can start and stop Phone Buzzers without restarting the app or losing the current round.
- Phones on the same Wi-Fi can join from the QR code or by typing the IP, port, and session code.
- Phone joins create pending roster entries before the game starts.
- Host can assign phones to players or teams. Team member linking is optional, and a shared team phone works without it.
- Only the first valid buzz per participant counts, and the first valid buzz overall locks buzzers.
- Buzz winner becomes the answering participant, and Mark Correct scores that participant.
- Buzz order with offsets and the Too close flag are visible to the host.
- Buzzes before arming are rejected with Too early feedback.
- A participant who answered incorrectly cannot buzz again on the same prompt.
- Buzzers reset when `promptId` changes, and stale-prompt buzzes are ignored.
- A phone that reloads or sleeps rejoins with its assignment intact.
- Existing gameplay is unchanged when no phones are connected.
- `toPhoneView()` leak test passes for all games.

## Steps

### Step 1: Connect and Buzz

- Server lifecycle, port fallback, adapter selection, session code, rate limiting.
- Phone page: join, rejoin with token, rejoin by name, heartbeats, Buzz button.
- `buzzerState.js` with arming modes, early buzz handling, first-buzz lock, buzz order, Too close flag, `promptId` keying.
- Host panel: device list, assignment, Arm / Lock / Reset / Clear Winner, winner card, buzz sound.
- Integration with Host Mode `setCurrentActor`, Mark Correct, and Mark Incorrect.
- Unit tests for the state machine and `toPhoneView()`.

### Step 2: Roster and Room

- Lobby roster building and proposals.
- Optional team member linking and shared-phone turn labels.
- Multiple devices per team, device reassignment, name handling.
- Exclusion after incorrect, auto-rearm, `buzz-orders-steals` and `buzz-to-solve` support, undo snapshot.
- Projector winner display.

### Step 3: Event Readiness

- Validation test (buzz).
- Network profile detection, SSID display, troubleshooter, hotspot guidance.
- Hidden-video screen wake and reconnect-after-sleep notice.
- Emergency controls, including Record Buzz.
- Phone simulator and real-device test pass.

---

# 4. Stage 2: Buzz + Typed Answer

## Summary

Phones still act as buzzers, and the participant who is answering (usually the buzz winner) types the answer on the phone. The desktop shows an auto-grade suggestion for supported games, and the host accepts or rejects it. This reduces host typing and works well for text-answer games.

Requires Stage 1. See the open decision in Build Order about building Choice Select first.

## Goals

- Let the answering participant submit a typed answer from their phone.
- Keep host control over acceptance and scoring.
- Reuse engine answer matching for suggestions without mutating game state.
- Score host-accepted answers exactly like engine-graded correct answers.
- Keep spoken answers available as a per-round option.

## Non-Goals

- Not every game needs typed phone answers (Appendix C lists support).
- Phones do not manipulate boards.
- Everyone-submits mode is not part of this stage. It is **Collect All** in Stage 3, for both typed and choice answers.

## Answer Mode

```ts
type PhoneAnswerMode = "off" | "current-actor";
```

- `off`: phones only buzz. The host judges spoken answers (Stage 1 behavior).
- `current-actor`: the participant currently answering gets an answer form. For buzz games that is the buzz winner. For turn-based games (Step 3) it is the turn holder.

The host can switch a round between `off` and `current-actor` at any time, for example to hear a spoken answer instead.

## Shared Phones and Multiple Devices

- A shared team phone gets the answer form when its team is answering. Any child holding it can type.
- `multiple-devices-first-counts`: only the device that buzzed first gets the form.
- `multiple-devices-all-submit`: every device on the answering team gets the form. The **first submission** is the team's answer; other team devices switch to "Your team submitted".
- `single-device`: only the assigned device gets the form.

## User Flow

1. Host enables Phone Buzzers with typed answers.
2. Phones join and are assigned.
3. Buzzers arm. A team buzzes. Buzzers lock.
4. The answering team's phone shows the answer input. Other phones show the locked state.
5. Team submits.
6. Desktop shows the submitted text, the auto-grade suggestion (if supported), and the points Mark Correct would award.
7. Host chooses Accept, Reject, or Edit and Accept.
8. On Reject, the team is excluded for this prompt and buzzers re-arm per Stage 1 rules.
9. Phones reset on the next prompt.

If a team does not submit before the answer clock ends, the host can mark incorrect, wait, or ask for a spoken answer.

## Data Types

```ts
interface PhoneAnswerSubmission {
  id: string;
  promptId: string;
  clientId: string;
  participantId: string;
  answer: string;
  receivedAt: string;
  suggestion: AnswerCheckResult;
  status: "pending" | "accepted" | "rejected" | "ignored";
}

interface AnswerCheckResult {
  supported: boolean;
  isCorrect: boolean | null;
  confidence: "exact" | "alias" | "normalized" | "unsupported";
  normalizedAnswer: string;
  message: string;
}

type PhoneAnswerState =
  | "closed"
  | "open"
  | "submitted"
  | "team-submitted"
  | "reviewed";
```

## Auto-Grade Suggestions

Add a pure function next to the engine:

```ts
function checkAnswer(state: SessionState, participantId: string, answer: string): AnswerCheckResult;
```

- Built on the **grade** half of the Host Mode grade / apply-outcome refactor, which uses `isCorrectGuess` (`src/lib/gameEngine.ts:1031`) and `normalizeText`.
- Never mutates state.
- Returns `supported: false` for games without a grader.

### Applying the Host Decision

Host decisions go through Host Mode actions, **not** through engine submit functions:

- **Accept:** `markCorrectForHost(state, participantId, { answerText })`. A host-accepted misspelling scores as correct.
- **Reject:** `markIncorrectForHost(state, participantId, { answerText })`.
- **Edit and Accept:** the host corrects the text for the log, then Accept.

Optional setting `autoAcceptExactMatches`: when the suggestion is `exact` or `alias`, apply Accept automatically. The host can still undo. Default off.

## Host UI

Submitted answer panel, next to the Stage 1 winner card:

- Answering team or player
- Submitted text
- Auto-grade suggestion with confidence
- Points Mark Correct will award (editable)
- Accept, Reject, Edit and Accept
- Re-arm buzzers
- Switch this round to spoken answers

## Phone UI

Before buzzing: Stage 1 Buzz screen.

When answering:

- Prompt label (for example "Name the book"). No answer data.
- Text input with `autocapitalize="off"`, `autocorrect="off"`, `spellcheck="false"`, and `enterkeyhint="send"`. Autocorrect changes Bible names in unhelpful ways, and matching is already case-insensitive.
- Submit button that stays visible above the on-screen keyboard
- Character count near the limit
- Composition-safe input (IME) so submission does not fire mid-composition

After submitting: "Waiting for host", then the result if the host shows it.

## Reset Rules

- New prompt: submissions clear, answer inputs close, buzzers follow Stage 1 rules.
- Participant becomes the answerer: answer input opens for that participant's eligible devices.
- Submission received: input locks for that participant (`submitted`, or `team-submitted` on other team devices).
- Host rejects: that participant's input closes; buzzers re-arm per Stage 1.
- Prompt resolves: all inputs close.

## Abuse Prevention

- Answer length limit (default 80 characters).
- Strip control characters and trim whitespace.
- Rate-limit submissions per device.
- Reject submissions from participants who are not currently answering, and stale `promptId`.

## Acceptance Criteria

- Host can enable typed answers separately from Buzz Only, and switch any round to spoken answers.
- The answering participant can submit an answer from their phone, including from a shared team phone.
- Supported games show an auto-grade suggestion without changing game state.
- Accept scores exactly as a correct engine submission would, including for misspellings the host accepts.
- Reject applies the same consequences as an incorrect engine submission.
- Unsupported games fall back to host judgment.
- Phone inputs reset correctly between prompts, and stale submissions are rejected.
- A phone that fails text validation falls back to Buzz Only without disconnecting.

## Steps

### Step 1

- Answer form for the answering participant.
- Host review panel with Accept, Reject, Edit and Accept using Host Mode actions.
- Team device policies for answer submission.
- Text answer validation test.

### Step 2

- `checkAnswer` suggestions for games marked Yes in Appendix C.
- `autoAcceptExactMatches` option.
- `bible-anagrams` text-to-tiles adapter, or explicit no-suggestion handling.

### Step 3 (Optional)

- Turn-holder typed answers for `word-ladder`, `genealogy`, and `relay-verse-build`.

---

# 5. Stage 3: Full Phone Interaction

## Summary

Phones become controllers. Depending on the game, players pick choices, type answers, tap map locations, or use simplified board controls, while the host stays in charge of flow and scoring.

This stage also owns **Collect All**, where every participant submits privately before the reveal, for both choice and typed answers.

Requires Stage 1. Typed interactions require Stage 2. Choice Select (Step 1) does not depend on Stage 2.

## Goals

- Phones participate directly in supported game mechanics.
- Support everyone-answers classroom play.
- Keep host authority over flow, reveals, scoring overrides, and resets.

## Non-Goals

- Not every game needs full phone control in the first release.

## Play Styles

```ts
type PhonePlayStyle = "buzz-then-answer" | "collect-all";
```

- `buzz-then-answer`: Stage 1 buzzing picks who answers; the answering participant's phone shows the interaction.
- `collect-all`: every eligible participant's phone shows the interaction at once; submissions stay private until the host reveals.

## User Flow

1. Host enables Phone Interaction Mode and chooses a play style per game or per round.
2. Phones join and are assigned.
3. Host starts a supported game.
4. Desktop sends each eligible phone a `PhonePromptModel` built by `toPhoneView()`.
5. Phones submit actions.
6. Main checks `promptId`, assignment, and eligibility; the renderer validates against canonical state.
7. Renderer applies accepted actions through engine actions, or queues them for host review.
8. Projector updates from canonical desktop state.
9. On the next prompt, each phone receives a new model.

## Prompt Model

Phones receive a limited prompt model and send requested actions. They never own game state.

```ts
interface PhonePromptModel {
  promptId: string;
  gameId: GameId;
  participantId: string;
  interaction: PhoneInteraction;
  playStyle: PhonePlayStyle;
  title: string;
  promptText: string;
  choices?: PhoneChoice[];
  textInput?: PhoneTextInputConfig;
  mapPins?: PhoneMapPin[];
  sequenceItems?: PhoneSequenceItem[];
  tiles?: PhoneTile[];
  isLocked: boolean;
  turnLabel?: string;
}

interface PhoneChoice {
  id: string; // opaque; must not encode correctness or original order
  label: string;
}
```

- Built only by `toPhoneView()`.
- Choice order matches what the projector shows.

## Host Review Modes

```ts
type PhoneActionReviewMode = "auto-apply" | "host-confirm" | "collect-all";
```

- `auto-apply`: low-risk objective input, such as choice select in `buzz-then-answer`.
- `host-confirm`: text answers, ambiguous answers, or when the host wants control. Uses Stage 2 review.
- `collect-all`: every submission is held until the host reveals.

## Collect All

### Flow

1. Prompt opens. Every eligible phone shows the interaction.
2. Participants submit privately. A submission can be changed until the host locks, if `allowChangeBeforeLock` is on.
3. Projector shows only the count, for example "Answers submitted: 4/6".
4. Host locks submissions (or the timer ends).
5. Host sees a table: participant, answer, received order, grade suggestion, status. Text answers can be overridden per row.
6. Host reveals. The app applies scoring for all participants at once.

### Engine Requirement

Host Mode actions resolve a prompt for one participant. Collect All needs a new pure engine action that awards several participants and resolves once:

```ts
interface CollectAllResult {
  participantId: string;
  isCorrect: boolean;
  receivedOrder: number;
  answerText?: string;
}

function applyCollectAllResults(
  state: SessionState,
  results: CollectAllResult[],
  scoring: CollectAllScoring
): ActionResult;

type CollectAllScoring =
  | { model: "everyone-scores"; speedBonus: boolean }
  | { model: "first-correct" }
  | { model: "host-awarded"; pointsByParticipant: Record<string, number> };
```

It updates stats for every participant, records one resolved prompt, and is a single undo entry.

### Team Devices

- Shared team phone: the team submits once.
- `multiple-devices-all-submit`: the team's latest submission before lock counts, and every team device shows the current team answer so teammates don't overwrite each other unknowingly.
- Other policies: only the designated device submits.

## Scoring Models

- **First Correct:** first correct answer gets full points.
- **Everyone Scores:** every correct participant gets points, with an optional speed bonus by received order.
- **Host Awarded:** host awards points after reviewing submissions.

Recommended defaults:

- Buzz games: First Correct
- Classroom quiz rounds: Everyone Scores
- Text answers: Host Awarded or host-confirmed suggestions

## Phone UI Patterns

### Choice Select

- Prompt text
- 2-6 large choice buttons
- Tap to select, then Lock In (prevents accidental taps)
- Locked state shows the selected choice

### Text Answer

Stage 2 answer screen.

### Map Select

- Simplified map image
- Tappable pins, or tap-anywhere with a visible marker
- Confirm selected location

### Sequence Control

- Up/down buttons per item (reliable on all phones); drag optional
- Submit order

### Tile Control

- Tap tiles into the answer row
- Clear and backspace
- Submit answer

## Fallback

Fallback is automatic per participant and host-overridable. For example, if a map round needs `map-select` and one phone failed it, that team uses Buzz Only while others tap the map, or the host forces Buzz Only for everyone (2.10 host round controls).

Games not yet supported in this stage stay Buzz Only: the buzz winner tells the host the answer and the host operates the board.

## Action Rejection Rules

Every action is rejected when:

- `promptId` is stale
- The device is unassigned
- The participant is not eligible (not answering in `buzz-then-answer`, or already submitted with changes disabled in `collect-all`)
- The prompt is locked or resolved
- The interaction does not match the current prompt model
- IDs in the payload are not part of the current prompt model

## Reset Rules

- New prompt: send a new `PhonePromptModel` to eligible phones; clear submissions.
- Submissions locked: phones show locked state with their own answer.
- Prompt resolved: close inputs; optionally show the result.
- Next prompt: replace the model entirely.
- Host reset: clear submissions for the current prompt and resend the model.

## Acceptance Criteria

- Desktop sends a prompt model built only by `toPhoneView()`.
- Phones submit choices for all Choice Select games in Appendix C, in both play styles.
- Collect All holds submissions privately, shows only counts on the projector, and applies scoring for all participants in one undoable step.
- Main and renderer reject stale, ineligible, and malformed actions.
- Host can choose auto-apply, host-confirm, or collect-all per game.
- Phones that fail an interaction's validation fall back per participant.
- Unsupported games fall back to Buzz Only or Typed Answer.

## Steps

### Step 1: Choice Select

- `PhonePromptModel` and interaction-aware `toPhoneView()`.
- Choice Select for all choice games in `buzz-then-answer` with auto-apply or host-confirm.
- Choice validation test.

### Step 2: Collect All

- `applyCollectAllResults` engine action and scoring models.
- Collect All for choice and text answers, including team device behavior.
- Submission count on projector.

### Step 3: Map and Medium Games

- Map Select, after Bible Map Challenge (enhancement spec section 4) exists.
- Tile Control for `bible-anagrams`.
- Letter guesses for `bible-cryptogram` and `scripture-puzzles`.
- Turn-holder input for `word-ladder`, `relay-verse-build`, `genealogy`, if not done in Stage 2.

### Step 4: Board Games

- Sequence Control for `bible-timeline` and `bible-books-relay`.
- Tile and grouping controls for `verse-scramble`, `bible-connections`, match, and category games.
- Richer per-game phone UIs.

---

# Appendix A: Message Reference

All messages include `v: 1`. The **Stage** comment shows when each message is introduced.

## Phone to Server

```ts
type PhoneToServerMessage =
  // Stage 1
  | { type: "join"; sessionCode: string; displayName: string; clientToken: string; capabilities: PhoneCapabilities }
  | { type: "rejoin"; sessionCode: string; clientToken: string }
  | { type: "rejoin-by-name"; sessionCode: string; clientToken: string; previousName: string }
  | { type: "propose-participant"; name: string }
  | { type: "propose-member"; participantId: string; memberName: string }
  | { type: "link-members"; memberIds: string[] }
  | { type: "capabilities"; capabilities: PhoneCapabilities }
  | { type: "heartbeat"; sentAt: number }
  | { type: "buzz"; promptId: string | null }
  | { type: "validation-response"; testId: string; interaction: PhoneInteraction; payload: unknown }
  // Stage 2
  | { type: "submit-text"; promptId: string; value: string }
  // Stage 3
  | { type: "select-choice"; promptId: string; choiceId: string }
  | { type: "select-map-point"; promptId: string; x: number; y: number; pinId?: string }
  | { type: "submit-sequence"; promptId: string; itemIds: string[] }
  | { type: "submit-tile-answer"; promptId: string; tileIds: string[] };
```

For `buzz`, the phone sends the `promptId` it last received, or `null`. Phones send buzzes whenever pressed; main decides whether they count.

## Server to Phone

```ts
type ServerToPhoneMessage =
  // Stage 1
  | { type: "joined"; clientId: string; pending: boolean }
  | { type: "assignment"; participantId: string | null; participantName: string | null; color: string | null; linkedMemberNames: string[] }
  | { type: "roster"; participants: Array<{ id: string; name: string; color: string }> }
  | { type: "state"; buzzerState: BuzzerState; promptId: string | null; youAreExcluded: boolean; winnerIsYou: boolean; winnerName?: string; turnLabel?: string }
  | { type: "buzz-accepted"; place: number }
  | { type: "buzz-rejected"; reason: "too-early" | "locked-out" | "excluded" | "stale-prompt" | "unassigned" | "already-buzzed" }
  | { type: "validation-start"; testId: string; interaction: PhoneInteraction; payload: unknown }
  | { type: "heartbeat-ack"; sentAt: number; serverTime: number }
  | { type: "removed"; reason: string }
  // Stage 2
  | { type: "answer-state"; promptId: string; answerState: PhoneAnswerState; placeholder?: string; maxLength: number }
  | { type: "answer-received"; submissionId: string }
  | { type: "answer-rejected"; reason: "stale-prompt" | "not-answering" | "already-submitted" | "too-long" | "rate-limited" }
  | { type: "answer-result"; status: "accepted" | "rejected" }
  // Stage 3
  | { type: "prompt-model"; model: PhonePromptModel }
  | { type: "submission-locked"; promptId: string }
  | { type: "team-answer"; promptId: string; summary: string };
```

- `turnLabel` carries shared-phone text, for example "Your team's turn: Sarah is up".
- `answer-result` is only sent when the host chooses to show results on phones.

## Main to Renderer (IPC)

```ts
type PhoneDesktopEvent =
  // Stage 1
  | { type: "client-connected"; client: PhoneClient }
  | { type: "client-updated"; client: PhoneClient }
  | { type: "client-disconnected"; clientId: string }
  | { type: "roster-proposal"; clientId: string; kind: "participant" | "member"; name: string; participantId?: string }
  | { type: "buzz-winner"; promptId: string; buzzOrder: BuzzOrderEntry[]; tooClose: boolean }
  | { type: "buzzer-state-changed"; promptId: string | null; buzzerState: BuzzerState }
  | { type: "validation-result"; result: PhoneValidationResult }
  // Stage 2 and 3
  | { type: "phone-action"; clientId: string; participantId: string; action: PhoneToServerMessage };

interface BuzzOrderEntry {
  participantId: string;
  clientId: string | null; // null for host-recorded buzzes
  offsetMs: number;
  hostRecorded: boolean;
}
```

## Renderer to Main (IPC)

```ts
type PhoneRendererCommand =
  // Stage 1
  | { type: "prompt-changed"; promptId: string | null; policy: BuzzTurnPolicy; turnLabelsByParticipant: Record<string, string> }
  | { type: "arm" }
  | { type: "lock" }
  | { type: "reset" }
  | { type: "clear-winner" }
  | { type: "exclude-participant"; participantId: string }
  | { type: "record-buzz"; participantId: string }
  | { type: "assign"; clientId: string; participantId: string | null; memberIds: string[] }
  | { type: "remove-device"; clientId: string }
  | { type: "restore-snapshot"; snapshot: unknown }
  | { type: "start-validation"; interactions: PhoneInteraction[] }
  // Stage 2
  | { type: "open-answer"; promptId: string; participantId: string; placeholder?: string }
  | { type: "close-answer"; promptId: string; participantId?: string }
  | { type: "send-answer-result"; participantId: string; status: "accepted" | "rejected" }
  // Stage 3
  | { type: "send-prompt-models"; models: PhonePromptModel[] }
  | { type: "lock-submissions"; promptId: string };
```

---

# Appendix B: Settings

Stored in the app settings file as `phoneMode`. Timer behavior when a participant buzzes is the Host Mode setting `answererTimerBehavior`.

```ts
interface PhoneModeSettings {
  // Stage 1
  enabledByDefault: boolean;
  preferredPort: number;                 // default 4179
  preferredAdapterName: string | null;
  requireHostApproval: boolean;          // default false
  teamDevicePolicy: TeamDevicePolicy;    // default "multiple-devices-first-counts"
  armingMode: ArmingMode;                // default "host-arms"
  armDelayMs: number;
  earlyBuzzLockoutMs: number;            // default 250; 0 disables
  tooCloseThresholdMs: number;           // default 50
  autoRearmAfterIncorrect: boolean;
  autoRearmDelayMs: number;
  playBuzzSound: boolean;                // default true
  showWinnerOnProjector: boolean;

  // Stage 2
  answerMode: PhoneAnswerMode;           // default "current-actor" when Stage 2 is enabled
  maxAnswerLength: number;               // default 80
  autoAcceptExactMatches: boolean;       // default false
  showResultsOnPhones: boolean;

  // Stage 3
  fullInteractionEnabled: boolean;
  defaultPlayStyleByGame: Partial<Record<GameId, PhonePlayStyle>>;
  defaultReviewModeByGame: Partial<Record<GameId, PhoneActionReviewMode>>;
  collectAllScoring: CollectAllScoring;
  allowChangeBeforeLock: boolean;
  showSubmissionCountOnProjector: boolean;
}
```

The admin console can later expose per-game defaults.

---

# Appendix C: Game Support Matrix

Buzz behavior for each game follows the `BuzzTurnPolicy` mapping in the Host Mode spec. Every game except `verse-typing-race` supports Stage 1 buzzing (for `turn-based-only` games, when the host enables it).

| Game | Stage 2 typed answer | Stage 3 interaction | Engine entry point |
|---|---|---|---|
| `five-guesses` | Yes | Text | `submitBoardGuess` |
| `initials` | Yes | Text | `submitBoardGuess` |
| `name-that-book` | Yes | Text | `submitNameThatBookGuess` |
| `who-said-it` | Yes, when the prompt has no choices | Choice (Step 1) when the prompt has choices, otherwise Text | `submitWhoSaidItGuess` |
| `chapter-finder` | Yes | Text | `submitChapterFinderGuess` |
| `reference-rush` | Yes | Text | `submitReferenceRushGuess` |
| `missing-word` | Yes | Text | `submitMissingWordGuess` |
| `prophecy-clue-ladder` | Yes | Text | `submitProphecyClueGuess` |
| `scripture-puzzles` | Solve attempts only | Text solve; letter guesses (Step 3) | `submitScriptureSolve`, `submitScriptureLetterGuess` |
| `bible-cryptogram` | Solve attempts only | Text solve; letter guesses (Step 3) | `submitBibleCryptogramSolve`, `submitBibleCryptogramLetterGuess` |
| `bible-anagrams` | Needs text-to-tiles adapter, or host judges | Tile (Step 3) | `moveBibleAnagramTile`, `submitBibleAnagram` |
| `before-or-after` | No | Choice (Step 1) | `answerBeforeOrAfter` |
| `complete-the-verse` | No | Choice (Step 1) | `submitCompleteVerseChoice` |
| `wisdom-match` | No | Choice (Step 1) | `submitWisdomMatchChoice` |
| `psalm-theme` | No | Choice (Step 1) | `submitPsalmThemeChoice` |
| `psalm-reference-finder` | No | Choice (Step 1) | `submitPsalmReferenceFinderChoice` |
| `messiah-prophecy` | No | Choice (Step 1) | `submitMessiahProphecyChoice` |
| `fulfillment-finder` | No | Choice (Step 1) | `submitFulfillmentFinderChoice` |
| `odd-one-out` | No | Choice (Step 1) | `submitOddOneOutChoice` |
| `two-truths-and-a-lie` | No | Choice (Step 1) | `selectTwoTruthsStatement` |
| `word-ladder` | Optional turn-holder input (Step 3) | Text | `submitWordLadderStep` |
| `genealogy` | Optional turn-holder input (Step 3) | Text | `submitGenealogyStep` |
| `relay-verse-build` | Optional turn-holder input (Step 3) | Text | `submitRelayWord` |
| `bible-timeline` | No | Sequence (Step 4) | `reorderTimelineEvent`, `submitTimelineOrder` |
| `bible-books-relay` | No | Sequence (Step 4) | `reorderBibleBook`, `submitBibleBooksRelay` |
| `verse-scramble` | No | Tile (Step 4) | `moveVerseTile`, `submitVerseScramble` |
| `bible-connections` | No | Tile grouping (Step 4) | `toggleConnectionTile`, `submitConnectionGroup` |
| `prophecy-match` | No | Tile pairing (Step 4) | `selectProphecyMatchCard`, `submitProphecyMatch` |
| `parable-match` | No | Tile pairing (Step 4) | `selectParableMatchCard`, `submitParableMatch` |
| `prophecy-categories` | No | Tile grouping (Step 4) | `selectProphecyCategoryCard`, `selectProphecyCategory`, `submitProphecyCategory` |
| `proverb-categories` | No | Tile grouping (Step 4) | `selectProverbCategoryCard`, `selectProverbCategory`, `submitProverbCategory` |
| `verse-typing-race` | No | Not supported (WPM scoring is tied to a physical keyboard) | `submitVerseTypingResult` |
| `bible-map-challenge` | No | Map (Step 3) | Not built yet; proposed in enhancement spec section 4 |
