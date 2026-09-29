import { memo } from "react";
import { cn } from "@/lib/utils";
import type { NomiCompanion, NomiPose } from "../types";
import cleanBase from "@/assets/character/nomi-base-clean.png";

const combos = import.meta.glob("../../assets/character/combos/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const indexOf = (value?: string) => {
  const n = Number(value?.split("-").at(-1));
  return Number.isFinite(n) && n > 0 && n <= 10 ? n : 0;
};
const comboAt = (g: number, o: number) =>
  combos[`../../assets/character/combos/g${String(g).padStart(2, "0")}-o${String(o).padStart(2, "0")}.webp`];

export function comboSource(glasses?: string, outfit?: string) {
  const g = indexOf(glasses);
  const o = indexOf(outfit);
  return comboAt(g, o) ?? comboAt(0, o) ?? comboAt(g, 0) ?? comboAt(0, 0) ?? cleanBase;
}

interface NomiAvatarProps {
  companion: Pick<NomiCompanion, "name" | "glasses" | "outfit"> & Partial<NomiCompanion>;
  pose?: NomiPose;
  speaking?: boolean;
  getLevel?: () => number;
  size?: number;
  floating?: boolean;
  className?: string;
}

function NomiAvatarBase({ companion, pose = "idle", speaking = false, size = 220, floating = true, className }: NomiAvatarProps) {
  const src = comboSource(companion.glasses, companion.outfit);
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", floating && "nomi-image-float", className)} style={{ width: size, height: size }}>
      <img
        key={src}
        src={src}
        alt={`${companion.name}, your companion`}
        width={768}
        height={768}
        loading={size >= 100 ? "eager" : "lazy"}
        decoding="async"
        className={cn("size-full object-contain animate-character-pop", speaking && "opacity-95")}
        data-pose={pose}
      />
    </span>
  );
}

export const NomiAvatar = memo(NomiAvatarBase);
