import { NavLink, useLocation } from "react-router-dom";
import { FolderKanban, Gem, ListChecks, MessageCircle, PanelsTopLeft, Settings, UserRoundCog } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";

const NAV = [
  { to: "/chat", key: "chat", icon: MessageCircle },
  { to: "/projects", key: "projects", icon: FolderKanban },
  { to: "/tasks", key: "tasks", icon: ListChecks },
] as const;

function SidebarContent({ close }: { close: () => void }) {
  const { companion, session, t } = useNomi();
  const ar = companion.language === "ar";
  const userName = session?.user?.email?.split("@")[0] || (ar ? "حسابي" : "My account");

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pb-8 pt-3">
        <span className="nomi-pixel-wordmark text-2xl font-black tracking-[0.18em]">NOMI</span>
      </div>
      <nav className="space-y-1.5">
        {NAV.map(({ to, key, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={close} className={({ isActive }) => cn("flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-all duration-200", isActive ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
            <Icon className="size-[18px]" strokeWidth={1.9} />
            {t(key)}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 space-y-1.5 border-t border-border pt-5">
        <NavLink to="/accounts" onClick={close} className={({ isActive }) => cn("flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-colors", isActive ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
          <UserRoundCog className="size-[18px]" />{ar ? "حسابات الوكيل" : "Agent accounts"}
        </NavLink>
        <NavLink to="/settings" onClick={close} className={({ isActive }) => cn("flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-colors", isActive ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
          <Settings className="size-[18px]" />{t("settings")}
        </NavLink>
      </div>

      <NavLink to="/settings" onClick={close} className="mt-auto flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-secondary">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary"><NomiAvatar companion={companion} size={50} floating={false} /></span>
        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{userName}</span><span className="block truncate text-xs text-muted-foreground">{session?.user?.email || (ar ? "وضع الضيف" : "Guest mode")}</span></span>
      </NavLink>
    </div>
  );
}

export function NomiShell({ children }: { children: ReactNode }) {
  const { companion } = useNomi();
  const { pathname } = useLocation();
  const immersive = pathname.startsWith("/call");
  const [menuOpen, setMenuOpen] = useState(false);
  const ar = companion.language === "ar";

  if (immersive) return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between bg-transparent px-4 md:px-6">
        <Button variant="outline" size="icon" className="size-10 border-border bg-card shadow-none" onClick={() => setMenuOpen(true)} aria-label={ar ? "فتح القائمة" : "Open menu"}>
          <PanelsTopLeft className="size-[18px]" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex"><NomiAvatar companion={companion} pose="celebrate" size={44} floating={false} className="nomi-header-bob" /><span className="text-xs font-semibold text-muted-foreground">{ar ? "جرّب قدرات أكثر" : "More from Nomi"}</span></div>
          <Button size="sm" className="h-10 px-4"><Gem className="size-4" />Get premium</Button>
        </div>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side={ar ? "right" : "left"} className="w-[310px] border-0 p-5 sm:max-w-[310px]">
          <SheetTitle className="sr-only">{ar ? "القائمة" : "Navigation"}</SheetTitle>
          <SidebarContent close={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-start justify-between gap-4 px-5 pb-6 pt-7 md:px-8 md:pt-9">
      <div className="animate-nomi-rise"><h1 className="text-2xl font-bold md:text-3xl">{title}</h1>{subtitle ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}</div>
      {action}
    </header>
  );
}