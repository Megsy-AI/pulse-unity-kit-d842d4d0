import type { NomiPose } from "./types";

const RULES: Array<{ pose: NomiPose; words: RegExp }> = [
  {
    pose: "shopping",
    words:
      /\b(buy|shop|shopping|order|cart|grocer|market|store|price|purchase)\b|اشتري|شراء|تسوق|سوق|بقال|طلب|السعر|أسعار/i,
  },
  {
    pose: "reminder",
    words: /\b(remind|reminder|alarm|wake me|don't forget)\b|ذكرني|تذكير|منبه|متنساش/i,
  },
  {
    pose: "calendar",
    words:
      /\b(calendar|schedule|meeting|appointment|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|تقويم|موعد|اجتماع|جدول|بكرة|غدا/i,
  },
  {
    pose: "search",
    words: /\b(search|find|look up|research|who is|what is|news)\b|ابحث|بحث|معلومة|أخبار|مين هو|ايه هو/i,
  },
  {
    pose: "write",
    words: /\b(write|draft|note|summar|essay|post|caption)\b|اكتب|كتابة|ملخص|لخص|مذكرة|منشور/i,
  },
  { pose: "email", words: /\b(email|inbox|mail|reply to)\b|بريد|ايميل|رسالة بريد/i },
  { pose: "call", words: /\b(call|phone|dial|ring)\b|اتصل|مكالمة|تليفون|رن/i },
  { pose: "travel", words: /\b(travel|flight|trip|hotel|ticket)\b|سفر|رحلة|طيران|فندق|تذكرة/i },
  { pose: "celebrate", words: /\b(thanks|thank you|great|awesome|love it|done)\b|شكرا|تمام|جميل|رائع|حلو/i },
];

/** Picks the character pose that matches what the user is talking about. */
export function detectPose(text: string): NomiPose {
  for (const rule of RULES) if (rule.words.test(text)) return rule.pose;
  if (text.trim().endsWith("?") || /[؟]/.test(text)) return "think";
  return "idle";
}
