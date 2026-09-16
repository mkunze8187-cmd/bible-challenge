import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCategoryBoardStudyNote } from "./structured-study-notes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");
const schemaDir = path.join(dataDir, "schemas");

const difficulty = (index) => (index < 9 ? "easy" : index < 18 ? "medium" : "hard");

function pack(game, displayName, roundsPerSession, sessionId, title, theme, rounds) {
  return {
    $schema: `./schemas/${game}.schema.json`,
    game,
    version: 1,
    displayName,
    roundsPerSession,
    sessions: [
      {
        id: sessionId,
        title,
        theme,
        rounds
      }
    ]
  };
}

function basePackSchema(game, title, roundSchema) {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://example.local/schemas/${game}.schema.json`,
    title,
    type: "object",
    additionalProperties: false,
    required: ["$schema", "game", "version", "displayName", "roundsPerSession", "sessions"],
    properties: {
      $schema: { type: "string" },
      game: { const: game },
      version: { type: "integer", minimum: 1 },
      displayName: { type: "string", minLength: 1 },
      roundsPerSession: { type: "integer", minimum: 1 },
      sessions: {
        type: "array",
        minItems: 1,
        items: { $ref: "#/$defs/session" }
      }
    },
    $defs: {
      session: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "theme", "rounds"],
        properties: {
          id: { type: "string", pattern: "^[a-z0-9-]+$" },
          title: { type: "string", minLength: 1 },
          theme: { type: "string", minLength: 1 },
          rounds: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/$defs/round" }
          }
        }
      },
      round: roundSchema
    }
  };
}

const difficultySchema = { enum: ["easy", "medium", "hard"] };
const fourChoices = {
  type: "array",
  minItems: 4,
  maxItems: 4,
  uniqueItems: true,
  items: { type: "string", minLength: 1 }
};

