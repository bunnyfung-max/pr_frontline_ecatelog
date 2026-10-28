import { useEffect, useRef, type RefObject } from 'react';
import { swipeDirection, type SwipeDirection } from '@/lib/swipe';

const IGNORED_TARGETS = 'button, a, input, select, textarea';
/** Native video controls (seek bar, buttons) sit in this strip at the bottom of the video. */
const VIDEO_CONTROLS_HEIGHT = 72;

function startsOnControl(target: Element | null, y: number) {
  if (!target) return false;
  if (target.closest(IGNORED_TARGETS)) return true;
  const video = target.closest('video');
  return Boolean(video && y > video.getBoundingClientRect().bottom - VIDEO_CONTROLS_HEIGHT);
}

/** One-finger horizontal swipe on touch screens; pinch and zoomed panning are left alone. */
export function useSwipeNavigation(
  targetRef: RefObject<HTMLElement | null>,
  { enabled, onSwipe }: { enabled: boolean; onSwipe: (direction: SwipeDirection) => void },
) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    let start: { x: number; y: number; time: number } | null = null;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (
        event.touches.length !== 1 ||
        !enabledRef.current ||
        startsOnControl(event.target as Element | null, touch.clientY)
      ) {
        start = null;
        return;
      }
      start = { x: touch.clientX, y: touch.clientY, time: performance.now() };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) start = null;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!start || event.touches.length > 0 || !enabledRef.current) {
        if (event.touches.length === 0) start = null;
        return;
      }
      const touch = event.changedTouches[0];
      const direction = touch
        ? swipeDirection(touch.clientX - start.x, touch.clientY - start.y, performance.now() - start.time)
        : null;
      start = null;
      if (direction) onSwipeRef.current(direction);
    };

    const onTouchCancel = () => {
      start = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchCancel);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [targetRef]);
}
