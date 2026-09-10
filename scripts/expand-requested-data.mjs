import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const bookData = [
  ["Genesis", "Old Testament", "Law", ["Genesis", "Gen"], "creation, the patriarchs, and Joseph"],
  ["Exodus", "Old Testament", "Law", ["Exodus", "Exod"], "Israel's rescue from Egypt and the covenant at Sinai"],
  ["Leviticus", "Old Testament", "Law", ["Leviticus", "Lev"], "priests, sacrifices, holiness, and worship"],
  ["Numbers", "Old Testament", "Law", ["Numbers", "Num"], "wilderness travel, censuses, rebellion, and preparation"],
  ["Deuteronomy", "Old Testament", "Law", ["Deuteronomy", "Deut"], "Moses renewing the covenant before Canaan"],
  ["Joshua", "Old Testament", "History", ["Joshua", "Josh"], "entering and dividing the promised land"],
  ["Judges", "Old Testament", "History", ["Judges", "Judg"], "Israel's cycles of sin, oppression, and rescue"],
  ["Ruth", "Old Testament", "History", ["Ruth"], "loyalty, Boaz, and David's family line"],
  ["1 Samuel", "Old Testament", "History", ["1 Samuel", "First Samuel", "1 Sam"], "Samuel, Saul, and David's rise"],
  ["2 Samuel", "Old Testament", "History", ["2 Samuel", "Second Samuel", "2 Sam"], "David's reign over Israel"],
  ["1 Kings", "Old Testament", "History", ["1 Kings", "First Kings", "1 Kgs"], "Solomon, the divided kingdom, and Elijah"],
  ["2 Kings", "Old Testament", "History", ["2 Kings", "Second Kings", "2 Kgs"], "the decline and exile of Israel and Judah"],
  ["1 Chronicles", "Old Testament", "History", ["1 Chronicles", "First Chronicles", "1 Chr"], "genealogies and David's kingdom"],
  ["2 Chronicles", "Old Testament", "History", ["2 Chronicles", "Second Chronicles", "2 Chr"], "Judah's kings and temple history"],
  ["Ezra", "Old Testament", "History", ["Ezra"], "return from exile and rebuilding the temple"],
  ["Nehemiah", "Old Testament", "History", ["Nehemiah", "Neh"], "rebuilding Jerusalem's wall"],
  ["Esther", "Old Testament", "History", ["Esther", "Esth"], "a queen preserving her people in Persia"],
  ["Job", "Old Testament", "Wisdom", ["Job"], "suffering, faith, and God's wisdom"],
  ["Psalms", "Old Testament", "Wisdom", ["Psalms", "Psalm", "Ps"], "songs, prayers, lament, and praise"],
  ["Proverbs", "Old Testament", "Wisdom", ["Proverbs", "Prov"], "practical wisdom and the fear of the Lord"],
  ["Ecclesiastes", "Old Testament", "Wisdom", ["Ecclesiastes", "Eccl"], "life's vanity and the search for meaning"],
  ["Song of Solomon", "Old Testament", "Wisdom", ["Song of Solomon", "Song", "Song of Songs", "SOS"], "poetic love and devotion"],
  ["Isaiah", "Old Testament", "Major Prophets", ["Isaiah", "Isa"], "judgment, comfort, and the servant of the Lord"],
  ["Jeremiah", "Old Testament", "Major Prophets", ["Jeremiah", "Jer"], "warnings before Jerusalem's fall"],
  ["Lamentations", "Old Testament", "Major Prophets", ["Lamentations", "Lam"], "grief over fallen Jerusalem"],
  ["Ezekiel", "Old Testament", "Major Prophets", ["Ezekiel", "Ezek"], "exile visions, judgment, and restoration"],
  ["Daniel", "Old Testament", "Major Prophets", ["Daniel", "Dan"], "faithfulness in exile and kingdom visions"],
  ["Hosea", "Old Testament", "Minor Prophets", ["Hosea", "Hos"], "covenant love pictured through marriage"],
  ["Joel", "Old Testament", "Minor Prophets", ["Joel"], "locust judgment and the day of the Lord"],
  ["Amos", "Old Testament", "Minor Prophets", ["Amos"], "justice and judgment on Israel"],
  ["Obadiah", "Old Testament", "Minor Prophets", ["Obadiah", "Obad"], "judgment against Edom"],
  ["Jonah", "Old Testament", "Minor Prophets", ["Jonah"], "a reluctant prophet sent to Nineveh"],
  ["Micah", "Old Testament", "Minor Prophets", ["Micah", "Mic"], "justice, mercy, and Bethlehem hope"],
  ["Nahum", "Old Testament", "Minor Prophets", ["Nahum", "Nah"], "Nineveh's coming fall"],
  ["Habakkuk", "Old Testament", "Minor Prophets", ["Habakkuk", "Hab"], "faith while asking hard questions"],
  ["Zephaniah", "Old Testament", "Minor Prophets", ["Zephaniah", "Zeph"], "the day of the Lord and a purified remnant"],
  ["Haggai", "Old Testament", "Minor Prophets", ["Haggai", "Hag"], "calling the returned people to rebuild the temple"],
  ["Zechariah", "Old Testament", "Minor Prophets", ["Zechariah", "Zech"], "visions of restoration and messianic hope"],
  ["Malachi", "Old Testament", "Minor Prophets", ["Malachi", "Mal"], "rebuke, covenant faithfulness, and Elijah's promise"],
  ["Matthew", "New Testament", "Gospels", ["Matthew", "Matt"], "Jesus as Messiah and King"],
  ["Mark", "New Testament", "Gospels", ["Mark", "Mk"], "the active ministry and suffering servant"],
  ["Luke", "New Testament", "Gospels", ["Luke", "Lk"], "Jesus' compassion and orderly account"],
  ["John", "New Testament", "Gospels", ["John", "Jn"], "signs showing Jesus as the Son of God"],
  ["Acts", "New Testament", "History", ["Acts"], "the Spirit, apostles, and spread of the church"],
  ["Romans", "New Testament", "Pauline Letters", ["Romans", "Rom"], "sin, grace, faith, and righteousness"],
  ["1 Corinthians", "New Testament", "Pauline Letters", ["1 Corinthians", "First Corinthians", "1 Cor"], "church problems, gifts, love, and resurrection"],
  ["2 Corinthians", "New Testament", "Pauline Letters", ["2 Corinthians", "Second Corinthians", "2 Cor"], "Paul's ministry, suffering, and generosity"],
  ["Galatians", "New Testament", "Pauline Letters", ["Galatians", "Gal"], "freedom in Christ and justification by faith"],
  ["Ephesians", "New Testament", "Pauline Letters", ["Ephesians", "Eph"], "the church, unity, grace, and spiritual armor"],
  ["Philippians", "New Testament", "Pauline Letters", ["Philippians", "Phil"], "joy, humility, and partnership in the gospel"],
  ["Colossians", "New Testament", "Pauline Letters", ["Colossians", "Col"], "Christ's supremacy and new life"],
  ["1 Thessalonians", "New Testament", "Pauline Letters", ["1 Thessalonians", "First Thessalonians", "1 Thess"], "encouragement, holiness, and Christ's return"],
  ["2 Thessalonians", "New Testament", "Pauline Letters", ["2 Thessalonians", "Second Thessalonians", "2 Thess"], "steadiness while awaiting the Lord"],
  ["1 Timothy", "New Testament", "Pauline Letters", ["1 Timothy", "First Timothy", "1 Tim"], "church order and pastoral instruction"],
  ["2 Timothy", "New Testament", "Pauline Letters", ["2 Timothy", "Second Timothy", "2 Tim"], "endurance and faithfulness in ministry"],
  ["Titus", "New Testament", "Pauline Letters", ["Titus"], "appointing elders and teaching sound doctrine"],
  ["Philemon", "New Testament", "Pauline Letters", ["Philemon", "Phlm"], "appeal for Onesimus and gospel reconciliation"],
  ["Hebrews", "New Testament", "General Letters", ["Hebrews", "Heb"], "Christ's superiority and persevering faith"],
  ["James", "New Testament", "General Letters", ["James", "Jas"], "practical faith shown through works"],
  ["1 Peter", "New Testament", "General Letters", ["1 Peter", "First Peter", "1 Pet"], "hope and endurance in suffering"],
  ["2 Peter", "New Testament", "General Letters", ["2 Peter", "Second Peter", "2 Pet"], "growth, warning, and the day of the Lord"],
  ["1 John", "New Testament", "General Letters", ["1 John", "First John", "1 Jn"], "love, truth, and assurance"],
  ["2 John", "New Testament", "General Letters", ["2 John", "Second John", "2 Jn"], "truth, love, and warning against deceivers"],
  ["3 John", "New Testament", "General Letters", ["3 John", "Third John", "3 Jn"], "hospitality, truth, and church leadership"],
  ["Jude", "New Testament", "General Letters", ["Jude"], "contending for the faith"],
  ["Revelation", "New Testament", "Prophecy", ["Revelation", "Rev"], "visions, judgment, worship, and final victory"]
];

