import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

function chunkSessions(prefix, titlePrefix, theme, rounds, chunkSize) {
  const sessions = [];

  for (let index = 0; index < rounds.length; index += chunkSize) {
    const sessionNumber = Math.floor(index / chunkSize) + 1;
    sessions.push({
      id: `${prefix}-session-${sessionNumber.toString().padStart(2, "0")}`,
      title: `${titlePrefix} ${sessionNumber}`,
      theme,
      rounds: rounds.slice(index, index + chunkSize)
    });
  }

  return sessions;
}

function event(id, label, order, clue) {
  return { id, label, order, clue };
}

const timelineRounds = [
  {
    id: "bt-r01",
    prompt: "Put these early Genesis events in order.",
    events: [
      event("bt-r01-e01", "Creation", 1, "The opening event of Scripture."),
      event("bt-r01-e02", "Fall in Eden", 2, "Sin enters the human story."),
      event("bt-r01-e03", "Noah builds the ark", 3, "A flood judgment is coming."),
      event("bt-r01-e04", "Tower of Babel", 4, "Languages are confused."),
      event("bt-r01-e05", "Abram called", 5, "A family promise begins.")
    ]
  },
  {
    id: "bt-r02",
    prompt: "Arrange these Abraham and Joseph events.",
    events: [
      event("bt-r02-e01", "Abram enters Canaan", 1),
      event("bt-r02-e02", "Isaac is born", 2),
      event("bt-r02-e03", "Jacob receives blessing", 3),
      event("bt-r02-e04", "Joseph sold", 4),
      event("bt-r02-e05", "Israel moves to Egypt", 5)
    ]
  },
  {
    id: "bt-r03",
    prompt: "Arrange these Exodus and wilderness events.",
    events: [
      event("bt-r03-e01", "Moses at burning bush", 1),
      event("bt-r03-e02", "Plagues in Egypt", 2),
      event("bt-r03-e03", "Passover night", 3),
      event("bt-r03-e04", "Red Sea crossing", 4),
      event("bt-r03-e05", "Law given at Sinai", 5),
      event("bt-r03-e06", "Spies enter Canaan", 6)
    ]
  },
  {
    id: "bt-r04",
    prompt: "Place these conquest and judges events.",
    events: [
      event("bt-r04-e01", "Jordan River crossed", 1),
      event("bt-r04-e02", "Jericho falls", 2),
      event("bt-r04-e03", "Deborah judges Israel", 3),
      event("bt-r04-e04", "Gideon defeats Midian", 4),
      event("bt-r04-e05", "Samson faces Philistines", 5),
      event("bt-r04-e06", "Ruth meets Boaz", 6)
    ]
  },
  {
    id: "bt-r05",
    prompt: "Order these early kingdom events.",
    events: [
      event("bt-r05-e01", "Samuel hears God", 1),
      event("bt-r05-e02", "Saul becomes king", 2),
      event("bt-r05-e03", "David defeats Goliath", 3),
      event("bt-r05-e04", "David becomes king", 4),
      event("bt-r05-e05", "Solomon builds temple", 5)
    ]
  },
  {
    id: "bt-r06",
    prompt: "Arrange these divided kingdom and exile events.",
    events: [
      event("bt-r06-e01", "Kingdom divides", 1),
      event("bt-r06-e02", "Elijah at Carmel", 2),
      event("bt-r06-e03", "Israel falls to Assyria", 3),
      event("bt-r06-e04", "Judah falls to Babylon", 4),
      event("bt-r06-e05", "Daniel in Babylon", 5),
      event("bt-r06-e06", "Jews return from exile", 6)
    ]
  },
  {
    id: "bt-r07",
    prompt: "Order these post-exile events.",
    events: [
      event("bt-r07-e01", "Temple rebuilding begins", 1),
      event("bt-r07-e02", "Esther becomes queen", 2),
      event("bt-r07-e03", "Ezra teaches the law", 3),
      event("bt-r07-e04", "Nehemiah rebuilds walls", 4),
      event("bt-r07-e05", "Malachi prophesies", 5)
    ]
  },
  {
    id: "bt-r08",
    prompt: "Arrange these events from Jesus' life.",
    events: [
      event("bt-r08-e01", "Jesus is born", 1),
      event("bt-r08-e02", "Jesus is baptized", 2),
      event("bt-r08-e03", "Sermon on the Mount", 3),
      event("bt-r08-e04", "Triumphal entry", 4),
      event("bt-r08-e05", "Crucifixion", 5),
      event("bt-r08-e06", "Resurrection", 6)
    ]
  },
  {
    id: "bt-r09",
    prompt: "Put these Acts events in order.",
    events: [
      event("bt-r09-e01", "Pentecost", 1),
      event("bt-r09-e02", "Stephen martyred", 2),
      event("bt-r09-e03", "Saul converted", 3),
      event("bt-r09-e04", "Peter visits Cornelius", 4),
      event("bt-r09-e05", "Paul's first journey", 5),
      event("bt-r09-e06", "Paul reaches Rome", 6)
    ]
  },
  {
    id: "bt-r10",
    prompt: "Arrange these broad Bible eras.",
    events: [
      event("bt-r10-e01", "Patriarchs", 1),
      event("bt-r10-e02", "Exodus", 2),
      event("bt-r10-e03", "Conquest", 3),
      event("bt-r10-e04", "United Kingdom", 4),
      event("bt-r10-e05", "Exile", 5),
      event("bt-r10-e06", "Jesus' ministry", 6),
      event("bt-r10-e07", "Early church", 7)
    ]
  }
];

