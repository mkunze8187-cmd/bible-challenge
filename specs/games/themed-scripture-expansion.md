# Themed Scripture Game Expansion

> **Status: design reference (merged 2026-09-28).** Implementation targets **Agon vNext** per [ADR-001](../../docs/architecture/adr-001-agon-vnext-staged-replacement.md) and [the vNext migration spec](../agon-vnext-migration-spec.md). Any integration through legacy `src/lib/gameEngine.ts`, `src/renderer/App.tsx`, per-game `PlayerStats` fields or the central `GameId` union described here is superseded. Sequencing is governed by `ROADMAP.md` and native GitHub issue dependencies.

**Status:** Proposed

## Design principles
These concepts follow the Agon taxonomy: a new biblical theme does not automatically require a new engine. Prefer content profiles, variants, reusable challenges, composite games, and existing orchestrators before adding executable mechanics.

For recorded biblical events, gameplay MUST NOT rewrite Scripture. Player performance changes Agon score, challenge state, presentation, and permitted gameplay aids—not canonical outcomes.

## 1. The Pilgrim's Way (working title; derived from Faithful Journey)
**Role:** Thematic Journey / composite
**Reuse:** `journey.campaign`, Challenge providers, Scripture Relationship, Ordering, Progressive Clue, Classification

A thematic rather than historical journey through biblical teaching about hearing, trusting, persevering, serving, and finishing faithfully. Unlike Exodus, this is not a reenactment claiming a single historical route. The authored path may use Scripture themes and passages while clearly distinguishing thematic progression from canonical history.

Checkpoint examples: Narrow Gate, Good Soil, Storm, Crossroads, Cloud of Witnesses. Each checkpoint launches a reusable challenge/activity. Score is participant/team-specific; journey progression may be shared according to game definition.

Potential consolidation: candidate concepts such as The Narrow Gate, Crossroads, Against the Odds and Cloud of Witnesses can first be evaluated as Pilgrim's Way checkpoints/activities before receiving independent GameIds.

## 2. Tower of Babel
**Role:** Distinct cooperative/competitive communication game
**Primary Scripture:** Genesis 11:1–9
**Novel capability candidate:** `communication.constraint`

Players initially cooperate on an assembly/build task with ordinary communication. Later phases impose authored communication constraints to make information coordination increasingly difficult: one player sees a pattern but cannot speak; one can describe but not point/select; controllers may display different symbol vocabularies for equivalent concepts; required information can be distributed across players.

The game does not simulate changing the biblical outcome or reward building a historically alternate successful Babel. The tower/build state is the gameplay challenge and teaching visualization. Scripture review explains the recorded event.

`communication.constraint` should be generic and support permission rules such as SEE, SPEAK, POINT, SELECT, DESCRIBE, SHARE_SYMBOL_SET and private information distribution. It must not depend on Babel content.

Modes: cooperative default; team-vs-team race can compare completion/accuracy under equivalent constraints. Accessibility alternatives must exist for speech/hearing/vision/motor constraints.

## 3. Armor of God
**Role:** Cooperative composite / signature candidate
**Primary Scripture:** Ephesians 6:10–18
**Reuse:** Challenge Engine, Classification, Bible Navigation, Ordering, Scripture Relationship, exact-word challenges, Stage board

The Stage begins with an incomplete armor presentation. The group completes six Scripture-defined sections: Belt of Truth, Breastplate of Righteousness, Gospel of Peace, Shield of Faith, Helmet of Salvation, Sword of the Spirit/Word of God. Each section can use one or more configured challenge families appropriate to the learning objective.

Completing challenges visually equips the armor and awards normal score/progress. Do not represent faith, salvation, righteousness, or God's action as spendable statistics. Biblical-character fantasy powers are excluded from MVP unless later grounded as ordinary game mechanics without theological claims.

Primary mode is cooperative, with optional team contribution scoring. Completion means the group completed the learning/game objective, not that players have literally acquired spiritual status.

## 4. Exodus Adventure
**Decision:** Do not create a separate standalone game/engine initially.

Fold useful platform/adventure presentation ideas into `Exodus: The Journey` checkpoint activities. Red Sea traversal, plague sequencing, manna gathering, Sinai, etc. remain activities within the canonical campaign. No player-controlled alternate Moses narrative or platformer path changes recorded Scripture.

