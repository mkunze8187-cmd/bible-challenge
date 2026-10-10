# Exodus — Sinai: Ten Commandments Encampment Classification

> **Status:** Design-approved gameplay specification. Implementation targets Agon vNext and follows the Exodus Journey's reusability-first architecture and canonical narrative policy. This is a proposed checkpoint specification, not evidence of an implemented game.

## Narrative placement and purpose

Within the Sinai chapter (Exodus 19–24), the LORD's descent at Sinai (Exodus 19:16–25) precedes presentation of **the Ten Commandments as Scripture** (Exodus 20:1–17). Present the commandments progressively and distinctly before any classification gameplay, then include the people's response (Exodus 20:18–21) in the narrative transition. Gameplay does not replace or rewrite the canonical account.

The classification activity is a lively, repeatable **learning game**: players find people moving around Israel's encampment, privately read a biblical action and its relevant Scripture, then classify it by an applicable commandment and whether that commandment was **obeyed** or **disobeyed**. The scene is one shared Main Stage, not separate boards per participant. Scripture understanding matters; pace must remain brisk.

## Participation and timing

- Support **individual player mode and both supported team modes**; integrate with the Agon participation-mode contracts rather than creating checkpoint-specific identity semantics. Multiple players on the same team may independently claim and resolve different people.
- Each **player** may have **at most one unresolved claim**. Do not impose a one-claim-per-team restriction.
- The host configures a fixed-duration round. **Default: 7 minutes**; presets **5, 7, 10, 15 minutes**.
- Main Stage displays the remaining time. When time expires, reject new claims but allow already claimed actions to be answered and evaluated before finalizing results.
- One shared encampment remains active during the round; the game does not pause for individual classifications or feedback.

## Shared Main Stage: living Sinai encampment

- Render a coherent Agon-styled Israelite encampment with **more than twelve people moving around**.
- Maintain **twelve numbered, selectable people (1–12)** during active gameplay, except for momentary claim/reassignment transitions. Numbers are **identifiers only** and reveal neither commandment nor moral classification.
- Numbered people stay in the **unobstructed foreground**, visibly moving, selectable, and not performing distracting ambient tasks. They have legible numbers plus a **subtle Agon-consistent highlight/outline**.
- Unnumbered background characters create atmosphere: carrying water, preparing food, tending fires, interacting with animals, gathering near tents, etc. These ambient activities **must not be assigned to numbered people**.
- Upon a successful claim, the claimed person **leaves the playfield**. Their number and highlight transfer to an eligible **unnumbered, freely walking person already in the scene**, who moves into the foreground; an additional unnumbered person enters to replenish the ambient population. No periodic/random transfer without a claim.
- Avoid hiding numbered people behind tents, scenery, or other obstructions.

## Claim input: interchangeable live modes

### Cursor/touchpad mode
- Each active player has a cursor on the shared Main Stage. The cursor includes **both the relevant identity icon and color** (team identity in team context; player identity in individual context). Never rely on color alone; maintain legibility when cursors approach or overlap.
- The phone controller offers a **relative-motion finger touchpad**, optionally styled with joystick imagery, plus a claim/select gesture. It is not a physical or on-screen stick that must be dragged by its handle.
- Authoritative target resolution must be responsive and consistent across LAN and hosted play; do not infer a successful claim solely from local animation.

### Number mode and fallback
- Alternative controller input displays **buttons 1–12**, corresponding to currently numbered people on Main Stage.
- The host can switch from cursor mode to number mode **mid-round** if latency or responsiveness is inadequate, without resetting claims, round timer, points, or question history. Keep mode transition deterministic and clear to all players.
- Both modes call the **same authoritative claim API**. First successfully registered claim of a target wins; unsuccessful concurrent claimers receive immediate nonblocking feedback.

