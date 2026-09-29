import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, CalendarDays, Link2, ListChecks, Phone, Plus, Search, ShoppingBag } from "lucide-react";

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input";
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
  const { companion, messages, sendMessage, thinking, t, language, permissions, setPermission } = useNomi();
  const [draft, setDraft] = useState("");
  const ar = language === "ar";
  const submit = (text: string) => { if (!text.trim() || thinking) return; setDraft(""); void sendMessage(text); };
  const suggestions = ar
    ? [{ label: "نظّم يومي", icon: CalendarDays }, { label: "رتّب مهامي", icon: ListChecks }, { label: "ابحث ولخّص", icon: Search }, { label: "قائمة التسوق", icon: ShoppingBag }]
    : [{ label: "Plan my day", icon: CalendarDays }, { label: "Sort my tasks", icon: ListChecks }, { label: "Search and sum up", icon: Search }, { label: "Shopping list", icon: ShoppingBag }];
  const empty = messages.length === 0;
  const requestedIntegration = /calendar|تقويم|موعد|email|بريد|website|موقع/i.test(draft);

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[34rem] flex-col overflow-hidden bg-background">
      <main className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 md:px-8">
        {empty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto pb-3 text-center">
            <NomiAvatar companion={companion} pose="wave" size={190} floating={false} className="nomi-wave-greeting -mb-8" />
            <h1 className="max-w-xl text-3xl font-bold leading-tight md:text-5xl">{ar ? <>أهلًا، أنا <span className="inline-block">{companion.name}</span></> : <>Hi, I’m <span className="inline-block">{companion.name}</span></>}</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{ar ? "أنا هنا علشان أرتّب يومك، أفتكر المهم، وأنجز معاك." : "Here to organise your day, remember what matters, and get things done with you."}</p>
            <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
              {suggestions.map(({ label, icon: Icon }) => <Button key={label} type="button" variant="outline" onClick={() => submit(label)} className="h-10 gap-2 px-4"><Icon className="size-4" />{label}</Button>)}
            </div>
          </div>
        ) : (
          <Conversation className="min-h-0 flex-1"><ConversationContent className="mx-auto w-full max-w-3xl gap-7 px-1 py-7 md:px-4">
            {messages.map((message) => { const label = POSE_LABEL[message.pose]?.[ar ? "ar" : "en"]; return <Message key={message.id} from={message.role} className="animate-nomi-rise gap-2"><div className={cn("min-w-0", message.role === "assistant" && "flex-1")}>{message.role === "assistant" && label ? <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">{label}</p> : null}<MessageContent className={cn(message.role === "assistant" && "w-full max-w-none bg-transparent p-0")}>{message.role === "assistant" ? <MessageResponse className="text-[15px] leading-7">{clean(message.content)}</MessageResponse> : <p className="whitespace-pre-wrap text-[15px] leading-6">{message.content}</p>}</MessageContent></div></Message>; })}
            {thinking ? <div className="flex items-center gap-2"><NomiAvatar companion={companion} pose="think" size={48} floating={false} /><Shimmer className="text-sm font-medium">{ar ? "نومي بيفكر…" : "Nomi is thinking…"}</Shimmer></div> : null}
          </ConversationContent><ConversationScrollButton /></Conversation>
        )}

        <div className="relative z-10 mx-auto mb-5 w-full max-w-3xl">
          {requestedIntegration && !permissions.calendar ? <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary"><Link2 className="size-4" /></span><span className="min-w-0 flex-1 text-start"><span className="block text-sm font-semibold">{ar ? "وصّل التطبيق الذي يحتاجه نومي" : "Connect the app Nomi needs"}</span><span className="block text-xs text-muted-foreground">{ar ? "لن يحدث شيء بدون موافقتك." : "Nothing happens without your approval."}</span></span><Button size="sm" variant="outline" onClick={() => setPermission("calendar", true)}>{ar ? "سماح" : "Allow"}</Button></div> : null}
          <PromptInput onSubmit={({ text }) => submit(text)} className="group/composer w-full rounded-[1.75rem] border-border bg-card shadow-sm transition-all duration-300 focus-within:-translate-y-1 focus-within:shadow-lg">
            <PromptInputTextarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t("askPlaceholder")} className="min-h-14 max-h-40 px-5 pt-4 text-[15px] transition-[min-height] duration-300 focus:min-h-20" />
            <PromptInputFooter className="px-3 pb-3">
              <PromptInputTools><Button type="button" size="icon-sm" variant="outline" aria-label={ar ? "إضافة" : "Add"} className="size-9"><Plus className="size-4" /></Button></PromptInputTools>
              {draft.trim() ? <Button type="submit" size="icon-sm" disabled={thinking} aria-label={t("send")} className="size-10"><ArrowUp className="size-4" /></Button> : <Button asChild type="button" size="icon-sm" variant="secondary" aria-label={ar ? "اتصل بنومي" : "Call Nomi"} className="size-10"><Link to="/call"><Phone className="size-4" /></Link></Button>}
            </PromptInputFooter>
          </PromptInput>
        </div>
      </main>
    </div>
  );
}