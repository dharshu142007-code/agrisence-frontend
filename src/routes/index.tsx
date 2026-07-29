import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Leaf, ScanLine, CloudSun, Bug, Droplets, TrendingUp, MessageSquare, ChevronRight,
  Sparkles, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";
import { ParticleField } from "@/components/particle-field";
import { useSession } from "@/hooks/use-session";
import heroImg from "@/assets/hero-crop.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CropGuard AI — Protect Your Crops with AI" },
      {
        name: "description",
        content:
          "Instant AI crop disease detection, weather-smart insights, and a personalized treatment plan for every scan.",
      },
      { property: "og:title", content: "CropGuard AI — Protect Your Crops with AI" },
      {
        property: "og:description",
        content: "Scan a leaf. Get a diagnosis. Save your harvest.",
      },
    ],
  }),
  component: Landing,
});

function useTypewriter(words: string[], speed = 90) {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[i % words.length];
    const t = setTimeout(
      () => {
        if (!del) {
          setTxt(word.slice(0, txt.length + 1));
          if (txt.length + 1 === word.length) setTimeout(() => setDel(true), 1400);
        } else {
          setTxt(word.slice(0, txt.length - 1));
          if (txt.length - 1 === 0) {
            setDel(false);
            setI(i + 1);
          }
        }
      },
      del ? 40 : speed,
    );
    return () => clearTimeout(t);
  }, [txt, del, i, words, speed]);
  return txt;
}

function Header() {
  const { data: user } = useSession();
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <div className="glass flex items-center justify-between rounded-2xl px-5 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-leaf text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-lg tracking-tight">CropGuard <span className="text-gradient-hero">AI</span></span>
          </Link>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#testimonials" className="hover:text-foreground">Farmers</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          {user ? (
            <Button asChild className="rounded-2xl">
              <Link to="/dashboard">Dashboard <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="rounded-2xl hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild className="rounded-2xl bg-gradient-hero text-primary-foreground shadow-glow">
                <Link to="/auth">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const nav = useNavigate();
  const typed = useTypewriter([
    "Detect diseases in seconds.",
    "Predict weather threats.",
    "Grow healthier harvests.",
  ]);
  return (
    <section className="relative overflow-hidden pt-36 pb-24">
      <div className="absolute inset-0 bg-gradient-dawn opacity-70" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle at 20% 30%, var(--color-primary-glow) 0, transparent 40%), radial-gradient(circle at 80% 60%, var(--color-sky) 0, transparent 40%)`,
      }} />
      <ParticleField count={18} />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Powered by Lovable AI Vision
          </div>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Protect your crops <br />
            with <span className="text-gradient-hero">AI</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl h-14">
            {typed}
            <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-primary align-middle" />
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-2xl bg-gradient-hero px-6 text-base shadow-elevated"
              onClick={() => nav({ to: "/auth" })}
            >
              Get Started Free <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl" asChild>
              <a href="#how">Watch Demo</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> 98.4% accuracy</span>
            <span className="inline-flex items-center gap-1.5"><Leaf className="h-4 w-4 text-primary" /> 40+ crops</span>
            <span className="inline-flex items-center gap-1.5"><CloudSun className="h-4 w-4 text-primary" /> Live weather</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative overflow-hidden rounded-[2rem] shadow-elevated"
          >
            <img
              src={heroImg}
              alt="A young crop sprout being analyzed by AI light particles at golden hour"
              width={1600}
              height={1200}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <motion.div
              className="absolute inset-x-6 top-1/2 h-0.5 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, var(--color-primary-glow), transparent)" }}
              animate={{ y: [-120, 120, -120] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Diagnosis</p>
                  <p className="font-semibold">Healthy — Leaf Green</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-semibold text-primary">98%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const stats = [
  { label: "Diseases detected", value: "120K+" },
  { label: "Farmers helped", value: "8,200" },
  { label: "Accuracy", value: "98.4%" },
  { label: "Crops supported", value: "40+" },
];

const features = [
  { icon: ScanLine, title: "AI Disease Detection", desc: "Snap a leaf. Get a diagnosis and a full treatment plan instantly." },
  { icon: CloudSun, title: "Weather Intelligence", desc: "Live 5-day forecast for your farm's exact location." },
  { icon: Bug, title: "Pest Identification", desc: "Recognize destructive pests before they spread." },
  { icon: Droplets, title: "Smart Irrigation", desc: "Data-driven watering guidance based on soil and rain." },
  { icon: TrendingUp, title: "Yield Prediction", desc: "AI forecasts to plan harvest and pricing." },
  { icon: MessageSquare, title: "Expert Guidance", desc: "Personalized recommendations from our agriculture AI." },
];

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative py-24 ${className}`}>
      <div className="mx-auto max-w-7xl px-4">{children}</div>
    </section>
  );
}

