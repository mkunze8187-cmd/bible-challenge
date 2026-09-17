import { writeFileSync } from "node:fs";

const TARGETS = {
  oddOneOut: 250,
  genealogy: 150,
  parableMatch: 125
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function combinations(values, size, start = 0, prefix = [], output = []) {
  if (prefix.length === size) {
    output.push(prefix);
    return output;
  }

  for (let index = start; index <= values.length - (size - prefix.length); index += 1) {
    combinations(values, size, index + 1, [...prefix, values[index]], output);
  }

  return output;
}

const oddOneOutGroups = [
  {
    key: "judges",
    difficulty: "easy",
    theme: "Judges and kings",
    items: ["Othniel", "Ehud", "Deborah", "Gideon", "Samson", "Jephthah", "Barak", "Tola", "Jair", "Ibzan"],
    oddItems: ["Saul", "David", "Solomon", "Rehoboam", "Ahab"],
    groupTheme: "The others served as judges or deliverers of Israel before the monarchy.",
    explanation: (odd) => `${odd} is remembered as a king, not as one of Israel's judges in Judges.`,
    teachingNote: "Judges led Israel in cycles of oppression and deliverance before Israel asked for a king."
  },
  {
    key: "twelve",
    difficulty: "easy",
    theme: "Apostles",
    items: ["Peter", "Andrew", "James", "John", "Philip", "Bartholomew", "Matthew", "Thomas", "James son of Alphaeus", "Thaddaeus", "Simon the Zealot"],
    oddItems: ["Matthias", "Barnabas", "Paul", "Stephen", "Silas"],
    groupTheme: "The others were named among the Twelve during Jesus' earthly ministry.",
    explanation: (odd) => `${odd} was not listed among the original Twelve disciples called during Jesus' ministry.`,
    teachingNote: "The Gospels name the Twelve as Jesus' appointed apostolic witnesses."
  },
  {
    key: "plagues",
    difficulty: "easy",
    theme: "Exodus",
    items: ["Blood", "Frogs", "Lice", "Flies", "Murrain", "Boils", "Hail", "Locusts", "Darkness"],
    oddItems: ["Earthquake", "Flood", "Famine", "Drought", "Fire from heaven"],
    groupTheme: "The others are plagues sent on Egypt in Exodus.",
    explanation: (odd) => `${odd} is not listed among the ten plagues of Egypt.`,
    teachingNote: "The plagues confront Egypt and lead to Israel's release from bondage."
  },
  {
    key: "gospels",
    difficulty: "easy",
    theme: "New Testament books",
    items: ["Matthew", "Mark", "Luke", "John"],
    oddItems: ["Acts", "Romans", "Hebrews", "Revelation", "James"],
    groupTheme: "The others are the four canonical Gospels.",
    explanation: (odd) => `${odd} is a New Testament book, but it is not one of the four Gospels.`,
    teachingNote: "Matthew, Mark, Luke, and John present the good news of Jesus' life, death, and resurrection."
  },
  {
    key: "pauline",
    difficulty: "medium",
    theme: "New Testament letters",
    items: ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "Philemon", "1 Thessalonians", "2 Timothy"],
    oddItems: ["Hebrews", "James", "1 Peter", "1 John", "Jude"],
    groupTheme: "The others are New Testament letters that open by naming Paul.",
    explanation: (odd) => `${odd} does not open by naming Paul as sender, while the other letters do.`,
    teachingNote: "The Pauline letters identify Paul in their greetings; several other New Testament letters do not."
  },
  {
    key: "major-prophets",
    difficulty: "medium",
    theme: "Prophets",
    items: ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"],
    oddItems: ["Hosea", "Joel", "Amos", "Micah", "Malachi"],
    groupTheme: "The others are commonly grouped with the Major Prophets in English Old Testaments.",
    explanation: (odd) => `${odd} is counted among the Minor Prophets, not the Major Prophets grouping.`,
    teachingNote: "Major and Minor refer mainly to book length, not prophetic importance."
  },
  {
    key: "minor-prophets",
    difficulty: "medium",
    theme: "Prophets",
    items: ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
    oddItems: ["Isaiah", "Jeremiah", "Ezekiel", "Daniel", "Lamentations"],
    groupTheme: "The others are books in the Twelve Minor Prophets.",
    explanation: (odd) => `${odd} is outside the Twelve Minor Prophets collection.`,
    teachingNote: "The Twelve Minor Prophets form one compact prophetic section in the Old Testament."
  },
  {
    key: "wisdom-books",
    difficulty: "medium",
    theme: "Wisdom literature",
    items: ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"],
    oddItems: ["Joshua", "Judges", "Ruth", "Esther", "Nehemiah"],
    groupTheme: "The others are commonly grouped as Old Testament wisdom or poetry books.",
    explanation: (odd) => `${odd} belongs to historical narrative rather than wisdom or poetry literature.`,
    teachingNote: "Wisdom and poetry books emphasize worship, lament, practical wisdom, and reflection."
  },
  {
    key: "patriarchs",
    difficulty: "easy",
    theme: "Genesis families",
    items: ["Abraham", "Isaac", "Jacob", "Judah", "Joseph"],
    oddItems: ["Moses", "Aaron", "Joshua", "Samuel", "Saul"],
    groupTheme: "The others belong to the patriarchal family line in Genesis.",
    explanation: (odd) => `${odd} appears later in Israel's story, outside the patriarchal family sequence in Genesis.`,
    teachingNote: "Genesis follows God's covenant promises through Abraham's family."
  },
  {
    key: "tabernacle-furniture",
    difficulty: "hard",
    theme: "Tabernacle",
    items: ["Ark of the covenant", "Mercy seat", "Table of shewbread", "Golden candlestick", "Altar of incense", "Brazen altar", "Laver"],
    oddItems: ["Bronze serpent", "David's harp", "Gideon's fleece", "Elijah's mantle", "Temple veil"],
    groupTheme: "The others are furnishings or objects connected with the tabernacle.",
    explanation: (odd) => `${odd} is a biblical object, but it is not a tabernacle furnishing listed with the sanctuary pattern.`,
    teachingNote: "The tabernacle furnishings taught Israel about worship, sacrifice, cleansing, and God's presence."
  },
  {
    key: "armor-of-god",
    difficulty: "hard",
    theme: "Paul's imagery",
    items: ["Loins girt with truth", "Breastplate of righteousness", "Shoes of peace", "Shield of faith", "Helmet of salvation", "Sword of the Spirit"],
    oddItems: ["Crown of life", "Mantle of Elijah", "Rod of Aaron", "Sling of David", "Breastplate of judgment"],
    groupTheme: "The others are pieces of the armor of God in Ephesians 6.",
    explanation: (odd) => `${odd} is biblical imagery, but it is not one of Paul's armor-of-God pieces in Ephesians 6.`,
    teachingNote: "Paul uses armor imagery to describe steadfast spiritual readiness."
  },
  {
    key: "fruit-spirit",
    difficulty: "hard",
    theme: "New Testament virtues",
    items: ["Love", "Joy", "Peace", "Longsuffering", "Gentleness", "Goodness", "Faith", "Meekness", "Temperance"],
    oddItems: ["Knowledge", "Courage", "Patience of Job", "Hospitality", "Generosity"],
    groupTheme: "The others are named as fruit of the Spirit in Galatians 5.",
    explanation: (odd) => `${odd} is a virtue or biblical theme, but it is not listed in Paul's fruit of the Spirit list.`,
    teachingNote: "Galatians contrasts the works of the flesh with the Spirit's fruit."
  },
  {
    key: "churches-revelation",
    difficulty: "hard",
    theme: "Revelation",
    items: ["Ephesus", "Smyrna", "Pergamos", "Thyatira", "Sardis", "Philadelphia", "Laodicea"],
    oddItems: ["Corinth", "Rome", "Antioch", "Jerusalem", "Colossae"],
    groupTheme: "The others are the seven churches addressed in Revelation 2-3.",
    explanation: (odd) => `${odd} was an important early Christian location, but it is not one of Revelation's seven churches.`,
    teachingNote: "Revelation opens with messages to seven churches in Asia."
  },
  {
    key: "sons-of-jacob",
    difficulty: "medium",
    theme: "Tribes of Israel",
    items: ["Reuben", "Simeon", "Levi", "Judah", "Dan", "Naphtali", "Gad", "Asher", "Issachar", "Zebulun", "Joseph", "Benjamin"],
    oddItems: ["Ephraim", "Manasseh", "Ishmael", "Esau", "Moab"],
    groupTheme: "The others are sons of Jacob named in Genesis.",
    explanation: (odd) => `${odd} is not one of Jacob's twelve sons.`,
    teachingNote: "The tribes of Israel trace their names through Jacob's household, with later tribal lists sometimes naming Joseph's sons."
  },
  {
    key: "deacons-acts",
    difficulty: "hard",
    theme: "Early church",
    items: ["Stephen", "Philip", "Prochorus", "Nicanor", "Timon", "Parmenas", "Nicolas"],
    oddItems: ["Barnabas", "Silas", "Apollos", "Timothy", "Titus"],
    groupTheme: "The others are the seven men chosen for service in Acts 6.",
    explanation: (odd) => `${odd} served in the early church, but is not named among the seven chosen in Acts 6.`,
    teachingNote: "Acts 6 names seven reputable men appointed to serve practical needs in the church."
  }
];

