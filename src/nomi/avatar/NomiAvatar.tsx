import { memo } from "react";
import { cn } from "@/lib/utils";
import type { NomiCompanion, NomiPose } from "../types";
import cleanBase from "@/assets/character/nomi-base-clean.png";

const itemAssets = import.meta.glob("../../assets/character/{glasses,outfits,hair,faces,accessories}/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const itemSource = (value?: string) => value && value !== "none"
  ? Object.entries(itemAssets).find(([path]) => path.endsWith(`/${value}.png`))?.[1]
  : undefined;

const layerClass = (kind: "face" | "outfit" | "hair" | "glasses" | "accessory", value?: string) => {
  if (kind === "face") return "left-[15%] top-[3%] h-[54%] w-[70%]";
  if (kind === "hair") return "left-[18%] top-0 h-[33%] w-[64%]";
  if (kind === "glasses") return "left-[23%] top-[23%] h-[20%] w-[54%]";
  if (kind === "outfit") return "left-[18%] top-[43%] h-[43%] w-[64%]";
  const index = Number(value?.split("-").at(-1));
  if (index === 4 || index === 5 || index === 9) return "left-[24%] top-[43%] h-[37%] w-[52%]";
  if (index === 6 || index === 8) return "left-[58%] top-[28%] h-[22%] w-[24%]";
  if (index === 10) return "left-[7%] top-[43%] h-[44%] w-[42%]";
  return "left-[15%] top-0 h-[45%] w-[70%]";
};

interface NomiAvatarProps {
  companion: Pick<NomiCompanion, "name" | "shape" | "baseColor" | "accentColor" | "glasses" | "outfit"> & Partial<Pick<NomiCompanion, "hair" | "face" | "accessory">>;
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
  const layers = [
    ["face", companion.face],
    ["hair", companion.hair],
    ["outfit", companion.outfit],
    ["glasses", companion.glasses],
    ["accessory", companion.accessory],
  ] as const;

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center",
        floating && "nomi-image-float",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-[7%] rounded-full opacity-20 blur-2xl" style={{ backgroundColor: companion.baseColor }} />
      <img src={cleanBase} alt={`${companion.name}, your companion`} width={1024} height={1024} loading={size >= 100 ? "eager" : "lazy"} decoding="async" fetchPriority={size >= 100 ? "high" : "auto"} className={cn("relative z-[1] size-full object-contain", speaking && "opacity-95")} data-pose={pose} />
      {layers.map(([kind, value], index) => {
        const source = itemSource(value);
        if (!source) return null;
        return <img key={`${kind}-${value}`} src={source} alt="" className={cn("pointer-events-none absolute object-contain", kind === "face" ? "z-[2]" : "z-[3]", layerClass(kind, value))} style={{ animationDelay: `${index * 24}ms` }} />;
      })}
    </span>
  );
}

export const NomiAvatar = memo(NomiAvatarBase);