### Claim lifecycle
1. An eligible player claims a currently numbered person.
2. The claim is atomically assigned to that **player**; the person exits and their number is recycled to an ambient person.
3. The claimant's cursor/claim controls are disabled while the player resolves the one outstanding action.
4. The claimant receives their **own** Bible action on the controller, selected according to their difficulty/content profile; the numbered target itself does not preannounce or determine the commandment.
5. Player scrolls to a commandment and presses **Obeyed** or **Disobeyed**, which **submits immediately**.
6. Server evaluates the complete pair, records points/penalty, and sends a brief right/wrong confirmation. For wrong answers, show correct accepted classification(s).
7. **Only after evaluation is confirmed**, reactivate that player's cursor or number controls. Submission without evaluation acknowledgment must not release the claim or permit duplicate submissions.

## Controller: action and Scripture, then rapid classification

Upon claim, display:
- A concise **description of the biblical action**;
- The **actual relevant Scripture text** and accurate reference (not merely a paraphrase or citation);
- A **three-line commandment wheel** displaying the previous, centered, and next choices; and
- Two prominent action buttons: **Obeyed** and **Disobeyed**.

The commandment wheel must support **direct finger dragging/swiping on the words**, smooth scrolling and snapping to the centered item. Optional **up/down arrow buttons** support those who prefer them. **The centered highlighted commandment is always the chosen commandment**: there is **no separate Select or Submit button**. Pressing either judgment button submits the centered commandment plus that judgment. Guard against accidental submission while the wheel is still moving; resolve the snap before accepting the action.

Scripture text may scroll **independently** from the commandment wheel. Keep the controller focused on the player's action; do not mirror the full Main Stage.

## Scripture excerpt policy

- Show **only the relevant verses or excerpt**, preserving the biblical meaning and enough context to support all accepted classifications.
- For a **partial verse**, use precise **a/b/c notation**, e.g. `Genesis 39:9b`, `Exodus 20:5a`, or `Genesis 39:7–9a`. Division boundaries must be validated against the **actual selected translation**, since punctuation and clause boundaries can differ.
- Clearly distinguish the short authored action description from verbatim Scripture; use ellipses to signal omitted words **within** a quoted excerpt where appropriate.
- Retain the full underlying passage reference for later study. Translation text must come from an available licensed/installed translation pack, not invented text.

## Classification correctness and content authoring

- Every authored action maps to a **set of valid pairs**: `(commandment_number, OBEYED | DISOBEYED)`.
- **Any one applicable pair** earns full credit. A player need not identify all applicable commandments.
- An action may support **multiple commandments**, and may legitimately support an **obeyed pair for one commandment and a disobeyed pair for another**. Both straightforward and mixed-direction scenarios are allowed when defensible from Scripture.
- Do not force a 50/50 balance of obedience versus disobedience across commandments.
- Each accepted pair requires an authored Scripture-grounded rationale. Avoid speculative or ambiguous classifications; test distractors/answer sets for defensibility.
- Example: Joseph refusing Potiphar's wife's advances (Genesis 39:7–12) can illustrate **commandment 7 / OBEYED**. Complex events must be broken into accurately worded actions where needed; e.g., David's adultery and his arranging Uriah's death should not be conflated into one unsupported judgment.
- Challenges are **unique per player within a round**, not globally unique; different players may independently receive the same action. Select profile-appropriate challenges and avoid repeating an action for that player until their eligible pool is exhausted. A compatible additional pool may be used when available; do not silently relax difficulty or fabricate content.

## Scoring: common pool with bounded accountability

- Every correctly classified action awards the **same standard base points** to **one shared pool**, regardless of action or player difficulty. The numerical base value is a configurable scoring parameter, not yet fixed here.
- Incorrect classifications add **zero** to the pool and record a deduction equal to **5% of one standard correct-answer value** against the responsible scoring participant (player or team as determined by participation mode).
- Unclaimed people add **zero** and incur **no penalty**.
- At round end, divide the shared pool equally among the scoring participants for the selected mode, then apply each participant's own accrued deductions.
- **Total deduction for any scoring participant is capped at 25% of that participant's final equal share of the common pool**. Never allow the final score below zero.
- Calculation: `share = sharedPool / scoringParticipantCount`; `deduction = min(wrongCount * 0.05 * basePoints, 0.25 * share)`; `final = max(0, share - deduction)`. Preserve score precision and apply established Agon rounding/display rules consistently. In team modes, players' mistakes accrue to their team as the responsible scoring participant; in individual mode, to that player.
- Do not award speed bonuses or points simply for claiming a person.

