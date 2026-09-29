import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";

type CallState = "connecting" | "listening" | "speaking";

export default function CallPage() {
  const { companion, t, language, messages } = useNomi();
  const navigate = useNavigate();
  const [state, setState] = useState<CallState>("connecting");
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<number | null>(null);
  const ar = language === "ar";

  useEffect(() => {
    const connect = window.setTimeout(() => setState("speaking"), 1400);
    timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      window.clearTimeout(connect);
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  // Gentle back-and-forth between speaking and listening so the character feels alive.
  useEffect(() => {
    if (state === "connecting") return;
    const next = window.setTimeout(
      () => setState(state === "speaking" ? "listening" : "speaking"),
      state === "speaking" ? 4200 : 3200,
    );
    return () => window.clearTimeout(next);
  }, [state]);

  const label =
    state === "connecting" ? t("connecting") : state === "speaking" ? t("speaking") : t("listening");

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <main
      className="nomi-call-edges relative flex min-h-dvh flex-col items-center justify-between overflow-hidden px-6 py-10"
      data-state={state}
      style={
        {
          "--nomi-edge-intensity": state === "speaking" ? 0.8 : state === "listening" ? 0.5 : 0.3,
        } as React.CSSProperties
      }
    >
      <div className="relative z-10 text-center">
        <p className="text-sm font-medium text-muted-foreground">{clock}</p>
        <h1 className="mt-1 text-2xl font-bold">{companion.name}</h1>
        <p className="mt-1 text-sm text-primary">{label}</p>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div
          className={cn(
            "absolute inset-0 -z-10 m-auto size-72 rounded-full blur-3xl transition-opacity duration-700",
            state === "speaking" ? "opacity-40" : "opacity-15",
          )}
          style={{
            background: `radial-gradient(circle, ${companion.baseColor}, transparent 70%)`,
          }}
        />
        <NomiAvatar
          companion={companion}
          pose="call"
          speaking={state === "speaking"}
          size={300}
        />
        <p className="mt-4 max-w-xs text-center text-sm text-muted-foreground">
          {ar
            ? "اتكلم عادي، نومي بيسمعك وبيرد بصوته."
            : "Just talk — Nomi listens and answers in its own voice."}
        </p>
        {messages.length > 0 ? (
          <p className="mt-2 line-clamp-2 max-w-sm text-center text-xs text-muted-foreground/70">
            {messages[messages.length - 1].content}
          </p>
        ) : null}
      </div>

      <div className="relative z-10 flex items-center gap-4">
        <Button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? t("unmute") : t("mute")}
          className={cn(
            "size-14 rounded-full transition-colors",
            muted ? "bg-secondary text-muted-foreground" : "nomi-glass text-foreground",
          )}
        >
          {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </Button>

        <Button
          type="button"
          onClick={() => navigate("/chat")}
          aria-label={t("endCall")}
          variant="destructive" className="size-16 rounded-full shadow-[var(--shadow-float)]"
        >
          <PhoneOff className="size-6" />
        </Button>

        <Button
          type="button"
          onClick={() => setSpeaker((s) => !s)}
          aria-label={t("speaker")}
          className={cn(
            "size-14 rounded-full transition-colors",
            speaker ? "nomi-glass text-foreground" : "bg-secondary text-muted-foreground",
          )}
        >
          {speaker ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </Button>
      </div>
    </main>
  );
}
