function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function sentenceCase(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function getKeyPhrase(verseText) {
  const text = normalizeWhitespace(verseText)
    .replace(/^And\s+/i, "")
    .replace(/^But\s+/i, "");
  const segments = text
    .split(/[;:.!?]/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const best = segments.find((segment) => segment.split(/\s+/).length >= 5) ?? segments[0] ?? text;
  const words = best.split(/\s+/).slice(0, 16).join(" ");
  return words.replace(/[,;:.!?]+$/g, "");
}

function getThemeDescription(theme) {
  const normalized = typeof theme === "string" && theme.trim() ? theme.trim().toLowerCase() : "scripture";
  const descriptions = {
    care: "God's care",
    character: "godly character",
    courage: "courage grounded in God's command",
    creation: "God as Creator",
    deliverance: "God's deliverance",
    faith: "faith that trusts God's word",
    grace: "salvation by grace",
    hope: "hope rooted in God's promise",
    justice: "justice and faithful obedience",
    kingdom: "God's kingdom purposes",
    light: "Christ as light",
    love: "biblical love",
    prayer: "prayerful dependence",
    provision: "God's provision",
    purpose: "God's purpose for His people",
    renewal: "spiritual renewal",
    restoration: "God's final restoration",
    rest: "rest offered by Christ",
    salvation: "salvation through Christ",
    scripture: "the verse's own wording",
    strength: "strength that comes from the Lord",
    transformation: "a changed mind and life",
    trust: "trust in the Lord",
    way: "Christ as the way to the Father",
    wisdom: "wisdom asked from God",
    witness: "visible witness before others"
  };

  return descriptions[normalized] ?? normalized;
}

export function buildVerseStudyNote(round) {
  const reference = typeof round.reference === "string" ? round.reference.trim() : "";
  const verseText = typeof round.verseText === "string" ? round.verseText.trim() : "";
  const phrase = getKeyPhrase(verseText);
  const themeDescription = getThemeDescription(round.theme);

  if (!reference || !verseText || !phrase) {
    return "";
  }

  return `${reference} grounds ${themeDescription} in the words "${sentenceCase(phrase)}." That phrase is the textual detail to connect back to the answer.`;
}
