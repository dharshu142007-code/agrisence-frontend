import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Leaf, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/glass-card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — CropGuard AI" },
      { name: "description", content: "Set a new password for your CropGuard AI account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-gradient-dawn grid place-items-center p-4">
      <GlassCard className="w-full max-w-md rounded-3xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-leaf">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Set a new password</h1>
            <p className="text-xs text-muted-foreground">
              {ready ? "Almost done." : "Waiting for reset link..."}
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="np" className="text-xs">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="np" type="password" required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
          </div>
          <Button disabled={loading || !ready} type="submit" className="w-full rounded-2xl bg-gradient-hero">
            {loading ? "Saving..." : "Update password"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
