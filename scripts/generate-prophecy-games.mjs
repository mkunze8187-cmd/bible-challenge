import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCategoryBoardStudyNote } from "./structured-study-notes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");
const schemaDir = path.join(dataDir, "schemas");

const pairs = [
  {
    key: "seed",
    title: "Seed Of The Woman",
    theme: "Victory",
    prophecyReference: "Genesis 3:15",
    prophecySummary: "The serpent's head would be bruised by the woman's seed.",
    prophecyTextShort: "It shall bruise thy head, and thou shalt bruise his heel.",
    fulfillmentReference: "Hebrews 2:14",
    fulfillmentSummary: "Christ is presented as defeating the devil through death.",
    fulfillmentTextShort: "That through death he might destroy him that had the power of death.",
    answer: "Christ's victory over sin and death",
    difficulty: "medium",
    note: "This is commonly read by Christian interpreters as an early promise of victory over evil."
  },
  {
    key: "nations",
    title: "Blessing To All Nations",
    theme: "Nations",
    prophecyReference: "Genesis 12:3",
    prophecySummary: "All families of the earth would be blessed through Abram.",
    prophecyTextShort: "In thee shall all families of the earth be blessed.",
    fulfillmentReference: "Galatians 3:8",
    fulfillmentSummary: "Paul connects the promise to the gospel blessing reaching Gentiles.",
    fulfillmentTextShort: "In thee shall all nations be blessed.",
    answer: "Blessing to the nations",
    difficulty: "easy",
    note: "The New Testament explicitly applies this Abraham promise to the gospel going to the nations."
  },
  {
    key: "judah",
    title: "Ruler From Judah",
    theme: "Kingship",
    prophecyReference: "Genesis 49:10",
    prophecySummary: "The sceptre is associated with Judah and a coming ruler.",
    prophecyTextShort: "The sceptre shall not depart from Judah.",
    fulfillmentReference: "Hebrews 7:14",
    fulfillmentSummary: "Jesus is identified as coming from the tribe of Judah.",
    fulfillmentTextShort: "Our Lord sprang out of Juda.",
    answer: "Comes from Judah",
    difficulty: "easy",
    note: "The Judah connection is a widely recognized messianic theme."
  },
  {
    key: "prophet-like-moses",
    title: "Prophet Like Moses",
    theme: "Prophet",
    prophecyReference: "Deuteronomy 18:15",
    prophecySummary: "The Lord would raise up a prophet like Moses.",
    prophecyTextShort: "The Lord thy God will raise up unto thee a Prophet.",
    fulfillmentReference: "Acts 3:22",
    fulfillmentSummary: "Peter quotes this prophecy while preaching about Christ.",
    fulfillmentTextShort: "A prophet shall the Lord your God raise up unto you.",
    answer: "Prophet like Moses",
    difficulty: "medium",
    note: "Acts gives this passage a direct place in apostolic preaching about Jesus."
  },
  {
    key: "son-king",
    title: "Son And King",
    theme: "Kingship",
    prophecyReference: "Psalm 2:7",
    prophecySummary: "The anointed king is addressed as God's Son.",
    prophecyTextShort: "Thou art my Son; this day have I begotten thee.",
    fulfillmentReference: "Acts 13:33",
    fulfillmentSummary: "Paul quotes Psalm 2 in connection with Jesus being raised up.",
    fulfillmentTextShort: "Thou art my Son, this day have I begotten thee.",
    answer: "God's Son and anointed King",
    difficulty: "medium",
    note: "Psalm 2 is used in the New Testament to speak of the Messiah's sonship and reign."
  },
  {
    key: "resurrection",
    title: "Not Seeing Corruption",
    theme: "Resurrection",
    prophecyReference: "Psalm 16:10",
    prophecySummary: "The Holy One would not be left to corruption.",
    prophecyTextShort: "Neither wilt thou suffer thine Holy One to see corruption.",
    fulfillmentReference: "Acts 2:31",
    fulfillmentSummary: "Peter says this was spoken of Christ's resurrection.",
    fulfillmentTextShort: "His soul was not left in hell, neither his flesh did see corruption.",
    answer: "Resurrection without seeing corruption",
    difficulty: "easy",
    note: "Acts 2 directly connects Psalm 16 with the resurrection of Jesus."
  },
  {
    key: "forsaken",
    title: "Suffering Cry",
    theme: "Suffering",
    prophecyReference: "Psalm 22:1",
    prophecySummary: "The psalm opens with a cry of being forsaken.",
    prophecyTextShort: "My God, my God, why hast thou forsaken me?",
    fulfillmentReference: "Matthew 27:46",
    fulfillmentSummary: "Jesus speaks this line from the cross.",
    fulfillmentTextShort: "My God, my God, why hast thou forsaken me?",
    answer: "Jesus' suffering cry from the cross",
    difficulty: "easy",
    note: "The Gospel records Jesus using Psalm 22 language during the crucifixion."
  },
  {
    key: "garments",
    title: "Garments Divided",
    theme: "Suffering",
    prophecyReference: "Psalm 22:18",
    prophecySummary: "Garments are parted and lots are cast.",
    prophecyTextShort: "They part my garments among them, and cast lots upon my vesture.",
    fulfillmentReference: "John 19:24",
    fulfillmentSummary: "Soldiers cast lots for Jesus' garment.",
    fulfillmentTextShort: "They said therefore among themselves, Let us not rend it, but cast lots for it.",
    answer: "Garments divided",
    difficulty: "easy",
    note: "John explicitly cites the casting of lots as fulfillment of scripture."
  },
  {
    key: "bones",
    title: "Bones Not Broken",
    theme: "Suffering",
    prophecyReference: "Psalm 34:20",
    prophecySummary: "The righteous sufferer's bones are preserved.",
    prophecyTextShort: "He keepeth all his bones: not one of them is broken.",
    fulfillmentReference: "John 19:36",
    fulfillmentSummary: "Jesus' bones were not broken at the crucifixion.",
    fulfillmentTextShort: "A bone of him shall not be broken.",
    answer: "No bones broken",
    difficulty: "easy",
    note: "John cites this detail while describing Jesus' death."
  },
  {
    key: "betrayal-friend",
    title: "Betrayed By A Friend",
    theme: "Betrayal",
    prophecyReference: "Psalm 41:9",
    prophecySummary: "A familiar friend lifts up his heel against the speaker.",
    prophecyTextShort: "Mine own familiar friend... hath lifted up his heel against me.",
    fulfillmentReference: "John 13:18",
    fulfillmentSummary: "Jesus applies the text to betrayal within his circle.",
    fulfillmentTextShort: "He that eateth bread with me hath lifted up his heel against me.",
    answer: "Betrayed by a familiar friend",
    difficulty: "easy",
    note: "John records Jesus citing the psalm in the context of Judas's betrayal."
  },
  {
    key: "zeal",
    title: "Zeal For God's House",
    theme: "Temple",
    prophecyReference: "Psalm 69:9",
    prophecySummary: "Zeal for the Lord's house consumes the speaker.",
    prophecyTextShort: "The zeal of thine house hath eaten me up.",
    fulfillmentReference: "John 2:17",
    fulfillmentSummary: "The disciples remember this scripture after Jesus cleanses the temple.",
    fulfillmentTextShort: "The zeal of thine house hath eaten me up.",
    answer: "Zeal for God's house",
    difficulty: "medium",
    note: "John presents the temple cleansing through the lens of Psalm 69."
  },
  {
    key: "vinegar",
    title: "Vinegar Given",
    theme: "Suffering",
    prophecyReference: "Psalm 69:21",
    prophecySummary: "The suffering figure receives gall and vinegar.",
    prophecyTextShort: "In my thirst they gave me vinegar to drink.",
    fulfillmentReference: "John 19:29",
    fulfillmentSummary: "Jesus is given vinegar during the crucifixion.",
    fulfillmentTextShort: "They filled a spunge with vinegar... and put it to his mouth.",
    answer: "Vinegar offered at the cross",
    difficulty: "easy",
    note: "The Gospels connect this detail with Jesus' crucifixion."
  },
  {
    key: "right-hand",
    title: "At God's Right Hand",
    theme: "Exaltation",
    prophecyReference: "Psalm 110:1",
    prophecySummary: "The Lord invites David's Lord to sit at His right hand.",
    prophecyTextShort: "Sit thou at my right hand.",
    fulfillmentReference: "Hebrews 1:13",
    fulfillmentSummary: "The verse is applied to the exalted Son.",
    fulfillmentTextShort: "Sit on my right hand, until I make thine enemies thy footstool.",
    answer: "Sits at God's right hand",
    difficulty: "easy",
    note: "Psalm 110 is one of the New Testament's most frequent messianic texts."
  },
  {
    key: "rejected-stone",
    title: "Rejected Stone",
    theme: "Rejection",
    prophecyReference: "Psalm 118:22",
    prophecySummary: "The rejected stone becomes the head of the corner.",
    prophecyTextShort: "The stone which the builders refused is become the head stone.",
    fulfillmentReference: "Acts 4:11",
    fulfillmentSummary: "Peter applies the rejected stone to Jesus.",
    fulfillmentTextShort: "The stone which was set at nought of you builders.",
    answer: "Rejected stone",
    difficulty: "easy",
    note: "Acts directly applies the stone image to Jesus' rejection and exaltation."
  },
  {
    key: "virgin-sign",
    title: "Virgin-Born Sign",
    theme: "Birth",
    prophecyReference: "Isaiah 7:14",
    prophecySummary: "A child called Immanuel is given as a sign.",
    prophecyTextShort: "Behold, a virgin shall conceive, and bear a son.",
    fulfillmentReference: "Matthew 1:23",
    fulfillmentSummary: "Matthew quotes the sign in connection with Jesus' birth.",
    fulfillmentTextShort: "They shall call his name Emmanuel.",
    answer: "Virgin-born sign",
    difficulty: "easy",
    note: "Matthew explicitly quotes Isaiah 7:14 in the infancy narrative."
  },
  {
    key: "galilee-light",
    title: "Light In Galilee",
    theme: "Ministry",
    prophecyReference: "Isaiah 9:1-2",
    prophecySummary: "Light comes to Galilee and people in darkness.",
    prophecyTextShort: "The people that walked in darkness have seen a great light.",
    fulfillmentReference: "Matthew 4:15-16",
    fulfillmentSummary: "Matthew connects Jesus' Galilean ministry with Isaiah's words.",
    fulfillmentTextShort: "The people which sat in darkness saw great light.",
    answer: "Light to Galilee",
    difficulty: "easy",
    note: "The Gospel citation ties the prophecy to Jesus' public ministry in Galilee."
  },
  {
    key: "child-kingdom",
    title: "Child And Kingdom",
    theme: "Kingship",
    prophecyReference: "Isaiah 9:6-7",
    prophecySummary: "A child is born whose government and peace increase.",
    prophecyTextShort: "Unto us a child is born... and the government shall be upon his shoulder.",
    fulfillmentReference: "Luke 1:32-33",
    fulfillmentSummary: "Gabriel announces Davidic rule and an everlasting kingdom.",
    fulfillmentTextShort: "He shall reign over the house of Jacob for ever.",
    answer: "Kingdom without end",
    difficulty: "easy",
    note: "Luke's announcement uses Davidic kingdom language that Christians connect with Isaiah's promise."
  },
  {
    key: "wilderness-voice",
    title: "Voice In The Wilderness",
    theme: "Forerunner",
    prophecyReference: "Isaiah 40:3",
    prophecySummary: "A voice prepares the way of the Lord in the wilderness.",
    prophecyTextShort: "Prepare ye the way of the Lord.",
    fulfillmentReference: "Matthew 3:3",
    fulfillmentSummary: "John the Baptist is identified with the wilderness voice.",
    fulfillmentTextShort: "The voice of one crying in the wilderness.",
    answer: "Forerunner prepares the way",
    difficulty: "easy",
    note: "The Synoptic Gospels connect Isaiah 40:3 with John the Baptist."
  },
  {
    key: "servant",
    title: "Chosen Servant",
    theme: "Servant",
    prophecyReference: "Isaiah 42:1-4",
    prophecySummary: "The servant is upheld by God and brings judgment to the Gentiles.",
    prophecyTextShort: "Behold my servant, whom I uphold; mine elect.",
    fulfillmentReference: "Matthew 12:18-21",
    fulfillmentSummary: "Matthew quotes the servant passage in relation to Jesus' ministry.",
    fulfillmentTextShort: "Behold my servant, whom I have chosen.",
    answer: "Chosen servant",
    difficulty: "medium",
    note: "Matthew's quotation presents Jesus' ministry through Isaiah's servant language."
  },
  {
    key: "despised",
    title: "Despised And Rejected",
    theme: "Suffering",
    prophecyReference: "Isaiah 53:3",
    prophecySummary: "The servant is despised, rejected, and acquainted with grief.",
    prophecyTextShort: "He is despised and rejected of men.",
    fulfillmentReference: "John 1:11",
    fulfillmentSummary: "John says Jesus came to his own, and his own received him not.",
    fulfillmentTextShort: "He came unto his own, and his own received him not.",
    answer: "Rejected by his own",
    difficulty: "medium",
    note: "This pairing is thematic rather than a direct quotation, so the wording stays careful."
  },
  {
    key: "wounded",
    title: "Wounded For Transgressions",
    theme: "Suffering",
    prophecyReference: "Isaiah 53:5",
    prophecySummary: "The servant is wounded and bruised for others.",
    prophecyTextShort: "He was wounded for our transgressions.",
    fulfillmentReference: "1 Peter 2:24",
    fulfillmentSummary: "Peter applies the servant's suffering to Christ's death.",
    fulfillmentTextShort: "By whose stripes ye were healed.",
    answer: "Suffering servant",
    difficulty: "easy",
    note: "1 Peter explicitly uses Isaiah 53 language for Christ's suffering."
  },
  {
    key: "silent",
    title: "Silent Before Accusers",
    theme: "Suffering",
    prophecyReference: "Isaiah 53:7",
    prophecySummary: "The servant is oppressed yet does not open his mouth.",
    prophecyTextShort: "He opened not his mouth.",
    fulfillmentReference: "Matthew 27:14",
    fulfillmentSummary: "Jesus gives no answer before Pilate's accusations.",
    fulfillmentTextShort: "He answered him to never a word.",
    answer: "Silent before accusers",
    difficulty: "easy",
    note: "The Gospel scene is a widely recognized fulfillment connection to Isaiah 53."
  },
  {
    key: "rich-death",
    title: "With The Rich In Death",
    theme: "Death",
    prophecyReference: "Isaiah 53:9",
    prophecySummary: "The servant is associated with the rich in his death.",
    prophecyTextShort: "With the rich in his death.",
    fulfillmentReference: "Matthew 27:57-60",
    fulfillmentSummary: "Joseph of Arimathaea, a rich man, buries Jesus in his tomb.",
    fulfillmentTextShort: "A rich man of Arimathaea... laid it in his own new tomb.",
    answer: "Buried with the rich",
    difficulty: "medium",
    note: "Matthew's burial account is commonly read with Isaiah 53:9."
  },
  {
    key: "numbered",
    title: "Numbered With Transgressors",
    theme: "Suffering",
    prophecyReference: "Isaiah 53:12",
    prophecySummary: "The servant is numbered with transgressors.",
    prophecyTextShort: "He was numbered with the transgressors.",
    fulfillmentReference: "Luke 22:37",
    fulfillmentSummary: "Jesus quotes this line before his arrest.",
    fulfillmentTextShort: "He was reckoned among the transgressors.",
    answer: "Numbered with transgressors",
    difficulty: "easy",
    note: "Luke records Jesus explicitly quoting this line about what must be accomplished."
  },
  {
    key: "bethlehem",
    title: "Bethlehem Ruler",
    theme: "Birth",
    prophecyReference: "Micah 5:2",
    prophecySummary: "A ruler for Israel comes from Bethlehem.",
    prophecyTextShort: "Out of thee shall he come forth unto me that is to be ruler in Israel.",
    fulfillmentReference: "Matthew 2:1-6",
    fulfillmentSummary: "Chief priests and scribes identify Bethlehem when Herod asks about Messiah's birth.",
    fulfillmentTextShort: "In Bethlehem of Judaea: for thus it is written by the prophet.",
    answer: "Born in Bethlehem",
    difficulty: "easy",
    note: "Matthew directly links Messiah's birthplace with Micah 5:2."
  },
  {
    key: "donkey",
    title: "King On A Donkey",
    theme: "Kingship",
    prophecyReference: "Zechariah 9:9",
    prophecySummary: "Zion's king comes lowly and riding on an ass.",
    prophecyTextShort: "Thy King cometh unto thee... riding upon an ass.",
    fulfillmentReference: "Matthew 21:4-5",
    fulfillmentSummary: "Jesus enters Jerusalem on a donkey.",
    fulfillmentTextShort: "Behold, thy King cometh unto thee, meek.",
    answer: "Enters Jerusalem on a donkey",
    difficulty: "easy",
    note: "Matthew explicitly quotes Zechariah during the triumphal entry."
  },
  {
    key: "silver",
    title: "Thirty Pieces Of Silver",
    theme: "Betrayal",
    prophecyReference: "Zechariah 11:12-13",
    prophecySummary: "Thirty pieces of silver are weighed and connected with the potter.",
    prophecyTextShort: "So they weighed for my price thirty pieces of silver.",
    fulfillmentReference: "Matthew 27:9-10",
    fulfillmentSummary: "Matthew connects Judas's silver and the potter's field with prophetic scripture.",
    fulfillmentTextShort: "They took the thirty pieces of silver.",
    answer: "Thirty pieces of silver",
    difficulty: "medium",
    note: "Matthew cites the event as prophetic fulfillment; the textual attribution is discussed by interpreters."
  },
  {
    key: "pierced",
    title: "They Shall Look Upon Me",
    theme: "Suffering",
    prophecyReference: "Zechariah 12:10",
    prophecySummary: "The text speaks of looking on the one pierced.",
    prophecyTextShort: "They shall look upon me whom they have pierced.",
    fulfillmentReference: "John 19:37",
    fulfillmentSummary: "John cites the pierced-one text after Jesus' side is pierced.",
    fulfillmentTextShort: "They shall look on him whom they pierced.",
    answer: "Pierced",
    difficulty: "easy",
    note: "John explicitly quotes Zechariah 12:10 in the crucifixion account."
  },
  {
    key: "messenger",
    title: "Messenger Before The Lord",
    theme: "Forerunner",
    prophecyReference: "Malachi 3:1",
    prophecySummary: "A messenger prepares the way before the Lord.",
    prophecyTextShort: "I will send my messenger, and he shall prepare the way before me.",
    fulfillmentReference: "Mark 1:2",
    fulfillmentSummary: "Mark introduces John the Baptist with messenger language.",
    fulfillmentTextShort: "Behold, I send my messenger before thy face.",
    answer: "Messenger before the Lord",
    difficulty: "easy",
    note: "Mark uses messenger texts to frame John the Baptist's ministry."
  },
  {
    key: "elijah",
    title: "Elijah-Type Forerunner",
    theme: "Forerunner",
    prophecyReference: "Malachi 4:5-6",
    prophecySummary: "Elijah is promised before the great day of the Lord.",
    prophecyTextShort: "I will send you Elijah the prophet before the coming of the great... day.",
    fulfillmentReference: "Matthew 17:11-13",
    fulfillmentSummary: "Jesus says Elijah has come, and the disciples understand John the Baptist.",
    fulfillmentTextShort: "Then the disciples understood that he spake unto them of John the Baptist.",
    answer: "Elijah-type forerunner",
    difficulty: "medium",
    note: "Matthew presents John the Baptist as fulfilling the Elijah-type role."
  },
  {
    key: "egypt",
    title: "Called Out Of Egypt",
    theme: "Birth",
    prophecyReference: "Hosea 11:1",
    prophecySummary: "God calls His son out of Egypt.",
    prophecyTextShort: "Out of Egypt have I called my son.",
    fulfillmentReference: "Matthew 2:15",
    fulfillmentSummary: "Matthew applies the line after the holy family's return from Egypt.",
    fulfillmentTextShort: "Out of Egypt have I called my son.",
    answer: "Called out of Egypt",
    difficulty: "medium",
    note: "Matthew reads Israel's story typologically in relation to Jesus."
  }
];

