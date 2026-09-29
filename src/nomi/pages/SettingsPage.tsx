import { CalendarDays, Globe, Mail, Moon, Palette, PhoneCall, ShieldCheck, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";
import { PageHeader } from "../components/NomiShell";
import type { NomiPermissions } from "../types";

const connections: Array<{ key: keyof NomiPermissions; en: string; ar: string; icon: typeof Mail }> = [
  { key: "email", en: "Email", ar: "البريد الإلكتروني", icon: Mail },
  { key: "calendar", en: "Calendar", ar: "التقويم", icon: CalendarDays },
  { key: "calls", en: "Phone calls", ar: "المكالمات", icon: PhoneCall },
  { key: "web", en: "Web access", ar: "الوصول للويب", icon: Globe },
];

export default function SettingsPage() {
  const { companion, language, permissions, setPermission, theme, setTheme, session, signOut } = useNomi();
  const ar = language === "ar";
  const userName = session?.user?.email?.split("@")[0] || (ar ? "حسابي" : "My account");
  return <div><PageHeader title={ar ? "الإعدادات" : "Settings"} subtitle={ar ? "شخصيتك، حسابك، والتطبيقات التي تسمح لنومي باستخدامها." : "Your character, account, and the apps Nomi may use."} /><div className="mx-auto w-full max-w-3xl space-y-8 px-5 py-8 pb-12">
    <section className="flex items-center gap-4 border-b border-border pb-8"><span className="grid size-16 place-items-center overflow-hidden rounded-md bg-secondary"><NomiAvatar companion={companion} size={72} floating={false} /></span><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-semibold">{userName}</h2><p className="truncate text-sm text-muted-foreground">{session?.user?.email || (ar ? "تجربة بدون حساب" : "Guest mode")}</p></div><Button asChild variant="outline"><Link to="/character"><Palette className="size-4" />{ar ? "تخصيص" : "Customize"}</Link></Button></section>
    <section><div className="mb-3 flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /><h2 className="text-sm font-semibold">{ar ? "التطبيقات والصلاحيات" : "Apps and permissions"}</h2></div><div className="divide-y divide-border border-y border-border bg-card">{connections.map(({ key, en, ar: arLabel, icon: Icon }) => <div key={key} className="flex items-center gap-3 px-1 py-4"><span className="grid size-9 place-items-center rounded-md bg-secondary text-muted-foreground"><Icon className="size-[18px]" /></span><span className="flex-1 text-sm font-medium">{ar ? arLabel : en}</span><Switch checked={permissions[key]} onCheckedChange={(value) => setPermission(key, value)} aria-label={ar ? arLabel : en} /></div>)}</div></section>
    <section className="flex items-center justify-between border-t border-border pt-6"><div><h2 className="text-sm font-semibold">{ar ? "المظهر" : "Appearance"}</h2><p className="text-xs text-muted-foreground">{ar ? "اختر الوضع الأنسب لك." : "Choose what feels best."}</p></div><Button variant="outline" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}{theme === "dark" ? (ar ? "فاتح" : "Light") : ar ? "داكن" : "Dark"}</Button></section>
    {session ? <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => void signOut()}>{ar ? "تسجيل الخروج" : "Sign out"}</Button> : null}
  </div></div>;
}