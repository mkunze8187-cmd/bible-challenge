import { GAME_LIBRARY, type GameId } from "../../lib/gameEngine";
import type { GamePlayStats } from "../appTypes";

interface StatsRow {
  mode: GameId;
  stats: GamePlayStats;
}

interface StatsCardListProps {
  rows: StatsRow[];
  formatLastPlayed: (value: string | null) => string;
  formatAverageScore: (stats: GamePlayStats) => string;
  formatPercent: (value: number, total: number) => string;
}

export function StatsCardList({ rows, formatLastPlayed, formatAverageScore, formatPercent }: StatsCardListProps) {
  return (
    <div className="stats-card-list">
      {rows.length === 0 ? (
        <div className="static-card settings-card">
          <strong>No play statistics yet.</strong>
          <p className="settings-help">Stats are recorded when a challenge starts and updated when it is completed.</p>
        </div>
      ) : (
        rows.map(({ mode, stats }) => (
          <article key={mode} className="stats-card">
            <div className="stats-card-header">
              <div>
                <span className="winner-card-label">{GAME_LIBRARY[mode].label}</span>
                <strong>
                  {stats.totalPlays} play{stats.totalPlays === 1 ? "" : "s"}
                </strong>
              </div>
              <span className="pill pill-muted">Last: {formatLastPlayed(stats.lastPlayedAt)}</span>
            </div>
            <div className="stats-metric-grid">
              <span>
                Individual <strong>{stats.individualPlays}</strong>
              </span>
              <span>
                Team <strong>{stats.teamPlays}</strong>
              </span>
              <span>
                Event <strong>{stats.eventPlays}</strong>
              </span>
              <span>
                Completed <strong>{stats.completedPlays}</strong>
              </span>
              <span>
                Avg Score <strong>{formatAverageScore(stats)}</strong>
              </span>
              <span>
                Best Score <strong>{stats.bestScore}</strong>
              </span>
              <span>
                Miss Rate <strong>{formatPercent(stats.totalMissedPrompts, stats.totalPrompts)}</strong>
              </span>
              <span>
                Wrong Attempts <strong>{stats.totalIncorrectAttempts}</strong>
              </span>
            </div>
            {stats.missedPrompts.length > 0 ? (
              <div className="missed-prompt-list">
                <span className="winner-card-label">Most Missed</span>
                {stats.missedPrompts.slice(0, 5).map((miss) => (
                  <div key={miss.itemId} className="missed-prompt-row">
                    <div>
                      <strong>{miss.label}</strong>
                      {miss.reference ? <span>{miss.reference}</span> : null}
                    </div>
                    <em>{miss.misses}</em>
                  </div>
                ))}
              </div>
            ) : (
              <p className="settings-help">No missed cards, questions, or puzzles recorded for this game.</p>
            )}
          </article>
        ))
      )}
    </div>
  );
}
