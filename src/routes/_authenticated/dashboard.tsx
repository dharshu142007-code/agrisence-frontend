import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  CloudSun, Cloud, CloudRain, Sun, Moon, ScanLine, ChevronRight,
  Thermometer, Droplets, Wind, ListTodo, Plus, Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/glass-card";
import { LoadingLeaf } from "@/components/loading-leaf";
import { getProfile, listTasks, createTask, toggleTask } from "@/lib/farm.functions";
import { getMyScans } from "@/lib/scan.functions";
import { getWeather } from "@/lib/weather.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CropGuard AI" },
      { name: "description", content: "Your farm overview, weather, and recent AI crop scans." },
    ],
  }),
  component: Dashboard,
});

const wCode = (c: number) => {
  if (c === 0) return { label: "Clear", Icon: Sun };
  if (c < 3) return { label: "Partly cloudy", Icon: CloudSun };
  if (c < 45) return { label: "Cloudy", Icon: Cloud };
  if (c < 70) return { label: "Foggy", Icon: Cloud };
  if (c < 80) return { label: "Rainy", Icon: CloudRain };
  return { label: "Stormy", Icon: CloudRain };
};

function severityColor(s: string | null | undefined) {
  switch (s) {
    case "healthy": return "bg-success/20 text-success";
    case "mild": return "bg-warning/20 text-warning";
    case "moderate": return "bg-orange-500/20 text-orange-600";
    case "severe": return "bg-destructive/20 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
}

function Dashboard() {
  const profileFn = useServerFn(getProfile);
  const scansFn = useServerFn(getMyScans);
  const tasksFn = useServerFn(listTasks);
  const weatherFn = useServerFn(getWeather);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const scans = useQuery({ queryKey: ["scans"], queryFn: () => scansFn() });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: () => tasksFn() });

  const coords = useMemo(() => ({
    lat: profile.data?.latitude ?? 28.6139,
    lng: profile.data?.longitude ?? 77.209,
  }), [profile.data]);

  const weather = useQuery({
    queryKey: ["weather", coords.lat, coords.lng],
    queryFn: () => weatherFn({ data: coords }),
  });

  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 19;
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = profile.data?.full_name?.split(" ")[0] || "Farmer";

  // Crop health score derived from recent scans
  const health = useMemo(() => {
    if (!scans.data?.length) return null;
    const recent = scans.data.slice(0, 10);
    const map = { healthy: 100, mild: 75, moderate: 45, severe: 15 } as const;
    const sum = recent.reduce(
      (a, s) => a + (map[(s.severity ?? "healthy") as keyof typeof map] ?? 60),
      0,
    );
    return Math.round(sum / recent.length);
  }, [scans.data]);

  return (
    <div className="grid gap-6">
      {/* Greeting */}
      <GlassCard className="relative flex flex-col gap-4 overflow-hidden rounded-3xl md:flex-row md:items-center md:justify-between">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isDay ? <Sun className="h-4 w-4 text-[color:var(--color-sun)]" /> : <Moon className="h-4 w-4" />}
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">
            {greeting}, <span className="text-gradient-hero">{name}</span>
          </h1>
          <p className="text-muted-foreground">
            {profile.data?.farm_name ? `${profile.data.farm_name} • ` : ""}Let's check on your crops.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-2xl bg-gradient-hero shadow-elevated">
          <Link to="/scan">
            <ScanLine className="mr-2 h-5 w-5" /> Scan a crop
          </Link>
        </Button>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-leaf opacity-30 blur-3xl" />
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weather */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Weather</h2>
            <span className="text-xs text-muted-foreground">
              {profile.data?.location || "Default location"}
            </span>
          </div>
          {weather.isLoading || !weather.data ? (
            <div className="grid place-items-center py-8"><LoadingLeaf /></div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {(() => {
                  const { Icon, label } = wCode(weather.data.current.weather_code);
                  return (
                    <>
                      <Icon className="h-14 w-14 text-primary" />
                      <div>
                        <p className="text-4xl font-bold">
                          {Math.round(weather.data.current.temperature_2m)}°
                          <span className="text-xl text-muted-foreground">C</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{label}</p>
                      </div>
                    </>
                  );
                })()}
                <div className="ml-auto grid grid-cols-3 gap-4 text-sm">
                  <Stat icon={Droplets} label="Humidity" value={`${weather.data.current.relative_humidity_2m}%`} />
                  <Stat icon={CloudRain} label="Rain" value={`${weather.data.current.precipitation} mm`} />
                  <Stat icon={Wind} label="Wind" value={`${Math.round(weather.data.current.wind_speed_10m)} km/h`} />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-5 gap-2">
                {weather.data.daily.time.map((day, i) => {
                  const { Icon } = wCode(weather.data.daily.weather_code[i]);
                  return (
                    <div key={day} className="rounded-2xl bg-accent/50 p-3 text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">
                        {new Date(day).toLocaleDateString(undefined, { weekday: "short" })}
                      </p>
                      <Icon className="mx-auto my-1 h-5 w-5 text-primary" />
                      <p className="text-xs font-semibold">
                        {Math.round(weather.data.daily.temperature_2m_max[i])}°
                        <span className="text-muted-foreground">/{Math.round(weather.data.daily.temperature_2m_min[i])}°</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </GlassCard>

        {/* Crop health gauge */}
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Crop health</h2>
          <HealthGauge value={health} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {health === null
              ? "Scan a crop to see your health score."
              : health > 85
              ? "Your crops are thriving."
              : health > 60
              ? "Mild issues detected — check recent scans."
              : "Attention needed — review disease alerts."}
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent scans */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Recent scans
            </h2>
            <Button asChild variant="ghost" size="sm" className="rounded-xl">
              <Link to="/scan">New scan <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          {!scans.data?.length ? (
            <EmptyState
              title="No scans yet"
              desc="Upload a leaf photo to get an instant AI diagnosis."
              cta={<Button asChild className="rounded-2xl bg-gradient-hero"><Link to="/scan">Scan now</Link></Button>}
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {scans.data.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/scan/${s.id}`}
                    className="flex items-center gap-3 py-3 hover:bg-accent/30 rounded-xl px-2 -mx-2"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-leaf text-primary-foreground">
                      <ScanLine className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{s.disease || "Unknown"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.crop || "Crop"} · {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColor(s.severity)}`}>
                      {s.severity || "n/a"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {/* Tasks */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" /> Tasks
            </h2>
          </div>
          <TasksList tasks={tasks.data ?? []} />
        </GlassCard>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-accent/40 p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-1 text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function HealthGauge({ value }: { value: number | null }) {
  const pct = value ?? 0;
  const radius = 70;
  const c = 2 * Math.PI * radius;
  const off = c - (pct / 100) * c;
  return (
    <div className="relative mx-auto grid h-48 w-48 place-items-center">
      <svg width={180} height={180} viewBox="0 0 180 180" className="-rotate-90">
        <circle cx="90" cy="90" r={radius} stroke="var(--color-muted)" strokeWidth="12" fill="none" />
        <motion.circle
          cx="90" cy="90" r={radius}
          stroke="url(#gaugeGrad)" strokeWidth="12" fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: value === null ? c : off }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-glow)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-bold">{value === null ? "—" : value}</p>
        <p className="text-xs text-muted-foreground">out of 100</p>
      </div>
    </div>
  );
}

function EmptyState({ title, desc, cta }: { title: string; desc: string; cta?: React.ReactNode }) {
  return (
    <div className="grid place-items-center py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-leaf text-primary-foreground">
        <ScanLine className="h-6 w-6" />
      </div>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{desc}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

type Task = { id: string; title: string; done: boolean; due_date: string | null };
function TasksList({ tasks }: { tasks: Task[] }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const createFn = useServerFn(createTask);
  const toggleFn = useServerFn(toggleTask);

  const add = useMutation({
    mutationFn: (t: string) => createFn({ data: { title: t } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); setTitle(""); },
  });
  const toggle = useMutation({
    mutationFn: (v: { id: string; done: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return (
    <div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (title.trim()) add.mutate(title.trim()); }}
        className="flex gap-2 mb-3"
      >
        <Input
          value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Add task..." className="rounded-xl"
        />
        <Button type="submit" size="icon" className="rounded-xl shrink-0"><Plus className="h-4 w-4" /></Button>
      </form>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No tasks yet.</p>
      ) : (
        <ul className="space-y-1">
          {tasks.slice(0, 8).map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-accent/40">
              <input
                type="checkbox" checked={t.done}
                onChange={(e) => toggle.mutate({ id: t.id, done: e.target.checked })}
                className="h-4 w-4 accent-[color:var(--color-primary)]"
              />
              <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>
                {t.title}
              </span>
              {t.due_date && <span className="text-xs text-muted-foreground">{t.due_date}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
