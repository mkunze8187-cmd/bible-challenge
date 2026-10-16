# Agon-wide relative effort and duration estimation
Status: **approved conceptual behavior 2026-10-16**. Initial weights, calibration parameters and APIs are not fixed. Applies across interactions, games, scenarios, checkpoints, tournaments, Events and Journeys.

## Principle
**Author relative effort first; estimate clock time through calibration.** Content authors specify relative effort for interaction nodes and authored structures, not fabricated fixed minutes. For sequential work add effort; for parallel work estimate elapsed critical path; for branching/loops report min/typical/max feasible effort with declared bounds and transparent assumptions. Use effort of the **actual path played** for calibration, including relevant Scripture review. Typical path is an authored/calibrated estimate, not an unverified statistical fact.

## Deterministic calibration
At start of **each new session**, use a configured baseline rate (illustrative 1 unit = 20 seconds, **not** a locked universal constant) and configurable baseline equivalent-unit weight. After completed activities aggregate eligible measured seconds and actual-path units:
```
secondsPerUnit = (baselineSecondsPerUnit * baselineWeightUnits + sum(observedEligibleSeconds))
                 / (baselineWeightUnits + sum(observedPathEffortUnits))
```
This weights longer observations appropriately; do not average encounter rates equally. Include dialogue, thinking, interaction and review time. Exclude Host pauses and disconnected/waiting interruptions. Exclusions must be deterministic and explicitly measured. Update subsequent estimates, never gameplay scoring or existing approved timers. Session-specific pace resets at new session; historical trial runs may inform a separately approved, versioned baseline update, not silently persist personal performance profiles. No ML/AI or inferred player ability.

## Scheduling
A checkpoint may have no target, an **active-duration target** (e.g. 30 minutes from gameplay start, pauses suspend countdown), or a **Host-local clock-time target** (e.g. 7:15 PM, fixed through pauses unless Host changes it). Persist target kind, time zone/instant for clock target, pause state, baseline/version, observed aggregates and session start/resume state for deterministic behavior. Specify handling of date rollover and daylight-saving ambiguity in implementation contract.

**Time estimation does not drive ordinary scenario/activity selection.** Only near a configured endpoint may a dynamic director consider predicted effort/duration to favor a suitable shorter eligible encounter, without violating eligibility or narrative requirements. Define 'near' relative to calibrated predicted durations rather than arbitrary fixed minutes. At target, do not start another encounter; finish any active encounter including its review, even if late. Do not truncate content to meet advisory target. No target => no duration-driven selection. Fixed gameplay timers remain distinct from scheduling estimates.

## Authoring and verification
Effort weights and calibration defaults are versioned, tuneable and evaluated with actual trial runs. Test varying branches, parallel critical paths, loops, disconnections, pauses, clock deadlines, resume, differing session lengths, and multi-platform deterministic replay. Present Host estimates as estimates/ranges, not guaranteed completion times.
