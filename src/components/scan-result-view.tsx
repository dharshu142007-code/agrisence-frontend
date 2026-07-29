import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  Sparkles, Leaf, ShieldCheck, AlertTriangle, Beaker, FlaskConical, Bug,
  Sprout, ThermometerSun, Droplets, Sun, CalendarDays, Ruler,
} from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { LoadingLeaf } from "@/components/loading-leaf";
import { useI18n } from "@/lib/i18n";
import { getPlantInfo } from "@/lib/ai.functions";

export type Treatment = {
  chemicals: string[]; organic: string[]; fertilizers: string[];
  prevention: string[]; safety: string[]; costEstimateINR: string; schedule: string[];
};

export type ScanRow = {
  crop: string | null;
  disease: string | null;
  confidence: number | null;
  severity: string | null;
  health_status: string | null;
  affected_parts: string[] | null;
  description: string | null;
  treatment: unknown;
};

const tabs = [
  { id: "organic", label: "Organic", icon: Leaf, key: "organic" as const },
  { id: "chemical", label: "Chemical", icon: FlaskConical, key: "chemicals" as const },
  { id: "fertilizer", label: "Fertilizer", icon: Beaker, key: "fertilizers" as const },
  { id: "prevention", label: "Prevention", icon: ShieldCheck, key: "prevention" as const },
  { id: "safety", label: "Safety", icon: AlertTriangle, key: "safety" as const },
];

function severityBadge(s: string | null | undefined) {
  const map: Record<string, string> = {
    healthy: "bg-success/20 text-success",
    mild: "bg-warning/20 text-warning",
    moderate: "bg-orange-500/20 text-orange-600",
    severe: "bg-destructive/20 text-destructive",
  };
  return map[s ?? ""] ?? "bg-muted text-muted-foreground";
}

