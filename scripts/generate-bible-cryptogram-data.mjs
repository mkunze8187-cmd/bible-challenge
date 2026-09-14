import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const ROUNDS_PER_SESSION = 25;

// Bible Cryptogram's content deliberately spans three lengths tied to difficulty, per the
// user's own spec: easy entries are short names/titles (as little as two words), medium
// entries are short phrases, and hard entries are longer verse-like text (up to roughly
// 15-20 words) — not a single fixed "one verse per round" shape like most other games'
// pools. The substitution cipher itself is generated at runtime (see buildCipherMap /
// createBibleCryptogramPrompt in src/lib/gameEngine.ts), never stored here, the same way
// Bible Anagrams shuffles its tiles and Word Ladder validates against a runtime
// dictionary rather than authored data.
const entries = [
  // Easy — short names/titles (2-3 words)
  { reference: "Exodus 3:14", theme: "God's names", difficulty: "easy", verseText: "I AM THAT I AM" },
  { reference: "1 Samuel 17:45", theme: "David and Goliath", difficulty: "easy", verseText: "THE LORD OF HOSTS" },
  { reference: "John 1:29", theme: "Titles of Jesus", difficulty: "easy", verseText: "THE LAMB OF GOD" },
  { reference: "John 10:11", theme: "Titles of Jesus", difficulty: "easy", verseText: "THE GOOD SHEPHERD" },
  { reference: "Isaiah 9:6", theme: "Titles of Jesus", difficulty: "easy", verseText: "THE PRINCE OF PEACE" },
  { reference: "1 Samuel 16:13", theme: "Kings of Israel", difficulty: "easy", verseText: "KING DAVID" },
  { reference: "1 Kings 3:12", theme: "Kings of Israel", difficulty: "easy", verseText: "KING SOLOMON" },
  { reference: "Matthew 2:1", theme: "Kings of Israel", difficulty: "easy", verseText: "KING HEROD" },
  { reference: "Revelation 19:16", theme: "Titles of Jesus", difficulty: "easy", verseText: "KING OF KINGS" },
  { reference: "John 8:12", theme: "Titles of Jesus", difficulty: "easy", verseText: "THE LIGHT OF THE WORLD" },
  { reference: "John 14:6", theme: "Titles of Jesus", difficulty: "easy", verseText: "THE WAY THE TRUTH THE LIFE" },
  { reference: "John 6:35", theme: "Titles of Jesus", difficulty: "easy", verseText: "THE BREAD OF LIFE" },
  { reference: "Genesis 1:1", theme: "Creation", difficulty: "easy", verseText: "GOD CREATED THE HEAVEN" },
  { reference: "Genesis 6:9", theme: "The flood", difficulty: "easy", verseText: "NOAH AND THE ARK" },
  { reference: "Exodus 14:21", theme: "The exodus", difficulty: "easy", verseText: "MOSES AND THE RED SEA" },
  { reference: "Daniel 6:16", theme: "Daniel", difficulty: "easy", verseText: "DANIEL IN THE LIONS DEN" },
  { reference: "Jonah 1:17", theme: "Jonah", difficulty: "easy", verseText: "JONAH AND THE GREAT FISH" },
  { reference: "Judges 16:19", theme: "Judges", difficulty: "easy", verseText: "SAMSON AND DELILAH" },
  { reference: "Ruth 1:16", theme: "Ruth", difficulty: "easy", verseText: "RUTH AND NAOMI" },
  { reference: "Esther 4:14", theme: "Esther", difficulty: "easy", verseText: "QUEEN ESTHER" },
  { reference: "Luke 2:7", theme: "The nativity", difficulty: "easy", verseText: "THE BIRTH OF JESUS" },
  { reference: "Matthew 28:6", theme: "The resurrection", difficulty: "easy", verseText: "HE IS RISEN" },
  { reference: "Acts 9:3", theme: "Paul's conversion", difficulty: "easy", verseText: "SAUL OF TARSUS" },
  { reference: "Genesis 37:28", theme: "Joseph", difficulty: "easy", verseText: "JOSEPH AND HIS BROTHERS" },
  { reference: "1 Kings 18:38", theme: "Elijah", difficulty: "easy", verseText: "ELIJAH THE PROPHET" },

  // Medium — short phrases (roughly 5-9 words)
  { reference: "Genesis 1:3", theme: "Creation", difficulty: "medium", verseText: "AND GOD SAID LET THERE BE LIGHT" },
  { reference: "Joshua 1:9", theme: "Courage", difficulty: "medium", verseText: "BE STRONG AND OF A GOOD COURAGE" },
  { reference: "Psalm 23:1", theme: "God's provision", difficulty: "medium", verseText: "THE LORD IS MY SHEPHERD I SHALL NOT WANT" },
  { reference: "Psalm 46:1", theme: "God's protection", difficulty: "medium", verseText: "GOD IS OUR REFUGE AND STRENGTH" },
  { reference: "Proverbs 3:5", theme: "Trust in God", difficulty: "medium", verseText: "TRUST IN THE LORD WITH ALL THINE HEART" },
  { reference: "Isaiah 40:31", theme: "Renewed strength", difficulty: "medium", verseText: "THEY SHALL MOUNT UP WITH WINGS AS EAGLES" },
  { reference: "Jeremiah 29:11", theme: "God's plans", difficulty: "medium", verseText: "I KNOW THE THOUGHTS THAT I THINK TOWARD YOU" },
  { reference: "Matthew 5:9", theme: "The beatitudes", difficulty: "medium", verseText: "BLESSED ARE THE PEACEMAKERS" },
  { reference: "Matthew 6:33", theme: "Seeking God first", difficulty: "medium", verseText: "SEEK YE FIRST THE KINGDOM OF GOD" },
  { reference: "Matthew 11:28", theme: "Rest in Christ", difficulty: "medium", verseText: "COME UNTO ME ALL YE THAT LABOUR" },
  { reference: "Mark 12:30", theme: "The greatest commandment", difficulty: "medium", verseText: "THOU SHALT LOVE THE LORD THY GOD" },
  { reference: "John 3:16", theme: "God's love", difficulty: "medium", verseText: "FOR GOD SO LOVED THE WORLD" },
  { reference: "John 13:34", theme: "Love one another", difficulty: "medium", verseText: "A NEW COMMANDMENT I GIVE UNTO YOU" },
  { reference: "Romans 8:28", theme: "God's purpose", difficulty: "medium", verseText: "ALL THINGS WORK TOGETHER FOR GOOD" },
  { reference: "Romans 10:9", theme: "Salvation", difficulty: "medium", verseText: "CONFESS WITH THY MOUTH THE LORD JESUS" },
  { reference: "1 Corinthians 13:13", theme: "Faith hope love", difficulty: "medium", verseText: "NOW ABIDETH FAITH HOPE CHARITY THESE THREE" },
  { reference: "2 Corinthians 5:17", theme: "New creation", difficulty: "medium", verseText: "IF ANY MAN BE IN CHRIST HE IS A NEW CREATURE" },
  { reference: "Galatians 5:22", theme: "Fruit of the Spirit", difficulty: "medium", verseText: "THE FRUIT OF THE SPIRIT IS LOVE JOY PEACE" },
  { reference: "Ephesians 2:8", theme: "Grace and faith", difficulty: "medium", verseText: "BY GRACE ARE YE SAVED THROUGH FAITH" },
  { reference: "Philippians 4:13", theme: "Strength in Christ", difficulty: "medium", verseText: "I CAN DO ALL THINGS THROUGH CHRIST" },
  { reference: "Philippians 4:6", theme: "Anxiety and prayer", difficulty: "medium", verseText: "BE CAREFUL FOR NOTHING BUT IN EVERY THING BY PRAYER" },
  { reference: "Colossians 3:23", theme: "Working for the Lord", difficulty: "medium", verseText: "WHATSOEVER YE DO DO IT HEARTILY AS TO THE LORD" },
  { reference: "2 Timothy 1:7", theme: "Power and love", difficulty: "medium", verseText: "GOD HATH NOT GIVEN US THE SPIRIT OF FEAR" },
  { reference: "Hebrews 11:1", theme: "Faith", difficulty: "medium", verseText: "FAITH IS THE SUBSTANCE OF THINGS HOPED FOR" },
  { reference: "James 1:17", theme: "Good gifts", difficulty: "medium", verseText: "EVERY GOOD GIFT AND EVERY PERFECT GIFT IS FROM ABOVE" },
  { reference: "1 Peter 5:7", theme: "Casting cares on God", difficulty: "medium", verseText: "CASTING ALL YOUR CARE UPON HIM FOR HE CARETH FOR YOU" },
  { reference: "1 John 4:8", theme: "God is love", difficulty: "medium", verseText: "HE THAT LOVETH NOT KNOWETH NOT GOD FOR GOD IS LOVE" },

  // Hard — longer verse-like text (roughly 15-20 words)
  {
    reference: "Psalm 100:1-2",
    theme: "Praise and thanksgiving",
    difficulty: "hard",
    verseText: "MAKE A JOYFUL NOISE UNTO THE LORD ALL YE LANDS SERVE THE LORD WITH GLADNESS COME BEFORE HIS PRESENCE WITH SINGING"
  },
  {
    reference: "Isaiah 40:28-29",
    theme: "God's everlasting strength",
    difficulty: "hard",
    verseText: "THE EVERLASTING GOD THE LORD FAINTETH NOT NEITHER IS WEARY HE GIVETH POWER TO THE FAINT AND TO THEM THAT HAVE NO MIGHT HE INCREASETH STRENGTH"
  },
  {
    reference: "Joshua 24:15",
    theme: "Choosing to serve God",
    difficulty: "hard",
    verseText: "CHOOSE YOU THIS DAY WHOM YE WILL SERVE BUT AS FOR ME AND MY HOUSE WE WILL SERVE THE LORD"
  },
  {
    reference: "Romans 12:1-2",
    theme: "Living sacrifice",
    difficulty: "hard",
    verseText: "PRESENT YOUR BODIES A LIVING SACRIFICE HOLY ACCEPTABLE UNTO GOD AND BE NOT CONFORMED TO THIS WORLD BUT BE YE TRANSFORMED"
  },
  {
    reference: "Micah 6:8",
    theme: "What God requires",
    difficulty: "hard",
    verseText: "HE HATH SHEWED THEE O MAN WHAT IS GOOD AND WHAT DOTH THE LORD REQUIRE OF THEE BUT TO DO JUSTLY AND TO LOVE MERCY"
  },
  {
    reference: "Psalm 121:1-2",
    theme: "Help from the Lord",
    difficulty: "hard",
    verseText: "I WILL LIFT UP MINE EYES UNTO THE HILLS FROM WHENCE COMETH MY HELP MY HELP COMETH FROM THE LORD"
  },
  {
    reference: "Deuteronomy 31:6",
    theme: "Courage and God's presence",
    difficulty: "hard",
    verseText: "BE STRONG AND OF A GOOD COURAGE FEAR NOT NOR BE AFRAID FOR THE LORD THY GOD HE IT IS THAT DOTH GO WITH THEE"
  },
  {
    reference: "Matthew 28:19-20",
    theme: "The great commission",
    difficulty: "hard",
    verseText: "GO YE THEREFORE AND TEACH ALL NATIONS BAPTIZING THEM IN THE NAME OF THE FATHER AND OF THE SON AND OF THE HOLY GHOST"
  },
  {
    reference: "Ephesians 6:11-12",
    theme: "The armor of God",
    difficulty: "hard",
    verseText: "PUT ON THE WHOLE ARMOUR OF GOD THAT YE MAY BE ABLE TO STAND AGAINST THE WILES OF THE DEVIL"
  },
  {
    reference: "Isaiah 53:5",
    theme: "The suffering servant",
    difficulty: "hard",
    verseText: "HE WAS WOUNDED FOR OUR TRANSGRESSIONS HE WAS BRUISED FOR OUR INIQUITIES THE CHASTISEMENT OF OUR PEACE WAS UPON HIM"
  }
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const rounds = entries.map((entry, index) => ({
  id: `bc-r${(index + 1).toString().padStart(3, "0")}-${slugify(entry.reference)}`,
  reference: entry.reference,
  sourceTranslation: "KJV",
  theme: entry.theme,
  verseText: entry.verseText,
  difficulty: entry.difficulty,
  teachingNote: `Review ${entry.reference} (${entry.theme}) before continuing.`
}));

const sessions = [];
for (let index = 0; index < rounds.length; index += ROUNDS_PER_SESSION) {
  const sessionNumber = Math.floor(index / ROUNDS_PER_SESSION) + 1;
  const chunk = rounds.slice(index, index + ROUNDS_PER_SESSION);

  if (chunk.length < 1) {
    break;
  }

  sessions.push({
    id: `bc-session-${sessionNumber.toString().padStart(2, "0")}`,
    title: `Bible Cryptogram Deck ${sessionNumber}`,
    theme: "Bible names, phrases, and short verses",
    rounds: chunk
  });
}

const pack = {
  $schema: "https://example.local/schemas/bible-cryptogram.schema.json",
  game: "bible-cryptogram",
  version: 1,
  displayName: "Bible Cryptogram",
  roundsPerSession: ROUNDS_PER_SESSION,
  sessions
};

await mkdir(dataDir, { recursive: true });
await writeFile(path.join(dataDir, "bible-cryptogram.json"), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(`Generated bible-cryptogram.json with ${sessions.length} sessions (${rounds.length} rounds).`);
