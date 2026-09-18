# Christmas Content Pack Spec

Shared behavior (category visibility, season calendar, pack format, predefined events, featured seasonal event, Daily Challenge integration, authoring standards, admin, testing) is defined in `themed-content-spec.md`. This spec covers only Christmas content.

## Purpose

The Christmas pack adds seasonal rounds focused on the birth of Jesus, messianic prophecy, the incarnation, nativity events, witnesses, places, names and titles of Christ, and worship.

It supports both light family play and deeper church or classroom teaching, and leans into the app's prophecy, fulfillment, quote, chronology, genealogy, and verse games.

## Category

| Field | Value |
|---|---|
| ID | `christmas` |
| Label | Christmas |
| Search aliases | Advent, Nativity, Epiphany, Christmas Eve |
| Kind | `christian-calendar` |
| Accent color | `#8c2f39` |
| Season | `christmas-relative`: Advent 1 through January 6 (Epiphany) |
| Feature priority | 100 |
| Session tags | `advent`, `nativity`, `epiphany` |

Advent and Epiphany are part of this pack, handled with session tags, not separate categories.

## Target Users

- Families during Advent and Christmas gatherings
- Churches, youth groups, and Sunday school classes
- Teachers building a Christmas lesson opener
- Event hosts running a Christmas Bible trivia night

## Content Themes

Primary themes:

- The promised Messiah
- The incarnation (John 1)
- The birth of Jesus
- Mary, Joseph, Elizabeth, Zechariah, the shepherds, the magi, Herod, Simeon, and Anna
- Bethlehem, Nazareth, Jerusalem, Egypt, and related journeys
- Angelic announcements
- Names and titles of Christ
- The genealogies of Jesus
- Worship and witness

Avoid:

- Generic Christmas culture trivia (Santa, trees, gifts, carols as trivia)
- Over-centering later traditions where the text is silent
- Treating uncertain timeline details as certain (for example, exactly when the magi arrived)

## Tradition Versus Text

Good material for `two-truths-and-a-lie`, each with a study note citing the verse:

- The number of magi is not given; three **gifts** are named (Matthew 2:11).
- The magi are called "wise men from the east," not kings (Matthew 2:1).
- The magi found the young child in a **house** (Matthew 2:11), not at the manger.
- A **manger** is mentioned (Luke 2:7); a stable is not.
- There was "no room for them in the inn" (Luke 2:7); an innkeeper is not mentioned.
- No animals are mentioned at the birth.
- The angelic host is described "praising God, and saying" (Luke 2:13); singing is not stated.
- Mary riding a donkey is not mentioned.
- The shepherds and magi are never described together.
- The date of the birth is not given.

## Game Mix

### Anchor Games

- `messiah-prophecy`
- `fulfillment-finder`
- `prophecy-match`
- `who-said-it`
- `before-or-after`
- `bible-timeline`
- `genealogy`

### Daily-Ready Games

- `complete-the-verse`
- `missing-word`
- `two-truths-and-a-lie`
- `bible-anagrams`
- `odd-one-out`
- `verse-scramble`

### Event Games

- `five-guesses`
- `initials`
- `bible-connections`
- `prophecy-clue-ladder`

### Optional Games

- `bible-cryptogram`, `scripture-puzzles`: Luke 2 and Isaiah 9 verses
- `reference-rush`: limited distinct chapters (Matthew 1-2, Luke 1-2, John 1, key prophecies); include only at the minimum below

### Excluded Games

- `bible-books-relay`, `word-ladder`: no Christmas angle
- `chapter-finder`, `name-that-book`: too few distinct source chapters

## Round Targets

| Game | Minimum Rounds | Notes |
|---|---:|---|
| `messiah-prophecy` | 20 | Prophecy prompt to fulfillment or theme |
| `fulfillment-finder` | 20 | NT event to OT prophecy or reference |
| `prophecy-match` | 10 pairs | OT prophecy to NT fulfillment |
| `prophecy-clue-ladder` | 10 | Clues building to a messianic title or prophecy |
| `who-said-it` | 16 | Nativity and infancy account quotes |
| `before-or-after` | 20 | Advent and nativity chronology |
| `bible-timeline` | 8 | Larger event-order rounds |
| `genealogy` | 6 | Lines from Matthew 1; Luke 3 highlights |
| `complete-the-verse` | 16 | KJV Christmas and Advent passages |
| `missing-word` | 16 | KJV verse prompts |
| `verse-scramble` | 12 | Short key verses |
| `two-truths-and-a-lie` | 20 | People, places, events, tradition versus text |
| `bible-anagrams` | 24 | People, places, objects, titles |
| `odd-one-out` | 16 | People, places, titles |
| `five-guesses` | 25 | Enough for a complete board |
| `initials` | 25 | Enough for a complete board |
| `bible-connections` | 4 boards | Themed group boards |

## Content Ideas

### Prophecy and Fulfillment