const categoryPool = [
  ["Messiah's Birth", pairs.filter((pair) => ["virgin-sign", "bethlehem", "egypt"].includes(pair.key))],
  ["Messiah's Suffering", pairs.filter((pair) => ["forsaken", "vinegar", "wounded", "silent", "rich-death", "numbered", "pierced", "bones", "garments"].includes(pair.key))],
  ["Messiah's Kingship", pairs.filter((pair) => ["judah", "son-king", "child-kingdom", "right-hand", "donkey"].includes(pair.key))],
  ["Forerunner / Messenger", pairs.filter((pair) => ["wilderness-voice", "messenger", "elijah"].includes(pair.key))],
  ["Nations", pairs.filter((pair) => ["nations", "servant", "galilee-light"].includes(pair.key))],
  ["Jerusalem / Temple", pairs.filter((pair) => ["zeal", "donkey", "silver"].includes(pair.key))],
  ["Resurrection / Victory", pairs.filter((pair) => ["seed", "resurrection", "rejected-stone"].includes(pair.key))],
  ["Betrayal / Rejection", pairs.filter((pair) => ["betrayal-friend", "silver", "despised", "rejected-stone"].includes(pair.key))],
  ["New Covenant", pairs.filter((pair) => ["wounded", "nations", "servant"].includes(pair.key))],
  ["Day of the Lord", pairs.filter((pair) => ["elijah", "right-hand", "seed"].includes(pair.key))]
];