export function ScanResultView({ scan: s, imageUrl }: { scan: ScanRow; imageUrl?: string | null }) {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("organic");
  const t = (s.treatment ?? {}) as Treatment;
  const confidence = Math.round((Number(s.confidence) || 0) * (Number(s.confidence) > 1 ? 1 : 100));
  const activeTab = tabs.find((x) => x.id === tab)!;
  const items: string[] = ((t as any)[activeTab.key] as string[]) ?? [];
  const healthy = s.severity === "healthy";

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3 rounded-3xl overflow-hidden p-0">
          <div className="relative">
            {imageUrl && (
              <img src={imageUrl} alt={`${s.crop} — ${s.disease}`} className="w-full h-72 object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
              <div className="text-white">
                <p className="text-xs uppercase tracking-widest opacity-80">{s.crop}</p>
                <h2 className="text-2xl md:text-3xl font-bold">{s.disease}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityBadge(s.severity)}`}>
                {s.severity}
              </span>
            </div>
          </div>
          <div className="p-6 grid gap-4">
            <div className="flex items-center gap-4">
              <ConfidenceGauge value={confidence} />
              <div>
                <p className="text-xs uppercase text-muted-foreground">Health status</p>
                <p className="font-semibold">{s.health_status}</p>
              </div>
              {healthy && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                  className="ml-auto rounded-full bg-success/20 p-3"
                >
                  <Leaf className="h-6 w-6 text-success" />
                </motion.div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{s.description}</p>
            {s.affected_parts?.length ? (
              <div>
                <p className="text-xs uppercase text-muted-foreground mb-1">Affected parts</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.affected_parts.map((p: string) => (
                    <span key={p} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium">{p}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2 rounded-3xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Treatment plan</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  tab === tb.id
                    ? "bg-gradient-hero text-primary-foreground shadow-glow"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <tb.icon className="h-3.5 w-3.5" />
                {tb.label}
              </button>
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {items.length === 0 && <li className="text-sm text-muted-foreground">No items.</li>}
            {items.map((it, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 rounded-xl bg-accent/40 p-3 text-sm"
              >
                <Bug className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{it}</span>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard>
          <h3 className="font-semibold mb-2">Cost estimate</h3>
          <p className="text-2xl font-bold text-gradient-hero">{t.costEstimateINR || "—"}</p>
          <p className="text-xs text-muted-foreground">Approximate — varies by supplier & region.</p>
        </GlassCard>
        <GlassCard>
          <h3 className="font-semibold mb-2">Treatment schedule</h3>
          {t.schedule?.length ? (
            <ol className="relative ml-2 space-y-3 border-l border-primary/40 pl-4">
              {t.schedule.map((st, i) => (
                <li key={i} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  {st}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">No schedule provided.</p>
          )}
        </GlassCard>
      </div>

      <PlantDetails crop={s.crop ?? ""} />
    </div>
  );
}

function PlantDetails({ crop }: { crop: string }) {
  const { languageName } = useI18n();
  const infoFn = useServerFn(getPlantInfo);
  const q = useQuery({
    queryKey: ["plant-info", crop, languageName],
    queryFn: () => infoFn({ data: { crop, language: languageName } }),
    enabled: !!crop && crop.toLowerCase() !== "unknown",
    staleTime: 1000 * 60 * 60,
  });

  if (!crop || crop.toLowerCase() === "unknown") return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-success/5 to-sky/10 p-6 md:p-8">
      <Sprout className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-primary/10" />
      <Leaf className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rotate-12 text-success/10" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-leaf text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">About this plant</h2>
            <p className="text-xs text-muted-foreground">Botanical profile & growing guide</p>
          </div>
        </div>

        {q.isLoading && (
          <div className="grid place-items-center py-10"><LoadingLeaf size={48} /></div>
        )}

        {q.data && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mt-5 grid gap-5"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-2xl font-bold text-gradient-hero">{q.data.commonName}</h3>
              <span className="italic text-sm text-muted-foreground">{q.data.scientificName}</span>
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                {q.data.family}
              </span>
              <span className="rounded-full bg-earth/15 px-2.5 py-0.5 text-xs font-medium">{q.data.type}</span>
            </div>

            {q.data.overview && <p className="text-sm text-muted-foreground max-w-3xl">{q.data.overview}</p>}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Fact icon={Sprout} label="Ideal soil" value={q.data.idealSoil} />
              <Fact icon={ThermometerSun} label="Climate" value={q.data.climate} />
              <Fact icon={Droplets} label="Water needs" value={q.data.waterNeeds} />
              <Fact icon={Sun} label="Sunlight" value={q.data.sunlight} />
              <Fact icon={CalendarDays} label="Growth duration" value={q.data.growthDuration} />
              <Fact icon={Ruler} label="Spacing" value={q.data.spacing} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Chips title="Harvest season" icon={CalendarDays} items={[q.data.harvestSeason]} />
              <Chips title="Companion plants" icon={Leaf} items={q.data.companionPlants} />
              <Chips title="Nutrition needs" icon={Beaker} items={q.data.nutrition} />
              <Chips title="Common pests" icon={Bug} items={q.data.commonPests} />
            </div>

            {q.data.careTips?.length > 0 && (
              <div className="rounded-2xl border border-success/25 bg-success/5 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-success">
                  <ShieldCheck className="h-4 w-4" /> Care tips
                </p>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {q.data.careTips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function Fact({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-background/50 p-3 backdrop-blur">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Chips({ title, icon: Icon, items }: { title: string; icon: any; items: string[] }) {
  const list = (items ?? []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {list.map((it, i) => (
          <span key={i} className="rounded-full border border-primary/20 bg-background/60 px-2.5 py-1 text-xs">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function ConfidenceGauge({ value }: { value: number }) {
  const c = 2 * Math.PI * 34;
  const off = c - (value / 100) * c;
  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r="34" stroke="var(--color-muted)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="48" cy="48" r="34" stroke="var(--color-primary)" strokeWidth="8" fill="none"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1 }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-bold">{value}%</p>
        <p className="text-[10px] uppercase text-muted-foreground">Conf.</p>
      </div>
    </div>
  );
}
