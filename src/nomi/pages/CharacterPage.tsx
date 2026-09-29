import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";
import { PageHeader } from "../components/NomiShell";
import type { NomiCompanion, NomiShape } from "../types";

const LOOKS: Array<{ id: NomiShape; en: string; ar: string; baseColor: string; accentColor: string; glasses: NomiCompanion["glasses"]; outfit: NomiCompanion["outfit"] }> = [
  { id: "round", en: "Moon drop · Varsity", ar: "قطرة القمر · جاكيت", baseColor: "#B7A9F4", accentColor: "#2856D8", glasses: "cobalt-round", outfit: "varsity" },
  { id: "robot", en: "Mint pebble · Hoodie", ar: "حصاة نعناع · هودي", baseColor: "#BCE9CF", accentColor: "#142C55", glasses: "clear-square", outfit: "hoodie" },
  { id: "star", en: "Peach star · Overalls", ar: "نجمة خوخ · أوفرول", baseColor: "#FFA987", accentColor: "#F38CAD", glasses: "pink-heart", outfit: "overalls" },
  { id: "bear", en: "Ivory cloud · Knit", ar: "سحابة عاجي · تريكو", baseColor: "#F4E8D5", accentColor: "#D52D27", glasses: "black-oval", outfit: "knit" },
];
const chooseLook = (look: (typeof LOOKS)[number]) => ({ shape: look.id, baseColor: look.baseColor, accentColor: look.accentColor, glasses: look.glasses, outfit: look.outfit });

const PERSONALITIES: Array<{ id: NomiCompanion["personality"]; en: string; ar: string }> = [
  { id: "friendly", en: "Friendly", ar: "ودود" },
  { id: "calm", en: "Calm", ar: "هادئ" },
  { id: "playful", en: "Playful", ar: "مرح" },
  { id: "focused", en: "Focused", ar: "عملي" },
  { id: "wise", en: "Thoughtful", ar: "حكيم" },
];

const TONES: Array<{ id: NomiCompanion["tone"]; en: string; ar: string }> = [
  { id: "warm", en: "Warm", ar: "دافئ" },
  { id: "casual", en: "Casual", ar: "بسيط" },
  { id: "formal", en: "Formal", ar: "رسمي" },
  { id: "short", en: "Brief", ar: "مختصر" },
];

const VOICES: Array<{ id: NomiCompanion["voice"]; en: string; ar: string }> = [
  { id: "soft", en: "Soft", ar: "ناعم" },
  { id: "bright", en: "Bright", ar: "مشرق" },
  { id: "deep", en: "Deep", ar: "عميق" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-3 p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </Card>
  );
}

function Chips<T extends string>({
  options,
  value,
  onSelect,
  ar,
}: {
  options: Array<{ id: T; en: string; ar: string }>;
  value: T;
  onSelect: (id: T) => void;
  ar: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button variant="outline"
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={cn(
            "rounded-md border px-4 py-2 text-sm transition-colors",
            value === option.id
              ? "border-primary bg-primary-soft text-primary"
              : "border-border hover:bg-secondary",
          )}
        >
          {ar ? option.ar : option.en}
        </Button>
      ))}
    </div>
  );
}

export default function CharacterPage() {
  const { companion, updateCompanion, theme, setTheme, t, language, session, signOut } = useNomi();
  const ar = language === "ar";

  return (
    <div>
      <PageHeader
        title={t("persona")}
        subtitle={ar ? "شكل نومي وطريقته في الكلام." : "How Nomi looks, feels and speaks."}
      />

      <div className="mx-auto grid w-full max-w-4xl gap-5 px-5 pb-10 md:grid-cols-[280px_1fr] md:px-6">
        <div className="sticky top-8 flex h-fit flex-col items-center overflow-hidden border-x border-border bg-secondary/50 p-4">
          <NomiAvatar companion={companion} pose="idle" size={250} floating={false} />
          <p className="mt-3 text-lg font-semibold">{companion.name}</p>
        </div>

        <div className="space-y-4">
          <Section title={t("nameLabel")}>
            <Input
              value={companion.name}
              maxLength={20}
              onChange={(e) => updateCompanion({ name: e.target.value })}
              className="h-11 rounded-md"
            />
          </Section>

          <Section title={ar ? "المظهر والنظارة والملابس" : "Look, glasses and outfit"}>
            <div className="grid grid-cols-2 gap-2">
              {LOOKS.map((look) => (
                <Button variant="outline"
                  key={look.id}
                  type="button"
                  onClick={() => updateCompanion(chooseLook(look))}
                  className={cn(
                    "h-auto flex-col rounded-md border p-2 text-start transition-colors",
                    companion.shape === look.id
                      ? "border-primary bg-primary-soft"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <NomiAvatar
                    companion={{ ...companion, ...chooseLook(look) }}
                    size={110}
                    floating={false}
                  />
                  <span className="block px-1 pb-1 text-xs font-medium">{ar ? look.ar : look.en}</span>
                </Button>
              ))}
            </div>
          </Section>

          <Section title={t("personalityLabel")}>
            <Chips
              options={PERSONALITIES}
              value={companion.personality}
              onSelect={(id) => updateCompanion({ personality: id })}
              ar={ar}
            />
          </Section>

          <Section title={t("toneLabel")}>
            <Chips
              options={TONES}
              value={companion.tone}
              onSelect={(id) => updateCompanion({ tone: id })}
              ar={ar}
            />
          </Section>

          <Section title={ar ? "الصوت" : "Voice"}>
            <Chips
              options={VOICES}
              value={companion.voice}
              onSelect={(id) => updateCompanion({ voice: id })}
              ar={ar}
            />
          </Section>

          <Section title={t("language")}>
            <Chips
              options={[
                { id: "en" as const, en: "English", ar: "English" },
                { id: "ar" as const, en: "العربية", ar: "العربية" },
              ]}
              value={companion.language}
              onSelect={(id) => updateCompanion({ language: id })}
              ar={ar}
            />
          </Section>

          <Section title={t("settings")}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("darkMode")}</span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === "dark" ? (ar ? "فاتح" : "Light") : ar ? "داكن" : "Dark"}
              </Button>
            </div>
            {session ? (
              <Button
                variant="ghost"
                className="w-full justify-start rounded-md text-destructive hover:text-destructive"
                onClick={() => void signOut()}
              >
                {t("signOut")}
              </Button>
            ) : null}
          </Section>
        </div>
      </div>
    </div>
  );
}
