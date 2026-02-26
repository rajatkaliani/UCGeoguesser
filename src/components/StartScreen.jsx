import styles from './StartScreen.module.css';

export default function StartScreen({ onPlay }) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.badge}>UC IRVINE</div>
        <h1 className={styles.title}>
          UCI <span className={styles.titleAccent}>GeoGuesser</span>
        </h1>
        <p className={styles.subtitle}>
          Can you navigate the Anteater campus by sight?
        </p>

        <div className={styles.featureList}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🗺️</span>
            <span>Explore 30+ real UCI locations</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📍</span>
            <span>Drop a pin on the mini-map to guess</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🏆</span>
            <span>Score up to 5,000 pts per round</span>
          </div>
        </div>

        <button className={`btn btn-primary ${styles.playBtn}`} onClick={onPlay}>
          Play Now
        </button>

        <p className={styles.hint}>
          5 rounds · 25,000 points max · From Aldrich Park to Turtle Rock
        </p>
      </div>

      {/* Grid decoration */}
      <div className={styles.grid} />
    </div>
  );
}
