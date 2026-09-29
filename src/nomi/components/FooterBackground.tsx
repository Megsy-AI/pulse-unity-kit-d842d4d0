import { useEffect, useRef } from "react";
import footerVideo from "@/assets/footer-scrub.mp4.asset.json";
import footerVideoWebm from "@/assets/footer-scrub.webm.asset.json";
import gazeFrames from "./gaze-frames.json";

const TAU = Math.PI * 2;
const wrappedAngle = (angle: number) => ((angle % TAU) + TAU) % TAU;

export function timeForAngle(angle: number) {
  const target = wrappedAngle(angle);
  let nearestTime = gazeFrames[0]?.[1] ?? 0;
  let nearestDistance = Infinity;
  for (const [sampleAngle, time] of gazeFrames) {
    const difference = Math.abs(target - sampleAngle);
    const distance = Math.min(difference, TAU - difference);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestTime = time;
    }
  }
  return nearestTime + 1 / 240;
}

export default function FooterBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let frame = 0;
    let desiredTime = 0;
    let pointer: { x: number; y: number } | null = null;
    let disposed = false;
    const mobile = window.matchMedia("(max-width: 700px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const seek = () => {
      frame = 0;
      if (disposed || mobile.matches || video.readyState < 2 || video.seeking) return;
      if (Math.abs(video.currentTime - desiredTime) > 1 / 48) {
        video.currentTime = Math.min(desiredTime, Math.max(0, video.duration - 1 / 24));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(seek);
    };
    const updateTarget = () => {
      if (mobile.matches || !pointer) return;
      const rect = video.getBoundingClientRect();
      const scale = Math.max(rect.width / 1920, rect.height / 1080);
      const eyeX = rect.left + rect.width / 2 + (948 - 960) * scale;
      const eyeY = rect.top + rect.height / 2 + (418 - 540) * scale;
      const dx = pointer.x - eyeX;
      const dy = pointer.y - eyeY;
      if (Math.hypot(dx, dy) > 8) {
        desiredTime = timeForAngle(Math.atan2(dy, dx));
        schedule();
      }
    };
    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      updateTarget();
    };
    const ready = () => {
      video.loop = mobile.matches;
      if (mobile.matches && !reducedMotion.matches) void video.play().catch(() => undefined);
      else video.pause();
      if (!mobile.matches) {
        desiredTime = 0;
        schedule();
      }
    };
    const changed = () => ready();
    const seeked = () => schedule();

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", updateTarget, { passive: true });
    window.addEventListener("scroll", updateTarget, { passive: true });
    video.addEventListener("loadeddata", ready);
    video.addEventListener("seeked", seeked);
    mobile.addEventListener("change", changed);
    reducedMotion.addEventListener("change", changed);
    if (video.readyState >= 2) ready();

    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("seeked", seeked);
      mobile.removeEventListener("change", changed);
      reducedMotion.removeEventListener("change", changed);
    };
  }, []);

  return (
    <div className="studio-footer-background" aria-hidden="true">
      <video ref={videoRef} muted playsInline preload="auto">
        <source src={footerVideo.url} type="video/mp4" />
        <source src={footerVideoWebm.url} type="video/webm" />
      </video>
    </div>
  );
}