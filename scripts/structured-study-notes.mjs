function cleanSentence(value) {
  return String(value ?? "").trim().replace(/[.?!]+$/g, "");
}

function sortedEvents(round) {
  return [...(round.events ?? [])].sort((left, right) => left.order - right.order);
}

function joinNatural(values) {
  const filtered = values.filter(Boolean);

  if (filtered.length <= 1) {
    return filtered.join("");
  }

  if (filtered.length === 2) {
    return `${filtered[0]} and ${filtered[1]}`;
  }

  return `${filtered.slice(0, -1).join(", ")}, and ${filtered.at(-1)}`;
}

function summarizeGroup(group) {
  return `${group.category} (${(group.items ?? []).join(", ")})`;
}

function summarizeCardCategories(round) {
  const categories = round.categories ?? [];
  return categories.map((category) => {
    const references = (round.cards ?? [])
      .filter((card) => card.category === category)
      .slice(0, 2)
      .map((card) => card.reference);
    return `${category}: ${references.join(", ")}`;
  });
}

export function buildBooksRelayStudyNote(round) {
  const books = Array.isArray(round.books) ? round.books : [];
  const first = books[0] ?? "the first book";
  const last = books.at(-1) ?? "the last book";
  const reference = `${first} through ${last}`;

  return {
    scriptureReference: reference,
    teachingNote: `${round.title} asks players to arrange ${books.length} Bible books in canonical order from ${first} through ${last}. The sequence "${books.join(", ")}" is the detail to learn.`
  };
}

export function buildTimelineStudyNote(round) {
  const events = sortedEvents(round);
  const first = events[0]?.label ?? "the first event";
  const last = events.at(-1)?.label ?? "the last event";
  const reference = `${first} through ${last}`;
  const middle = events.slice(1, -1).map((event) => event.label);
  const middleText = middle.length ? `, with ${middle.join(", ")} in between,` : "";

  return {
    scriptureReference: reference,
    teachingNote: `${round.prompt} The timeline runs from ${first}${middleText} to ${last}. That ordered sequence is the reason the round resolves this way.`
  };
}

export function buildBibleAnagramStudyNote(round) {
  const clue = cleanSentence(round.clue);
  const theme = cleanSentence(round.theme);

  return {
    teachingNote: `${round.answer} is the ${String(round.category).toLowerCase()} identified by the clue "${clue}." Review ${theme} for the biblical setting behind that answer.`
  };
}

export function buildBibleConnectionsStudyNote(round) {
  const groups = (round.groups ?? []).map(summarizeGroup);
  const categories = (round.groups ?? []).map((group) => group.category);

  return {
    scriptureReference: joinNatural(categories),
    teachingNote: `${round.title} resolves by recognizing four Bible groupings: ${groups.join("; ")}. Those category labels explain why each item belongs with its set.`
  };
}

export function buildNameThatBookStudyNote(round) {
  const focusClue =
    (round.clues ?? [])
      .find((clue) => /^It focuses on /i.test(clue))
      ?.replace(/^It focuses on /i, "")
      .replace(/[.?!]+$/g, "") ?? `${round.book}'s content`;
  const placementClue =
    (round.clues ?? [])
      .find((clue) => /placed after|opens the Bible|closes the Bible|followed by/i.test(clue))
      ?.replace(/[.?!]+$/g, "") ?? `It belongs to the ${round.category} section`;

  return {
    scriptureReference: round.book,
    teachingNote: `${round.book} is the answer because it is a ${round.testament} book in the ${round.category} section. ${placementClue}, and its clues point to ${focusClue}.`
  };
}

export function buildCategoryBoardStudyNote(round) {
  const categorySummaries = summarizeCardCategories(round);
  const references = (round.cards ?? []).slice(0, 5).map((card) => card.reference).filter(Boolean);

  return {
    scriptureReference: references.join("; "),
    teachingNote: `${round.title} is solved by sorting the cards into these themes: ${categorySummaries.join("; ")}. The listed references are the textual anchors for those category matches.`
  };
}

export function buildGenericWordLadderStudyNote(round) {
  const path = Array.isArray(round.revealPath) && round.revealPath.length > 0
    ? round.revealPath.join(" -> ")
    : `${round.startWord} -> ${round.endWord}`;

  return {
    teachingNote: `This auto-generated ladder is wordplay practice rather than a scripture-reference round. The verified path is ${path}, with one letter changing at each step.`
  };
}
