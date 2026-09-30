import { NavLink, useLocation } from "react-router-dom";
import { FolderKanban, ListChecks, MessageCircle, PanelLeft, Search, Settings, SquarePen, UserRoundCog } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";
import { PremiumStar } from "./PremiumStar";

const NAV = [
  { to: "/chat", key: "chat", icon: MessageCircle },
  { to: "/projects", key: "projects", icon: FolderKanban },
  { to: "/tasks", key: "tasks", icon: ListChecks },
] as const;

function SidebarContent({ close }: { close: () => void }) {
  const { companion, session, t, messages, clearChat } = useNomi();
  const [query, setQuery] = useState("");
  const ar = companion.language === "ar";
  const userName = session?.user?.email?.split("@")[0] || (ar ? "حسابي" : "My account");

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-2">
        <span className="nomi-pixel-wordmark text-xl font-black">NOMI</span>
      </div>
      <Button variant="ghost" className="mb-2 h-10 w-full justify-start rounded-xl px-3" onClick={() => { clearChat(); close(); }}>
        <SquarePen className="size-[17px]" />{ar ? "محادثة جديدة" : "New chat"}
      </Button>
      <nav className="space-y-0.5">
        {NAV.map(({ to, key, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={close} className={({ isActive }) => cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-200", isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground")}>
            <Icon className="size-[18px]" strokeWidth={1.9} />
            {t(key)}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 min-h-0 flex-1 border-t border-border/70 pt-3">
        <label className="mb-2 flex h-9 items-center gap-2 rounded-xl px-3 text-muted-foreground focus-within:bg-secondary/70 focus-within:text-foreground">
          <Search className="size-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? "ابحث في المحادثات" : "Search chats"} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
        <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase text-muted-foreground">{ar ? "الأخيرة" : "Recent"}</p>
        <div className="max-h-36 overflow-y-auto px-1">
          {messages.filter((message) => message.role === "user" && message.content.toLowerCase().includes(query.toLowerCase())).slice(-6).reverse().map((message) => (
            <NavLink key={message.id} to="/chat" onClick={close} className="block truncate rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">{message.content}</NavLink>
          ))}
          {!messages.some((message) => message.role === "user") ? <p className="px-2 py-3 text-xs text-muted-foreground">{ar ? "مفيش محادثات لسه" : "No conversations yet"}</p> : null}
        </div>
      </div>

      <div className="space-y-0.5 border-t border-border pt-3">
        <NavLink to="/accounts" onClick={close} className={({ isActive }) => cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground")}>
          <UserRoundCog className="size-[18px]" />{ar ? "حسابات الوكيل" : "Agent accounts"}
        </NavLink>
        <NavLink to="/settings" onClick={close} className={({ isActive }) => cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground")}>
          <Settings className="size-[18px]" />{t("settings")}
        </NavLink>
      </div>

      <NavLink to="/settings" onClick={close} className="mt-3 flex items-center gap-3 rounded-2xl bg-secondary/60 p-2.5 transition-colors hover:bg-secondary">
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-card"><NomiAvatar companion={companion} size={54} floating={false} /></span>
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
        <Button variant="ghost" size="icon" className="size-10 border-0 bg-transparent shadow-none hover:bg-transparent" onClick={() => setMenuOpen(true)} aria-label={ar ? "فتح القائمة" : "Open menu"}>
          <PanelLeft className="size-[18px]" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="hidden items-center sm:flex"><NomiAvatar companion={companion} pose="celebrate" size={42} floating={false} className="nomi-header-bob" /></div>
          {pathname !== "/premium" ? <Button asChild variant="ghost" size="sm" className="h-10 gap-0 border-0 bg-transparent px-1.5 text-foreground shadow-none hover:bg-secondary/60">
            <NavLink to="/premium"><PremiumStar className="h-9 w-12" /><span>Premium</span></NavLink>
          </Button> : null}
        </div>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side={ar ? "right" : "left"} className="w-[300px] border-0 bg-background p-4 shadow-[var(--shadow-navigation)] sm:max-w-[300px]">
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