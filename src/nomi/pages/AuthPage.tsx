import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ArrowLeft, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import ivoryNomi from "@/assets/nomi-look-ivory.webp";
import megsyLogo from "@/assets/megsy-logo-black.png";
import { useNomi } from "../store";

export default function AuthPage() {
  const { companion, t } = useNomi();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const ar = companion.language === "ar";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/chat` },
        });
        if (error) throw error;
        toast.success(ar ? "تم إنشاء حسابك" : "Your account is ready");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate(companion.onboarded ? "/chat" : "/onboarding", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : ar ? "تعذر إتمام الطلب" : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/chat` },
    });
    if (error) toast.error(error.message);
  };

  const pill = "relative h-14 w-full rounded-full border-0 bg-card px-6 text-base font-medium text-foreground shadow-sm hover:bg-card/80";

  return (
    <main className="flex min-h-dvh flex-col bg-muted px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col">
        <div className="flex justify-end">
          <Button asChild variant="ghost" size="icon" className="size-11 rounded-full bg-card shadow-sm hover:bg-card/80">
            <Link to="/" aria-label={ar ? "إغلاق" : "Close"}>
            <X className="size-5" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center pb-8 pt-10">
          <div className="flex items-center gap-3" aria-label="NOMI">
            <span className="relative block size-[5.25rem] shrink-0 overflow-hidden rounded-[42%] bg-card shadow-sm">
              <img
                src={ivoryNomi}
                alt=""
                className="absolute left-1/2 top-[-3px] w-[6.7rem] max-w-none -translate-x-1/2"
              />
            </span>
            <span className="font-display text-[3.4rem] font-bold leading-none">NOMI</span>
          </div>
          <div className="mt-5 flex items-center gap-2.5 text-muted-foreground">
            <span className="text-base">By</span>
            <span className="flex items-center gap-1.5 text-foreground" aria-label="Megsy">
              <img src={megsyLogo} alt="" className="h-7 w-6 object-contain" />
              <span className="font-display text-xl font-semibold">megsy</span>
            </span>
          </div>
        </div>

        {showEmail ? (
          <form onSubmit={submit} className="space-y-3" dir={ar ? "rtl" : "ltr"}>
            <Input type="email" required placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-full border-0 bg-card px-6 text-base shadow-sm" autoComplete="email" />
            <Input type="password" required minLength={6} placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-full border-0 bg-card px-6 text-base shadow-sm" autoComplete={mode === "in" ? "current-password" : "new-password"} />
            <Button type="submit" disabled={busy} className="h-14 w-full rounded-full text-base font-medium">
              {mode === "in" ? t("signIn") : t("signUp")}
            </Button>
            <div className="flex items-center justify-between px-2 pt-1 text-sm">
              <Button type="button" variant="link" onClick={() => setShowEmail(false)} className="h-auto gap-1 p-0 text-muted-foreground">
                <ArrowLeft className="size-4 rtl:rotate-180" />{ar ? "رجوع" : "Back"}
              </Button>
              <Button type="button" variant="link" onClick={() => setMode(mode === "in" ? "up" : "in")} className="h-auto p-0 text-primary">
                {mode === "in" ? (ar ? "إنشاء حساب" : "Create account") : (ar ? "لدي حساب" : "I have an account")}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3" dir={ar ? "rtl" : "ltr"}>
            <Button type="button" variant="ghost" onClick={google} className={pill}>
              <span className="absolute start-6"><GoogleIcon /></span>
              <span>{ar ? "متابعة باستخدام Google" : "Continue with Google"}</span>
            </Button>
            <div className="flex items-center gap-4 px-1 py-0.5 text-sm text-muted-foreground">
              <span className="h-px flex-1 bg-border" />{ar ? "أو" : "or"}<span className="h-px flex-1 bg-border" />
            </div>
            <Button type="button" variant="ghost" onClick={() => setShowEmail(true)} className={pill}>
              <Mail className="absolute start-6 size-6" />
              <span>{ar ? "متابعة باستخدام البريد الإلكتروني" : "Continue with email"}</span>
            </Button>
          </div>
        )}

        <div className="mt-7 flex justify-center gap-7 text-sm text-muted-foreground underline underline-offset-4">
          <Link to="/privacy">{ar ? "سياسة الخصوصية" : "Privacy"}</Link>
          <Link to="/privacy">{ar ? "شروط الخدمة" : "Terms"}</Link>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-6" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
