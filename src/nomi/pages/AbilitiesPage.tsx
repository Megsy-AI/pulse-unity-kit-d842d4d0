import {
  Brain,
  CalendarDays,
  Globe,
  ListChecks,
  Mail,
  MessageCircle,
  PhoneCall,
  Sparkles,
} from "lucide-react";

import { useNomi } from "../store";
import { PageHeader } from "../components/NomiShell";
import { NomiAvatar } from "../avatar/NomiAvatar";

export default function AbilitiesPage() {
  const { companion, t, language } = useNomi();
  const ar = language === "ar";

  const now = [
    { icon: MessageCircle, en: "Chat any time", ar: "محادثة في أي وقت" },
    { icon: Brain, en: "Remembers your preferences", ar: "يتذكر تفضيلاتك" },
    { icon: ListChecks, en: "Tasks and reminders", ar: "المهام والتذكيرات" },
    { icon: Sparkles, en: "Summaries and suggestions", ar: "ملخصات واقتراحات" },
  ];

  const soon = [
    { icon: PhoneCall, en: "Answer your phone calls", ar: "الرد على مكالماتك" },
    { icon: Mail, en: "Read and reply to email", ar: "قراءة البريد والرد عليه" },
    { icon: CalendarDays, en: "Manage your calendar", ar: "إدارة تقويمك" },
    { icon: Globe, en: "Do tasks on websites", ar: "تنفيذ مهام على المواقع" },
  ];

  return (
    <div>
      <PageHeader
        title={t("integrations")}
        subtitle={ar ? "ما يقدر عليه نومي اليوم وقريبًا." : "What Nomi can do today, and next."}
      />

      <div className="mx-auto w-full max-w-3xl px-5 pb-10 md:px-6">
        <div className="flex justify-center">
          <NomiAvatar companion={companion} pose="celebrate" size={170} />
        </div>

        <h2 className="mt-6 text-sm font-semibold">{ar ? "متاح الآن" : "Available now"}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {now.map(({ icon: Icon, en, ar: arLabel }) => (
            <div key={en} className="flex items-center gap-3 rounded-md border border-border bg-card p-4 shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <p className="text-sm font-medium">{ar ? arLabel : en}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-sm font-semibold">{t("soon")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {soon.map(({ icon: Icon, en, ar: arLabel }) => (
            <div
              key={en}
              className="flex items-center gap-3 rounded-md border border-dashed border-border p-4"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{ar ? arLabel : en}</p>
                <p className="text-xs text-muted-foreground/70">{t("soon")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
