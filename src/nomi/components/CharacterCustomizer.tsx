import { useMemo, useState } from "react";
import { Check, Glasses, Palette, Shirt, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NomiAvatar } from "../avatar/NomiAvatar";
import { useNomi } from "../store";
import type { NomiCompanion } from "../types";

const assets = import.meta.glob("../../assets/character/**/*.png", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
type Category = "glasses" | "outfits" | "hair" | "faces" | "colors" | "accessories";
const CATEGORIES: Array<{ id: Category; en: string; ar: string; icon: typeof Glasses }> = [
  { id: "glasses", en: "Glasses", ar: "النظارات", icon: Glasses }, { id: "outfits", en: "Outfits", ar: "الملابس", icon: Shirt },
  { id: "hair", en: "Hair", ar: "الشعر", icon: Sparkles }, { id: "faces", en: "Face", ar: "الوجه", icon: UserRound },
  { id: "colors", en: "Colors", ar: "الألوان", icon: Palette }, { id: "accessories", en: "Extras", ar: "الإضافات", icon: WandSparkles },
];
const LABELS: Record<Exclude<Category, "colors">, string[]> = {
  glasses: ["Black oval", "Clear square", "Cobalt round", "Pink heart", "Silver slim", "Amber sun", "Ocean blue", "Sage round", "Cat eye", "Sport wrap"],
  outfits: ["Varsity", "Navy hoodie", "Peach overall", "Red knit", "Sunday shirt", "Mint cardigan", "Rain coat", "Black set", "Lavender", "Blue blazer"],
  hair: ["Soft tuft", "Side sweep", "Tiny buns", "Short curls", "Cloud curls", "Neat quiff", "Soft fringe", "Braided crown", "Pony tuft", "Natural"],
  faces: ["Bright", "Gentle", "Freckles", "Lashes", "Rosy", "Shy", "Calm", "Bold", "Happy", "Curious"],
  accessories: ["Nomi cap", "Cream beanie", "Headphones", "Bow", "Silk scarf", "Star pin", "Crown", "Flower", "Necktie", "Backpack"],
};
const COLORS = [
  ["Ivory", "#F4E8D5", "#D52D27"], ["Lavender", "#B7A9F4", "#2856D8"], ["Mint", "#BCE9CF", "#142C55"], ["Peach", "#FFA987", "#F38CAD"], ["Sky", "#B9DDF5", "#2563EB"],
  ["Lemon", "#F6E7A4", "#E08C2B"], ["Rose", "#F2B8C6", "#9D3155"], ["Cocoa", "#B9876C", "#513126"], ["Pearl", "#E9E8E4", "#536172"], ["Coral", "#F3A28E", "#1D6B72"],
] as const;
const getAsset = (category: Exclude<Category, "colors">, index: number) => Object.entries(assets).find(([path]) => path.endsWith(`/${category}-${String(index + 1).padStart(2, "0")}.png`))?.[1];

export function CharacterCustomizer({ onDone }: { onDone?: () => void }) {
  const { companion, updateCompanion, language } = useNomi();
  const [category, setCategory] = useState<Category>("glasses");
  const [previewKey, setPreviewKey] = useState(0);
  const ar = language === "ar";
  const selections = useMemo(() => ({ glasses: companion.glasses, outfits: companion.outfit, hair: companion.hair ?? "hair-01", faces: companion.face ?? "faces-01", accessories: companion.accessory ?? "accessories-01" }), [companion]);
  const choose = (patch: Partial<NomiCompanion>) => { updateCompanion(patch); setPreviewKey((value) => value + 1); };
  const selectedId = category === "colors" ? "" : selections[category];
  const previewIndex = Math.max(0, Number(selectedId.split("-").at(-1)) - 1);
  const previewAsset = category === "colors" ? null : getAsset(category, previewIndex);

  return (
    <section className="min-h-dvh overflow-hidden bg-background" dir={ar ? "rtl" : "ltr"}>
      <div className="relative flex min-h-[325px] items-center justify-center overflow-hidden bg-primary-soft px-5 pt-6 md:min-h-[400px]">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-card/40 to-transparent" />
        <div key={previewKey} className="relative animate-character-pop"><NomiAvatar companion={companion} pose="idle" size={320} floating={false} />{previewAsset ? <img src={previewAsset} alt="" className="pointer-events-none absolute -end-5 top-3 size-20 object-contain drop-shadow-sm" /> : null}</div>
        <div className="absolute bottom-4 start-5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">{companion.name}</div>
      </div>
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur"><div className="scrollbar-none flex overflow-x-auto px-3">{CATEGORIES.map(({ id, en, ar: labelAr, icon: Icon }) => <Button key={id} type="button" variant="ghost" onClick={() => setCategory(id)} className={cn("relative h-14 shrink-0 rounded-none px-4 text-xs text-muted-foreground", category === id && "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-foreground")}><Icon className="size-4" />{ar ? labelAr : en}</Button>)}</div></div>
      <div className="mx-auto max-w-3xl p-4 pb-8 md:p-6">
        <div className="mb-4 flex items-end justify-between"><div><p className="text-lg font-semibold">{ar ? CATEGORIES.find((item) => item.id === category)?.ar : CATEGORIES.find((item) => item.id === category)?.en}</p><p className="mt-0.5 text-xs text-muted-foreground">{ar ? "اختر من 10 تصميمات" : "Choose from 10 designs"}</p></div><span className="text-xs font-medium text-muted-foreground">10</span></div>
        {category === "colors" ? <div className="grid grid-cols-5 gap-3">{COLORS.map(([name, base, accent]) => { const selected = companion.baseColor === base; return <Button key={name} type="button" variant="ghost" aria-label={name} onClick={() => choose({ baseColor: base, accentColor: accent })} className={cn("relative aspect-square h-auto rounded-full border-2 p-1.5", selected ? "border-foreground" : "border-transparent")}><span className="size-full rounded-full" style={{ backgroundColor: base }} />{selected ? <Check className="absolute size-4 text-foreground" /> : null}</Button>; })}</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{LABELS[category].map((label, index) => { const id = `${category}-${String(index + 1).padStart(2, "0")}`; const legacySelected = (category === "glasses" && index === 0 && companion.glasses === "black-oval") || (category === "outfits" && index === 3 && companion.outfit === "knit"); const selected = selectedId === id || legacySelected; const patch = category === "glasses" ? { glasses: id } : category === "outfits" ? { outfit: id } : category === "hair" ? { hair: id } : category === "faces" ? { face: id } : { accessory: id }; return <Button key={id} type="button" variant="ghost" onClick={() => choose(patch as Partial<NomiCompanion>)} className={cn("relative h-auto min-h-32 flex-col overflow-hidden rounded-lg border bg-secondary/55 p-2 transition-all duration-200", selected ? "border-foreground bg-card shadow-sm" : "border-transparent hover:bg-secondary")}><img src={getAsset(category, index)} alt="" className="aspect-square w-full object-contain" /><span className="w-full truncate px-1 text-xs font-medium">{label}</span>{selected ? <span className="absolute end-2 top-2 grid size-5 place-items-center rounded-full bg-foreground text-background"><Check className="size-3" /></span> : null}</Button>; })}</div>}
        {onDone ? <div className="sticky bottom-0 mt-6 bg-background/95 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur"><Button type="button" onClick={onDone} className="h-14 w-full rounded-full text-base">{ar ? "التالي" : "Next"}</Button></div> : null}
      </div>
    </section>
  );
}