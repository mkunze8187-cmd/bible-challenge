import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../src/data/initials.json");

const manualNotes = {
  "Ark of the Covenant": {
    scriptureReference: "Exodus 25:10-22; Hebrews 9:4",
    teachingNote: "The Ark of the Covenant is identified by its role in the Most Holy Place and by Hebrews 9:4, which connects it with the covenant tablets."
  },
  "Burning Bush": {
    scriptureReference: "Exodus 3:1-6",
    teachingNote: "Exodus 3 anchors the burning bush clue: Moses saw a bush that burned without being consumed, then heard God call him from it."
  },
  "Red Sea": {
    scriptureReference: "Exodus 14:21-31",
    teachingNote: "The Red Sea fits because Exodus 14 says the waters divided for Israel and returned over Pharaoh's army."
  },
  "Jordan River": {
    scriptureReference: "Joshua 3:14-17; Matthew 3:13-17",
    teachingNote: "The Jordan River is tied to Israel entering the land in Joshua 3 and to Jesus being baptized there in Matthew 3."
  },
  "Upper Room": {
    scriptureReference: "Luke 22:12-20; Acts 1:13-14",
    teachingNote: "The upper room connects the Last Supper setting in Luke 22 with the gathered believers waiting in prayer in Acts 1."
  },
  "Good Samaritan": {
    scriptureReference: "Luke 10:30-37",
    teachingNote: "Luke 10 identifies the Good Samaritan as the unexpected neighbor who stopped, showed mercy, and cared for the wounded man."
  },
  "John the Baptist": {
    scriptureReference: "Matthew 3:1-17",
    teachingNote: "John the Baptist fits the clues because Matthew 3 presents him preaching repentance, baptizing in the Jordan, and preparing the way for Jesus."
  },
  "Queen Esther": {
    scriptureReference: "Esther 4:13-16; Esther 7:1-6",
    teachingNote: "Esther's danger and courage are anchored in Esther 4 and 7, where she risks approaching the king and exposes Haman's plot."
  },
  "King David": {
    scriptureReference: "1 Samuel 16:11-13; 2 Samuel 5:1-5",
    teachingNote: "David is the shepherd chosen and anointed in 1 Samuel 16, then recognized as king over Israel in 2 Samuel 5."
  },
  "Apostle Paul": {
    scriptureReference: "Acts 9:1-19; Acts 13:2-3",
    teachingNote: "Paul's clues point to his Damascus-road conversion in Acts 9 and his missionary calling from Antioch in Acts 13."
  },
  "Ten Commandments": {
    scriptureReference: "Exodus 20:1-17",
    teachingNote: "Exodus 20 gives the Ten Commandments at Sinai, which is why law, tablets, and Moses all point to this answer."
  },
  "Last Supper": {
    scriptureReference: "Matthew 26:17-30; Luke 22:14-20",
    teachingNote: "The Last Supper is the Passover meal where Jesus shared bread and cup with His disciples before His arrest."
  },
  "Golden Calf": {
    scriptureReference: "Exodus 32:1-20",
    teachingNote: "Exodus 32 identifies the golden calf as Israel's idol made while Moses was on Sinai, explaining the clues about Aaron, worship, and judgment."
  },
  "Tower of Babel": {
    scriptureReference: "Genesis 11:1-9",
    teachingNote: "Genesis 11 says Babel was built to make a name for the people before God confused their language and scattered them."
  },
  "New Jerusalem": {
    scriptureReference: "Revelation 21:1-4",
    teachingNote: "Revelation 21 describes the New Jerusalem coming down from God, with God dwelling with His people and wiping away tears."
  },
  "Prodigal Son": {
    scriptureReference: "Luke 15:11-32",
    teachingNote: "The prodigal son is the younger son in Luke 15 who squandered his inheritance and was welcomed home by his father."
  },
  "Mustard Seed": {
    scriptureReference: "Matthew 13:31-32",
    teachingNote: "Jesus uses the mustard seed in Matthew 13 as a kingdom image: something small grows into something large enough to shelter birds."
  },
  "Great Commission": {
    scriptureReference: "Matthew 28:18-20",
    teachingNote: "Matthew 28 anchors the Great Commission, where Jesus sends His disciples to make disciples, baptize, and teach all nations."
  },
  "Living Water": {
    scriptureReference: "John 4:10-14; John 7:37-39",
    teachingNote: "Jesus speaks of living water in John 4 and John 7, tying the image to eternal life and the Spirit."
  },
  "Bread of Life": {
    scriptureReference: "John 6:35",
    teachingNote: "John 6:35 identifies Jesus as the bread of life, the source of lasting satisfaction for those who come to Him."
  },
  "Fruit of the Spirit": {
    scriptureReference: "Galatians 5:22-23",
    teachingNote: "Galatians 5:22-23 lists the fruit of the Spirit, including love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control."
  },
  "Valley of Dry Bones": {
    scriptureReference: "Ezekiel 37:1-14",
    teachingNote: "Ezekiel 37 is the valley of dry bones vision, where God shows His power to restore life to His people."
  },
  "Armor of God": {
    scriptureReference: "Ephesians 6:10-18",
    teachingNote: "Ephesians 6 names the armor of God, including the belt of truth, breastplate of righteousness, shield of faith, helmet, and sword."
  },
  "Mount Carmel": {
    scriptureReference: "1 Kings 18:20-40",
    teachingNote: "Mount Carmel is the scene of Elijah's confrontation with Baal's prophets, where the Lord answered by fire."
  },
  "Widow's Mite": {
    scriptureReference: "Mark 12:41-44; Luke 21:1-4",
    teachingNote: "The widow's mite points to Jesus's teaching that her small gift was great because she gave out of poverty."
  },
  "City of Samaria": {
    scriptureReference: "1 Kings 16:24; John 4:4-42; Acts 8:5-8",
    teachingNote: "Samaria is anchored as the northern kingdom's capital in 1 Kings and later appears in Jesus's ministry and the gospel's spread in Acts."
  }
};

const pack = JSON.parse(await readFile(dataPath, "utf8"));
let updated = 0;

for (const session of pack.sessions ?? []) {
  for (const round of session.rounds ?? []) {
    const note = manualNotes[round.answer];
    if (!note) {
      continue;
    }

    if (round.scriptureReference !== note.scriptureReference || round.teachingNote !== note.teachingNote) {
      round.scriptureReference = note.scriptureReference;
      round.teachingNote = note.teachingNote;
      updated += 1;
    }
  }
}

await writeFile(dataPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
console.log(`Updated ${updated} initials study notes.`);