Candidate passages:

- Genesis 3; Genesis 49
- Numbers 24
- Isaiah 7, 9, 11
- Jeremiah 23
- Hosea 11
- Micah 5
- Malachi 3
- Matthew 1-2; Luke 1-2; John 1

### Who Said It?

Candidate speakers: Gabriel, Mary, Elizabeth, Zechariah, the shepherds, the angelic host, the magi, Herod, the chief priests and scribes (Matthew 2:5-6), Simeon, Anna.

### Before or After

Candidate event pairs:

- Gabriel appears to Zechariah vs Gabriel appears to Mary
- Mary visits Elizabeth vs John the Baptist is born
- Joseph receives the dream vs Jesus is born in Bethlehem
- Shepherds hear the angelic announcement vs Jesus is presented at the temple
- Magi visit Jesus vs flight to Egypt
- Herod dies vs Joseph returns to Nazareth

### Bible Timeline

Sequence: Gabriel to Zechariah → annunciation to Mary → Mary visits Elizabeth → birth of John → Joseph's dream → census → birth in Bethlehem → shepherds → presentation at the temple (Simeon and Anna) → magi → flight to Egypt → return to Nazareth.

### Genealogy

- Abraham to David (Matthew 1)
- David to the exile (Matthew 1)
- The exile to Joseph (Matthew 1)
- Davidic kings in Matthew's genealogy
- Luke 3 highlights, authored carefully

Prompts must name which Gospel's genealogy they use (`themed-content-spec.md` 10.3), since Matthew and Luke differ.

### Bible Connections

Example groups:

- Announced births: Isaac, Samson, John, Jesus
- Nativity places: Nazareth, Bethlehem, Jerusalem, Egypt
- Witnesses: shepherds, Simeon, Anna, magi
- Titles: Emmanuel, Son of David, King, Savior
- Magi gifts and related words: gold, frankincense, myrrh, star

### Bible Anagrams

Examples: MANGER, SHEPHERDS, EMMANUEL, BETHLEHEM, GABRIEL, NAZARETH, MYRRH, SIMEON.

### Verse Scramble and Complete the Verse

Candidate verses: Luke 2:10-11, Luke 2:14, Isaiah 9:6, Isaiah 7:14, Micah 5:2, John 1:14, Matthew 1:21, Galatians 4:4.

## Sub-Seasons

| Tag | Window | Use |
|---|---|---|
| `advent` | Advent 1 to December 24 | Prophecy and anticipation sessions |
| `nativity` | December 24 to January 5 | Birth narrative sessions |
| `epiphany` | January 6 (and the week before) | Magi sessions |

Optional: Advent sessions tagged by week (`sequenceDay` 1-4) so each Sunday of Advent has a matching session.

## Predefined Events

| ID | Name | Audience | Games | Featured | Notes |
|---|---|---|---|---|---|
| `christmas-family-mix` | Family Christmas Mix | family | who-said-it, before-or-after, bible-anagrams, two-truths-and-a-lie | Yes | Default featured event |
| `christmas-kids-nativity` | Nativity for Kids | kids | bible-anagrams, before-or-after, odd-one-out, missing-word | No | `difficulty: easy` |
| `christmas-advent-prophecy` | Advent Prophecy Night | teaching | messiah-prophecy, fulfillment-finder, prophecy-match, prophecy-clue-ladder | Yes | `sessionTags: ["advent"]`; featured during Advent |
| `christmas-nativity-story` | Nativity Story Challenge | event-night | bible-timeline, who-said-it, five-guesses, bible-connections, genealogy | No | |
| `christmas-epiphany-magi` | The Magi | teaching | who-said-it, two-truths-and-a-lie, five-guesses, fulfillment-finder | Yes | `sessionTags: ["epiphany"]`; featured around January 6 |

## Daily Pool

- `who-said-it`
- `before-or-after`
- `complete-the-verse`
- `missing-word`
- `two-truths-and-a-lie`
- `bible-anagrams`
- `messiah-prophecy`
- `fulfillment-finder`

Keep prophecy-heavy daily mixes optional for younger groups. During Advent, prefer `advent`-tagged sessions.

## Future Map Support

Once Bible Map Challenge exists, add a map mini-pack: Nazareth, Bethlehem, Jerusalem, Judea, Egypt, and the magi's route if the map scale supports it.

## Acceptance Criteria

- Meets `themed-content-spec.md`.
- Round targets met for every included game.
- Every tradition-versus-text round has a study note with a verse reference.
- Genealogy rounds name the Gospel they use.
- The `christmas-advent-prophecy` event is featured during Advent, and `christmas-epiphany-magi` around January 6.
- The `christmas-kids-nativity` event plays entirely on easy content.

## Open Decisions

1. Should map rounds wait for Bible Map Challenge, or should location prompts come first through existing games?
2. Include Luke 3 genealogy rounds in the first release, or Matthew 1 only?
