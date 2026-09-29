import { useEffect, useRef, useState } from "react";

/**
 * Drives the mouth opening (0 → 1) while the companion "speaks".
 * Falls back to a natural syllable rhythm when no live audio level is given.
 */
export function useLipSync(active: boolean, getLevel?: () => number) {
  const [open, setOpen] = useState(0);
  const frame = useRef<number | null>(null);
  const levelRef = useRef(getLevel);
  levelRef.current = getLevel;

  useEffect(() => {
    if (!active) {
      setOpen(0);
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOpen(0.35);
      return;
    }

    const start = performance.now();
    let last = 0;

    const tick = (now: number) => {
      if (now - last > 55) {
        last = now;
        const live = levelRef.current?.();
        if (typeof live === "number") {
          setOpen(Math.max(0, Math.min(1, live)));
        } else {
          const t = (now - start) / 1000;
          const syllable = Math.sin(t * 15) * 0.5 + 0.5;
          const phrase = Math.sin(t * 2.3) * 0.5 + 0.5;
          const jitter = Math.random() * 0.18;
          setOpen(Math.max(0, Math.min(1, syllable * (0.45 + phrase * 0.55) + jitter - 0.1)));
        }
      }
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      setOpen(0);
    };
  }, [active]);

  return open;
}
