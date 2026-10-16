# Reusable Branching Narrative Engine — approved design
Status: approved functional direction; schema/API details require implementation-design review. Shared capability for Agon games, not Be Ye Holy-specific. No runtime AI.

## Model
Versioned Agon-owned, authored deterministic directed graph with stable node and edge IDs. Supported node families: Scene, Dialogue, Decision, Interaction, Condition, Consequence, Role Assignment, Conclusion. Graphs branch, converge and support **bounded loops** with scenario-specific limits plus an Agon-wide safety ceiling. Nodes may contain non-dialogue inspections, classification, sequencing, procedures, etc. Graph state may be ephemeral or persistent **only as explicitly declared by the consuming game**; Be Ye Holy scenarios do not carry outcomes across encounters. Replay uses pinned content/pack/schema versions, input/event order and seeded draws.

## Agency, continuity, roles
No player gameplay answer preselected. Player characters cannot be authored as taking a position before an explicit player choice. Authored NPC takeover, role substitution and conditional transitions preserve prior commitments. Downstream dialogue must be consistent with choices already made; NPC dialogue may be mistaken but not silently rewrite prior decisions. Role requirements flexible and consumer-configured. Distinguish player agency from NPC authority (e.g. priestly rulings). Narrative presentation independent of graph execution; Stage/controller/Host receive authorized projections only.

## Authoring
**Both visual graph editor and structured-data editor from the beginning**, synchronized to one canonical Agon-owned schema. Versioning, validation, preview and non-destructive migration via existing Data Authoring Tool infrastructure. Authoring tool checks dangling links, unreachable nodes, invalid role substitutions, nonterminating branches/loops, required conclusions, missing review coverage, incompatible content filters and schema compatibility. Interactive playthrough **and automated reachable-path exploration** within declared bounds; report logical state/path coverage and combinatorial blowup instead of claiming impossible exhaustive testing. Exercise NPC takeover, branching, loops, role substitutions, content filtering, replay and save/resume. Human editorial review checks natural dialogue, agency, theological accuracy and continuity; automation cannot certify prose quality.

## Reuse boundary
Generic graph execution/validation belongs here; Scripture-specific narrative, reviews, role catalog, eligibility, scene assets and checkpoint selection belong to consuming games or their authored packs. Existing Journey composition #458/#460 orchestrates graph consumers rather than implementing a second graph engine. Do not silently replace already approved mechanics in other games.

## Version and IP notes
Schemas owned by Agon; Game Data Packs declare compatible schema versions and cannot add executable engines. Optional fields nonbreaking under existing contracts; incompatible changes use new contract versions and authoring migration. Potentially relevant technical combination: deterministic multi-role branching decisions with authored takeover, context-aware review and multi-format projection; not an assertion of novelty or clearance.
