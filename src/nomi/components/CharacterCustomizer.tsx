import { useState } from "react";
import { Check, CircleSlash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { NomiAvatar } from "../avatar/NomiAvatar";
import { useNomi } from "../store";
import type { NomiCompanion } from "../types";

const assets = import.meta.glob("../../assets/character/{glasses,outfits,hair,faces,accessories}/*.png", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
type Category = "glasses" | "outfits" | "hair" | "faces" | "colors" | "accessories";
const CATEGORIES: Array<{ id: Category; en: string; ar: string }> = [
  { id: "glasses", en: "Glasses", ar: "نظارات" }, { id: "outfits", en: "Clothes", ar: "ملابس" },
  { id: "hair", en: "Hair", ar: "شعر" }, { id: "faces", en: "Face", ar: "وجه" },
  { id: "colors", en: "Color", ar: "لون" }, { id: "accessories", en: "Extras", ar: "إضافات" },
];
const LABELS: Record<Exclude<Category, "colors">, string[]> = {
  glasses: ["Oval", "Clear", "Round", "Heart", "Slim", "Amber", "Ocean", "Sage", "Cat eye", "Sport"],
  outfits: ["Varsity", "Hoodie", "Overall", "Knit", "Sunday", "Cardigan", "Raincoat", "Black", "Lilac", "Blazer"],
  hair: ["Tuft", "Sweep", "Buns", "Curls", "Cloud", "Quiff", "Fringe", "Braids", "Pony", "Natural"],
  faces: ["Bright", "Gentle", "Freckles", "Lashes", "Rosy", "Shy", "Calm", "Bold", "Happy", "Curious"],
  accessories: ["Cap", "Beanie", "Headphones", "Bow", "Scarf", "Star", "Crown", "Flower", "Tie", "Backpack"],
};
const COLORS = [
  ["Ivory", "#F4E8D5", "#D52D27"], ["Lavender", "#B7A9F4", "#2856D8"], ["Mint", "#BCE9CF", "#142C55"], ["Peach", "#FFA987", "#F38CAD"], ["Sky", "#B9DDF5", "#2563EB"],
  ["Lemon", "#F6E7A4", "#E08C2B"], ["Rose", "#F2B8C6", "#9D3155"], ["Cocoa", "#B9876C", "#513126"], ["Pearl", "#E9E8E4", "#536172"], ["Coral", "#F3A28E", "#1D6B72"],
] as const;
const getAsset = (category: Exclude<Category, "colors">, index: number) => Object.entries(assets).find(([path]) => path.endsWith(`/${category}-${String(index + 1).padStart(2, "0")}.png`))?.[1];

export function CharacterCustomizer({ onDone }: { onDone?: () => void }) {
  const { companion, updateCompanion, language } = useNomi();
  const [category, setCategory] = useState<Category>("glasses");
  const ar = language === "ar";
  const selected = category === "glasses" ? companion.glasses : category === "outfits" ? companion.outfit : category === "hair" ? companion.hair : category === "faces" ? companion.face : category === "accessories" ? companion.accessory : companion.baseColor;
  const chooseItem = (id: string) => {
    if (category === "glasses") updateCompanion({ glasses: id as NomiCompanion["glasses"] });
    if (category === "outfits") updateCompanion({ outfit: id as NomiCompanion["outfit"] });
    if (category === "hair") updateCompanion({ hair: id as NomiCompanion["hair"] });
    if (category === "faces") updateCompanion({ face: id as NomiCompanion["face"] });
    if (category === "accessories") updateCompanion({ accessory: id as NomiCompanion["accessory"] });
  };

  return (
    <section className={cn("flex overflow-hidden bg-background", onDone ? "h-dvh" : "h-[calc(100dvh-4rem)]")} dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
        <div className="relative grid h-[42%] min-h-64 shrink-0 place-items-center overflow-hidden border-b border-border bg-primary-soft/60">
          <div className="absolute inset-x-8 bottom-3 h-px bg-border/60" />
          <NomiAvatar companion={companion} pose="idle" size={300} floating={false} className="animate-character-pop" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-background">
          <Tabs value={category} onValueChange={(value) => setCategory(value as Category)} className="shrink-0 border-b border-border bg-background">
            <TabsList className="scrollbar-none flex h-14 w-full justify-start gap-0 overflow-x-auto rounded-none border-0 bg-transparent p-2 shadow-none">
              {CATEGORIES.map((item) => <TabsTrigger key={item.id} value={item.id} className="h-10 shrink-0 rounded-md px-4 text-sm shadow-none data-[state=active]:bg-secondary data-[state=active]:shadow-none">{ar ? item.ar : item.en}</TabsTrigger>)}
            </TabsList>
          </Tabs>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-7">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">{ar ? CATEGORIES.find((item) => item.id === category)?.ar : CATEGORIES.find((item) => item.id === category)?.en}</h2><span className="text-xs text-muted-foreground">{ar ? "10 اختيارات" : "10 choices"}</span></div>
            {category === "colors" ? (
              <div className="grid grid-cols-5 gap-3">{COLORS.map(([name, base, accent]) => <Button key={name} type="button" variant="outline" aria-label={name} onClick={() => updateCompanion({ baseColor: base, accentColor: accent })} className={cn("relative aspect-square h-auto rounded-full p-1.5", selected === base ? "border-foreground ring-2 ring-ring ring-offset-2" : "border-border")}><span className="size-full rounded-full" style={{ backgroundColor: base }} />{selected === base ? <Check className="absolute size-4 text-foreground" /> : null}</Button>)}</div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                <Button type="button" variant="outline" onClick={() => chooseItem("none")} className={cn("relative aspect-square h-auto flex-col rounded-md p-2", selected === "none" || !selected ? "border-primary bg-primary-soft text-primary" : "border-border bg-card")}><CircleSlash2 className="size-7" /><span className="text-xs">{ar ? "بدون" : "None"}</span>{selected === "none" || !selected ? <Check className="absolute end-2 top-2 size-4" /> : null}</Button>
                {LABELS[category].map((label, index) => { const id = `${category}-${String(index + 1).padStart(2, "0")}`; const active = selected === id; return <Button key={id} type="button" variant="outline" onClick={() => chooseItem(id)} className={cn("relative aspect-square h-auto flex-col overflow-hidden rounded-md p-1.5", active ? "border-primary bg-primary-soft" : "border-border bg-card")}><img src={getAsset(category, index)} alt="" className="min-h-0 w-full flex-1 object-contain" /><span className="w-full truncate text-[11px] font-medium">{label}</span>{active ? <span className="absolute end-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span> : null}</Button>; })}
              </div>
            )}
          </div>
          {onDone ? <div className="shrink-0 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><Button type="button" onClick={onDone} className="h-12 w-full rounded-md text-base">{ar ? "التالي" : "Next"}</Button></div> : null}
        </div>
      </div>
    </section>
  );
}