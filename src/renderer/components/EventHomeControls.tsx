import type { CSSProperties } from "react";
import type { EventScoreEntry } from "../appTypes";

interface EventHomeControlsProps {
  actionStatus: string;
  actionLabel: string;
  actionDisabled: boolean;
  isStartingGame: boolean;
  eventHasStarted: boolean;
  isEventFinished: boolean;
  eventName: string;
  completedChallengeCount: number;
  selectedChallengeCount: number;
  standings: EventScoreEntry[];
  onStartNext: () => void;
  onEndEarly: () => void;
}

export function EventHomeControls({
  actionStatus,
  actionLabel,
  actionDisabled,
  isStartingGame,
  eventHasStarted,
  isEventFinished,
  eventName,
  completedChallengeCount,
  selectedChallengeCount,
  standings,
  onStartNext,
  onEndEarly
}: EventHomeControlsProps) {
  return (
    <>
      <div className="event-home-actions">
        <div>
          <span className="winner-card-label">Event</span>
          <strong>{actionStatus}</strong>
        </div>
        <div className="event-home-buttons">
          <button type="button" className="primary-button" onClick={onStartNext} disabled={actionDisabled}>
            {isStartingGame ? "Starting..." : actionLabel}
          </button>
          {eventHasStarted && !isEventFinished ? (
            <button type="button" className="secondary-button" onClick={onEndEarly}>
              End Event
            </button>
          ) : null}
        </div>
      </div>
      <div className="event-score-strip">
        <div>
          <span className="winner-card-label">Event Mode</span>
          <strong>{eventName.trim() || "Untitled Event"}</strong>
          <p>
            {completedChallengeCount} of {selectedChallengeCount} challenge
            {selectedChallengeCount === 1 ? "" : "s"} completed
          </p>
        </div>
        <div className="event-score-list">
          {standings.length === 0 ? (
            <span className="event-score-empty">No completed challenges yet.</span>
          ) : (
            standings.map((entry, index) => (
              <span
                key={entry.key}
                className="event-score-pill"
                style={{ "--participant-color": entry.color } as CSSProperties}
              >
                {index + 1}. {entry.participantName}: {entry.totalScore}
              </span>
            ))
          )}
        </div>
      </div>
    </>
  );
}
