/**
 * Mock restaurant metadata (hours, rating, ETA, distance) standing in for the API.
 *
 * Home screen imports: isOpenAt(), SERVICE, OPENS_AT_LABEL. Tests also import HOURS.
 * Preserve all these exported signatures when you swap the body.
 */

/**
 * Service hours. The home screen's closed strip is computed from these rather
 * than toggled, so it reflects reality — which means it does not appear at all
 * between open and close.
 */
export const HOURS = { open: 12, close: 23 } as const;

export const OPENS_AT_LABEL = '12:00 PM';

export const isOpenAt = (d: Date): boolean => {
  const h = d.getHours();
  return h >= HOURS.open && h < HOURS.close;
};

/** Mock delivery metadata for the status strip. */
export const SERVICE = {
  rating: 4.8,
  etaMinutes: 30,
  distanceKm: 2.1,
} as const;
