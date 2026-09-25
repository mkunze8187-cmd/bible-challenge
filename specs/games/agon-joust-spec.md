# Agon Joust — Game Specification

## Status
Candidate/backlog game. It may later be closed `not planned` without affecting shared tournament, challenge, controller, scoring, or persistence infrastructure.

## Design purpose
Agon Joust is a head-to-head Bible-knowledge game presented as a family-friendly medieval jousting tournament. Jousting is presentation and match metaphor; **Bible challenges determine every competitive result**. The game must never become a reflex/weapon-control game and must contain no betting, wagering, stakes, pots, or gambling presentation.

The defining mechanic is **simultaneous challenge delivery and simultaneous private response**:

> Both riders choose a challenge for the opponent → both choices lock → both receive the opponent's challenge → both answer privately → both answers reveal together on the main stage → one simultaneous jousting pass animates the result.

There is no attacker/defender turn and no counterattack phase.

---

## Competition capabilities
- simultaneous teams: exactly 2 for competitive match play
- optional future solo/computer-opponent mode; not required for initial release
- tournament eligible: **strongly yes**
- supported shared tournament formats: Single-Elimination, Double-Elimination, Round-Robin, Swiss, Round-Robin + Knockout
- Event Championship eligible
- ties supported only through defined tiebreak/sudden-joust flow
- normal Agon challenge points remain independent of match advancement

For 3–4 Event teams, selecting Joust should naturally offer/use shared Tournament Mode rather than attempting simultaneous multi-team play.

---

## Match structure
A match consists of a configured maximum number of **passes/rounds**:
- Quick: 3 passes
- Standard: 5 passes (recommended default)
- Custom: 3–5 passes

A match can end before all scheduled passes if a rider reaches the configured **Unhorsed Impact Threshold**.

At normal completion, the rider/team that inflicted the greater cumulative Impact wins the match. Ties enter Sudden Joust.

### Pass state machine
1. `CHALLENGE_SELECTION`
2. `SELECTION_LOCKED`
3. `CHALLENGE_DELIVERY`
4. `PRIVATE_ANSWERING`
5. `ANSWERS_LOCKED`
6. `SIMULTANEOUS_REVEAL`
7. `IMPACT_CALCULATION`
8. `JOUST_ANIMATION`
9. `PASS_SUMMARY`
10. `NEXT_PASS` or `MATCH_COMPLETE`

Server is authoritative for state, deadlines, answer correctness, Impact, threshold crossing, match outcome, RNG, scoring transactions, and progression.

---

## Challenge selection
Each rider privately selects a challenge to deliver to the opponent. The opponent cannot see the selection before both riders lock.

Challenge selection may expose:
- category
- difficulty
- challenge type where supported

Examples: People, Places, Events, Books, Who Said It?, What Happened Next?, Finish the Verse, Find It / Bible Navigation.

### Challenge inventory/rack
To prevent repeatedly selecting maximum difficulty, use configurable limited challenge resources. Recommended initial model is a **Challenge Rack** containing authored/generated challenge cards such as `People — Hard`, `Places — Medium`, `Books — Expert`, `Find It — Hard`.

Each team sees its own rack privately, selects one card to send, and the used card is consumed/replaced according to configuration. The server must prevent unavailable/duplicate consumption and must persist rack/order/state.

An alternate simple inventory may be supported by configuration (for example limited Hard/Expert uses), but implementation should use one shared abstraction rather than separate rules.

Challenge generation must guarantee an eligible question exists before a card can be offered.

---

## Simultaneous answering and reveal
After both challenge selections lock:
- Team A receives Team B's selected challenge.
- Team B receives Team A's selected challenge.
- questions appear privately on Player Controllers
- neither answer appears on projector while answering
- projector shows both riders preparing plus category/difficulty and neutral `ANSWERING` / `ANSWER LOCKED` status only
- one rider locking early provides no answer information to the other

When both lock or authoritative timers expire, freeze both answers. The projector then reveals **both questions, submitted answers, and correctness together** before/with the jousting resolution. Host correction/review, where permitted, must occur before final Impact commit/animation.

Typed, multiple-choice, ordering, and Bible-navigation challenges may participate if they implement the shared Challenge Engine result contract.

---

## Pass outcomes
The two challenge results resolve simultaneously.

| A answers challenge received | B answers challenge received | Result |
|---|---|---|
| Correct | Correct | **Clean Pass** — neither lance hits; 0 Impact both directions |
| Correct | Incorrect/timeout | **A lands a blow**; B receives Impact based on challenge A delivered |
| Incorrect/timeout | Correct | **B lands a blow**; A receives Impact based on challenge B delivered |
| Incorrect/timeout | Incorrect/timeout | **Double Miss** — neither lands a blow; 0 Impact |

Correct/Correct and Incorrect/Incorrect must have visually distinct animations: skilled clean pass/deflection vs unsuccessful miss.