function Landing() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <Hero />

      {/* Stats */}
      <Section className="pt-4">
        <GlassCard className="grid grid-cols-2 gap-6 rounded-3xl p-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-gradient-hero md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </GlassCard>
      </Section>

      {/* Features */}
      <Section id="features">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Everything you need</p>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">A smarter way to farm</h2>
          <p className="mt-4 text-muted-foreground">Powerful tools built for growers, from seed to harvest.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard hoverable className="h-full">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-leaf text-primary-foreground shadow-glow">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" className="bg-gradient-to-b from-transparent via-accent/30 to-transparent">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">3 simple steps</p>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">Scan. Analyze. Treat.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Snap a photo", d: "Upload or capture any crop leaf directly from your phone." },
            { n: "02", t: "AI diagnoses", d: "Vision AI identifies the disease, severity, and affected parts." },
            { n: "03", t: "Follow the plan", d: "Get organic, chemical, and prevention steps tailored to you." },
          ].map((s) => (
            <GlassCard key={s.n} className="text-center">
              <p className="text-6xl font-black text-gradient-leaf opacity-40">{s.n}</p>
              <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section id="testimonials">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Loved by farmers</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "Rajesh K.", loc: "Punjab", q: "Detected leaf rust in minutes. Saved my whole wheat crop." },
            { n: "Priya M.", loc: "Karnataka", q: "The treatment plans are practical — organic options included." },
            { n: "Anil S.", loc: "Maharashtra", q: "Weather forecasts helped me schedule irrigation perfectly." },
          ].map((t) => (
            <GlassCard key={t.n}>
              <p className="text-base italic">"{t.q}"</p>
              <div className="mt-4">
                <p className="font-semibold">{t.n}</p>
                <p className="text-xs text-muted-foreground">{t.loc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-4xl font-bold md:text-5xl">Questions</h2>
          <div className="mt-10 space-y-3">
            {[
              { q: "Is CropGuard AI free?", a: "Yes — creating an account and scanning your first crops is free." },
              { q: "Which crops are supported?", a: "40+ major crops including wheat, rice, tomato, potato, cotton, and more." },
              { q: "How accurate is the AI?", a: "Our vision model reaches 98.4% accuracy across our benchmark set." },
              { q: "Do I need internet?", a: "Yes, an internet connection is required to analyze photos." },
              { q: "Is my farm data private?", a: "Absolutely — your images and scans are stored securely and only visible to you." },
              { q: "Does it work on my phone?", a: "Yes, CropGuard AI works on any modern mobile browser." },
            ].map((f) => (
              <details key={f.q} className="glass group rounded-2xl px-5 py-4">
                <summary className="cursor-pointer list-none font-medium flex items-center justify-between">
                  {f.q}
                  <ChevronRight className="h-4 w-4 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <GlassCard className="relative overflow-hidden rounded-[2rem] p-12 text-center">
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-primary-foreground md:text-5xl">Ready to protect your harvest?</h2>
            <p className="mt-3 text-primary-foreground/90">Join thousands of farmers using AI to grow smarter.</p>
            <Button size="lg" className="mt-8 rounded-2xl bg-background text-foreground hover:bg-background/90" asChild>
              <Link to="/auth">Start scanning free <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </GlassCard>
      </Section>

      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <Leaf className="h-5 w-5 text-primary" />
            CropGuard AI
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CropGuard AI. Grow smarter.</p>
        </div>
      </footer>
    </div>
  );
}