function sessionize(prefix, titlePrefix, theme, rounds, size = 5) {
  const sessions = [];
  for (let index = 0; index < rounds.length; index += size) {
    sessions.push({
      id: `${prefix}-session-${String(index / size + 1).padStart(2, "0")}`,
      title: `${titlePrefix} ${String(index / size + 1).padStart(2, "0")}`,
      theme,
      rounds: rounds.slice(index, index + size)
    });
  }
  return sessions;
}

function pack(game, displayName, roundsPerSession, sessions) {
  return {
    $schema: `./schemas/${game}.schema.json`,
    game,
    version: 1,
    displayName,
    roundsPerSession,
    sessions
  };
}

function makeSchema(game, title, roundProperties, requiredRoundProps) {
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
      round: {
        type: "object",
        additionalProperties: false,
        required: requiredRoundProps,
        properties: roundProperties
      }
    }
  };
}

const difficulty = { enum: ["easy", "medium", "hard"] };
const text = { type: "string", minLength: 1 };

const fulfillmentTextByReference = {
  "Hebrews 2:14":
    "Forasmuch then as the children are partakers of flesh and blood, he also himself likewise took part of the same; that through death he might destroy him that had the power of death, that is, the devil;",
  "Galatians 3:8":
    "And the scripture, foreseeing that God would justify the heathen through faith, preached before the gospel unto Abraham, saying, In thee shall all nations be blessed.",
  "Hebrews 7:14":
    "For it is evident that our Lord sprang out of Juda; of which tribe Moses spake nothing concerning priesthood.",
  "Acts 3:22":
    "For Moses truly said unto the fathers, A prophet shall the Lord your God raise up unto you of your brethren, like unto me; him shall ye hear in all things whatsoever he shall say unto you.",
  "Acts 13:33":
    "God hath fulfilled the same unto us their children, in that he hath raised up Jesus again; as it is also written in the second psalm, Thou art my Son, this day have I begotten thee.",
  "Acts 2:31":
    "He seeing this before spake of the resurrection of Christ, that his soul was not left in hell, neither his flesh did see corruption.",
  "Matthew 27:46":
    "And about the ninth hour Jesus cried with a loud voice, saying, Eli, Eli, lama sabachthani? that is to say, My God, my God, why hast thou forsaken me?",
  "John 19:24":
    "They said therefore among themselves, Let us not rend it, but cast lots for it, whose it shall be: that the scripture might be fulfilled, which saith, They parted my raiment among them, and for my vesture they did cast lots. These things therefore the soldiers did.",
  "John 19:36": "For these things were done, that the scripture should be fulfilled, A bone of him shall not be broken.",
  "John 13:18":
    "I speak not of you all: I know whom I have chosen: but that the scripture may be fulfilled, He that eateth bread with me hath lifted up his heel against me.",
  "John 2:17": "And his disciples remembered that it was written, The zeal of thine house hath eaten me up.",
  "John 19:29":
    "Now there was set a vessel full of vinegar: and they filled a spunge with vinegar, and put it upon hyssop, and put it to his mouth.",
  "Hebrews 1:13": "But to which of the angels said he at any time, Sit on my right hand, until I make thine enemies thy footstool?",
  "Acts 4:11": "This is the stone which was set at nought of you builders, which is become the head of the corner.",
  "Matthew 1:23":
    "Behold, a virgin shall be with child, and shall bring forth a son, and they shall call his name Emmanuel, which being interpreted is, God with us.",
  "Matthew 4:15-16":
    "The land of Zabulon, and the land of Nephthalim, by the way of the sea, beyond Jordan, Galilee of the Gentiles; The people which sat in darkness saw great light; and to them which sat in the region and shadow of death light is sprung up.",
  "Luke 1:32-33":
    "He shall be great, and shall be called the Son of the Highest: and the Lord God shall give unto him the throne of his father David: And he shall reign over the house of Jacob for ever; and of his kingdom there shall be no end.",
  "Matthew 3:3":
    "For this is he that was spoken of by the prophet Esaias, saying, The voice of one crying in the wilderness, Prepare ye the way of the Lord, make his paths straight.",
  "Matthew 12:18-21":
    "Behold my servant, whom I have chosen; my beloved, in whom my soul is well pleased: I will put my spirit upon him, and he shall shew judgment to the Gentiles. He shall not strive, nor cry; neither shall any man hear his voice in the streets. A bruised reed shall he not break, and smoking flax shall he not quench, till he send forth judgment unto victory. And in his name shall the Gentiles trust.",
  "John 1:11": "He came unto his own, and his own received him not.",
  "1 Peter 2:24":
    "Who his own self bare our sins in his own body on the tree, that we, being dead to sins, should live unto righteousness: by whose stripes ye were healed.",
  "Matthew 27:14": "And he answered him to never a word; insomuch that the governor marvelled greatly.",
  "Matthew 27:57-60":
    "When the even was come, there came a rich man of Arimathaea, named Joseph, who also himself was Jesus' disciple: He went to Pilate, and begged the body of Jesus. Then Pilate commanded the body to be delivered. And when Joseph had taken the body, he wrapped it in a clean linen cloth, And laid it in his own new tomb, which he had hewn out in the rock: and he rolled a great stone to the door of the sepulchre, and departed.",
  "Luke 22:37":
    "For I say unto you, that this that is written must yet be accomplished in me, And he was reckoned among the transgressors: for the things concerning me have an end.",
  "Matthew 2:1-6":
    "Now when Jesus was born in Bethlehem of Judaea in the days of Herod the king, behold, there came wise men from the east to Jerusalem, Saying, Where is he that is born King of the Jews? for we have seen his star in the east, and are come to worship him. When Herod the king had heard these things, he was troubled, and all Jerusalem with him. And when he had gathered all the chief priests and scribes of the people together, he demanded of them where Christ should be born. And they said unto him, In Bethlehem of Judaea: for thus it is written by the prophet, And thou Bethlehem, in the land of Juda, art not the least among the princes of Juda: for out of thee shall come a Governor, that shall rule my people Israel."
};

