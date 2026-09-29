import { ArrowLeft, ArrowRight, Brain, Clock3, Infinity, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PremiumStar } from "../components/PremiumStar";
import { useNomi } from "../store";

export default function PremiumPage() {
  const { language } = useNomi();
  const ar = language === "ar";
  const Back = ar ? ArrowRight : ArrowLeft;
  const benefits = ar
    ? [
        { icon: Sparkles, title: "محادثات أذكى", detail: "قدرات أوسع للطلبات المركبة والعمل اليومي." },
        { icon: Clock3, title: "وقت أطول مع نومي", detail: "مساحة أكبر للمحادثات والمهام المستمرة." },
        { icon: Brain, title: "ذاكرة أعمق", detail: "سياق أكثر لما يهمك، تحت تحكمك دائمًا." },
        { icon: Infinity, title: "مساحة أكبر", detail: "وقت أطول للمهام والمحادثات المستمرة." },
      ]
    : [
        { icon: Sparkles, title: "Smarter conversations", detail: "More capability for complex requests and everyday work." },
        { icon: Clock3, title: "More time with Nomi", detail: "More room for conversations and ongoing tasks." },
        { icon: Brain, title: "Deeper memory", detail: "More context for what matters, always under your control." },
        { icon: Infinity, title: "More room", detail: "Longer sessions for ongoing conversations and tasks." },
      ];

  return (
    <main className="premium-page min-h-[calc(100dvh-4rem)] overflow-y-auto px-5 pb-8 pt-2">
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col">
        <Button asChild variant="ghost" size="icon" className="-ms-2 border-0 bg-transparent shadow-none" aria-label={ar ? "رجوع" : "Back"}>
          <Link to="/chat"><Back className="size-5" /></Link>
        </Button>
        <section className="flex flex-col items-center pb-6 pt-2 text-center">
          <PremiumStar className="mb-2 h-16 w-24" />
          <h1 className="mt-1 text-3xl font-semibold">{ar ? "ارتقِ إلى Nomi Premium" : "Upgrade to Nomi Premium"}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{ar ? "نومي أذكى، أسرع، وموجود معاك لوقت أطول." : "A smarter, faster Nomi that can stay with you for longer."}</p>
        </section>
        <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm">
          {benefits.map(({ icon: Icon, title, detail }, index) => (
            <div key={title} className={index ? "flex gap-4 border-t border-border px-5 py-4" : "flex gap-4 px-5 py-4"}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary"><Icon className="size-[18px]" /></span>
              <span className="min-w-0 text-start"><strong className="block text-sm">{title}</strong><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{detail}</span></span>
            </div>
          ))}
        </section>
        <div className="mt-auto pt-5 text-center">
          <p className="mb-3 text-xs leading-5 text-muted-foreground">{ar ? "الأسعار وخيارات الدفع هتظهر هنا قبل الإطلاق." : "Pricing and payment choices will appear here before launch."}</p>
          <Button disabled className="h-12 w-full rounded-2xl">{ar ? "الاشتراك قريبًا" : "Subscriptions coming soon"}</Button>
        </div>
      </div>
    </main>
  );
}