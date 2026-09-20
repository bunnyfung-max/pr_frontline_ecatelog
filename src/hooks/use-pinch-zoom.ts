import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 3;

function touchDistance(touches: TouchList) {
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/** Two-finger pinch zoom for touch devices (tablet / phone). */
export function usePinchZoom(resetKey: number | string) {
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const targetRef = useRef<HTMLDivElement>(null);
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);

  const applyScale = useCallback((value: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
    scaleRef.current = next;
    setScale(next);
  }, []);

  useEffect(() => {
    applyScale(1);
  }, [resetKey, applyScale]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        pinchStart.current = {
          distance: touchDistance(event.touches),
          scale: scaleRef.current,
        };
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || !pinchStart.current) return;
      event.preventDefault();
      const ratio = touchDistance(event.touches) / pinchStart.current.distance;
      applyScale(pinchStart.current.scale * ratio);
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) pinchStart.current = null;
      if (event.touches.length === 0 && scaleRef.current < 1.05) applyScale(1);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [applyScale]);

  return { scale, targetRef };
}
