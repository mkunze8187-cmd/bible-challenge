// Hand-authored help content shown in the per-game and app-level Help popups (see
// HelpModal in App.tsx). This is a property of each game's *mechanic* — fixed, one entry
// per GameId — not of individual authored rounds, so it lives here rather than in the
// game-content JSON packs. "How to Play" and "Scoring" content is adapted from this
// project's SPEC.md (Sections 3-5 for the original three games, Section 9's reference
// table for the rest); "Tips" content is freshly authored per game.
import type { GameId } from "../lib/gameEngine";

export interface HelpTab {
  id: string;
  label: string;
  body: string[];
}

export interface GameHelpContent {
  gameId: GameId;
  tabs: HelpTab[];
}

export const GAME_HELP_CONTENT: Record<GameId, GameHelpContent> = {
  "five-guesses": {
    gameId: "five-guesses",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "The board shows twenty-five cards. The active player chooses any open card to play.",
          "Clue 1 appears immediately. Each wrong guess automatically reveals the next clue.",
          "The same player keeps guessing through all five clues.",
          "If they still haven't solved it after clue 5, every other player gets one steal attempt in turn order.",
          "A correct answer — by the primary player or a stealer — ends the card immediately. If every steal attempt fails, the card closes unsolved."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: [
          "Solve after clue 1: 5 points",
          "Solve after clue 2: 4 points",
          "Solve after clue 3: 3 points",
          "Solve after clue 4: 2 points",
          "Solve after clue 5: 1 point",
          "Steal solve after the full clue ladder: 1 point",
          "Unsolved card: 0 points"
        ]
      },
      {
        id: "tips",
        label: "Tips",
        body: [
          "Clues move from least direct to most direct, so an early guess is a bigger gamble but worth more.",
          "Turn order for the next card always advances from the original primary player, not from whoever stole — so stealing doesn't cost you your next turn."
        ]
      }
    ]
  },
  initials: {
    gameId: "initials",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "The board shows a shuffled set of twenty-five picks. The active player chooses any open tile.",
          "A tile starts by showing only the answer's initials.",
          "Each wrong guess automatically reveals the next hint, from hint 1 up through hint 6.",
          "The same player keeps guessing until they solve it or exhaust all six hints.",
          "If they still haven't solved it, every other player gets one steal attempt in turn order.",
          "Hints accumulate — once revealed, a hint stays visible alongside every later hint."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: [
          "Solve from initials only: 7 points",
          "Solve after hint 1: 6 points",
          "Solve after hint 2: 5 points",
          "Solve after hint 3: 4 points",
          "Solve after hint 4: 3 points",
          "Solve after hint 5: 2 points",
          "Solve after hint 6: 1 point",
          "Steal solve after all hints are visible: 1 point",
          "Unsolved tile: 0 points"
        ]
      },
      {
        id: "tips",
        label: "Tips",
        body: [
          "The initials alone are often enough for well-known names or phrases — guess early if you have a hunch.",
          "Hints move from broad to direct, so later hints narrow things down fast."
        ]
      }
    ]
  },
  "scripture-puzzles": {
    gameId: "scripture-puzzles",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "Each round is a single Bible verse with every letter hidden. Spaces, punctuation, and verse numbers stay visible.",
          "On your turn, guess one letter or attempt to solve the whole verse.",
          "A correct letter guess reveals every hidden occurrence of that letter at once. An incorrect guess reveals nothing.",
          "Turns rotate automatically after every letter guess or solve attempt.",
          "A correct full solve ends the round immediately. An incorrect solve scores nothing and the round continues."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: [
          "Each correct letter guess scores 1 point for every currently hidden space it reveals.",
          "Re-guessing an already fully revealed letter scores 0, as does an incorrect letter guess.",
          "A correct full solve scores 10 points plus 1 point for every letter space still hidden at that moment — so solving early is worth more.",
          "A full game is five rounds; highest total score wins."
        ]
      },
      {
        id: "tips",
        label: "Tips",
        body: [
          "Guessing common vowels and consonants early reveals the most letter spaces per turn.",
          "Watch the remaining hidden-letter count — solving with more letters still hidden pays a bigger bonus."
        ]
      }
    ]
  },
  "bible-timeline": {
    gameId: "bible-timeline",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "You're given a set of Bible events out of order.",
          "Arrange every event into chronological order, then submit the full timeline at once.",
          "A perfectly ordered timeline solves the round; an incorrect order does not partially score."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["A fully correct chronological order scores 10 points. An incorrect order scores 0."]
      },
      {
        id: "tips",
        label: "Tips",
        body: [
          "Anchor on the events you're most sure about first, then slot the rest around them.",
          "Think in eras (Creation, Patriarchs, Exodus, Judges, Kings, Exile, Gospels, Early Church) before worrying about exact order within an era."
        ]
      }
    ]
  },
  "verse-scramble": {
    gameId: "verse-scramble",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A short KJV verse is broken into scrambled word tiles.",
          "Rebuild the verse by placing the tiles back in the correct order, then submit.",
          "A fully correct rebuild solves the round."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["A fully correct rebuild scores points for the round; an incorrect submission does not solve it."]
      },
      {
        id: "tips",
        label: "Tips",
        body: [
          "Look for words that only make sense at the start or end of a verse (like \"And\" or \"Amen\") to anchor your rebuild.",
          "If you recognize the verse from memory, place the tiles you're confident about first."
        ]
      }
    ]
  },
  "bible-connections": {
    gameId: "bible-connections",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A shuffled board of sixteen tiles hides four connected groups of four terms each.",
          "Select four tiles you believe belong together, then submit that group.",
          "A correct group is removed from the board and scored; an incorrect group stays on the board to try again."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Each correct group of four scores 5 points. A full board has four groups to find."]
      },
      {
        id: "tips",
        label: "Tips",
        body: [
          "Start with the group you're most confident about — clearing it away simplifies the remaining tiles.",
          "Watch for terms that could plausibly fit more than one group; save those for last."
        ]
      }
    ]
  },
  "name-that-book": {
    gameId: "name-that-book",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "Guess the Bible book from a ladder of up to five clues, revealed one at a time on a miss.",
          "The same player keeps guessing through the clue ladder until they solve it or exhaust all clues.",
          "If they don't solve it, other players get a one-point steal attempt in turn order."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: [
          "Earlier clues are worth more — solving right away scores the most points.",
          "A steal solve after the full clue ladder scores 1 point."
        ]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Think about testament, section (Law, History, Wisdom, Prophets, Gospels, Epistles), and author before guessing a specific book title."]
      }
    ]
  },
  "before-or-after": {
    gameId: "before-or-after",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "You're shown two Bible events side by side.",
          "Choose which of the two happened first (earlier) in Biblical chronology.",
          "The round resolves immediately once a choice is made."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["A correct answer scores 3 points. An incorrect answer scores 0."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["When you don't recognize either event by name, think about which era or major figure each one is associated with."]
      }
    ]
  },
  "reference-rush": {
    gameId: "reference-rush",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A KJV verse is read or displayed without its reference.",
          "Name the correct book, chapter, and verse before the round moves on."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["A correct reference scores 5 points."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Familiar verses often give away their book from wording alone (Psalms vs. Proverbs vs. Gospel phrasing) even if you're unsure of the exact chapter and verse."]
      }
    ]
  },
  "chapter-finder": {
    gameId: "chapter-finder",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "You're given a prompt — an event, quote, person, or theme.",
          "Identify the Bible book and chapter where it's found."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["A correct book-and-chapter answer scores 5 points."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["A close clue is provided if you need a nudge — use it before guessing blind."]
      }
    ]
  },
  "who-said-it": {
    gameId: "who-said-it",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: ["A recognizable KJV quote or statement is shown.", "Identify who said it."]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["A correct speaker scores 5 points."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Context clues (who's speaking to whom, and about what) are usually a faster route to the answer than the exact wording."]
      }
    ]
  },
  "bible-books-relay": {
    gameId: "bible-books-relay",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "Shuffled Bible book tiles are shown for a section of the canon.",
          "Arrange them into their canonical order, then submit."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["A perfect canonical order scores 10 points."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Group books by author or type first (the five books of Moses, the major/minor prophets, Paul's letters) rather than trying to place each tile individually."]
      }
    ]
  },
  "missing-word": {
    gameId: "missing-word",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A KJV verse is shown with one to three words removed.",
          "Fill in the missing word or words to complete the verse."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["More missing words correctly filled in scores more points."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Read the whole verse first — surrounding words and rhythm often make the missing word obvious even from memory of a similar-sounding verse."]
      }
    ]
  },
  "prophecy-match": {
    gameId: "prophecy-match",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A board of Old Testament prophecy cards and New Testament fulfillment cards is shown.",
          "Match each prophecy card to its correct fulfillment card, one pair at a time."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Each correct prophecy-to-fulfillment match scores points; a full game has five pairs to match."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Read both summaries carefully — some prophecy/fulfillment pairs share similar themes but point to different specific events."]
      }
    ]
  },
  "messiah-prophecy": {
    gameId: "messiah-prophecy",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "You're shown a messianic prophecy and asked to identify its fulfillment, event, person, or theme from a set of choices.",
          "Wrong choices you pick disappear from the options."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Scoring steps down with each wrong choice — the earlier you find the correct one, the more it's worth."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Eliminate choices that describe the wrong testament or era first — that alone often narrows it to one or two real candidates."]
      }
    ]
  },
  "prophecy-clue-ladder": {
    gameId: "prophecy-clue-ladder",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "Name the prophecy's theme, reference, fulfillment, person, or event from a ladder of up to five clues.",
          "Each miss — or the timer running out — reveals the next clue."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Earlier clues are worth more — solving right away scores the most points."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["If the clock is a factor, don't wait on a guess you're fairly confident about — a wrong guess just advances the ladder, it doesn't end your turn."]
      }
    ]
  },
  "fulfillment-finder": {
    gameId: "fulfillment-finder",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "You're shown a New Testament fulfillment and asked to choose the Old Testament prophecy it connects to.",
          "Wrong prophecy references you pick are disabled from the choices."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Scoring steps down with each wrong choice — finding the correct prophecy sooner scores more."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Match the fulfillment's specific details (person, place, circumstance) rather than just its general theme — several prophecies can share a theme."]
      }
    ]
  },
  "prophecy-categories": {
    gameId: "prophecy-categories",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "One board of fifteen prophecy cards is shown, sorted across five reference-based categories.",
          "Sort every card into its correct category."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Each correctly sorted card scores points; the round covers one full board."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Sort the cards you're certain about first to narrow down where the trickier ones must go by process of elimination."]
      }
    ]
  },
  "complete-the-verse": {
    gameId: "complete-the-verse",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A well-known KJV verse from Psalms or Proverbs is shown with its ending missing.",
          "Choose the correct ending from four choices. Wrong endings you pick disappear."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Scoring steps down with each wrong choice — the sooner you find the correct ending, the more it's worth."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Say the verse's opening aloud (or in your head) — for well-known verses, the correct ending often just \"sounds right\" against the wrong options."]
      }
    ]
  },
  "wisdom-match": {
    gameId: "wisdom-match",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A Proverbs excerpt is shown.",
          "Match it to its correct wisdom theme from the choices given. Wrong themes you pick disappear."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Scoring steps down with each wrong choice."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Focus on the excerpt's key noun or behavior (diligence, pride, speech, friendship) — that's usually the fastest path to the matching theme."]
      }
    ]
  },
  "psalm-theme": {
    gameId: "psalm-theme",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A short Psalm excerpt is shown.",
          "Identify its major theme from the choices given. Wrong themes you pick disappear."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Scoring steps down with each wrong choice."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Notice the excerpt's tone first (praise, lament, trust, thanksgiving) — that alone usually points to the right theme."]
      }
    ]
  },
  "proverb-categories": {
    gameId: "proverb-categories",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "One sorting board of Proverbs cards is shown, spanning five wisdom categories.",
          "Sort every card into its correct category."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Each correctly sorted card scores points; the round covers one full board."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Sort the obvious cards first — narrowing the board down makes the ambiguous ones easier to place by elimination."]
      }
    ]
  },
  "psalm-reference-finder": {
    gameId: "psalm-reference-finder",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A familiar KJV phrase is shown.",
          "Choose its correct Psalm reference from the choices given. Wrong references you pick disappear."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Scoring steps down with each wrong choice."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["If you recognize the phrase from a hymn or common quotation, that's often a strong hint toward one of the well-known Psalms (like 23 or 100)."]
      }
    ]
  },
  "two-truths-and-a-lie": {
    gameId: "two-truths-and-a-lie",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "Three statements are shown about a Bible figure or event — two true, one false.",
          "Pick the statement you believe is the lie. Wrong picks you make disappear."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Scoring steps down with each wrong pick — finding the lie on the first try scores the most."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Watch for one statement that's oddly specific or oddly vague compared to the other two — that mismatch is often the tell."]
      }
    ]
  },
  "relay-verse-build": {
    gameId: "relay-verse-build",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A hidden KJV verse is rebuilt one word at a time, taking turns across players.",
          "On your turn, type the next word in the verse.",
          "A miss keeps the same player guessing — it doesn't pass the turn. Skip Word reveals the current word and passes the turn to the next player."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Each correctly typed word advances and scores the round; skipped words are revealed without scoring."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["If you're stuck on a word, guessing costs nothing but your own time — but Skip Word hands the next word (and the turn) to someone else, so only skip if you're truly stuck."]
      }
    ]
  },
  "verse-typing-race": {
    gameId: "verse-typing-race",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: ["A short KJV verse is shown.", "Type it out as fast and as accurately as you can, then submit."]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["Score is based on words-per-minute and accuracy — faster and more accurate typing scores higher."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Accuracy matters as much as speed — slow down slightly on words you're prone to mistype rather than racing through and losing points to errors."]
      }
    ]
  },
  "word-ladder": {
    gameId: "word-ladder",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "Change one letter at a time to turn the start word into the end word.",
          "The active player or team keeps the ladder until they either solve it, choose to Pass, or the round's timer runs out — a wrong guess doesn't end their turn.",
          "Any dictionary-valid word that changes exactly one letter from the last rung counts as a valid next step, even if it leads away from the \"intended\" path — the ladder isn't locked to one solution.",
          "You can remove the most recently added rung with Undo Last Rung if you want to back up and try a different word.",
          "Passing hands the same ladder — with its current progress kept — to the next player or team to steal. If everyone passes without solving it, the round ends and a valid path is revealed."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: [
          "Whoever completes the ladder scores based on how many steps they took compared to the shortest possible path — fewer steps scores more, down to a floor of 1 point.",
          "This applies the same way whether you solved it as the original player or after stealing it from someone else."
        ]
      },
      {
        id: "tips",
        label: "Tips",
        body: [
          "There's no penalty for a wrong guess beyond losing a little time, so try freely — only Pass or the round timer actually costs you the turn.",
          "If a path looks like a dead end, Undo Last Rung to back up rather than passing away a ladder you might still solve."
        ]
      }
    ]
  },
  "bible-anagrams": {
    gameId: "bible-anagrams",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "Letter tiles are shown scrambled.",
          "Move tiles into the answer row to spell out a Bible person, place, thing, or event, then submit.",
          "Easy and medium rounds show a clue; hard rounds do not."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: ["A correct answer scores the round."]
      },
      {
        id: "tips",
        label: "Tips",
        body: ["Look for a recognizable prefix or suffix among the letters first (like a common name ending) to anchor your guess."]
      }
    ]
  },
  "bible-cryptogram": {
    gameId: "bible-cryptogram",
    tabs: [
      {
        id: "how-to-play",
        label: "How to Play",
        body: [
          "A Bible name, phrase, or short verse is shown with every letter substituted by a different letter, using a fresh random cipher each round.",
          "A grid lists every cipher letter that appears in the puzzle. Type your guess for the real letter next to any cipher letter you want to try.",
          "A correct guess reveals every occurrence of that letter throughout the puzzle at once, and its row is marked solved. An incorrect guess reveals nothing.",
          "You can guess as many letters as you want, in any order, on your turn — there's no need to solve or pass between guesses.",
          "You can also attempt to solve the whole puzzle at once for a bigger bonus. A wrong full-solve attempt passes the turn to the next player or team; a correct one wins the round."
        ]
      },
      {
        id: "scoring",
        label: "Scoring",
        body: [
          "Each correct letter guess scores 1 point for every currently hidden letter it reveals.",
          "A correct full solve scores 10 points plus 1 point for every letter still hidden at that moment — so solving early is worth more.",
          "An incorrect letter guess scores 0 and doesn't cost you your turn. An incorrect full solve also scores 0, but does pass the turn to the next player or team."
        ]
      },
      {
        id: "tips",
        label: "Tips",
        body: [
          "Short entries (names and titles) can often be cracked from just a letter or two once you spot a repeated pattern.",
          "Common short words revealed by punctuation or spacing (like a lone one-letter word, which is almost always \"A\" or \"I\") are a fast way to break in."
        ]
      }
    ]
  }
};