function generateOddOneOut() {
  const quotas = { easy: 90, medium: 90, hard: 70 };
  const byDifficultyAndGroup = { easy: [], medium: [], hard: [] };
  const seenCorrectSets = new Set();

  for (const group of oddOneOutGroups) {
    const combos = combinations(group.items, Math.min(4, group.items.length));
    const groupRounds = [];

    combos.forEach((combo, comboIndex) => {
      const correctSetSignature = combo.slice().sort().join("|");
      if (seenCorrectSets.has(correctSetSignature)) {
        return;
      }
      seenCorrectSets.add(correctSetSignature);

      const oddItem = group.oddItems[comboIndex % group.oddItems.length];
      groupRounds.push({
        id: `ooo-${group.key}-${groupRounds.length + 1}`,
        prompt: "Which one does not belong?",
        items: [...combo, oddItem],
        oddItem,
        groupTheme: group.groupTheme,
        explanation: group.explanation(oddItem),
        theme: group.theme,
        difficulty: group.difficulty,
        teachingNote: group.teachingNote
      });
    });

    byDifficultyAndGroup[group.difficulty].push(groupRounds);
  }

  const byDifficulty = { easy: [], medium: [], hard: [] };
  for (const difficulty of ["easy", "medium", "hard"]) {
    const groups = byDifficultyAndGroup[difficulty].filter((groupRounds) => groupRounds.length > 0);
    let groupIndex = 0;

    while (byDifficulty[difficulty].length < quotas[difficulty] && groups.some((groupRounds) => groupRounds.length > 0)) {
      const groupRounds = groups[groupIndex % groups.length];
      const nextRound = groupRounds.shift();
      if (nextRound) {
        byDifficulty[difficulty].push({
          ...nextRound,
          id: `ooo-${difficulty}-${byDifficulty[difficulty].length + 1}`
        });
      }
      groupIndex += 1;
    }
  }

  const rounds = [];
  for (const difficulty of ["easy", "medium", "hard"]) {
    if (byDifficulty[difficulty].length < quotas[difficulty]) {
      throw new Error(`Only generated ${byDifficulty[difficulty].length} ${difficulty} Odd One Out rounds.`);
    }
    rounds.push(...byDifficulty[difficulty].slice(0, quotas[difficulty]));
  }

  if (rounds.length !== TARGETS.oddOneOut) {
    throw new Error(`Generated ${rounds.length} Odd One Out rounds, expected ${TARGETS.oddOneOut}.`);
  }

  const uniqueCorrectSets = new Set(rounds.map((round) => round.items.filter((item) => item !== round.oddItem).slice().sort().join("|")));
  if (uniqueCorrectSets.size !== rounds.length) {
    throw new Error("Odd One Out generated repeated correct-item sets.");
  }

  return rounds;
}

