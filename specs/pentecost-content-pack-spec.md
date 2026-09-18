# Pentecost Content Pack Spec

Shared behavior (category visibility, season calendar, pack format, predefined events, featured seasonal event, Daily Challenge integration, authoring standards, admin, testing) is defined in `themed-content-spec.md`. This spec covers only Pentecost content.

## Purpose

The Pentecost pack adds rounds on the Ascension, the coming of the Holy Spirit in Acts 2, Peter's sermon, the birth of the early church, the promises of the Spirit, and the fruit of the Spirit.

It completes the Easter season and is smaller than the Christmas and Easter packs, because the source material is concentrated in a few chapters.

## Category

| Field | Value |
|---|---|
| ID | `pentecost` |
| Label | Pentecost |
| Search aliases | Holy Spirit, Ascension, Whitsunday, Early Church |
| Kind | `christian-calendar` |
| Accent color | `#b5532a` |
| Season | `easter-relative`: Easter + 39 days (Ascension) through Easter + 56 days (Pentecost + 7) |
| Feature priority | 80 |
| Session tags | `ascension`, `pentecost` |

The Old Testament Feast of Weeks (Shavuot) is covered by `biblical-feasts-content-pack-spec.md`. This pack mentions it only as the setting of Acts 2.

## Target Users

- Churches marking Pentecost Sunday
- Youth groups and Sunday school classes studying Acts
- Families continuing the Easter season

## Content Themes

Primary themes:

- Jesus' promise of the Spirit (Luke 24:49; John 14-16; Acts 1:4-8)
- The Ascension (Acts 1:9-11)
- Choosing Matthias (Acts 1:15-26)
- The coming of the Spirit (Acts 2:1-13)
- Peter's sermon and its Old Testament quotations (Acts 2:14-40)
- The first believers (Acts 2:41-47)
- The early church in Acts 3-4
- The fruit of the Spirit (Galatians 5:22-23)

Avoid:

- Denominational debates about spiritual gifts. Keep to what the text describes.
- Presenting the Sinai-Pentecost link or the "reversal of Babel" as stated in the text. Both are later interpretive traditions; use them only as labeled teaching (`themed-content-spec.md` 10.4).

## Tradition Versus Text

Good `two-truths-and-a-lie` material, each with a study note:

- The text says "cloven tongues like as of fire" (Acts 2:3), not that they were literally on fire.
- It was "a sound from heaven as of a rushing mighty wind" (Acts 2:2).
- About 120 were gathered when Matthias was chosen (Acts 1:15).
- About three thousand were added that day (Acts 2:41).
- Some onlookers said the disciples were "full of new wine" (Acts 2:13); Peter replied it was only the third hour of the day (Acts 2:15).
- At the Ascension, two men in white apparel spoke to the disciples (Acts 1:10-11).

## Game Mix

### Anchor Games

- `before-or-after`
- `who-said-it`
- `fulfillment-finder`
- `prophecy-match`
- `two-truths-and-a-lie`

### Daily-Ready Games

- `complete-the-verse`
- `missing-word`
- `bible-anagrams`
- `odd-one-out`

### Event Games

- `bible-timeline`
- `bible-connections`
- `five-guesses`
- `initials`

### Optional Games

- `verse-scramble`, `bible-cryptogram`: Acts 1:8, Acts 2:38, Galatians 5:22-23

### Excluded Games

- `bible-books-relay`, `word-ladder`, `genealogy`: no Pentecost angle
- `chapter-finder`, `reference-rush`, `name-that-book`: too few source chapters
- `messiah-prophecy`, `prophecy-clue-ladder`: covered better by `fulfillment-finder` and `prophecy-match`

## Round Targets

Lower than the standard 20 because the source material is concentrated (`themed-content-spec.md` 10.7 exception).

