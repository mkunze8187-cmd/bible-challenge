import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildBibleAnagramStudyNote } from "./structured-study-notes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const ROUNDS_PER_SESSION = 10;

// Each entry's `answer` is scrambled letter-by-letter at runtime (see
// createBibleAnagramPrompt in src/lib/gameEngine.ts) — no scrambled form is stored here.
// `clue` is shown for easy/medium rounds and hidden for hard rounds (see
// BibleAnagramsView's showClue logic), so every entry gets a real clue regardless of
// difficulty rather than only authoring clues for the easier tiers.
const subjects = [
  { answer: "Moses", category: "Person", theme: "Exodus", difficulty: "easy", clue: "He led Israel out of Egypt." },
  { answer: "Noah", category: "Person", theme: "Genesis", difficulty: "easy", clue: "He built an ark before the flood." },
  { answer: "David", category: "Person", theme: "1-2 Samuel", difficulty: "easy", clue: "He defeated Goliath with a sling." },
  { answer: "Solomon", category: "Person", theme: "1 Kings", difficulty: "easy", clue: "He asked God for wisdom and became a wise king." },
  { answer: "Abraham", category: "Person", theme: "Genesis", difficulty: "medium", clue: "God promised to make him the father of many nations." },
  { answer: "Joseph", category: "Person", theme: "Genesis", difficulty: "easy", clue: "His brothers sold him into slavery in Egypt." },
  { answer: "Daniel", category: "Person", theme: "Daniel", difficulty: "easy", clue: "He survived a night in a den of lions." },
  { answer: "Jonah", category: "Person", theme: "Jonah", difficulty: "easy", clue: "A great fish swallowed him for three days." },
  { answer: "Samson", category: "Person", theme: "Judges", difficulty: "medium", clue: "His strength was tied to his uncut hair." },
  { answer: "Elijah", category: "Person", theme: "1 Kings", difficulty: "medium", clue: "He faced the prophets of Baal on Mount Carmel." },
  { answer: "Elisha", category: "Person", theme: "2 Kings", difficulty: "hard", clue: "He received a double portion of his mentor's spirit." },
  { answer: "Isaiah", category: "Person", theme: "Isaiah", difficulty: "medium", clue: "A major prophet who foretold a coming Messiah." },
  { answer: "Jeremiah", category: "Person", theme: "Jeremiah", difficulty: "medium", clue: "Known as the weeping prophet." },
  { answer: "Ezekiel", category: "Person", theme: "Ezekiel", difficulty: "hard", clue: "He saw a vision of a valley of dry bones." },
  { answer: "Ruth", category: "Person", theme: "Ruth", difficulty: "easy", clue: "A Moabite woman loyal to her mother-in-law Naomi." },
  { answer: "Esther", category: "Person", theme: "Esther", difficulty: "easy", clue: "A queen who risked her life to save her people." },
  { answer: "Deborah", category: "Person", theme: "Judges", difficulty: "medium", clue: "A judge and prophetess who led Israel to victory." },
  { answer: "Gideon", category: "Person", theme: "Judges", difficulty: "medium", clue: "He defeated a large army with only three hundred men." },
  { answer: "Joshua", category: "Person", theme: "Joshua", difficulty: "easy", clue: "He led Israel into the Promised Land after Moses." },
  { answer: "Samuel", category: "Person", theme: "1 Samuel", difficulty: "medium", clue: "He anointed both Saul and David as king." },
  { answer: "Saul", category: "Person", theme: "1 Samuel", difficulty: "easy", clue: "Israel's first king." },
  { answer: "Jacob", category: "Person", theme: "Genesis", difficulty: "easy", clue: "He wrestled with an angel and was renamed Israel." },
  { answer: "Isaac", category: "Person", theme: "Genesis", difficulty: "easy", clue: "Abraham's son, nearly offered as a sacrifice." },
  { answer: "Adam", category: "Person", theme: "Genesis", difficulty: "easy", clue: "The first man, formed from the dust of the ground." },
  { answer: "Eve", category: "Person", theme: "Genesis", difficulty: "easy", clue: "The first woman, formed from Adam's rib." },
  { answer: "Cain", category: "Person", theme: "Genesis", difficulty: "medium", clue: "He killed his brother out of jealousy." },
  { answer: "Abel", category: "Person", theme: "Genesis", difficulty: "medium", clue: "A shepherd whose offering pleased God." },
  { answer: "Nehemiah", category: "Person", theme: "Nehemiah", difficulty: "hard", clue: "He rebuilt the walls of Jerusalem." },
  { answer: "Ezra", category: "Person", theme: "Ezra", difficulty: "hard", clue: "A priest and scribe who taught the Law after the exile." },
  { answer: "Job", category: "Person", theme: "Job", difficulty: "easy", clue: "He endured great suffering but remained faithful." },
  { answer: "Peter", category: "Person", theme: "Gospels", difficulty: "easy", clue: "He denied knowing Jesus three times." },
  { answer: "Paul", category: "Person", theme: "Acts", difficulty: "easy", clue: "Once a persecutor of Christians, later a leading apostle." },
  { answer: "John", category: "Person", theme: "Gospels", difficulty: "easy", clue: "The apostle who wrote a Gospel and Revelation." },
  { answer: "Matthew", category: "Person", theme: "Gospels", difficulty: "medium", clue: "A tax collector who became a Gospel writer." },
  { answer: "Mark", category: "Person", theme: "Gospels", difficulty: "medium", clue: "He wrote the shortest of the four Gospels." },
  { answer: "Luke", category: "Person", theme: "Gospels", difficulty: "medium", clue: "A physician who wrote a Gospel and the book of Acts." },
  { answer: "Thomas", category: "Person", theme: "Gospels", difficulty: "medium", clue: "An apostle remembered for doubting the resurrection." },
  { answer: "Andrew", category: "Person", theme: "Gospels", difficulty: "medium", clue: "Peter's brother and one of the twelve apostles." },
  { answer: "Philip", category: "Person", theme: "Gospels Acts", difficulty: "medium", clue: "An apostle who later explained Scripture to an Ethiopian official." },
  { answer: "Barnabas", category: "Person", theme: "Acts", difficulty: "hard", clue: "He vouched for Paul before the apostles in Jerusalem." },
  { answer: "Timothy", category: "Person", theme: "Acts", difficulty: "hard", clue: "A younger companion of Paul on his missionary journeys." },
  { answer: "Stephen", category: "Person", theme: "Acts", difficulty: "medium", clue: "The first Christian martyr, stoned for his testimony." },
  { answer: "Mary", category: "Person", theme: "Gospels", difficulty: "easy", clue: "The mother of Jesus." },
  { answer: "Martha", category: "Person", theme: "Gospels", difficulty: "medium", clue: "Sister of Mary and Lazarus, busy with hospitality." },
  { answer: "Lazarus", category: "Person", theme: "Gospels", difficulty: "medium", clue: "Jesus raised him from the dead after four days in the tomb." },
  { answer: "Zacchaeus", category: "Person", theme: "Gospels", difficulty: "hard", clue: "A short tax collector who climbed a tree to see Jesus." },
  { answer: "Nicodemus", category: "Person", theme: "Gospels", difficulty: "hard", clue: "A Pharisee who came to Jesus by night." },
  { answer: "Herod", category: "Person", theme: "Gospels", difficulty: "medium", clue: "A king who ordered the killing of infant boys in Bethlehem." },
  { answer: "Pilate", category: "Person", theme: "Gospels", difficulty: "medium", clue: "The Roman governor who sentenced Jesus to be crucified." },
  { answer: "Goliath", category: "Person", theme: "1 Samuel", difficulty: "medium", clue: "A Philistine giant defeated by a young shepherd." },
  { answer: "Delilah", category: "Person", theme: "Judges", difficulty: "medium", clue: "She discovered the secret of Samson's strength." },
  { answer: "Naomi", category: "Person", theme: "Ruth", difficulty: "medium", clue: "Ruth's mother-in-law who returned to Bethlehem." },
  { answer: "Boaz", category: "Person", theme: "Ruth", difficulty: "medium", clue: "A kinsman-redeemer who married Ruth." },
  { answer: "Eden", category: "Place", theme: "Genesis", difficulty: "easy", clue: "The garden where Adam and Eve first lived." },
  { answer: "Bethlehem", category: "Place", theme: "Gospels", difficulty: "easy", clue: "The town where Jesus was born." },
  { answer: "Nazareth", category: "Place", theme: "Gospels", difficulty: "easy", clue: "The town where Jesus grew up." },
  { answer: "Jerusalem", category: "Place", theme: "Bible geography", difficulty: "easy", clue: "The holy city with the temple at its center." },
  { answer: "Egypt", category: "Place", theme: "Exodus", difficulty: "easy", clue: "The land where the Israelites were enslaved." },
  { answer: "Jericho", category: "Place", theme: "Joshua", difficulty: "medium", clue: "Its walls fell after Israel marched around it seven times." },
  { answer: "Babylon", category: "Place", theme: "2 Kings", difficulty: "medium", clue: "The empire that took Judah into exile." },
  { answer: "Sinai", category: "Place", theme: "Exodus", difficulty: "medium", clue: "The mountain where Moses received the Ten Commandments." },
  { answer: "Canaan", category: "Place", theme: "Bible geography", difficulty: "medium", clue: "The promised land given to Abraham's descendants." },
  { answer: "Galilee", category: "Place", theme: "Gospels", difficulty: "medium", clue: "A sea and region central to much of Jesus's ministry." },
  { answer: "Damascus", category: "Place", theme: "Acts", difficulty: "medium", clue: "Saul was blinded on the road to this city." },
  { answer: "Sodom", category: "Place", theme: "Genesis", difficulty: "medium", clue: "A wicked city destroyed by fire and brimstone." },
  { answer: "Nineveh", category: "Place", theme: "Jonah", difficulty: "medium", clue: "The city Jonah was sent to warn." },
  { answer: "Bethany", category: "Place", theme: "Gospels", difficulty: "hard", clue: "The home village of Mary, Martha, and Lazarus." },
  { answer: "Capernaum", category: "Place", theme: "Gospels", difficulty: "hard", clue: "A town by the Sea of Galilee where Jesus based His ministry." },
  { answer: "Corinth", category: "Place", theme: "Acts", difficulty: "hard", clue: "A Greek city Paul wrote two New Testament letters to." },
  { answer: "Ephesus", category: "Place", theme: "Acts", difficulty: "hard", clue: "A city known for its temple to Artemis, visited by Paul." },
  { answer: "Patmos", category: "Place", theme: "Revelation", difficulty: "hard", clue: "The island where John received his vision of Revelation." },
  { answer: "Ark", category: "Thing", theme: "Genesis", difficulty: "easy", clue: "Noah built this to survive the flood." },
  { answer: "Manna", category: "Thing", theme: "Exodus", difficulty: "easy", clue: "Bread from heaven that fed Israel in the wilderness." },
  { answer: "Rainbow", category: "Thing", theme: "Genesis", difficulty: "easy", clue: "A sign of God's covenant after the flood." },
  { answer: "Cross", category: "Thing", theme: "Gospels", difficulty: "easy", clue: "The instrument on which Jesus was crucified." },
  { answer: "Manger", category: "Thing", theme: "Gospels", difficulty: "easy", clue: "The feeding trough where baby Jesus was laid." },
  { answer: "Tablets", category: "Thing", theme: "Exodus", difficulty: "medium", clue: "Stone objects on which the Ten Commandments were written." },
  { answer: "Sling", category: "Thing", theme: "1 Samuel", difficulty: "medium", clue: "David's weapon against Goliath." },
  { answer: "Robe", category: "Thing", theme: "Genesis", difficulty: "medium", clue: "A colorful gift from Jacob to his son Joseph." },
  { answer: "Staff", category: "Thing", theme: "Exodus", difficulty: "medium", clue: "Moses used this to part the Red Sea." },
  { answer: "Wine", category: "Thing", theme: "Gospels", difficulty: "medium", clue: "What Jesus turned water into at a wedding in Cana." },
  { answer: "Bread", category: "Thing", theme: "Gospels", difficulty: "easy", clue: "Broken and shared by Jesus at the Last Supper." },
  { answer: "Trumpet", category: "Thing", theme: "Joshua", difficulty: "medium", clue: "Sounded by priests before the walls of Jericho fell." },
  { answer: "Fleece", category: "Thing", theme: "Judges", difficulty: "hard", clue: "Gideon used one to test God's will." },
  { answer: "Ephod", category: "Thing", theme: "Exodus", difficulty: "hard", clue: "A priestly garment worn by Aaron." },
  { answer: "Scroll", category: "Thing", theme: "Bible objects", difficulty: "medium", clue: "An ancient rolled document used for Scripture." },
  { answer: "Crown", category: "Thing", theme: "Gospels", difficulty: "medium", clue: "Made of thorns and placed on Jesus's head before His crucifixion." },
  { answer: "Net", category: "Thing", theme: "Gospels", difficulty: "easy", clue: "A fishing tool the disciples left behind to follow Jesus." },
  { answer: "Lamp", category: "Thing", theme: "Psalms", difficulty: "medium", clue: "God's word is described as one for the psalmist's feet." },
  { answer: "Flood", category: "Event", theme: "Genesis", difficulty: "easy", clue: "A worldwide judgment that only Noah's family survived." },
  { answer: "Exodus", category: "Event", theme: "Exodus", difficulty: "easy", clue: "Israel's departure from slavery in Egypt." },
  { answer: "Passover", category: "Event", theme: "Exodus", difficulty: "medium", clue: "The night the angel of death passed over Israelite homes." },
  { answer: "Crucifixion", category: "Event", theme: "Gospels", difficulty: "medium", clue: "The event in which Jesus died on the cross." },
  { answer: "Resurrection", category: "Event", theme: "Gospels", difficulty: "medium", clue: "Jesus rising from the dead on the third day." },
  { answer: "Pentecost", category: "Event", theme: "Acts", difficulty: "hard", clue: "The day the Holy Spirit came upon the early church." },
  { answer: "Transfiguration", category: "Event", theme: "Gospels", difficulty: "hard", clue: "Jesus shone with glory before Peter, James, and John." },
  { answer: "Baptism", category: "Event", theme: "Gospels", difficulty: "easy", clue: "John performed this on Jesus in the Jordan River." },
  { answer: "Ascension", category: "Event", theme: "Acts", difficulty: "hard", clue: "Jesus being taken up into heaven after His resurrection." },
  { answer: "Nativity", category: "Event", theme: "Gospels", difficulty: "medium", clue: "The birth of Jesus in Bethlehem." },
  { answer: "Rapture", category: "Event", theme: "Bible teaching", difficulty: "hard", clue: "Believers being caught up to meet the Lord, per 1 Thessalonians." },
  { answer: "Fall", category: "Event", theme: "Genesis", difficulty: "medium", clue: "Adam and Eve's disobedience that brought sin into the world." },
  { answer: "Judgment", category: "Event", theme: "Bible teaching", difficulty: "hard", clue: "A future day when all will be held accountable before God." },
  { answer: "Covenant", category: "Event", theme: "Bible teaching", difficulty: "hard", clue: "A binding promise, such as the one God made with Abraham." }
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const rounds = subjects.map((entry, index) => ({
  id: `ba-r${(index + 1).toString().padStart(3, "0")}-${slugify(entry.answer)}`,
  answer: entry.answer,
  category: entry.category,
  clue: entry.clue,
  theme: entry.theme,
  difficulty: entry.difficulty,
  teachingNote: buildBibleAnagramStudyNote(entry).teachingNote
}));

const sessions = [];
for (let index = 0; index < rounds.length; index += ROUNDS_PER_SESSION) {
  const sessionNumber = Math.floor(index / ROUNDS_PER_SESSION) + 1;
  const chunk = rounds.slice(index, index + ROUNDS_PER_SESSION);

  if (chunk.length < 1) {
    break;
  }

  sessions.push({
    id: `ba-session-${sessionNumber.toString().padStart(2, "0")}`,
    title: `Bible Anagrams Deck ${sessionNumber}`,
    theme: "Bible names, places, things, and events",
    rounds: chunk
  });
}

const pack = {
  $schema: "https://example.local/schemas/bible-anagrams.schema.json",
  game: "bible-anagrams",
  version: 1,
  displayName: "Bible Anagrams",
  roundsPerSession: ROUNDS_PER_SESSION,
  sessions
};

await mkdir(dataDir, { recursive: true });
await writeFile(path.join(dataDir, "bible-anagrams.json"), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(`Generated bible-anagrams.json with ${sessions.length} sessions (${rounds.length} rounds).`);
