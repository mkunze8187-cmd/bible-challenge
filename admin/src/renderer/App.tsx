import { useEffect, useMemo, useState } from "react";
import { GAMES, slugify, validateGameRounds, loadRoundSchema, type CustomContentGame, type CustomContentPack } from "../lib/content";
import { describeRoundFields, emptyRoundValues, type FieldDescriptor, type JsonSchemaDocument } from "../lib/formRenderer";
import { findDuplicates, DEDUPE_KEY_FIELDS_BY_GAME } from "../lib/dedupe";
import type { StatsAndRatings } from "../lib/statsTypes";
import type { UpdateCheckResult } from "../lib/updateTypes";
import { SchemaForm } from "./components/SchemaForm";
import type { GameId } from "../types/gameData";

type AdminTab = "content" | "library" | "study-notes" | "settings" | "stats" | "updates";

const TABS: Array<{ id: AdminTab; label: string }> = [
  { id: "content", label: "Content" },
  { id: "library", label: "Library" },
  { id: "study-notes", label: "Study Notes" },
  { id: "settings", label: "Settings" },
  { id: "stats", label: "Stats & Ratings" },
  { id: "updates", label: "Updates" }
];

type StatusMessage = { tone: "info" | "warning" | "success"; text: string };

interface RoundIndexEntry {
  key: string;
  packId: string;
  packName: string;
  gameId: string;
  gameTitle: string;
  gameType: GameId;
  roundIndex: number;
  round: Record<string, unknown>;
  summary: string;
  searchableText: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<AdminTab>("content");
  const [lockChecked, setLockChecked] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [lockStatus, setLockStatus] = useState("");

  useEffect(() => {
    window.adminHost?.getAdminLockState().then((state) => {
      setIsLocked(state.configured);
      setLockChecked(true);
    });
  }, []);

  async function handleUnlock() {
    if (!window.adminHost) {
      return;
    }
    const ok = await window.adminHost.verifyAdminPin(pinInput);
    if (ok) {
      setIsLocked(false);
      setPinInput("");
      setLockStatus("");
    } else {
      setLockStatus("Incorrect PIN.");
    }
  }

  if (!lockChecked) {
    return <div className="app-shell">Loading admin console…</div>;
  }

