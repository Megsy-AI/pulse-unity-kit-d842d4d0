import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";

export default function AuthPage() {
  const { companion, t } = useNomi();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
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

  return (
    <main className="grid min-h-dvh bg-background px-5 py-8 md:grid-cols-[0.9fr_1.1fr] md:p-6">
      <div className="hidden border-e border-border md:flex md:flex-col md:justify-between md:p-8"><span className="font-display text-xl font-bold">Nomi<span className="text-primary">.</span></span><div><p className="font-display text-xs font-semibold uppercase text-primary">Private by default</p><p className="mt-3 max-w-sm font-display text-4xl font-semibold leading-tight">Your companion, ready where you left off.</p></div><p className="text-xs text-muted-foreground">© 2026 NOMI</p></div>
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center">
        <div className="flex justify-center">
          <NomiAvatar companion={companion} pose="wave" size={160} />
        </div>
        <h1 className="mt-2 text-center text-3xl font-semibold">
          {mode === "in" ? t("signIn") : t("signUp")}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">{t("tagline")}</p>

        <form onSubmit={submit} className="mt-7 space-y-4 border-y border-border py-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-md"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-md"
              autoComplete={mode === "in" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" disabled={busy} className="h-11 w-full rounded-md">
            {mode === "in" ? t("signIn") : t("signUp")}
          </Button>
        </form>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-11 w-full rounded-md"
          onClick={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/chat` },
            });
            if (error) toast.error(error.message);
          }}
        >
          {ar ? "المتابعة باستخدام جوجل" : "Continue with Google"}
        </Button>

        <div className="mt-4 flex flex-col items-center gap-2 text-sm">
          <Button
            type="button" variant="link"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="h-auto p-0"
          >
            {mode === "in"
              ? ar
                ? "ليس لديك حساب؟ أنشئ واحدًا"
                : "No account yet? Create one"
              : ar
                ? "لديك حساب بالفعل؟ سجل الدخول"
                : "Already have an account? Sign in"}
          </Button>
          <Link to="/onboarding" className="text-muted-foreground hover:underline">
            {t("continueGuest")}
          </Link>
        </div>
      </div>
    </main>
  );
}
