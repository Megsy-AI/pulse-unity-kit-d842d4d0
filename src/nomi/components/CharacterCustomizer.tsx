import { useState } from "react";
import { Check, Glasses, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { NomiAvatar } from "../avatar/NomiAvatar";
import { useNomi } from "../store";
import type { NomiCompanion } from "../types";

const itemAssets = import.meta.glob("../../assets/character/{glasses,outfits}/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

type Category = "glasses" | "outfits";
const CATEGORIES = [
  { id: "glasses" as const, en: "Glasses", ar: "نظارات", icon: Glasses },
  { id: "outfits" as const, en: "Clothes", ar: "ملابس", icon: Shirt },
];
const LABELS: Record<Category, Array<[string, string]>> = {
  glasses: [["Black oval", "بيضاوية"], ["Crystal", "كريستال"], ["Cobalt", "كوبالت"], ["Pink heart", "قلب وردي"], ["Minimal", "رفيعة"], ["Honey", "عسلية"], ["Sky", "سماوي"], ["Sage", "سيج"], ["Cat eye", "عين القطة"], ["Sport", "رياضية"]],
  outfits: [["Varsity", "جاكيت جامعي"], ["Hoodie", "هودي"], ["Overalls", "أوفرول"], ["Red knit", "بلوفر أحمر"], ["Weekend", "قميص"], ["Mint cardigan", "كارديجان"], ["Raincoat", "معطف مطر"], ["Black set", "طقم أسود"], ["Lilac knit", "بلوفر ليلكي"], ["Blue blazer", "بليزر أزرق"]],
};

const assetFor = (category: Category, index: number) =>
  itemAssets[`../../assets/character/${category}/${category}-${String(index).padStart(2, "0")}.png`];

export function CharacterCustomizer({ onDone }: { onDone?: () => void }) {
  const { companion, updateCompanion, language } = useNomi();
  const [category, setCategory] = useState<Category>("glasses");
  const ar = language === "ar";
  const selected = category === "glasses" ? companion.glasses : companion.outfit;
  const choose = (id: string) => {
    if (category === "glasses") updateCompanion({ glasses: id as NomiCompanion["glasses"] });
    else updateCompanion({ outfit: id as NomiCompanion["outfit"] });
  };

  return (
    <section className={cn("flex overflow-hidden bg-background", onDone ? "h-dvh" : "h-[calc(100dvh-4rem)]")} dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
        <div className="relative grid h-[43%] min-h-64 shrink-0 place-items-center overflow-hidden bg-secondary/45">
          <div className="absolute inset-x-10 bottom-5 h-px bg-border" />
          <NomiAvatar companion={companion} size={290} floating={false} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-background">
          <Tabs value={category} onValueChange={(value) => setCategory(value as Category)} className="flex shrink-0 justify-center px-5 pt-4">
            <TabsList className="grid h-12 w-full max-w-sm grid-cols-2 rounded-full">
              {CATEGORIES.map(({ id, en, ar: arabic, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="h-10 gap-2 rounded-full">
                  <Icon className="size-4" />{ar ? arabic : en}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div key={category} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 animate-auth-swap">
            <div className="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-5">
              <button type="button" onClick={() => choose("none")} className="group flex flex-col items-center gap-2 outline-none">
                <span className={cn("relative grid aspect-square w-full max-w-24 place-items-center rounded-full border bg-card transition-all duration-200 group-active:scale-95", selected === "none" ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background" : "border-border")}>
                  <span className="h-px w-9 rotate-45 bg-foreground" />
                  {selected === "none" ? <span className="absolute bottom-1 end-1 grid size-5 place-items-center rounded-full bg-foreground text-background"><Check className="size-3" /></span> : null}
                </span>
                <span className="text-xs font-medium">{ar ? "بدون" : "None"}</span>
              </button>

              {LABELS[category].map(([en, arabic], index) => {
                const id = `${category}-${String(index + 1).padStart(2, "0")}`;
                const active = selected === id;
                return (
                  <button key={id} type="button" onClick={() => choose(id)} className="group flex flex-col items-center gap-2 outline-none">
                    <span className={cn("relative grid aspect-square w-full max-w-24 place-items-center overflow-hidden rounded-full border bg-card p-2 transition-all duration-200 group-active:scale-95", active ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background" : "border-border group-hover:border-foreground/40")}>
                      <img src={assetFor(category, index + 1)} alt="" loading="lazy" className="size-full object-contain transition-transform duration-200 group-hover:scale-105" />
                      {active ? <span className="absolute bottom-1 end-1 grid size-5 place-items-center rounded-full bg-foreground text-background"><Check className="size-3" /></span> : null}
                    </span>
                    <span className={cn("line-clamp-1 text-center text-xs", active ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>{ar ? arabic : en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {onDone ? (
            <div className="shrink-0 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button type="button" onClick={onDone} className="h-12 w-full text-base">{ar ? "ابدأ المحادثة" : "Start chatting"}</Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}