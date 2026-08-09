import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Upload, X, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";
import { LoadingLeaf } from "@/components/loading-leaf";
import { ScanResultView, type ScanRow } from "@/components/scan-result-view";
import { supabase } from "@/integrations/supabase/client";
import { analyzeCropImage } from "@/lib/scan.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/scan")({
  head: () => ({
    meta: [
      { title: "AI Crop Scan — CropGuard AI" },
      { name: "description", content: "Upload a photo of any tree, plant, stem, leaf, fruit or vegetable for instant diagnosis." },
    ],
  }),
  component: Scan,
});

function Scan() {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [result, setResult] = useState<(ScanRow & { id: string }) | null>(null);
  const analyzeFn = useServerFn(analyzeCropImage);
  const { languageName } = useI18n();

  const analyze = useMutation({
    mutationFn: async (f: File) => {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) throw new Error("Not signed in");
      const ext = f.name.split(".").pop() || "jpg";
      const path = `${sess.user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("scans")
        .upload(path, f, { contentType: f.type, upsert: false });
      if (upErr) throw upErr;
      return analyzeFn({ data: { imagePath: path, language: languageName } });
    },
    onSuccess: (row) => {
      toast.success("Diagnosis ready");
      setResult(row as any);
      requestAnimationFrame(() =>
        document.getElementById("scan-result")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    },
    onError: (e: Error) => toast.error(e.message || "Analysis failed"),
  });


  function pick(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (f.size > 8 * 1024 * 1024) return toast.error("Image too large (max 8MB)");
    setResult(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));

  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">AI crop scan</h1>
        <p className="text-muted-foreground">Photograph any plantation — tree, stem, branch, root, leaf, flower, fruit or vegetable plant.</p>
      </div>

      <GlassCard className="rounded-3xl">
        {!preview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault(); setDrag(false);
              pick(e.dataTransfer.files?.[0] ?? null);
            }}
            className={`grid place-items-center rounded-3xl border-2 border-dashed p-12 transition ${
              drag ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-leaf shadow-glow">
              <ScanLine className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="mt-4 text-lg font-semibold">Drop a plant photo here</p>
            <p className="text-sm text-muted-foreground">or use one of the options below</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => inputRef.current?.click()} className="rounded-2xl bg-gradient-hero gap-2">
                <Upload className="h-4 w-4" /> Choose file
              </Button>
              <Button onClick={() => cameraRef.current?.click()} variant="outline" className="rounded-2xl gap-2">
                <Camera className="h-4 w-4" /> Take photo
              </Button>
            </div>
            <input
              ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
            <input
              ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl">
              <img src={preview} alt="Selected crop leaf preview" className="w-full h-full object-cover" />
              <AnimatePresence>
                {analyze.isPending && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  >
                    <motion.div
                      className="absolute inset-x-0 h-1"
                      style={{ background: "linear-gradient(90deg, transparent, var(--color-primary-glow), transparent)" }}
                      animate={{ y: [0, 400, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="absolute inset-0 grid place-items-center text-white">
                      <div className="text-center">
                        <LoadingLeaf size={64} />
                        <p className="mt-3 font-medium">Analyzing your crop...</p>
                        <p className="text-xs opacity-80">This can take 10–20 seconds</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!analyze.isPending && (
                <button
                  onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-col justify-center gap-4">
              <div>
                <h2 className="text-xl font-semibold">Ready to analyze</h2>
                <p className="text-sm text-muted-foreground">
                  Our AI will detect the crop, identify diseases, and generate a personalized treatment plan.
                </p>
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✓ Crop identification</li>
                <li>✓ Disease name + confidence</li>
                <li>✓ Severity & affected parts</li>
                <li>✓ Full treatment plan</li>
              </ul>
              <Button
                onClick={() => file && analyze.mutate(file)}
                disabled={analyze.isPending}
                size="lg"
                className="rounded-2xl bg-gradient-hero shadow-elevated"
              >
                {analyze.isPending ? "Analyzing..." : "Analyze crop"}
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {result && (
        <motion.div
          id="scan-result"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Diagnosis & plant details</h2>
            <Button asChild variant="outline" size="sm" className="rounded-2xl">
              <Link to="/scan">Open full report</Link>
            </Button>
          </div>
          <ScanResultView scan={result} imageUrl={preview} />
        </motion.div>
      )}
    </div>

  );
}
