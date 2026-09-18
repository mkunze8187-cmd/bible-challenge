# Biblical Feasts Content Pack Spec

Shared behavior (category visibility, season calendar, pack format, predefined events, featured seasonal event, Daily Challenge integration, authoring standards, admin, testing) is defined in `themed-content-spec.md`. This spec covers only Biblical Feasts content.

## Purpose

The Biblical Feasts pack adds rounds on the feasts and holy days in Scripture: what the Bible commands, the events behind them, where they appear in the Gospels, and how the New Testament connects them to Christ.

It helps Christian groups understand the Old Testament background to Passover and the Last Supper, Pentecost, and Jesus' visits to Jerusalem at the feasts.

## Category

| Field | Value |
|---|---|
| ID | `biblical-feasts` |
| Label | Biblical Feasts |
| Search aliases | Passover, Tabernacles, Booths, Purim, Feast of Weeks, Day of Atonement, Hanukkah, Dedication |
| Kind | `biblical-feast` |
| Accent color | `#6b5b2e` |
| Season | `date-table`: one window per feast, from 7 days before through the feast's last day, tagged by feast |
| Feature priority | 50 |
| Session tags | `passover`, `unleavened-bread`, `firstfruits`, `weeks`, `trumpets`, `atonement`, `tabernacles`, `purim`, `dedication` |

### Date Table

Feast dates follow the Hebrew calendar and move each year. Per `themed-content-spec.md` 5.3:

- Populate `src/lib/themes/feastDates.ts` with at least 10 years of windows from an authoritative source (for example Hebcal), and record the source and retrieval date.
- Do not hand-calculate dates.
- Years missing from the table leave the category available but not featured.

### Overlaps

- Passover often overlaps Easter / Resurrection Day, and Weeks overlaps Pentecost. Those packs have higher priority, so Biblical Feasts is listed as in season but not featured during the overlap.
- Dedication often overlaps Christmas, with the same result.

## Target Users

- Churches and classes studying the Old Testament background to the Gospels
- Families wanting to understand Passover before Resurrection Day
- Teachers covering Leviticus 23, Exodus, or Esther

## Content Themes

| Feast | Tag | Core passages |
|---|---|---|
| Passover | `passover` | Exodus 12; Leviticus 23:5; Deuteronomy 16:1-8; Luke 22:7-20; 1 Corinthians 5:7 |
| Unleavened Bread | `unleavened-bread` | Exodus 12:15-20; Leviticus 23:6-8; 1 Corinthians 5:6-8 |
| Firstfruits | `firstfruits` | Leviticus 23:9-14; 1 Corinthians 15:20 |
| Weeks (Shavuot) | `weeks` | Leviticus 23:15-21; Deuteronomy 16:9-12; Acts 2:1 |
| Trumpets | `trumpets` | Leviticus 23:23-25; Numbers 29:1 |
| Day of Atonement | `atonement` | Leviticus 16; Leviticus 23:26-32; Hebrews 9-10 |
| Tabernacles (Booths) | `tabernacles` | Leviticus 23:33-43; Nehemiah 8:14-18; Zechariah 14:16; John 7:2, 37-38 |
| Purim | `purim` | Esther 9:20-32 (and the Esther story) |
| Dedication | `dedication` | John 10:22-23 |

Avoid:

- Presenting later Jewish tradition as biblical command
- Presenting Christian typology as the Jewish meaning of a feast
- Language implying Jewish observance is obsolete or wrong

## Sensitivity Notes

Per `themed-content-spec.md` 10.5:

- Treat the feasts respectfully, as living observances for Jewish people today.
- Keep three things clearly separate in prompts and study notes:
  1. **What the Bible says** (commands, events, references)
  2. **Later Jewish tradition** (labeled as such)
  3. **Christian interpretation** (phrased as teaching, backed by an explicit New Testament reference)
- Do not include rounds that treat the feasts as curiosities or costume.

## Tradition Versus Text

Good `two-truths-and-a-lie` material, each with a study note:

- The Passover lamb was to be without blemish and a male of the first year (Exodus 12:5).
- The Passover was eaten with unleavened bread and bitter herbs (Exodus 12:8).
- Blood was applied with hyssop to the lintel and doorposts (Exodus 12:22).
- During Tabernacles, Israel dwelt in booths for seven days (Leviticus 23:42).
- Purim is named for the lot (pur) Haman cast (Esther 3:7; 9:24-26).
- The Feast of Dedication is mentioned once in the Bible, in John 10:22.

Later traditions, such as the four cups and the afikomen at the seder, the reading of Ruth at Shavuot, the reading of Esther at Purim, and the Hanukkah oil story, may appear only as clearly labeled tradition. They are never used as the "truth" or the "lie" in a question about what the Bible says. The origin of the Feast of Dedication is recorded in 1 Maccabees, which is not in the Protestant canon; study notes say so.

## Game Mix

### Anchor Games

- `bible-connections`
- `who-said-it`
- `before-or-after`
- `two-truths-and-a-lie`
- `chapter-finder` (a strong fit here: the feasts have well-defined chapters)

### Daily-Ready Games

- `complete-the-verse`
- `missing-word`
- `bible-anagrams`
- `odd-one-out`

### Event Games

- `five-guesses`
- `initials`
- `bible-timeline`
- `prophecy-match`
- `fulfillment-finder`

### Optional Games