const timelineRounds = [
  ["Early Genesis", "Put these early Genesis events in order.", ["Creation", "Fall in Eden", "Cain kills Abel", "Noah builds the ark", "Tower of Babel", "Abram called"]],
  ["Abraham And Isaac", "Arrange these Abraham and Isaac events.", ["Abram enters Canaan", "Lot separates from Abram", "Isaac is promised", "Sodom and Gomorrah judged", "Isaac is born", "Isaac is offered"]],
  ["Jacob And Joseph", "Arrange these Jacob and Joseph events.", ["Jacob receives blessing", "Jacob dreams at Bethel", "Jacob marries Leah and Rachel", "Joseph receives dreams", "Joseph is sold", "Israel moves to Egypt"]],
  ["Exodus", "Arrange these Exodus events.", ["Moses at the burning bush", "Plagues in Egypt", "Passover night", "Red Sea crossing", "Law given at Sinai", "Golden calf incident"]],
  ["Wilderness", "Place these wilderness events in order.", ["Manna is given", "Water from the rock", "Spies enter Canaan", "Korah rebels", "Bronze serpent lifted", "Moses views Canaan"]],
  ["Conquest", "Put these conquest events in order.", ["Joshua leads Israel", "Jordan River crossing", "Jericho falls", "Achan's sin discovered", "Ai is defeated", "Land is divided"]],
  ["Judges", "Arrange these Judges-era events.", ["Othniel delivers Israel", "Ehud defeats Eglon", "Deborah judges Israel", "Gideon defeats Midian", "Jephthah leads Israel", "Samson defeats Philistines"]],
  ["Ruth And Samuel", "Place these events around Ruth and Samuel.", ["Ruth meets Boaz", "Obed is born", "Hannah prays for a son", "Samuel is called", "Ark is captured", "Israel asks for a king"]],
  ["Saul And David", "Arrange these Saul and David events.", ["Saul becomes king", "David is anointed", "David defeats Goliath", "David spares Saul", "Saul dies at Gilboa", "David becomes king over Judah"]],
  ["David's Reign", "Put these events from David's reign in order.", ["David captures Jerusalem", "Ark brought to Jerusalem", "Promise made to David", "David sins with Bathsheba", "Absalom rebels", "Solomon is named successor"]],
  ["Solomon", "Arrange these Solomon events.", ["Solomon asks for wisdom", "Temple construction begins", "Temple is dedicated", "Queen of Sheba visits", "Solomon turns from the Lord", "Solomon dies"]],
  ["Divided Kingdom", "Place these divided kingdom events.", ["Rehoboam rejects counsel", "Kingdom divides", "Jeroboam sets golden calves", "Asa reforms Judah", "Omri rules Israel", "Ahab marries Jezebel"]],
  ["Elijah", "Arrange these Elijah events.", ["Elijah announces drought", "Ravens feed Elijah", "Widow's son is raised", "Carmel contest", "Elijah flees to Horeb", "Elijah taken up"]],
  ["Elisha", "Put these Elisha events in order.", ["Elisha receives Elijah's mantle", "Waters of Jericho healed", "Widow's oil multiplied", "Shunammite's son raised", "Naaman healed", "Aramean army blinded"]],
  ["Assyria", "Arrange these Assyrian-period events.", ["Jonah sent to Nineveh", "Amos warns Israel", "Hosea warns Israel", "Isaiah sees the Lord", "Samaria falls", "Sennacherib threatens Jerusalem"]],
  ["Judah Before Exile", "Place these late Judah events.", ["Hezekiah reforms Judah", "Manasseh reigns", "Josiah finds the law", "Jeremiah begins ministry", "First Babylonian deportation", "Jerusalem falls"]],
  ["Exile", "Arrange these exile events.", ["Daniel taken to Babylon", "Fiery furnace", "Ezekiel sees visions", "Nebuchadnezzar humbled", "Handwriting on the wall", "Daniel in the lions' den"]],
  ["Return", "Put these return-from-exile events in order.", ["Cyrus decrees return", "Temple foundation laid", "Temple rebuilding resumes", "Temple completed", "Ezra arrives", "Nehemiah rebuilds wall"]],
  ["Between Testaments And Birth", "Arrange these events leading into the Gospels.", ["Persian period ends", "Greek rule begins", "Roman rule in Judea", "Gabriel visits Zacharias", "Gabriel visits Mary", "Jesus is born"]],
  ["Early Jesus Ministry", "Put these early Gospel events in order.", ["John the Baptist preaches", "Jesus is baptized", "Jesus is tempted", "First disciples called", "Water turned to wine", "Sermon on the Mount"]],
  ["Jesus' Miracles", "Arrange these ministry events.", ["Nobleman's son healed", "Paralytic lowered through roof", "Storm is calmed", "Jairus's daughter raised", "Five thousand fed", "Jesus walks on water"]],
  ["Toward Jerusalem", "Place these later Gospel events.", ["Peter confesses Christ", "Transfiguration", "Seventy sent out", "Lazarus raised", "Triumphal entry", "Temple cleansed"]],
  ["Passion Week", "Put these Passion Week events in order.", ["Last Supper", "Gethsemane prayer", "Jesus before Pilate", "Crucifixion", "Burial", "Resurrection"]],
  ["Early Church", "Arrange these Acts events.", ["Ascension", "Pentecost", "Lame man healed at temple", "Stephen is martyred", "Saul is converted", "Cornelius hears Peter"]],
  ["Paul's Journeys", "Place these Paul events in order.", ["Paul and Barnabas sent", "Jerusalem Council", "Lydia believes", "Paul preaches in Athens", "Paul arrested in Jerusalem", "Paul reaches Rome"]]
];