const completeVerseRounds = [
  ["ctv-001", "Psalm 1:1", "Psalms", "Blessed is the man that walketh not in the counsel of the ungodly,", "nor standeth in the way of sinners, nor sitteth in the seat of the scornful.", "Blessing", "The blessed life is described by what a person refuses and what he follows."],
  ["ctv-002", "Psalm 1:3", "Psalms", "And he shall be like a tree planted by the rivers of water,", "that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.", "Blessing", "Psalm 1 pictures faithful meditation as a rooted and fruitful life."],
  ["ctv-003", "Psalm 4:8", "Psalms", "I will both lay me down in peace, and sleep:", "for thou, Lord, only makest me dwell in safety.", "Peace", "The verse connects peaceful rest with trust in the Lord's keeping."],
  ["ctv-004", "Psalm 8:1", "Psalms", "O Lord our Lord, how excellent is thy name in all the earth!", "who hast set thy glory above the heavens.", "Praise", "The Psalm opens with praise for God's name and glory."],
  ["ctv-005", "Psalm 18:2", "Psalms", "The Lord is my rock, and my fortress, and my deliverer;", "my God, my strength, in whom I will trust; my buckler, and the horn of my salvation, and my high tower.", "Deliverance", "David piles up images of refuge to describe the Lord's protection."],
  ["ctv-006", "Psalm 19:1", "Psalms", "The heavens declare the glory of God;", "and the firmament sheweth his handywork.", "Creation", "Creation itself is presented as a witness to God's glory."],
  ["ctv-007", "Psalm 23:1", "Psalms", "The Lord is my shepherd;", "I shall not want.", "Shepherd / Guidance", "The shepherd image frames the Lord as provider and guide."],
  ["ctv-008", "Psalm 23:4", "Psalms", "Yea, though I walk through the valley of the shadow of death, I will fear no evil:", "for thou art with me; thy rod and thy staff they comfort me.", "Comfort", "The comfort comes from the Lord's presence in danger."],
  ["ctv-009", "Psalm 27:1", "Psalms", "The Lord is my light and my salvation; whom shall I fear?", "the Lord is the strength of my life; of whom shall I be afraid?", "Trust", "The Lord's strength answers fear."],
  ["ctv-010", "Psalm 34:8", "Psalms", "O taste and see that the Lord is good:", "blessed is the man that trusteth in him.", "Trust", "The verse invites personal trust in the Lord's goodness."],
  ["ctv-011", "Psalm 37:4", "Psalms", "Delight thyself also in the Lord;", "and he shall give thee the desires of thine heart.", "Trust", "Desires are framed by delighting in the Lord."],
  ["ctv-012", "Psalm 46:1", "Psalms", "God is our refuge and strength,", "a very present help in trouble.", "Protection", "The verse confesses God's nearness in trouble."],
  ["ctv-013", "Psalm 51:10", "Psalms", "Create in me a clean heart, O God;", "and renew a right spirit within me.", "Repentance", "David asks God for inward renewal."],
  ["ctv-014", "Psalm 56:3", "Psalms", "What time I am afraid,", "I will trust in thee.", "Trust", "Fear becomes the setting for trust."],
  ["ctv-015", "Psalm 91:1", "Psalms", "He that dwelleth in the secret place of the most High", "shall abide under the shadow of the Almighty.", "Protection", "The verse uses shelter imagery for God's protection."],
  ["ctv-016", "Psalm 100:4", "Psalms", "Enter into his gates with thanksgiving, and into his courts with praise:", "be thankful unto him, and bless his name.", "Thanksgiving", "Worship is marked by thanksgiving and blessing God's name."],
  ["ctv-017", "Psalm 103:1", "Psalms", "Bless the Lord, O my soul:", "and all that is within me, bless his holy name.", "Praise", "The Psalm calls the whole person to bless the Lord."],
  ["ctv-018", "Psalm 119:11", "Psalms", "Thy word have I hid in mine heart,", "that I might not sin against thee.", "God's Word", "Treasuring God's word is connected with holy living."],
  ["ctv-019", "Psalm 119:105", "Psalms", "Thy word is a lamp unto my feet,", "and a light unto my path.", "God's Word", "God's word is pictured as guidance for the path."],
  ["ctv-020", "Psalm 121:1-2", "Psalms", "I will lift up mine eyes unto the hills, from whence cometh my help.", "My help cometh from the Lord, which made heaven and earth.", "Help", "The Psalm identifies the Lord as the source of help."],
  ["ctv-021", "Proverbs 1:7", "Proverbs", "The fear of the Lord is the beginning of knowledge:", "but fools despise wisdom and instruction.", "Fear of the Lord", "Proverbs begins wisdom with reverence for the Lord."],
  ["ctv-022", "Proverbs 3:5-6", "Proverbs", "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", "In all thy ways acknowledge him, and he shall direct thy paths.", "Trust", "The proverb contrasts self-reliance with acknowledging the Lord."],
  ["ctv-023", "Proverbs 4:23", "Proverbs", "Keep thy heart with all diligence;", "for out of it are the issues of life.", "The Heart", "The heart is treated as the source from which life flows."],
  ["ctv-024", "Proverbs 15:1", "Proverbs", "A soft answer turneth away wrath:", "but grievous words stir up anger.", "Speech", "Gentle speech can turn away anger."],
  ["ctv-025", "Proverbs 18:10", "Proverbs", "The name of the Lord is a strong tower:", "the righteous runneth into it, and is safe.", "Protection", "The Lord's name is pictured as a place of safety."]
];

const ctvDistractors = [
  "but fools despise wisdom and instruction.",
  "and a light unto my path.",
  "a very present help in trouble.",
  "for out of it are the issues of life.",
  "the righteous runneth into it, and is safe.",
  "be thankful unto him, and bless his name.",
  "and renew a right spirit within me.",
  "I will trust in thee."
];

function choicesFor(correct, index, pool) {
  const choices = [correct];
  for (let offset = 0; choices.length < 4; offset += 1) {
    const option = pool[(index + offset) % pool.length];
    if (!choices.includes(option)) {
      choices.push(option);
    }
  }
  return choices;
}

const completeVerse = pack(
  "complete-the-verse",
  "Complete the Verse Challenge",
  10,
  "ctv-session-01",
  "Psalms and Proverbs Verse Endings",
  "Complete familiar KJV passages from Psalms and Proverbs.",
  completeVerseRounds.map(([id, reference, book, verseStart, correctEnding, theme, teachingNote], index) => ({
    id,
    title: reference,
    book,
    reference,
    verseStart,
    correctEnding,
    choices: choicesFor(correctEnding, index, ctvDistractors),
    theme,
    difficulty: difficulty(index),
    teachingNote
  }))
);