No result may depend on which player submitted first. Answer speed may be retained as a statistic or optional very small tiebreak metric, but **must not determine normal Impact** unless a future explicitly configured mode is designed.

---

## Impact system
Impact is the match-domain measure of the blow received. It is **not Agon score and should not be presented as a videogame health bar**.

Potential Impact is determined by the difficulty of the challenge **delivered by the rider whose opponent failed it**.

Recommended initial tuning (configuration, not hard-coded forever):
- Easy: 1 Impact
- Medium: 2 Impact
- Hard: 3 Impact
- Expert: 4 Impact

The challenge the defender successfully answered never damages them. A challenge only produces Impact when the recipient answers incorrectly or times out and the challenge result is finalized as incorrect.

### Impact meter
Projector/Host may show `IMPACT RECEIVED` as a segmented tournament meter, e.g. `5 / 8`, rather than HP/damage terminology.

Impact accumulates across all passes in the current match. It resets for the next independent match unless a future Event rule explicitly says otherwise; tournament advancement does not carry physical/Impact disadvantage forward by default.

### Unhorsing threshold
Host/game configuration defines the threshold; recommended playtest starting point: **8 Impact**. When a rider reaches/exceeds it after a finalized pass, that rider is unhorsed and the match ends immediately unless both cross simultaneously.

Threshold and impact values require balancing/playtest configuration rather than scattered constants.

---

## Simultaneous unhorsing and ties
Because resolution is simultaneous, both riders can cross the threshold on the same pass. Never resolve this by submission order.

### Double Unhorsing
If both cross the threshold on the same pass:
- play a family-friendly Double Unhorsing animation
- preserve all Impact and Agon scoring
- enter `SUDDEN_JOUST`

### Normal-completion tie
If scheduled passes end with equal cumulative Impact, enter `SUDDEN_JOUST`.

### Sudden Joust
Both riders receive challenges at the same configured difficulty tier, with independently selected compatible categories/questions. Both answer simultaneously. Repeat passes until exactly one rider is correct and the other is incorrect/timeout; that rider wins the match.

Sudden Joust must remain symmetric and deterministic/recoverable. It does not retroactively alter normal-pass Impact totals. Normal challenge points from tiebreak challenges still follow Event scoring configuration.

---

## Scoring separation
Joust must use the shared tournament architecture's separate ledgers/concepts:

1. **Normal Agon challenge points** — awarded for correctly answering Bible challenges; retained by both teams even if they lose the joust.
2. **Joust Impact** — match-local competitive state used to determine unhorsing/match result.
3. **Tournament match result** — winner/loser/tie adapter used for bracket/standings progression.
4. **Tournament/Event placement bonuses** — handled only by shared tournament infrastructure.

Tournament progression is based on **Joust match result**, never on which team happened to earn more total Agon points during the match.

---

## Match statistics
Persist and expose appropriate public stats:
- passes completed
- clean passes
- blows landed
- cumulative Impact inflicted
- cumulative Impact received
- unhorsings
- correct/incorrect/timeout counts
- challenge difficulty/category performance
- optional answer-time statistics

Stats may be used by configured tournament tiebreak rules only when the tournament engine explicitly selects a supported metric. Do not silently use them to determine advancement.

---

## Tournament integration
Joust is a first-class two-team tournament game.

For shared Tournament Engine:
- result adapter emits winner/loser and tiebreak metadata
- support all five Agon tournament formats where participant count permits
- bracket/standings persist independently of Joust state
- Round-Robin can use W/L then configured metrics such as Impact differential
- Swiss uses shared pairing engine, not Joust-specific pairing logic
- RR→Knockout uses shared seed freeze and bracket engine
- Event Championship may select Joust for qualifiers, all knockout rounds, or a particular round

Projector transition may theme shared bracket/match presentation as a medieval tournament board while preserving the standard tournament data model.

---

## Player Controller UX
### Challenge selection
Private screen:
- `CHOOSE THEIR CHALLENGE`
- rack/cards showing category + difficulty + challenge type
- remaining/availability information
- confirm/lock action
- after lock: `CHALLENGE LOCKED — waiting for other rider`

### Answering
After both select:
- `YOUR CHALLENGE`
- category/difficulty
- question/reference/context allowed by Challenge Engine
- response control (MC/typed/ordering/etc.)
- Submit + explicit lock confirmation where needed
- after submission: `ANSWER LOCKED — waiting for other rider`

Never expose opponent answer before simultaneous reveal.

Responsive for phones/tablets, portrait/landscape, touch/keyboard, and accessible text sizing.

---

## Projector/main-stage UX
Main stage should emphasize spectacle without leaking private information.

Before pass: two riders at opposite ends of the lists, team identity, pass number, cumulative Impact Received.

Selection phase: neutral waiting state; do not expose chosen challenge until both are locked. After lock, show each delivered category/difficulty if configured.

Answer phase: `ANSWERING`/`LOCKED` indicators only.

