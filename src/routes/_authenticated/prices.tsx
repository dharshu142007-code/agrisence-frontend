import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/glass-card";
import { LoadingLeaf } from "@/components/loading-leaf";
import { getMarketPrices } from "@/lib/ai.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/prices")({
  head: () => ({
    meta: [
      { title: "Price & Market Updates — CropGuard AI" },
      { name: "description", content: "Indicative mandi prices and sell-or-hold guidance for your crops." },
      { property: "og:title", content: "Price & Market Updates — CropGuard AI" },
      { property: "og:description", content: "Track crop prices and weekly movement." },
    ],
  }),
  component: PricesPage,
});

function PricesPage() {
  const { languageName } = useI18n();
  const fn = useServerFn(getMarketPrices);
  const [state, setState] = useState("Maharashtra");

  const run = useMutation({
    mutationFn: () => fn({ data: { state, language: languageName } }),
    onError: (e: Error) => toast.error(e.message || "Could not load prices"),
  });

  useEffect(() => { run.mutate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Price & market updates</h1>
          <p className="text-muted-foreground">Indicative mandi rates with weekly movement and selling advice.</p>
        </div>
        <div className="flex gap-2">
          <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="w-40 rounded-xl" />
          <Button onClick={() => run.mutate()} disabled={run.isPending} className="rounded-2xl bg-gradient-hero gap-2">
            <RefreshCw className={`h-4 w-4 ${run.isPending ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {run.data?.updatedNote && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" /> {run.data.updatedNote}
        </p>
      )}

      {run.isPending ? (
        <div className="grid place-items-center py-20"><LoadingLeaf size={56} /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(run.data?.items ?? []).map((it, i) => {
            const up = it.changePercent >= 0;
            return (
              <motion.div key={it.commodity + i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard className="h-full rounded-3xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{it.commodity}</h3>
                      <p className="text-xs text-muted-foreground">{it.market}</p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${up ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {it.changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold">₹{it.modalPriceINR.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{it.unit}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{it.advice}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