const scripture = JSON.parse(await readFile(path.join(dataDir, "scripture-puzzles.json"), "utf8"));
const verseRounds = scripture.sessions
  .flatMap((session) => session.rounds)
  .filter((round) => round.sourceTranslation === "KJV" && round.verseText && round.verseText.length <= 130)
  .slice(0, 10)
  .map((round, index) => ({
    id: `vs-r${(index + 1).toString().padStart(2, "0")}`,
    reference: round.reference,
    referenceAliases: round.referenceAliases,
    sourceTranslation: "KJV",
    theme: round.theme,
    verseText: round.verseText
  }));

const connectionsRounds = [
  {
    id: "bc-r01",
    title: "Early Bible Sets",
    groups: [
      { id: "bc-r01-g01", category: "Patriarchs", items: ["Abraham", "Isaac", "Jacob", "Joseph"] },
      { id: "bc-r01-g02", category: "Creation Days", items: ["Light", "Sky", "Land", "Stars"] },
      { id: "bc-r01-g03", category: "Ark Items", items: ["Gopher wood", "Door", "Window", "Pitch"] },
      { id: "bc-r01-g04", category: "Egypt Plagues", items: ["Frogs", "Lice", "Boils", "Hail"] }
    ]
  },
  {
    id: "bc-r02",
    title: "Wilderness And Conquest",
    groups: [
      { id: "bc-r02-g01", category: "Tabernacle Items", items: ["Lampstand", "Altar", "Ark", "Veil"] },
      { id: "bc-r02-g02", category: "Moses Family", items: ["Amram", "Jochebed", "Aaron", "Miriam"] },
      { id: "bc-r02-g03", category: "Spies", items: ["Joshua", "Caleb", "Shammua", "Shaphat"] },
      { id: "bc-r02-g04", category: "Promised Land Places", items: ["Jericho", "Ai", "Gilgal", "Shiloh"] }
    ]
  },
  {
    id: "bc-r03",
    title: "Kings And Prophets",
    groups: [
      { id: "bc-r03-g01", category: "United Kings", items: ["Saul", "David", "Solomon", "Rehoboam"] },
      { id: "bc-r03-g02", category: "Prophets", items: ["Elijah", "Elisha", "Isaiah", "Jeremiah"] },
      { id: "bc-r03-g03", category: "David Stories", items: ["Goliath", "Bathsheba", "Absalom", "Nathan"] },
      { id: "bc-r03-g04", category: "Exile Figures", items: ["Daniel", "Shadrach", "Meshach", "Abednego"] }
    ]
  },
  {
    id: "bc-r04",
    title: "Gospel Groups",
    groups: [
      { id: "bc-r04-g01", category: "Gospel Writers", items: ["Matthew", "Mark", "Luke", "John"] },
      { id: "bc-r04-g02", category: "Disciples", items: ["Peter", "Andrew", "James", "Philip"] },
      { id: "bc-r04-g03", category: "Parables", items: ["Sower", "Talents", "Mustard Seed", "Prodigal Son"] },
      { id: "bc-r04-g04", category: "Miracles", items: ["Water to wine", "Blind man", "Lazarus", "Storm calmed"] }
    ]
  },
  {
    id: "bc-r05",
    title: "Early Church",
    groups: [
      { id: "bc-r05-g01", category: "Acts Cities", items: ["Jerusalem", "Antioch", "Philippi", "Rome"] },
      { id: "bc-r05-g02", category: "Paul Letters", items: ["Romans", "Galatians", "Ephesians", "Philippians"] },
      { id: "bc-r05-g03", category: "Pastoral Letters", items: ["1 Timothy", "2 Timothy", "Titus", "Philemon"] },
      { id: "bc-r05-g04", category: "Fruit of Spirit", items: ["Love", "Joy", "Peace", "Patience"] }
    ]
  },
  {
    id: "bc-r06",
    title: "Bible Places",
    groups: [
      { id: "bc-r06-g01", category: "Mountains", items: ["Sinai", "Carmel", "Zion", "Olives"] },
      { id: "bc-r06-g02", category: "Rivers And Waters", items: ["Jordan", "Nile", "Red Sea", "Galilee"] },
      { id: "bc-r06-g03", category: "Cities", items: ["Bethlehem", "Nazareth", "Capernaum", "Bethany"] },
      { id: "bc-r06-g04", category: "Empires", items: ["Egypt", "Assyria", "Babylon", "Rome"] }
    ]
  }
];

