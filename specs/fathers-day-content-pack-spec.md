# Father's Day Content Pack Spec

Shared behavior (category visibility, season calendar, pack format, predefined events, featured seasonal event, Daily Challenge integration, authoring standards, admin, testing) is defined in `themed-content-spec.md`. This spec covers only Father's Day content.

## Purpose

The Father's Day pack adds rounds on fathers in Scripture, God as Father, a father's instruction, spiritual fathers, and honoring fathers.

## Category

| Field | Value |
|---|---|
| ID | `fathers-day` |
| Label | Father's Day |
| Search aliases | Fathers, Dads, God the Father |
| Kind | `civic-holiday` |
| Accent color | `#2d5470` |
| Season (`us`, `ca`, `uk`) | `nth-weekday`: third Sunday of June, from 7 days before through 1 day after |
| Feature priority | 70 |
| Session tags | none |

## Target Users

- Families on Father's Day weekend
- Churches and Sunday school classes on Father's Day
- Men's ministry gatherings

## Content Themes

Primary themes:

- Fathers in Scripture: Adam, Noah, Abraham, Isaac, Jacob, Joseph (son of Jacob, as father of Manasseh and Ephraim), Moses, Boaz, David, Job, Zechariah, Joseph (husband of Mary), Jairus
- God as Father: "Our Father" (Matthew 6:9), "Like as a father pitieth his children" (Psalm 103:13), "A father of the fatherless" (Psalm 68:5), "Abba, Father" (Romans 8:15), "what manner of love" (1 John 3:1)
- The father in the parable of the prodigal son (Luke 15:11-32)
- A father's instruction (Deuteronomy 6:6-7; Proverbs 1:8; 3:12; 4:1; Ephesians 6:4)
- Spiritual fathers: Paul and Timothy ("my own son in the faith", 1 Timothy 1:2); Elisha and Elijah ("My father, my father", 2 Kings 2:12)
- Fathers praying for their children: Job (Job 1:5), Jairus (Mark 5:22-23), the father of the boy in Mark 9:24
- Honoring father and mother (Exodus 20:12)

Avoid:

- Stories centered on a father's failure or grief as main material (Eli, David and Absalom). They may appear in deeper teaching sessions, not in kids' content.
- Stereotypes about what fathers do

## Sensitivity Notes

Per `themed-content-spec.md` 10.5, this pack must work in a room where some children have an absent, deceased, or harmful father, or are raised by someone else.

- Lead with God as Father, including Psalm 68:5, "a father of the fatherless."
- Include spiritual fathers and mentors alongside birth fathers.
- Do not include rounds that ask players about their own fathers.
- Kids' content avoids stories of fathers harming their children.

## Tradition Versus Text

Good `two-truths-and-a-lie` material, each with a verse reference:

- In the parable, the father ran to meet his son while he was "yet a great way off" (Luke 15:20).
- Joseph, Mary's husband, was warned in dreams more than once (Matthew 1:20; 2:13; 2:19-22).
- Job offered burnt offerings for each of his children (Job 1:5).
- Jairus was a ruler of the synagogue (Mark 5:22).
- Abraham was about a hundred years old when Isaac was born (Genesis 21:5).

## Game Mix

### Anchor Games

- `who-said-it`
- `five-guesses`
- `initials`
- `two-truths-and-a-lie`

### Daily-Ready Games

- `complete-the-verse`
- `missing-word`
- `before-or-after`
- `bible-anagrams`

### Event Games

- `bible-connections`
- `odd-one-out`
- `wisdom-match`
- `genealogy` (fathers and sons in the patriarchal line)

### Optional Games

- `parable-match`: father-themed parables (the prodigal son, the two sons in Matthew 21:28-31, a father giving good gifts in Luke 11:11-13), if the game's data format fits
- `verse-scramble`, `bible-cryptogram`: Psalm 103:13, Proverbs 3:12, Matthew 6:9, 1 John 3:1

### Excluded Games

