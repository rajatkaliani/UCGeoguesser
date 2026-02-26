import { useEffect, useRef, useState } from 'react';
import { calculateDistance, calculateScore } from '../utils/scoring';
import GuessMap from './GuessMap';
import styles from './GameView.module.css';

// Max distance Street View is allowed to snap from the target coordinate.
// If nothing is found within this radius, the location is skipped.
const MAX_SNAP_RADIUS = 100; // meters

export default function GameView({ location, round, totalRounds, onGuessSubmit, onSkipLocation }) {
  const svRef = useRef(null);
  const panoramaRef = useRef(null);
  const actualPosRef = useRef({ lat: location.lat, lng: location.lng });
  const [svError, setSvError] = useState(false);

  useEffect(() => {
    if (!svRef.current || !location) return;

    actualPosRef.current = { lat: location.lat, lng: location.lng };
    setSvError(false);

    const sv = new window.google.maps.StreetViewService();

    sv.getPanorama(
      {
        location: { lat: location.lat, lng: location.lng },
        radius: MAX_SNAP_RADIUS,
        preference: window.google.maps.StreetViewPreference.NEAREST,
        source: window.google.maps.StreetViewSource.OUTDOOR,
      },
      (data, status) => {
        if (status !== 'OK') {
          // No Street View within radius — skip this location
          onSkipLocation();
          return;
        }

        const panoPos = data.location.latLng;
        actualPosRef.current = { lat: panoPos.lat(), lng: panoPos.lng() };

        const panorama = new window.google.maps.StreetViewPanorama(svRef.current, {
          pano: data.location.pano,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: false,
          showRoadLabels: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
          linksControl: true,
          panControl: true,
          zoomControl: true,
          enableCloseButton: false,
        });

        panoramaRef.current = panorama;
      }
    );
  }, [location]);

  function handleGuessSubmit({ guessLat, guessLng }) {
    const { lat, lng } = actualPosRef.current;
    const distance = calculateDistance(lat, lng, guessLat, guessLng);
    const score = calculateScore(distance);
    onGuessSubmit({ guessLat, guessLng, actualLat: lat, actualLng: lng, distance, score });
  }

  return (
    <div className={styles.container}>
      <div ref={svRef} className={styles.streetView} />

      <div className={styles.roundBadge}>
        Round {round} / {totalRounds}
      </div>

      <GuessMap
        onGuessSubmit={handleGuessSubmit}
        round={round}
        totalRounds={totalRounds}
      />
    </div>
  );
}
