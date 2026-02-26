import { useState, useEffect, useRef } from 'react';
import locations from './data/locations';
import StartScreen from './components/StartScreen';
import GameView from './components/GameView';
import ResultView from './components/ResultView';
import EndScreen from './components/EndScreen';

const TOTAL_ROUNDS = 5;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [screen, setScreen] = useState('start');
  const [mapsReady, setMapsReady] = useState(window.googleMapsReady || false);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  // Pool of unused locations to draw from when skipping a bad one
  const unusedPoolRef = useRef([]);

  useEffect(() => {
    if (!window.googleMapsReady) {
      const handler = () => setMapsReady(true);
      window.addEventListener('google-maps-ready', handler);
      return () => window.removeEventListener('google-maps-ready', handler);
    }
  }, []);

  function startGame() {
    const shuffled = shuffleArray(locations);
    const picked = shuffled.slice(0, TOTAL_ROUNDS);
    unusedPoolRef.current = shuffled.slice(TOTAL_ROUNDS);
    setSelectedLocations(picked);
    setCurrentRound(0);
    setRounds([]);
    setLastResult(null);
    setScreen('game');
  }

  // Called by GameView when a location has no Street View coverage nearby.
  // Swaps it out for the next unused location silently.
  function handleSkipLocation() {
    const pool = unusedPoolRef.current;
    if (pool.length === 0) return; // nothing left to swap in — shouldn't happen
    const [replacement, ...rest] = pool;
    unusedPoolRef.current = rest;
    setSelectedLocations(prev => {
      const next = [...prev];
      next[currentRound] = replacement;
      return next;
    });
    // Increment the key-like signal by forcing a re-render of GameView
    // We do this by temporarily removing and re-adding the location.
    // Since GameView uses `key={currentRound}` it won't re-mount — use a
    // separate skip counter instead.
    setSkipCount(n => n + 1);
  }

  const [skipCount, setSkipCount] = useState(0);

  function handleGuessSubmit({ guessLat, guessLng, actualLat, actualLng, distance, score }) {
    const result = {
      location: selectedLocations[currentRound],
      guessLat,
      guessLng,
      actualLat,
      actualLng,
      distance,
      score,
    };
    setLastResult(result);
    setRounds(prev => [...prev, result]);
    setScreen('result');
  }

  function handleNextRound() {
    const next = currentRound + 1;
    if (next >= TOTAL_ROUNDS) {
      setScreen('end');
    } else {
      setCurrentRound(next);
      setScreen('game');
    }
  }

  if (!mapsReady) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 16,
        background: 'var(--uci-blue)',
      }}>
        <div className="spinner" />
        <p className="text-muted">Loading Google Maps…</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 320, textAlign: 'center' }}>
          Make sure your API key is set in <code>index.html</code>
        </p>
      </div>
    );
  }

  return (
    <>
      {screen === 'start' && <StartScreen onPlay={startGame} />}
      {screen === 'game' && selectedLocations[currentRound] && (
        <GameView
          key={`${currentRound}-${skipCount}`}
          location={selectedLocations[currentRound]}
          round={currentRound + 1}
          totalRounds={TOTAL_ROUNDS}
          onGuessSubmit={handleGuessSubmit}
          onSkipLocation={handleSkipLocation}
        />
      )}
      {screen === 'result' && lastResult && (
        <ResultView
          result={lastResult}
          round={currentRound + 1}
          totalRounds={TOTAL_ROUNDS}
          onNext={handleNextRound}
          isLastRound={currentRound + 1 >= TOTAL_ROUNDS}
        />
      )}
      {screen === 'end' && (
        <EndScreen
          rounds={rounds}
          onPlayAgain={startGame}
        />
      )}
    </>
  );
}
