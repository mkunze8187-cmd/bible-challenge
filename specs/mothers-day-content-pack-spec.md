# Mother's Day Content Pack Spec

Shared behavior (category visibility, season calendar, pack format, predefined events, featured seasonal event, Daily Challenge integration, authoring standards, admin, testing) is defined in `themed-content-spec.md`. This spec covers only Mother's Day content.

## Purpose

The Mother's Day pack adds rounds on mothers and motherly figures in Scripture, faith passed between generations, God's comfort described in motherly terms, and honoring mothers.

## Category

| Field | Value |
|---|---|
| ID | `mothers-day` |
| Label | Mother's Day |
| Search aliases | Mothers, Mothering Sunday, Women of the Bible |
| Kind | `civic-holiday` |
| Accent color | `#9a4f74` |
| Season (`us`, default) | `nth-weekday`: second Sunday of May, from 7 days before through 1 day after |
| Season (`ca`) | Same as `us` |
| Season (`uk`) | `easter-relative`: Mothering Sunday (Easter − 21 days), from 7 days before through 1 day after |
| Feature priority | 70 |
| Session tags | none |

## Target Users

- Families on Mother's Day weekend
- Churches and Sunday school classes on Mother's Day
- Women's ministry gatherings

## Content Themes

Primary themes:

- Mothers in Scripture: Eve, Sarah, Rebekah, Rachel, Leah, Jochebed, Hannah, Naomi, Ruth, Elizabeth, Mary, Eunice
- Grandmothers and caregivers: Lois (2 Timothy 1:5), Pharaoh's daughter raising Moses (Exodus 2:10), Naomi caring for Obed (Ruth 4:16)
- Spiritual mothers: Deborah, "a mother in Israel" (Judges 5:7)
- Faith passed on (2 Timothy 1:5; 2 Timothy 3:15)
- A mother's teaching (Proverbs 1:8; 6:20; 31:26)
- Honoring father and mother (Exodus 20:12; Ephesians 6:2)
- Jesus caring for his mother at the cross (John 19:26-27)
- God's comfort described like a mother's (Isaiah 49:15; Isaiah 66:13)
- The women named in Matthew's genealogy: Tamar, Rahab, Ruth, Bathsheba (referred to as the wife of Uriah), Mary

Avoid:

- Greeting-card sentiment disconnected from Scripture
- Treating Proverbs 31 as only about mothers; it describes a woman of strength and wisdom

## Sensitivity Notes

Per `themed-content-spec.md` 10.5, this pack must work in a room where some children have lost a mother, live apart from her, are adopted or fostered, or are raised by someone else.

- Include grandmothers, caregivers, adoptive and spiritual mothers alongside birth mothers.
- Handle infertility stories (Sarah, Rachel, Hannah, Elizabeth) as stories of faith and God's timing. Never frame childlessness as punishment or failure.
- Do not include rounds that ask players about their own mothers.
- Include content on God's care, so every child has something to connect with.

## Tradition Versus Text

Good `two-truths-and-a-lie` material, each with a verse reference:

- Moses' mother hid him for three months (Exodus 2:2) and then became his nurse for Pharaoh's daughter (Exodus 2:7-9).
- Hannah brought Samuel a little coat every year (1 Samuel 2:19).
- Timothy's grandmother was Lois and his mother Eunice (2 Timothy 1:5).
- Ruth was Naomi's daughter-in-law, not her daughter (Ruth 1:4).
- Elizabeth was Mary's cousin in the KJV (Luke 1:36).

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

### Optional Games

- `verse-scramble`, `bible-cryptogram`: 2 Timothy 1:5, Isaiah 66:13, Proverbs 31:26, Ruth 1:16

### Excluded Games

- Prophecy games: no natural fit
- `genealogy`: the game follows male lines; the women of Matthew 1 work better in `bible-connections`
- `bible-books-relay`, `word-ladder`, `chapter-finder`, `reference-rush`, `name-that-book`: weak or no fit

## Round Targets

| Game | Minimum Rounds | Notes |
|---|---:|---|
| `who-said-it` | 16 | See speakers below |
| `five-guesses` | 25 | Mothers and caregivers as answers |
| `initials` | 25 | Mothers, children, places, phrases |
| `two-truths-and-a-lie` | 16 | See examples above |
| `complete-the-verse` | 16 | KJV |
| `missing-word` | 16 | KJV |
| `before-or-after` | 14 | Events in mothers' stories |
| `bible-anagrams` | 20 | Names and themes |
| `bible-connections` | 3 boards | See ideas below |
| `odd-one-out` | 12 | See ideas below |
| `wisdom-match` | 12 | Proverbs on a mother's teaching, honoring parents |

## Content Ideas

### Who Said It?

Candidate speakers: Sarah (Genesis 21:6-7), Rebekah, Rachel, Hannah (1 Samuel 1-2), Naomi, Ruth (Ruth 1:16), Elizabeth (Luke 1:42-45), Mary (Luke 1:46-55; John 2:5), the mother of James and John (Matthew 20:21), Jesus (John 19:26).

### Before or After

- Hannah prays at Shiloh vs Samuel is born
- Moses is placed in the ark of bulrushes vs Pharaoh's daughter finds him
- Ruth follows Naomi to Bethlehem vs Ruth gleans in Boaz's field
- Elizabeth conceives vs Mary visits Elizabeth
- Sarah laughs at the promise vs Isaac is born

### Bible Connections

- Mothers of prophets and leaders: Jochebed (Moses), Hannah (Samuel), Elizabeth (John the Baptist)
- Women in Matthew's genealogy: Tamar, Rahab, Ruth, Mary
- Generations of faith: Lois, Eunice, Timothy
- Songs of mothers: Hannah's song, Mary's song, Deborah's song

### Odd One Out

- Mothers of patriarchs (Sarah, Rebekah, Rachel) vs one who is not
- Women named in Matthew 1 vs one who is not
- Mothers in Luke 1-2 vs one from another Gospel scene

### Bible Anagrams

Examples: HANNAH, NAOMI, EUNICE, JOCHEBED, REBEKAH, ELIZABETH, LOIS, RUTH.

### Complete the Verse / Missing Word

Candidate verses: Exodus 20:12, Proverbs 31:26, Proverbs 31:28, Isaiah 49:15, Isaiah 66:13, Ruth 1:16, 2 Timothy 1:5, John 19:27.

## Predefined Events

| ID | Name | Audience | Games | Featured | Notes |
|---|---|---|---|---|---|
| `mothers-day-family-mix` | Family Mother's Day Mix | family | who-said-it, before-or-after, bible-anagrams, two-truths-and-a-lie | Yes | Default featured event |
| `mothers-day-kids` | Moms of the Bible (Kids) | kids | bible-anagrams, five-guesses, missing-word, before-or-after | No | `difficulty: easy` |
| `mothers-day-faith-generations` | Faith Through Generations | teaching | who-said-it, complete-the-verse, wisdom-match, bible-connections | No | |

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
- Sensitivity notes met: caregivers, grandmothers, adoptive and spiritual mothers are represented; no round frames childlessness negatively; no round asks about players' own mothers.
- The season window follows `seasonRegion` (US and Canada in May; UK on Mothering Sunday).
- The `mothers-day-kids` event plays entirely on easy content.

## Open Decisions

1. Combine Mother's Day and Father's Day into one "Family" pack instead of two categories?
2. Should content about women of the Bible who were not mothers (for example Deborah as judge, Esther) be included, or kept for a future "Women of the Bible" evergreen category?
