# Candidate Games #200–#233 — Audience-Safe Consolidation Review

## Review basis
This supersedes the earlier informal consolidation pass. The review explicitly separates **AGON_GENERAL** and **AGON_KIDS**. Kids games are considered for infrastructure/content reuse only; they are not merge destinations for general games.

The review also considers newer general Agon work such as Scripture Relationship, Running the Race, Pilgrim's Way, Exodus: The Journey, Saul: Turned Around only where the destination is in the same audience family. `Saul: Turned Around` is Kids, so it is NOT a valid merge destination for general `Road to Damascus`.

## Results
| # | Candidate | Audience | Final disposition | Notes |
|---|---|---|---|---|
| 200 | The Lot Falls To... | AGON_GENERAL | KEEP_GAME | Distinct deduction/selection loop using Casting Lots + Challenge/Relationship infrastructure. |
| 201 | Wheel Within a Wheel | AGON_GENERAL | KEEP_GAME | Distinct dual-randomizer relationship loop; reuse Spinner + Scripture Relationship. |
| 202 | Gather the Twelve | AGON_GENERAL | KEEP_GAME | Set-collection/completion strategy remains distinct; reuse Card/Deck + Relationship. |
| 203 | Urn of Questions | AGON_GENERAL | EMBEDDED_ACTIVITY | Random challenge-selection composition; preserve themed presentation as reusable activity/profile rather than separate GameId unless playtesting shows additional rules. |
| 204 | The Narrow Gate | AGON_GENERAL | JOURNEY_COMPOSITE | General-audience Pilgrim's Way checkpoint/activity candidate. Do not merge with any Kids path game. |
| 205 | Providence? | AGON_GENERAL | VARIANT_PROFILE | Fold mechanic into general Three Witnesses/relationship-deduction family if same loop is confirmed; retain Providence theme/content profile. Do not merge with Kids Joseph Providence Threads. |
| 206 | Witnesses | AGON_GENERAL | KEEP_GAME | Evidence/set-building tableau has distinct strategy. |
| 207 | The Scribe | AGON_GENERAL | KEEP_GAME | General Scripture structure/order game; candidate parent for #230. |
| 208 | Twelve Tribes | AGON_GENERAL | KEEP_GAME | Distinct classification/board identity. Kids tribe activities, if added, remain separate. |
| 209 | Epistle | AGON_GENERAL | KEEP_GAME | Distinct letter-profile/relationship assembly. |
| 210 | Cloud of Witnesses | AGON_GENERAL | VARIANT_PROFILE | Preserve as reusable general challenge/profile and Running the Race/Pilgrim's Way content where appropriate; do not merge with future Kids Hebrews content. |
| 211 | One Body | AGON_GENERAL | KEEP_GAME | Complementary/private-information cooperation is a distinct multiplayer loop. |
| 212 | Before & After | AGON_GENERAL | MERGE_SAME_FAMILY | Merge into existing general chronology/timeline family; rename conflict remains. Extend chronology modes rather than another GameId. |
| 213 | Three Witnesses | AGON_GENERAL | KEEP_GAME | Primary general multi-dimensional relationship deduction game; can host Providence? mode. |
| 214 | Facets | AGON_GENERAL | EMBEDDED_ACTIVITY | Dice/category/challenge composition belongs in reusable activity/profile; no Kids merge. |
| 215 | Crossroads | AGON_GENERAL | JOURNEY_COMPOSITE | General Pilgrim's Way branching checkpoint/activity; Kids perspective/path experiences remain separate. |
| 216 | Against the Odds | AGON_GENERAL | KEEP_GAME | Player-selected risk/difficulty is the defining strategic loop. |
| 217 | While the Sand Falls | AGON_GENERAL | EMBEDDED_ACTIVITY | Timed/hourglass challenge profile reusable by Gauntlet/Journey/Event. Kids timed activities may use same Timer capability but remain Kids definitions. |
| 218 | A Time for Everything | AGON_GENERAL | KEEP_GAME | Ecclesiastes categorization/chronology has distinct learning/game identity. |
| 219 | Redeem the Time | AGON_GENERAL | KEEP_GAME | Finite time-budget allocation creates distinct strategy. |
| 220 | The Midnight Hour | AGON_GENERAL | VARIANT_PROFILE | Countdown milestone/event modifier better as general timed-event profile unless later rules justify GameId. |
| 221 | Selah | AGON_GENERAL | KEEP_GAME | Exposure/pause/recall pacing is distinct. A future Kids quiet/reflection activity would not replace it. |
| 222 | One Is Missing | AGON_GENERAL | KEEP_GAME | Clean short-form deduction loop; also embeddable. Kids missing-item games remain separate if age-designed. |
| 223 | The Messenger | AGON_GENERAL | KEEP_GAME | Private information transfer/reconstruction is distinct; reuse communication.constraint where appropriate. |
| 224 | Build the Temple | AGON_GENERAL | KEEP_GAME | Strategic/general construction game. **Do not merge with Kids Bible Builders/temple activities.** Share Board/Construction/Challenge primitives only. |
| 225 | Walls of Jerusalem | AGON_GENERAL | KEEP_GAME | Distinct competitive connectivity/territory strategy. Reuse Board Play graph/spatial primitives. Do not collapse into Kids building games. |
| 226 | Paths of Paul | AGON_GENERAL | JOURNEY_COMPOSITE | Keep player-facing general Journey identity; implement declaratively over Journey/Map capabilities rather than bespoke engine. Kids Paul journeys, if later authored, remain separate. |
| 227 | The Road to Damascus | AGON_GENERAL | KEEP_GAME_PENDING_REDESIGN | **Revised from prior review. Do NOT merge into Kids Saul: Turned Around #506.** Preserve as general game. Reassess its dominant loop against general Progressive Clue/Journey games and differentiate it from the Kids narrative journey. |
| 228 | Council of Jerusalem | AGON_GENERAL | KEEP_GAME | Speaker/evidence/claim organization around Acts 15 is distinct textual-analysis gameplay. |
| 229 | Exodus | AGON_GENERAL | SUPERSEDED | Superseded by general `Exodus: The Journey` #461–#463 after unique requirements are verified/migrated. This is same-family consolidation. Kids Exodus experiences remain separate if created. |
| 230 | The Scribe's Table | AGON_GENERAL | VARIANT_PROFILE | Merge as a richer tableau/decoy mode of general The Scribe #207 if loop audit confirms; same-family only. |
| 231 | Open the Scroll | AGON_GENERAL | KEEP_GAME | Progressive spatial/layer reveal remains visually/mechanically distinct from ordinary clue ladder. |
| 232 | Forty | AGON_GENERAL | JOURNEY_COMPOSITE | Preserve as themed general Board/Journey definition/profile; not a bespoke engine. Kids forty-themed content would remain separate. |
| 233 | Convergence | AGON_GENERAL | KEEP_GAME | Multiple independent clue streams converging on one target is distinct from ordinary progressive clues. |

