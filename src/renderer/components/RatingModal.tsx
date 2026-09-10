import type { GameId } from "../../lib/gameEngine";

interface RatingModalProps {
  gameId: GameId;
  gameLabel: string;
  ratingLabel: string;
  onClose: () => void;
  onRate: (gameId: GameId, stars: number) => void;
}

export function RatingModal({ gameId, gameLabel, ratingLabel, onClose, onRate }: RatingModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="info-modal rating-modal" role="dialog" aria-modal="true" aria-labelledby="rating-title">
        <div className="section-header">
          <div>
            <p className="eyebrow">Challenge Rating</p>
            <h2 id="rating-title">{gameLabel}</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="static-card">
          <strong>{ratingLabel}</strong>
          <div className="rating-dialog-stars" role="radiogroup" aria-label={`${gameLabel} rating`}>
            {Array.from({ length: 5 }, (_, ratingIndex) => {
              const stars = ratingIndex + 1;
              return (
                <button
                  key={stars}
                  type="button"
                  className="star-button rating-dialog-star"
                  role="radio"
                  aria-checked={false}
                  aria-label={`Rate ${gameLabel} ${stars} star${stars === 1 ? "" : "s"}`}
                  onClick={() => onRate(gameId, stars)}
                >
                  ★
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
