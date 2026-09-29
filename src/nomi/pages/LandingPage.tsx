import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import conversationImg from "@/assets/landing/conversation-transparent-fixed.png";
import browserImg from "@/assets/landing/browser-transparent-fixed.png";
import approvalImg from "@/assets/landing/approval-transparent-fixed.png";
import goalsImg from "@/assets/landing/goals-transparent-fixed.png";
import connectorsImg from "@/assets/landing/connectors.webp.asset.json";
import ivory from "@/assets/nomi-look-ivory.webp";

const navItems = [
  { label: "What Nomi does", href: "#conversation" },
  { label: "Goals", href: "#goals" },
  { label: "Connections", href: "#connections" },
];

const changingPromises = [
  "Books the table before it fills up",
  "Finds a better price before you buy",
  "Turns plans into real appointments",
  "Keeps small things from piling up",
];

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>;
}

function RotatingPromise({ index }: { index: number }) {
  return (
    <span className="hero-promise" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span key={changingPromises[index]} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }}>
          {changingPromises[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function StorySection({ id, title, copy, image, alt, soft = false, priority = false }: { id?: string; title: string; copy: string; image: string; alt: string; soft?: boolean; priority?: boolean }) {
  return (
    <section id={id} className={`landing-product-section ${soft ? "landing-product-section-soft" : ""}`}>
      <Reveal className="landing-product-copy">
        <h2>{title}</h2>
        <p>{copy}</p>
      </Reveal>
      <Reveal className="landing-art-stage">
        <img src={image} alt={alt} width={1024} height={1024} loading={priority ? "eager" : "lazy"} decoding="async" />
      </Reveal>
    </section>
  );
}

function useHeavyScroll() {
  useEffect(() => {
    let target = window.scrollY;
    let raf = 0;
    let running = false;
    let touching = false;
    let lastTouchY = 0;
    let touchVelocity = 0;

    const limit = (value: number) => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      return Math.max(0, Math.min(max, value));
    };

    const tick = () => {
      const current = window.scrollY;
      const next = current + (target - current) * 0.14;
      window.scrollTo(0, next);
      if (Math.abs(target - next) > 0.45) {
        raf = requestAnimationFrame(tick);
      } else {
        window.scrollTo(0, target);
        running = false;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      if (!running) target = window.scrollY;
      const delta = Math.max(-120, Math.min(120, e.deltaY));
      target = limit(target + delta * 1.05);
      start();
    };

    const onScroll = () => {
      if (!running && !touching) target = window.scrollY;
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      touching = true;
      lastTouchY = touch.clientY;
      touchVelocity = 0;
      target = window.scrollY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || !touching) return;
      e.preventDefault();
      const delta = lastTouchY - touch.clientY;
      lastTouchY = touch.clientY;
      touchVelocity = touchVelocity * 0.4 + delta * 0.6;
      target = limit(target + delta * 1.02);
      window.scrollTo(0, target);
    };

    const onTouchEnd = () => {
      if (!touching) return;
      touching = false;
      target = limit(target + Math.max(-110, Math.min(110, touchVelocity * 3.5)));
      start();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      cancelAnimationFrame(raf);
    };
  }, []);
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const topVisible = useInView(topRef, { once: true });
  useHeavyScroll();

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((c) => (c + 1) % changingPromises.length), 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="landing-page bg-landing-surface text-landing-ink">
      <section className="landing-hero">
        <header className="landing-header">
          <a href="#top" className="landing-brand">NOMI</a>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => <a key={item.href} href={item.href} className="landing-nav-link">{item.label}</a>)}
            <Button variant="outline" size="sm" className="rounded-full border-landing-ink bg-landing-surface text-landing-ink hover:bg-landing-ink hover:text-landing-on-dark" onClick={() => navigate("/auth")}>Sign in</Button>
          </nav>
          <Button variant="ghost" size="icon" className="text-landing-ink hover:bg-landing-soft md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X className="size-[22px]" /> : <Menu className="size-[22px]" />}</Button>
        </header>

        <AnimatePresence>{menuOpen && <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mobile-menu-glass fixed inset-x-4 top-16 z-50 flex flex-col gap-5 rounded-2xl py-8 md:hidden">{navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="px-8 text-sm font-light uppercase tracking-[0.2em] text-landing-on-dark-muted">{item.label}</a>)}<Button className="mx-6 mt-2 rounded-full bg-landing-on-dark text-landing-ink hover:bg-landing-on-dark-muted" onClick={() => navigate("/auth")}>Sign in</Button></motion.nav>}</AnimatePresence>

        <div id="top" ref={topRef} className="landing-hero-content">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={topVisible ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.7, delay: 0.1 }}>
            Meet <span className="landing-nomi-word">nomi<img src={ivory} alt="Nomi" className="landing-nomi-sitter" /></span>, your AI
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={topVisible ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.7, delay: 0.2 }}><RotatingPromise index={index} /></motion.div>
          <motion.div initial={{ opacity: 0 }} animate={topVisible ? { opacity: 1 } : undefined} transition={{ duration: 0.6, delay: 0.6 }}>
            <Button className="landing-hero-cta h-11 rounded-full px-7 text-sm font-medium" onClick={() => navigate("/auth")}>Create your Nomi</Button>
          </motion.div>
          <a href="#conversation" aria-label="See what Nomi can do" className="landing-scroll-cue"><span>See what Nomi can do</span><ArrowDown className="size-4" /></a>
        </div>
      </section>

      <StorySection id="conversation" title="Say what you need. Nomi works out the rest." copy="Ask naturally, add a detail when Nomi needs it, and watch it turn into a real next step." image={conversationImg} alt="Nomi chatting and auto-filling a form" priority />
      <StorySection title="Nomi opens the browser and gets it done." copy="From picking seats to finishing a booking, Nomi handles the clicks and keeps you posted." image={browserImg} alt="Nomi booking movie tickets in a browser" soft />
      <StorySection title="Nomi can prepare the purchase. You make the call." copy="Prices can be checked and checkout can be readied, but nothing important happens until you approve it." image={approvalImg} alt="Nomi asking for approval before an order" />
      <StorySection id="goals" title="Goals that keep moving with you." copy="Nomi keeps sight of what matters and suggests the next move while there is still time." image={goalsImg} alt="Nomi climbing goal cards" soft />
      <StorySection id="connections" title="One Nomi, across the tools you already use." copy="Bring mail, calendar, files, shopping, messages, and more into one calm conversation—with every permission under your control." image={connectorsImg.url} alt="Connected app icons" soft />

      <section className="landing-final-cta">
        <Reveal className="text-center">
          <h2>Your day has a new co-pilot.</h2>
          <p>Create a Nomi that looks, sounds, and works the way you want.</p>
          <Button size="lg" className="mt-8 h-12 rounded-full bg-landing-on-dark px-8 text-landing-ink hover:bg-landing-on-dark" onClick={() => navigate("/auth")}>Get started</Button>
        </Reveal>
      </section>
      <footer className="landing-footer"><span>Nomi · Your personal AI companion</span><span>© 2026</span></footer>
    </main>
  );
}
