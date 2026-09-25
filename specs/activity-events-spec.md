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
    | { kind: "count"; pieceId: string; target: number };                       // count aloud together
  revealLayerId?: string;             // visual progress after the step
}
```

Rules:
- **No failure states.** Pieces dropped near the right place snap in; a wrong piece gently returns to the counter with a hint. Nothing burns, falls, or breaks by mistake.
- **Accessible input:** every gesture (stir, knead, flatten) has a tap-to-complete alternative; drag has tap-to-place (select piece, then tap target).
- **Counting is a feature:** `count` and `add` with `count > 1` show large numerals and count aloud.
- **Accuracy:** story numbers and ingredients in the text (3 cakes, 12 stones, Ezekiel 4:9's list) are exact. Modern foods are never presented as biblical: Passover flatbread is "Bible-time flatbread," not pizza.
- **Gentleness:** no flood imagery (Noah), no fear-based imagery (Babel spreads out gently), per Kids Mode (#234).
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

Seasonal placement: The Stable and Manger (Christmas, featured in Advent), Passover Flatbread (Easter / Resurrection Day), Manna Morning Bake and Bread for Three Visitors (Thanksgiving), via the themed content registry (#25–#28).

Content for every Activity Event goes through biblical QA like other content (#127 pattern).

## 7. Take Home

The `take-home` segment always produces a Dig Deeper card (#235) with the passage, 2–3 family questions, and the memory verse, plus a Story Passport stamp. Bible Baking cards may include an optional simple, safe family recipe (e.g., honey flatbread) so families reread and retell the story while baking at home; recipes are reviewed for safety (adult-supervised steps marked, common allergens listed).

## 8. Relationship to competitive Events

- Activity Events never enter tournaments, Event Championships, or the score ledger (#191–#194). `GameCompetitionCapabilities` gains `cooperativeModeSupported`; Activity Event validation rejects `play` segments whose game lacks it.
- Activity Events use the same persistence foundation (#190) for pause/resume, without a score ledger. Resuming returns to the current segment and Make step.
- A host can run an Activity Event and a competitive Event in the same gathering; they are separate saved events.

## 9. Admin

- Activity Event editor: series, name, age group, passage, memory verse, segments (add/reorder; required segments locked), play-segment game picker filtered to cooperative-capable kids games, seasonal category.
- Make activity editor: choose a counter or building-site board (Image Board editor #285), pieces, steps with narration text, reference, action, and reveal layer; preview the whole Make segment.
- Series editor: name, make style, series emblem.
- Validation: required segments present; memory verse and passage present; every step references valid pieces/regions; counts match the text where the step carries a reference; play segment games are cooperative-capable and have matching content.

## 10. Testing

- Unit: segment runner (advance, back, skip optional), Make engine actions (add/count/stir/bake/stack/remove), snap and gentle-return behavior, resume at segment/step.
- Data: every predefined Activity Event validates; biblical QA sign-off recorded.
- E2E: run Manna Morning Bake end to end on projector with Host Remote; run Build the Ark with a shared team tablet; pause and resume mid-Make.
- Accessibility: tap alternatives for every gesture; narration captions; Reduced motion.
- Visual regression: segment screens and progress strip at projector and tablet sizes.

## 11. Implementation phases (issues)

1. Activity Event model, registry, lifecycle, persistence, and cooperative capability.
2. Segment runner and presentation: Kids Activities home area, progress strip, story/remember/take-home segments, cooperative play segments, host controls.
3. Make engine (bake and build) on Image Board.
4. Admin editors and validation.
5. Starter catalog content: Bible Baking and Bible Builders series (content issues #325, #326), biblical QA, seasonal placement.

## 12. Open decisions

- Whether ages 6–10 get their own Activity Event series later (e.g., Tabernacle building from Exodus 25–27 as an Activity Event rather than the competitive Tabernacle Blueprint #249).
- Whether Activity Events should support a printable "leader guide" (script, supply list for real-world follow-up) in addition to the Dig Deeper card.
