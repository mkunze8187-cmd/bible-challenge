# Agon Activity Events Spec (Kids)

## 1. Purpose

Agon Events today are **competitive**: an ordered list of games (`SavedEventDefinition.gameIds`, predefined events #27) with a shared score ledger, tournaments, and championships (#189–#198).

Young children (ages 3–5, and younger 6–10 groups) need a different kind of gathering: a short, guided, **non-competitive** experience built around one Bible story, where everyone makes something together. This spec adds a second Event kind, the **Activity Event**, made of ordered **segments**:

1. **Story:** hear the passage.
2. **Make:** bake or build something from the story together, on screen.
3. **Play (optional):** one or two related kids games, played cooperatively.
4. **Remember:** say the memory verse together.
5. **Take Home:** Dig Deeper card and Story Passport stamp.

The first two series are **Bible Baking** (recipes from Bible stories) and **Bible Builders** (building projects from Bible stories). They were first proposed as standalone games (#325, #326) and become Activity Event series here.

The design follows Agon's goals: every Activity Event is anchored in one passage, the Make segment follows the text, and the Take Home segment sends families back into the Bible.

## 2. Concepts

- **Event kind:** `competition` (existing Events, unchanged) or `activity` (new).
- **Activity Event:** one story, one memory verse, an ordered list of segments, an age group, and an estimated length (target 15–25 minutes).
- **Series:** a named family of Activity Events sharing a Make style (e.g., Bible Baking, Bible Builders). Series are content, not code.
- **Segment:** a step in the Activity Event. Types: `story`, `make`, `play`, `remember`, `take-home`.
- **Make activity:** authored content describing pieces, ordered steps, and a finishing scene, run by the shared Make engine (§5).

## 3. Data model

```ts
export type EventKind = "competition" | "activity";

export interface ActivityEventDefinition {
  id: string;                         // "bible-baking-manna-wafers"
  kind: "activity";
  seriesId: string;                   // "bible-baking" | "bible-builders" | ...
  name: string;                       // "Manna Morning Bake"
  description: string;
  ageGroup: "ages-3-5" | "ages-6-10";
  passage: string;                    // "Exodus 16:14–31"
  memoryVerse: { reference: string; text: string };   // licensed/configured translation
  estimatedMinutes: number;
  segments: ActivitySegment[];
  categoryId?: ThemedCategoryId;      // seasonal placement (#25–#28)
  featured?: boolean;                 // eligible for featured seasonal card (#28)
}

export type ActivitySegment =
  | { type: "story"; narrationId: string; sceneBoardId?: string }
  | { type: "make"; makeActivityId: string }
  | { type: "play"; gameId: GameId; contentFilter: { sessionTags?: string[]; roundIds?: string[] }; optional: true }
  | { type: "remember"; mode: "echo" | "picture-verse" }   // picture-verse reuses #241
  | { type: "take-home" };                                   // Dig Deeper + Story Passport (#235)

export interface ActivitySeries {
  seriesId: string;
  name: string;                       // "Bible Baking"
  makeStyle: "bake" | "build";
  emblemId?: AgonEmblemId;            // series icon in the catalog (#298)
  description: string;
}
```

`SavedEventDefinition` gains `kind?: EventKind` (missing = `competition`). Hosts can copy a predefined Activity Event to My Events and reorder, skip, or remove `play` segments; `story`, `make`, `remember`, and `take-home` are required.

## 4. Flow and host control

- The host starts an Activity Event from a **Kids Activities** area on the Challenge home (and from Event setup, filtered by kind). Predefined Activity Events appear there grouped by series.
- The projector shows the current segment full screen with narration. The host advances with Next / Back on the laptop or Host Remote (#94–#96), can replay narration, and can skip optional `play` segments.
- A progress strip shows the five segments with simple icons (book, bowl or blocks, game, speech bubble, house) so pre-readers see where they are.
- There is **no scoreboard and no ranking**. Participation uses teams or a single "class" group; when there are teams, Team Play Styles Tag Team (#292) decides whose turn it is to do the next Make step, and team shields (#298–#301) show whose turn it is.
- The finish is a shared celebration ("We made manna wafers!") plus a Story Passport stamp for the group.
- Play segments run the referenced kids game in **cooperative mode**: points are hidden, and a "we all win" celebration replaces the results podium. Games declare `cooperativeModeSupported` in their capabilities (#189); only those may be used in `play` segments.

## 5. Make engine (bake and build)

The Make engine is a thin layer on the Image Board engine (#280–#286). A Make activity is authored content:

```ts
export interface MakeActivity {
  id: string;
  style: "bake" | "build";
  boardId: string;                    // kitchen counter or building site (Image Board)
  pieces: Array<{ pieceId: string; label: string; count?: number }>; // ingredients or blocks
  steps: MakeStep[];
  finishScene: { layerId: string; narrationId: string; servesCharacter?: string };
}

export interface MakeStep {
  narrationId: string;                // the instruction, read aloud ("Add two cups of flour")
  reference?: string;                 // the verse this step comes from, when the step is textual
  action:
    | { kind: "add"; pieceId: string; count: number; targetRegionId: string }   // drop into bowl / place a block
    | { kind: "stir" | "knead" | "flatten"; targetRegionId: string; repetitions: number }
    | { kind: "bake"; seconds: number }                                         // short, cheerful oven animation
    | { kind: "stack" | "snap"; pieceId: string; targetRegionId: string }
    | { kind: "remove"; regionId: string }                                      // take roof pieces off (Mark 2)
    | { kind: "count"; pieceId: string; target: number }                        // count aloud together
    | { kind: "lookup"; reference: string; question: string; answer: string | number; answerAliases?: string[] } // ages 6–10: find it in the Bible first
    | { kind: "measure"; pieceId: string; cubits: { length: number; width?: number; height?: number }; showMetric: boolean }; // ages 6–10: build to the text's dimensions
  revealLayerId?: string;             // visual progress after the step
}
```

Rules:
- **No failure states.** Pieces dropped near the right place snap in; a wrong piece gently returns to the counter with a hint. Nothing burns, falls, or breaks by mistake.
- **Accessible input:** every gesture (stir, knead, flatten) has a tap-to-complete alternative; drag has tap-to-place (select piece, then tap target).
- **Counting is a feature:** `count` and `add` with `count > 1` show large numerals and count aloud.
- **Accuracy:** story numbers and ingredients in the text (3 cakes, 12 stones, Ezekiel 4:9's list) are exact. Modern foods are never presented as biblical: Passover flatbread is "Bible-time flatbread," not pizza.
- **Gentleness:** no flood imagery (Noah), no fear-based imagery (Babel spreads out gently), per Kids Mode (#234).
- **Ages 6–10 steps** show short readable instructions with narration, and may add `lookup` (the group opens a real Bible to the reference and finds the number or word before the step unlocks, reusing the Open Your Bible! pattern #246) and `measure` (build to the dimensions in the text, in cubits, with an optional feet/meters conversion note). A host can reveal a lookup answer if a group is stuck; nothing is failed.
- Built on Image Board pieces, drop zones, layers, and the controller `board-select` interaction (#283), so the Make step can run on the projector (host or child taps) or on a shared team tablet.

## 6. Starter catalog

### Bible Baking (ages 3–5)
| Activity Event | Passage | Make | Suggested play segment | Memory verse |
|---|---|---|---|---|
| Manna Morning Bake | Exodus 16:14–31 | gather manna, then make honey wafers (16:31) | What Happened Next? (#242), Exodus 16 | Matthew 6:11 |
| The Widow's Little Cake | 1 Kings 17:8–16 | flour and oil that keep pouring | Picture Verse (#241) | Philippians 4:19 |
| Bread for Three Visitors | Genesis 18:1–8 | 3 cakes for 3 guests | What Happened Next? (#242) | Hebrews 13:2 |
| Passover Flatbread | Exodus 12:34–39 | no yeast; flatten fast, it's time to go | Picture Verse (#241) | Psalm 34:8 |
| Ezekiel's Bread | Ezekiel 4:9 | match and count six grains and beans | Picture Verse (#241) | John 6:35 |
| Breakfast on the Beach | John 21:9–13 | bread and fish on the coals; count the fish | Lost & Found (#239) | John 21:12 ("Come and have breakfast") |

Five loaves and two fish is intentionally excluded; it is covered by Share the Lunch (#240) and Fill the Basket (#263).

### Bible Builders (ages 3–5)
| Activity Event | Passage | Make | Suggested play segment | Memory verse |
|---|---|---|---|---|
| Build the Ark | Genesis 6:14–16 | three decks, a door in the side, a window; rainbow finish | Two by Two (#243) | Genesis 9:13 |
| Twelve Stones | Joshua 4:1–7 | stack 12 stones, one per tribe; "What do these stones mean?" (4:6) | What Happened Next? (#242) | Joshua 4:6 |
| Build on the Rock | Matthew 7:24–27 | rock house and sand house (from #259) | Here I Am, Samuel! (#238), listening | Matthew 7:24 |
| The Stable and Manger | Luke 2:1–7 | a manger because there was no room | What Happened Next? (#242), Christmas | Luke 2:11 |
| Nehemiah's Wall | Nehemiah 2:17–18; 4:6 | each team adds its section | March Around Jericho (#237) as a wall contrast | Nehemiah 4:6 |
| The Hole in the Roof | Mark 2:1–5 | build the house, then open the roof for a friend | Lost & Found (#239) | Galatians 6:2 |
| The Tower of Babel | Genesis 11:1–9 | build tall, then the blocks spread out gently | Picture Verse (#241) | Psalm 127:1 |

### Bible Builders (ages 6–10)
| Activity Event | Passage | Make | Suggested play segment | Memory verse |
|---|---|---|---|---|
| The Ark of the Covenant | Exodus 25:10–22 | look up and build to 2½ × 1½ × 1½ cubits; mercy seat and cherubim | Fix the Story (#247) | Exodus 25:22 |
| The Tabernacle | Exodus 26–27 | cooperative build of the courtyard, tent, and furnishings in order (a cooperative companion to the competitive Tabernacle Blueprint #249) | Open Your Bible! (#246) | Exodus 25:8 |
| Noah's Ark to Scale | Genesis 6:14–16 | 300 × 50 × 30 cubits; three decks, door, window; compare to a school bus | Who's in the Story? (#254) | Genesis 6:22 |
| Solomon's Temple | 1 Kings 6:1–14 | 60 × 20 × 30 cubits; stones cut at the quarry, no hammer heard (6:7) | Fix the Story (#247) | 1 Kings 6:12 |
| Nehemiah's Gates | Nehemiah 3 | each team rebuilds named gates and sections (Sheep Gate, Fish Gate, Water Gate…) | Open Your Bible! (#246) | Nehemiah 2:20 |

### Bible Baking (ages 6–10)
| Activity Event | Passage | Make | Suggested play segment | Memory verse |
|---|---|---|---|---|
| The Passover Meal | Exodus 12:1–14 | set the Exodus 12:8 meal (lamb, unleavened bread, bitter herbs) and explain each part; labeled as the Exodus meal, not a later Seder tradition | Fix the Story (#247) | Exodus 12:13 |
| Bread of the Presence | Leviticus 24:5–9 | bake 12 loaves, set in two rows of six on the table | Open Your Bible! (#246) | John 6:35 |
| Two Loaves at the Feast of Weeks | Leviticus 23:15–17; Acts 2:1 | count 50 days, bake two loaves; connect to Pentecost | Open Your Bible! (#246) | Acts 2:4 |
| Ruth's Barley Bread | Ruth 2 | glean barley behind the harvesters, then bake; about an ephah (2:17) | Who's in the Story? (#254) | Ruth 1:16 |
| Elijah's Cake on the Coals | 1 Kings 19:3–8 | a cake baked on hot stones and a jar of water, twice | Fix the Story (#247) | Isaiah 40:31 |

Ages 6–10 Activity Events use the Kids Mode ages 6–10 profile (#234): readable text plus narration, gentle optional timers only in play segments, and team play on Player Controllers.

Seasonal placement: The Stable and Manger (Christmas, featured in Advent), Passover Flatbread and The Passover Meal (Easter / Resurrection Day), Two Loaves at the Feast of Weeks (Pentecost), Manna Morning Bake, Bread for Three Visitors, and Ruth's Barley Bread (Thanksgiving); feast-related events also appear in the Biblical Feasts pack (#45), via the themed content registry (#25–#28).

Content for every Activity Event goes through biblical QA like other content (#127 pattern).

## 7. Take Home

The `take-home` segment always produces a Dig Deeper card (#235) with the passage, 2–3 family questions, and the memory verse, plus a Story Passport stamp. Bible Baking cards may include an optional simple, safe family recipe (e.g., honey flatbread) so families reread and retell the story while baking at home; recipes are reviewed for safety (adult-supervised steps marked, common allergens listed).

## 7A. Leader Guide

Every Activity Event can produce a printable **Leader Guide** for the teacher, parent, or volunteer running it. It is generated from the Activity Event's content plus authored leader notes, and printed or saved as PDF from the desktop app (Electron print-to-PDF), fully offline.

Contents:
1. **At a glance:** title, series, age group, passage, memory verse, total time, and a segment-by-segment timeline with minutes.
2. **Before you start:** setup checklist (projector, laptop, Host Remote pairing, shared tablets or phones, teams and shields, sound check), and how to open the Activity Event from Kids Activities.
3. **The story in brief:** a short plain-language summary for the leader, with key details to get right and common misconceptions to avoid.
4. **Script:** for each segment, the narration text the app will read, what to say before and after it, and when to press Next. Make steps list each instruction and its verse reference.
5. **Questions:** 3–5 discussion questions per age group (ages 3–5 simpler, ages 6–10 deeper), each with the verse that answers it.
6. **Supply list (optional hands-on extension):** materials for a real-world follow-up (e.g., honey flatbread, a block or cardboard build), marking adult-only steps, listing common allergens, and giving substitutions. The app never requires real supplies.
7. **Adapting it:** small group vs. large group, one tablet vs. several, children who can't read yet, children who need movement breaks, and a 10-minute short version.
8. **Take home:** the Dig Deeper card content, printable as a family handout (several per page), and the Story Passport stamp.

Rules:
- Verse text follows the app's configured and licensed translation; licensed-pack guides follow the pack's licensing rules (`content-licensing-spec.md`).
- Leader notes, questions, and supply lists go through the same biblical and safety QA as other content.
- The guide never includes participant names or other personal data.
- Hosts open the guide from the Activity Event's detail card ("Leader Guide") before starting, and from the paused screen.

## 8. Relationship to competitive Events

- Activity Events never enter tournaments, Event Championships, or the score ledger (#191–#194). `GameCompetitionCapabilities` gains `cooperativeModeSupported`; Activity Event validation rejects `play` segments whose game lacks it.
- Activity Events use the same persistence foundation (#190) for pause/resume, without a score ledger. Resuming returns to the current segment and Make step.
- A host can run an Activity Event and a competitive Event in the same gathering; they are separate saved events.

## 9. Admin

- Activity Event editor: series, name, age group, passage, memory verse, segments (add/reorder; required segments locked), play-segment game picker filtered to cooperative-capable kids games, seasonal category.
- Make activity editor: choose a counter or building-site board (Image Board editor #285), pieces, steps with narration text, reference, action, and reveal layer; preview the whole Make segment.
- Series editor: name, make style, series emblem.
- Leader Guide fields: leader summary, key details and misconceptions, per-segment leader script (before/after text), discussion questions per age group with answering verses, optional supply list with adult-only steps, allergens, and substitutions, adaptation notes, and short-version plan; full print preview.
- Validation: Leader Guide has a summary, at least 3 questions for the event's age group, and allergen info on any baking supply list; required segments present; memory verse and passage present; every step references valid pieces/regions; counts match the text where the step carries a reference; play segment games are cooperative-capable and have matching content.

## 10. Testing

- Unit: segment runner (advance, back, skip optional), Make engine actions (add/count/stir/bake/stack/remove), snap and gentle-return behavior, resume at segment/step.
- Data: every predefined Activity Event validates; biblical QA sign-off recorded.
- Leader Guide: generated guide for every predefined Activity Event contains all required sections and prints to PDF offline; allergen and adult-only markings present on baking supply lists.
- E2E: run Manna Morning Bake end to end on projector with Host Remote; run Build the Ark with a shared team tablet; pause and resume mid-Make.
- Accessibility: tap alternatives for every gesture; narration captions; Reduced motion.
- Visual regression: segment screens and progress strip at projector and tablet sizes.

## 11. Implementation phases (issues)

1. Activity Event model, registry, lifecycle, persistence, and cooperative capability.
2. Segment runner and presentation: Kids Activities home area, progress strip, story/remember/take-home segments, cooperative play segments, host controls.
3. Make engine (bake and build) on Image Board.
4. Admin editors and validation.
5. Leader Guide generation, print/PDF, and host access.
6. Starter catalog content: Bible Baking and Bible Builders for ages 3–5 (#325, #326) and ages 6–10 (separate content issues), with Leader Guide content, biblical QA, and seasonal placement.

## 12. Decisions

- **Ages 6–10 get their own Activity Event series** (§6): Bible Builders and Bible Baking for ages 6–10, with `lookup` and `measure` Make steps.
- **Activity Events include a printable Leader Guide** (§7A).