| Game | Minimum Rounds | Notes |
|---|---:|---|
| `before-or-after` | 14 | Resurrection through Acts 4 |
| `who-said-it` | 12 | See speakers below |
| `fulfillment-finder` | 10 | OT quotations in Peter's sermon; Jesus' promises |
| `prophecy-match` | 6 pairs | Promise to fulfillment |
| `two-truths-and-a-lie` | 14 | Tradition versus text; Acts 1-2 details |
| `complete-the-verse` | 12 | KJV |
| `missing-word` | 12 | KJV |
| `bible-anagrams` | 16 | People, places, themes |
| `odd-one-out` | 12 | Nations, fruit of the Spirit, people |
| `bible-timeline` | 4 | Ascension through Acts 4 |
| `bible-connections` | 3 boards | See ideas below |
| `five-guesses` | 25 | Enough for a complete board |
| `initials` | 25 | Enough for a complete board |

## Content Ideas

### Before or After and Bible Timeline

Sequence: resurrection → appearances over forty days (Acts 1:3) → Ascension → choosing Matthias → the Spirit comes → Peter's sermon → about 3,000 baptized → the church shares all things → Peter and John heal the lame man (Acts 3) → Peter and John before the council (Acts 4).

### Who Said It?

Candidate speakers: Jesus (Acts 1:8), the two men in white apparel (Acts 1:11), Peter (Acts 2:14-40; 3:6), the mockers (Acts 2:13), the crowd ("what shall we do?", Acts 2:37), the council (Acts 4:16-17).

### Promise and Fulfillment

| Promise or prophecy | Fulfillment |
|---|---|
| Joel 2:28-32 | Acts 2:16-21 |
| Psalm 16:8-11 | Acts 2:25-28 |
| Psalm 110:1 | Acts 2:34-35 |
| John 14:16, 26; John 16:7 | Acts 2:4, 33 |
| Luke 24:49; Acts 1:5, 8 | Acts 2:1-4 |

### Odd One Out and Bible Connections

- Nations named in Acts 2:9-11 vs one not named
- The fruit of the Spirit (Galatians 5:22-23) vs one quality not in the list
- Signs at Pentecost: wind, fire, tongues, plus one that is not in the account
- Peter's quoted sources: Joel, David (Psalm 16), David (Psalm 110)

### Bible Anagrams

Examples: SPIRIT, TONGUES, PENTECOST, COMFORTER, MATTHIAS, JOEL, WIND, FIRE.

### Complete the Verse / Missing Word

Candidate verses: Acts 1:8, Acts 2:4, Acts 2:38, Acts 2:42, Joel 2:28, John 14:26, Galatians 5:22-23, Romans 8:26.

## Sub-Seasons

| Tag | Window | Use |
|---|---|---|
| `ascension` | Ascension to the day before Pentecost | Ascension, waiting, Matthias |
| `pentecost` | Pentecost to Pentecost + 7 | Acts 2 and the early church |

## Predefined Events

| ID | Name | Audience | Games | Featured | Notes |
|---|---|---|---|---|---|
| `pentecost-family-mix` | Family Pentecost Mix | family | who-said-it, before-or-after, bible-anagrams, two-truths-and-a-lie | Yes | Default featured event |
| `pentecost-kids` | Wind and Fire (Kids) | kids | bible-anagrams, odd-one-out, missing-word, before-or-after | No | `difficulty: easy` |
| `pentecost-promise-fulfilled` | The Promise Fulfilled | teaching | fulfillment-finder, prophecy-match, who-said-it, complete-the-verse | No | |
| `pentecost-birth-of-the-church` | Birth of the Church | event-night | bible-timeline, five-guesses, bible-connections, two-truths-and-a-lie | No | |

## Daily Pool

- `before-or-after`
- `who-said-it`
- `two-truths-and-a-lie`
- `complete-the-verse`
- `missing-word`
- `bible-anagrams`

## Acceptance Criteria

- Meets `themed-content-spec.md`.
- Round targets met for every included game.
- Interpretive links (Sinai, Babel) appear only as labeled teaching, never as the lie in two-truths rounds.
- The season window runs from Ascension to Pentecost + 7 for five test years.
- The `pentecost-kids` event plays entirely on easy content.

## Open Decisions

1. Include Acts 3-4 content, or keep the pack to Acts 1-2 plus the promises?
2. Include `five-guesses` and `initials`, whose 25-round minimum is hard to reach from this material, or drop them?
