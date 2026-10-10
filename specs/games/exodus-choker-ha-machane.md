# Choker ha-Machane (חוקר המחנה) — Camp Investigator

> **Status:** Design approved; implementation pending. **Parent:** Exodus Journey (#461), Sinai / Book of the Covenant (Exodus 20:22–23:33). **Architecture:** Agon vNext / ADR-001. This is the normative checkpoint design. No AI in gameplay.

## Purpose and invariants
A single cooperative Exodus checkpoint with a Host-configurable number of independent biblical legal investigation cases. Players examine incidents, identify laws, collect evidence, deliberate verbally, issue judgments and learn actual biblical consequences afterward. Canonical Scripture never changes. Maximum four teams; mixed ages supported; Bible-question difficulty always follows the explicit Player Profile, independent of case/mechanic difficulty (#461). Participation earns points, never speed, accuracy or verdict correctness. No betting. Investigators **do not prescribe penalties or restitution**.

## Checkpoint, pacing, persistence
- **Maximum 3 cases per session** (initial configuration 1–3). Host can change remaining count **between cases**, not above session limit. One Exodus Journey can span multiple sessions; no case may repeat within that Journey.
- Authored cases vary in length/complexity. Show estimated checkpoint/remaining duration ranges, update when settings change. **20 minutes per complete case is a target, not a hard limit** (introduction, charges, investigation, reporting, deliberation, confidence vote, review). At 20 minutes show **Host-only warning**, without pause, termination, penalty or forced decision.
- After review and report-generation attempt, show **Case Complete** screen; Host explicitly chooses Continue, Pause and Save, adjust settings, decide whether to reelect Choker Rashi, manage skipped cases, or End Checkpoint Early. No auto-advance. Early completion requires confirmation, records original/adjusted/completed counts, advances Journey.
- Planned Pause and Save **between cases** uses shared Agon session persistence (#616/#353); preserve journey/roster, completed cases/reports, leader, settings, RNG/selection, exclusions and progress. Unrevealed cases stay hidden. Recovery uses shared integrity checks, not an Exodus-specific mechanism.

## Random case selection and Host Preview
- Randomly select **one case immediately before it starts**, from enabled compatible Content Packs; favor diversity of biblical laws where possible without guaranteeing it. Select one variation, persist ID/version/RNG outcome for recovery. Never repeat a case or any of its variations in the same Journey; eligible again in a new Journey.
- Private Host Preview shows **selected variation only**: title/synopsis, biblical themes, age/content suitability, complexity and estimated duration. Other variations and solution hidden. Optional **View Full Case Details** behind spoiler warning reveals actual truth/evidence to Host only.
- Host may accept or skip for any reason, including duration, without explanation. Skipped case and **all variations** excluded for the rest of **this checkpoint in this session**, not counted complete. Persist skips. Between cases Host can review/reinstate skips to random pool (no automatic selection). If pool exhausted offer reinstatement or early completion.
- After acceptance/public introduction, ordinary skip/replacement is forbidden. Future case identities/evidence are never exposed to Stage/players early.

## Choker Rashi election and authority
- First case: each team nominates willing candidate from any team; candidate accepts/declines. **Every player votes secretly**, including sequential shared-controller voters (clear ballot each time). No tallies until closed; tied leaders -> runoff -> Host tie-break. If no volunteer, repeat nominations; then Host may serve.
- Before subsequent cases **Host decides** retain current Choker Rashi or hold new election. Choker Rashi remains a normal investigator on their team, without secret solution access. Each report identifies that case's leader.
- Choker Rashi controls charges, lead assignment, reporting order, Main Stage evidence/Incident Report, deliberation, final judgments, confidence vote configuration, truth review. Host retains technical/admin authority, may substitute for unavailable leader. Host desktop always full control; Host phone syncs when connected. Server/runtime authoritative.

## Phase 1 — Complaint and locked charges
Teams examine complaint and Scripture, verbally identify potentially violated Book-of-the-Covenant laws. Choker Rashi **files official charges before investigation**. At investigation start **both identity and count lock**. Only filed charges receive verdicts; truth review can disclose actual violations not charged. Associated Scripture passages remain available during deliberation without revealing correct application.

## Phase 2 — Lead assignment and private investigation
- Up to **8 authored leads** (witness/physical, useful/misleading/irrelevant/inconclusive). **Choosing which leads to assign is part of the challenge. Unassigned leads are NEVER available during investigation**, even when other leads complete; reveal them only in post-case truth review.
- Choker Rashi assigns one team per lead, each team initially at least one when feasible. No simultaneous multi-team lead ownership. Reassignment only **before any question begins**; never after investigation of that lead starts. Pre-question lead replacement allowances: Easy 2, Medium 1, Hard/Expert 0. No reassignment of completed leads.
- Each lead has authored, difficulty-dependent question budget. Teams privately ask deterministic authored questions and receive authored evidence/testimony; log Q/A and evidence in private team notebook. Team can edit conclusion and flag individual evidence or whole lead Questionable / Suspected Incorrect / Unreliable Lead before completion/closure. Flags never change underlying facts. Harder cases may include mistaken/deceptive witnesses; no witness cross-examination.
- Choker Rashi sees assignment/progress **not notebooks** during investigation. Main Stage shows team names and completion counts, never private findings. Shared controllers/concurrent submissions must maintain authoritative idempotent lead state.
- **Mark Complete requires irreversible confirmation**. Completed lead cannot be reopened, edited or questioned. **All assigned leads complete -> automatically close investigation**, regardless of unassigned leads.
- Investigation untimed by default; Host may configure overall timer. Choker Rashi may close early. At early close or timer expiry: **no new questions**; finish already-in-progress questions, then freeze notebooks. Unfinished leads marked Incomplete with findings retained.

## Phase 3 — Formal reporting
Choker Rashi chooses reporting order. Every team reports **verbally**, including teams with no evidence; Choker Rashi may present absent team's notebook. Progressively show frozen original reports on Main Stage and assemble shared Incident Report. **No editing during reporting.** After all team reports incorporated, Choker Rashi explicitly begins deliberation.

## Phase 4 — Verbal deliberation and evidence revision
- Deliberation is **verbal only**. No controller proposal/argument submission, approval queue or computerized resubmission. Choker Rashi controls Main Stage, displays leads, evidence and side-by-side contradictions, and associated filed Scripture passages.
- Choker Rashi records revised **collective lead conclusions** and evidence/lead reliability flags directly in shared Incident Report following discussion. Preserve immutable original investigative conclusions/flags and full revision history.
- Flag provenance colors: **Green** originally unflagged never changed; **Red** originally flagged never changed; **Orange** originally flagged and changed during deliberation even if restored; **Blue** originally unflagged and changed/flagged during deliberation even if restored. Show current status, original and history.
- Deliberation optionally untimed. **Timed default 10 minutes, Host-adjustable**, visible Main Stage countdown. Choker Rashi may use up to **two 2-minute extensions**. After deliberation plus extensions expires, enter **final-judgment grace period default 2 minutes, Host-adjustable**; then close and auto-finalize remaining charges. Technical pauses/leader handover freeze timers. The overall 20-minute warning never overrides phase timers.
- Agon does not recommend verdicts.

## Phase 5 — Charge-by-charge judgments
Each filed charge outcome: **Guilty (G), Not Guilty (NG), Charge Dropped (CD)**; CD can represent insufficient evidence and is distinct from NG. Choker Rashi may change provisional selections until using separate **Final** action with confirmation; final locks that charge irreversibly. **Discussion of finalized charges and evidence remains allowed** until deliberation actually closes. Choker Rashi may close early; if any charge unfinalized, require confirmation listing the auto-finalized outcomes. On close, selected provisional outcome auto-finalizes; no selection defaults to CD. Record explicit vs automatic finalization. No investigator-selected consequences/restitution.

## Phase 6 — Anonymous Vote of Confidence
Enabled by default; Choker Rashi may disable or choose **one vote per team (default)** or **one per registered player** before investigation, then lock. After judgments/before truth review, single overall anonymous vote Confidence / Partial Confidence / No Confidence / Abstain; distinguish Did Not Vote. No tally until close; progress counts allowed; Choker Rashi can close early. Vote does not affect points or judgments. Aggregate in Case Study Report.

## Phase 7 — Progressive accuracy and Scripture review
Choker Rashi (or Host substitute) advances/revisits Main Stage review; unrevealed content stays hidden until reached. Progressively reveal (1) pursued leads, collected evidence and questions asked **live only**; (2) original conclusions, flags, deliberation changes; (3) all actual testimony/evidence including uncollected and unassigned; (4) actual truth and reliability (genuine/mistaken/deceptive/irrelevant/inconclusive); (5) biblical laws, filed/unfiled actual violations and **authored prescribed biblical consequences/restitution for instruction only**. Compare verdicts to actual truth **and what evidence reasonably supported**; CD can be reasonable even if violation occurred. No correctness scoring.

## Permanent per-case Case Study Report
- Automatically generate after post-case review; **no checkpoint-wide summary report**.
- Header: case name/number, played variation, date, session/Journey/event, Choker Rashi, participating teams/members. Body: **played variation only**, all leads including unpursued, all evidence/testimony including missed, pursued/collected markers, collective original/revised conclusions and reliability flag history, filed verdicts, actual truth, filed/unfiled laws and prescribed biblical consequences, confidence vote aggregate if used, authored further Bible study questions (justice, responsibility, restitution, God's character, application).
- **Do not attribute investigative decisions, conclusions, flags, votes or judgments to specific players/teams** in permanent report; internal game/audit may retain attribution.
- **Do not include investigative questions, Q/A menus, question-to-evidence discovery routes or difficulty-specific challenge mechanics** in permanent report; preserve repeatability. Those may appear in live review.
- Preserve with session/Journey; Admin Console access, print, PDF/email export. Players **cannot reopen completed reports during later cases of same checkpoint**.
- **Report failure must not lose completed case or block Journey.** Preserve completed case, variation, evidence, judgments, review and versioned authored content/report inputs; record diagnostic errors and mark report Pending/Failed; support retry/regeneration. Provide **authorized** feedback or GitHub issue submission with actionable diagnostics, sanitized for player privacy and spoilers; never silently submit sensitive data.

## vNext architecture / content / testing
Exodus owns authored checkpoint composition, Scripture, presentation and content packs; reusable mechanics belong to reusable vNext capabilities. No new major legacy game-engine code. Stage consumes public projections, controllers submit intents, runtime owns authority. Support Local/Shared/Hosted, deterministic RNG/replay, version-pinned content, idempotent commands, private notebooks, secret ballots, spoiler isolation, Host/Choker Rashi authorization and save/resume.

Dependencies to inspect/reuse rather than duplicate: #458 Journey engine, #460 checkpoint composition, #461 Exodus, #399 actor/controller identity, #522 authoritative lifecycle, #580/#584 content packs, #616/#353 persistence, applicable translation/Challenge Resolver contracts.

**Acceptance tests:** selection/diversity/no-repeat, preview/spoilers/skip/reinstate, three-per-session, unassigned lead never accessible, one-team lead ownership, completion irreversible, auto-close/early close/timer in-flight question, immutable notebooks and revision colors, verbal-only deliberation, charge lock/Final/grace/auto-finalization, election secrecy, confidence voting, progressive reveal, report omissions/non-attribution, report failure/retry, 20-minute warning without termination, save/resume/replay, authorization and profile-based Bible Challenge difficulty.

**Implementation clarifications only:** duration-estimation formula, optional investigation-timer presets, diagnostic submission destination and retention inherit platform policy. Missing contracts require approval, not invented game-specific behavior.