const wisdomData = [
  ["wm-001", "Proverbs 1:7", "The fear of the Lord is the beginning of knowledge: but fools despise wisdom and instruction.", "Fear of the Lord", "Reverence for the Lord is the starting point of biblical wisdom."],
  ["wm-002", "Proverbs 2:6", "For the Lord giveth wisdom: out of his mouth cometh knowledge and understanding.", "Wisdom", "Wisdom is received from the Lord."],
  ["wm-003", "Proverbs 3:5-6", "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", "Understanding", "The passage warns against depending only on one's own understanding."],
  ["wm-004", "Proverbs 4:7", "Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding.", "Understanding", "Wisdom and understanding are presented as things to pursue."],
  ["wm-005", "Proverbs 4:23", "Keep thy heart with all diligence; for out of it are the issues of life.", "The Heart", "The heart must be guarded because it shapes life."],
  ["wm-006", "Proverbs 6:6", "Go to the ant, thou sluggard; consider her ways, and be wise.", "Diligence", "The proverb rebukes laziness by pointing to steady work."],
  ["wm-007", "Proverbs 10:12", "Hatred stirreth up strifes: but love covereth all sins.", "Peace", "Love is contrasted with strife."],
  ["wm-008", "Proverbs 10:19", "In the multitude of words there wanteth not sin: but he that refraineth his lips is wise.", "Speech", "Wisdom includes restraint in speech."],
  ["wm-009", "Proverbs 11:14", "Where no counsel is, the people fall: but in the multitude of counsellors there is safety.", "Counsel", "Many counsellors provide safety."],
  ["wm-010", "Proverbs 11:25", "The liberal soul shall be made fat: and he that watereth shall be watered also himself.", "Generosity", "Generosity is pictured as fruitful refreshment."],
  ["wm-011", "Proverbs 12:22", "Lying lips are abomination to the Lord: but they that deal truly are his delight.", "Integrity", "Truthfulness is pleasing to the Lord."],
  ["wm-012", "Proverbs 13:20", "He that walketh with wise men shall be wise: but a companion of fools shall be destroyed.", "Friendship", "Companions shape a person's path."],
  ["wm-013", "Proverbs 14:12", "There is a way which seemeth right unto a man, but the end thereof are the ways of death.", "Foolishness", "A path can appear right while leading to death."],
  ["wm-014", "Proverbs 14:29", "He that is slow to wrath is of great understanding: but he that is hasty of spirit exalteth folly.", "Anger", "Patience with anger is tied to understanding."],
  ["wm-015", "Proverbs 15:1", "A soft answer turneth away wrath: but grievous words stir up anger.", "Speech", "Words can calm or inflame anger."],
  ["wm-016", "Proverbs 15:22", "Without counsel purposes are disappointed: but in the multitude of counsellors they are established.", "Counsel", "Plans are strengthened by counsel."],
  ["wm-017", "Proverbs 16:18", "Pride goeth before destruction, and an haughty spirit before a fall.", "Pride", "Pride is shown as a warning sign before ruin."],
  ["wm-018", "Proverbs 16:24", "Pleasant words are as an honeycomb, sweet to the soul, and health to the bones.", "Speech", "Gracious words bring sweetness and health."],
  ["wm-019", "Proverbs 17:17", "A friend loveth at all times, and a brother is born for adversity.", "Friendship", "Faithful friendship is steady in adversity."],
  ["wm-020", "Proverbs 18:10", "The name of the Lord is a strong tower: the righteous runneth into it, and is safe.", "Fear of the Lord", "The righteous find safety in the Lord's name."],
  ["wm-021", "Proverbs 18:21", "Death and life are in the power of the tongue: and they that love it shall eat the fruit thereof.", "Speech", "The tongue carries serious power."],
  ["wm-022", "Proverbs 19:17", "He that hath pity upon the poor lendeth unto the Lord; and that which he hath given will he pay him again.", "Generosity", "Mercy to the poor is treated as service to the Lord."],
  ["wm-023", "Proverbs 22:1", "A good name is rather to be chosen than great riches, and loving favour rather than silver and gold.", "Integrity", "Reputation is valued above wealth."],
  ["wm-024", "Proverbs 22:6", "Train up a child in the way he should go: and when he is old, he will not depart from it.", "Parents and Children", "The proverb speaks to parental formation and instruction."],
  ["wm-025", "Proverbs 27:17", "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.", "Friendship", "Wise friendship sharpens and strengthens."]
];

