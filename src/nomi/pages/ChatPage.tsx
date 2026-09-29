import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Link2, ListChecks, Search, ShoppingBag } from "lucide-react";

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";
import { detectPose } from "../intent";
import type { NomiPose } from "../types";

function clean(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#{1,6}\s*/gm, "").replace(/^\s*[*-]\s+/gm, "• ").replace(/`{1,3}/g, "").trim();
}

const POSE_LABEL: Record<NomiPose, { en: string; ar: string }> = {
  idle: { en: "", ar: "" }, wave: { en: "", ar: "" },
  think: { en: "Thinking with you", ar: "بفكر معاك" },
  shopping: { en: "Ready to shop", ar: "جاهز للتسوق" },
  reminder: { en: "Keeping time", ar: "هفكرك في وقتها" },
  calendar: { en: "Checking your day", ar: "بشوف يومك" },
  search: { en: "Looking it up", ar: "بدور لك" },
  write: { en: "Writing it down", ar: "بكتبها" },
  email: { en: "On your mail", ar: "على بريدك" },
  call: { en: "Ready to call", ar: "جاهز للاتصال" },
  travel: { en: "Planning the trip", ar: "بنظم الرحلة" },
  celebrate: { en: "Nice one!", ar: "تحفة!" },
};

export default function ChatPage() {
  const { companion, messages, sendMessage, thinking, speaking, pose, t, language, permissions, setPermission } = useNomi();
  const [draft, setDraft] = useState("");
  const ar = language === "ar";
  const submit = (text: string) => {
    if (!text.trim() || thinking) return;
    setDraft("");
    void sendMessage(text);
  };
  const suggestions = ar
    ? [
        { label: "نظّم يومي", hint: "رتّب مواعيدي ومهامي", icon: CalendarDays },
        { label: "قائمة التسوق", hint: "فكرني باللي محتاجه", icon: ShoppingBag },
        { label: "ابحث ولخّص", hint: "هاتلي الخلاصة بسرعة", icon: Search },
        { label: "رتّب مهامي", hint: "خلّي أولوياتي أوضح", icon: ListChecks },
      ]
    : [
        { label: "Plan my day", hint: "Organise my schedule", icon: CalendarDays },
        { label: "Shopping list", hint: "Remember what I need", icon: ShoppingBag },
        { label: "Search and sum up", hint: "Give me the short version", icon: Search },
        { label: "Sort my tasks", hint: "Make priorities clearer", icon: ListChecks },
      ];
  const empty = messages.length === 0;
  const requestedIntegration = /calendar|تقويم|موعد|email|بريد|website|موقع/i.test(draft);
  const chatCompanion = { ...companion, outfit: companion.outfit === "knit" ? "hoodie" as const : "knit" as const, shape: companion.outfit === "knit" ? "robot" as const : "bear" as const, glasses: companion.outfit === "knit" ? "clear-square" as const : "black-oval" as const };

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[36rem] flex-col overflow-hidden bg-background">
      <main className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 md:px-8">
        {empty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto pb-2 pt-10 text-center">
            <p className="mb-3 font-display text-[10px] font-semibold uppercase text-primary">{ar ? "مساحة العمل اليومية" : "Daily workspace"}</p>
            <h1 className="max-w-xl text-3xl font-semibold leading-tight md:text-5xl">{ar ? "ما الذي تريد إنجازه اليوم؟" : "What can we make easier today?"}</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{ar ? `${companion.name} جاهز يسمعك ويرتب الخطوة التالية معك.` : `${companion.name} is ready to listen and shape the next step with you.`}</p>
            <div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-2 text-start">
              {suggestions.map(({ label, hint, icon: Icon }) => (
                <Button key={label} type="button" variant="outline" onClick={() => submit(label)} className="h-auto min-h-16 justify-start gap-3 rounded-md bg-card px-3.5 py-3 shadow-none">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-primary"><Icon className="size-[18px]" strokeWidth={1.8} /></span>
                  <span className="min-w-0 text-start"><span className="block truncate text-sm font-bold">{label}</span><span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">{hint}</span></span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="mx-auto w-full max-w-3xl gap-7 px-1 py-7 md:px-4">
              {messages.map((message) => {
                const label = POSE_LABEL[message.pose]?.[ar ? "ar" : "en"];
                return (
                  <Message key={message.id} from={message.role} className="animate-nomi-rise gap-3">
                    <div className={cn("min-w-0", message.role === "assistant" && "flex-1")}>
                      {message.role === "assistant" && label ? <p className="mb-1.5 text-[11px] font-bold text-primary">{label}</p> : null}
                      <MessageContent className={cn(message.role === "assistant" && "w-full max-w-none bg-transparent p-0")}>
                        {message.role === "assistant" ? <MessageResponse className="text-[15px] leading-7">{clean(message.content)}</MessageResponse> : <p className="whitespace-pre-wrap text-[15px] leading-6">{message.content}</p>}
                      </MessageContent>
                    </div>
                  </Message>
                );
              })}
              {thinking ? <div className="flex flex-col items-start"><NomiAvatar companion={chatCompanion} pose="think" size={72} floating={false} className="-mb-2 ms-1" /><Shimmer className="text-sm font-medium">{ar ? "نومي بيفكر…" : "Nomi is thinking…"}</Shimmer></div> : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}

        <div className="relative z-10 mx-auto mb-5 mt-24 w-full max-w-3xl">
          {requestedIntegration && !permissions.calendar ? <div className="mb-3 flex items-center gap-3 rounded-md border border-border bg-card p-3 text-start shadow-sm"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"><Link2 className="size-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{ar ? "اسمح لنومي بالوصول للتطبيق المطلوب" : "Connect the app Nomi needs"}</span><span className="block text-xs text-muted-foreground">{ar ? "لن يتم أي إجراء بدون موافقتك." : "Nothing happens without your approval."}</span></span><Button size="sm" variant="outline" onClick={() => setPermission("calendar", true)}>{ar ? "سماح" : "Allow"}</Button></div> : null}
          <NomiAvatar companion={chatCompanion} pose={pose || detectPose(draft)} speaking={speaking} size={138} floating={false} className="pointer-events-none absolute -top-[118px] end-5 z-[-1] md:end-9" />
        <PromptInput onSubmit={({ text }) => submit(text)} className="w-full rounded-lg border-border bg-card shadow-[var(--shadow-composer)]">
          <PromptInputTextarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("askPlaceholder")} className="min-h-14 px-4 pt-3.5 text-[15px]" />
          <PromptInputFooter className="px-2.5 pb-2.5">
            <PromptInputTools><span className="px-1 text-[11px] font-medium text-muted-foreground">{ar ? "محادثتك خاصة" : "Your conversation is private"}</span></PromptInputTools>
             <PromptInputSubmit status={thinking ? "submitted" : "ready"} disabled={!draft.trim() || thinking} aria-label={t("send")} className="size-9 rounded-md" />
          </PromptInputFooter>
        </PromptInput>
        </div>
      </main>
    </div>
  );
}