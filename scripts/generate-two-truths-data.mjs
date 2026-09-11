import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../src/data");

const ROUNDS_PER_SESSION = 10;

// Each entry is one hand-verified statement triple. `lieIndex` marks the false statement;
// the other two are accurate to the biblical text. Scoped to ~70 well-checked subjects
// (one round each) rather than pushed to a larger volume with reworded duplicates, per the
// project's content-accuracy priority for this game.
const subjects = [
  {
    subject: "Noah",
    subjectType: "person",
    theme: "Genesis",
    reference: "Genesis 6-9",
    statements: [
      "Noah built the ark according to God's instructions.",
      "The ark had three stories.",
      "The ark had four stories."
    ],
    lieIndex: 2,
    explanation: "Genesis 6:16 describes the ark with lower, second, and third stories — three levels, not four."
  },
  {
    subject: "Moses",
    subjectType: "person",
    theme: "Exodus",
    reference: "Exodus 2, 14",
    statements: [
      "Moses was found as a baby in a basket among the reeds.",
      "Moses led the Israelites out of Egypt through the Red Sea.",
      "Moses parted the Jordan River to lead Israel out of Egypt."
    ],
    lieIndex: 2,
    explanation: "Moses parted the Red Sea in Exodus 14. Joshua later led Israel across the Jordan River."
  },
  {
    subject: "David and Goliath",
    subjectType: "event",
    theme: "1 Samuel",
    reference: "1 Samuel 17",
    statements: [
      "David defeated Goliath with a sling and a stone.",
      "Goliath was a Philistine giant.",
      "David used King Saul's armor and sword to fight Goliath."
    ],
    lieIndex: 2,
    explanation: "David refused Saul's armor because it didn't fit and he wasn't used to it (1 Samuel 17:39)."
  },
  {
    subject: "Samson",
    subjectType: "person",
    theme: "Judges",
    reference: "Judges 13-16",
    statements: [
      "Samson's strength was tied to his uncut hair.",
      "Delilah cut Samson's hair to weaken him.",
      "Samson was one of the twelve apostles."
    ],
    lieIndex: 2,
    explanation: "Samson was a judge of Israel, long before the New Testament apostles."
  },
  {
    subject: "Daniel",
    subjectType: "person",
    theme: "Daniel",
    reference: "Daniel 6",
    statements: [
      "Daniel was thrown into a lions' den for praying.",
      "Daniel interpreted the king's dreams.",
      "Daniel was killed by the lions."
    ],
    lieIndex: 2,
    explanation: "God shut the lions' mouths and Daniel was unharmed (Daniel 6:22)."
  },
  {
    subject: "Jonah",
    subjectType: "person",
    theme: "Jonah",
    reference: "Jonah 1-3",
    statements: [
      "Jonah was swallowed by a great fish.",
      "Jonah was sent to preach to Nineveh.",
      "Jonah eagerly obeyed God's call from the start."
    ],
    lieIndex: 2,
    explanation: "Jonah initially fled from God's call and boarded a ship to Tarshish instead (Jonah 1:3)."
  },
  {
    subject: "Esther",
    subjectType: "person",
    theme: "Esther",
    reference: "Esther 2, 4",
    statements: [
      "Esther became queen of Persia.",
      "Esther risked her life to save the Jewish people.",
      "Esther's story is set during the Babylonian exile under Nebuchadnezzar."
    ],
    lieIndex: 2,
    explanation: "Esther's story takes place in Persia under King Ahasuerus, not Babylon under Nebuchadnezzar."
  },
  {
    subject: "Ruth",
    subjectType: "person",
    theme: "Ruth",
    reference: "Ruth 1, 2, 4",
    statements: [
      "Ruth was a Moabite who stayed loyal to her mother-in-law Naomi.",
      "Ruth gleaned grain in the fields of Boaz.",
      "Ruth was the mother of King David."
    ],
    lieIndex: 2,
    explanation: "Ruth was David's great-grandmother — her son Obed was the father of Jesse, David's father."
  },
  {
    subject: "Joseph son of Jacob",
    subjectType: "person",
    theme: "Genesis",
    reference: "Genesis 37",
    statements: [
      "Joseph's brothers sold him into slavery.",
      "Joseph became a powerful official in Egypt.",
      "Joseph was the firstborn son of Jacob."
    ],
    lieIndex: 2,
    explanation: "Reuben was Jacob's firstborn; Joseph was the eleventh of twelve sons."
  },
  {
    subject: "Abraham",
    subjectType: "person",
    theme: "Genesis",
    reference: "Genesis 17, 22",
    statements: [
      "God changed Abram's name to Abraham.",
      "Abraham was asked to sacrifice his son Isaac.",
      "Abraham was the father of the twelve tribes of Israel."
    ],
    lieIndex: 2,
    explanation: "Abraham's grandson Jacob had twelve sons who became the twelve tribes."
  },
  {
    subject: "Jacob",
    subjectType: "person",
    theme: "Genesis",
    reference: "Genesis 25, 32",
    statements: [
      "Jacob wrestled with an angel and was renamed Israel.",
      "Jacob had twelve sons.",
      "Jacob was Isaac's older twin brother."
    ],
    lieIndex: 2,
    explanation: "Esau was born first; Jacob was Isaac's younger twin son."
  },
  {
    subject: "Elijah",
    subjectType: "person",
    theme: "1 Kings",
    reference: "1 Kings 18-19",
    statements: [
      "Elijah defeated the prophets of Baal on Mount Carmel.",
      "Elijah was taken up to heaven in a whirlwind.",
      "Elijah never experienced discouragement or fear."
    ],
    lieIndex: 2,
    explanation: "Elijah fled in fear from Jezebel and asked God to let him die (1 Kings 19)."
  },
  {
    subject: "Solomon",
    subjectType: "person",
    theme: "1 Kings",
    reference: "1 Kings 3, 6",
    statements: [
      "Solomon asked God for wisdom.",
      "Solomon built the first temple in Jerusalem.",
      "Solomon was the first king of Israel."
    ],
    lieIndex: 2,
    explanation: "Saul was Israel's first king; Solomon was the third, after Saul and his father David."
  },
  {
    subject: "Job",
    subjectType: "person",
    theme: "Job",
    reference: "Job 1-2, 42",
    statements: [
      "Job lost his wealth, health, and children in a series of trials.",
      "In the end, God restored Job's fortunes.",
      "Job cursed God and rejected his faith by the end of the story."
    ],
    lieIndex: 2,
    explanation: "Job never cursed God — he struggled and questioned, but remained faithful (Job 1:22)."
  },
  {
    subject: "Paul the Apostle",
    subjectType: "person",
    theme: "Acts",
    reference: "Acts 9",
    statements: [
      "Paul was blinded on the road to Damascus.",
      "Paul was originally named Saul and persecuted Christians.",
      "Paul was one of Jesus's twelve original disciples."
    ],
    lieIndex: 2,
    explanation: "Paul was not among the original twelve — he encountered the risen Jesus later and became an apostle afterward."
  },
  {
    subject: "Peter",
    subjectType: "person",
    theme: "Gospels",
    reference: "Matthew 14, 26",
    statements: [
      "Peter denied knowing Jesus three times.",
      "Peter walked on water toward Jesus, briefly.",
      "Peter was the brother of the apostle John."
    ],
    lieIndex: 2,
    explanation: "Peter's brother was Andrew; James and John were a separate pair of brothers among the apostles."
  },
  {
    subject: "John the Baptist",
    subjectType: "person",
    theme: "Gospels",
    reference: "Luke 1, Matthew 3",
    statements: [
      "John the Baptist baptized Jesus in the Jordan River.",
      "John the Baptist ate locusts and wild honey.",
      "John the Baptist was Jesus's biological brother."
    ],
    lieIndex: 2,
    explanation: "John was Jesus's relative through Elizabeth and Mary, not a brother."
  },
  {
    subject: "Mary mother of Jesus",
    subjectType: "person",
    theme: "Gospels",
    reference: "Luke 1-2, John 2",
    statements: [
      "The angel Gabriel appeared to Mary to announce her pregnancy.",
      "Mary traveled to Bethlehem with Joseph before Jesus was born.",
      "Mary was present when Jesus performed His first miracle at a wedding in Nazareth."
    ],
    lieIndex: 2,
    explanation: "The wedding at Cana (John 2) took place in Cana, not Nazareth."
  },
  {
    subject: "Feeding of the Five Thousand",
    subjectType: "event",
    theme: "Gospels",
    reference: "John 6",
    statements: [
      "Jesus fed the crowd using five loaves and two fish.",
      "Twelve baskets of leftovers were gathered afterward.",
      "The miracle took place in Jerusalem's temple courts."
    ],
    lieIndex: 2,
    explanation: "The feeding of the five thousand happened in a remote location near the Sea of Galilee, not Jerusalem."
  },
  {
    subject: "Adam and Eve",
    subjectType: "event",
    theme: "Genesis",
    reference: "Genesis 2-4",
    statements: [
      "Adam and Eve were placed in the Garden of Eden.",
      "Eve was created from one of Adam's ribs.",
      "Adam and Eve had only one son, Cain."
    ],
    lieIndex: 2,
    explanation: "Adam and Eve had multiple named sons in Scripture, including Cain, Abel, and Seth."
  },
  {
    subject: "Cain and Abel",
    subjectType: "event",
    theme: "Genesis",
    reference: "Genesis 4",
    statements: [
      "Cain and Abel were sons of Adam and Eve.",
      "Cain killed his brother Abel out of jealousy.",
      "Abel was a farmer and Cain was a shepherd."
    ],
    lieIndex: 2,
    explanation: "It was the reverse: Cain worked the soil and Abel kept flocks, per Genesis 4:2."
  },
  {
    subject: "Joshua and Jericho",
    subjectType: "event",
    theme: "Joshua",
    reference: "Joshua 6",
    statements: [
      "The walls of Jericho fell after the Israelites marched around the city.",
      "The Israelites marched around Jericho for seven days.",
      "Joshua personally knocked down the walls with a battering ram."
    ],
    lieIndex: 2,
    explanation: "The walls fell after trumpets sounded and the people shouted — no battering ram was used (Joshua 6)."
  },
  {
    subject: "Gideon",
    subjectType: "person",
    theme: "Judges",
    reference: "Judges 6-7",
    statements: [
      "Gideon used a fleece of wool to test God's will.",
      "Gideon defeated a large Midianite army with only three hundred men.",
      "Gideon started out as a confident, fearless military leader."
    ],
    lieIndex: 2,
    explanation: "Gideon was hiding and threshing wheat in a winepress out of fear when God's angel first called him (Judges 6:11)."
  },
  {
    subject: "Deborah",
    subjectType: "person",
    theme: "Judges",
    reference: "Judges 4-5",
    statements: [
      "Deborah was a judge and prophetess who led Israel.",
      "Deborah helped lead Israel to victory over a Canaanite army.",
      "Deborah was a queen who ruled from a royal palace."
    ],
    lieIndex: 2,
    explanation: "Deborah held court under a palm tree as a judge and prophetess (Judges 4:5) — she was not a queen."
  },
  {
    subject: "Lazarus",
    subjectType: "person",
    theme: "Gospels",
    reference: "John 11",
    statements: [
      "Jesus raised Lazarus from the dead after he had been in the tomb four days.",
      "Lazarus was the brother of Mary and Martha.",
      "Lazarus doubted Jesus and refused to come out of the tomb."
    ],
    lieIndex: 2,
    explanation: "Lazarus came out when Jesus called him — there is no account of doubt or refusal (John 11:43-44)."
  },
  {
    subject: "The Tower of Babel",
    subjectType: "event",
    theme: "Genesis",
    reference: "Genesis 11",
    statements: [
      "The people built the tower to make a name for themselves.",
      "God confused their language so they could not understand one another.",
      "The tower was successfully completed and still stands today."
    ],
    lieIndex: 2,
    explanation: "The people stopped building and scattered once their language was confused (Genesis 11:8)."
  },
  {
    subject: "Isaac",
    subjectType: "person",
    theme: "Genesis",
    reference: "Genesis 24-27",
    statements: [
      "Isaac was the son of Abraham and Sarah.",
      "Isaac married Rebekah.",
      "Isaac was the older of his two sons, Esau and Jacob."
    ],
    lieIndex: 2,
    explanation: "Isaac was the father of Esau and Jacob; he was not one of the twins himself."
  },
  {
    subject: "The Ten Commandments",
    subjectType: "event",
    theme: "Exodus",
    reference: "Exodus 20, 31-32",
    statements: [
      "The commandments were given to Moses on Mount Sinai.",
      "Moses broke the first set of tablets in anger.",
      "The commandments were first written by Moses himself, not God."
    ],
    lieIndex: 2,
    explanation: "Exodus 31:18 says the tablets were written with the finger of God, not by Moses."
  },
  {
    subject: "Samuel",
    subjectType: "person",
    theme: "1 Samuel",
    reference: "1 Samuel 1-3",
    statements: [
      "Samuel was dedicated to the Lord's service by his mother Hannah.",
      "Samuel heard God's voice as a boy serving under Eli.",
      "Samuel was the first king of Israel."
    ],
    lieIndex: 2,
    explanation: "Samuel was a prophet and judge who anointed Saul as Israel's first king — he was not king himself."
  },
  {
    subject: "King Saul",
    subjectType: "person",
    theme: "1 Samuel",
    reference: "1 Samuel 9-10",
    statements: [
      "Saul was anointed as Israel's first king by Samuel.",
      "Saul was described as standing head and shoulders above the people.",
      "Saul was from the tribe of Judah."
    ],
    lieIndex: 2,
    explanation: "Saul was from the tribe of Benjamin (1 Samuel 9:1-2)."
  },
  {
    subject: "King David",
    subjectType: "person",
    theme: "1-2 Samuel",
    reference: "1 Samuel 16-17",
    statements: [
      "David was anointed king while he was still a shepherd boy.",
      "David played the harp to soothe King Saul.",
      "David was the oldest of Jesse's sons."
    ],
    lieIndex: 2,
    explanation: "David was the youngest of Jesse's sons (1 Samuel 16:11)."
  },
  {
    subject: "The Golden Calf",
    subjectType: "event",
    theme: "Exodus",
    reference: "Exodus 32",
    statements: [
      "The Israelites made a golden calf while Moses was on Mount Sinai.",
      "Aaron helped fashion the golden calf.",
      "Moses approved of the golden calf when he came down the mountain."
    ],
    lieIndex: 2,
    explanation: "Moses was angry and broke the tablets when he saw the golden calf (Exodus 32:19)."
  },
  {
    subject: "The Ten Plagues of Egypt",
    subjectType: "event",
    theme: "Exodus",
    reference: "Exodus 7-12",
    statements: [
      "The plagues were sent because Pharaoh refused to let Israel go.",
      "The final plague was the death of the firstborn.",
      "There were seven plagues in total."
    ],
    lieIndex: 2,
    explanation: "There were ten plagues in total, ending with the death of the firstborn (Exodus 7-12)."
  },
  {
    subject: "Balaam's Donkey",
    subjectType: "event",
    theme: "Numbers",
    reference: "Numbers 22",
    statements: [
      "Balaam's donkey saw an angel blocking the road.",
      "The donkey spoke to Balaam after he struck it.",
      "Balaam immediately believed the donkey without any surprise."
    ],
    lieIndex: 2,
    explanation: "Balaam was angry and argued with the donkey, not calmly accepting a talking animal (Numbers 22:29)."
  },
  {
    subject: "Rahab",
    subjectType: "person",
    theme: "Joshua",
    reference: "Joshua 2, 6",
    statements: [
      "Rahab hid the Israelite spies in Jericho.",
      "Rahab and her family were spared when Jericho fell.",
      "Rahab was a Philistine princess."
    ],
    lieIndex: 2,
    explanation: "Rahab lived in Jericho and is described in Scripture as a harlot, not a Philistine princess (Joshua 2:1)."
  },
  {
    subject: "Ehud",
    subjectType: "person",
    theme: "Judges",
    reference: "Judges 3",
    statements: [
      "Ehud was a left-handed judge of Israel.",
      "Ehud killed King Eglon of Moab with a hidden dagger.",
      "Ehud led Israel in a naval battle against Moab."
    ],
    lieIndex: 2,
    explanation: "Ehud's deliverance of Israel from Moab was a land conflict, not a naval battle (Judges 3:15-30)."
  },
  {
    subject: "Naomi",
    subjectType: "person",
    theme: "Ruth",
    reference: "Ruth 1",
    statements: [
      "Naomi's family moved to Moab during a famine.",
      "Naomi lost her husband and both her sons in Moab.",
      "Naomi remained in Moab for the rest of her life."
    ],
    lieIndex: 2,
    explanation: "Naomi returned to Bethlehem with Ruth after hearing the famine had ended (Ruth 1:6-7)."
  },
  {
    subject: "Hannah",
    subjectType: "person",
    theme: "1 Samuel",
    reference: "1 Samuel 1",
    statements: [
      "Hannah prayed earnestly for a son at the tabernacle.",
      "Hannah dedicated her son Samuel to the Lord's service.",
      "Hannah was the only wife of her husband Elkanah."
    ],
    lieIndex: 2,
    explanation: "Elkanah had two wives, Hannah and Peninnah (1 Samuel 1:2)."
  },
  {
    subject: "Elisha",
    subjectType: "person",
    theme: "2 Kings",
    reference: "1 Kings 19, 2 Kings 2",
    statements: [
      "Elisha was anointed as Elijah's successor.",
      "Elisha received a double portion of Elijah's spirit.",
      "Elisha was taken up to heaven in a whirlwind."
    ],
    lieIndex: 2,
    explanation: "It was Elijah, not Elisha, who was taken up to heaven in a whirlwind (2 Kings 2:11)."
  },
  {
    subject: "Naaman",
    subjectType: "person",
    theme: "2 Kings",
    reference: "2 Kings 5",
    statements: [
      "Naaman was a commander in the Syrian army with leprosy.",
      "Elisha told Naaman to wash in the Jordan River seven times.",
      "Naaman was healed immediately, before he ever touched the water."
    ],
    lieIndex: 2,
    explanation: "Naaman was healed only after washing in the Jordan seven times, as Elisha instructed (2 Kings 5:14)."
  },
  {
    subject: "Josiah",
    subjectType: "person",
    theme: "2 Kings",
    reference: "2 Kings 22-23",
    statements: [
      "Josiah became king of Judah as a young boy.",
      "The Book of the Law was rediscovered in the temple during Josiah's reign.",
      "Josiah led Judah further into idol worship."
    ],
    lieIndex: 2,
    explanation: "Josiah led major religious reforms against idolatry after the Law was rediscovered (2 Kings 23)."
  },
  {
    subject: "Nebuchadnezzar",
    subjectType: "person",
    theme: "Daniel",
    reference: "Daniel 2-4",
    statements: [
      "Nebuchadnezzar was king of Babylon.",
      "Nebuchadnezzar had a dream that Daniel interpreted.",
      "Nebuchadnezzar was a worshiper of the God of Israel from the start of his reign."
    ],
    lieIndex: 2,
    explanation: "Nebuchadnezzar only came to acknowledge God's sovereignty after later humbling experiences (Daniel 4:34-37)."
  },
  {
    subject: "Shadrach, Meshach, and Abednego",
    subjectType: "event",
    theme: "Daniel",
    reference: "Daniel 3",
    statements: [
      "The three men refused to bow to the king's golden image.",
      "They were thrown into a fiery furnace.",
      "They were burned to death in the furnace."
    ],
    lieIndex: 2,
    explanation: "They emerged from the furnace completely unharmed, without even the smell of fire on them (Daniel 3:27)."
  },
  {
    subject: "The Fall of Jericho's Spies",
    subjectType: "event",
    theme: "Joshua",
    reference: "Joshua 2",
    statements: [
      "Joshua sent two spies to scout Jericho.",
      "The spies escaped Jericho by a rope through a window.",
      "The spies were captured and imprisoned by the king of Jericho."
    ],
    lieIndex: 2,
    explanation: "Rahab hid the spies and helped them escape; they were never captured (Joshua 2:4-6, 15)."
  },
  {
    subject: "Zacchaeus",
    subjectType: "person",
    theme: "Gospels",
    reference: "Luke 19",
    statements: [
      "Zacchaeus was a wealthy tax collector.",
      "Zacchaeus climbed a sycamore tree to see Jesus.",
      "Zacchaeus refused to repay anyone he had cheated."
    ],
    lieIndex: 2,
    explanation: "Zacchaeus promised to give half his goods to the poor and repay fourfold anyone he had defrauded (Luke 19:8)."
  },
  {
    subject: "The Prodigal Son",
    subjectType: "event",
    theme: "Gospels",
    reference: "Luke 15",
    statements: [
      "The younger son asked for his inheritance early.",
      "The younger son squandered his inheritance in a far country.",
      "The father refused to welcome his son back home."
    ],
    lieIndex: 2,
    explanation: "The father ran to meet his returning son and celebrated his return (Luke 15:20-24)."
  },
  {
    subject: "The Good Samaritan",
    subjectType: "event",
    theme: "Gospels",
    reference: "Luke 10",
    statements: [
      "A man was beaten and left half dead on the road.",
      "A priest and a Levite passed by without helping.",
      "A Samaritan passed by without helping either."
    ],
    lieIndex: 2,
    explanation: "The Samaritan was the one who stopped and cared for the injured man (Luke 10:33-34)."
  },
  {
    subject: "The Wedding at Cana",
    subjectType: "event",
    theme: "Gospels",
    reference: "John 2",
    statements: [
      "Jesus turned water into wine at a wedding in Cana.",
      "Jesus's mother Mary was present at the wedding.",
      "This was described as the last miracle of Jesus's ministry."
    ],
    lieIndex: 2,
    explanation: "John 2:11 calls this the first of Jesus's miracles, not the last."
  },
  {
    subject: "The Transfiguration",
    subjectType: "event",
    theme: "Gospels",
    reference: "Matthew 17",
    statements: [
      "Jesus was transfigured on a mountain before Peter, James, and John.",
      "Moses and Elijah appeared and spoke with Jesus.",
      "The event took place in the temple in Jerusalem."
    ],
    lieIndex: 2,
    explanation: "The transfiguration took place on a high mountain, not in the temple (Matthew 17:1-2)."
  },
  {
    subject: "The Last Supper",
    subjectType: "event",
    theme: "Gospels",
    reference: "Matthew 26",
    statements: [
      "Jesus shared a Passover meal with His disciples.",
      "Jesus predicted that Peter would deny Him three times.",
      "Judas was not present at the Last Supper."
    ],
    lieIndex: 2,
    explanation: "Judas was present at the Last Supper before leaving to betray Jesus (Matthew 26:20-25)."
  },
  {
    subject: "The Crucifixion",
    subjectType: "event",
    theme: "Gospels",
    reference: "Matthew 27",
    statements: [
      "Jesus was crucified at a place called Golgotha.",
      "Darkness came over the land during the crucifixion.",
      "All of Jesus's disciples stayed with Him at the cross."
    ],
    lieIndex: 2,
    explanation: "Most of the disciples fled; only John and a few women are noted as present at the cross (John 19:25-26)."
  },
  {
    subject: "The Resurrection",
    subjectType: "event",
    theme: "Gospels",
    reference: "Matthew 28",
    statements: [
      "Women were the first to discover the empty tomb.",
      "An angel announced that Jesus had risen.",
      "The disciples immediately believed the women's report."
    ],
    lieIndex: 2,
    explanation: "The disciples initially thought the women's report was nonsense and did not believe them (Luke 24:11)."
  },
  {
    subject: "The Road to Emmaus",
    subjectType: "event",
    theme: "Gospels",
    reference: "Luke 24",
    statements: [
      "Two disciples walked to Emmaus after the resurrection.",
      "The risen Jesus joined them, but they did not recognize Him at first.",
      "They recognized Jesus immediately when He first spoke to them."
    ],
    lieIndex: 2,
    explanation: "They recognized Jesus only later, when He broke bread with them (Luke 24:30-31)."
  },
  {
    subject: "Stephen",
    subjectType: "person",
    theme: "Acts",
    reference: "Acts 6-7",
    statements: [
      "Stephen was one of the first deacons chosen by the early church.",
      "Stephen was stoned to death for his testimony about Jesus.",
      "Stephen recanted his faith to save his life."
    ],
    lieIndex: 2,
    explanation: "Stephen did not recant — he prayed for his killers as he was being stoned (Acts 7:59-60)."
  },
  {
    subject: "Philip and the Ethiopian",
    subjectType: "event",
    theme: "Acts",
    reference: "Acts 8",
    statements: [
      "Philip met an Ethiopian official reading from Isaiah.",
      "Philip explained that the passage spoke of Jesus.",
      "The Ethiopian official refused to be baptized."
    ],
    lieIndex: 2,
    explanation: "The Ethiopian official asked to be baptized right away and Philip baptized him (Acts 8:36-38)."
  },
  {
    subject: "Cornelius",
    subjectType: "person",
    theme: "Acts",
    reference: "Acts 10",
    statements: [
      "Cornelius was a Roman centurion.",
      "Peter had a vision that led him to visit Cornelius.",
      "Cornelius was a Jewish high priest."
    ],
    lieIndex: 2,
    explanation: "Cornelius was a Roman centurion and Gentile, not a Jewish high priest (Acts 10:1)."
  },
  {
    subject: "Barnabas",
    subjectType: "person",
    theme: "Acts",
    reference: "Acts 4, 9, 13",
    statements: [
      "Barnabas sold land and gave the proceeds to the apostles.",
      "Barnabas vouched for Paul before the apostles in Jerusalem.",
      "Barnabas and Paul never traveled together."
    ],
    lieIndex: 2,
    explanation: "Barnabas and Paul traveled together on missionary journeys, including from Antioch (Acts 13:2-3)."
  },
  {
    subject: "Timothy",
    subjectType: "person",
    theme: "Acts",
    reference: "Acts 16, 2 Timothy 1",
    statements: [
      "Timothy had a Greek father and a Jewish mother.",
      "Paul described Timothy's mother and grandmother as women of faith.",
      "Timothy was one of the original twelve apostles."
    ],
    lieIndex: 2,
    explanation: "Timothy was a younger companion of Paul, not one of Jesus's original twelve apostles."
  },
  {
    subject: "Lydia",
    subjectType: "person",
    theme: "Acts",
    reference: "Acts 16",
    statements: [
      "Lydia was a seller of purple cloth.",
      "Lydia's household was baptized after she believed.",
      "Lydia lived in the city of Rome."
    ],
    lieIndex: 2,
    explanation: "Lydia was from Thyatira and met Paul in Philippi, not Rome (Acts 16:14)."
  },
  {
    subject: "Silas",
    subjectType: "person",
    theme: "Acts",
    reference: "Acts 16",
    statements: [
      "Silas traveled with Paul on a missionary journey.",
      "Silas and Paul were imprisoned and sang hymns in jail.",
      "An earthquake had no effect on the prison where they were held."
    ],
    lieIndex: 2,
    explanation: "An earthquake shook the prison and opened the doors and everyone's chains (Acts 16:26)."
  },
  {
    subject: "Melchizedek",
    subjectType: "person",
    theme: "Genesis",
    reference: "Genesis 14",
    statements: [
      "Melchizedek was king of Salem.",
      "Melchizedek was described as a priest of God Most High.",
      "Melchizedek was a Philistine warlord."
    ],
    lieIndex: 2,
    explanation: "Melchizedek is described as king of Salem and priest of God Most High, not a Philistine warlord (Genesis 14:18)."
  },
  {
    subject: "The Queen of Sheba",
    subjectType: "person",
    theme: "1 Kings",
    reference: "1 Kings 10",
    statements: [
      "The Queen of Sheba visited Solomon to test him with hard questions.",
      "She brought gold, spices, and precious stones as gifts.",
      "She was unimpressed by Solomon's wisdom and wealth."
    ],
    lieIndex: 2,
    explanation: "She was overwhelmed, saying the half had not been told to her (1 Kings 10:6-7)."
  },
  {
    subject: "Absalom",
    subjectType: "person",
    theme: "2 Samuel",
    reference: "2 Samuel 15, 18",
    statements: [
      "Absalom was one of King David's sons.",
      "Absalom led a rebellion against his father David.",
      "Absalom successfully became king and ruled for many years."
    ],
    lieIndex: 2,
    explanation: "Absalom was killed during his rebellion and never established a lasting reign (2 Samuel 18:14-15)."
  },
  {
    subject: "Jephthah",
    subjectType: "person",
    theme: "Judges",
    reference: "Judges 11",
    statements: [
      "Jephthah was a judge of Israel who fought the Ammonites.",
      "Jephthah made a rash vow before his battle.",
      "Jephthah was welcomed home by his father's household from birth without conflict."
    ],
    lieIndex: 2,
    explanation: "Jephthah was driven out by his half-brothers before later being called back to lead (Judges 11:1-3)."
  },
  {
    subject: "Hezekiah",
    subjectType: "person",
    theme: "2 Kings",
    reference: "2 Kings 18-20",
    statements: [
      "Hezekiah was king of Judah.",
      "Hezekiah prayed and God extended his life by fifteen years.",
      "Hezekiah led Judah deeper into idol worship."
    ],
    lieIndex: 2,
    explanation: "Hezekiah is described as a reforming king who removed idols and trusted the Lord (2 Kings 18:3-4)."
  },
  {
    subject: "The Fiery Serpents",
    subjectType: "event",
    theme: "Numbers",
    reference: "Numbers 21",
    statements: [
      "The Israelites complained against God and Moses in the wilderness.",
      "God sent fiery serpents among the people.",
      "Moses made a golden serpent that the people were told to worship as a god."
    ],
    lieIndex: 2,
    explanation: "The bronze serpent on a pole was for the people to look at and be healed, not to be worshiped as a god (Numbers 21:8-9)."
  },
  {
    subject: "Manna in the Wilderness",
    subjectType: "event",
    theme: "Exodus",
    reference: "Exodus 16",
    statements: [
      "God provided manna for Israel to eat in the wilderness.",
      "The people were told to gather only enough for each day.",
      "The Israelites could store manna indefinitely without it spoiling."
    ],
    lieIndex: 2,
    explanation: "Manna left overnight bred worms and stank, except before the Sabbath (Exodus 16:19-20, 23-24)."
  },
  {
    subject: "The Twelve Spies",
    subjectType: "event",
    theme: "Numbers",
    reference: "Numbers 13-14",
    statements: [
      "Twelve spies were sent to scout the land of Canaan.",
      "Joshua and Caleb gave a good report of the land.",
      "All twelve spies agreed the Israelites should enter Canaan immediately."
    ],
    lieIndex: 2,
    explanation: "Ten of the twelve spies gave a fearful report that discouraged the people (Numbers 13:31-33)."
  },
  {
    subject: "The Widow's Oil",
    subjectType: "event",
    theme: "2 Kings",
    reference: "2 Kings 4",
    statements: [
      "A widow asked Elisha for help with her debts.",
      "Elisha told her to gather empty vessels and pour her oil into them.",
      "The oil ran out before all the vessels were filled."
    ],
    lieIndex: 2,
    explanation: "The oil kept flowing until every vessel was full and only stopped once there were no more vessels (2 Kings 4:6)."
  },
  {
    subject: "Jehoshaphat",
    subjectType: "person",
    theme: "2 Chronicles",
    reference: "2 Chronicles 20",
    statements: [
      "Jehoshaphat was a king of Judah.",
      "Jehoshaphat sought the Lord when facing a large enemy army.",
      "Jehoshaphat's army fought and won the battle by their own strength alone."
    ],
    lieIndex: 2,
    explanation: "The enemy armies turned on each other and Judah's army did not even need to fight (2 Chronicles 20:22-24)."
  },
  {
    subject: "The Nativity",
    subjectType: "event",
    theme: "Gospels",
    reference: "Luke 2",
    statements: [
      "Jesus was born in Bethlehem.",
      "Shepherds were told of His birth by an angel.",
      "Jesus was born in a grand palace."
    ],
    lieIndex: 2,
    explanation: "Jesus was laid in a manger because there was no room at the inn (Luke 2:7)."
  },
  {
    subject: "The Magi",
    subjectType: "event",
    theme: "Gospels",
    reference: "Matthew 2",
    statements: [
      "The Magi followed a star to find Jesus.",
      "The Magi brought gold, frankincense, and myrrh.",
      "The Magi returned and reported Jesus's location directly to King Herod."
    ],
    lieIndex: 2,
    explanation: "The Magi were warned in a dream not to return to Herod and left another way (Matthew 2:12)."
  },
  {
    subject: "John's Vision on Patmos",
    subjectType: "event",
    theme: "Revelation",
    reference: "Revelation 1",
    statements: [
      "John received his vision while exiled on the island of Patmos.",
      "John described seeing a vision of the risen Christ.",
      "John wrote Revelation while living comfortably in Rome."
    ],
    lieIndex: 2,
    explanation: "John received the vision in exile on Patmos, not in comfort in Rome (Revelation 1:9)."
  }
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const rounds = subjects.map((entry, index) => ({
  id: `ttl-r${(index + 1).toString().padStart(3, "0")}-${slugify(entry.subject)}`,
  subject: entry.subject,
  subjectType: entry.subjectType,
  statements: entry.statements,
  lieIndex: entry.lieIndex,
  explanation: entry.explanation,
  reference: entry.reference,
  theme: entry.theme,
  difficulty: index % 3 === 0 ? "hard" : index % 2 === 0 ? "medium" : "easy",
  teachingNote: `Review ${entry.subject} (${entry.reference}) before continuing.`
}));

const sessions = [];
for (let index = 0; index < rounds.length; index += ROUNDS_PER_SESSION) {
  const sessionNumber = Math.floor(index / ROUNDS_PER_SESSION) + 1;
  const chunk = rounds.slice(index, index + ROUNDS_PER_SESSION);

  if (chunk.length < 1) {
    break;
  }

  sessions.push({
    id: `ttl-session-${sessionNumber.toString().padStart(2, "0")}`,
    title: `Two Truths and a Lie Deck ${sessionNumber}`,
    theme: "Bible figures and events",
    rounds: chunk
  });
}

const pack = {
  $schema: "https://example.local/schemas/two-truths-and-a-lie.schema.json",
  game: "two-truths-and-a-lie",
  version: 1,
  displayName: "Two Truths and a Lie",
  roundsPerSession: ROUNDS_PER_SESSION,
  sessions
};

await mkdir(dataDir, { recursive: true });
await writeFile(path.join(dataDir, "two-truths-and-a-lie.json"), `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(`Generated two-truths-and-a-lie.json with ${sessions.length} sessions (${rounds.length} rounds).`);