const connectionBookGroups = [
  ["Books Of The Law", ["Genesis", "Exodus", "Leviticus", "Numbers"]],
  ["Early History Books", ["Joshua", "Judges", "Ruth", "1 Samuel"]],
  ["Kingdom History Books", ["2 Samuel", "1 Kings", "2 Kings", "1 Chronicles"]],
  ["Return History Books", ["2 Chronicles", "Ezra", "Nehemiah", "Esther"]],
  ["Wisdom Books", ["Job", "Psalms", "Proverbs", "Ecclesiastes"]],
  ["Major Prophets", ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel"]],
  ["Minor Prophets A", ["Hosea", "Joel", "Amos", "Obadiah"]],
  ["Minor Prophets B", ["Jonah", "Micah", "Nahum", "Habakkuk"]],
  ["Minor Prophets C", ["Zephaniah", "Haggai", "Zechariah", "Malachi"]],
  ["Gospels", ["Matthew", "Mark", "Luke", "John"]],
  ["Church Letters A", ["Romans", "1 Corinthians", "2 Corinthians", "Galatians"]],
  ["Church Letters B", ["Ephesians", "Philippians", "Colossians", "1 Thessalonians"]],
  ["Pastoral Letters", ["1 Timothy", "2 Timothy", "Titus", "Philemon"]],
  ["General Letters A", ["Hebrews", "James", "1 Peter", "2 Peter"]],
  ["John's Letters", ["1 John", "2 John", "3 John", "Revelation"]],
  ["Pentateuch People", ["Adam", "Noah", "Abraham", "Moses"]],
  ["Exodus Places", ["Egypt", "Goshen", "Sinai", "Moab"]],
  ["Temple Books", ["Kings", "Chronicles", "Ezra", "Haggai"]],
  ["Poetry Themes", ["Praise", "Wisdom", "Vanity", "Love"]],
  ["Prophet Books With One Chapter", ["Obadiah", "Philemon", "2 John", "3 John"]]
];

const connectionPeopleGroups = [
  ["Patriarchs", ["Abraham", "Isaac", "Jacob", "Joseph"]],
  ["Moses Family", ["Amram", "Jochebed", "Aaron", "Miriam"]],
  ["Judges", ["Deborah", "Gideon", "Jephthah", "Samson"]],
  ["United Monarchy", ["Saul", "David", "Solomon", "Jonathan"]],
  ["Queens And Royal Women", ["Vashti", "Bathsheba", "Athaliah", "Jezebel"]],
  ["Major Prophets As People", ["Isaiah", "Jeremiah", "Ezekiel", "Daniel"]],
  ["Exile Faithful", ["Hananiah", "Mishael", "Azariah", "Mordecai"]],
  ["Return Leaders", ["Zerubbabel", "Joshua", "Ezra", "Nehemiah"]],
  ["Twelve Apostles A", ["Peter", "Andrew", "James", "John"]],
  ["Twelve Apostles B", ["Philip", "Bartholomew", "Thomas", "Matthew"]],
  ["Twelve Apostles C", ["James son of Alphaeus", "Thaddaeus", "Simon the Zealot", "Judas Iscariot"]],
  ["Gospel Women", ["Mary Magdalene", "Martha", "Mary of Bethany", "Joanna"]],
  ["Acts Missionaries", ["Barnabas", "Silas", "Timothy", "Luke"]],
  ["Acts Converts", ["Lydia", "Cornelius", "Ethiopian eunuch", "Dionysius"]],
  ["Paul's Friends", ["Aquila", "Priscilla", "Epaphroditus", "Tychicus"]],
  ["High Priests", ["Eli", "Abiathar", "Zadok", "Caiaphas"]],
  ["Foreign Rulers", ["Pharaoh", "Nebuchadnezzar", "Cyrus", "Herod"]],
  ["Women Of Faith", ["Sarah", "Rebekah", "Hannah", "Elizabeth"]],
  ["Prophets In Kings", ["Elijah", "Elisha", "Micaiah", "Huldah"]],
  ["Villains And Opponents", ["Goliath", "Haman", "Sanballat", "Bar-Jesus"]]
];

const connectionPlaceGroups = [
  ["Garden And Early Places", ["Eden", "Ararat", "Babel", "Ur"]],
  ["Patriarch Places", ["Haran", "Bethel", "Hebron", "Beersheba"]],
  ["Exodus Stops", ["Succoth", "Marah", "Elim", "Rephidim"]],
  ["Conquest Places", ["Jordan", "Jericho", "Ai", "Gibeon"]],
  ["Judges Places", ["Ophrah", "Timnah", "Shiloh", "Mizpah"]],
  ["David Places", ["Bethlehem", "Adullam", "Ziklag", "Jerusalem"]],
  ["Kingdom Capitals", ["Samaria", "Damascus", "Nineveh", "Babylon"]],
  ["Exile Places", ["Chebar", "Susa", "Persia", "Media"]],
  ["Return Places", ["Jerusalem", "Bethany", "Emmaus", "Nazareth"]],
  ["Galilee Places", ["Capernaum", "Cana", "Nain", "Bethsaida"]],
  ["Jesus Ministry Places", ["Jordan River", "Wilderness", "Sea of Galilee", "Mount of Olives"]],
  ["Passion Places", ["Upper Room", "Gethsemane", "Golgotha", "Tomb"]],
  ["Acts Places", ["Joppa", "Antioch", "Philippi", "Athens"]],
  ["Paul Travel Places", ["Corinth", "Ephesus", "Troas", "Rome"]],
  ["Island Places", ["Patmos", "Cyprus", "Malta", "Crete"]],
  ["Tabernacle Items", ["Ark", "Altar", "Lampstand", "Veil"]],
  ["Priestly Items", ["Ephod", "Breastplate", "Urim", "Thummim"]],
  ["Temple Furnishings", ["Sea", "Lavers", "Cherubim", "Pillars"]],
  ["Gospel Objects", ["Loaves", "Nets", "Denarius", "Alabaster box"]],
  ["Armor Of God", ["Belt", "Breastplate", "Shield", "Helmet"]]
];

const connectionThemeGroups = [
  ["Creation Days", ["Light", "Firmament", "Dry land", "Lights"]],
  ["Plagues", ["Blood", "Frogs", "Lice", "Flies"]],
  ["Feasts", ["Passover", "Unleavened Bread", "Weeks", "Tabernacles"]],
  ["Offerings", ["Burnt", "Grain", "Peace", "Sin"]],
  ["Fruits Of The Spirit A", ["Love", "Joy", "Peace", "Longsuffering"]],
  ["Fruits Of The Spirit B", ["Gentleness", "Goodness", "Faith", "Meekness"]],
  ["Beatitudes", ["Poor in spirit", "Mourn", "Meek", "Merciful"]],
  ["Parables", ["Sower", "Mustard seed", "Lost sheep", "Prodigal son"]],
  ["Miracles", ["Water to wine", "Storm calmed", "Lazarus raised", "Blind man healed"]],
  ["I Am Sayings", ["Bread of life", "Light of the world", "Good shepherd", "True vine"]],
  ["Spiritual Gifts", ["Prophecy", "Teaching", "Giving", "Mercy"]],
  ["Church Offices", ["Apostles", "Prophets", "Evangelists", "Pastors"]],
  ["Revelation Churches", ["Ephesus", "Smyrna", "Pergamos", "Thyatira"]],
  ["More Revelation Churches", ["Sardis", "Philadelphia", "Laodicea", "Patmos"]],
  ["Faith Chapter Examples", ["Abel", "Enoch", "Rahab", "Gideon"]],
  ["Prayer Postures", ["Kneeling", "Standing", "Lifting hands", "Fasting"]],
  ["Covenant Signs", ["Rainbow", "Circumcision", "Sabbath", "Cup"]],
  ["Temple Materials", ["Gold", "Silver", "Cedar", "Stone"]],
  ["Animals In Sacrifice", ["Bullock", "Ram", "Lamb", "Turtledove"]],
  ["New Jerusalem Images", ["Wall", "Gates", "River", "Tree"]]
];

const orderedEvents = [
  "Creation", "Fall in Eden", "Cain kills Abel", "Noah builds the ark", "Flood covers the earth", "Tower of Babel",
  "Abram leaves Haran", "Isaac is born", "Jacob receives the blessing", "Joseph is sold by his brothers", "Israel moves to Egypt",
  "Moses is born", "Moses sees the burning bush", "Plagues strike Egypt", "The Passover night", "The Red Sea crossing",
  "The law is given at Sinai", "The tabernacle is built", "The spies enter Canaan", "Joshua leads Israel", "The Jordan River crossing",
  "Jericho falls", "Deborah judges Israel", "Gideon defeats Midian", "Samson fights the Philistines", "Ruth meets Boaz",
  "Samuel is called", "Saul becomes king", "David defeats Goliath", "David becomes king", "Solomon asks for wisdom",
  "Solomon builds the temple", "The kingdom divides", "Elijah confronts Baal's prophets", "Elisha receives Elijah's mantle",
  "Jonah preaches to Nineveh", "Isaiah sees the Lord", "Samaria falls to Assyria", "Josiah finds the book of the law",
  "Jeremiah warns Judah", "Jerusalem falls to Babylon", "Daniel serves in Babylon", "The fiery furnace", "Daniel in the lions' den",
  "Cyrus permits the return", "The second temple is completed", "Ezra teaches the law", "Nehemiah rebuilds Jerusalem's wall",
  "Gabriel visits Zacharias", "Gabriel visits Mary", "Jesus is born", "John the Baptist preaches", "Jesus is baptized",
  "Jesus is tempted", "Jesus calls the first disciples", "Sermon on the Mount", "Jesus calms the storm", "Jesus feeds the five thousand",
  "Peter confesses Christ", "The transfiguration", "Lazarus is raised", "The triumphal entry", "The Last Supper",
  "Jesus prays in Gethsemane", "The crucifixion", "The resurrection", "The ascension", "Pentecost", "Stephen is martyred",
  "Saul is converted", "Cornelius hears Peter", "The Jerusalem Council", "Paul preaches in Athens", "Paul is arrested in Jerusalem",
  "Paul reaches Rome", "John receives Revelation"
];

function chunk(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function bookClues(book, testament, category, aliases, focus, index) {
  const previous = index > 0 ? bookData[index - 1][0] : null;
  const next = index + 1 < bookData.length ? bookData[index + 1][0] : null;
  const positionClue =
    previous && next
      ? `It is placed after ${previous} and before ${next} in the Protestant Bible order.`
      : next
        ? `It opens the Bible and is followed by ${next}.`
        : `It closes the Bible and follows ${previous}.`;

  return [
    `This book belongs to the ${category} section.`,
    `It is in the ${testament}.`,
    positionClue,
    `It focuses on ${focus}.`,
    `Its title is ${book}.`
  ];
}

function packSessions(prefix, titlePrefix, theme, rounds, sessionsOf) {
  return chunk(rounds, sessionsOf).map((sessionRounds, index) => ({
    id: `${prefix}-session-${String(index + 1).padStart(2, "0")}`,
    title: `${titlePrefix} ${index + 1}`,
    theme,
    rounds: sessionRounds
  }));
}

function buildTimelinePack() {
  const rounds = timelineRounds.map(([theme, prompt, labels], roundIndex) => ({
    id: `bt-r${String(roundIndex + 1).padStart(2, "0")}`,
    prompt,
    events: labels.map((label, eventIndex) => ({
      id: `bt-r${String(roundIndex + 1).padStart(2, "0")}-e${String(eventIndex + 1).padStart(2, "0")}`,
      label,
      order: eventIndex + 1,
      clue: theme
    }))
  }));

  return {
    $schema: "./schemas/bible-timeline.schema.json",
    game: "bible-timeline",
    version: 1,
    displayName: "Bible Timeline",
    roundsPerSession: 5,
    sessions: packSessions("bt", "Timeline Pack", "Bible chronology", rounds, 5)
  };
}

async function buildVerseScramblePack() {
  const scripturePack = JSON.parse(await readFile(path.join(dataDir, "scripture-puzzles.json"), "utf8"));
  const uniqueByReference = new Map();

  for (const session of scripturePack.sessions) {
    for (const round of session.rounds) {
      if (round.sourceTranslation !== "KJV" || !round.verseText) {
        continue;
      }

      const key = normalize(`${round.reference}|${round.verseText}`);
      if (!uniqueByReference.has(key)) {
        uniqueByReference.set(key, {
          reference: round.reference,
          referenceAliases: round.referenceAliases,
          sourceTranslation: "KJV",
          theme: round.theme,
          verseText: round.verseText
        });
      }
    }
  }

  const supplemental = {
    reference: "John 11:35",
    referenceAliases: ["John 11:35", "Jn 11:35"],
    sourceTranslation: "KJV",
    theme: "Compassion",
    verseText: "Jesus wept."
  };
  uniqueByReference.set(normalize(`${supplemental.reference}|${supplemental.verseText}`), supplemental);

  const rounds = [...uniqueByReference.values()].slice(0, 125).map((round, index) => ({
    id: `vs-r${String(index + 1).padStart(3, "0")}`,
    ...round
  }));

  return {
    $schema: "./schemas/verse-scramble.schema.json",
    game: "verse-scramble",
    version: 1,
    displayName: "Verse Scramble",
    roundsPerSession: 5,
    sessions: packSessions("vs", "Verse Scramble Pack", "KJV memory verses", rounds, 5)
  };
}

function buildConnectionsPack() {
  const partitions = [connectionBookGroups, connectionPeopleGroups, connectionPlaceGroups, connectionThemeGroups];
  const rounds = [];

  for (let boardIndex = 0; boardIndex < 60; boardIndex += 1) {
    const used = new Set();
    const groups = [];
    const bankOffset = Math.floor(boardIndex / 20);

    partitions.forEach((partition, partitionIndex) => {
      const baseIndex =
        (boardIndex * (partitionIndex * 4 + 3) + partitionIndex + bankOffset * (partitionIndex * 3 + 2)) %
        partition.length;
      let template = partition[baseIndex];
      let attempts = 0;

      while (template[1].some((item) => used.has(normalize(item))) && attempts < partition.length) {
        attempts += 1;
        template = partition[(baseIndex + attempts) % partition.length];
      }

      template[1].forEach((item) => used.add(normalize(item)));
      groups.push({
        id: `bc-r${String(boardIndex + 1).padStart(2, "0")}-g${String(partitionIndex + 1).padStart(2, "0")}`,
        category: template[0],
        items: template[1]
      });
    });

    rounds.push({
      id: `bc-r${String(boardIndex + 1).padStart(2, "0")}`,
      title: `Connections Board ${boardIndex + 1}`,
      groups
    });
  }

  return {
    $schema: "./schemas/bible-connections.schema.json",
    game: "bible-connections",
    version: 1,
    displayName: "Bible Connections",
    roundsPerSession: 3,
    sessions: packSessions("bc", "Connections Pack", "Bible term groups", rounds, 3)
  };
}

function buildNameThatBookPack() {
  const rounds = bookData.map(([book, testament, category, aliases, focus], index) => ({
    id: `ntb-r${String(index + 1).padStart(2, "0")}`,
    book,
    testament,
    category,
    aliases,
    clues: bookClues(book, testament, category, aliases, focus, index)
  }));

  return {
    $schema: "./schemas/name-that-book.schema.json",
    game: "name-that-book",
    version: 1,
    displayName: "Name That Book",
    roundsPerSession: 10,
    sessions: packSessions("ntb", "Name That Book Pack", "Bible book clues", rounds, 10)
  };
}

function buildBeforeOrAfterPack() {
  const rounds = [];
  const usedPairs = new Set();
  let distance = 1;

  while (rounds.length < 150) {
    for (let index = 0; index + distance < orderedEvents.length && rounds.length < 150; index += 1) {
      const earlier = orderedEvents[index];
      const later = orderedEvents[index + distance];
      const pairKey = [earlier, later].map(normalize).sort().join("|");

      if (usedPairs.has(pairKey)) {
        continue;
      }

      usedPairs.add(pairKey);
      const flip = rounds.length % 2 === 1;
      rounds.push({
        id: `boa-r${String(rounds.length + 1).padStart(3, "0")}`,
        leftEvent: flip ? later : earlier,
        rightEvent: flip ? earlier : later,
        earlierEvent: flip ? "right" : "left",
        explanation: `${earlier} comes earlier in the biblical sequence than ${later}.`,
        theme: "Bible event order"
      });
    }
    distance += 1;
  }

  return {
    $schema: "./schemas/before-or-after.schema.json",
    game: "before-or-after",
    version: 1,
    displayName: "Before Or After",
    roundsPerSession: 15,
    sessions: packSessions("boa", "Before Or After Pack", "Bible event order", rounds, 15)
  };
}

async function writePack(fileName, pack) {
  await writeFile(path.join(dataDir, fileName), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
}

await writePack("bible-timeline.json", buildTimelinePack());
await writePack("verse-scramble.json", await buildVerseScramblePack());
await writePack("bible-connections.json", buildConnectionsPack());
await writePack("name-that-book.json", buildNameThatBookPack());
await writePack("before-or-after.json", buildBeforeOrAfterPack());
