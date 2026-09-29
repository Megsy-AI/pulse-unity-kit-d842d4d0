import { memo } from "react";
import { cn } from "@/lib/utils";
import type { NomiCompanion, NomiPose } from "../types";
import lavender from "@/assets/nomi-look-lavender.webp";
import mint from "@/assets/nomi-look-mint.webp";
import peach from "@/assets/nomi-look-peach.webp";
import ivory from "@/assets/nomi-look-ivory.webp";

interface NomiAvatarProps {
  companion: Pick<NomiCompanion, "name" | "shape" | "baseColor" | "accentColor" | "glasses" | "outfit">;
  pose?: NomiPose;
  speaking?: boolean;
  getLevel?: () => number;
  size?: number;
  floating?: boolean;
  className?: string;
}

function NomiAvatarBase({
  companion,
  pose = "idle",
  speaking = false,
  getLevel: _getLevel,
  size = 220,
  floating = true,
  className,
}: NomiAvatarProps) {
  const source = companion.shape === "robot" ? mint : companion.shape === "star" ? peach : companion.shape === "bear" ? ivory : lavender;

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center",
        floating && "nomi-image-float",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img src={source} alt={`${companion.name}, your companion`} width={512} height={512} loading={size >= 100 ? "eager" : "lazy"} decoding="async" fetchPriority={size >= 100 ? "high" : "auto"} className={cn("size-full object-contain", speaking && "opacity-95")} data-pose={pose} data-glasses={companion.glasses} data-outfit={companion.outfit} />
    </span>
  );
}

export const NomiAvatar = memo(NomiAvatarBase);