- Prophecy games: no natural fit
- `bible-books-relay`, `word-ladder`, `chapter-finder`, `reference-rush`, `name-that-book`: weak or no fit

## Round Targets

| Game | Minimum Rounds | Notes |
|---|---:|---|
| `who-said-it` | 16 | See speakers below |
| `five-guesses` | 25 | Fathers as answers |
| `initials` | 25 | Fathers, sons, places, phrases |
| `two-truths-and-a-lie` | 16 | See examples above |
| `complete-the-verse` | 16 | KJV |
| `missing-word` | 16 | KJV |
| `before-or-after` | 14 | Events in fathers' stories |
| `bible-anagrams` | 20 | Names and themes |
| `bible-connections` | 3 boards | See ideas below |
| `odd-one-out` | 12 | See ideas below |
| `wisdom-match` | 12 | Proverbs on a father's instruction |
| `genealogy` | 4 | Adam to Noah, Noah to Abraham, Abraham to Jacob's sons |

## Content Ideas

### Who Said It?

Candidate speakers: Abraham (Genesis 22:8), Jacob (Genesis 48-49), Joseph to his brothers, David to Solomon (1 Chronicles 28:9), Job, Zechariah (Luke 1:67-79), the prodigal son's father (Luke 15:22-24, 31-32), the father in Mark 9:24, Jesus ("Our Father", "Abba, Father" in Mark 14:36).

### Before or After

- Abraham leaves Haran vs Isaac is born
- Isaac blesses Jacob vs Jacob flees to Laban
- Joseph is sold into Egypt vs Jacob moves to Egypt
- Zechariah is struck mute vs John is named
- The prodigal son leaves vs the father runs to meet him (within the parable)

### Bible Connections

- God as Father titles and verses
- Fathers who received promises by dream or angel: Abraham, Jacob, Joseph (husband of Mary), Zechariah
- Fathers and sons: Abraham/Isaac, Jacob/Joseph, David/Solomon, Zechariah/John
- Spiritual fathers and sons: Paul/Timothy, Elijah/Elisha, Eli/Samuel

### Odd One Out

- The twelve sons of Jacob vs one who is not
- Fathers in Luke 1-2 vs one from another book
- Patriarchs vs one later king

### Bible Anagrams

Examples: ABRAHAM, JACOB, JAIRUS, ZECHARIAH, BOAZ, ABBA, FATHER, PRODIGAL.

### Complete the Verse / Missing Word

Candidate verses: Exodus 20:12, Deuteronomy 6:7, Psalm 68:5, Psalm 103:13, Proverbs 3:12, Matthew 6:9, Romans 8:15, Ephesians 6:4, 1 John 3:1.

## Predefined Events

| ID | Name | Audience | Games | Featured | Notes |
|---|---|---|---|---|---|
| `fathers-day-family-mix` | Family Father's Day Mix | family | who-said-it, before-or-after, bible-anagrams, two-truths-and-a-lie | Yes | Default featured event |
| `fathers-day-kids` | Dads of the Bible (Kids) | kids | bible-anagrams, five-guesses, missing-word, before-or-after | No | `difficulty: easy` |
| `fathers-day-our-father` | Our Father | teaching | complete-the-verse, who-said-it, wisdom-match, bible-connections | No | God as Father focus |

## Daily Pool

- `who-said-it`
- `before-or-after`
- `two-truths-and-a-lie`
- `complete-the-verse`
- `missing-word`
- `bible-anagrams`

## Acceptance Criteria

- Meets `themed-content-spec.md`.
- Round targets met for every included game.
- Sensitivity notes met: God as Father and spiritual fathers are represented; no round asks about players' own fathers; kids' content avoids stories of fathers harming children.
- The season window is the third Sunday of June for five test years.
- The `fathers-day-kids` event plays entirely on easy content.

## Open Decisions

1. Combine Mother's Day and Father's Day into one "Family" pack instead of two categories? (Same decision as the Mother's Day spec.)
2. Include `parable-match`, depending on whether its data format supports a small father-themed set?
