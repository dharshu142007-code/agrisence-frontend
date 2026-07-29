import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Landmark, CalendarClock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/glass-card";
import { LoadingLeaf } from "@/components/loading-leaf";
import { getSchemes } from "@/lib/ai.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/schemes")({
  head: () => ({
    meta: [
      { title: "Government Scheme Alerts — CropGuard AI" },
      { name: "description", content: "Subsidies, insurance and government schemes relevant to your farm." },
      { property: "og:title", content: "Government Scheme Alerts — CropGuard AI" },
      { property: "og:description", content: "Find schemes, benefits, eligibility and how to apply." },
    ],
  }),
  component: SchemesPage,
});

function SchemesPage() {
  const { languageName } = useI18n();
  const fn = useServerFn(getSchemes);
  const [state, setState] = useState("Punjab");
  const [crop, setCrop] = useState("Wheat");

  const run = useMutation({
    mutationFn: () => fn({ data: { state, crop, language: languageName } }),
    onError: (e: Error) => toast.error(e.message || "Could not load schemes"),
  });

  useEffect(() => { run.mutate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Government scheme alerts</h1>
          <p className="text-muted-foreground">Subsidies, insurance and support programmes you may qualify for.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="w-36 rounded-xl" />
          <Input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="Crop" className="w-36 rounded-xl" />
          <Button onClick={() => run.mutate()} disabled={run.isPending} className="rounded-2xl bg-gradient-hero gap-2">
            <RefreshCw className={`h-4 w-4 ${run.isPending ? "animate-spin" : ""}`} /> Update
          </Button>
        </div>
      </div>

      {run.isPending ? (
        <div className="grid place-items-center py-20"><LoadingLeaf size={56} /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(run.data?.schemes ?? []).map((s, i) => (
            <motion.div key={s.name + i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="h-full rounded-3xl">
                <div className="mb-3 flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-leaf text-primary-foreground">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold leading-tight">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.authority}</p>
                  </div>
                </div>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">{s.category}</span>
                <p className="mt-3 text-sm">{s.benefit}</p>
                <p className="mt-2 text-xs text-muted-foreground"><strong>Eligibility:</strong> {s.eligibility}</p>
                <p className="mt-1 text-xs text-muted-foreground"><strong>Apply:</strong> {s.howToApply}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-earth">
                  <CalendarClock className="h-3.5 w-3.5" /> {s.deadline}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