const wisdomThemes = ["Fear of the Lord", "Wisdom", "Understanding", "Speech", "Anger", "Pride", "Humility", "Diligence", "Slothfulness", "Friendship", "Correction", "Discipline", "Money", "Integrity", "Counsel", "Parents and Children", "The Heart", "Peace", "Generosity", "Foolishness"];

const wisdomMatch = pack(
  "wisdom-match",
  "Wisdom Match Challenge",
  10,
  "wm-session-01",
  "Proverbs Wisdom Themes",
  "Match Proverbs excerpts to wisdom themes.",
  wisdomData.map(([id, reference, verseTextShort, correctTheme, teachingNote], index) => ({
    id,
    title: reference,
    reference,
    verseTextShort,
    correctTheme,
    choices: choicesFor(correctTheme, index, wisdomThemes),
    difficulty: difficulty(index),
    teachingNote
  }))
);

const psalmThemeData = [
  ["pt-001", "Psalm 1:1-3", "Blessed is the man... he shall be like a tree planted by the rivers of water.", "Blessing", "Psalm 1 contrasts the blessed way with the way of the ungodly."],
  ["pt-002", "Psalm 8:1-4", "O Lord our Lord, how excellent is thy name in all the earth!", "Praise", "Psalm 8 praises God's majesty and mindful care."],
  ["pt-003", "Psalm 19:1", "The heavens declare the glory of God; and the firmament sheweth his handywork.", "Creation", "Creation witnesses to God's glory."],
  ["pt-004", "Psalm 19:7", "The law of the Lord is perfect, converting the soul.", "God's Word", "The Psalm turns from creation to the perfection of God's word."],
  ["pt-005", "Psalm 23:1-4", "The Lord is my shepherd; I shall not want.", "Shepherd / Guidance", "The Lord is pictured as shepherd, provider, and guide."],
  ["pt-006", "Psalm 24:1", "The earth is the Lord's, and the fulness thereof.", "God's Kingship", "The Psalm announces the Lord's ownership over creation."],
  ["pt-007", "Psalm 27:1", "The Lord is my light and my salvation; whom shall I fear?", "Trust", "The Lord's salvation becomes the ground of confidence."],
  ["pt-008", "Psalm 32:1", "Blessed is he whose transgression is forgiven, whose sin is covered.", "Repentance", "Forgiveness is the blessing at the center of the Psalm."],
  ["pt-009", "Psalm 34:1", "I will bless the Lord at all times: his praise shall continually be in my mouth.", "Praise", "The speaker commits to constant praise."],
  ["pt-010", "Psalm 34:8", "O taste and see that the Lord is good.", "Trust", "The excerpt invites trust in God's goodness."],
  ["pt-011", "Psalm 42:1", "As the hart panteth after the water brooks, so panteth my soul after thee, O God.", "Prayer", "The Psalm gives voice to deep longing for God."],
  ["pt-012", "Psalm 46:1", "God is our refuge and strength, a very present help in trouble.", "Protection", "God is confessed as refuge in trouble."],
  ["pt-013", "Psalm 51:10", "Create in me a clean heart, O God; and renew a right spirit within me.", "Repentance", "The prayer asks for cleansing and renewal."],
  ["pt-014", "Psalm 63:1", "O God, thou art my God; early will I seek thee.", "Prayer", "The Psalm expresses earnest seeking after God."],
  ["pt-015", "Psalm 91:1-2", "He is my refuge and my fortress: my God; in him will I trust.", "Protection", "The Psalm centers on shelter and trust."],
  ["pt-016", "Psalm 95:1-2", "O come, let us sing unto the Lord: let us make a joyful noise to the rock of our salvation.", "Worship", "The excerpt calls God's people to worship."],
  ["pt-017", "Psalm 100:1-4", "Enter into his gates with thanksgiving, and into his courts with praise.", "Thanksgiving", "Thanksgiving marks the approach to worship."],
  ["pt-018", "Psalm 103:1-2", "Bless the Lord, O my soul, and forget not all his benefits.", "Praise", "The Psalm calls the soul to remember and bless the Lord."],
  ["pt-019", "Psalm 107:1", "O give thanks unto the Lord, for he is good: for his mercy endureth for ever.", "Thanksgiving", "The verse gives thanks for enduring mercy."],
  ["pt-020", "Psalm 118:24", "This is the day which the Lord hath made; we will rejoice and be glad in it.", "Praise", "The day the Lord has made becomes a call to rejoice."],
  ["pt-021", "Psalm 119:11", "Thy word have I hid in mine heart, that I might not sin against thee.", "God's Word", "God's word is treasured in the heart."],
  ["pt-022", "Psalm 119:105", "Thy word is a lamp unto my feet, and a light unto my path.", "God's Word", "The word is pictured as guidance."],
  ["pt-023", "Psalm 121:1-2", "My help cometh from the Lord, which made heaven and earth.", "Deliverance", "Help comes from the maker of heaven and earth."],
  ["pt-024", "Psalm 139:14", "I will praise thee; for I am fearfully and wonderfully made.", "Creation", "Human life is received as God's wonderful work."],
  ["pt-025", "Psalm 150:6", "Let every thing that hath breath praise the Lord.", "Praise", "The Psalter closes with a universal call to praise."]
];

