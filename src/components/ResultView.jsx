import { useEffect, useRef, useState } from 'react';
import { formatDistance } from '../utils/scoring';
import styles from './ResultView.module.css';

// Gold pin for the actual answer location
const ACTUAL_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="40" height="52">
  <path d="M20 2C11.2 2 4 9.2 4 18c0 13 16 32 16 32s16-19 16-32C36 9.2 28.8 2 20 2z" fill="#FFD200" stroke="#003264" stroke-width="2.5"/>
  <circle cx="20" cy="18" r="7" fill="#003264"/>
</svg>`;

// Person/pegman icon for the user's guess
const PERSON_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="40" height="52">
  <path d="M20 2C11.2 2 4 9.2 4 18c0 13 16 32 16 32s16-19 16-32C36 9.2 28.8 2 20 2z" fill="#e53935" stroke="white" stroke-width="2.5"/>
  <circle cx="20" cy="13" r="4.5" fill="white"/>
  <ellipse cx="20" cy="21.5" rx="5.5" ry="5" fill="white"/>
</svg>`;

function svgToDataUrl(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function ResultView({ result, round, totalRounds, onNext, isLastRound }) {
  const mapRef = useRef(null);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!mapRef.current) return;

    const { guessLat, guessLng, actualLat, actualLng } = result;

    const actualPos = { lat: actualLat, lng: actualLng };
    const guessPos = { lat: guessLat, lng: guessLng };

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(actualPos);
    bounds.extend(guessPos);

    const map = new window.google.maps.Map(mapRef.current, {
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
    });

    map.fitBounds(bounds, 80);

    const iconSize = new window.google.maps.Size(40, 52);
    const iconAnchor = new window.google.maps.Point(20, 52);

    // Gold pin = actual answer
    new window.google.maps.Marker({
      position: actualPos,
      map,
      title: 'Actual location',
      icon: {
        url: svgToDataUrl(ACTUAL_ICON_SVG),
        scaledSize: iconSize,
        anchor: iconAnchor,
      },
      animation: window.google.maps.Animation.DROP,
      zIndex: 2,
    });

    // Person icon = user's guess
    new window.google.maps.Marker({
      position: guessPos,
      map,
      title: 'Your guess',
      icon: {
        url: svgToDataUrl(PERSON_ICON_SVG),
        scaledSize: iconSize,
        anchor: iconAnchor,
      },
      animation: window.google.maps.Animation.DROP,
      zIndex: 1,
    });

    // Dashed line connecting them
    new window.google.maps.Polyline({
      path: [actualPos, guessPos],
      map,
      strokeColor: '#FFD200',
      strokeOpacity: 0,
      strokeWeight: 3,
      icons: [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.85, scale: 4, strokeColor: '#FFD200' },
        offset: '0',
        repeat: '16px',
      }],
    });
  }, [result]);

  // Animate score counting up
  useEffect(() => {
    const target = result.score;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setDisplayScore(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [result.score]);

  const scorePercent = result.score / 5000;
  const scoreColor = scorePercent > 0.8 ? '#4caf50' : scorePercent > 0.5 ? '#FFD200' : scorePercent > 0.25 ? '#ff9800' : '#e53935';

  return (
    <div className={styles.container}>
      <div ref={mapRef} className={styles.map} />

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#FFD200', border: '2px solid #003264' }} />
          Actual
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#e53935', border: '2px solid white' }} />
          Your guess
        </span>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Distance</span>
              <span className={styles.statValue}>{formatDistance(result.distance)}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Score</span>
              <span className={styles.statValue} style={{ color: scoreColor }}>
                {displayScore.toLocaleString()}
              </span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Round</span>
              <span className={styles.statValue}>{round} / {totalRounds}</span>
            </div>
          </div>

          <div className={styles.scoreBar}>
            <div
              className={styles.scoreBarFill}
              style={{ width: `${scorePercent * 100}%`, background: scoreColor }}
            />
          </div>
          <div className={styles.scoreBarLabels}>
            <span>0</span>
            <span>5,000</span>
          </div>

          <button className={`btn btn-primary ${styles.nextBtn}`} onClick={onNext}>
            {isLastRound ? 'See Final Score' : `Round ${round + 1} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