const lineages = [
  {
    key: "genesis-5",
    reference: "Genesis 5:3-32",
    theme: "Genesis 5",
    note: "Genesis 5 traces the line from Adam through Seth to Noah before the flood.",
    names: ["Adam", "Seth", "Enos", "Cainan", "Mahalaleel", "Jared", "Enoch", "Methuselah", "Lamech", "Noah"]
  },
  {
    key: "genesis-11",
    reference: "Genesis 11:10-26",
    theme: "Genesis 11",
    note: "Genesis 11 narrows the post-flood line toward Abram, through whom the covenant promises come.",
    names: ["Noah", "Shem", "Arphaxad", "Salah", "Eber", "Peleg", "Reu", "Serug", "Nahor", "Terah", "Abram"]
  },
  {
    key: "ruth-4",
    reference: "Ruth 4:18-22",
    theme: "Ruth and David",
    note: "Ruth closes by connecting Boaz and Ruth's family to King David.",
    names: ["Pharez", "Hezron", "Ram", "Amminadab", "Nahshon", "Salmon", "Boaz", "Obed", "Jesse", "David"]
  },
  {
    key: "matthew-1",
    reference: "Matthew 1:2-16",
    theme: "Matthew's genealogy",
    note: "Matthew presents Jesus as the son of David and son of Abraham through the royal line.",
    names: ["Abraham", "Isaac", "Jacob", "Judah", "Phares", "Esrom", "Aram", "Aminadab", "Naasson", "Salmon", "Booz", "Obed", "Jesse", "David", "Solomon", "Roboam", "Abia", "Asa", "Josaphat", "Joram", "Ozias", "Joatham", "Achaz", "Ezekias", "Manasses", "Amon", "Josias", "Jechonias", "Salathiel", "Zorobabel", "Abiud", "Eliakim", "Azor", "Sadoc", "Achim", "Eliud", "Eleazar", "Matthan", "Jacob", "Joseph", "Jesus"]
  },
  {
    key: "luke-3",
    reference: "Luke 3:23-38",
    theme: "Luke's genealogy",
    note: "Luke traces Jesus' genealogy backward through David, Abraham, and Adam.",
    names: ["Jesus", "Joseph", "Heli", "Matthat", "Levi", "Melchi", "Janna", "Joseph", "Mattathias", "Amos", "Naum", "Esli", "Nagge", "Maath", "Mattathias", "Semei", "Joseph", "Juda", "Joanna", "Rhesa", "Zorobabel", "Salathiel", "Neri", "Melchi", "Addi", "Cosam", "Elmodam", "Er", "Jose", "Eliezer", "Jorim", "Matthat", "Levi", "Simeon", "Juda", "Joseph", "Jonan", "Eliakim", "Melea", "Menan", "Mattatha", "Nathan", "David", "Jesse", "Obed", "Booz", "Salmon", "Naasson", "Aminadab", "Aram", "Esrom", "Phares", "Juda", "Jacob", "Isaac", "Abraham", "Thara", "Nachor", "Saruch", "Ragau", "Phalec", "Heber", "Sala", "Cainan", "Arphaxad", "Sem", "Noe", "Lamech", "Mathusala", "Enoch", "Jared", "Maleleel", "Cainan", "Enos", "Seth", "Adam"]
  }
];

