import { ArrowLeft, ArrowRight, Brain, Clock3, Sparkles, WandSparkles } from "lucide-react";
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
      ]
    : [
        { icon: Sparkles, title: "Smarter conversations", detail: "More capability for complex requests and everyday work." },
        { icon: Clock3, title: "More time with Nomi", detail: "More room for conversations and ongoing tasks." },
        { icon: Brain, title: "Deeper memory", detail: "More context for what matters, always under your control." },
      ];

  return (
    <main className="min-h-full px-5 pb-12 pt-2">
      <div className="mx-auto w-full max-w-xl">
        <Button asChild variant="ghost" size="icon" className="-ms-2 border-0 bg-transparent shadow-none" aria-label={ar ? "رجوع" : "Back"}>
          <Link to="/chat"><Back className="size-5" /></Link>
        </Button>
        <section className="flex flex-col items-center pb-8 pt-5 text-center">
          <PremiumStar className="mb-3 size-20" />
          <p className="text-xs font-bold uppercase text-premium">Nomi Premium</p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">{ar ? "خلّي نومي ينجز أكتر معاك" : "Let Nomi do more with you"}</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{ar ? "مزايا إضافية للمحادثات والمهام والذاكرة، في تجربة أبسط وأسرع." : "Extra capacity for conversations, tasks, and memory in a simpler, faster experience."}</p>
        </section>
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {benefits.map(({ icon: Icon, title, detail }, index) => (
            <div key={title} className={index ? "flex gap-4 border-t border-border px-5 py-4" : "flex gap-4 px-5 py-4"}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary"><Icon className="size-[18px]" /></span>
              <span className="min-w-0 text-start"><strong className="block text-sm">{title}</strong><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{detail}</span></span>
            </div>
          ))}
        </section>
        <div className="mt-5 rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
          <WandSparkles className="mx-auto size-5 text-premium" />
          <p className="mt-2 text-sm font-bold">{ar ? "الاشتراك قريبًا" : "Subscriptions are coming soon"}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{ar ? "هنعرض السعر وخيارات الدفع هنا قبل إطلاق الاشتراك." : "Pricing and payment options will appear here before subscriptions launch."}</p>
          <Button disabled className="mt-4 w-full">{ar ? "قريبًا" : "Coming soon"}</Button>
        </div>
      </div>
    </main>
  );
}