  if (isLocked) {
    return (
      <div className="app-shell lock-shell">
        <section className="pack-detail lock-panel">
          <h1>Bible Challenge Admin Console</h1>
          <p className="muted-note">Enter the admin PIN to continue.</p>
          <input className="text-input" type="password" value={pinInput} onChange={(event) => setPinInput(event.target.value)} />
          <div className="inline-controls">
            <button type="button" className="primary-button" onClick={handleUnlock}>
              Unlock
            </button>
          </div>
          {lockStatus ? <p className="muted-note">{lockStatus}</p> : null}
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Bible Challenge Admin Console</h1>
        <p>Content editing, play stats, ratings, and updates for Bible Challenge.</p>
      </header>

      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${activeTab === tab.id ? "tab-button-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="tab-panel">
        {activeTab === "content" ? <ContentTab /> : null}
        {activeTab === "library" ? <ContentLibraryTab /> : null}
        {activeTab === "study-notes" ? <StudyNotesTab /> : null}
        {activeTab === "settings" ? <SettingsTab /> : null}
        {activeTab === "stats" ? <StatsTab /> : null}
        {activeTab === "updates" ? <UpdatesTab /> : null}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------------------
// Content tab
// ---------------------------------------------------------------------------------------

function ContentTab() {
  const [packs, setPacks] = useState<CustomContentPack[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshPacks() {
    if (!window.adminHost) {
      return;
    }
    const nextPacks = await window.adminHost.listCustomContentPacks();
    setPacks(nextPacks);
  }

  useEffect(() => {
    refreshPacks().finally(() => setIsLoading(false));
  }, []);

  const selectedPack = packs.find((pack) => pack.packId === selectedPackId) ?? null;

  async function handleCreatePack() {
    const packName = window.prompt("Name for the new content pack?");
    if (!packName || !packName.trim()) {
      return;
    }

    const packId = slugify(packName);
    if (packs.some((pack) => pack.packId === packId)) {
      setStatus({ tone: "warning", text: `A pack with id "${packId}" already exists.` });
      return;
    }

    const newPack: CustomContentPack = {
      packId,
      packName: packName.trim(),
      accentColor: "#666b72",
      games: []
    };

    if (!window.adminHost) {
      return;
    }
    const nextPacks = await window.adminHost.saveCustomContentPack(newPack);
    setPacks(nextPacks);
    setSelectedPackId(packId);
    setStatus({ tone: "success", text: `Created pack "${packName.trim()}".` });
  }

  async function handleRemovePack(packId: string) {
    if (!window.confirm(`Remove the content pack "${packId}"? This cannot be undone.`)) {
      return;
    }
    if (!window.adminHost) {
      return;
    }
    const nextPacks = await window.adminHost.removeCustomContentPack(packId);
    setPacks(nextPacks);
    if (selectedPackId === packId) {
      setSelectedPackId(null);
    }
    setStatus({ tone: "info", text: `Removed pack "${packId}".` });
  }

  async function savePack(nextPack: CustomContentPack) {
    if (!window.adminHost) {
      return;
    }
    const nextPacks = await window.adminHost.saveCustomContentPack(nextPack);
    setPacks(nextPacks);
  }

  if (isLoading) {
    return <p>Loading content packs…</p>;
  }

  return (
    <div className="content-tab">
      <aside className="pack-list">
        <div className="pack-list-header">
          <h2>Content Packs</h2>
          <button type="button" className="primary-button" onClick={handleCreatePack}>
            New Pack
          </button>
        </div>
        {packs.length === 0 ? <p className="muted-note">No content packs yet.</p> : null}
        <ul>
          {packs.map((pack) => (
            <li key={pack.packId}>
              <button
                type="button"
                className={`pack-list-item ${selectedPackId === pack.packId ? "pack-list-item-active" : ""}`}
                onClick={() => setSelectedPackId(pack.packId)}
              >
                <strong>{pack.packName}</strong>
                <span className="muted-note">{pack.games.length} game{pack.games.length === 1 ? "" : "s"}</span>
              </button>
              <button type="button" className="ghost-button" onClick={() => handleRemovePack(pack.packId)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="pack-detail">
        {status ? <div className={`status-banner status-${status.tone}`}>{status.text}</div> : null}
        {selectedPack ? (
          <PackEditor pack={selectedPack} onSave={savePack} onStatus={setStatus} />
        ) : (
          <p className="muted-note">Select a pack, or create a new one, to start editing content.</p>
        )}
      </section>
    </div>
  );
}

function PackEditor({
  pack,
  onSave,
  onStatus
}: {
  pack: CustomContentPack;
  onSave: (pack: CustomContentPack) => Promise<void>;
  onStatus: (status: StatusMessage) => void;
}) {
  const [selectedGameId, setSelectedGameId] = useState<GameId | "">("");
  const gameEntry = pack.games.find((game) => game.gameType === selectedGameId) ?? null;

  async function handleAddGameSection() {
    if (!selectedGameId) {
      return;
    }
    if (pack.games.some((game) => game.gameType === selectedGameId)) {
      onStatus({ tone: "warning", text: "This pack already has a section for that game." });
      return;
    }

    const gameManifest = GAMES.find((game) => game.gameId === selectedGameId);
    const newGame: CustomContentGame = {
      gameId: slugify(`${pack.packId}-${selectedGameId}`),
      gameTitle: gameManifest?.label ?? selectedGameId,
      gameType: selectedGameId,
      description: "",
      rounds: []
    };

    await onSave({ ...pack, games: [...pack.games, newGame] });
    onStatus({ tone: "success", text: `Added a ${gameManifest?.label ?? selectedGameId} section.` });
  }

  return (
    <div className="pack-editor">
      <h2>{pack.packName}</h2>

      <div className="field-row">
        <label>Add a game to this pack</label>
        <div className="inline-controls">
          <select className="text-input" value={selectedGameId} onChange={(event) => setSelectedGameId(event.target.value as GameId)}>
            <option value="">Choose a game…</option>
            {GAMES.map((game) => (
              <option key={game.gameId} value={game.gameId}>
                {game.label}
              </option>
            ))}
          </select>
          <button type="button" className="secondary-button" onClick={handleAddGameSection} disabled={!selectedGameId}>
            Add Section
          </button>
        </div>
      </div>

      <div className="game-section-list">
        {pack.games.map((game) => (
          <GameSectionEditor
            key={game.gameId}
            pack={pack}
            game={game}
            onSave={onSave}
            onStatus={onStatus}
          />
        ))}
      </div>
    </div>
  );
}

function GameSectionEditor({
  pack,
  game,
  onSave,
  onStatus
}: {
  pack: CustomContentPack;
  game: CustomContentGame;
  onSave: (pack: CustomContentPack) => Promise<void>;
  onStatus: (status: StatusMessage) => void;
}) {
  const [schema, setSchema] = useState<JsonSchemaDocument | null>(null);
  const [isAddingRound, setIsAddingRound] = useState(false);
  const [newRoundValues, setNewRoundValues] = useState<Record<string, unknown>>({});
  const [batchText, setBatchText] = useState("");
  const [batchPreview, setBatchPreview] = useState<{ accepted: unknown[]; duplicateCount: number } | null>(null);

  useEffect(() => {
    loadRoundSchema(game.gameType).then((loaded) => setSchema(loaded as JsonSchemaDocument));
  }, [game.gameType]);

  const fields: FieldDescriptor[] = useMemo(() => (schema ? describeRoundFields(schema) : []), [schema]);

  async function handleStartAddRound() {
    setNewRoundValues(emptyRoundValues(fields));
    setIsAddingRound(true);
  }

  async function handleSaveNewRound() {
    const roundId = `${slugify(game.gameId)}-${Date.now()}`;
    const round = { id: roundId, ...newRoundValues };

    try {
      await validateGameRounds(pack.packId, pack.packName, { ...game, rounds: [...game.rounds, round] });
    } catch (error) {
      onStatus({ tone: "warning", text: error instanceof Error ? error.message : "That round is not valid." });
      return;
    }

    const updatedGames = pack.games.map((entry) =>
      entry.gameId === game.gameId ? { ...entry, rounds: [...entry.rounds, round] } : entry
    );
    await onSave({ ...pack, games: updatedGames });
    setIsAddingRound(false);
    onStatus({ tone: "success", text: "Round added." });
  }

  async function handleRemoveRound(roundIndex: number) {
    if (!window.confirm("Remove this round?")) {
      return;
    }
    const updatedGames = pack.games.map((entry) =>
      entry.gameId === game.gameId ? { ...entry, rounds: entry.rounds.filter((_, index) => index !== roundIndex) } : entry
    );
    await onSave({ ...pack, games: updatedGames });
    onStatus({ tone: "info", text: "Round removed." });
  }

  function handlePreviewBatch() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(batchText);
    } catch {
      onStatus({ tone: "warning", text: "That isn't valid JSON." });
      return;
    }

    if (!Array.isArray(parsed)) {
      onStatus({ tone: "warning", text: "Paste a JSON array of round objects." });
      return;
    }

    const keyFields = DEDUPE_KEY_FIELDS_BY_GAME[game.gameType] ?? [];
    const result = findDuplicates(
      parsed as Record<string, unknown>[],
      game.rounds as Record<string, unknown>[],
      keyFields
    );
    setBatchPreview({ accepted: result.accepted, duplicateCount: result.duplicates.length });
  }

  async function handleCommitBatch() {
    if (!batchPreview) {
      return;
    }

    const roundsWithIds = batchPreview.accepted.map((round, index) => ({
      id: `${slugify(game.gameId)}-batch-${Date.now()}-${index}`,
      ...(round as Record<string, unknown>)
    }));

    try {
      await validateGameRounds(pack.packId, pack.packName, { ...game, rounds: [...game.rounds, ...roundsWithIds] });
    } catch (error) {
      onStatus({ tone: "warning", text: error instanceof Error ? error.message : "Batch contains an invalid round." });
      return;
    }

    const updatedGames = pack.games.map((entry) =>
      entry.gameId === game.gameId ? { ...entry, rounds: [...entry.rounds, ...roundsWithIds] } : entry
    );
    await onSave({ ...pack, games: updatedGames });
    setBatchText("");
    setBatchPreview(null);
    onStatus({ tone: "success", text: `Added ${roundsWithIds.length} rounds from batch.` });
  }

  return (
    <div className="game-section">
      <div className="game-section-header">
        <h3>{game.gameTitle}</h3>
        <span className="muted-note">{game.rounds.length} round{game.rounds.length === 1 ? "" : "s"}</span>
      </div>

      <ul className="round-list">
        {game.rounds.map((round, index) => (
          <li key={index}>
            <span className="round-summary">{summarizeRound(round)}</span>
            <button type="button" className="ghost-button" onClick={() => handleRemoveRound(index)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {isAddingRound ? (
        <div className="round-editor">
          <SchemaForm fields={fields} values={newRoundValues} onChange={setNewRoundValues} />
          <div className="inline-controls">
            <button type="button" className="primary-button" onClick={handleSaveNewRound}>
              Save Round
            </button>
            <button type="button" className="ghost-button" onClick={() => setIsAddingRound(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="secondary-button" onClick={handleStartAddRound} disabled={!schema}>
          Add Round
        </button>
      )}

      <details className="batch-add">
        <summary>Batch add (paste a JSON array of rounds)</summary>
        <textarea
          className="text-area"
          rows={6}
          value={batchText}
          onChange={(event) => {
            setBatchText(event.target.value);
            setBatchPreview(null);
          }}
          placeholder='[{"reference": "...", ...}, {"reference": "...", ...}]'
        />
        <div className="inline-controls">
          <button type="button" className="secondary-button" onClick={handlePreviewBatch}>
            Preview & Check Duplicates
          </button>
          {batchPreview ? (
            <button type="button" className="primary-button" onClick={handleCommitBatch}>
              Add {batchPreview.accepted.length} Rounds
            </button>
          ) : null}
        </div>
        {batchPreview ? (
          <p className="muted-note">
            {batchPreview.accepted.length} accepted, {batchPreview.duplicateCount} flagged as duplicates and excluded.
            Review the excluded count before committing — nothing flagged as a duplicate is added.
          </p>
        ) : null}
      </details>
    </div>
  );
}

function summarizeRound(round: unknown): string {
  if (!round || typeof round !== "object") {
    return "(invalid round)";
  }
  const record = round as Record<string, unknown>;
  const candidateFields = ["reference", "answer", "title", "subject", "prompt", "startWord"];
  for (const field of candidateFields) {
    if (typeof record[field] === "string" && record[field]) {
      return record[field] as string;
    }
  }
  return typeof record.id === "string" ? record.id : "(round)";
}

function stringifyRound(round: Record<string, unknown>): string {
  return JSON.stringify(round).toLowerCase();
}

function buildRoundIndex(packs: CustomContentPack[]): RoundIndexEntry[] {
  return packs.flatMap((pack) =>
    pack.games.flatMap((game) =>
      game.rounds.flatMap((round, roundIndex) => {
        if (!round || typeof round !== "object" || Array.isArray(round)) {
          return [];
        }
        const record = round as Record<string, unknown>;
        const summary = summarizeRound(record);
        return [
          {
            key: `${pack.packId}::${game.gameId}::${roundIndex}`,
            packId: pack.packId,
            packName: pack.packName,
            gameId: game.gameId,
            gameTitle: game.gameTitle,
            gameType: game.gameType,
            roundIndex,
            round: record,
            summary,
            searchableText: `${pack.packName} ${game.gameTitle} ${summary} ${stringifyRound(record)}`
          }
        ];
      })
    )
  );
}

function replaceRound(packs: CustomContentPack[], entry: RoundIndexEntry, nextRound: Record<string, unknown>): CustomContentPack[] {
  return packs.map((pack) =>
    pack.packId !== entry.packId
      ? pack
      : {
          ...pack,
          games: pack.games.map((game) =>
            game.gameId !== entry.gameId
              ? game
              : {
                  ...game,
                  rounds: game.rounds.map((round, index) => (index === entry.roundIndex ? nextRound : round))
                }
          )
        }
  );
}

function noteNeedsReview(round: Record<string, unknown>): boolean {
  const note = typeof round.teachingNote === "string" ? round.teachingNote.trim() : "";
  return (
    !note ||
    note.length < 24 ||
    /^Review .+ before continuing\.$/i.test(note) ||
    /^Review .+ and how it connects to the Bible before continuing\.$/i.test(note) ||
    /^Change one letter at a time to turn ".+" into ".+"\.$/i.test(note)
  );
}

async function validatePackGames(pack: CustomContentPack): Promise<void> {
  for (const game of pack.games) {
    await validateGameRounds(pack.packId, pack.packName, game);
  }
}

function buildDifficultyReport(entries: RoundIndexEntry[]) {
  const report = new Map<string, { gameTitle: string; easy: number; medium: number; hard: number; none: number; total: number }>();

  for (const entry of entries) {
    const current = report.get(entry.gameType) ?? {
      gameTitle: entry.gameTitle,
      easy: 0,
      medium: 0,
      hard: 0,
      none: 0,
      total: 0
    };
    const difficulty = entry.round.difficulty;
    if (difficulty === "easy" || difficulty === "medium" || difficulty === "hard") {
      current[difficulty] += 1;
    } else {
      current.none += 1;
    }
    current.total += 1;
    report.set(entry.gameType, current);
  }

  return Array.from(report.values()).sort((left, right) => left.gameTitle.localeCompare(right.gameTitle));
}

function ProjectorPreviewModal({
  entry,
  round,
  onClose
}: {
  entry: RoundIndexEntry;
  round: Record<string, unknown>;
  onClose: () => void;
}) {
  const visibleFields = Object.entries(round)
    .filter(([name, value]) => name !== "id" && value != null && value !== "")
    .slice(0, 10);

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="projector-preview-modal" role="dialog" aria-modal="true" aria-labelledby="projector-preview-title">
        <div className="projector-preview-stage">
          <div className="projector-preview-header">
            <div>
              <p className="eyebrow">Projector Preview</p>
              <h2 id="projector-preview-title">{entry.gameTitle}</h2>
            </div>
            <button type="button" className="ghost-button" onClick={onClose}>Close</button>
          </div>
          <div className="projector-preview-card">
            <p className="muted-note">{entry.packName}</p>
            <h3>{summarizeRound(round)}</h3>
            <div className="preview-field-grid">
              {visibleFields.map(([name, value]) => (
                <div key={name} className="preview-field">
                  <span>{name}</span>
                  <strong>{Array.isArray(value) ? value.join(", ") : String(value)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContentLibraryTab() {
  const [packs, setPacks] = useState<CustomContentPack[]>([]);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [query, setQuery] = useState("");
  const [gameFilter, setGameFilter] = useState<GameId | "">("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [bulkDifficulty, setBulkDifficulty] = useState("medium");
  const [schema, setSchema] = useState<JsonSchemaDocument | null>(null);
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});
  const [showDifficultyReport, setShowDifficultyReport] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  async function refresh() {
    const next = (await window.adminHost?.listCustomContentPacks()) ?? [];
    setPacks(next);
  }

  useEffect(() => {
    refresh();
  }, []);

  const entries = useMemo(() => buildRoundIndex(packs), [packs]);
  const filtered = entries.filter((entry) => {
    const matchesQuery = !query.trim() || entry.searchableText.includes(query.trim().toLowerCase());
    const matchesGame = !gameFilter || entry.gameType === gameFilter;
    const matchesDifficulty = !difficultyFilter || entry.round.difficulty === difficultyFilter;
    return matchesQuery && matchesGame && matchesDifficulty;
  });
  const selectedEntry = entries.find((entry) => entry.key === selectedKey) ?? null;
  const fields = useMemo(() => (schema ? describeRoundFields(schema) : []), [schema]);
  const difficultyReport = useMemo(() => buildDifficultyReport(entries), [entries]);

  useEffect(() => {
    if (!selectedEntry) {
      setSchema(null);
      setEditValues({});
      return;
    }
    setEditValues({ ...selectedEntry.round });
    loadRoundSchema(selectedEntry.gameType).then((loaded) => setSchema(loaded as JsonSchemaDocument));
  }, [selectedEntry?.key]);

  async function saveEditedRound() {
    if (!selectedEntry || !window.adminHost) {
      return;
    }
    const nextRound = { ...selectedEntry.round, ...editValues };
    const nextPacks = replaceRound(packs, selectedEntry, nextRound);
    const changedPack = nextPacks.find((pack) => pack.packId === selectedEntry.packId);
    if (!changedPack) {
      return;
    }
    try {
      await validatePackGames(changedPack);
      const saved = await window.adminHost.saveCustomContentPack(changedPack);
      setPacks(saved);
      setStatus({ tone: "success", text: "Round saved." });
    } catch (error) {
      setStatus({ tone: "warning", text: error instanceof Error ? error.message : "Round could not be saved." });
    }
  }

  async function applyBulkDifficulty() {
    if (!window.adminHost || checkedKeys.size === 0) {
      return;
    }

    let nextPacks = packs;
    const selectedEntries = entries.filter((item) => checkedKeys.has(item.key) && "difficulty" in item.round);
    for (const entry of selectedEntries) {
      nextPacks = replaceRound(nextPacks, entry, { ...entry.round, difficulty: bulkDifficulty });
    }

    try {
      const changedPackIds = new Set(selectedEntries.map((item) => item.packId));
      for (const pack of nextPacks.filter((item) => changedPackIds.has(item.packId))) {
        await validatePackGames(pack);
      }
      let saved = nextPacks;
      for (const pack of nextPacks.filter((item) => changedPackIds.has(item.packId))) {
        saved = await window.adminHost.saveCustomContentPack(pack);
      }
      setPacks(saved);
      setCheckedKeys(new Set());
      setStatus({ tone: "success", text: "Bulk difficulty update saved." });
    } catch (error) {
      setStatus({ tone: "warning", text: error instanceof Error ? error.message : "Bulk update failed." });
    }
  }

  async function validateAllContent() {
    const failures: string[] = [];

    for (const pack of packs) {
      try {
        await validatePackGames(pack);
      } catch (error) {
        failures.push(`${pack.packName}: ${error instanceof Error ? error.message : "Invalid content."}`);
      }
    }

    if (failures.length === 0) {
      setStatus({ tone: "success", text: `Validated ${packs.length} pack${packs.length === 1 ? "" : "s"} successfully.` });
    } else {
      setStatus({ tone: "warning", text: `${failures.length} pack${failures.length === 1 ? "" : "s"} failed validation. ${failures.join(" ")}` });
    }
  }

  return (
    <div className="library-grid">
      <section className="pack-detail">
        <h2>Content Library</h2>
        {status ? <div className={`status-banner status-${status.tone}`}>{status.text}</div> : null}
        <div className="filter-grid">
          <input className="text-input" placeholder="Search all fields" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="text-input" value={gameFilter} onChange={(event) => setGameFilter(event.target.value as GameId | "")}>
            <option value="">All games</option>
            {GAMES.map((game) => (
              <option key={game.gameId} value={game.gameId}>{game.label}</option>
            ))}
          </select>
          <select className="text-input" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
            <option value="">All difficulties</option>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </div>
        <div className="inline-controls">
          <select className="text-input compact-input" value={bulkDifficulty} onChange={(event) => setBulkDifficulty(event.target.value)}>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
          <button type="button" className="secondary-button" onClick={applyBulkDifficulty} disabled={checkedKeys.size === 0}>
            Apply Difficulty To Selected
          </button>
          <button type="button" className="secondary-button" onClick={validateAllContent}>
            Validate All
          </button>
          <button type="button" className="secondary-button" onClick={() => setShowDifficultyReport((current) => !current)}>
            Difficulty Report
          </button>
        </div>
        {showDifficultyReport ? (
          <table className="stats-table compact-report">
            <thead>
              <tr>
                <th>Game</th>
                <th>Easy</th>
                <th>Medium</th>
                <th>Hard</th>
                <th>None</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {difficultyReport.map((row) => (
                <tr key={row.gameTitle}>
                  <td>{row.gameTitle}</td>
                  <td>{row.easy}</td>
                  <td>{row.medium}</td>
                  <td>{row.hard}</td>
                  <td>{row.none}</td>
                  <td>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        <div className="round-table">
          {filtered.map((entry) => (
            <button key={entry.key} type="button" className={`round-row ${selectedKey === entry.key ? "round-row-active" : ""}`} onClick={() => setSelectedKey(entry.key)}>
              <input
                type="checkbox"
                checked={checkedKeys.has(entry.key)}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const next = new Set(checkedKeys);
                  if (event.target.checked) next.add(entry.key);
                  else next.delete(entry.key);
                  setCheckedKeys(next);
                }}
              />
              <span>{entry.summary}</span>
              <small>{entry.packName} / {entry.gameTitle}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="pack-detail">
        <h2>Edit Round</h2>
        {selectedEntry && fields.length > 0 ? (
          <>
            <p className="muted-note">{selectedEntry.packName} / {selectedEntry.gameTitle}</p>
            <SchemaForm fields={fields} values={editValues} onChange={setEditValues} />
            <div className="inline-controls">
              <button type="button" className="primary-button" onClick={saveEditedRound}>Save Round</button>
              <button type="button" className="secondary-button" onClick={() => setIsPreviewOpen(true)}>Projector Preview</button>
            </div>
          </>
        ) : (
          <p className="muted-note">Select a round to edit.</p>
        )}
      </section>
      {selectedEntry && isPreviewOpen ? (
        <ProjectorPreviewModal entry={selectedEntry} round={{ ...selectedEntry.round, ...editValues }} onClose={() => setIsPreviewOpen(false)} />
      ) : null}
    </div>
  );
}

function StudyNotesTab() {
  const [packs, setPacks] = useState<CustomContentPack[]>([]);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [query, setQuery] = useState("");
  const [gameFilter, setGameFilter] = useState<GameId | "">("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [showNeedsReviewOnly, setShowNeedsReviewOnly] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  async function refresh() {
    setPacks((await window.adminHost?.listCustomContentPacks()) ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  const entries = useMemo(() => buildRoundIndex(packs), [packs]);
  const filtered = entries.filter((entry) => {
    const matchesQuery = !query.trim() || entry.searchableText.includes(query.trim().toLowerCase());
    const matchesGame = !gameFilter || entry.gameType === gameFilter;
    const matchesDifficulty = !difficultyFilter || entry.round.difficulty === difficultyFilter;
    const matchesReview = !showNeedsReviewOnly || noteNeedsReview(entry.round);
    return matchesQuery && matchesGame && matchesDifficulty && matchesReview;
  });
  const selectedEntry = entries.find((entry) => entry.key === selectedKey) ?? null;

  useEffect(() => {
    setNoteText(typeof selectedEntry?.round.teachingNote === "string" ? selectedEntry.round.teachingNote : "");
  }, [selectedEntry?.key]);

  async function saveNote() {
    if (!selectedEntry || !window.adminHost) {
      return;
    }
    const nextRound = { ...selectedEntry.round, teachingNote: noteText };
    const nextPacks = replaceRound(packs, selectedEntry, nextRound);
    const changedPack = nextPacks.find((pack) => pack.packId === selectedEntry.packId);
    if (!changedPack) {
      return;
    }
    try {
      await validatePackGames(changedPack);
      setPacks(await window.adminHost.saveCustomContentPack(changedPack));
      setStatus({ tone: "success", text: "Study note saved." });
    } catch (error) {
      setStatus({ tone: "warning", text: error instanceof Error ? error.message : "Study note could not be saved." });
    }
  }

  return (
    <div className="library-grid">
      <section className="pack-detail">
        <h2>Study Notes</h2>
        {status ? <div className={`status-banner status-${status.tone}`}>{status.text}</div> : null}
        <div className="filter-grid">
          <input className="text-input" placeholder="Search all fields" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="text-input" value={gameFilter} onChange={(event) => setGameFilter(event.target.value as GameId | "")}>
            <option value="">All games</option>
            {GAMES.map((game) => (
              <option key={game.gameId} value={game.gameId}>{game.label}</option>
            ))}
          </select>
          <select className="text-input" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
            <option value="">All difficulties</option>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={showNeedsReviewOnly} onChange={(event) => setShowNeedsReviewOnly(event.target.checked)} />
          Show missing or likely generic notes only
        </label>
        <p className="muted-note">{filtered.length} of {entries.length} rounds shown.</p>
        <div className="round-table">
          {filtered.map((entry) => (
            <button key={entry.key} type="button" className={`round-row ${selectedKey === entry.key ? "round-row-active" : ""}`} onClick={() => setSelectedKey(entry.key)}>
              <span>{entry.summary}</span>
              <small>{noteNeedsReview(entry.round) ? "Needs review" : "OK"} · {entry.packName} / {entry.gameTitle}</small>
            </button>
          ))}
          {filtered.length === 0 ? <p className="muted-note">No rounds match these filters.</p> : null}
        </div>
      </section>
      <section className="pack-detail">
        <h2>Edit Note</h2>
        {selectedEntry ? (
          <>
            <p className="muted-note">{selectedEntry.summary}</p>
            <p className="muted-note">{selectedEntry.packName} / {selectedEntry.gameTitle}</p>
            <textarea className="text-area" rows={10} value={noteText} onChange={(event) => setNoteText(event.target.value)} />
            <button type="button" className="primary-button" onClick={saveNote}>Save Note</button>
          </>
        ) : (
          <p className="muted-note">Select a note to edit.</p>
        )}
      </section>
    </div>
  );
}

function cleanFeedbackEndpoint(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const parsed = new URL(trimmed);
  const allowedHost = parsed.hostname === "forminit.com" || parsed.hostname === "getform.io";
  if (parsed.protocol !== "https:" || !allowedHost) {
    throw new Error("Feedback endpoint must be an HTTPS Forminit or Getform URL.");
  }
  return parsed.toString();
}

function SettingsTab() {
  const [feedbackEndpoint, setFeedbackEndpoint] = useState("");
  const [pin, setPin] = useState("");
  const [lockConfigured, setLockConfigured] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  useEffect(() => {
    window.adminHost?.getFeedbackEndpoint().then(setFeedbackEndpoint);
    window.adminHost?.getAdminLockState().then((state) => setLockConfigured(state.configured));
  }, []);

  async function saveFeedbackEndpoint() {
    if (!window.adminHost) return;
    try {
      const cleaned = cleanFeedbackEndpoint(feedbackEndpoint);
      setFeedbackEndpoint(await window.adminHost.setFeedbackEndpoint(cleaned));
      setStatus({ tone: "success", text: "Feedback endpoint saved." });
    } catch (error) {
      setStatus({ tone: "warning", text: error instanceof Error ? error.message : "Endpoint could not be saved." });
    }
  }

  async function savePin() {
    if (!window.adminHost) return;
    try {
      const state = await window.adminHost.setAdminPin(pin);
      setLockConfigured(state.configured);
      setPin("");
      setStatus({ tone: "success", text: "Admin PIN saved." });
    } catch (error) {
      setStatus({ tone: "warning", text: error instanceof Error ? error.message : "PIN could not be saved." });
    }
  }

  async function clearPin() {
    if (!window.adminHost) return;
    const state = await window.adminHost.clearAdminPin();
    setLockConfigured(state.configured);
    setStatus({ tone: "info", text: "Admin PIN cleared." });
  }

  async function exportSettings() {
    const result = await window.adminHost?.exportAppSettings();
    if (result && !result.canceled) setStatus({ tone: "success", text: "Settings exported." });
  }

  async function importSettings() {
    if (!window.confirm("Importing settings replaces the entire shared app-settings file.")) return;
    const result = await window.adminHost?.importAppSettings();
    if (result && !result.canceled) setStatus({ tone: "success", text: "Settings imported." });
  }

  async function clearSettings() {
    if (!window.confirm("Clear the entire shared app-settings file? The main app will recreate defaults on next launch.")) return;
    await window.adminHost?.clearAppSettings();
    setStatus({ tone: "info", text: "Shared app settings cleared." });
  }

  return (
    <div className="settings-grid">
      <section className="pack-detail">
        <h2>Settings</h2>
        {status ? <div className={`status-banner status-${status.tone}`}>{status.text}</div> : null}
        <div className="field-row">
          <label>Feedback endpoint</label>
          <input className="text-input" value={feedbackEndpoint} onChange={(event) => setFeedbackEndpoint(event.target.value)} />
          <button type="button" className="primary-button" onClick={saveFeedbackEndpoint}>Save Endpoint</button>
        </div>
        <div className="field-row">
          <label>Admin PIN {lockConfigured ? "(configured)" : "(not configured)"}</label>
          <input className="text-input" type="password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="4-12 digits" />
          <div className="inline-controls">
            <button type="button" className="secondary-button" onClick={savePin}>Set PIN</button>
            <button type="button" className="ghost-button" onClick={clearPin} disabled={!lockConfigured}>Clear PIN</button>
          </div>
        </div>
      </section>
      <section className="pack-detail">
        <h2>Shared App Settings</h2>
        <p className="muted-note">These actions operate on the full shared app-settings JSON used by the game app.</p>
        <div className="inline-controls">
          <button type="button" className="secondary-button" onClick={exportSettings}>Export</button>
          <button type="button" className="secondary-button" onClick={importSettings}>Import</button>
          <button type="button" className="ghost-button" onClick={clearSettings}>Clear All</button>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------------------
// Stats & Ratings tab
// ---------------------------------------------------------------------------------------

function StatsTab() {
  const [data, setData] = useState<StatsAndRatings | null>(null);
  const [status, setStatus] = useState("");

  async function refresh() {
    if (!window.adminHost) {
      return;
    }
    setData(await window.adminHost.getStatsAndRatings());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleClearStats() {
    if (!data || Object.keys(data.gameStats).length === 0) {
      setStatus("There are no play statistics to clear.");
      return;
    }
    if (!window.confirm("Clear all saved play statistics?")) {
      return;
    }
    if (!window.adminHost) {
      return;
    }
    setData(await window.adminHost.clearStats());
    setStatus("Play statistics cleared.");
  }

  async function handleClearRatings() {
    if (!data || Object.keys(data.challengeRatings).length === 0) {
      setStatus("There are no saved ratings to clear.");
      return;
    }
    if (!window.confirm("Clear all saved challenge ratings?")) {
      return;
    }
    if (!window.adminHost) {
      return;
    }
    setData(await window.adminHost.clearRatings());
    setStatus("Challenge ratings cleared.");
  }

  if (!data) {
    return <p>Loading stats…</p>;
  }

  const gameIds = Object.keys(data.gameStats);
  const totalPlays = gameIds.reduce((sum, id) => sum + (data.gameStats[id]?.totalPlays ?? 0), 0);
  const totalCompleted = gameIds.reduce((sum, id) => sum + (data.gameStats[id]?.completedPlays ?? 0), 0);

  return (
    <div className="stats-tab">
      <div className="inline-controls">
        <button type="button" className="secondary-button" onClick={handleClearStats}>
          Clear Stats
        </button>
        <button type="button" className="secondary-button" onClick={handleClearRatings}>
          Clear Ratings
        </button>
      </div>
      {status ? <p className="muted-note">{status}</p> : null}

      <p>
        {totalPlays} plays started · {totalCompleted} completed
      </p>

      <table className="stats-table">
        <thead>
          <tr>
            <th>Game</th>
            <th>Plays</th>
            <th>Completed</th>
            <th>Best Score</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {GAMES.map((game) => {
            const stats = data.gameStats[game.gameId];
            const rating = data.challengeRatings[game.gameId];
            return (
              <tr key={game.gameId}>
                <td>{game.label}</td>
                <td>{stats?.totalPlays ?? 0}</td>
                <td>{stats?.completedPlays ?? 0}</td>
                <td>{stats?.bestScore ?? "—"}</td>
                <td>{rating ? `${(rating.totalStars / rating.ratingCount).toFixed(1)} (${rating.ratingCount})` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------------------
// Updates tab
// ---------------------------------------------------------------------------------------

function UpdatesTab() {
  const [checkResult, setCheckResult] = useState<UpdateCheckResult | null>(null);
  const [status, setStatus] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function handleCheck() {
    if (!window.adminHost) {
      setStatus("adminHost bridge is not available.");
      return;
    }
    setIsBusy(true);
    setStatus("Checking for updates…");
    try {
      const result = await window.adminHost.checkForUpdates();
      setCheckResult(result);
      setStatus(result.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not check for updates.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleInstallBoth() {
    if (!window.adminHost) {
      return;
    }
    if (!window.confirm("Download and install the latest Bible Challenge and admin console installers? The admin console will close to finish its own update.")) {
      return;
    }
    setIsBusy(true);
    setStatus("Downloading installers…");
    try {
      const result = await window.adminHost.downloadAndInstallBothUpdates();
      setStatus(`${result.main.message} ${result.admin.message}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not download and install updates.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleOpenReleases() {
    if (checkResult?.releaseUrl && window.adminHost) {
      await window.adminHost.openExternal(checkResult.releaseUrl);
    }
  }

  return (
    <div className="updates-tab">
      <div className="inline-controls">
        <button type="button" className="primary-button" onClick={handleCheck} disabled={isBusy}>
          Check For Updates
        </button>
        {checkResult?.hasUpdate ? (
          <button type="button" className="secondary-button" onClick={handleInstallBoth} disabled={isBusy}>
            Download And Install Both
          </button>
        ) : null}
        {checkResult ? (
          <button type="button" className="ghost-button" onClick={handleOpenReleases}>
            Open Releases
          </button>
        ) : null}
      </div>

      {status ? <p className="muted-note">{status}</p> : null}

      {checkResult ? (
        <table className="stats-table">
          <tbody>
            <tr>
              <td>Installed version</td>
              <td>{checkResult.currentVersion}</td>
            </tr>
            <tr>
              <td>Latest version</td>
              <td>{checkResult.latestVersion}</td>
            </tr>
            <tr>
              <td>Bible Challenge installer</td>
              <td>{checkResult.mainInstaller?.assetName ?? "not found in latest release"}</td>
            </tr>
            <tr>
              <td>Admin console installer</td>
              <td>{checkResult.adminInstaller?.assetName ?? "not found in latest release"}</td>
            </tr>
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
