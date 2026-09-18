# Thanksgiving Day Content Pack Spec

Shared behavior (category visibility, season calendar, pack format, predefined events, featured seasonal event, Daily Challenge integration, authoring standards, admin, testing) is defined in `themed-content-spec.md`. This spec covers only Thanksgiving content.

## Purpose

The Thanksgiving pack adds seasonal rounds focused on gratitude, provision, harvest, remembrance, worship, and God's faithfulness.

It should feel warm and family-friendly, and work for quick holiday gatherings, church classes, and November daily challenges. It uses existing games only.

## Category

| Field | Value |
|---|---|
| ID | `thanksgiving` |
| Label | Thanksgiving Day |
| Search aliases | Thanksgiving, Gratitude, Harvest |
| Kind | `civic-holiday` |
| Accent color | `#8a5c24` |
| Season (`us`, default) | `nth-weekday`: fourth Thursday of November, from 14 days before through 3 days after |
| Season (`ca`) | `nth-weekday`: second Monday of October, from 14 days before through 1 day after |
| Season (`uk`) | `none` (available all year, not featured) |
| Feature priority | 70 |
| Session tags | none |

The biblical harvest feasts (Firstfruits, Weeks, Tabernacles) are covered in depth by `biblical-feasts-content-pack-spec.md`. This pack may touch on them as provision and gratitude themes.

## Target Users

- Families playing around Thanksgiving
- Church small groups and Sunday school classes in the fall
- Teachers who want a quick gratitude-themed opener
- Event hosts running a seasonal game night

## Content Themes

Primary themes:

- Giving thanks to God
- God's provision
- Harvest, firstfruits, and feasts
- The thank offering (Leviticus 7:12)
- Remembering deliverance
- Worship and praise
- Contentment
- Generosity and sharing

Avoid:

- Treating Thanksgiving as mainly American (or Canadian) history
- Modern holiday trivia disconnected from Scripture
- Content implying gratitude is only positive feeling rather than worship, remembrance, and trust

## Tradition Versus Text

Less central here than in the Christmas or Easter packs. Good `two-truths-and-a-lie` material comes from details people half-remember, each with a verse reference:

- Of the ten lepers healed, one returned to give thanks, and he was a Samaritan (Luke 17:15-18).
- Manna came six days a week, with a double portion before the Sabbath (Exodus 16:22-26).
- Ruth gleaned in the field of Boaz, a relative of Naomi's husband (Ruth 2:1-3).
- Jesus gave thanks before feeding the five thousand (John 6:11).

## Game Mix

### Daily-Ready Games

- `complete-the-verse`
- `missing-word`
- `who-said-it`
- `before-or-after`
- `two-truths-and-a-lie`
- `bible-anagrams`
- `psalm-theme`
- `psalm-reference-finder`

`psalm-theme` and `psalm-reference-finder` are promoted from optional: the thanksgiving psalms (100, 103, 107, 136) fit them directly.

### Event Games

- `five-guesses`
- `initials`
- `bible-connections`
- `bible-timeline`
- `odd-one-out`

### Optional Games

- `reference-rush`: familiar thanksgiving and praise passages
- `bible-cryptogram`, `verse-scramble`: short gratitude verses
- `wisdom-match`, `proverb-categories`: contentment and generosity proverbs, only if enough strong content exists

### Excluded Games

- `bible-books-relay`, `word-ladder`: no Thanksgiving angle
- Prophecy games and `genealogy`: no natural fit

## Round Targets

| Game | Minimum Rounds | Notes |
|---|---:|---|
| `complete-the-verse` | 20 | Gratitude, praise, provision, mercy, contentment |
| `missing-word` | 20 | KJV verse text |
| `psalm-theme` | 16 | Thanksgiving and praise psalms |
| `psalm-reference-finder` | 16 | Thanksgiving and praise psalms |
| `who-said-it` | 12 | Thanksgiving, praise, vows, worship, deliverance |
| `before-or-after` | 16 | Provision and harvest chronology |
| `two-truths-and-a-lie` | 16 | People and events tied to gratitude and provision |
| `bible-anagrams` | 20 | People, places, offerings, feasts, objects, themes |
| `odd-one-out` | 12 | Provision miracles, thankful voices |
| `bible-timeline` | 6 | Provision in the wilderness; Ruth |
| `five-guesses` | 25 | Enough for a complete board |
| `initials` | 25 | Enough for a complete board |
| `bible-connections` | 4 boards | Gratitude and provision groupings |
| `reference-rush` | 12 | If included |

## Content Ideas

### Complete the Verse / Missing Word

Candidate passages: Psalm 100, 103, 107, 136; 1 Chronicles 16; Philippians 4; Colossians 3; 1 Thessalonians 5:18; James 1:17; Matthew 6; 2 Corinthians 9:15.

### Who Said It?

Candidate speakers: David, Hannah, Daniel, Paul, the healed Samaritan leper, Mary, Moses, Solomon, Jonah (Jonah 2:9), Job.

### Before or After

- Manna given in the wilderness vs water from the rock
- Ruth gleaning in Boaz's field vs Boaz redeeming Ruth
- Hannah praying at Shiloh vs Samuel being born
- David bringing the ark to Jerusalem vs David's psalm of thanks (1 Chronicles 16)
- Feeding the 5,000 vs Jesus walking on water
- Ten lepers healed vs one returning to thank Jesus

### Bible Connections

- Thankful voices: Hannah, David, Daniel, Mary
- Provision miracles: manna, ravens, widow's oil, loaves
- Harvest images: firstfruits, gleaning, sheaves, vineyard
- Praise words: thanks, mercy, sing, bless

### Bible Anagrams

Examples: MANNA, HARVEST, GLEANING, SHEAVES, PRAISE, OFFERING, BOAZ, HANNAH.

## Predefined Events

| ID | Name | Audience | Games | Featured | Notes |
|---|---|---|---|---|---|
| `thanksgiving-family-mix` | Family Thanksgiving Mix | family | who-said-it, before-or-after, bible-anagrams, two-truths-and-a-lie | Yes | Default featured event |
| `thanksgiving-kids` | Thankful Hearts (Kids) | kids | bible-anagrams, odd-one-out, missing-word, before-or-after | No | `difficulty: easy` |
| `thanksgiving-psalms-of-thanks` | Psalms of Thanks | teaching | psalm-theme, psalm-reference-finder, complete-the-verse, missing-word | No | |
| `thanksgiving-harvest-provision` | Harvest and Provision | event-night | five-guesses, bible-connections, bible-timeline, odd-one-out | No | |

## Daily Pool

- `complete-the-verse`
- `missing-word`
- `who-said-it`
- `before-or-after`
- `two-truths-and-a-lie`
- `bible-anagrams`
- `psalm-theme`

Avoid board-heavy games in dailies.

## Acceptance Criteria

- Meets `themed-content-spec.md`.
- Round targets met for every included game.
- The season window follows the `seasonRegion` setting (US and Canada dates; UK not featured).
- No round depends on American or Canadian history.
- The `thanksgiving-kids` event plays entirely on easy content.

## Open Decisions

1. UK: leave unfeatured, or feature it around a harvest festival window (for example late September to mid-October)?
2. Include `wisdom-match` and `proverb-categories` in the first release, or wait for enough strong content?
