import { useState } from "react";
import { Link2 } from "lucide-react";

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";
import { NomiComposer } from "../components/NomiComposer";
import type { NomiPose } from "../types";

function clean(text: string) { return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#{1,6}\s*/gm, "").replace(/^\s*[*-]\s+/gm, "• ").replace(/`{1,3}/g, "").trim(); }
const POSE_LABEL: Record<NomiPose, { en: string; ar: string }> = {
  idle: { en: "", ar: "" }, wave: { en: "", ar: "" }, think: { en: "Thinking with you", ar: "بفكر معاك" }, shopping: { en: "Ready to shop", ar: "جاهز للتسوق" }, reminder: { en: "Keeping time", ar: "هفكرك في وقتها" }, calendar: { en: "Checking your day", ar: "بشوف يومك" }, search: { en: "Looking it up", ar: "بدور لك" }, write: { en: "Writing it down", ar: "بكتبها" }, email: { en: "On your mail", ar: "على بريدك" }, call: { en: "Ready to call", ar: "جاهز للاتصال" }, travel: { en: "Planning the trip", ar: "بنظم الرحلة" }, celebrate: { en: "Nice one!", ar: "تحفة!" },
};

export default function ChatPage() {
  const { companion, messages, sendMessage, thinking, t, language, permissions, setPermission, session } = useNomi();
  const [draft, setDraft] = useState("");
  const ar = language === "ar";
  const submit = (text: string) => { if (!text.trim() || thinking) return; setDraft(""); void sendMessage(text); };
  const empty = messages.length === 0;
  const profileName = session?.user?.user_metadata?.full_name ?? session?.user?.user_metadata?.name;
  const emailName = session?.user?.email?.split("@")[0];
  const userName = typeof profileName === "string" && profileName.trim() ? profileName.trim().split(" ")[0] : emailName;
  const welcome = ar ? userName ? `جاهز يا ${userName}، نبدأ بإيه؟` : "أنا جاهز—قولّي إيه اللي شاغل بالك؟" : userName ? `Ready when you are, ${userName}.` : "I’m ready—what’s on your mind?";
  const requestedIntegration = /calendar|تقويم|موعد|email|بريد|website|موقع/i.test(draft);

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[32rem] flex-col overflow-hidden bg-background">
      <main className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 md:px-8">
        {empty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto pb-4 text-center">
            <div className="nomi-greeting-stage"><NomiAvatar companion={companion} pose="wave" size={220} floating={false} className="nomi-wave-greeting nomi-chat-avatar" /></div>
            <h1 className="mt-1 max-w-xl text-2xl font-semibold leading-tight md:text-[2.15rem]">{welcome}</h1>
          </div>
        ) : (
          <Conversation className="min-h-0 flex-1"><ConversationContent className="mx-auto w-full max-w-3xl gap-7 px-1 py-7 md:px-4">
            {messages.map((message) => { const label = POSE_LABEL[message.pose]?.[ar ? "ar" : "en"]; return <Message key={message.id} from={message.role} className="animate-nomi-rise gap-2"><div className={cn("min-w-0", message.role === "assistant" && "flex-1")}>{message.role === "assistant" && label ? <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">{label}</p> : null}<MessageContent className={cn(message.role === "assistant" && "w-full max-w-none bg-transparent p-0")}>{message.role === "assistant" ? <MessageResponse className="text-[15px] leading-7">{clean(message.content)}</MessageResponse> : <p className="whitespace-pre-wrap text-[15px] leading-6">{message.content}</p>}</MessageContent></div></Message>; })}
            {thinking ? <div className="flex items-center gap-2"><NomiAvatar companion={companion} pose="think" size={48} floating={false} /><Shimmer className="text-sm font-medium">{ar ? "نومي بيفكر…" : "Nomi is thinking…"}</Shimmer></div> : null}
          </ConversationContent><ConversationScrollButton /></Conversation>
        )}

        <div className="relative z-10 mx-auto mb-5 w-full max-w-3xl">
          {requestedIntegration && !permissions.calendar ? <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary"><Link2 className="size-4" /></span><span className="min-w-0 flex-1 text-start"><span className="block text-sm font-semibold">{ar ? "وصّل التطبيق الذي يحتاجه نومي" : "Connect the app Nomi needs"}</span><span className="block text-xs text-muted-foreground">{ar ? "لن يحدث شيء بدون موافقتك." : "Nothing happens without your approval."}</span></span><Button size="sm" variant="outline" onClick={() => setPermission("calendar", true)}>{ar ? "سماح" : "Allow"}</Button></div> : null}
          <NomiComposer value={draft} onChange={setDraft} onSend={() => submit(draft)} busy={thinking} placeholder={t("askPlaceholder")} ar={ar} />
        </div>
      </main>
    </div>
  );
}