## Important corrections from the earlier review
### Road to Damascus
The earlier recommendation to merge #227 into Kids `Saul: Turned Around` #506 violated the audience boundary. Revised decision: keep #227 in the general catalog pending same-family mechanic differentiation. It may share Acts content metadata, map/Journey primitives, Progressive Clue, Scripture Relationship and assets with the Kids experience, but neither GameDefinition absorbs the other.

### Build the Temple
Any comparison to Kids Bible Builders is infrastructure reuse only. #224 remains a general strategic game unless a separate same-family general game duplicates its player loop.

### Cloud of Witnesses / Narrow Gate / Crossroads
These may consolidate into general `Running the Race` / `Pilgrim's Way` activities because those are general-family compositions. This does not affect any Kids game using the same passages/themes.

### David/Goliath precedent
#473 currently contains a Kids profile inside the general Five Stones definition. Under the new rule this needs a follow-up audience review: if the Kids profile has materially different learning flow, pacing, scoring and presentation, split it into a separate Kids GameDefinition while sharing Gauntlet/Target/content infrastructure. Do not force a split if it is genuinely the same family-play experience with simple age configuration.

## Net result for #200–#233
The audience-safe pass is deliberately more conservative than the earlier review. Most general candidates survive as general games. Consolidation is primarily at engine/activity/Journey/profile layers.

Likely top-level general GameIds retained: #200, #201, #202, #206, #207, #208, #209, #211, #213, #216, #218, #219, #221, #222, #223, #224, #225, #227, #228, #231, #233.

Same-family merge/supersede candidates: #212, #229, #230; #205 likely becomes a mode/profile after mechanic verification.

Activity/Journey/profile candidates: #203, #204, #210, #214, #215, #217, #220, #226, #232.

## Backlog mutation rule
Do not close or retitle #200–#233 solely from this document. Before closing a candidate, copy every unique requirement into its same-family destination and add reciprocal links. Cross-family Kids issues are never valid destinations for closing a general-game issue.
