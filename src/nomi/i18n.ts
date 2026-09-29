import type { NomiLanguage } from "./types";

type Dict = Record<string, { en: string; ar: string }>;

const dict: Dict = {
  brand: { en: "Nomi", ar: "نومي" },
  tagline: {
    en: "Every person deserves their own AI companion.",
    ar: "كل شخص يستحق رفيقًا ذكيًا خاصًا به.",
  },
  heroTitle: {
    en: "Your own AI companion, with its own face.",
    ar: "رفيقك الذكي الخاص، بوجهه الخاص.",
  },
  heroBody: {
    en: "Nomi remembers what matters to you, keeps your day organised, and speaks the way you like — in English or Arabic.",
    ar: "نومي يتذكر ما يهمك، وينظم يومك، ويتحدث بالأسلوب الذي تحبه — بالعربية أو الإنجليزية.",
  },
  getStarted: { en: "Create my Nomi", ar: "أنشئ نومي الخاص بي" },
  signIn: { en: "Sign in", ar: "تسجيل الدخول" },
  signUp: { en: "Create account", ar: "إنشاء حساب" },
  signOut: { en: "Sign out", ar: "تسجيل الخروج" },
  continueGuest: { en: "Try without an account", ar: "جرّب بدون حساب" },
  chat: { en: "Chat", ar: "المحادثة" },
  calls: { en: "Call", ar: "مكالمة" },
  tasks: { en: "Tasks", ar: "المهام" },
  projects: { en: "Projects", ar: "المشاريع" },
  memory: { en: "Memory", ar: "الذاكرة" },
  persona: { en: "Character", ar: "الشخصية" },
  integrations: { en: "Abilities", ar: "القدرات" },
  privacy: { en: "Privacy", ar: "الخصوصية" },
  settings: { en: "Settings", ar: "الإعدادات" },
  home: { en: "Home", ar: "الرئيسية" },
  send: { en: "Send", ar: "إرسال" },
  askPlaceholder: { en: "Tell Nomi anything…", ar: "احكِ لنومي أي حاجة…" },
  greeting: { en: "Hi, I'm here.", ar: "أهلًا، أنا معاك." },
  onboardTitle: { en: "Let's create your companion", ar: "لنصنع رفيقك الخاص" },
  stepLook: { en: "Look", ar: "الشكل" },
  stepName: { en: "Name", ar: "الاسم" },
  stepPersonality: { en: "Personality", ar: "الطابع" },
  stepLanguage: { en: "Language", ar: "اللغة" },
  next: { en: "Continue", ar: "التالي" },
  back: { en: "Back", ar: "رجوع" },
  finish: { en: "Meet my Nomi", ar: "تعرّف على نومي" },
  shape: { en: "Character shape", ar: "شكل الشخصية" },
  colors: { en: "Colours", ar: "الألوان" },
  nameLabel: { en: "What should we call your companion?", ar: "ماذا نسمي رفيقك؟" },
  personalityLabel: { en: "How should it behave?", ar: "كيف يتصرف معك؟" },
  toneLabel: { en: "How should it speak?", ar: "كيف يتحدث معك؟" },
  addTask: { en: "Add a task or reminder", ar: "أضف مهمة أو تذكير" },
  add: { en: "Add", ar: "أضف" },
  noTasks: { en: "Nothing planned yet.", ar: "لا يوجد شيء مخطط بعد." },
  noMemories: { en: "Nomi hasn't learned anything yet.", ar: "نومي لم يتعلم شيئًا بعد." },
  memoryHint: {
    en: "Everything Nomi remembers about you. Turn any item off or delete it.",
    ar: "كل ما يتذكره نومي عنك. يمكنك إيقاف أي عنصر أو حذفه.",
  },
  endCall: { en: "End", ar: "إنهاء" },
  mute: { en: "Mute", ar: "كتم" },
  unmute: { en: "Unmute", ar: "إلغاء الكتم" },
  speaker: { en: "Speaker", ar: "مكبر الصوت" },
  listening: { en: "Listening…", ar: "أستمع إليك…" },
  speaking: { en: "Speaking…", ar: "أتحدث…" },
  connecting: { en: "Connecting…", ar: "جاري الاتصال…" },
  callNomi: { en: "Call", ar: "اتصال" },
  soon: { en: "Coming soon", ar: "قريبًا" },
  enabled: { en: "Allowed", ar: "مسموح" },
  disabled: { en: "Off", ar: "موقوف" },
  delete: { en: "Delete", ar: "حذف" },
  save: { en: "Save", ar: "حفظ" },
  saved: { en: "Saved", ar: "تم الحفظ" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  password: { en: "Password", ar: "كلمة المرور" },
  darkMode: { en: "Dark mode", ar: "الوضع الداكن" },
  language: { en: "Language", ar: "اللغة" },
};

export function makeT(lang: NomiLanguage) {
  return (key: keyof typeof dict | string) => {
    const entry = dict[key as keyof typeof dict];
    return entry ? entry[lang] : String(key);
  };
}

export type Translate = ReturnType<typeof makeT>;