const prophecyMatchRounds = pairs.slice(0, 25).map((pair, index) => ({
  id: `pm-${String(index + 1).padStart(3, "0")}`,
  title: pair.title,
  theme: pair.theme,
  prophecyReference: pair.prophecyReference,
  prophecySummary: pair.prophecySummary,
  prophecyTextShort: pair.prophecyTextShort,
  fulfillmentReference: pair.fulfillmentReference,
  fulfillmentSummary: pair.fulfillmentSummary,
  fulfillmentTextShort: pair.fulfillmentTextShort,
  answerKey: `pm-${pair.key}`,
  difficulty: pair.difficulty,
  teachingNote: pair.note
}));

const answerTypes = pairs.map((pair) => pair.answer);
const messiahRounds = pairs.slice(0, 25).map((pair, index) => {
  const distractors = answerTypes.filter((answer) => answer !== pair.answer).slice(index % 7, index % 7 + 3);
  while (distractors.length < 3) {
    distractors.push(answerTypes[(index + distractors.length + 5) % answerTypes.length]);
  }
  return {
    id: `mp-${String(index + 1).padStart(3, "0")}`,
    title: pair.title,
    theme: pair.theme,
    prophecyReference: pair.prophecyReference,
    prophecyTextShort: pair.prophecyTextShort,
    prompt: "Which fulfillment, event, or messianic theme is connected with this prophecy?",
    correctAnswer: pair.answer,
    choices: [pair.answer, ...distractors.slice(0, 3)].sort(),
    fulfillmentReference: pair.fulfillmentReference,
    fulfillmentSummary: pair.fulfillmentSummary,
    difficulty: pair.difficulty,
    teachingNote: pair.note
  };
});

