import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import megsyLogo from "@/assets/megsy-logo.jpg.asset.json";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";

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

  const pill = "flex h-14 w-full items-center rounded-full bg-card px-6 text-base font-medium text-foreground shadow-sm transition hover:bg-card/80 disabled:opacity-60";

  return (
    <main className="flex min-h-dvh flex-col bg-muted px-5 pb-8 pt-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex justify-end">
          <Link to="/" aria-label="Close" className="grid size-11 place-items-center rounded-full bg-card shadow-sm">
            <X className="size-5" />
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            <NomiAvatar companion={companion} pose="wave" size={96} />
            <span className="font-display text-6xl font-bold tracking-tight">nomi</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <span className="text-lg">By</span>
            <img src={megsyLogo.url} alt="Megsy" className="size-7 rounded-md" />
            <span className="font-display text-xl font-semibold text-foreground">megsy</span>
          </div>
        </div>

        {showEmail ? (
          <form onSubmit={submit} className="space-y-3">
            <Input type="email" required placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-full border-0 bg-card px-6 shadow-sm" autoComplete="email" />
            <Input type="password" required minLength={6} placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-full border-0 bg-card px-6 shadow-sm" autoComplete={mode === "in" ? "current-password" : "new-password"} />
            <Button type="submit" disabled={busy} className="h-14 w-full rounded-full text-base">
              {mode === "in" ? t("signIn") : t("signUp")}
            </Button>
            <div className="flex justify-between px-2 text-sm">
              <button type="button" onClick={() => setShowEmail(false)} className="text-muted-foreground">{ar ? "رجوع" : "Back"}</button>
              <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="text-primary">
                {mode === "in" ? (ar ? "إنشاء حساب" : "Create account") : (ar ? "لدي حساب" : "I have an account")}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <button type="button" onClick={google} className={pill}>
              <GoogleIcon />
              <span className="flex-1 text-center">{ar ? "متابعة باستخدام Google" : "Continue with Google"}</span>
              <span className="size-6" />
            </button>
            <div className="flex items-center gap-4 py-1 text-sm text-muted-foreground">
              <span className="h-px flex-1 bg-border" />{ar ? "أو" : "or"}<span className="h-px flex-1 bg-border" />
            </div>
            <button type="button" onClick={() => setShowEmail(true)} className={pill}>
              <Mail className="size-6" />
              <span className="flex-1 text-center">{ar ? "متابعة باستخدام البريد الإلكتروني" : "Continue with email"}</span>
              <span className="size-6" />
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground underline">
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