const nameThatBookRounds = [
  ["ntb-r01", "Genesis", "Old Testament", "Law", ["Genesis", "Gen"], ["This book opens the Bible.", "It includes beginnings, families, and promises.", "It includes Abraham, Isaac, Jacob, and Joseph.", "It ends with Israel's family in Egypt.", "It begins with creation."]],
  ["ntb-r02", "Exodus", "Old Testament", "Law", ["Exodus", "Exod"], ["This book includes slavery and rescue.", "A reluctant leader confronts Pharaoh.", "It includes plagues and wilderness travel.", "The law is given at Sinai.", "Israel leaves Egypt in this book."]],
  ["ntb-r03", "Joshua", "Old Testament", "History", ["Joshua", "Josh"], ["This book follows Moses' death.", "It focuses on entering the promised land.", "It includes crossing the Jordan.", "Jericho falls in this book.", "Its title is Israel's conquest leader."]],
  ["ntb-r04", "Ruth", "Old Testament", "History", ["Ruth"], ["This short book takes place during the judges.", "It includes grief, loyalty, and harvest fields.", "Naomi and Boaz are major figures.", "It connects to David's family line.", "Its title is a Moabite woman."]],
  ["ntb-r05", "1 Samuel", "Old Testament", "History", ["1 Samuel", "First Samuel", "1 Sam"], ["This book begins with a prayed-for child.", "It moves Israel toward monarchy.", "Saul becomes king in this book.", "David defeats Goliath here.", "Its title names the prophet who anoints kings."]],
  ["ntb-r06", "Psalms", "Old Testament", "Wisdom", ["Psalms", "Psalm", "Ps"], ["This book is poetic and worshipful.", "It includes lament, praise, and thanksgiving.", "Many entries are linked with David.", "It is the Bible's largest book.", "Its title names sacred songs."]],
  ["ntb-r07", "Proverbs", "Old Testament", "Wisdom", ["Proverbs", "Prov"], ["This book teaches practical wisdom.", "It contrasts wise and foolish living.", "It often uses short memorable sayings.", "Solomon is closely associated with it.", "Its title means compact wise sayings."]],
  ["ntb-r08", "Isaiah", "Old Testament", "Prophets", ["Isaiah", "Isa"], ["This prophetic book is large.", "It speaks judgment and hope.", "It includes servant passages.", "It says unto us a child is born.", "Its title names a major prophet."]],
  ["ntb-r09", "Daniel", "Old Testament", "Prophets", ["Daniel", "Dan"], ["This book is set largely in exile.", "It includes dreams and kingdoms.", "It includes a fiery furnace.", "It includes a lions' den.", "Its title names the faithful exile."]],
  ["ntb-r10", "Jonah", "Old Testament", "Prophets", ["Jonah"], ["This short prophetic book involves flight.", "It includes a storm at sea.", "It includes Nineveh.", "A great fish appears in it.", "Its title names the fleeing prophet."]],
  ["ntb-r11", "Matthew", "New Testament", "Gospel", ["Matthew", "Matt"], ["This Gospel often points to fulfilled Scripture.", "It includes a genealogy from Abraham and David.", "It contains the Sermon on the Mount.", "It ends with the Great Commission.", "Its title names a tax collector disciple."]],
  ["ntb-r12", "Mark", "New Testament", "Gospel", ["Mark", "Mk"], ["This Gospel moves quickly.", "It emphasizes action and service.", "It is the shortest Gospel.", "It opens with John the Baptist's ministry.", "Its title is also John Mark's name."]],
  ["ntb-r13", "Luke", "New Testament", "Gospel", ["Luke", "Lk"], ["This Gospel has careful historical framing.", "It highlights outsiders and the poor.", "It includes the Good Samaritan.", "It has a sequel in Acts.", "Its title names a physician companion of Paul."]],
  ["ntb-r14", "John", "New Testament", "Gospel", ["John", "Jn"], ["This Gospel has long conversations with Jesus.", "It includes seven sign-like miracles.", "It opens with the Word.", "It includes Nicodemus and Lazarus.", "Its title names the beloved disciple."]],
  ["ntb-r15", "Acts", "New Testament", "History", ["Acts", "Acts of the Apostles"], ["This book follows a Gospel sequel.", "It starts in Jerusalem.", "Pentecost happens here.", "Paul's journeys fill much of it.", "Its title names the apostles' activity."]],
  ["ntb-r16", "Romans", "New Testament", "Letter", ["Romans", "Rom"], ["This letter is written to believers in an imperial city.", "It explains sin, grace, and faith.", "It includes Abraham as an example of faith.", "It says all have sinned.", "Its title names Christians in Rome."]],
  ["ntb-r17", "1 Corinthians", "New Testament", "Letter", ["1 Corinthians", "First Corinthians", "1 Cor"], ["This letter addresses a divided church.", "It discusses spiritual gifts.", "It includes the love chapter.", "It teaches about resurrection.", "Its title names believers in Corinth."]],
  ["ntb-r18", "Ephesians", "New Testament", "Letter", ["Ephesians", "Eph"], ["This letter speaks about grace and unity.", "It uses body and temple images.", "It includes armor of God language.", "It says salvation is by grace through faith.", "Its title names believers in Ephesus."]],
  ["ntb-r19", "Hebrews", "New Testament", "Letter", ["Hebrews", "Heb"], ["This book emphasizes Jesus' superiority.", "It compares old covenant patterns with Christ.", "It includes a faith hall of witnesses.", "It speaks often about priesthood.", "Its title names Jewish-background believers."]],
  ["ntb-r20", "Revelation", "New Testament", "Prophecy", ["Revelation", "Rev", "Apocalypse"], ["This book is apocalyptic.", "It includes letters to seven churches.", "It uses vivid visions and symbols.", "It ends with a new heaven and new earth.", "Its title means unveiling."]]
].map(([id, book, testament, category, aliases, clues]) => ({ id, book, testament, category, aliases, clues }));