const psalmThemes = ["Praise", "Trust", "Lament", "Repentance", "Thanksgiving", "Creation", "Deliverance", "Protection", "Worship", "God's Word", "God's Kingship", "Shepherd / Guidance", "Justice", "Comfort", "Prayer", "Blessing"];

const psalmTheme = pack(
  "psalm-theme",
  "Psalm Theme Challenge",
  10,
  "pt-session-01",
  "Psalm Themes",
  "Identify major themes in short Psalm excerpts.",
  psalmThemeData.map(([id, reference, excerpt, correctTheme, teachingNote], index) => ({
    id,
    title: reference,
    reference,
    excerpt,
    correctTheme,
    choices: choicesFor(correctTheme, index, psalmThemes),
    difficulty: difficulty(index),
    teachingNote
  }))
);

const referenceFinderData = [
  ["prf-001", "Psalm 1:1", "Blessed is the man that walketh not in the counsel of the ungodly.", "Blessing", "This opening verse begins the Psalter's contrast between two ways."],
  ["prf-002", "Psalm 1:3", "He shall be like a tree planted by the rivers of water.", "Blessing", "The fruitful tree image belongs to Psalm 1."],
  ["prf-003", "Psalm 8:1", "O Lord our Lord, how excellent is thy name in all the earth!", "Praise", "Psalm 8 opens and closes with this praise."],
  ["prf-004", "Psalm 19:1", "The heavens declare the glory of God.", "Creation", "Psalm 19 begins with creation's testimony."],
  ["prf-005", "Psalm 19:14", "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight.", "Prayer", "This prayer closes Psalm 19."],
  ["prf-006", "Psalm 23:1", "The Lord is my shepherd; I shall not want.", "Shepherd / Guidance", "This is the opening line of Psalm 23."],
  ["prf-007", "Psalm 23:4", "Yea, though I walk through the valley of the shadow of death, I will fear no evil.", "Comfort", "The valley line is from Psalm 23."],
  ["prf-008", "Psalm 24:1", "The earth is the Lord's, and the fulness thereof.", "God's Kingship", "Psalm 24 declares the Lord's ownership."],
  ["prf-009", "Psalm 27:1", "The Lord is my light and my salvation; whom shall I fear?", "Trust", "Psalm 27 begins with fearless trust."],
  ["prf-010", "Psalm 34:8", "O taste and see that the Lord is good.", "Trust", "This invitation appears in Psalm 34."],
  ["prf-011", "Psalm 37:4", "Delight thyself also in the Lord.", "Trust", "Psalm 37 calls the faithful to delight in the Lord."],
  ["prf-012", "Psalm 46:1", "God is our refuge and strength, a very present help in trouble.", "Protection", "The refuge confession begins Psalm 46."],
  ["prf-013", "Psalm 51:10", "Create in me a clean heart, O God.", "Repentance", "This renewal prayer is from Psalm 51."],
  ["prf-014", "Psalm 56:3", "What time I am afraid, I will trust in thee.", "Trust", "Psalm 56 speaks trust in the face of fear."],
  ["prf-015", "Psalm 63:1", "O God, thou art my God; early will I seek thee.", "Prayer", "Psalm 63 begins with seeking God."],
  ["prf-016", "Psalm 91:1", "He that dwelleth in the secret place of the most High.", "Protection", "Psalm 91 opens with shelter in the Most High."],
  ["prf-017", "Psalm 95:6", "O come, let us worship and bow down.", "Worship", "Psalm 95 invites worship and kneeling before the Lord."],
  ["prf-018", "Psalm 100:4", "Enter into his gates with thanksgiving.", "Thanksgiving", "Psalm 100 calls worshipers into thanksgiving."],
  ["prf-019", "Psalm 103:1", "Bless the Lord, O my soul.", "Praise", "Psalm 103 begins with this call to the soul."],
  ["prf-020", "Psalm 107:1", "O give thanks unto the Lord, for he is good.", "Thanksgiving", "Psalm 107 opens with thanks for goodness and mercy."],
  ["prf-021", "Psalm 118:24", "This is the day which the Lord hath made.", "Praise", "Psalm 118 calls for rejoicing in the Lord's day."],
  ["prf-022", "Psalm 119:11", "Thy word have I hid in mine heart.", "God's Word", "Psalm 119 speaks of hiding the word in the heart."],
  ["prf-023", "Psalm 119:105", "Thy word is a lamp unto my feet.", "God's Word", "Psalm 119 uses lamp and light imagery for the word."],
  ["prf-024", "Psalm 121:1-2", "My help cometh from the Lord, which made heaven and earth.", "Deliverance", "Psalm 121 identifies the source of help."],
  ["prf-025", "Psalm 139:14", "I am fearfully and wonderfully made.", "Creation", "Psalm 139 praises God's work in forming life."]
];

