> **Source-preserving extraction** from [Exodus Journey #461](https://github.com/mkunze8187-cmd/bible-challenge/issues/461), snapshot 2026-10-10. This text retains the original approved design wording and chronology; the issue remains the original source. Verify conflicts against newer checkpoint-specific specs before implementation.

# Chapter 3 — God Leads Israel / Pursuit to the Sea — Ex 13:17–22 into Ex 14 (gameplay locked 2026-10-05)

**Classification: COMPOSE_EXISTING + NEW_REUSABLE_CAPABILITY -> Board/Track (#481) + Private Challenge Stage/InputAction (#399) + private Challenge execution (#593) + Challenge Resolver + Discernment/Wisdom Choice (#601).**

## Scripture / theological intent
This checkpoint explores God's presence, direction and provision; human dependence; discernment; patience, humility and obedience; and the limits of judging a path only by what appears easiest or shortest.

The pillar of cloud/fire remains part of the canonical Exodus narrative, but **is not an answer-key icon attached to gameplay route choices**. The competitive route simulation is an experiential illustration, not an alternate history of Israel. Scripture records that God led Israel and brought His people to the sea.

Core experiential contrast:
- the apparently shortest route is not necessarily fastest in realized travel;
- the apparently easiest route is not necessarily best;
- the Right route may look longer/harder;
- players cannot see future loops, obstacles, branches or Blessings;
- God's provision on the Right route makes consistent faithful travel the best actual journey.

After the simulation, all players return to the one canonical Journey state regardless of competitive capture outcomes.

## Competitive exception / completion
This Journey checkpoint intentionally permits teams to compete independently.
- Teams travel separate authoritative histories over a shared hidden route graph.
- The activity does **not** end when the first team reaches the Red Sea.
- Every team resolves its competitive journey by either **reaching the Red Sea** or **being caught by Pharaoh's army**.
- Arrival order/prizes/scoring are configurable balancing data.
- A captured team stops competitive travel and may observe remaining teams.
- Capture is explicitly framed as a simulation outcome, not a claim that this happened to Israel in Exodus.
- When all teams resolve, competitive state ends and the canonical Exodus Journey resumes with Israel at the Red Sea.

## Hidden authoritative board / local player view
The complete Board/Track graph is authoritative but **not visible to players during live play**.

Player-facing travel shows only the team's current/local journey context and what appears to lie ahead. The game MUST NOT expose enough topology to turn board geometry into an answer key.

At decision points, choices may show perceived indicators such as:
- **estimated/perceived steps remaining**; and
- **perceived remaining route difficulty**.

These are truthful perceptions from currently available information, **not omniscient shortest-path calculations**. They do not reveal hidden loops, later branches, unseen obstacles, future Blessings or other information the travelers could not know.

Therefore Easy may currently appear shorter than Right; Shortest may appear both shorter and easier; rankings may change after later branches; and a route that looks best on both gauges may still not be Right.

Game/activity route difficulty is completely independent from Bible Challenge difficulty. Bible Challenges continue to resolve from Player Profile under the Journey-wide invariant.

## Internal route semantics
RIGHT, SHORTEST and EASIEST are **internal semantic classifications**, never player-facing lane labels.

They are properties that may overlap in local appearance and change in relative perceived attractiveness:
- **RIGHT** = best/wisest authored choice corresponding to the intended leading;
- **SHORTEST** = locally/apparently prioritizes direct distance;
- **EASIEST** = locally/apparently prioritizes lower immediate travel burden.

Paths may weave, cross, bridge/tunnel, branch, reconnect, loop or detour. A visual crossing is not necessarily a connection. There is no fixed top/middle/bottom or other positional convention for Right.

### Right-path hard invariant
From the initial start state, a team that consistently selects the Right choice at every decision, does not voluntarily turn around, and performs Challenges at the configured expected success target MUST have the **fastest designed realized journey to the Red Sea**.

Right may have more nominal spaces and greater perceived difficulty. Its additional Blessings/provision are what make its realized journey superior. Generation/balancing validation must test this invariant; exact route lengths, frequencies and values remain configurable.

## Private turn / Challenge loop
Every normal move begins with a Bible Challenge.

1. Team receives a **TEAM_PRIVATE** Challenge on an authorized private surface.
2. Challenge content/options/team discussion remain private from other teams while active.
3. Team submits/locks its answer.
4. On failure, the team does not move and waits until its next turn for a **new** Challenge, unless it spends an eligible collected assistance resource.
5. On success, **only then** is the movement amount revealed.
6. The team traverses that movement sequentially.
7. All mandatory route features crossed are encountered in traversal order; landing exactly on the feature is not required.
8. After movement resolves, the next turn repeats with a new private Challenge.

The movement amount MUST NOT be exposed before Challenge resolution.

There is **no cross-team Challenge assistance** in this checkpoint. Team members may discuss their own Challenge using the normal private team communication channel, but other teams may not answer, hint, transfer assistance or otherwise help resolve it.

Private Challenge information need not become public after resolution and MUST remain hidden while disclosure could influence another team's live play. Full disclosure is safe in the optional retrospective.

## Traversal interrupts
Blessings, obstacles, decision points and other mandatory route features trigger whenever crossed, not only when landed upon.

Movement resolves sequentially:
**move -> encounter feature -> resolve feature -> continue remaining movement as modified -> repeat**.

A decision point pauses traversal. After the team commits its private choice, remaining movement continues down the selected route.

Blessing bonus movement is movement, not a new turn, and does not require another Challenge unless a specific authored effect explicitly says otherwise.

## Blessings / provision
Blessings represent God's provision and MUST be chronologically appropriate before the Red Sea. Do not use later wilderness provisions such as manna, quail or water from the rock.

Appropriate examples include:
- favorable wind;
- light enabling continued/night travel;
- renewed endurance/speed/strength after eating carried provisions;
- favorable travel conditions or similarly appropriate provision.

Blessings may grant immediate or explicitly authored held assistance. Held assistance may be spent according to its defined effect, including eligible recovery from a failed Challenge. Assistance is finite/consumable where authored.

Blessings:
- are encountered whenever traversed;
- trigger only once for a team's traversal history unless explicitly defined otherwise;
- cannot be farmed by reversing/retracing;
- benefit Israelite teams, not Pharaoh merely because the army crosses the same graph location.

Right contains substantially more Blessings than alternate routes. Alternate main routes may contain some Blessings; receiving a Blessing is therefore not proof that a team is on Right.

## Obstacles
Obstacles are traversed whenever crossed. Each obstacle may define separate effects for:
- forward team traversal;
- reverse team traversal; and
- Egyptian-army traversal.

Reverse behavior may be neutral, still adverse, or beneficial when logically appropriate (for example, a headwind becoming a tailwind). Do not force every obstacle to transform on reversal.

An obstacle may affect remaining movement, impose delay/additional work, move/set back a team or otherwise apply its authored travel consequence. Exact catalog/balance is configurable.

## Private Discernment/Wisdom decision points
A decision point presents **2–3 genuinely defensible choices**. One is the authored best/right/wisest response given the complete context; the others must remain reasonable enough that the choice requires discernment rather than spotting an obviously bad answer.

Avoid a pattern where the most overtly pious wording is automatically correct. Context must make the preferred response defensible and non-arbitrary.

Decision content is TEAM_PRIVATE during live play:
- situation/context;
- 2–3 choices;
- perceived steps/difficulty associated with available paths;
- team discussion.

Team members normally travel together and may discuss through their team communication channel. The current authorized team controller submits the choice; no additional voting subsystem is required.

Other teams may observe the eventual physical consequence/movement but do not automatically receive the private decision content or learn which option was designated Right.

Decision consequences may include:
- optimal continuation on the current/Right route;
- transfer to another main route/network;
- progress/correction toward Right;
- a setback/loop; or
- a **minor detour** that later rejoins the same main route.

### Minor detours
A close-but-not-best defensible choice may produce a minor detour rather than a major wrong turn.

A minor detour:
- leaves the main route at the decision point;
- rejoins that same main route at a later point;
- is typically only a few moves longer/slower than the direct segment;
- **never contains Blessings**;
- may contain no obstacle at all;
- may optionally contain a minor obstacle;
- uses normal Challenge/movement/traversal rules;
- requires no new decision merely to rejoin the main route;
- MUST NOT produce a net travel advantage over the best/direct continuation.

Use **detour** when the path rejoins later without necessarily circling back; reserve loop for topology that genuinely loops/revisits.

## Turn Around / reconsideration
Turn Around is available once a team has at least one prior decision point.

When invoking Turn Around:
1. the team privately selects **which previously encountered decision point in its traveled history** it wants to reconsider;
2. it retraces its actual traveled route toward that selected point;
3. intermediate decision points are **not re-experienced** during retracing;
4. Blessings are not collected again;
5. reverse obstacle/effect behavior applies;
6. Pharaoh and other teams continue normally;
7. when the selected decision point is reached, that decision is experienced again privately and the team may choose differently.

The game does not confirm that the selected prior decision was actually a mistake. A team may turn around while already on Right.

## Pharaoh pursuit — authoritative graph simulation
Pharaoh is not merely a cosmetic countdown. The Egyptian army is an authoritative pursuit simulation over the same route graph.

### Head start and speed
- Israel receives a clear configurable head start before the army closes.
- Egyptian baseline travel is faster than normal team travel.
- Failed Challenges, detours, loops, obstacles and unnecessary reversal therefore create real capture risk.
- Exact head start, army cadence/speed and balancing values are configurable.

### Splitting pursuit fronts
At branches, the Egyptian pursuit propagates down **every available route**, even when no team is currently on that route. The army does not choose one colored team to chase.

Each pursuit front traverses graph edges over time and encounters army-relevant terrain/obstacle effects. Open/easy terrain may favor chariots; restrictive terrain may slow the army. Blessings for Israel do not accelerate Pharaoh.

When pursuit fronts meet/reconverge, runtime state must merge/deduplicate rather than cloning unbounded armies.

### Player-facing pursuit information
Each team's gameplay view continuously exposes meaningful pursuit distance, normally presented as something like **“Egyptian Army: X spaces behind.”**

Internally this is based on the nearest active Egyptian pursuit front capable of reaching/intersecting the team through the graph, not Euclidean/map distance.

When topology changes the relationship, presentation may appropriately indicate that the army is nearby/ahead rather than falsely saying “behind.” Hidden topology must not be leaked prematurely.

### Capture
A team is caught whenever its live route position intersects an Egyptian pursuit front/army-controlled traversal state.

This includes:
- Pharaoh overtaking from behind;
- a team turning back into the pursuing army;
- a branch/loop/detour reconnecting behind an army front; or
- another pursuit front reaching the team through a different branch.

A team cannot safely “jump” behind an army front because hidden topology reconnected there. Capture immediately resolves that team's competitive journey.

## Optional retrospective / full-board reveal
Retrospective is **optional**. Host may skip it and continue directly to the canonical closing/Red Sea transition.

If entered:
- reveal the complete authoritative board for the first time;
- replay **all teams simultaneously** using their recorded histories so relative progress can be compared;
- replay Pharaoh's pursuit propagation/fronts as appropriate;
- show each team's actual trace, detours, loops, reversals, Blessings, obstacles, arrival or capture;
- expose selectable decision markers.

Selecting a team's decision marker reconstructs the **player-visible snapshot from that moment**, including situation/context, available choices, perceived steps/difficulty and other authorized visible state such as pursuit pressure. Persist sufficient deterministic decision-state/history to reconstruct what the team actually knew then; do not recalculate hindsight as if it were the original view.

The retrospective may contrast “what you could see then” with the complete topology now visible. It should allow exploration without automatically stopping/replaying every decision point.

The synchronized replay is preferred over separate team replays because it shows relative progress, apparent leads, setbacks, Blessing acceleration and pursuit pressure in context.

## Canonical handoff to Red Sea
After competitive resolution (and optional retrospective):
1. clearly distinguish the gameplay simulation from the historical Exodus account;
2. remove/reconcile alternate team-route outcomes;
3. return to the one canonical Journey state: Israel followed God's leading and is at the Red Sea;
4. re-establish the pillar of cloud/fire as canonical narrative/presentation rather than a gameplay answer icon;
5. transition into Pharaoh's immediate pursuit/Red Sea checkpoint.

The intended thematic handoff is:
- this checkpoint: **Will you follow God when His way does not look best from what you can see?**
- Red Sea: **Will you trust God when following Him has brought you somewhere that looks impossible?**

## Acceptance
- [ ] complete graph hidden during live play; only local/perceived journey information exposed;
- [ ] RIGHT/SHORTEST/EASIEST remain internal semantics, never player-facing lane labels;
- [ ] perceived distance/difficulty do not leak hidden topology/effects;
- [ ] no pillar/counterfeit-pillar answer icons on route choices;
- [ ] consistent Right choices from start satisfy fastest-realized-journey validation;
- [ ] every move begins with a private profile-appropriate Bible Challenge;
- [ ] movement amount hidden until Challenge success;
- [ ] failure = no movement until next-turn new Challenge unless eligible held assistance is spent;
- [ ] no cross-team Challenge assistance;
- [ ] every crossed Blessing/obstacle/decision feature resolves even when not landed upon;
- [ ] decision interrupts preserve remaining movement after choice;
- [ ] decision points provide 2–3 defensible private choices;
- [ ] minor detours can rejoin later, never contain Blessings and never outperform best continuation;
- [ ] Turn Around targets a selected prior decision; intermediate decisions are not replayed;
- [ ] Blessings cannot be farmed by retracing and use pre-Red-Sea-appropriate provision;
- [ ] army receives head start deficit but has faster baseline movement;
- [ ] army propagates down all branches, including empty routes;
- [ ] army traverses obstacles/terrain with army-specific effects;
- [ ] nearest pursuit/front distance is continuously communicated without leaking hidden topology;
- [ ] intersection with any pursuit front captures the team, including reconnecting behind the army;
- [ ] all teams resolve by Red Sea arrival or capture; first arrival does not end others' play;
- [ ] capture explicitly does not rewrite Exodus;
- [ ] optional retrospective reveals full board, simultaneous team replay and selectable historical decision snapshots;
- [ ] canonical Journey reconverges at Red Sea for all players before the next checkpoint.
