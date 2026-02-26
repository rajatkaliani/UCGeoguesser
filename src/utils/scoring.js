/**
 * Calculate distance between two lat/lng points using the Haversine formula.
 * Returns distance in meters.
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate score based on distance from target.
 * Max 5000 points. Score falls off exponentially.
 * ~5000 pts at 0m, ~1839 pts at 300m, ~189 pts at 1000m, ~0 pts at 2000m+
 */
export function calculateScore(distanceMeters) {
  return Math.round(5000 * Math.exp(-distanceMeters / 300));
}

/**
 * Format distance for display.
 * Returns e.g. "42 m" or "1.3 km"
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Get star rating (0-5) based on score out of 5000.
 */
export function getStarRating(totalScore, maxScore = 25000) {
  const pct = totalScore / maxScore;
  if (pct >= 0.95) return 5;
  if (pct >= 0.75) return 4;
  if (pct >= 0.5) return 3;
  if (pct >= 0.25) return 2;
  if (pct >= 0.1) return 1;
  return 0;
}