Reveal: show both questions/answers/correctness in a balanced two-column or staged responsive layout, then animate the pass.

Animation outcomes:
- Clean Pass (both correct)
- Team A Hit
- Team B Hit
- Double Miss
- Double Unhorsing
- Single Unhorsing / match victory

Family-friendly: impacts are theatrical tournament contact, broken/deflected lance/shield effects, dust/hay and stylized unhorsing; no blood, injury detail, or realistic suffering.

Support Full / Reduced / Off motion. Reduced/Off must communicate identical outcome via static transitions/icons/text.

Projector layouts: 4:3, 16:10, 16:9 and common laptop/windowed sizes.

---

## Host Remote
Host sees:
- both teams/riders
- pass number / match maximum
- challenge selection status (not necessarily private rack contents unless Admin/Host inspection permission allows)
- answer status
- authoritative challenge/answer/correctness after lock
- correction/review before result finalization where Challenge Engine supports Host adjudication
- cumulative Impact and threshold
- pause/resume
- force timeout only through authorized flow
- void/replay pass with audited reversal
- match/tournament context and next match

Host cannot accidentally reveal one team's private answer early.

---

## Challenge/content requirements
The game should support broad Bible knowledge and Bible-navigation challenge pools. Categories/difficulties must be balanced enough that challenge selection represents meaningful strategy.

A difficulty tier should reflect actual content/response complexity. It must not merely multiply points/Impact on essentially equivalent questions.

`Find It`/Bible-navigation challenges can intentionally require opening Scripture and should receive sufficient time. The game should reinforce Agon's purpose: learning Scripture, reviewing/enhancing Bible knowledge, and encouraging players to dig further into the Bible.

After each pass or at match review (configurable), provide correct answer/reference/explanation without making the active match unbearably slow.

---

## Persistence and recovery
Persist authoritative versioned state including:
- match/pass IDs
- scheduled pass count
- current phase
- teams/riders
- challenge racks/inventory
- selected challenge IDs/config snapshots
- delivered question IDs/snapshots
- private submitted answers
- correctness/adjudication
- Impact transactions and totals
- Agon score transaction IDs
- RNG seed/state
- timers/deadlines
- animation/result acknowledgement state
- sudden-joust state
- final result adapter payload

Recovery must never regenerate a challenge, reroll a rack, reveal an answer early, duplicate Impact, duplicate Agon points, replay advancement, or change the winner.

Pass finalization should be idempotent and checkpoint before/after match progression.

---

## Accessibility/privacy/security
- private selections/answers delivered only to authorized controller projection
- projector payload must not contain unrevealed answer data
- keyboard and touch support
- non-color correctness/Impact indicators
- screen-reader labels for rack, answer, status and Impact
- Full/Reduced/Off motion
- animation is never required to understand outcome
- timeout accommodations configurable
- no betting/wagering mechanics

---

## Initial acceptance criteria
1. Two teams complete a 3- or 5-pass match with simultaneous private challenge selection and answering.
2. Neither challenge selection leaks before both selections lock.
3. Neither submitted answer leaks before simultaneous reveal.
4. Correct/Correct = Clean Pass, 0 Impact.
5. Wrong/Wrong = Double Miss, 0 Impact.
6. Correct/Wrong applies Impact to the wrong-answer team based on the difficulty of the challenge that team failed.
7. Impact accumulates across passes.
8. Threshold crossing immediately ends match with unhorsing unless both cross simultaneously.
9. Double Unhorsing and normal Impact tie enter symmetric Sudden Joust.
10. Scheduled-pass completion uses cumulative Impact to determine match winner.
11. Normal Agon points remain independent and are retained by losing team.
12. Joust result adapter advances the correct team through shared Tournament Engine.
13. 3–4 Event teams can use Joust via all eligible shared tournament formats.
14. Crash/reconnect at every pass phase restores exact state without reroll, leak, duplicate score, duplicate Impact, or duplicate advancement.
15. Projector supports 4:3/16:10/16:9 and Full/Reduced/Off motion.
16. Host correction/void/replay is audited and idempotent.
17. Challenge rack prevents unlimited high-difficulty spam and never offers an unavailable challenge.
18. Family-friendly animation contains no injury/gore.
19. No betting/gambling/wagering semantics appear anywhere.
20. Automated E2E covers every 2x2 correctness outcome, timeout combinations, early unhorsing, Double Unhorsing, normal tie, Sudden Joust, tournament advancement, and persistence recovery.

## Dependencies
- shared Challenge Engine/content/difficulty/category infrastructure
- Player Controller private input/typed answer/ordering capabilities
- Host Remote
- shared scoring ledger
- Tournament/Event work #189–#198
- persistent Game Session/Event infrastructure #190
- Timer where timed challenges are enabled
- responsive Agon visual system

No Joust-specific bracket, Swiss, Event Championship, generic challenge, or generic persistence engine should be created; reuse shared infrastructure.