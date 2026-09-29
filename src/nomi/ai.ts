import type { NomiAction, NomiCompanion, NomiMemory, NomiMessage, NomiProject, NomiTask } from "./types";

export type { NomiAction };

const PERSONALITY: Record<string, { en: string; ar: string }> = {
  friendly: { en: "warm, encouraging and easy-going", ar: "ودود ومشجع وبسيط" },
  calm: { en: "calm, gentle and reassuring", ar: "هادئ ولطيف ومطمئن" },
  playful: { en: "playful, light and a bit funny", ar: "مرح وخفيف الظل" },
  focused: { en: "focused, practical and to the point", ar: "عملي ومباشر ومركز" },
  wise: { en: "thoughtful, calm and insightful", ar: "حكيم وهادئ وعميق" },
};

const TONE: Record<string, { en: string; ar: string }> = {
  warm: { en: "warm full sentences", ar: "جمل دافئة كاملة" },
  casual: { en: "casual everyday language", ar: "لغة يومية بسيطة" },
  formal: { en: "polite formal language", ar: "لغة مهذبة رسمية" },
  short: { en: "very short answers", ar: "إجابات قصيرة جدًا" },
};

export interface NomiContextSnapshot {
  companion: NomiCompanion;
  memories: NomiMemory[];
  tasks: NomiTask[];
  projects: NomiProject[];
  enabledIntegrations: string[];
}

export function buildSystemPrompt(ctx: NomiContextSnapshot) {
  const { companion } = ctx;
  const lang = companion.language;
  const persona = PERSONALITY[companion.personality] ?? PERSONALITY.friendly;
  const tone = TONE[companion.tone] ?? TONE.warm;
  const remembered = ctx.memories
    .filter((m) => m.enabled)
    .slice(-40)
    .map((m) => `- ${m.category}: ${m.content}`)
    .join("\n");
  const open = ctx.tasks
    .filter((t) => !t.done)
    .slice(-25)
    .map((t) => `- [${t.kind}] ${t.title}${t.dueAt ? ` (due ${t.dueAt})` : ""}`)
    .join("\n");
  const projects = ctx.projects.filter((p) => !p.archived).map((p) => `- ${p.name}`).join("\n");

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const offsetMin = -now.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const off = `${sign}${String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0")}:${String(Math.abs(offsetMin) % 60).padStart(2, "0")}`;

  const base =
    lang === "ar"
      ? `أنت "${companion.name}"، الرفيق الذكي الشخصي لهذا المستخدم. أسلوبك ${persona.ar}، وتتحدث بـ${tone.ar} بالعربية المصرية البسيطة. تساعد في تنظيم اليوم، المهام، التذكيرات، تلخيص المعلومات، واقتراح خطوات مفيدة. لا تذكر أبدًا أنك نموذج لغوي. اكتب بنص عادي قصير بدون رموز تنسيق، وبحد أقصى ٤ أسطر ما لم يطلب المستخدم تفاصيل.`
      : `You are "${companion.name}", this person's own personal AI companion. Your manner is ${persona.en} and you speak in ${tone.en}. You help organise their day, tasks, reminders, summaries and useful next steps. Never mention being a language model. Write plain conversational text with no markdown symbols, about four short lines unless more detail is asked for.`;

  const rules = `Use your tools proactively: create tasks/reminders when asked, save durable facts about the user as memories${
    companion && ctx.enabledIntegrations.includes("memory") ? "" : " (memory is disabled by the user: do NOT save memories)"
  }, mark tasks done, create projects for multi-step goals, and call request_integration when a needed integration is not enabled. Always also reply with a short confirmation.
Current local time: ${now.toLocaleString("sv-SE").replace(" ", "T")}${off} (${tz}).
Enabled integrations: ${ctx.enabledIntegrations.join(", ") || "none"}.`;

  return [
    base,
    rules,
    remembered && `What you remember about them:\n${remembered}`,
    open && `Open tasks:\n${open}`,
    projects && `Projects:\n${projects}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function localReply(text: string, companion: NomiCompanion) {
  const ar = companion.language === "ar";
  if (/task|remind|ذكرني|مهمة|تذكير/i.test(text))
    return ar ? "تمام، هسجلها لك أول ما الاتصال يرجع." : "Got it — I'll set that up as soon as I'm back online.";
  return ar
    ? "أنا معاك. احكيلي أكتر وأساعدك أنظمها خطوة بخطوة."
    : "I'm here with you. Tell me a bit more and I'll help you organise it step by step.";
}

export async function askNomi(
  history: NomiMessage[],
  ctx: NomiContextSnapshot,
): Promise<{ reply: string; actions: NomiAction[] }> {
  const messages = [
    { role: "system", content: buildSystemPrompt(ctx) },
    ...history.slice(-16).map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await fetch("/api/nomi-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (response.ok) {
      const data = (await response.json()) as { reply?: string; actions?: NomiAction[] };
      const reply = data.reply?.trim() ?? "";
      const actions = Array.isArray(data.actions) ? data.actions : [];
      if (reply || actions.length)
        return { reply: reply || (ctx.companion.language === "ar" ? "تمام ✓" : "Done ✓"), actions };
    }
  } catch {
    // fall through to the offline companion voice
  }

  return { reply: localReply(history[history.length - 1]?.content ?? "", ctx.companion), actions: [] };
}