## Feedback, learning and replay

- After evaluation, provide **brief controller-only** right/wrong feedback; for incorrect answers immediately reveal the **correct commandment and Obeyed/Disobeyed judgment** (and any other accepted pairs as appropriate). Keep it nonblocking and release the cursor on confirmed evaluation.
- **No mandatory Continue button**, long explanation interstitial, or Main Stage teaching interruption. The shared encampment continues uninterrupted.
- **Answer history is unavailable during the timed round.** After the round, players may review their actions, submitted classification, accepted pairs, relevant Scripture and authored explanations at their own pace.
- The end-of-round review is **optional**, not a mandatory group-wide recap. Repeat plays must remain quick.

## Reusable Agon capabilities / contracts

Implement generally useful mechanics outside the Exodus checkpoint:
1. **Shared scene target population:** ambient actors, selectable actor tagging/highlighting, foreground visibility, replacement/reassignment, and exit animations.
2. **Atomic multi-user target claiming:** one unresolved claim per player, server arbitration, conflict feedback, player/target lifecycle, idempotent submit/evaluation/release, late timer cutoff.
3. **Virtual relative-motion touchpad and identity cursor:** icon + color, touch sensitivity, input event throttling and authoritative selection.
4. **Hot-swappable selection strategy:** cursor/touchpad versus numbered buttons, host-driven fallback without losing state.
5. **Three-line touch wheel selector:** direct swipe, centered committed value, optional arrow accessibility, snapping, and configurable final-action buttons.
6. **Multi-valid-pair classification engine:** profile-selected content, per-player uniqueness, multiple accepted answer pairs, rationale, validation.
7. **Shared scoring with bounded individual/team penalties:** common pool, equal shares, per-participant wrong-answer ledger and percentage cap.
8. **Translation-aware Scripture excerpt/citation rendering:** full/partial verse range, a/b/c labels, quote fidelity and translation-pack support.
9. **Nonblocking feedback and post-round learning history:** correct answer reveal without mandatory pause.

The Sinai checkpoint configures the scene, Scripture content, ten-commandment choices, seven-minute preset, scoring parameters and narrative placement; reusable APIs must not embed Exodus-specific terms.

## Acceptance scenarios

- Twelve numbered, highlighted foreground characters remain selectable while unnumbered ambient characters carry out camp activities; a claimed character exits and the number transfers to a freely walking unnumbered character.
- Two players on one team can each claim a different target; one player cannot claim two simultaneously.
- Two clients race to claim the same target: only one authoritative claim succeeds, with clear feedback to the other.
- Cursor displays icon **and** color; touchpad moves it. Host switches to numbered buttons during the round without loss of timer, claims or score.
- Player swipes the **words** of the three-line wheel, optionally uses arrows, and submits by pressing Obeyed/Disobeyed with the center value; no extra confirmation button.
- A question accepts any Scripture-defensible valid pair, including mixed obedience/disobedience across different commandments; one accepted pair earns full points.
- Scripture excerpt labels partial verses correctly for the selected translation; postgame review retains full context.
- Correct classification increments shared pool by a uniform value. Wrong answer deducts 5% of base value from the responsible share, capped cumulatively at 25% of that final share. Unclaimed target is neutral.
- Feedback immediately shows accepted answer(s) for wrong classification, never pauses Main Stage, and releases player input **only after confirmed evaluation**.
- Timer expires at seven minutes by default: no fresh claims, existing claims may resolve, then results finalize. History becomes accessible only after the round.

## Content still to author

Build and review a sufficiently large, translation-compatible library of biblically grounded actions, valid pairs and explanations across all ten commandments and all supported difficulty profiles. The specification defines the mechanics; it does **not** assert that the content library or engine has been implemented.
