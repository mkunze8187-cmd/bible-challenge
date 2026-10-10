# Exodus Journey — Design Source Index and Reconciliation Register

> **Audit snapshot: 2026-10-10.** This index distinguishes **merged documentation**, **GitHub issue design records**, and **open pull requests**. It does **not** certify a line-by-line comparison of every historical chat. The central Exodus issue is an extensive design archive, not a substitute for modular checkpoint specifications.

## Authoritative sources and status

| Topic | Location | Status / action |
| --- | --- | --- |
| Overall Journey / chapters, canonical progression and capability ownership | [Exodus Journey issue #461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461), [Journey spec](../../specs/games/exodus-journey.md) | Both on GitHub; issue is much more detailed for later chapters; extract coherent checkpoint docs |
| Journey runtime / composition | [Journey engine #458](https://github.com/mkunze8187-cmd/bible-challenge/issues/458), [checkpoint composition #460](https://github.com/mkunze8187-cmd/bible-challenge/issues/460), [Journey engine spec](../engines/journey-campaign-engine.md) | Existing dependencies; do not duplicate |
| Chapter 1 (Moses, elders, Pharaoh, bricks, promises) | [#461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461) | Detailed issue design; no dedicated chapter-one checkpoint spec identified |
| Chapter 2 plagues 1–9 | [#461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461) | Gameplay decisions embedded in issue; no standalone plague specs identified; extraction recommended |
| Passover puzzle, tenth plague, Goshen Escape Room, departure | [#461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461) | Extensive locked gameplay in issue; no dedicated standalone spec identified |
| God Leads Israel / Pharaoh pursuit to Red Sea | [#461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461) | Locked design in issue; needs dedicated spec to avoid losing graph/branch/detour/reversal/pursuit rules |
| Red Sea Crossing | [Red Sea spec](exodus-red-sea-crossing.md), [#602](https://github.com/mkunze8187-cmd/bible-challenge/issues/602) | Standalone spec on main; merged PR #603 reported in prior design history |
| Marah | [Exodus Journey spec](exodus-journey.md), [#604](https://github.com/mkunze8187-cmd/bible-challenge/issues/604) | Detailed checkpoint section on main |
| Manna | [Exodus Journey spec](exodus-journey.md), [#462](https://github.com/mkunze8187-cmd/bible-challenge/issues/462) | Detailed checkpoint section on main |
| Rephidim (Massah/Meribah, Amalek) | [Rephidim spec](exodus-rephidim.md), [#606](https://github.com/mkunze8187-cmd/bible-challenge/issues/606) | Standalone spec on main; check issue references before implementation |
| Sinai Ten Commandments classification | [PR #610](https://github.com/mkunze8187-cmd/bible-challenge/pull/610), [#615](https://github.com/mkunze8187-cmd/bible-challenge/issues/615), reusable #611–#614 | **Open PR**: proposed spec not yet on main |
| Sinai Choker ha-Machane / Camp Investigator | [PR #618](https://github.com/mkunze8187-cmd/bible-challenge/pull/618), [#619](https://github.com/mkunze8187-cmd/bible-challenge/issues/619)–[#624](https://github.com/mkunze8187-cmd/bible-challenge/issues/624) | **Open PR**: proposed spec not yet on main |
| Journey opening/finale and episodic transitions | [#461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461) | Locked design in issue; not located as standalone bookends spec |
| Controller QR/native platform planning | [#625](https://github.com/mkunze8187-cmd/bible-challenge/issues/625), [#626](https://github.com/mkunze8187-cmd/bible-challenge/issues/626), [#627](https://github.com/mkunze8187-cmd/bible-challenge/issues/627) | Deferred until Exodus complete; not a prerequisite to current checkpoints |

## Locked design highlights to retain when extracting documents

### God Leads Israel / Pursuit
- Live play uses **hidden authoritative graph** and local player view; do not reveal full topology or label RIGHT/SHORTEST/EASIEST as player choices.
- Every movement turn starts with a private profile-appropriate Bible Challenge. **Movement distance is shown only after successful challenge**. Wrong answer does not move the team. Process every traversed decision/obstacle/blessing even when movement passes through.
- Right-path choices guarantee fastest realized journey; perceived easier/shorter alternatives may be deceptive but defensible. Detours/loops can rejoin later and never contain Blessings or outperform right continuation.
- Turn Around returns to **selected prior decision point**; intervening decisions are not replayed. Blessings cannot be farmed by backtracking.
- Pharaoh gets a head start deficit but moves faster, splits pursuit fronts across **all branches** (even unoccupied), traverses terrain/obstacles with army-specific effects, and captures teams upon intersection, including reconnecting behind an army front.
- Show meaningful nearest pursuit-front distance without hidden-map leaks; optional retrospective reveals full graph and synchronized replay, with selectable historical decision snapshots; canonical Journey reconverges before Red Sea.

### Red Sea
- God controls canonical deliverance; real-time shared cooperative movement of twelve contiguous tribes; no Bible-question Challenges or loss condition. Persistent commands with propagation, fatigue/stress/cohesion, shared camera and collisions. Only Before Dawn and Progression Order bonuses. End narrative with Miriam's song (Exodus 15:20–21).

### Marah / Manna
- Marah: three Challenges/team, profile-driven Bible difficulty, intentionally withheld information, non-punitive Give Up/File Complaint decisive assistance, no speed/correctness penalty.
- Manna: **one shared tribal basket**, hidden tribe size/visible need, independent private stop, periodic 110–130-second measurements, target 100–110% with minimum 75% shared award; no separate team winners. Do not restore older per-team baskets or timed competition.

### Sinai
- Ten Commandments: foreground numbered moving people, private translated Scripture action, three-line scroll wheel, direct Obeyed/Disobeyed action, any applicable commandment accepted, seven-minute default; see #615 and PR #610.
- Choker ha-Machane: max 3 cases/session; unassigned leads never available during investigation; locked filed charges; verbal deliberation; per-charge G/NG/CD Final; confidence vote; progressive truth review; permanent **per-case** report omitting investigative questions and individual/team decision attribution. 20-minute **advisory** case target; report failure never loses completed case; see PR #618 and #619–#624.

## Reconciliation actions / unresolved audit scope

1. **Merge/review open specs** PR #610 and PR #618, resolving conflicts with #461 before treating them as on-main.
2. **Extract** #461's Chapter 1, plague, Passover/Goshen, God Leads, and bookend sections into reviewable versioned Markdown specs; keep issue links and locked decisions.
3. **Cross-check** each extracted section against current implementation issues, older generic Journey spec examples and the latest approved game mechanics; annotate superseded examples instead of silently treating them as requirements.
4. **Compare historical design conversations** against this index and the GitHub text to catch decisions that were never written to GitHub. This step is **not yet fully verified**; access to complete historical conversation text is required for exhaustive certification.
5. Maintain this index as the entry point for cross-device continuity. Record design changes in GitHub before relying on them for implementation.

## Known documentation drift to review

- The older generic [Exodus Journey spec](exodus-journey.md) includes examples of Red Sea as generic Challenge/tournament activities, explicitly superseded by the standalone cooperative Red Sea spec. Prefer the later approved checkpoint specification.
- The central issue #461 contains a much larger, more current gameplay record for later chapters than the current Journey Markdown spec. Do not assume absence from the Markdown spec means no decision was made.
- PR #610 and PR #618 are stored remotely but **not merged into main** as of this audit snapshot.

**Rule for future work:** Every approved gameplay decision should be reflected in a versioned GitHub spec and linked implementation issue; chat alone is not durable project documentation.