- `verse-scramble`, `bible-cryptogram`: Exodus 12:13, Leviticus 23:42, John 7:37, 1 Corinthians 5:7

### Excluded Games

- `genealogy`, `bible-books-relay`, `word-ladder`: no feast angle
- `messiah-prophecy`, `prophecy-clue-ladder`: typology is covered more carefully by `prophecy-match` and `fulfillment-finder` with explicit New Testament references

## Round Targets

| Game | Minimum Rounds | Notes |
|---|---:|---|
| `bible-connections` | 4 boards | Group items and practices by feast |
| `who-said-it` | 16 | See speakers below |
| `before-or-after` | 16 | Exodus night; Esther; Nehemiah 8 |
| `two-truths-and-a-lie` | 20 | See rules above |
| `chapter-finder` | 16 | Exodus 12, Leviticus 16, 23, Numbers 28-29, Deuteronomy 16, Esther 9, Nehemiah 8, John 7, 10 |
| `complete-the-verse` | 16 | KJV |
| `missing-word` | 16 | KJV |
| `bible-anagrams` | 20 | Feasts, objects, people |
| `odd-one-out` | 12 | See ideas below |
| `five-guesses` | 25 | Feasts, objects, people |
| `initials` | 25 | Feasts, objects, phrases |
| `bible-timeline` | 6 | Exodus night; the Esther story |
| `prophecy-match` | 6 pairs | Only pairs with an explicit NT reference |
| `fulfillment-finder` | 8 | Only with an explicit NT reference |

Every feast tag should have at least one session for each anchor game, so the featured event works in each feast's window. Purim and Passover, which have the richest narratives, should have the most content.

## Content Ideas

### Who Said It?

Candidate speakers: Moses (Exodus 12:21-27), Pharaoh (Exodus 12:31-32), Esther (Esther 4:16), Mordecai (Esther 4:14), Haman, King Ahasuerus, Nehemiah and Ezra (Nehemiah 8:9-10), Jesus (Luke 22:15; John 7:37-38).

### Bible Connections

- Passover items: lamb, hyssop, unleavened bread, bitter herbs
- Tabernacles: booths, palm branches, willows, seven days (Leviticus 23:40-42)
- Esther story: Mordecai, Haman, the lot, the king's sceptre
- Day of Atonement: high priest, two goats, mercy seat, once a year

### Odd One Out

- Feasts in Leviticus 23 vs one not listed there (Purim)
- Passover items vs one Tabernacles item
- People in Esther vs one from Nehemiah

### Prophecy Match / Fulfillment Finder

Only pairs where the New Testament makes the link explicitly:

| Feast | New Testament reference |
|---|---|
| Passover lamb | 1 Corinthians 5:7; John 1:29 |
| Unleavened bread | 1 Corinthians 5:6-8 |
| Firstfruits | 1 Corinthians 15:20-23 |
| Weeks | Acts 2:1 |
| Day of Atonement | Hebrews 9:7-12 |
| Tabernacles | John 7:37-39 |

### Bible Anagrams

Examples: PASSOVER, HYSSOP, TABERNACLES, TRUMPETS, ATONEMENT, MORDECAI, ESTHER, FIRSTFRUITS.

### Complete the Verse / Missing Word

Candidate verses: Exodus 12:13, Exodus 12:14, Leviticus 16:30, Leviticus 23:42, Esther 4:14, Nehemiah 8:10, John 7:37, 1 Corinthians 5:7.

## Predefined Events

| ID | Name | Audience | Games | Featured | Notes |
|---|---|---|---|---|---|
| `feasts-overview` | Feasts of the Bible | event-night | bible-connections, chapter-finder, odd-one-out, two-truths-and-a-lie | Yes | Featured for any feast without its own featured event |
| `feasts-passover-night` | Passover Night | teaching | who-said-it, before-or-after, bible-connections, prophecy-match | Yes | `sessionTags: ["passover", "unleavened-bread"]` |
| `feasts-esther-and-purim` | Esther and Purim | family | who-said-it, before-or-after, bible-timeline, bible-anagrams | Yes | `sessionTags: ["purim"]`; good for kids |
| `feasts-tabernacles` | Feast of Tabernacles | teaching | bible-connections, complete-the-verse, who-said-it, chapter-finder | Yes | `sessionTags: ["tabernacles"]` |
| `feasts-kids` | Feasts for Kids | kids | bible-anagrams, odd-one-out, missing-word, before-or-after | No | `difficulty: easy` |

## Daily Pool

- `who-said-it`
- `before-or-after`
- `two-truths-and-a-lie`
- `complete-the-verse`
- `missing-word`
- `bible-anagrams`

During a feast's window, dailies prefer sessions with that feast's tag.

## Acceptance Criteria

- Meets `themed-content-spec.md`.
- Round targets met for every included game.
- The feast date table covers at least 10 years from an authoritative source, with the source recorded.
- Every prompt and study note keeps biblical text, later tradition, and Christian interpretation clearly separate and labeled.
- Every `prophecy-match` and `fulfillment-finder` pair has an explicit New Testament reference.
- The correct featured event shows in each feast's window when no higher-priority pack is in season.
- The `feasts-kids` event plays entirely on easy content.

## Open Decisions

1. Include Trumpets and Dedication in the first release, or start with Passover, Tabernacles, and Purim, which have the richest narratives?
2. Should the Sabbath be included as a session set, even though it is weekly rather than seasonal?
3. Have the pack reviewed by someone familiar with Jewish observance before release?