const beforeAfterRounds = [
  ["boa-r01", "Noah builds the ark", "Abram leaves Haran", "left", "Noah's flood story comes before the call of Abram.", "Genesis"],
  ["boa-r02", "Joseph is sold by his brothers", "Moses sees the burning bush", "left", "Joseph's story explains Israel's move to Egypt before Moses is called.", "Exodus setup"],
  ["boa-r03", "The Passover night", "The Red Sea crossing", "left", "Passover happens before Israel reaches and crosses the sea.", "Deliverance"],
  ["boa-r04", "The law is given at Sinai", "The spies enter Canaan", "left", "Sinai comes before the wilderness spy mission.", "Wilderness"],
  ["boa-r05", "Jericho falls", "Gideon defeats Midian", "left", "Jericho belongs to Joshua's conquest before Gideon's time in Judges.", "Conquest"],
  ["boa-r06", "Ruth meets Boaz", "David becomes king", "left", "Ruth is David's ancestor, so her story comes earlier.", "Family line"],
  ["boa-r07", "Saul becomes king", "David defeats Goliath", "left", "Saul is already king when David faces Goliath.", "Kingdom"],
  ["boa-r08", "Solomon builds the temple", "Kingdom divides", "left", "The kingdom divides after Solomon's reign.", "Temple"],
  ["boa-r09", "Elijah confronts Baal's prophets", "Judah falls to Babylon", "left", "Elijah ministers long before Babylon captures Jerusalem.", "Prophets"],
  ["boa-r10", "Daniel serves in Babylon", "Nehemiah rebuilds Jerusalem's wall", "left", "Daniel's exile setting precedes Nehemiah's return-era rebuilding.", "Exile"],
  ["boa-r11", "John the Baptist preaches", "Jesus feeds the five thousand", "left", "John prepares the way before Jesus' public ministry expands.", "Gospels"],
  ["boa-r12", "Jesus is baptized", "Sermon on the Mount", "left", "The baptism comes before the sermon in the Gospel sequence.", "Jesus' ministry"],
  ["boa-r13", "Triumphal entry", "Last Supper", "left", "Jesus enters Jerusalem before sharing the Last Supper.", "Passion week"],
  ["boa-r14", "Crucifixion", "Pentecost", "left", "Pentecost follows Jesus' death, resurrection, and ascension.", "New Testament"],
  ["boa-r15", "Stephen is martyred", "Saul is converted", "left", "Saul is present at Stephen's death before his own conversion.", "Acts"],
  ["boa-r16", "Cornelius hears Peter", "Paul reaches Rome", "left", "Peter's visit to Cornelius happens before Paul's later arrival in Rome.", "Acts"],
  ["boa-r17", "Israel crosses the Jordan", "Moses dies", "right", "Moses dies before Joshua leads Israel across the Jordan.", "Transition"],
  ["boa-r18", "Temple rebuilt after exile", "First temple destroyed", "right", "The first temple is destroyed before any later rebuilding.", "Exile"],
  ["boa-r19", "Paul writes from prison", "Paul's Damascus road conversion", "right", "Paul is converted before his later imprisonments and letters.", "Paul"],
  ["boa-r20", "New Jerusalem vision", "Letters to seven churches", "right", "The seven church messages appear before the closing New Jerusalem vision.", "Revelation"]
].map(([id, leftEvent, rightEvent, earlierEvent, explanation, theme]) => ({
  id,
  leftEvent,
  rightEvent,
  earlierEvent,
  explanation,
  theme
}));