const clueRounds = pairs.slice(0, 25).map((pair, index) => ({
  id: `pcl-${String(index + 1).padStart(3, "0")}`,
  title: pair.title,
  theme: pair.theme,
  answer: pair.answer,
  acceptedAnswers: [pair.answer, pair.title, pair.prophecyReference, pair.fulfillmentReference],
  reference: pair.prophecyReference,
  fulfillmentReference: pair.fulfillmentReference,
  clues: [
    `This prophecy belongs to the ${pair.theme.toLowerCase()} theme.`,
    `The Old Testament reference is ${pair.prophecyReference}.`,
    `The wording includes: "${pair.prophecyTextShort}"`,
    `A New Testament connection appears at ${pair.fulfillmentReference}.`,
    `The fulfillment wording includes: "${pair.fulfillmentTextShort}"`
  ],
  difficulty: pair.difficulty,
  teachingNote: pair.note
}));

const fulfillmentRounds = pairs.slice(0, 25).map((pair, index) => {
  const distractors = pairs.filter((candidate) => candidate.key !== pair.key).slice((index * 2) % 10, (index * 2) % 10 + 3);
  while (distractors.length < 3) {
    distractors.push(pairs[(index + distractors.length + 4) % pairs.length]);
  }
  return {
    id: `ff-${String(index + 1).padStart(3, "0")}`,
    title: pair.title,
    theme: pair.theme,
    fulfillmentReference: pair.fulfillmentReference,
    fulfillmentSummary: pair.fulfillmentSummary,
    fulfillmentText: fulfillmentTextByReference[pair.fulfillmentReference] ?? pair.fulfillmentTextShort,
    prompt: "Which Old Testament prophecy is most directly connected with this New Testament fulfillment?",
    correctProphecyReference: pair.prophecyReference,
    correctProphecySummary: pair.prophecySummary,
    choices: [
      { reference: pair.prophecyReference, summary: pair.prophecySummary },
      ...distractors.slice(0, 3).map((candidate) => ({
        reference: candidate.prophecyReference,
        summary: candidate.prophecySummary
      }))
    ].sort((left, right) => left.reference.localeCompare(right.reference)),
    difficulty: pair.difficulty,
    teachingNote: pair.note
  };
});

