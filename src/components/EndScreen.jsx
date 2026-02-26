import { useState, useEffect } from 'react';
import { formatDistance, getStarRating } from '../utils/scoring';
import styles from './EndScreen.module.css';

const MAX_SCORE = 25000;

export default function EndScreen({ rounds, onPlayAgain }) {
  const totalScore = rounds.reduce((sum, r) => sum + r.score, 0);
  const stars = getStarRating(totalScore);
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 80;
    const increment = totalScore / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplayTotal(Math.min(Math.round(increment * step), totalScore));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [totalScore]);

  const pct = totalScore / MAX_SCORE;
  const rankLabel =
    pct >= 0.95 ? 'True Anteater' :
    pct >= 0.75 ? 'Campus Expert' :
    pct >= 0.5  ? 'Regular Explorer' :
    pct >= 0.25 ? 'Occasional Visitor' :
    'First Timer';

  const rankColor =
    pct >= 0.95 ? '#4caf50' :
    pct >= 0.75 ? '#FFD200' :
    pct >= 0.5  ? '#6AA2B8' :
    pct >= 0.25 ? '#ff9800' :
    '#e53935';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={styles.star}
                style={{ color: i < stars ? '#FFD200' : 'rgba(255,255,255,0.2)' }}
              >
                ★
              </span>
            ))}
          </div>
          <div className={styles.totalScore}>{displayTotal.toLocaleString()}</div>
          <div className={styles.maxScore}>out of {MAX_SCORE.toLocaleString()} points</div>
          <div className={styles.rankBadge} style={{ background: rankColor }}>
            {rankLabel}
          </div>
        </div>

        {/* Round breakdown */}
        <div className={styles.breakdown}>
          <h3 className={styles.breakdownTitle}>Round Breakdown</h3>
          <div className={styles.roundList}>
            {rounds.map((r, i) => (
              <div key={i} className={styles.roundRow}>
                <span className={styles.roundNum}>{i + 1}</span>
                <div className={styles.roundInfo}>
                  <span className={styles.roundName}>{r.location.name}</span>
                  <span className={styles.roundDist}>{formatDistance(r.distance)}</span>
                </div>
                <div className={styles.roundScoreWrap}>
                  <div
                    className={styles.roundScoreBar}
                    style={{ width: `${(r.score / 5000) * 100}%` }}
                  />
                  <span className={styles.roundScore}>{r.score.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className={`btn btn-primary ${styles.playAgainBtn}`} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>

      <div className={styles.grid} />
    </div>
  );
}
