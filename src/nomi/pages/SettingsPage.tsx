import { Brain, CalendarDays, ChevronLeft, ChevronRight, Globe, Languages, Mail, PhoneCall, PlugZap, UserRoundCog } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNomi } from "../store";
import { PageHeader } from "../components/NomiShell";
import type { NomiPermissions } from "../types";

const connections: Array<{ key: keyof NomiPermissions; en: string; ar: string; detailEn: string; detailAr: string; icon: typeof Mail }> = [
  { key: "email", en: "Email", ar: "البريد الإلكتروني", detailEn: "Draft and organise messages", detailAr: "كتابة الرسائل وتنظيمها", icon: Mail },
  { key: "calendar", en: "Calendar", ar: "التقويم", detailEn: "Plan events and your day", detailAr: "تنظيم المواعيد واليوم", icon: CalendarDays },
  { key: "calls", en: "Phone", ar: "الهاتف", detailEn: "Place calls with approval", detailAr: "إجراء مكالمات بموافقتك", icon: PhoneCall },
  { key: "web", en: "Web", ar: "الويب", detailEn: "Complete approved web steps", detailAr: "تنفيذ خطوات الويب المسموحة", icon: Globe },
];

export default function SettingsPage() {
  const { language, setLanguage, permissions, setPermission, companion, session } = useNomi();
  const ar = language === "ar";
  const Chevron = ar ? ChevronLeft : ChevronRight;
  const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || (ar ? "وضع الضيف" : "Guest mode");
  return <div><PageHeader title={ar ? "الإعدادات" : "Settings"} /><div className="mx-auto w-full max-w-xl space-y-7 px-5 pb-12">
    <section className="flex flex-col items-center pb-1"><span className="grid size-24 place-items-center overflow-hidden rounded-full bg-secondary ring-1 ring-border"><span className="scale-[1.55]"><img src={undefined} className="hidden" alt="" /></span><span className="text-3xl font-bold">{String(displayName).charAt(0).toUpperCase()}</span></span><h2 className="mt-3 text-xl font-bold">{String(displayName)}</h2><p className="mt-0.5 text-xs text-muted-foreground">{session?.user?.email || (ar ? "بياناتك محفوظة على جهازك" : "Your data stays on this device")}</p></section>
    <Button asChild className="h-auto w-full justify-start rounded-2xl px-4 py-3.5"><Link to="/premium"><span className="grid size-9 place-items-center rounded-xl bg-background/15">✦</span><span className="text-start"><strong className="block text-sm">Nomi Premium</strong><span className="block text-xs font-normal opacity-75">{ar ? "قدرات أوسع وذاكرة أعمق" : "More capability and deeper memory"}</span></span><Chevron className="ms-auto size-4" /></Link></Button>
    <section><div className="mb-2.5 px-1"><div className="flex items-center gap-2"><Languages className="size-4" /><h2 className="text-xs font-bold uppercase text-muted-foreground">{ar ? "اللغة" : "Language"}</h2></div></div><div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm"><Button variant={language === "en" ? "default" : "ghost"} onClick={() => setLanguage("en")} className="h-11">English</Button><Button variant={language === "ar" ? "default" : "ghost"} onClick={() => setLanguage("ar")} className="h-11">العربية</Button></div></section>
    <section><div className="mb-2.5 flex items-center gap-2 px-1"><PlugZap className="size-4" /><h2 className="text-xs font-bold uppercase text-muted-foreground">{ar ? "التكاملات" : "Integrations"}</h2></div><div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">{connections.map(({ key, en, ar: arLabel, detailEn, detailAr, icon: Icon }, index) => <div key={key} className={index ? "flex min-h-16 items-center gap-3 border-t border-border px-4 py-3.5" : "flex min-h-16 items-center gap-3 px-4 py-3.5"}><span className="grid size-9 place-items-center rounded-xl bg-secondary"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{ar ? arLabel : en}</span><span className="block text-xs leading-5 text-muted-foreground">{ar ? detailAr : detailEn}</span></span><Switch checked={permissions[key]} onCheckedChange={(value) => setPermission(key, value)} aria-label={ar ? arLabel : en} /></div>)}</div></section>
    <section><h2 className="mb-2.5 px-1 text-xs font-bold uppercase text-muted-foreground">{ar ? "بيانات نومي" : "Nomi data"}</h2><div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">{[{to:"/accounts",icon:UserRoundCog,en:"Agent accounts",ar:"حسابات الوكيل"},{to:"/memory",icon:Brain,en:"Memory",ar:"الذاكرة"}].map(({to,icon:Icon,en,ar:label},index)=><Button asChild key={to} variant="ghost" className={`h-14 w-full justify-start rounded-none px-4 ${index ? "border-t border-border" : ""}`}><Link to={to}><Icon className="size-[18px]"/><span className="flex-1 text-start">{ar ? label : en}</span><Chevron className="size-4 text-muted-foreground"/></Link></Button>)}</div></section>
  </div></div>;
}