export interface AppHelpContent {
  tabs: HelpTab[];
}

export const APP_HELP_CONTENT: AppHelpContent = {
  tabs: [
    {
      id: "getting-started",
      label: "Getting Started",
      body: [
        "Choose a game from the main menu, set up players or teams, then start.",
        "Every game pulls random content from its full content library each time you play, so games stay fresh across replays.",
        "Use Exit To Main Menu at any time to leave a game in progress and choose a different one."
      ]
    },
    {
      id: "players-teams",
      label: "Players & Teams",
      body: [
        "Every launch starts with a single default \"Player 1\" — add more players, or switch to Teams, from Settings before starting a game.",
        "In Teams mode, each team can have multiple members; the app rotates whose turn it is within a team automatically.",
        "Player names and rosters are not saved between launches — set them up fresh each time you open the app."
      ]
    },
    {
      id: "timers-difficulty",
      label: "Timers & Difficulty",
      body: [
        "Each game has its own default answer-timer length, adjustable in Settings.",
        "Host Controls (available during a live game) lets you pause or resume the timer, reveal an answer, skip a round, or adjust scores manually.",
        "Content packs and difficulty filters in Settings control which rounds are eligible to be drawn into a game."
      ]
    },
    {
      id: "event-mode",
      label: "Event Mode",
      body: [
        "Event Mode lets you line up a specific sequence of challenges to play in order across a session, with a combined running leaderboard.",
        "Turn Event Mode on and choose your challenge order from Settings before starting."
      ]
    },
    {
      id: "feedback-ratings",
      label: "Feedback & Ratings",
      body: [
        "After a challenge, you can rate it or send written feedback using the buttons in the top bar.",
        "Feedback and ratings help identify which games and rounds are working well."
      ]
    }
  ]
};