const allPsalmReferences = referenceFinderData.map(([, reference]) => reference);

const psalmReferenceFinder = pack(
  "psalm-reference-finder",
  "Psalm Reference Finder",
  10,
  "prf-session-01",
  "Psalm Reference Finder",
  "Identify the Psalm reference for familiar KJV excerpts.",
  referenceFinderData.map(([id, correctReference, excerpt, theme, teachingNote], index) => ({
    id,
    title: correctReference,
    excerpt,
    correctReference,
    choices: choicesFor(correctReference, index, allPsalmReferences),
    theme,
    difficulty: difficulty(index),
    teachingNote
  }))
);

const categoryPool = {
  "Fear of the Lord": [
    ["Proverbs 1:7", "The fear of the Lord is the beginning of knowledge."],
    ["Proverbs 9:10", "The fear of the Lord is the beginning of wisdom."],
    ["Proverbs 14:27", "The fear of the Lord is a fountain of life."]
  ],
  "Wise Speech": [
    ["Proverbs 10:19", "He that refraineth his lips is wise."],
    ["Proverbs 15:1", "A soft answer turneth away wrath."],
    ["Proverbs 16:24", "Pleasant words are as an honeycomb."]
  ],
  "Anger and Self-Control": [
    ["Proverbs 14:29", "He that is slow to wrath is of great understanding."],
    ["Proverbs 16:32", "He that is slow to anger is better than the mighty."],
    ["Proverbs 29:11", "A fool uttereth all his mind."]
  ],
  "Pride and Humility": [
    ["Proverbs 16:18", "Pride goeth before destruction."],
    ["Proverbs 18:12", "Before honour is humility."],
    ["Proverbs 22:4", "By humility and the fear of the Lord are riches."]
  ],
  "Diligence and Laziness": [
    ["Proverbs 6:6", "Go to the ant, thou sluggard."],
    ["Proverbs 10:4", "The hand of the diligent maketh rich."],
    ["Proverbs 13:4", "The soul of the diligent shall be made fat."]
  ],
  "Friendship and Counsel": [
    ["Proverbs 11:14", "In the multitude of counsellors there is safety."],
    ["Proverbs 17:17", "A friend loveth at all times."],
    ["Proverbs 27:17", "Iron sharpeneth iron."]
  ],
  "Correction and Discipline": [
    ["Proverbs 12:1", "Whoso loveth instruction loveth knowledge."],
    ["Proverbs 13:24", "He that loveth him chasteneth him betimes."],
    ["Proverbs 19:18", "Chasten thy son while there is hope."]
  ],
  "Money and Generosity": [
    ["Proverbs 11:25", "The liberal soul shall be made fat."],
    ["Proverbs 19:17", "He that hath pity upon the poor lendeth unto the Lord."],
    ["Proverbs 22:1", "A good name is rather to be chosen than great riches."]
  ],
  "Integrity and Honesty": [
    ["Proverbs 10:9", "He that walketh uprightly walketh surely."],
    ["Proverbs 12:22", "Lying lips are abomination to the Lord."],
    ["Proverbs 20:7", "The just man walketh in his integrity."]
  ],
  "Parents and Children": [
    ["Proverbs 1:8", "My son, hear the instruction of thy father."],
    ["Proverbs 22:6", "Train up a child in the way he should go."],
    ["Proverbs 31:10", "Who can find a virtuous woman?"]
  ],
  "Wisdom and Understanding": [
    ["Proverbs 2:6", "For the Lord giveth wisdom."],
    ["Proverbs 3:5-6", "Trust in the Lord with all thine heart."],
    ["Proverbs 4:7", "Wisdom is the principal thing."]
  ],
  "The Heart": [
    ["Proverbs 4:23", "Keep thy heart with all diligence."],
    ["Proverbs 14:30", "A sound heart is the life of the flesh."],
    ["Proverbs 23:7", "For as he thinketh in his heart, so is he."]
  ],
  "Peace and Conflict": [
    ["Proverbs 10:12", "Hatred stirreth up strifes."],
    ["Proverbs 15:18", "A wrathful man stirreth up strife."],
    ["Proverbs 17:14", "The beginning of strife is as when one letteth out water."]
  ],
  "Foolishness": [
    ["Proverbs 12:15", "The way of a fool is right in his own eyes."],
    ["Proverbs 14:12", "There is a way which seemeth right unto a man."],
    ["Proverbs 26:4", "Answer not a fool according to his folly."]
  ],
  "Planning and Counsel": [
    ["Proverbs 15:22", "Without counsel purposes are disappointed."],
    ["Proverbs 16:3", "Commit thy works unto the Lord."],
    ["Proverbs 21:5", "The thoughts of the diligent tend only to plenteousness."]
  ]
};