const packs = {
  "bible-timeline.json": {
    $schema: "./schemas/bible-timeline.schema.json",
    game: "bible-timeline",
    version: 1,
    displayName: "Bible Timeline",
    roundsPerSession: 5,
    sessions: chunkSessions("bt", "Timeline Pack", "Bible chronology", timelineRounds, 5)
  },
  "verse-scramble.json": {
    $schema: "./schemas/verse-scramble.schema.json",
    game: "verse-scramble",
    version: 1,
    displayName: "Verse Scramble",
    roundsPerSession: 5,
    sessions: chunkSessions("vs", "Verse Scramble Pack", "Short KJV memory verses", verseRounds, 5)
  },
  "bible-connections.json": {
    $schema: "./schemas/bible-connections.schema.json",
    game: "bible-connections",
    version: 1,
    displayName: "Bible Connections",
    roundsPerSession: 3,
    sessions: chunkSessions("bc", "Connections Pack", "Bible term groups", connectionsRounds, 3)
  },
  "name-that-book.json": {
    $schema: "./schemas/name-that-book.schema.json",
    game: "name-that-book",
    version: 1,
    displayName: "Name That Book",
    roundsPerSession: 10,
    sessions: chunkSessions("ntb", "Name That Book Pack", "Bible book clues", nameThatBookRounds, 5)
  },
  "before-or-after.json": {
    $schema: "./schemas/before-or-after.schema.json",
    game: "before-or-after",
    version: 1,
    displayName: "Before Or After",
    roundsPerSession: 15,
    sessions: chunkSessions("boa", "Before Or After Pack", "Bible event order", beforeAfterRounds, 5)
  }
};

for (const [fileName, pack] of Object.entries(packs)) {
  await writeFile(path.join(dataDir, fileName), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  console.log(`Wrote ${fileName}`);
}
