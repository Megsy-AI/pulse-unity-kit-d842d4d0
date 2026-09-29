import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { NomiAvatar, comboSource } from "../avatar/NomiAvatar";
import { useNomi } from "../store";
import type { NomiCompanion } from "../types";

type Category = "glasses" | "outfits";
const CATEGORIES: Array<{ id: Category; en: string; ar: string }> = [
  { id: "glasses", en: "Glasses", ar: "نظارات" },
  { id: "outfits", en: "Clothes", ar: "ملابس" },
];
const LABELS: Record<Category, Array<[string, string]>> = {
  glasses: [["Oval", "بيضاوية"], ["Clear", "شفافة"], ["Gold", "ذهبية"], ["Heart", "قلب"], ["Slim", "رفيعة"], ["Amber", "كهرماني"], ["Ocean", "أزرق"], ["Sage", "أخضر"], ["Cat eye", "عين القطة"], ["Sport", "رياضية"]],
  outfits: [["Varsity", "جاكيت"], ["Hoodie", "هودي"], ["Overalls", "أوفرول"], ["Knit", "بلوفر"], ["Shirt", "قميص"], ["Cardigan", "كارديجان"], ["Raincoat", "جاكيت مطر"], ["Black tee", "تيشيرت أسود"], ["Lilac", "ليلكي"], ["Blazer", "بليزر"]],
};

export function CharacterCustomizer({ onDone }: { onDone?: () => void }) {
  const { companion, updateCompanion, language } = useNomi();
  const [category, setCategory] = useState<Category>("glasses");
  const ar = language === "ar";
  const selected = category === "glasses" ? companion.glasses : companion.outfit;
  const choose = (id: string) =>
    category === "glasses"
      ? updateCompanion({ glasses: id as NomiCompanion["glasses"] })
      : updateCompanion({ outfit: id as NomiCompanion["outfit"] });
  const items = [["none", ar ? "بدون" : "None"], ...LABELS[category].map(([en, a], i) => [`${category}-${String(i + 1).padStart(2, "0")}`, ar ? a : en])];

  return (
    <section className={cn("flex overflow-hidden bg-background", onDone ? "h-dvh" : "h-[calc(100dvh-4rem)]")} dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
        <div className="grid h-[44%] min-h-64 shrink-0 place-items-center bg-secondary/40">
          <NomiAvatar companion={companion} size={280} floating={false} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <Tabs value={category} onValueChange={(v) => setCategory(v as Category)} className="flex shrink-0 justify-center px-4 pt-4">
            <TabsList className="h-11 rounded-full p-1">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="h-9 rounded-full px-6 text-sm">{ar ? c.ar : c.en}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
              {items.map(([id, label]) => {
                const active = (selected ?? "none") === id || (id === "none" && !selected);
                const thumb = category === "glasses" ? comboSource(id, "none") : comboSource("none", id);
                return (
                  <button key={id} type="button" onClick={() => choose(id)} className="group flex flex-col items-center gap-2 outline-none">
                    <span className={cn("relative grid aspect-square w-full max-w-24 place-items-center overflow-hidden rounded-full border bg-card transition-all duration-200 group-active:scale-95", active ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-border group-hover:border-foreground/30")}>
                      <img src={thumb} alt="" loading="lazy" className={cn("size-full object-cover", category === "glasses" ? "scale-[1.9] translate-y-[22%]" : "scale-[1.35] -translate-y-[4%]")} />
                      {active ? <span className="absolute bottom-1 end-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span> : null}
                    </span>
                    <span className={cn("text-xs", active ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {onDone ? (
            <div className="shrink-0 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button type="button" onClick={onDone} className="h-12 w-full rounded-full text-base">{ar ? "التالي" : "Next"}</Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