const categoryNames = Object.keys(categoryPool);
const categoryRounds = Array.from({ length: 25 }, (_, sessionIndex) => {
  const categories = Array.from({ length: 5 }, (__, offset) => categoryNames[(sessionIndex + offset * 3) % categoryNames.length]);
  const cards = categories.flatMap((category, categoryIndex) =>
    categoryPool[category].map(([reference, textShort], cardIndex) => ({
      cardId: `pcv-s${String(sessionIndex + 1).padStart(2, "0")}-c${String(categoryIndex * 3 + cardIndex + 1).padStart(2, "0")}`,
      reference,
      textShort,
      category,
      difficulty: difficulty(categoryIndex * 3 + cardIndex),
      teachingNote: `This proverb belongs with ${category.toLowerCase()} because its wording centers on that wisdom theme.`
    }))
  );

  return {
    id: `pcv-${String(sessionIndex + 1).padStart(3, "0")}`,
    title: `Proverb Category Board ${String(sessionIndex + 1).padStart(2, "0")}`,
    theme: "Sorting Proverbs by wisdom category",
    difficulty: difficulty(sessionIndex),
    categories,
    cards,
    ...buildCategoryBoardStudyNote({ title: `Proverb Category Board ${String(sessionIndex + 1).padStart(2, "0")}`, categories, cards })
  };
});

const proverbCategories = {
  $schema: "./schemas/proverb-categories.schema.json",
  game: "proverb-categories",
  version: 1,
  displayName: "Proverb Categories Challenge",
  roundsPerSession: 1,
  sessions: [
    {
      id: "pcv-session-01",
      title: "Proverb Category Boards",
      theme: "Sort Proverbs cards into wisdom categories.",
      rounds: categoryRounds
    }
  ]
};

