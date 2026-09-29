import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Link2, Phone, Plus } from "lucide-react";

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";
import type { NomiPose } from "../types";

function clean(text: string) { return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#{1,6}\s*/gm, "").replace(/^\s*[*-]\s+/gm, "• ").replace(/`{1,3}/g, "").trim(); }
const POSE_LABEL: Record<NomiPose, { en: string; ar: string }> = {
  idle: { en: "", ar: "" }, wave: { en: "", ar: "" }, think: { en: "Thinking with you", ar: "بفكر معاك" }, shopping: { en: "Ready to shop", ar: "جاهز للتسوق" }, reminder: { en: "Keeping time", ar: "هفكرك في وقتها" }, calendar: { en: "Checking your day", ar: "بشوف يومك" }, search: { en: "Looking it up", ar: "بدور لك" }, write: { en: "Writing it down", ar: "بكتبها" }, email: { en: "On your mail", ar: "على بريدك" }, call: { en: "Ready to call", ar: "جاهز للاتصال" }, travel: { en: "Planning the trip", ar: "بنظم الرحلة" }, celebrate: { en: "Nice one!", ar: "تحفة!" },
};

export default function ChatPage() {
  const { companion, messages, sendMessage, thinking, t, language, permissions, setPermission, session } = useNomi();
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const ar = language === "ar";
  const submit = (text: string) => { if (!text.trim() || thinking) return; setDraft(""); void sendMessage(text); };
  const empty = messages.length === 0;
  const profileName = session?.user?.user_metadata?.full_name ?? session?.user?.user_metadata?.name;
  const emailName = session?.user?.email?.split("@")[0];
  const userName = typeof profileName === "string" && profileName.trim() ? profileName.trim().split(" ")[0] : emailName;
  const welcome = ar ? userName ? `جاهز يا ${userName}، نبدأ بإيه؟` : "أنا جاهز—قولّي إيه اللي شاغل بالك؟" : userName ? `Ready when you are, ${userName}.` : "I’m ready—what’s on your mind?";
  const requestedIntegration = /calendar|تقويم|موعد|email|بريد|website|موقع/i.test(draft);

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[34rem] flex-col overflow-hidden bg-background">
      <main className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 md:px-8">
        {empty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto pb-6 text-center">
            <div className="grid h-52 w-52 place-items-center md:h-56 md:w-56"><NomiAvatar companion={companion} pose="wave" size={196} floating={false} className="nomi-wave-greeting nomi-chat-avatar" /></div>
            <h1 className="mt-3 max-w-xl text-2xl font-bold leading-tight md:text-4xl">{welcome}</h1>
          </div>
        ) : (
          <Conversation className="min-h-0 flex-1"><ConversationContent className="mx-auto w-full max-w-3xl gap-7 px-1 py-7 md:px-4">
            {messages.map((message) => { const label = POSE_LABEL[message.pose]?.[ar ? "ar" : "en"]; return <Message key={message.id} from={message.role} className="animate-nomi-rise gap-2"><div className={cn("min-w-0", message.role === "assistant" && "flex-1")}>{message.role === "assistant" && label ? <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">{label}</p> : null}<MessageContent className={cn(message.role === "assistant" && "w-full max-w-none bg-transparent p-0")}>{message.role === "assistant" ? <MessageResponse className="text-[15px] leading-7">{clean(message.content)}</MessageResponse> : <p className="whitespace-pre-wrap text-[15px] leading-6">{message.content}</p>}</MessageContent></div></Message>; })}
            {thinking ? <div className="flex items-center gap-2"><NomiAvatar companion={companion} pose="think" size={48} floating={false} /><Shimmer className="text-sm font-medium">{ar ? "نومي بيفكر…" : "Nomi is thinking…"}</Shimmer></div> : null}
          </ConversationContent><ConversationScrollButton /></Conversation>
        )}

        <div className="relative z-10 mx-auto mb-5 w-full max-w-3xl">
          {requestedIntegration && !permissions.calendar ? <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary"><Link2 className="size-4" /></span><span className="min-w-0 flex-1 text-start"><span className="block text-sm font-semibold">{ar ? "وصّل التطبيق الذي يحتاجه نومي" : "Connect the app Nomi needs"}</span><span className="block text-xs text-muted-foreground">{ar ? "لن يحدث شيء بدون موافقتك." : "Nothing happens without your approval."}</span></span><Button size="sm" variant="outline" onClick={() => setPermission("calendar", true)}>{ar ? "سماح" : "Allow"}</Button></div> : null}
          <form onSubmit={(event) => { event.preventDefault(); submit(draft); }} className={cn("flex w-full border border-border bg-card shadow-sm transition-[border-radius,box-shadow,padding] duration-300", focused || draft.trim() ? "flex-col rounded-[1.65rem] p-2.5 shadow-[var(--shadow-composer)]" : "h-14 flex-row items-center rounded-full px-2")}>
            <textarea
              value={draft}
              rows={1}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(draft); } }}
              placeholder={t("askPlaceholder")}
              className={cn("min-w-0 flex-1 resize-none bg-transparent px-3 text-[15px] outline-none placeholder:text-muted-foreground", focused || draft.trim() ? "max-h-40 min-h-16 py-2" : "h-10 py-2.5")}
            />
            <div className={cn("flex items-center justify-between gap-2", focused || draft.trim() ? "pt-1" : "contents")}>
              <Button type="button" size="icon-sm" variant="ghost" aria-label={ar ? "إضافة" : "Add"} className={cn("size-8 border border-border bg-secondary/50", !(focused || draft.trim()) && "order-first")}><Plus className="size-4" /></Button>
              {draft.trim() ? <Button type="submit" size="icon-sm" disabled={thinking} aria-label={t("send")} className="size-9"><ArrowUp className="size-4" /></Button> : <Button asChild type="button" size="icon-sm" variant="ghost" aria-label={ar ? "اتصل بنومي" : "Call Nomi"} className="size-9 bg-secondary/60"><Link to="/call"><Phone className="size-4" /></Link></Button>}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}