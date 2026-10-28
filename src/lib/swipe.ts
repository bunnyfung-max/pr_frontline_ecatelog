export type SwipeDirection = 'next' | 'previous';

export const SWIPE_MIN_DISTANCE = 50;
export const SWIPE_MAX_DURATION_MS = 800;

/** Left swipe turns to the next page, right swipe to the previous one. */
export function swipeDirection(dx: number, dy: number, elapsedMs: number): SwipeDirection | null {
  if (elapsedMs > SWIPE_MAX_DURATION_MS) return null;
  if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return null;
  if (Math.abs(dx) < Math.abs(dy) * 1.5) return null;
  return dx < 0 ? 'next' : 'previous';
}
