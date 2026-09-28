# Communication Constraint Capability

**Status:** Proposed
**Capability:** `communication.constraint` v1

## Purpose
Provide reusable rules for asymmetric/private information and restricted communication without embedding any Tower of Babel content.

## Concepts
A round assigns participants information views and permitted actions. Constraints may govern whether a participant can see particular information, speak/use voice in an in-person ruleset, point/highlight, select/manipulate, describe, send predefined symbols, or view another participant's vocabulary/key.

Software-enforceable constraints should be enforced by projections/InputActions. Social/in-person constraints such as 'do not speak' are clearly presented rules rather than pretending software can guarantee them.

## Model
- `CommunicationConstraintDefinition`
- participant roles
- private information sets
- symbol/vocabulary maps
- allowed semantic InputActions
- phase transitions
- equivalence/mapping rules
- success/accuracy evaluator

## Accessibility
Every constraint template must declare accessibility alternatives. A speech restriction cannot make a mode unusable for a nonspeaking player; a sound-only clue cannot be the sole path for a deaf player; visual-only symbol distinctions require accessible equivalents. Accessibility substitutions are not penalties or consumable aids.

## Networking/privacy
Shared/Hosted projections expose only role-authorized information. Server/session authority owns private mapping and phase transitions. Reconnect restores the same private role information without leaking another participant's view.

## Reuse candidates
Tower of Babel is the first consumer. Future Witnesses, Messenger, team-description, hidden-information and communication games may reuse the capability.

## Conformance
Test private projection isolation, role/action authorization, deterministic mappings where seeded, reconnect, simultaneous input, accessibility substitution, invalid phase actions, and Local/Shared adapter parity.