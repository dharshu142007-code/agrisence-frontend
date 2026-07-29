import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Send, Mic, MicOff, Volume2, Square, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/glass-card";
import { askFarmAssistant } from "@/lib/ai.functions";
import { useI18n, BCP47 } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant & Voice — CropGuard AI" },
      { name: "description", content: "Ask farming questions by text or voice and get instant expert answers." },
      { property: "og:title", content: "AI Assistant & Voice — CropGuard AI" },
      { property: "og:description", content: "Your multilingual farming companion, powered by AI." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Why are my tomato leaves curling?",
  "Best fertilizer schedule for wheat?",
  "How much water does sugarcane need weekly?",
  "Which pest attacks brinjal in monsoon?",
];

function ChatPage() {
  const { languageName, lang, t } = useI18n();
  const fn = useServerFn(askFarmAssistant);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ask = useMutation({
    mutationFn: (next: Msg[]) => fn({ data: { language: languageName, messages: next.slice(-20) } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.text }]),
    onError: (e: Error) => toast.error(e.message || "Assistant unavailable"),
  });

  function send(text: string) {
    const clean = text.trim();
    if (!clean || ask.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    ask.mutate(next);
  }

  function toggleMic() {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return toast.error("Voice input isn't supported in this browser");
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = BCP47[lang];
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript as string;
      setInput(text);
      send(text);
    };
    rec.onerror = () => { setListening(false); toast.error("Couldn't hear that, try again"); };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = BCP47[lang];
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("nav.chat")}</h1>
        <p className="text-muted-foreground">Type or speak — answers come back in your language.</p>
      </div>

      <GlassCard className="flex h-[62vh] flex-col rounded-3xl p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="grid place-items-center py-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-leaf text-primary-foreground shadow-glow">
                <Bot className="h-7 w-7" />
              </div>
              <p className="mt-3 font-medium">Ask me anything about your farm</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-2xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
              >
                {m.role === "assistant" && (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-leaf text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-[80%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm ${
                  m.role === "user" ? "bg-gradient-hero text-primary-foreground" : "bg-muted"
                }`}>
                  {m.content}
                  {m.role === "assistant" && (
                    <button onClick={() => speak(m.content)} className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      {speaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />} {t("common.speak")}
                    </button>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {ask.isPending && (
            <div className="flex gap-1.5 pl-11">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-center gap-2 border-t border-border/60 p-4"
        >
          <Button
            type="button" variant={listening ? "default" : "outline"} size="icon"
            onClick={toggleMic}
            className={`shrink-0 rounded-2xl ${listening ? "bg-gradient-hero animate-pulse" : ""}`}
            aria-label="Voice input"
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("common.ask")}
            className="rounded-2xl"
          />
          <Button type="submit" disabled={ask.isPending} className="shrink-0 rounded-2xl bg-gradient-hero gap-2">
            <Send className="h-4 w-4" /> <span className="hidden sm:inline">{t("common.send")}</span>
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
