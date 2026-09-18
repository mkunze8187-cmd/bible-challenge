# New Year Content Pack Spec

Shared behavior (category visibility, season calendar, pack format, predefined events, featured seasonal event, Daily Challenge integration, authoring standards, admin, testing) is defined in `themed-content-spec.md`. This spec covers only New Year content.

## Purpose

The New Year pack adds rounds on new beginnings, God's faithfulness, wisdom for the year ahead, remembering what God has done, and "firsts" in the Bible.

## Category

| Field | Value |
|---|---|
| ID | `new-year` |
| Label | New Year |
| Search aliases | New Beginnings, Fresh Start, Firsts |
| Kind | `civic-holiday` |
| Accent color | `#3d4f86` |
| Season | `fixed`: December 26 through January 15 (wraps the year end) |
| Feature priority | 60 |
| Session tags | none |

This window overlaps Christmas (through January 6). Christmas has higher priority, so New Year is featured from January 7 to January 15 and listed as in season from December 26 (`themed-content-spec.md` 5.4).

The Hebrew new year (Feast of Trumpets) is covered by `biblical-feasts-content-pack-spec.md`.

## Target Users

- Families at New Year gatherings
- Churches starting the year with a watch-night or first-Sunday event
- Classes starting a new term in January

## Content Themes

Primary themes:

- New beginnings: creation (Genesis 1), Noah after the flood (Genesis 8-9), the call of Abram (Genesis 12), "the beginning of months" (Exodus 12:2), rebuilding after the exile (Ezra, Nehemiah)
- New life: "Ye must be born again" (John 3:7), "a new creature" (2 Corinthians 5:17), "I make all things new" (Revelation 21:5), "I will do a new thing" (Isaiah 43:19)
- God's faithfulness each morning (Lamentations 3:22-23)
- Numbering our days (Psalm 90:12) and seasons (Ecclesiastes 3:1-8)
- Planning and trust (Proverbs 3:5-6; 16:9; James 4:13-15)
- Remembering what God has done: Ebenezer (1 Samuel 7:12), the memorial stones (Joshua 4)
- Firsts in the Bible: first king, first miracle of Jesus, first martyr, first missionary journey

Avoid:

- Resolutions and self-improvement framed without Scripture
- Numerology or date-setting about the future

## Tradition Versus Text

Good `two-truths-and-a-lie` material, each with a verse reference:

- Jesus' first miracle, per John, was at Cana (John 2:11).
- Saul was Israel's first king (1 Samuel 10).
- Stephen is the first recorded martyr of the church (Acts 7).
- "Hitherto hath the LORD helped us" is what Samuel said when he named Ebenezer (1 Samuel 7:12).
- The rainbow was given as a sign after the flood (Genesis 9:13).

"Firsts" rounds follow the parallel-accounts rule: when a "first" depends on one book's account, name the book.

## Game Mix

### Anchor Games

- `before-or-after`
- `five-guesses`
- `two-truths-and-a-lie`
- `wisdom-match`

### Daily-Ready Games

- `complete-the-verse`
- `missing-word`
- `bible-anagrams`
- `odd-one-out`
- `psalm-reference-finder`

### Event Games

- `bible-timeline`
- `initials`
- `bible-connections`
- `proverb-categories`

### Optional Games

- `verse-scramble`, `bible-cryptogram`: Lamentations 3:22-23, Psalm 90:12, 2 Corinthians 5:17, Isaiah 43:19

### Excluded Games

- Prophecy games and `genealogy`: no natural fit
- `bible-books-relay`, `word-ladder`, `chapter-finder`, `reference-rush`, `name-that-book`: weak or no fit

## Round Targets

| Game | Minimum Rounds | Notes |
|---|---:|---|
| `before-or-after` | 16 | New beginnings across the Bible |
| `five-guesses` | 25 | Bible firsts as answers |
| `two-truths-and-a-lie` | 16 | Firsts and new beginnings |
| `wisdom-match` | 16 | Planning, trust, time |
| `complete-the-verse` | 16 | KJV |
| `missing-word` | 16 | KJV |
| `psalm-reference-finder` | 12 | Psalms 90, 118, 121, 139 and others |
| `bible-anagrams` | 20 | Names, places, themes |
| `odd-one-out` | 12 | See ideas below |
| `bible-timeline` | 6 | New beginnings in order |
| `initials` | 25 | Firsts, phrases |
| `bible-connections` | 3 boards | See ideas below |
| `proverb-categories` | 12 | Wisdom for the year |

## Content Ideas

### Before or After / Bible Timeline

Sequence of new beginnings: creation → Noah leaves the ark → the call of Abram → the first Passover → crossing the Jordan → the first king → return from exile → the birth of Jesus → Pentecost.

### Five Guesses (Bible Firsts)

Candidate answers: the first king (Saul), the first high priest (Aaron), the first martyr (Stephen), Jesus' first miracle (water to wine), the first disciples called, the first rainbow, the first Passover, the first missionary journey (Paul and Barnabas).

### Bible Connections

- Memorials: Ebenezer, the Jordan stones, the Passover, the Lord's Supper
- "New" things: new heart, new song, new creature, new Jerusalem
- Morning verses: Lamentations 3:23, Psalm 5:3, Psalm 30:5, Psalm 143:8
- Time words: season, day, year, morning

### Odd One Out

- First kings, priests, and judges vs one who was not first
- Verses about time vs one unrelated verse
- New beginnings after water (Noah, the Red Sea, the Jordan) vs one that is not

### Bible Anagrams

Examples: EBENEZER, GENESIS, MORNING, SEASON, RAINBOW, CREATION, JORDAN, MERCIES.

### Complete the Verse / Missing Word

Candidate verses: Lamentations 3:22-23, Psalm 90:12, Psalm 118:24, Proverbs 3:5-6, Proverbs 16:9, Ecclesiastes 3:1, Isaiah 43:19, 2 Corinthians 5:17, Philippians 3:13-14, Revelation 21:5.

## Predefined Events

| ID | Name | Audience | Games | Featured | Notes |
|---|---|---|---|---|---|
| `new-year-family-mix` | Family New Year Mix | family | before-or-after, two-truths-and-a-lie, bible-anagrams, complete-the-verse | Yes | Default featured event |
| `new-year-kids` | Fresh Start (Kids) | kids | bible-anagrams, odd-one-out, missing-word, before-or-after | No | `difficulty: easy` |
| `new-year-wisdom-for-the-year` | Wisdom for the Year | teaching | wisdom-match, proverb-categories, psalm-reference-finder, complete-the-verse | No | |
| `new-year-bible-firsts` | Bible Firsts | event-night | five-guesses, initials, bible-timeline, bible-connections | No | |

## Daily Pool

- `before-or-after`
- `two-truths-and-a-lie`
- `complete-the-verse`
- `missing-word`
- `bible-anagrams`
- `wisdom-match`

## Acceptance Criteria

- Meets `themed-content-spec.md`.
- Round targets met for every included game.
- The season window wraps the year end correctly, and New Year is featured only after Christmas's window ends.
- "Firsts" rounds name the book when the claim depends on one account.
- The `new-year-kids` event plays entirely on easy content.

## Open Decisions

1. Should "Bible Firsts" become its own evergreen category later, since it is not really seasonal?
2. Start the season on December 26, or on December 31 to keep the week after Christmas focused on Christmas?