function lineageDifficulty(length) {
  if (length <= 4) {
    return "easy";
  }
  if (length <= 6) {
    return "medium";
  }
  return "hard";
}

function hasDuplicateNormalizedName(names) {
  const normalized = names.map(normalizeName);
  return new Set(normalized).size !== normalized.length;
}

function flavorFor(name, role) {
  return role === "start" ? `Starts this authored Bible family segment at ${name}.` : `Ends this authored Bible family segment at ${name}.`;
}

function generateGenealogy() {
  const byDifficulty = { easy: [], medium: [], hard: [] };
  const seen = new Set();

  for (const lineage of lineages) {
    for (const length of [3, 4, 5, 6, 7, 8, 9]) {
      for (let start = 0; start + length <= lineage.names.length; start += 1) {
        const segment = lineage.names.slice(start, start + length);
        if (hasDuplicateNormalizedName(segment)) {
          continue;
        }
        const key = `${lineage.key}:${start}:${length}:${segment.join("|")}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        const difficulty = lineageDifficulty(length);
        byDifficulty[difficulty].push({
          id: `gen-${lineage.key}-${start + 1}-${length}`,
          startPerson: segment[0],
          endPerson: segment[segment.length - 1],
          fullChain: segment.map(normalizeName),
          startFlavorText: flavorFor(segment[0], "start"),
          endFlavorText: flavorFor(segment[segment.length - 1], "end"),
          scriptureReference: lineage.reference,
          theme: lineage.theme,
          difficulty,
          teachingNote: lineage.note
        });
      }
    }
  }

  const rounds = [
    ...byDifficulty.easy.slice(0, 55),
    ...byDifficulty.medium.slice(0, 50),
    ...byDifficulty.hard.slice(0, 45)
  ];

  if (rounds.length < TARGETS.genealogy) {
    throw new Error(`Only generated ${rounds.length} Genealogy rounds.`);
  }

  return rounds.slice(0, TARGETS.genealogy);
}

const parables = [
  ["prodigal-son", "The Prodigal Son", "Luke 15:11-32", "A lost son returns home and is welcomed by his father.", "This my son was dead, and is alive again.", "Repentance and mercy"],
  ["good-samaritan", "The Good Samaritan", "Luke 10:30-37", "A Samaritan shows mercy to a wounded man.", "He had compassion on him.", "Neighbor love"],
  ["sower", "The Sower", "Matthew 13:3-23", "Seed falls on different soils with different outcomes.", "Some fell into good ground, and brought forth fruit.", "Receiving the word"],
  ["lost-sheep", "The Lost Sheep", "Luke 15:3-7", "A shepherd searches for one lost sheep.", "He goeth after that which is lost, until he find it.", "Seeking the lost"],
  ["unforgiving-servant", "The Unforgiving Servant", "Matthew 18:23-35", "A forgiven servant refuses to forgive another.", "Shouldest not thou also have had compassion?", "Forgiveness"],
  ["ten-virgins", "The Ten Virgins", "Matthew 25:1-13", "Virgins wait for the bridegroom with lamps and oil.", "Watch therefore, for ye know neither the day nor the hour.", "Readiness"],
  ["talents", "The Talents", "Matthew 25:14-30", "Servants are entrusted with money while their lord travels.", "Thou hast been faithful over a few things.", "Faithful stewardship"],
  ["pharisee-tax-collector", "The Pharisee and the Tax Collector", "Luke 18:9-14", "Two men pray in the temple with very different hearts.", "God be merciful to me a sinner.", "Humility"],
  ["mustard-seed", "The Mustard Seed", "Matthew 13:31-32", "A tiny seed grows into a great herb.", "The kingdom of heaven is like to a grain of mustard seed.", "Kingdom growth"],
  ["leaven", "The Leaven", "Matthew 13:33", "Leaven works through three measures of meal.", "The whole was leavened.", "Hidden kingdom influence"],
  ["hidden-treasure", "The Hidden Treasure", "Matthew 13:44", "A man finds treasure hidden in a field.", "For joy thereof goeth and selleth all that he hath.", "Kingdom worth"],
  ["pearl", "The Pearl of Great Price", "Matthew 13:45-46", "A merchant sells all to buy one pearl.", "One pearl of great price.", "Surpassing value"],
  ["dragnet", "The Net", "Matthew 13:47-50", "A net gathers fish of every kind before sorting.", "They gathered the good into vessels.", "Final judgment"],
  ["wise-foolish-builders", "Wise and Foolish Builders", "Matthew 7:24-27", "Two builders face storm with different foundations.", "It fell not: for it was founded upon a rock.", "Obedient foundation"],
  ["new-cloth", "New Cloth on an Old Garment", "Mark 2:21", "A new patch tears an old garment.", "The rent is made worse.", "New covenant fittingness"],
  ["new-wine", "New Wine in Old Bottles", "Mark 2:22", "New wine bursts old wineskins.", "New wine must be put into new bottles.", "New life and forms"],
  ["lamp-under-bushel", "The Lamp Under a Bushel", "Matthew 5:14-16", "A lamp is set where it gives light.", "Let your light so shine before men.", "Visible witness"],
  ["rich-fool", "The Rich Fool", "Luke 12:16-21", "A rich man stores crops but is not rich toward God.", "This night thy soul shall be required of thee.", "Eternal priorities"],
  ["barren-fig-tree", "The Barren Fig Tree", "Luke 13:6-9", "A fruitless fig tree is given one more season.", "Let it alone this year also.", "Repentant fruitfulness"],
  ["great-supper", "The Great Supper", "Luke 14:16-24", "Invited guests refuse, so others are brought in.", "Come; for all things are now ready.", "Responding to invitation"],
  ["lost-coin", "The Lost Coin", "Luke 15:8-10", "A woman searches carefully for one lost coin.", "Rejoice with me; for I have found the piece.", "Joy over repentance"],
  ["unjust-steward", "The Unjust Steward", "Luke 16:1-13", "A steward acts shrewdly before losing his position.", "Make to yourselves friends of the mammon of unrighteousness.", "Wise use of resources"],
  ["rich-man-lazarus", "The Rich Man and Lazarus", "Luke 16:19-31", "A rich man and a poor man face reversed destinies.", "They have Moses and the prophets.", "Heeding God's word"],
  ["persistent-widow", "The Persistent Widow", "Luke 18:1-8", "A widow keeps pleading until an unjust judge acts.", "Men ought always to pray, and not to faint.", "Persistent prayer"],
  ["laborers-vineyard", "Laborers in the Vineyard", "Matthew 20:1-16", "Workers hired at different hours receive the same wage.", "The last shall be first, and the first last.", "Grace beyond merit"],
  ["two-sons", "The Two Sons", "Matthew 21:28-32", "One son refuses then obeys; the other promises but does not go.", "Whether of them twain did the will of his father?", "Obedience over words"],
  ["wicked-husbandmen", "The Wicked Husbandmen", "Matthew 21:33-46", "Tenants reject servants and the owner's son.", "They will reverence my son.", "Rejecting God's Son"],
  ["marriage-feast", "The Marriage Feast", "Matthew 22:1-14", "Invited guests reject a king's wedding feast.", "Many are called, but few are chosen.", "Responding rightly"],
  ["fig-tree-sign", "The Fig Tree Sign", "Matthew 24:32-35", "A fig tree's leaves signal that summer is near.", "Know that it is near, even at the doors.", "Discerning the times"],
  ["faithful-servant", "The Faithful and Evil Servant", "Matthew 24:45-51", "A servant must be faithful while his lord is away.", "Blessed is that servant.", "Faithful watchfulness"],
  ["growing-seed", "The Growing Seed", "Mark 4:26-29", "Seed grows while the farmer sleeps and rises.", "The earth bringeth forth fruit of herself.", "God-given growth"],
  ["two-debtors", "The Two Debtors", "Luke 7:41-43", "Two debtors are forgiven different amounts.", "He, to whom he forgave most.", "Love flowing from forgiveness"]
];

const lessonAngles = [
  {
    key: "main",
    difficulty: "easy",
    summary: (theme) => `${theme} is the central lesson Jesus presses through this parable.`,
    text: "The main point calls hearers to respond faithfully.",
    note: "This card focuses on the parable's broad, most recognizable lesson."
  },
  {
    key: "response",
    difficulty: "medium",
    summary: (theme) => `The parable asks hearers to respond with ${theme.toLowerCase()}.`,
    text: "Jesus' story pushes the listener toward a concrete response.",
    note: "This card emphasizes how the parable confronts the hearer's response."
  },
  {
    key: "warning",
    difficulty: "medium",
    summary: (theme) => `The parable warns against missing ${theme.toLowerCase()}.`,
    text: "The warning lands on those who hear but refuse the lesson.",
    note: "This card highlights the corrective edge of Jesus' teaching."
  },
  {
    key: "kingdom",
    difficulty: "hard",
    summary: (theme) => `The parable reveals a kingdom pattern connected to ${theme.toLowerCase()}.`,
    text: "The kingdom meaning is seen by tracing the story's reversal, contrast, or image.",
    note: "This card asks players to connect the parable to a wider kingdom theme."
  }
];

function generateParableMatch() {
  const rounds = [];

  for (const parable of parables) {
    const [key, title, reference, summary, textShort, theme] = parable;
    for (const angle of lessonAngles) {
      rounds.push({
        id: `parable-${key}-${angle.key}`,
        title: `${title} (${angle.key === "main" ? "central lesson" : angle.key})`,
        theme,
        parableReference: reference,
        parableSummary: summary,
        parableTextShort: textShort,
        lessonSummary: angle.summary(theme),
        lessonTextShort: angle.text,
        answerKey: `${key}-${angle.key}`,
        difficulty: angle.difficulty,
        teachingNote: `${angle.note} ${title} is found in ${reference}.`
      });

      if (rounds.length >= TARGETS.parableMatch) {
        return rounds;
      }
    }
  }

  throw new Error(`Only generated ${rounds.length} Parable Match pairs.`);
}

const oddOneOutRounds = generateOddOneOut();
const genealogyRounds = generateGenealogy();
const parableMatchRounds = generateParableMatch();

writeJson("src/data/odd-one-out.json", {
  $schema: "./schemas/odd-one-out.schema.json",
  game: "odd-one-out",
  version: 1,
  displayName: "Odd One Out",
  roundsPerSession: 10,
  sessions: [
    {
      id: "core-odd-one-out-001",
      title: "Odd One Out Core Library",
      theme: "Bible people, places, books, events, and themes",
      rounds: oddOneOutRounds
    }
  ]
});

writeJson("src/data/genealogy.json", {
  $schema: "./schemas/genealogy.schema.json",
  game: "genealogy",
  version: 1,
  displayName: "Fill in the Genealogy",
  roundsPerSession: 6,
  sessions: [
    {
      id: "core-genealogy-001",
      title: "Genealogy Core Library",
      theme: "Bible family lines",
      rounds: genealogyRounds
    }
  ]
});

writeJson("src/data/parable-match.json", {
  $schema: "./schemas/parable-match.schema.json",
  game: "parable-match",
  version: 1,
  displayName: "Parable Match",
  roundsPerSession: 5,
  sessions: [
    {
      id: "core-parable-match-001",
      title: "Parable Match Core Library",
      theme: "Jesus' parables and their lessons",
      rounds: parableMatchRounds
    }
  ]
});

for (const [label, rounds] of [
  ["Odd One Out", oddOneOutRounds],
  ["Genealogy", genealogyRounds],
  ["Parable Match", parableMatchRounds]
]) {
  const counts = rounds.reduce(
    (acc, round) => {
      acc[round.difficulty] += 1;
      acc.total += 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0, total: 0 }
  );
  console.log(label, counts);
}
