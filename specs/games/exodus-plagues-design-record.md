> **Source-preserving extraction** from [Exodus Journey #461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461), snapshot 2026-10-10. This text retains the original approved design wording and chronology; the issue remains the original source. Verify conflicts against newer checkpoint-specific specs before implementation.

# Chapter 2 — Plague 2: Frogs — Ex 8:1–15 (gameplay locked 2026-10-02)
**Classification: COMPOSE_EXISTING/NEW_REUSABLE_CAPABILITIES -> #591 Moving Entity Field + #592 MICRO Challenge profile + #593 private non-blocking Challenge execution + Challenge Resolver.**

### Experience
The shared Stage is heavily covered by animated/moving frogs over a **content-driven hidden reveal**. Frogs continually hop/reposition, so areas of the underlying content are transiently revealed and covered again. Players observe, remember and communicate what they see while teams catch frogs through quick private Scripture Challenges.

Core rhythm: **Watch -> Remember -> Communicate -> Catch -> Reveal more -> Solve whenever ready.**

### Content-driven reveal
Frogs does not own the hidden-content type. Content Packs may supply compatible images, people, places, events, Scripture phrases/references, symbols or other validated reveal content. The mechanic consumes a reveal surface and #591 supplies dynamic occlusion.

### Catch / net flow
1. Team semantically selects an available moving frog.
2. A visibly team-associated **net drops over/claims the frog** on Stage. Claimed frog cannot be claimed by another team.
3. Team receives a **TEAM_PRIVATE + MICRO + NON_BLOCKING** Challenge through #592/#593; shared Stage and other teams continue.
4. Correct Challenge -> frog moves into that team's retained net/catch state and is removed from field occlusion.
5. Incorrect/cancelled Challenge -> claim/net lifts and frog returns to moving field according to configured rules.
6. Multiple teams may have independently netted frogs/Challenges concurrently.

Input topology follows #399/#579; one controller per participant is never assumed.

### Cooperative reveal and solve
- All teams are working toward the **same hidden reveal**.
- Teams may attempt the final solution at **any time**; no minimum frog count/percentage is required.
- Final reveal is explicitly **not a scoring event**: no final-answer points, first-solve bonus or solver ownership.
- Teams are encouraged to share observations/answers because withholding the final solution offers no scoring advantage.
- A correct shared solution ends the activity.
- A wrong final-solve attempt releases configurable **X retained frogs from the submitting team's net** back into the common moving field, capped by frogs actually retained. This is the risk against indiscriminate guessing.

### Scoring and learning incentive
**Team score = frogs retained in that team's net when the shared reveal is solved.**

Track total caught, retained, escaped/released and Challenge stats as optional result/history data, but do not complicate base scoring.

This intentionally rewards continued Scripture engagement: even when the group recognizes the reveal early, teams may keep catching frogs to encounter additional MICRO Scripture Challenges and improve their retained-frog score. Solving remains available immediately for groups wanting a shorter experience.

### Difficulty / tuning
Content/configuration may tune frog count/density/size, movement pattern/dwell behavior, initial occlusion, wrong-solve release count X, reveal complexity and MICRO Challenge mix/difficulty. **Movement/reaction speed is not Bible difficulty.**

### Accessibility
Reduced/Off Motion uses #591 equivalent repositioning/state changes while preserving transient reveal/observation. Catch selection must remain accessible and must not turn into a precision/reaction-speed test unless a future consumer explicitly declares that separate requirement.

### Scripture guardrails
Frame the activity from Ex 8:1–15: frogs invade Egypt; Pharaoh asks Moses to plead with the LORD; Moses allows Pharaoh to specify when; Pharaoh says "Tomorrow"; frogs die and are gathered in heaps; the land stinks; Pharaoh hardens his heart when relief comes. Gameplay does not alter canonical events.

### Frogs acceptance
- moving frogs genuinely reveal/re-cover different portions as they move;
- content-driven underlying reveal;
- visible net/claim state and duplicate-claim prevention;
- MICRO private Challenge catch gate;
- concurrent team catches while Stage continues;
- correct catch removes frog to team net;
- failed catch returns frog;
- solve-anytime shared answer;
- wrong solve releases configurable X frogs from submitting team's net;
- no score/bonus for final solve;
- retained frogs determine team score;
- continued catches create additional learning opportunities;
- controller-topology and accessibility variants;
- canonical Exodus outcome unchanged.


# Chapter 2 — Plague 3: Dust Insects — Ex 8:16–19 (gameplay locked 2026-10-02)
**Internal/event identity:** translation-neutral **Dust Insects**. Player-facing plague terminology follows the selected Bible translation (for example, KJV **lice**; translations using **gnats** display gnats). Do not hard-code a modern insect species where the translation/text does not establish one.

**Classification: COMPOSE_EXISTING + NEW_REUSABLE_CAPABILITY -> MICRO Challenges (#592) + Challenge Resolver + Challenge Assistance (#595).** The swarm/shape presentation is currently Exodus-specific presentation; do not prematurely generalize it into another moving-entity engine.

## Scripture / presentation guardrail
Ex 8:16–19 states that Aaron struck the dust and the dust became the insects. Gameplay MUST NOT imply that players selectively cause only some dust to become insects, prevent the transformation, or determine whether the plague occurs.

The plague presentation emphasizes innumerable tiny, dust-sized insects arising from the dust without claiming a precise modern species identification.

Any wind/dust-storm sequence described below is explicitly a **game transition effect**, not a claim that Exodus records a windstorm during this plague.

## Core experience
After the canonical plague transition, the shared Stage contains a dust-colored environment and innumerable tiny moving insects. The swarm shifts and reorganizes into a recognizable Bible-related shape. The shape establishes the theme/context for a round of team Challenges.

Core rhythm:

**Swarm -> Form -> Recognize -> team MICRO Challenges -> Assistance if needed -> all teams clear -> wind/dust transition -> next shape**

Shapes/content are authored and may represent appropriate people, objects, places, events, Scripture concepts/symbols or other validated Bible-related subjects. The shape is a thematic prompt; the Challenge need not merely ask players to identify the shape.

Each team receives a related, profile/difficulty-appropriate MICRO Challenge through the normal Resolver. Teams may receive different but equivalently resolved Challenges.

## Shared progression
All participating teams must clear their current Challenge before the activity advances to the next swarm shape.

This intentionally differs from Frogs' asynchronous catch loop: Dust Insects is synchronized cooperative progression around a common Stage formation.

A struggling team must not permanently deadlock the room. Dust Insects composes #595 Challenge Assistance and its exhaustion recovery.

## Dust Insects assistance policy
Challenge Assistance is optional and must be enabled/disabled before gameplay. The checkpoint declares which #595 assistance types it supports and budgets them by configured game difficulty.

Multiple different assistance types may be requested for the same Challenge, but an assistance type cannot be repeated on that Challenge.

**ASK_ANOTHER_TEAM**:
- may be used only once on a Challenge;
- request is sent to exactly one selected other team;
- assisting team may provide a hint or suggested answer;
- requesting team still owns and submits its answer;
- uses temporary authorized communication through #382.

**REPLACE_CHALLENGE** allows the team to request another equivalent MICRO Challenge when available under its remaining assistance budget.

Other #595 assistance types may be enabled if authored/configured and compatible; Dust Insects does not require the full catalog to be implemented.

If the team still has not cleared the Challenge after all assistance applicable/available to that Challenge is exhausted, the system automatically resolves a **new equivalent MICRO Challenge**. This deadlock recovery does not consume another REPLACE_CHALLENGE assistance use.

## Transition between shapes
After every team clears:
1. the current swarm formation breaks apart;
2. wind rises as a presentation effect;
3. particles/insects create a dust-storm-like visual transition that obscures/recomposes the Stage;
4. the effect subsides;
5. the next swarm shape emerges.

At the end of the activity, the dust-storm transition fully calms and the Stage returns to the normal Journey/location presentation.

Reduced/Off Motion must provide an equivalent non-motion-heavy transition while preserving clear round boundaries.

## Magicians / narrative climax
The magicians' response is fixed biblical narrative, not player-controlled outcome. Ex 8:18–19 records that the magicians attempt to produce the insects but cannot and tell Pharaoh, **"This is the finger of God."** Pharaoh's heart remains hardened.

The activity may use this difference from Blood/Frogs as narrative framing/climax, but player performance never determines whether the magicians succeed.

## Difficulty / tuning
Authored/configurable tuning includes:
- number of swarm shapes;
- shape recognition complexity;
- related MICRO Challenge mix; each concrete Challenge/question difficulty remains Player-Profile-resolved under the Journey-wide invariant;
- assistance enabled state;
- permitted assistance types;
- per-type assistance budgets;
- visual density/transition duration within accessibility constraints.

Visual acuity, reaction speed and motion complexity are not Bible difficulty dimensions.

## Dust Insects acceptance
- [ ] player-facing lice/gnats terminology follows selected translation;
- [ ] internal event identity is translation-neutral;
- [ ] no unsupported claim that a particular modern insect species is certain;
- [ ] gameplay does not rewrite the dust-to-insects event;
- [ ] swarm forms authored Bible-related shapes;
- [ ] each team receives a related MICRO Challenge;
- [ ] all teams clear before next shape;
- [ ] assistance composes #595 and is optional/pre-game configurable;
- [ ] assistance types/budgets are consumer/difficulty configurable;
- [ ] ASK_ANOTHER_TEAM goes to one selected team only and once per Challenge;
- [ ] multiple different assists may be used but same type cannot repeat on that Challenge;
- [ ] exhaustion produces an equivalent replacement Challenge without deadlock;
- [ ] wind/dust storm is explicitly a game transition effect, not asserted Scripture;
- [ ] end transition returns to normal Journey presentation;
- [ ] magicians' failure and "finger of God" remain canonical narrative;
- [ ] Reduced/Off Motion equivalent;
- [ ] no duplicate Frogs Moving Entity Field/catch mechanic.


# Chapter 2 — Plague 4: Flies — Ex 8:20–32 (gameplay locked 2026-10-02)
**Classification: COMPOSE_EXISTING + NEW_REUSABLE_CAPABILITY -> #579 Composite Cooperative + Challenge Resolver + existing Challenge Families + #596 Blind Exchange + Agon Cards surfaces (#135).**

Flies uses two deliberately different cooperative activities:
1. **Swarm** — teams cooperate on a shared Exodus objective while resolving Bible-wide examples of God's protection/preservation.
2. **Distinction** — teams strategically exchange hidden cards to construct three-part Scripture relationships: **Instruction -> Response/Action -> Result**.

Neither activity changes the canonical plague or makes God's protection depend on player performance.

## Scripture frame
Ex 8:20–32 introduces an explicit distinction: God sets apart the land of Goshen, where His people dwell, so the swarm is not there. Pharaoh also begins bargaining over the command to let Israel go and worship.

The gameplay may explore Bible-wide examples of protection, obedience/disobedience, response and consequence, but the Exodus Stage remains within the Exodus story.

# Activity A — Swarm / Gathering to Goshen

## Stage identity
The shared Stage shows Egypt in the midst of the swarm. **Israelites are scattered throughout the scene and are already protected from the swarm wherever they are.**

Gameplay MUST NOT imply that:
- the Israelites are unprotected until players rescue them;
- Challenge success earns God's favor/protection;
- players cause God to distinguish/protect His people.

The gameplay objective is to **gather the already-protected scattered Israelites together into Goshen**.

A useful visual treatment is a swarm-free/protected area immediately around scattered Israelites/groups while flies occupy the surrounding environment. As Israelites gather, those protected figures/groups become visibly concentrated in Goshen.

## Challenge content
Swarm Challenges may use Bible-wide, Scripture-grounded examples where the text records God's protection, preservation, rescue, shelter or provision. Examples may involve people, places, cities, events, passages, objects or relationships from elsewhere in Scripture.

Those Bible-wide subjects are **Challenge content only**. Daniel, Noah, Rahab, David, etc. are not transported into the Exodus Stage or depicted as moving to Goshen.

Content must avoid teaching the simplistic rule that people favored by God are always protected from physical suffering. Challenges identify specific biblical accounts and what Scripture records in those accounts.

## Cooperation
Compose #579 Composite Cooperative so different teams/participants can receive complementary information/contributions about the same protection account and must communicate/synthesize the biblical relationship.

Cooperation may vary by resolved Challenge: distributed clues, distributed pieces, shared synthesis or another supported #579 pattern. Not every Challenge must use identical team roles, and permanent specialization is prohibited.

A successful cooperative resolution advances an Israelite or group toward/into Goshen. The Israelites are a **shared party objective**, not team-owned pieces.

## Swarm completion
As Challenges are resolved:
**scattered protected Israelites -> cooperative Scripture work -> Israelites gather -> Goshen fills -> all represented Israelites are gathered**

The final Stage emphasizes the Exodus distinction: the swarm affects Egypt while Goshen is clear/protected. Scripture supplies the explanation from Ex 8:22–23.

Exact Challenge count, number of represented Israelites/groups, visual density and pacing are configurable/playtest tuning rather than fixed mechanic rules.

# Activity B — Distinction

## Learning identity
Distinction teaches a reusable three-part biblical relationship:

**God's Instruction -> Person's Response/Action -> Biblical Result**

The third component is essential: players learn not only whether someone followed God's instruction, but what Scripture records as the result/consequence of the response.

Content may include both obedience and disobedience. Examples must remain Scripture-grounded and avoid asserting causal/theological relationships beyond what the text supports.

## Cards
Every authored set contains exactly:
1. **Instruction** card
2. **Response/Action** card
3. **Result** card

The three card types have distinct consistent colors **plus text/icon/type indicators** so color is not the sole accessibility cue.

A valid match is one Instruction + one Response/Action + one Result belonging to the same authored biblical relationship.

## Deal generation
Hand size, deck size, total sets and required completed sets scale for the active 2–4 team topology and desired play length/difficulty.

Starting hands do **not** need balanced card-type distributions. A team may receive, for example, five Instruction cards, one Response card and no Result cards if produced by the valid deal.

Hard constraints:
- **No team may be dealt a complete valid three-card match.**
- Overall deal must remain solvable through permitted exchanges.
- Generator/validator rejects or redistributes invalid starting deals.
- Initial imbalance is intentional and creates cross-team dependency.

## Turn / blind exchange
On its turn:
1. active team chooses one other eligible team to exchange with;
2. active team privately selects one card to pass;
3. selected team privately selects one card to pass back;
4. neither team knows which card the other selected before both commit;
5. cards exchange simultaneously/atomically through #596;
6. play continues according to Distinction turn order.

"Simultaneous" means mutually hidden commitment, not reaction-time simultaneity.

Teams may communicate strategically, but cannot negotiate by inspecting the opponent's committed card before their own commitment.

## Match submission
A team deliberately submits three cards as a proposed set.

**Valid match:**
- award configurable positive points;
- remove/record the completed set according to hand/deal rules;
- reveal the completed **Instruction -> Response/Action -> Result** relationship on the Shared Stage;
- show appropriate Scripture reference/context;
- continue until that team reaches its required completed-set count.

**Invalid match:**
- deduct configurable points;
- return/retain the cards in the team's hand;
- do **not** reveal which component was wrong.

There is no speed bonus. Biblical accuracy drives scoring.

## Cooperative completion
Every team must complete its configured required number of valid sets for the activity to finish. Score does not let a team bypass the shared completion requirement.

This creates a cooperative endgame: teams that have completed their own requirement can use communication and exchange choices to help remaining teams complete theirs.

Exact positive/negative point values are configuration/playtest tuning.

## Exodus return / Pharaoh
After Bible-wide examples, presentation returns to the current Exodus account. Pharaoh's proposals are contrasted with God's command, including sacrificing in the land and later allowing departure only if Israel does not go very far away.

The activity may use the learned Instruction -> Response -> Result pattern to help players recognize Pharaoh's attempted compromise, but canonical events are fixed: Moses intercedes, the swarm is removed, and Pharaoh hardens his heart again.

# Flies acceptance
## Swarm
- [ ] Stage remains Exodus-only while Challenges may be Bible-wide;
- [ ] scattered Israelites are visibly already protected amid the swarm;
- [ ] player success gathers Israelites rather than causing/rescuing God's protection;
- [ ] Bible-wide protection content is Scripture-grounded;
- [ ] #579 creates genuine inter-team information/synthesis cooperation;
- [ ] successful cooperative work moves shared Israelites/groups toward Goshen;
- [ ] all represented Israelites ultimately gather in Goshen;
- [ ] final presentation emphasizes Ex 8:22–23 distinction;
- [ ] no reaction-speed/Bible-difficulty coupling.

## Distinction
- [ ] authored sets are Instruction + Response/Action + Result;
- [ ] both obedience and disobedience can be represented accurately;
- [ ] type-specific color plus accessible label/icon;
- [ ] hand/deck/set counts scale for 2–4 teams;
- [ ] starting type distribution need not be balanced;
- [ ] no starting hand contains a valid complete set;
- [ ] generated deal is solvable through exchanges;
- [ ] active team chooses exchange partner;
- [ ] #596 performs simultaneous hidden one-card exchange;
- [ ] valid submitted set earns configurable points and is revealed with Scripture context;
- [ ] invalid submitted set loses configurable points without identifying the wrong card;
- [ ] no speed bonus;
- [ ] every team must complete required sets;
- [ ] completed teams can continue cooperating to help others finish;
- [ ] Pharaoh's compromises/canonical outcome remain fixed.


# Chapter 2 — Plague 5: Livestock — Ex 9:1–7 (gameplay locked 2026-10-02)
**Classification: COMPOSE_EXISTING + NEW_REUSABLE_CAPABILITIES -> #578 Cooperative Work + #597 Investigation + #598 Concealed Choice + #599 Interactive Location Scene + shared Board/Track/Dice/Cards + #595 Challenge Assistance.**

Livestock uses two distinct activities:
1. **Tend the Flocks** — cooperative livestock work using the same shared production/work mechanism proven by Bricks Without Straw.
2. **Investigation** — each team solves its own Bible mystery while moving around an Egypt-themed evidence board and cooperatively routing clues.

Neither activity lets players prevent, cause or alter the canonical plague.

## Scripture frame / guardrails
Ex 9:1–7 records the command to let Israel go and serve the LORD; a severe plague upon specified Egyptian livestock; the LORD's distinction between Israel's livestock and Egypt's; the appointed time, "Tomorrow"; Pharaoh's investigation; and the finding that not one of Israel's livestock had died, yet Pharaoh's heart remained hardened.

Gameplay occurs as learning/presentation around that fixed account. Tend the Flocks must not imply player care determines which livestock survive. Investigation culminates in Pharaoh verifying the distinction; player performance does not change his response.

# Activity A — Tend the Flocks

## Identity
**Tend the Flocks** is the second proving consumer for #578 Cooperative Work.

The shared Stage contains multiple livestock types and corresponding pens/pastures. Teams dynamically contribute to the common livestock operation.

Core workflow:
**Gather food -> Herd livestock -> Pen livestock -> Feed livestock**

Different livestock types may require different authored/configured feed, pen/pasture destinations or work quantities where biblically/thematically appropriate.

## Cooperative Work composition
- Gather food produces shared resources needed for feeding.
- Herd moves livestock toward the appropriate destination.
- Pen places/herds livestock into the appropriate pen/pasture state.
- Feed consumes gathered food for the appropriately placed livestock.
- Teams choose whichever work currently helps the shared operation; no permanent shepherd/feed-gatherer specialization.
- Challenges/actions commit to authoritative shared state through #578.
- Multiple teams may work concurrently where #578 permits.
- Bottlenecks should emerge naturally from shared dependencies rather than hidden penalties.

## Fairness / scoring
Speed is not important and must not determine Bible difficulty or contribution opportunity. Use #578 fair work cycles/action allocations and equivalent resolved Challenge consequences.

Scoring remains intentionally simple: configurable contribution/work accomplishment points may be awarded, but scoring does not alter Scripture and exact values are playtest tuning.

Completion is a configured shared work objective, followed by the canonical plague narrative. Player success does not decide which animals are spared.

# Activity B — Investigation

## Identity
Compose #597 Investigation. Each team receives its own private Bible mystery. Mystery subjects explicitly may include **Person, Place, Object, Event, Action/Occurrence, Scripture Relationship**, or another compatible authored subject.

Teams travel the board, search highlighted locations, collect evidence, recognize their own clues, and negotiate clue swaps so evidence reaches the team that needs it.

## Egypt board
The board is a **grid of movement spaces** with each team beginning at its own starting location on an edge of the board.

Egypt-themed evidence locations replace rectangular groups of grid spaces rather than overlaying ordinary traversable cells. Small locations may be approximately **2x3** cells; larger locations may be as large as **4x4**, allowing substantial recognizable exterior artwork.

Examples include houses, stables, pastures, storehouses, fields and animal enclosures.

Each location has **one or two explicit entrances**. Its other footprint edges are not traversable entrances.

### Movement
- active team rolls the configured die/dice and may move **up to X** spaces;
- ordinary grid step = 1 movement;
- entering a location through a valid entrance = 1 movement;
- stopping immediately outside an entrance does **not** enter the location;
- entering immediately ends movement and forfeits unused movement;
- on a later turn, exiting through a valid entrance = 1 movement, after which remaining movement may be used normally.

Speed/reaction time is not a movement or Bible-difficulty factor.

## Highlighted evidence locations
Locations with available clues are highlighted so teams know where useful evidence can be sought.

The highlight MUST reveal only **evidence is available here**. It must not indicate which mystery/team any clue belongs to.

A location may contain multiple clues. A team receives at most **one clue per visit**. Remaining clues keep the location highlighted and the same team may revisit on a later turn.

## Entering a location
Entering transitions the Shared Stage from Board View into #599 **Interactive Location Scene**, showing the entered stable/house/pasture/etc. as an immersive larger environment.

For this checkpoint, the location interaction remains intentionally simple:
**Enter -> Location View -> face-down clue choices -> choose one -> private reveal/collection -> return to Board View.**

The scene architecture may later support a standalone Escape Room consumer, but Livestock does not add speculative Escape Room mechanics.

## Concealed clue choice
Available clues at a location are presented through #598 **Concealed Choice**, initially rendered as face-down cards.

The team sees card backs, chooses one without knowing its identity, and receives that clue. Unselected clues remain at the location.

This is participant choice among concealed options, **not inherently a randomizer**. Cards provide the Livestock presentation; the reusable capability can support other presentations such as drawing straws.

Card backs/presentation must not leak clue ownership.

## Clue ownership
When a clue enters a team's evidence:
- if it belongs to that team's assigned mystery, the private controller clearly marks it **Your Mystery**;
- otherwise there is no owner/team indicator.

Therefore a team knows a foreign clue should be traded, but must determine which other team likely needs it.

## Negotiated clue swap
Clue movement between teams is a **negotiated one-for-one swap**, not #596 Blind Exchange.

Only on the active team's turn:
1. active team chooses another team;
2. both teams knowingly select the exact clue they will give;
3. the clues exchange authoritatively;
4. each receiving team's private ownership indicator is reevaluated.

A clue may pass through multiple teams before reaching its owner. Incorrect routing is not automatically penalized.

## Solving mysteries
Teams may guess/submit their mystery solution **before collecting all clues**.
- correct solution earns configurable solution points;
- solving with less evidence receives a modest configurable early-solve advantage;
- incorrect guesses deduct configurable points;
- no reaction/speed bonus.

A solved team **continues playing**, traveling, drawing evidence and swapping clues to help unsolved teams.

**The activity ends immediately when every team has correctly solved its mystery, even if clues remain uncollected or in circulation.**

Collecting every clue is not a completion requirement.

## Investigation game difficulty
Investigation's selected **game difficulty** controls the amount of evidence available for each mystery, not the difficulty of Bible Challenges/questions.

**Higher game difficulty -> fewer clues -> fewer evidence locations -> more deduction from less information.**

**Lower game difficulty -> more clues -> more evidence locations -> more information before solving.**

Exact clue/location counts are authored/configurable rather than hard-coded. The selected evidence set and populated locations must remain solvable and meaningful at every supported difficulty. Do not add empty highlighted locations merely to preserve board density.

Any Bible Challenge/question used to earn, reveal or interact with evidence follows the Journey-wide rule above: its difficulty is resolved from the represented **Player Profile**, independently of Investigation game difficulty.

## Assistance
#595 assistance is available to an **unsolved** team only after it has collected **all clues belonging to its mystery**.

Once eligible:
- first assistance use for that mystery is free;
- each additional assistance use costs configurable points;
- each supported assistance type may be used at most once for that mystery;
- the checkpoint/configuration declares which #595 assistance types are supported.

Assistance cannot be used to bypass the exploration/trading phase before all of that team's evidence has arrived.

## Exodus investigation climax
After the team mysteries resolve, presentation returns explicitly to Ex 9:7.

Pharaoh sends to investigate whether Israel's livestock suffered the same plague. The finding is fixed by Scripture: **not one of the livestock of Israel was dead.** Pharaoh has verified evidence of the distinction, yet his heart remains hardened and he does not let the people go.

This is the thematic payoff for Investigation; the game does not make Pharaoh's investigation or response contingent on player performance.

# Livestock acceptance

## Tend the Flocks
- [ ] named **Tend the Flocks**;
- [ ] multiple livestock types;
- [ ] Gather food -> Herd -> Pen -> Feed workflow;
- [ ] composes #578 rather than creating a livestock-specific work engine;
- [ ] dynamic work selection/no permanent specialization;
- [ ] fair contribution independent of raw speed;
- [ ] simple configurable contribution scoring;
- [ ] completion leads to fixed canonical plague rather than determining survival.

## Investigation
- [ ] composes #597;
- [ ] each team has a private mystery and edge starting location;
- [ ] multiple explicit mystery subject types;
- [ ] grid board with 2x3-ish through 4x4 location footprints;
- [ ] one/two explicit entrances;
- [ ] roll and move up to X;
- [ ] entering and exiting each cost one movement;
- [ ] entering immediately ends movement;
- [ ] highlighted locations reveal evidence availability only;
- [ ] multiple clues per location, one clue per visit;
- [ ] entering uses #599 immersive Location Scene;
- [ ] face-down clue draw uses #598 Concealed Choice and Cards;
- [ ] own clue shows Your Mystery; foreign clue gives no owner hint;
- [ ] negotiated exact one-for-one clue swap occurs only on active team's turn;
- [ ] solve anytime, modest early-solve advantage, wrong-guess penalty;
- [ ] solved teams continue helping;
- [ ] all teams solved ends activity regardless of remaining clues;
- [ ] game difficulty controls clue/evidence count and therefore populated evidence-location count;
- [ ] higher game difficulty uses fewer clues/locations; lower game difficulty uses more;
- [ ] Challenge/question difficulty is Player-Profile-resolved and independent of Investigation game difficulty;
- [ ] assistance only after unsolved team has all its clues;
- [ ] first assistance free, subsequent uses cost points, each supported type once;
- [ ] Pharaoh's Ex 9:7 investigation/finding/response remain canonical.


# Chapter 2 — Plague 6: Boils — Ex 9:8–12 (gameplay locked 2026-10-03)
**Classification: COMPOSE_EXISTING + EVENT_SPECIFIC PRESENTATION -> existing Challenge Families/Resolver + Progressive Clue capability (#307 lineage) + #579 Composite Cooperative + #595 Challenge Assistance + shared scoring/persistence. No new reusable capability is currently justified.**

Boils uses two deliberately different cooperative activities:
1. **Fire the Kiln** — teams solve Bible-wide fire-themed Challenges to earn logs and collectively build the kiln fire.
2. **Afflicted! — Making the Rounds** — all teams act as one physician group, taking turns asking distributed questions about the same patient and solving a two-part biblical diagnosis: **Affliction + Afflicted**.

The canonical transition connects the activities: after the configured kiln work is complete, the fire burns out; Moses takes ashes/soot from the furnace and throws them toward heaven before Pharaoh; the resulting dust/boils transition leads into **Afflicted!**. Players do not perform Moses' canonical action or determine whether the plague occurs.

## Scripture frame / guardrails
Ex 9:8–12 records Moses and Aaron taking handfuls of soot/ashes from the furnace, Moses scattering it toward heaven before Pharaoh, boils breaking out on people and animals, the magicians being unable to stand before Moses because of the boils, and Pharaoh's heart remaining hardened.

Bible-wide fire and affliction cases are learning/game content. Their people/events are not literally transported into Exodus Egypt. **Afflicted!** uses physician/diagnosis language as a gameplay frame for identifying what Scripture records; it is not modern medical diagnosis or treatment advice. Do not invent a diagnosis for a condition Scripture leaves unspecified.

# Activity A — Fire the Kiln

## Shared objective
The Shared Stage presents an Egyptian kiln and a **configured set of selectable logs**. Teams collectively fire the kiln.

Core rhythm:
**Choose log -> resolve fire-themed Bible Challenge -> correct: score + throw log into kiln -> fire grows.**

Each log wraps a resolved Bible-wide fire-themed Challenge using existing Challenge Families rather than defining a log-specific puzzle engine. Eligible content may involve biblically grounded fire/furnace/burning/altar/refining/related accounts where the relationship is actually supported by Scripture.

## Log selection / resolution
- On its opportunity, a team **chooses an available log**.
- The log resolves its configured/eligible fire-themed Challenge through normal Challenge infrastructure.
- **Correct answer:** award that team the configured log points; the log is visibly thrown into the kiln; shared fire state increases.
- **Incorrect answer:** the team does not receive those points and **the log does not go into the kiln**.
- Exact log count, Challenge mix, point values and retry/remaining-log policy are configuration/playtest tuning.
- Raw response speed is not Bible difficulty and is not required for log credit.

The shared visual objective is cooperative, while the Score Ledger preserves which team contributed each successfully burned log.

## Completion / canonical transition
When the configured kiln objective is complete, Challenge play stops. The kiln fire is allowed to **burn down**:
**flames -> embers -> ashes/soot.**

Then canonical narrative takes control:
**Moses/Aaron approach furnace -> take ashes/soot -> Moses throws it toward heaven before Pharaoh -> fine dust spreads -> boils appear.**

The ashes are a satisfying consequence of the kiln presentation, but gameplay does not imply the teams cause the plague. This sequence transitions directly into **Afflicted!**.

# Activity B — Afflicted!
**Subtitle:** *Making the Rounds*

## Identity
All participating teams collectively act as **one physician team** making rounds through a sequence of Bible-wide patient cases. They work on **the same patient at the same time**.

Every case has one atomic two-part solution:
- **Name the Affliction** — what is it?
- **Name the Afflicted** — who is it?

A diagnosis is correct only when **both parts are correct together**. The game does not independently lock or confirm either half.

## Terse clue/content rule
Case information is intentionally terse. Answers should normally be short chart-note-like fragments rather than explanatory trivia prose. Clue directness may vary with authored difficulty, but verbosity is not the difficulty mechanism.

After a case is solved, the full case review may show the relevant Scripture/context, what Scripture records happening, and any recorded instruction/outcome. The teaching detail belongs primarily in the post-solve review, not in the terse diagnostic clues.

## Distributed questions / cooperative turn flow
Questions for the current patient are **split among the teams**. Which team receives which available questions may change from patient to patient; there are no permanent specialties/roles.

Teams take turns:
1. active team selects one of the unrevealed questions currently assigned/available to it;
2. the selected **question appears on the Shared Stage**;
3. its terse **answer is revealed on the Shared Stage** so every team receives the information;
4. after receiving the answer to its selected question, that team becomes eligible to attempt the diagnosis;
5. if it does not diagnose, or diagnoses incorrectly, play advances normally and teams continue revealing questions.

A team may attempt a diagnosis **only after getting the answer to one of its own selected questions**. It cannot simply wait for another team's reveal and immediately claim a guess window.

This composes #579's distributed-contribution/cooperative-information principles without requiring permanent participant/controller assignments. Question allocation must respect the active topology and Host/keyboard fallback rules.

## Diagnosis evaluation
A submitted diagnosis contains **Affliction + Afflicted together**.

**Correct diagnosis:**
- ends the patient case;
- awards the **same base diagnosis points to every participating team**, recognizing the shared investigation;
- may award a **modest early-diagnosis bonus** according to how much unrevealed information remained;
- proceeds to Scripture case review, then the next patient.

**Incorrect diagnosis:**
- deducts a **modest configurable amount only from the team that guessed**;
- does not end the case;
- does **not** reveal whether the Affliction, the Afflicted, or both were wrong;
- neither half becomes locked/confirmed.

Early-diagnosis advantage and wrong-guess deduction must remain modest: they reward deduction and discourage indiscriminate guessing without overwhelming cooperative diagnosis scoring. No reaction-speed bonus.

## Assistance after normal clues
Normal Assistance is **not available until all authored normal questions/clues for the patient have been revealed**.

Once all clues are exhausted:
- #595 assistance becomes available if enabled/configured;
- available assistance is a **single shared case pool across all teams**, not a separate duplicate pool per team;
- an assistance option consumed by one team is no longer independently available to another team for that case unless policy explicitly provides multiple uses;
- the **team choosing/using assistance pays the configured point deduction**;
- one supported assistance form may be **MULTIPLE_CHOICE**, presenting/narrowing diagnosis possibilities as configured;
- assistance does not identify which half of a failed diagnosis was wrong unless an explicitly configured assistance type says so;
- normal turn/diagnosis eligibility remains in force: assistance does not silently create an unrestricted guess window.

Assistance costs and availability are configuration/playtest tuning. Assistance history must not be used to infer participant/team Bible skill.

## Case review / progression
Once both parts are correctly identified, reveal the Scripture-grounded case review. The review may explain the person, affliction, passage/context, recorded instruction/treatment where Scripture explicitly provides one, and outcome.

Cases may include healing and non-healing outcomes. Content must not imply that correct action always results in physical healing or assign medical diagnoses to ambiguous/unspecified biblical conditions.

Then the physician team moves to the next patient: **Making the Rounds**.

## Final Exodus case
The final patient returns directly to the current Exodus account.

Required solution:
- **Affliction:** Boils
- **Afflicted:** Egyptian magicians

The exact accepted answer/alias model should remain translation/content aware; the case review resolves to Ex 9:11: the magicians cannot stand before Moses because of the boils, which are upon the magicians and the Egyptians.

Do not turn this into a cure/treatment puzzle; Exodus does not provide a player-discoverable cure for the plague.

After the final case, narrative continues through Ex 9:12 with Pharaoh's heart remaining hardened.

# Capability audit
## Fire the Kiln
**COMPOSE_EXISTING + EVENT_SPECIFIC PRESENTATION.**
- existing Challenge Families/Resolver own the Bible puzzles;
- shared scoring owns team log points;
- Exodus owns log/kiln/fire/ash presentation and configured fire-theme query;
- no reusable kiln/log engine is justified.

## Afflicted!
**COMPOSE_EXISTING.**
- Progressive Clue capability owns deterministic clue/reveal state, attempt windows, review/persistence primitives;
- #579 owns reusable distributed cooperative contribution/topology principles;
- #595 owns optional assistance policy/effects;
- shared scoring/persistence own authoritative point/state handling;
- **Afflicted! owns its distinctive case rules:** one shared patient, distributed selectable questions, terse chart-note presentation, guess eligibility after own question reveal, atomic Affliction+Afflicted evaluation, no partial correctness leak, equal shared correct-diagnosis points, guesser-only wrong penalty, modest early bonus, and post-solve Scripture case review.

Do **not** create a new Diagnosis/Medical capability yet. The activity is a credible future standalone/embedded experience, but its current mechanics compose existing capabilities cleanly. Extract only if later consumers demonstrate reusable behavior not already owned by Progressive Clue/#579/#595.

# Boils acceptance
## Fire the Kiln
- [ ] configured selectable log set;
- [ ] each log resolves a Bible-wide fire-themed Challenge through existing families/Resolver;
- [ ] correct answer awards that team log points and throws log into shared kiln;
- [ ] incorrect answer earns no log points and log does not enter kiln;
- [ ] kiln visibly grows as successful logs are added;
- [ ] configured objective ends Challenge play;
- [ ] fire burns down to embers/ashes;
- [ ] Moses performs the canonical ash-scattering action, not players;
- [ ] transition leads directly to boils/Afflicted!;
- [ ] no speed-based Bible difficulty.

## Afflicted!
- [ ] title **Afflicted!**, subtitle **Making the Rounds**;
- [ ] all teams cooperate on the same patient;
- [ ] solution is atomic **Affliction + Afflicted**;
- [ ] clues/answers are intentionally terse;
- [ ] questions are distributed among teams and allocation may change by patient;
- [ ] teams alternate selecting one of their available questions;
- [ ] selected question + answer become public on Shared Stage;
- [ ] only the team that just received its question answer gets that diagnosis opportunity;
- [ ] wrong diagnosis does not reveal which half is wrong and locks neither half;
- [ ] wrong diagnosis modestly deducts only from guessing team;
- [ ] correct diagnosis awards equal base diagnosis points to all teams;
- [ ] modest early-solve bonus;
- [ ] no speed bonus;
- [ ] assistance unavailable until all normal clues revealed;
- [ ] assistance pool is shared across teams for the patient;
- [ ] team using assistance pays its configured point cost;
- [ ] MULTIPLE_CHOICE can be a supported assistance form;
- [ ] post-solve Scripture case review;
- [ ] final case resolves **Boils + Egyptian magicians**;
- [ ] no unsupported medical diagnosis/treatment claims;
- [ ] Ex 9:11–12 outcome remains canonical.


# Chapter 2 — Plague 7: Hail — Ex 9:13–35 (gameplay locked 2026-10-03)
**Classification: COMPOSE_EXISTING + SPINNER CAPABILITY EXTENSION -> existing Challenge Families/Resolver + selective IDENTIFY/GROUP-style choice composition + Spinner/Wheel #152 + shared scoring/persistence. No new Discernment Gathering capability is currently justified.**

Hail has two deliberately different cooperative activities:
1. **Prepare for the Storm** — deliberate Bible-wide discernment and selective gathering around warning/preparation contrasts.
2. **Hailstorm** — rapid True/False Challenges resolve two blank spinner sectors, then the spinner determines HIT/BOUNCE while the Stage progressively shows hail damage.

## Scripture frame / guardrails
Ex 9:13–35 includes the warning to bring servants/livestock in from the field; servants who fear the word of the LORD act on the warning while others disregard it; hail/fire strike Egypt while Goshen is spared; flax/barley are struck while wheat/spelt are not destroyed because of their growth stage; Pharaoh confesses/request relief; Moses goes outside the city and spreads out his hands; the storm stops; Pharaoh sins again/hardens his heart.

Gameplay teaches/represents these distinctions but does not rewrite who historically heeded the warning, God's protection of Goshen, the plague outcome, crop outcome, Moses' action, or Pharaoh's response.

# Activity A — Prepare for the Storm
## Discernment gathering
Core rhythm: **Challenge -> inspect multiple choices -> select only qualifying choice(s) -> gather/prepare correct selections -> shared preparation advances.**

The Challenge establishes a criterion and the player/team selectively identifies what belongs. It is not necessary to classify every non-selected item. The presentation may gather/move qualifying people, livestock, crops/items or other authored representations toward the shared preparation objective.

Exodus-specific contrasts include:
- field / shelter;
- heed / disregard;
- Egypt / Goshen;
- flax & barley / wheat & spelt.

Challenges may use Scripture-wide examples of warnings, obedience/response, refuge/protection, appropriate objects/people/categories and other reviewed relationships. Concrete Challenge/question difficulty always follows the Journey-wide Player Profile invariant.

## Scoring
- a correct qualifying selection is gathered/advances shared preparation and awards its configured points to **all teams**;
- a wrong/non-qualifying selection does **not** gather/move and deducts only from the team that made the wrong selection;
- no raw speed bonus.

## Capability audit — Prepare
**COMPOSE_EXISTING.** The learning interaction is selective multiple-choice IDENTIFY/GROUP-style Challenge behavior plus event-owned gathering/progression presentation. #202 Gather the Twelve demonstrates collection as a consumer pattern, but neither #202 nor #578 should be expanded into a generic selective-gathering engine solely for Hail. Extract only if future consumers demonstrate reusable state/behavior beyond Challenge selection + consumer progression.

# Activity B — Hailstorm
## Spinner setup and Challenge
Hailstorm composes #152 Spinner/Wheel dynamic pre-spin segment resolution.

Every turn begins with a fresh **12 equal-sector** spinner layout generated authoritatively with random placement:
- **7 HIT**
- **3 BOUNCE**
- **2 BLANK/UNRESOLVED**

The active team receives a deliberately short **True/False Bible Challenge** resolved at the represented Player Profile's difficulty. True/False keeps the cadence fast so the activity feels like repeated hailfall; response speed itself is not a difficulty/scoring factor.

The two visible BLANK sectors are the only sectors changed by the Challenge:
- **correct -> both BLANK become HIT**, final composition **9 HIT / 3 BOUNCE**;
- **incorrect -> both BLANK become BOUNCE**, final composition **7 HIT / 5 BOUNCE**.

Existing HIT/BOUNCE sectors keep their positions. The two blanks resolve **in place**; the spinner is not reshuffled after the answer. Then the authoritative spin occurs.

## Hailstorm scoring
The Challenge answer itself awards/deducts **zero points**. It only changes the spinner composition/probability.

Only the spin result scores:
- **HIT -> configured shared hit points to every team + advance progressive Stage damage**;
- **BOUNCE -> zero points + no damage**.

A configured number of successful HIT results completes the destruction sequence. All teams also receive the same configured **cooperation/efficiency bonus** based on reaching that hit target in fewer total turns/spins. Exact hit target, hit value and efficiency bands are configuration/playtest tuning.

This intentionally makes every team want every other team to answer correctly: individual Challenge performance changes shared odds; spinner outcomes produce shared points; collective efficiency produces a shared completion bonus.

## Progressive Stage damage
Each HIT advances authoritative cumulative storm-damage state and the Shared Stage visibly progresses from intact through increasingly severe damage. The authored final state is reached at the configured hit target.

Shelter/protected contents and Goshen do not accumulate destruction. A BOUNCE may visually show hail striking/deflecting from shelter or otherwise failing to produce scored damage. The Stage must never let randomization contradict Goshen's canonical protection.

The spinner need not choose a board coordinate. A HIT authorizes the next valid deterministic/content-driven damage event so repeated hits cannot deadlock completion by repeatedly targeting already-destroyed/protected spaces.

## Completion / canonical ending
At the configured HIT target, Hailstorm gameplay ends and canonical narrative takes control. The review/presentation explicitly reinforces flax/barley versus wheat/spelt and the other preparation contrasts. Pharaoh's confession/request, Moses going outside the city and spreading out his hands, cessation of thunder/hail, and Pharaoh's renewed sin/hardening remain fixed narrative rather than another player-controlled game.

# Hail acceptance
## Prepare for the Storm
- [ ] deliberate selective/discernment gathering;
- [ ] Challenge supplies criterion; player selects only qualifying option(s);
- [ ] Bible-wide reviewed Challenge content allowed;
- [ ] Player Profile, never game difficulty, determines Challenge/question difficulty;
- [ ] Exodus contrasts include field/shelter, heed/disregard, Egypt/Goshen, flax-barley/wheat-spelt;
- [ ] correct gathered selection advances shared preparation and scores for all teams;
- [ ] wrong selection does not gather and deducts only from selecting team;
- [ ] no speed bonus;
- [ ] composes existing Challenge behavior; no new gathering capability yet.

## Hailstorm
- [ ] #152 Spinner/Wheel composition;
- [ ] fresh 12-sector layout per turn with randomly placed 7 HIT + 3 BOUNCE + 2 BLANK;
- [ ] short True/False Bible Challenge at Player-Profile-resolved difficulty;
- [ ] correct replaces both blanks in place with HIT -> 9/3;
- [ ] incorrect replaces both blanks in place with BOUNCE -> 7/5;
- [ ] no reshuffle after Challenge resolution;
- [ ] Challenge answer itself gives/takes no points;
- [ ] HIT gives shared points and advances progressive damage;
- [ ] BOUNCE gives no points and no damage;
- [ ] configured HIT target ends gameplay;
- [ ] shared efficiency bonus rewards fewer total turns to target;
- [ ] progressive Stage damage reaches authored devastation while Goshen remains protected;
- [ ] deterministic persistence/reconnect preserves generated spinner/resolution/result state;
- [ ] canonical crop distinctions and Pharaoh/Moses ending are preserved.


# Chapter 2 — Plague 8: Locusts — Ex 10:1–20 (gameplay locked 2026-10-03)
**Classification: COMPOSE_EXISTING + EVENT_SPECIFIC BOARD/PRESENTATION -> existing Challenge Families/Resolver + Board/Track topology/movement primitives + Dice/randomizer + shared scoring/persistence. No new reusable capability is currently justified.**

Locusts intentionally uses **one strong primary activity**. Do not add a second activity merely to satisfy an activity-count pattern.

## Scripture frame / guardrails
Ex 10:1–20 includes Moses and Aaron's warning, Pharaoh's servants urging him to relent, Pharaoh attempting to restrict who may go, the east wind bringing the locusts, locusts covering the land and consuming what the hail left, Pharaoh's confession/request, Moses' intercession, a strong west wind removing the locusts into the Red Sea, and Pharaoh's heart remaining hardened.

The game represents small team-associated sections of the much larger locust swarm. Player performance does not determine whether the plague occurs or alter its canonical outcome. Do not extend Goshen's explicit hail protection into this plague unless supported by the authored Scripture/content.

## Primary activity — Locust Swarm
The Shared Stage shows a landscape containing the vegetation remaining after Hail. A strong east-wind transition brings the locust swarm into Egypt. Each team controls a visually distinguishable **small section of the overall swarm**.

All team swarm sections begin on the **middle space of the east edge**. The common entrance/start space is barren/non-scoring so no arbitrary team receives first-consumption points.

Core turn rhythm:

**Bible Challenge -> directional control if correct -> roll movement die -> advance cell-by-cell -> first swarm entering vegetation consumes it and scores -> next team**

Challenge/question difficulty is ALWAYS resolved from the represented Player Profile under the Journey-wide invariant.

### Directional control
Each swarm maintains a current heading.

- **Correct Challenge:** the active team may choose/change to any legal direction from its current space.
- **Incorrect Challenge:** the swarm keeps its existing heading; there is no point penalty and movement still occurs if the heading remains legal.
- Response speed is not scored.

The mixed board geometry determines legal headings:
- **octagon:** up to eight exits/directions — N, NE, E, SE, S, SW, W, NW;
- **square:** four side-connected exits — N, E, S, W as applicable to its orientation/topology;
- a swarm reaches a square only through a cardinal N/S/E/W move, so maintaining heading through a square is unambiguous;
- diagonal movement is octagon-to-octagon.

Only directions actually available from the current board space are selectable after a correct Challenge.

### Outer board edge
If the current heading would leave the board:
- movement stops at the edge;
- unused movement from that roll is lost;
- heading remains unchanged;
- a later correct Challenge can redirect the swarm;
- if the next Challenge is incorrect and the unchanged heading still points off-board, the swarm remains stuck for that turn.

No automatic bounce/reflection/edge redirection.

## Board topology and consumption values
Use the regular **square-octagon (truncated-square) tiling** envisioned for this activity rather than a uniform square grid.

Both space shapes may contain consumable vegetation:
- **square vegetation space = 1 point**
- **octagon vegetation space = 3 points**

These are gameplay values, not literal acreage ratios.

When a swarm first enters an unconsumed vegetation space:
1. vegetation is consumed immediately;
2. the controlling team receives that space's configured value;
3. the space becomes barren/non-scoring.

A barren/already-consumed space remains traversable.

**First swarm to the space consumes it.** Later swarms may enter, occupy or cross the same space but receive zero points. Team swarms do not collide, block, fight, steal, or merge mechanically.

This creates light competition for valuable unconsumed territory while preserving the shared objective of consuming the whole authored vegetation field.

## Movement die
Movement uses a custom six-sided die with exactly:
- two faces showing **1**;
- two faces showing **2**;
- two faces showing **3**.

The six values are randomly assigned to visual/physical die faces when the die is initialized for the game. That authoritative face layout is persisted for save/reconnect and does not change between rolls.

The rolled value is the number of spaces the swarm attempts to advance in its current/chosen heading. There is no conversion from a conventional 1–6 die result.

## Turn order
Teams use normal rotating turns.

Before gameplay, all participating teams take part in a shared initiative/order randomization using an available platform randomizer (dice, spinner, lots or another compatible configured presentation). The resulting team order is fixed for the activity and then repeats normally.

Initiative randomization is separate from the Locust 1/1/2/2/3/3 movement die. Locusts does not own a bespoke initiative engine.

## Scoring / completion
- each vegetation space scores only for the team whose swarm consumes it first;
- square = 1 point; octagon = 3 points;
- no points for merely moving through barren spaces;
- no direct points for Challenge correctness;
- no penalty for an incorrect Challenge;
- no penalty for barren movement, reaching the edge, or consuming nothing;
- no speed bonus;
- no separate efficiency/completion bonus currently required.

**The activity ends immediately when all configured consumable vegetation spaces have been consumed.**

Individual team scores therefore represent how much vegetation that team's swarm section consumed, while clearing the vegetation field is the shared completion objective.

## Canonical ending
Completion transitions back to authored Exodus narrative: the locusts have consumed what the hail left; Pharaoh confesses and asks for forgiveness/relief; Moses entreats the LORD; a strong west wind removes the locusts into the Red Sea; Pharaoh's heart remains hardened.

The west-wind removal is presentation/narrative, not another required game.

## Capability audit
**COMPOSE_EXISTING + EVENT_SPECIFIC BOARD/PRESENTATION.**
- Challenge Families/Resolver own Bible Challenges and Player-Profile-resolved question difficulty.
- Board/Track owns reusable topology/node/connectivity/movement primitives where applicable.
- Dice/randomizer owns authoritative random outcomes and persisted RNG/layout.
- shared scoring/persistence own authoritative score and resumable state.
- Exodus owns the square-octagon vegetation-field configuration, locust presentation, consumption semantics, east/west wind transitions and canonical narrative.

Do not create a reusable Locust/Swarm Consumption capability solely for this checkpoint. Extract a reusable capability only if later consumers demonstrate genuinely reusable behavior beyond Board + Dice + Challenge + consumer-owned state.

## Locusts acceptance
- [ ] one strong primary Locust Swarm activity; no filler second activity required;
- [ ] all team swarm sections begin at one central east-edge entrance;
- [ ] entrance/start space is barren/non-scoring;
- [ ] each team controls a small visually distinct section of the larger swarm;
- [ ] fixed rotating turn order established by shared pre-game randomization;
- [ ] custom d6 has two 1s, two 2s and two 3s with randomized persisted face placement;
- [ ] Challenge difficulty is Player-Profile-resolved;
- [ ] correct Challenge permits legal direction choice/change;
- [ ] incorrect Challenge preserves heading and has no point penalty;
- [ ] octagons provide up to 8 directions; squares provide 4 cardinal connections;
- [ ] square entry/exit preserves unambiguous cardinal heading;
- [ ] outer-edge movement stops, unused movement is lost and heading remains;
- [ ] square-octagon authored board topology;
- [ ] square vegetation = 1 point; octagon vegetation = 3 points;
- [ ] first swarm entering vegetation consumes/scores it;
- [ ] consumed spaces become barren but remain traversable;
- [ ] swarms may cross/share spaces without collision/blocking/merging;
- [ ] no penalties and no speed scoring;
- [ ] all vegetation consumed ends gameplay immediately;
- [ ] canonical west-wind/Red-Sea removal and Pharaoh response remain fixed narrative.


# Chapter 2 — Plague 9: Darkness — Ex 10:21–29 (gameplay locked 2026-10-03)
**Classification: COMPOSE_EXISTING + BOARD/TRACK EXTENSION CANDIDATE -> Challenge Families/Resolver + Board/Track graph/topology + shared scoring/persistence. Darkness owns its thematic maze rules/presentation; reusable runtime topology mutation belongs in Board/Track if generalized.**

Darkness intentionally uses **one strong primary activity**. Do not add a second activity merely to satisfy an activity-count pattern.

## Scripture frame / guardrails
Ex 10:21–29 records darkness over Egypt for three days, darkness that could be felt, people unable to see one another or rise from their places, while the children of Israel had light in their dwellings. Pharaoh again attempts a partial concession, this time retaining the flocks/herds; Moses refuses; Pharaoh threatens Moses; Moses says he will see Pharaoh's face no more.

The maze is a **thematic gameplay representation** in which represented Israelites who are away from home seek their way back to Goshen through the darkness. Scripture does not state that Israelites literally wandered Egypt during the plague, so presentation/content MUST NOT claim this maze journey is a recorded historical action.

Goshen/light is the gameplay destination. Player performance does not cause/end the plague or change the canonical Pharaoh/Moses exchange.

## Primary activity — Darkness Maze / Return to Goshen
Each team begins at a configured separate position in a dark maze and represents Israelites trying to return to Goshen.

The maze is a genuine graph, not a single hidden correct route. Generated/authored layouts may contain:
- multiple valid routes to Goshen;
- intersections;
- loops;
- alternate routes;
- genuine dead ends;
- varying space shapes/geometries;
- special spaces and collectible power-ups.

All generated/mutated states MUST preserve at least one valid completion route for every unfinished traveling group.

## Darkness / local illumination
The normal Stage state does **not** reveal the maze topology around a team. Darkness hides even which directions are currently open.

Core turn rhythm:

**Bible Challenge -> illumination if correct -> choose one movement action -> resolve destination/special-space effects -> next traveling group/team**

Challenge/question difficulty is ALWAYS resolved from the represented Player Profile under the Journey-wide invariant.

### Correct Challenge
A correct Challenge briefly illuminates **only enough local geometry to reveal the current space's available exits versus walls**.

It MUST NOT reveal:
- where those exits ultimately lead;
- whether a route is a dead end;
- whether it loops;
- the route to Goshen;
- distant maze topology.

After the local reveal, the maze returns to darkness. Players may remember/discuss what they observed; no automatically filling minimap is required.

### Incorrect Challenge
An incorrect Challenge provides no local illumination and no score penalty.

The traveling group may still choose a direction blindly:
- if a normal connection/opening exists, it moves one space;
- if a wall blocks that direction, it remains in place.

Challenge success therefore grants **information**, not extra movement or direct points.

## Normal movement
A traveling group gets exactly **one player-chosen movement action per turn**.

Normal movement moves **one connected space only**.

A player cannot make a normal one-space move and then choose a second movement action in the same turn. Triggered destination effects are separate from the one player-chosen movement action and may subsequently relocate the group.

## Team merging / cooperative travel
If one traveling team/group ends a movement/effect on a space occupied by another unfinished team/group, they **merge into one traveling group**.

Once merged:
- they share one authoritative maze position;
- they travel together for the remainder of the activity;
- constituent team identities/scores remain separate;
- Challenges rotate among the constituent teams so one team does not permanently own navigation;
- a correct Challenge from the active constituent team illuminates the current location for the entire traveling group;
- held power-ups become usable resources of the combined traveling group.

Additional teams/groups can merge into an existing traveling group later.

Merged teams do **not** receive multiple normal moves merely because multiple teams are present. The combined group still makes one player-chosen movement action on its turn.

## Special spaces / power-ups
Keep the base catalog intentionally small:

### LIGHT — held/consumable power-up
Provides the applicable local illumination without requiring a correct Challenge for that use/turn, according to configured policy. It reveals only the same local exit/wall information normal successful illumination would reveal; it is not a map reveal.

### PASS THROUGH WALL — held/consumable power-up
Allows the traveling group to deliberately move through one wall into an eligible adjacent space.

**Passing through the wall IS the group's one player-chosen movement action for that turn.** A group cannot move one normal space and then pass through a wall, or pass through a wall and then take another normal movement action.

### SPRING — triggered special space
Landing on a Spring immediately launches the traveling group **one additional space** according to the spring's configured/resolved direction.

Spring direction may be forward, backward, sideways, diagonal/angular where topology permits, or randomly resolved.

A Spring may propel the group **through a wall**. Spring movement is a triggered board effect and does not consume another player-chosen movement action.

### TRANSPORTER — triggered special space
Landing on a Transporter immediately relocates the traveling group to another eligible maze space according to configured/authoritative randomization.

Transporter resolution must preserve solvability and deterministic persistence/reconnect.

## Game difficulty versus Challenge difficulty
**Game difficulty changes the maze; it never changes Bible-question difficulty.**

Game-difficulty dimensions may include:
- maze size / number of spaces;
- route/topology complexity;
- dead-end depth and loop density;
- frequency/mix/availability of Light and Pass Through Wall power-ups;
- frequency/mix/behavior of Spring and Transporter spaces;
- space geometry, including shapes that permit angular/diagonal connections;
- whether/how often portions of the maze **shape-shift** during play.

Concrete Bible Challenge difficulty remains independently Player-Profile-resolved.

### Shape-shifting maze
At configured higher game difficulties, portions of the maze may mutate while play is underway:
- walls may open/close;
- legal connections may change;
- spaces may rotate/reconfigure where the board model supports it.

Rules:
- every authoritative mutation MUST preserve reachability of Goshen for every unfinished group;
- a mutation may invalidate players' remembered route information;
- changed topology is visible when/where currently illuminated;
- topology changes in darkness are not globally disclosed merely to preserve old player knowledge;
- deterministic state/persistence must restore the exact current maze topology on reconnect.

## Scoring
There are:
- no Challenge-answer points;
- no wrong-answer penalties;
- no movement points;
- no speed bonus;
- no penalty for hitting a wall or being moved by a special space.

Score is awarded when a traveling group reaches Goshen.

Every constituent team in that arriving group receives the **same configured arrival score**, and the per-team arrival value increases with the number of teams that arrive together. This is deliberately cooperative: merging before reaching Goshen can improve every constituent team's score.

Illustrative tuning only: 1 team = base arrival value; 2 together = larger per-team value; 3 = larger again; all 4 = maximum. Exact values are configuration/playtest data.

Once a group reaches Goshen:
- it is finished;
- it remains safely in Goshen/light;
- it does not leave Goshen to collect additional teams.

The activity ends when **all represented teams have reached Goshen**.

## Capability audit
**COMPOSE_EXISTING + BOARD/TRACK EXTENSION CANDIDATE.**
- Challenge Families/Resolver own Bible Challenges and Player-Profile-resolved question difficulty.
- Board/Track owns graph nodes, connections, positions, legal movement and topology primitives.
- randomizer infrastructure owns random Spring/Transporter resolution where configured.
- shared scoring/persistence own authoritative scores, group state and reconnect.
- Darkness owns hidden-topology presentation, illumination semantics, Goshen objective, team-merging travel rule, the four-item special catalog/configuration and canonical Exodus framing.

**Runtime topology mutation / shape-shifting should not be implemented as Exodus-only maze code if it requires reusable graph mutation.** Extend Board/Track with validated dynamic connection/topology mutation when implementation reaches that requirement, including reachability validation and deterministic persistence.

Do not create a generic Darkness/Maze engine solely for this checkpoint. Extract additional reusable capability only when further consumers demonstrate it.

## Darkness acceptance
- [ ] one strong primary maze activity; no filler second activity required;
- [ ] teams represent Israelites thematically trying to return to Goshen;
- [ ] presentation does not claim Scripture records Israelites wandering during the plague;
- [ ] maze supports multiple valid routes, loops, intersections and dead ends;
- [ ] normal darkness hides even locally available directions;
- [ ] correct Challenge reveals only current local walls/open exits;
- [ ] incorrect Challenge gives no illumination but permits a blind direction attempt;
- [ ] Bible Challenge difficulty remains Player-Profile-resolved;
- [ ] game difficulty controls maze size, topology complexity, power-ups/specials, space geometry and optional shape-shifting;
- [ ] one player-chosen movement action per turn;
- [ ] normal movement = one connected space;
- [ ] Pass Through Wall replaces normal movement for that turn;
- [ ] Spring/Transporter are triggered effects and may move the group after its chosen move;
- [ ] Spring may move forward/back/sideways/angular/randomly and may push through walls;
- [ ] Transporter resolves to an eligible authoritative destination;
- [ ] Light and Pass Through Wall are held/consumable resources;
- [ ] teams/groups landing together merge and thereafter travel at one position;
- [ ] merged group Challenges rotate among constituent teams;
- [ ] merged groups still receive only one chosen movement action per turn;
- [ ] maze mutations never make Goshen unreachable;
- [ ] reconnect restores exact topology, positions, merges, held resources and special-space state;
- [ ] only Goshen arrival scores;
- [ ] every team in an arriving group receives the same arrival value;
- [ ] larger merged arrival groups earn larger per-team arrival value;
- [ ] arrived groups remain in Goshen and cannot leave to collect others;
- [ ] activity ends when all teams reach Goshen;
- [ ] Pharaoh/Moses ending remains canonical narrative.