function buildCategorySessions() {
  const sessions = [];
  for (let sessionIndex = 0; sessionIndex < 25; sessionIndex += 1) {
    const selectedPools = Array.from({ length: 5 }, (_, offset) => categoryPool[(sessionIndex + offset) % categoryPool.length]);
    const categories = selectedPools.map(([category]) => category);
    const cards = selectedPools.flatMap(([category, pool], categoryIndex) =>
      Array.from({ length: 3 }, (_, cardOffset) => {
        const pair = pool[(sessionIndex + categoryIndex + cardOffset) % pool.length];
        return {
          cardId: `pc-s${String(sessionIndex + 1).padStart(2, "0")}-c${String(categoryIndex * 3 + cardOffset + 1).padStart(2, "0")}`,
          reference: pair.prophecyReference,
          summary: pair.prophecySummary,
          textShort: pair.prophecyTextShort,
          category,
          difficulty: pair.difficulty,
          teachingNote: pair.note
        };
      })
    );

    sessions.push({
      id: `pc-session-${String(sessionIndex + 1).padStart(2, "0")}`,
      title: `Prophecy Category Board ${String(sessionIndex + 1).padStart(2, "0")}`,
      theme: "Sorting prophecy references by major theme",
      rounds: [
        {
          id: `pc-${String(sessionIndex + 1).padStart(3, "0")}`,
          title: `Prophecy Category Board ${String(sessionIndex + 1).padStart(2, "0")}`,
          theme: "Reference-based prophecy categories",
          difficulty: difficulty(sessionIndex),
          categories,
          cards,
          ...buildCategoryBoardStudyNote({
            title: `Prophecy Category Board ${String(sessionIndex + 1).padStart(2, "0")}`,
            categories,
            cards
          })
        }
      ]
    });
  }
  return sessions;
}