const schemas = {
  "complete-the-verse": basePackSchema("complete-the-verse", "Complete the Verse Challenge Pack", {
    type: "object",
    additionalProperties: false,
    required: ["id", "title", "book", "reference", "verseStart", "correctEnding", "choices", "theme", "difficulty", "teachingNote"],
    properties: {
      id: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
      book: { enum: ["Psalms", "Proverbs"] },
      reference: { type: "string", minLength: 1 },
      verseStart: { type: "string", minLength: 1 },
      correctEnding: { type: "string", minLength: 1 },
      choices: fourChoices,
      theme: { type: "string", minLength: 1 },
      difficulty: difficultySchema,
      teachingNote: { type: "string", minLength: 1 }
    }
  }),
  "wisdom-match": basePackSchema("wisdom-match", "Wisdom Match Challenge Pack", {
    type: "object",
    additionalProperties: false,
    required: ["id", "title", "reference", "verseTextShort", "correctTheme", "choices", "difficulty", "teachingNote"],
    properties: {
      id: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
      reference: { type: "string", minLength: 1 },
      verseTextShort: { type: "string", minLength: 1 },
      correctTheme: { type: "string", minLength: 1 },
      choices: fourChoices,
      difficulty: difficultySchema,
      teachingNote: { type: "string", minLength: 1 }
    }
  }),
  "psalm-theme": basePackSchema("psalm-theme", "Psalm Theme Challenge Pack", {
    type: "object",
    additionalProperties: false,
    required: ["id", "title", "reference", "excerpt", "correctTheme", "choices", "difficulty", "teachingNote"],
    properties: {
      id: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
      reference: { type: "string", minLength: 1 },
      excerpt: { type: "string", minLength: 1 },
      correctTheme: { type: "string", minLength: 1 },
      choices: fourChoices,
      difficulty: difficultySchema,
      teachingNote: { type: "string", minLength: 1 }
    }
  }),
  "psalm-reference-finder": basePackSchema("psalm-reference-finder", "Psalm Reference Finder Pack", {
    type: "object",
    additionalProperties: false,
    required: ["id", "title", "excerpt", "correctReference", "choices", "theme", "difficulty", "teachingNote"],
    properties: {
      id: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
      excerpt: { type: "string", minLength: 1 },
      correctReference: { type: "string", minLength: 1 },
      choices: fourChoices,
      theme: { type: "string", minLength: 1 },
      difficulty: difficultySchema,
      teachingNote: { type: "string", minLength: 1 }
    }
  }),
  "proverb-categories": basePackSchema("proverb-categories", "Proverb Categories Challenge Pack", {
    type: "object",
    additionalProperties: false,
    required: ["id", "title", "theme", "categories", "cards", "difficulty", "teachingNote"],
    properties: {
      id: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
      theme: { type: "string", minLength: 1 },
      difficulty: difficultySchema,
      scriptureReference: { type: "string", minLength: 1 },
      teachingNote: { type: "string", minLength: 1 },
      categories: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        uniqueItems: true,
        items: { type: "string", minLength: 1 }
      },
      cards: {
        type: "array",
        minItems: 15,
        maxItems: 25,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["cardId", "reference", "textShort", "category", "difficulty", "teachingNote"],
          properties: {
            cardId: { type: "string", pattern: "^[a-z0-9-]+$" },
            reference: { type: "string", minLength: 1 },
            textShort: { type: "string", minLength: 1 },
            category: { type: "string", minLength: 1 },
            difficulty: difficultySchema,
            teachingNote: { type: "string", minLength: 1 }
          }
        }
      }
    }
  })
};

const dataFiles = {
  "complete-the-verse": completeVerse,
  "wisdom-match": wisdomMatch,
  "psalm-theme": psalmTheme,
  "proverb-categories": proverbCategories,
  "psalm-reference-finder": psalmReferenceFinder
};

for (const [game, contents] of Object.entries(dataFiles)) {
  await writeFile(path.join(dataDir, `${game}.json`), `${JSON.stringify(contents, null, 2)}\n`);
}

for (const [game, schema] of Object.entries(schemas)) {
  await writeFile(path.join(schemaDir, `${game}.schema.json`), `${JSON.stringify(schema, null, 2)}\n`);
}

console.log("Created Psalms and Proverbs challenge data and schemas.");
