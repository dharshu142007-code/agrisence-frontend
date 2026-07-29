import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageGate() {
  const { chosen, setLang, t } = useI18n();
  return (
    <AnimatePresence>
      {!chosen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-background/80 p-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl border border-border/60 bg-card/90 p-6 shadow-elevated"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-leaf text-primary-foreground shadow-glow">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t("lang.title")}</h2>
                <p className="text-sm text-muted-foreground">{t("lang.subtitle")}</p>
              </div>
            </div>
            <div className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {LANGUAGES.map((l) => (
                <Button
                  key={l.code}
                  variant="outline"
                  onClick={() => setLang(l.code)}
                  className="h-auto flex-col items-start rounded-2xl py-3 hover:border-primary"
                >
                  <span className="text-base font-semibold">{l.label}</span>
                  <span className="text-xs text-muted-foreground">{l.english}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-2xl gap-2" aria-label={t("lang.change")}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{current?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto rounded-2xl">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className="gap-2">
            <span className="flex-1">{l.label}</span>
            <span className="text-xs text-muted-foreground">{l.english}</span>
            {l.code === lang && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
