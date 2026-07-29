import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Sprout, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/glass-card";
import { LoadingLeaf } from "@/components/loading-leaf";
import { predictYield } from "@/lib/ai.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/yield")({
  head: () => ({
    meta: [
      { title: "Yield Prediction — CropGuard AI" },
      { name: "description", content: "AI-powered crop yield and revenue forecasting for your farm." },
      { property: "og:title", content: "Yield Prediction — CropGuard AI" },
      { property: "og:description", content: "Forecast yield, revenue and risks for your crop." },
    ],
  }),
  component: YieldPage,
});

function YieldPage() {
  const { languageName } = useI18n();
  const fn = useServerFn(predictYield);
  const [form, setForm] = useState({
    crop: "Wheat",
    areaAcres: "5",
    soil: "Loamy",
    irrigation: "Canal",
    sowingMonth: "November",
    location: "Punjab, India",
  });

  const run = useMutation({
    mutationFn: () =>
      fn({
        data: {
          crop: form.crop,
          areaAcres: Number(form.areaAcres) || 1,
          soil: form.soil,
          irrigation: form.irrigation,
          sowingMonth: form.sowingMonth,
          location: form.location,
          language: languageName,
        },
      }),
    onError: (e: Error) => toast.error(e.message || "Could not predict yield"),
  });

  const res = run.data;
  const max = Math.max(1, ...(res?.monthlyOutlook.map((m) => m.value) ?? [1]));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Yield prediction</h1>
        <p className="text-muted-foreground">Forecast production, revenue and risks before the season starts.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <GlassCard className="rounded-3xl">
          <form
            onSubmit={(e) => { e.preventDefault(); run.mutate(); }}
            className="grid gap-3"
          >
            {([
              ["crop", "Crop"], ["areaAcres", "Area (acres)"], ["soil", "Soil type"],
              ["irrigation", "Irrigation"], ["sowingMonth", "Sowing month"], ["location", "Location"],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-xs font-medium">{label}</Label>
                <Input
                  id={key}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="rounded-xl"
                  required
                />
              </div>
            ))}
            <Button disabled={run.isPending} className="mt-2 rounded-2xl bg-gradient-hero shadow-elevated">
              {run.isPending ? "Calculating..." : "Predict yield"}
            </Button>
          </form>
        </GlassCard>

        <GlassCard className="rounded-3xl">
          {run.isPending ? (
            <div className="grid place-items-center py-20 text-center">
              <LoadingLeaf size={56} />
              <p className="mt-3 text-sm text-muted-foreground">Running the yield model...</p>
            </div>
          ) : !res ? (
            <div className="grid place-items-center py-20 text-center text-muted-foreground">
              <Sprout className="h-10 w-10 text-primary" />
              <p className="mt-3 text-sm">Fill in your farm details to get a forecast.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Estimated yield" value={res.estimatedYield} />
                <Stat label="Revenue estimate" value={res.revenueEstimateINR} />
                <Stat label="Confidence" value={`${Math.round(res.confidence * (res.confidence <= 1 ? 100 : 1))}%`} />
              </div>

              {res.monthlyOutlook.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Growth outlook</h3>
                  <div className="flex h-40 items-end gap-3">
                    {res.monthlyOutlook.map((m, i) => (
                      <div key={m.label + i} className="flex flex-1 flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(m.value / max) * 100}%` }}
                          transition={{ delay: i * 0.06, type: "spring", stiffness: 90 }}
                          className="w-full rounded-t-xl bg-gradient-leaf"
                        />
                        <span className="text-[11px] text-muted-foreground">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <List icon={TrendingUp} title="Drivers" items={res.drivers} />
                <List icon={AlertTriangle} title="Risks" items={res.risks} />
                <List icon={CheckCircle2} title="Actions" items={res.actions} />
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function List({
  icon: Icon, title, items,
}: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h4>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((i) => <li key={i}>• {i}</li>)}
      </ul>
    </div>
  );
}
