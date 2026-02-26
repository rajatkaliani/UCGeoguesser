import { useEffect, useRef, useState } from 'react';
import styles from './GuessMap.module.css';

const UCI_CENTER = { lat: 33.6461, lng: -117.8427 };

// Subtle dark map style for the mini-map
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a2035' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8899aa' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a2035' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3d55' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a2035' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a4f6e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1c2e' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e2d42' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a3028' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1a2035' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#334466' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

export default function GuessMap({ onGuessSubmit, round, totalRounds }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const [expanded, setExpanded] = useState(true);
  const [pinPlaced, setPinPlaced] = useState(false);

  useEffect(() => {
    if (!mapRef.current || googleMapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: UCI_CENTER,
      zoom: 14,
      mapTypeId: 'roadmap',
      styles: MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
    });

    googleMapRef.current = map;

    map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng });
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 11,
            fillColor: '#FFD200',
            fillOpacity: 1,
            strokeColor: '#080d1a',
            strokeWeight: 3,
          },
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });
      }
      setPinPlaced(true);
    });
  }, []);

  function handleSubmit() {
    if (!markerRef.current) return;
    const pos = markerRef.current.getPosition();
    onGuessSubmit({ guessLat: pos.lat(), guessLng: pos.lng() });
  }

  return (
    <div className={`${styles.container} ${expanded ? styles.expanded : styles.collapsed}`}>
      <button
        className={styles.toggleBtn}
        onClick={() => setExpanded(v => !v)}
      >
        <span>Map</span>
        <span className={styles.toggleIcon}>▲</span>
      </button>

      <div className={styles.mapWrapper}>
        <div ref={mapRef} className={styles.map} />
        {!pinPlaced && (
          <div className={styles.hint}>Click to place your pin</div>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.roundLabel}>Round {round}/{totalRounds}</span>
        <button
          className={`btn btn-primary ${styles.submitBtn}`}
          onClick={handleSubmit}
          disabled={!pinPlaced}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