A future visual traversal activity may be a reusable Journey activity template if playtesting justifies it.

## 5. Sow & Grow
**Role:** Standalone learning game / kids-friendly composite
**Primary Scripture:** Matthew 13:1–23 and parallels as reviewed
**Reuse:** Classification, Matching, Stage board, Challenge Engine
**Novel presentation capability candidate:** `growth.board` only if reuse justifies extraction

The board presents Path, Rocky Ground, Thorns and Good Soil. Players classify descriptions, consequences, Scripture clues, meanings or related challenge content into the correct soil/parable concept. Correct activity animates growth according to the authored teaching presentation.

Players cannot optimize farming/resources to change Jesus' parable. The game teaches what the parable says and what Jesus explains it means.

Difficulty progression: direct recall -> consequence matching -> meaning/interpretation from the text -> related Scripture/application prompts that are clearly labeled as application rather than canonical text.

Strong fit for Kids `Hear it -> Play it -> Say it -> Take it Home` profile.

## 6. David and Goliath: Five Stones (working title)
**Role:** Themed Gauntlet definition / possible compact standalone profile
**Primary Scripture:** 1 Samuel 17
**Reuse:** Gauntlet/orchestrator + challenge adapters

Do not build a resource-gathering/ally/stealth alternate-David simulation. Use the five stones as a visual five-stage challenge structure. Each stage can draw a different reusable challenge type; correct performance earns Agon score and visual momentum/progress. The recorded David/Goliath outcome remains canonical and is not decided by player performance.

First implementation should be a Gauntlet configuration/content pack with custom Stage artwork and Scripture review. Promote to a distinct GameId only if playtesting reveals meaningful rules beyond themed Gauntlet configuration.

## 7. To the Churches (working title; derived from Letter to the Churches)
**Role:** Standalone Scripture relationship/classification game
**Primary Scripture:** Revelation 2–3
**Reuse:** Classification, Match, Scripture Relationship, Challenge Engine

Seven-church board: Ephesus, Smyrna, Pergamum, Thyatira, Sardis, Philadelphia, Laodicea. Players associate reviewed elements of the actual messages with the correct church: commendations, rebukes, warnings, promises, descriptions of Christ, passage references, and optionally reviewed historical/geographic context clearly distinguished from the biblical text.

Modes: single-card classification; multi-card set assembly; match pairs; timed all-play; head-to-head/buzzer where suitable. Higher difficulty removes obvious wording and asks for relationship recognition.

Distinct catalog identity is justified by the seven-church board and learning objective even though implementation should mostly reuse shared engines.

## 8. Beatitudes Quest
**Role:** Thematic progression/composite game
**Primary Scripture:** Matthew 5:3–12
**Reuse:** Journey/progression presentation, Match, Ordering, Classification, Scripture Relationship, Challenge Engine

Players progress through authored Beatitude stations. Activities include identify the Beatitude, match beginning to promised statement, order the passage, identify related Scripture/person/event, and progressively harder relationship/understanding challenges.

Do not model Beatitudes as RPG attributes, spendable virtues, or power-ups and do not treat blessings as character buffs. Score reflects game performance only.

A Stage path/Sermon-on-the-Mount presentation provides identity while mechanics remain reusable. Solo, all-play, team and cooperative configurations are possible.

## Packaging consequences
- The Pilgrim's Way and Beatitudes Quest should be mostly definitions/content/assets over existing Journey/challenge capabilities.
- Armor of God and To the Churches should be mostly composite definitions plus specialized Stage assets.
- David and Goliath should initially be a Gauntlet profile/content pack.
- Exodus Adventure becomes Exodus Journey content/activities, not another package dependency.
- Sow & Grow should reuse Classification/Match and add only presentation code proven reusable.
- Tower of Babel is the strongest candidate here for a genuinely new reusable gameplay capability (`communication.constraint`).

## Common acceptance rules
- 1–4 participant/team support where compatible with the game mode.
- Score through Score Ledger.
- Semantic InputActions/controller support.
- Save/resume where the experience exceeds a quick round.
- Bible text through BibleTextService/translation policy.
- Reviewed references/content provenance.
- Stage/controller projection privacy.
- Accessibility is not an earned advantage.
- Prepare Event validates required capabilities/content/assets.
- Game definitions declare composition dependencies so packs do not duplicate engine code.