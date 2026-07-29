import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CalendarDays, Droplets, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/glass-card";
import { LoadingLeaf } from "@/components/loading-leaf";
import { getCropCalendar } from "@/lib/ai.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Crop Care Calendar — CropGuard AI" },
      { name: "description", content: "A stage-by-stage care plan from sowing to harvest for your crop." },
      { property: "og:title", content: "Crop Care Calendar — CropGuard AI" },
      { property: "og:description", content: "Know exactly what to do each week of the season." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { languageName } = useI18n();
  const fn = useServerFn(getCropCalendar);
  const [crop, setCrop] = useState("Tomato");
  const [sowingMonth, setSowingMonth] = useState("July");
  const [location, setLocation] = useState("Karnataka, India");

  const run = useMutation({
    mutationFn: () => fn({ data: { crop, sowingMonth, location, language: languageName } }),
    onError: (e: Error) => toast.error(e.message || "Could not build calendar"),
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Crop care calendar</h1>
        <p className="text-muted-foreground">A stage-by-stage plan from land preparation to harvest.</p>
      </div>

      <GlassCard className="rounded-3xl">
        <form
          onSubmit={(e) => { e.preventDefault(); run.mutate(); }}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="crop" className="text-xs">Crop</Label>
            <Input id="crop" value={crop} onChange={(e) => setCrop(e.target.value)} className="rounded-xl" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sow" className="text-xs">Sowing month</Label>
            <Input id="sow" value={sowingMonth} onChange={(e) => setSowingMonth(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="loc" className="text-xs">Location</Label>
            <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl" />
          </div>
          <Button disabled={run.isPending} className="rounded-2xl bg-gradient-hero shadow-elevated">
            {run.isPending ? "Building..." : "Build calendar"}
          </Button>
        </form>
      </GlassCard>

      {run.isPending && <div className="grid place-items-center py-16"><LoadingLeaf size={56} /></div>}

      {run.data && run.data.weeks.length > 0 && (
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
          <div className="grid gap-4">
            {run.data.weeks.map((w, i) => (
              <motion.div key={w.period + i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="absolute -ml-[1.4rem] mt-5 h-3 w-3 rounded-full bg-primary shadow-glow" />
                <GlassCard className="rounded-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{w.period}</h3>
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-[11px] font-medium text-primary">{w.stage}</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {w.tasks.map((t) => <li key={t}>• {t}</li>)}
                  </ul>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <p className="flex items-start gap-1.5"><Droplets className="mt-0.5 h-3.5 w-3.5 text-sky" /> {w.inputs}</p>
                    <p className="flex items-start gap-1.5"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-earth" /> {w.watchOut}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