const commonProphecyProps = {
  id: text,
  title: text,
  theme: text,
  prophecyReference: text,
  prophecySummary: text,
  prophecyTextShort: text,
  fulfillmentReference: text,
  fulfillmentSummary: text,
  fulfillmentTextShort: text,
  answerKey: text,
  difficulty,
  teachingNote: text
};

const packs = [
  [
    "prophecy-match",
    pack("prophecy-match", "Prophecy Match Challenge", 5, sessionize("pm", "Prophecy Match Set", "Recognized prophecy and fulfillment pairs", prophecyMatchRounds)),
    makeSchema("prophecy-match", "Prophecy Match Challenge Pack", commonProphecyProps, Object.keys(commonProphecyProps))
  ],
  [
    "messiah-prophecy",
    pack("messiah-prophecy", "Messiah Prophecy Challenge", 5, sessionize("mp", "Messiah Prophecy Set", "Messianic prophecy answer choices", messiahRounds)),
    makeSchema(
      "messiah-prophecy",
      "Messiah Prophecy Challenge Pack",
      {
        id: text,
        title: text,
        theme: text,
        prophecyReference: text,
        prophecyTextShort: text,
        prompt: text,
        correctAnswer: text,
        choices: { type: "array", minItems: 4, maxItems: 4, uniqueItems: true, items: text },
        fulfillmentReference: text,
        fulfillmentSummary: text,
        difficulty,
        teachingNote: text
      },
      ["id", "title", "theme", "prophecyReference", "prophecyTextShort", "prompt", "correctAnswer", "choices", "fulfillmentReference", "fulfillmentSummary", "difficulty", "teachingNote"]
    )
  ],
  [
    "prophecy-clue-ladder",
    pack("prophecy-clue-ladder", "Prophecy Clue Ladder", 5, sessionize("pcl", "Prophecy Clue Ladder Set", "Five-clue prophecy identification rounds", clueRounds)),
    makeSchema(
      "prophecy-clue-ladder",
      "Prophecy Clue Ladder Pack",
      {
        id: text,
        title: text,
        theme: text,
        answer: text,
        acceptedAnswers: { type: "array", minItems: 1, uniqueItems: true, items: text },
        reference: text,
        fulfillmentReference: text,
        clues: { type: "array", minItems: 5, maxItems: 5, items: text },
        difficulty,
        teachingNote: text
      },
      ["id", "title", "theme", "answer", "acceptedAnswers", "reference", "fulfillmentReference", "clues", "difficulty", "teachingNote"]
    )
  ],
  [
    "fulfillment-finder",
    pack("fulfillment-finder", "Fulfillment Finder Challenge", 5, sessionize("ff", "Fulfillment Finder Set", "Find the Old Testament prophecy behind a fulfillment", fulfillmentRounds)),
    makeSchema(
      "fulfillment-finder",
      "Fulfillment Finder Challenge Pack",
      {
        id: text,
        title: text,
        theme: text,
        fulfillmentReference: text,
        fulfillmentSummary: text,
        fulfillmentText: text,
        prompt: text,
        correctProphecyReference: text,
        correctProphecySummary: text,
        choices: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["reference", "summary"],
            properties: { reference: text, summary: text }
          }
        },
        difficulty,
        teachingNote: text
      },
      ["id", "title", "theme", "fulfillmentReference", "fulfillmentSummary", "fulfillmentText", "prompt", "correctProphecyReference", "correctProphecySummary", "choices", "difficulty", "teachingNote"]
    )
  ],
  [
    "prophecy-categories",
    pack("prophecy-categories", "Prophecy Categories Challenge", 1, buildCategorySessions()),
    makeSchema(
      "prophecy-categories",
      "Prophecy Categories Challenge Pack",
      {
        id: text,
        title: text,
        theme: text,
        difficulty,
        scriptureReference: text,
        teachingNote: text,
        categories: { type: "array", minItems: 5, maxItems: 5, uniqueItems: true, items: text },
        cards: {
          type: "array",
          minItems: 15,
          maxItems: 25,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["cardId", "reference", "summary", "textShort", "category", "difficulty", "teachingNote"],
            properties: {
              cardId: { type: "string", pattern: "^[a-z0-9-]+$" },
              reference: text,
              summary: text,
              textShort: text,
              category: text,
              difficulty,
              teachingNote: text
            }
          }
        }
      },
      ["id", "title", "theme", "categories", "cards", "difficulty", "teachingNote"]
    )
  ]
];

await mkdir(schemaDir, { recursive: true });

for (const [game, data, schema] of packs) {
  await writeFile(path.join(dataDir, `${game}.json`), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await writeFile(path.join(schemaDir, `${game}.schema.json`), `${JSON.stringify(schema, null, 2)}\n`, "utf8");
}

console.log("Generated prophecy challenge data and schemas.");
