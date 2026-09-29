import { Brain, CalendarDays, Globe, Mail, Mic, PhoneCall, ShieldCheck } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNomi } from "../store";
import { PageHeader } from "../components/NomiShell";
import type { NomiPermissions } from "../types";

const ITEMS: Array<{
  key: keyof NomiPermissions;
  icon: typeof Mic;
  en: string;
  ar: string;
  enHint: string;
  arHint: string;
}> = [
  {
    key: "memory",
    icon: Brain,
    en: "Remember things about me",
    ar: "تذكّر أشياء عني",
    enHint: "Nomi saves your preferences to answer better.",
    arHint: "نومي يحفظ تفضيلاتك ليجاوبك بشكل أفضل.",
  },
  {
    key: "microphone",
    icon: Mic,
    en: "Use my microphone",
    ar: "استخدام الميكروفون",
    enHint: "Needed for voice calls with Nomi.",
    arHint: "مطلوب للمكالمات الصوتية مع نومي.",
  },
  {
    key: "calls",
    icon: PhoneCall,
    en: "Handle phone calls",
    ar: "التعامل مع المكالمات",
    enHint: "Answer or place calls on your behalf.",
    arHint: "الرد على المكالمات أو إجراؤها نيابة عنك.",
  },
  {
    key: "email",
    icon: Mail,
    en: "Access email",
    ar: "الوصول للبريد",
    enHint: "Read and draft messages for you.",
    arHint: "قراءة الرسائل وكتابتها لك.",
  },
  {
    key: "calendar",
    icon: CalendarDays,
    en: "Access calendar",
    ar: "الوصول للتقويم",
    enHint: "See and create events.",
    arHint: "رؤية المواعيد وإنشاؤها.",
  },
  {
    key: "web",
    icon: Globe,
    en: "Do tasks on the web",
    ar: "تنفيذ مهام على الويب",
    enHint: "Browse sites and complete steps with permission.",
    arHint: "تصفح المواقع وإتمام الخطوات بإذن منك.",
  },
];

export default function PrivacyPage() {
  const { permissions, setPermission, t, language, clearChat } = useNomi();
  const ar = language === "ar";

  return (
    <div>
      <PageHeader
        title={t("privacy")}
        subtitle={
          ar
            ? "أنت من يقرر ما يقدر نومي يشوفه أو يعمله."
            : "You decide what Nomi can see and do."
        }
      />

      <div className="mx-auto w-full max-w-2xl px-5 pb-10 md:px-6">
        <div className="flex items-start gap-3 rounded-md border border-border bg-card p-5 shadow-sm">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} />
          <p className="text-sm text-muted-foreground">
            {ar
              ? "بياناتك محفوظة على جهازك وفي حسابك فقط، ولا تُشارك مع أي شخص آخر."
              : "Your data stays on your device and in your own account — never shared with anyone else."}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {ITEMS.map(({ key, icon: Icon, en, ar: arLabel, enHint, arHint }) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 shadow-sm"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{ar ? arLabel : en}</p>
                <p className="text-xs text-muted-foreground">{ar ? arHint : enHint}</p>
              </div>
              <Switch
                checked={permissions[key]}
                onCheckedChange={(value) => setPermission(key, value)}
                aria-label={ar ? arLabel : en}
              />
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          className="mt-6 w-full rounded-md text-destructive hover:text-destructive"
          onClick={clearChat}
        >
          {ar ? "امسح سجل المحادثة" : "Clear chat history"}
        </Button>
      </div>
    </div>
  );
}
