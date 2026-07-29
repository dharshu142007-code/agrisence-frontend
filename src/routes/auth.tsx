import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Leaf, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/glass-card";
import { ParticleField } from "@/components/particle-field";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — CropGuard AI" },
      { name: "description", content: "Sign in or create an account to start scanning your crops." },
      { property: "og:title", content: "Sign in — CropGuard AI" },
      { property: "og:description", content: "Access your farm dashboard and AI scans." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

export function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const nav = useNavigate();
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [farmName, setFarmName] = useState("");

  const callbackUrl = import.meta.env.VITE_GOOGLE_CALLBACK_URL;

  const go = () => nav({ to: search.redirect ?? "/dashboard", replace: true });

  const resolvedCallbackUrl = callbackUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/auth/google/callback` : undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("access_token") && !params.has("refresh_token") && window.location.hash.startsWith("#")) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      for (const [key, value] of hashParams.entries()) {
        if (!params.has(key)) params.set(key, value);
      }
    }

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const error = params.get("error");
    const errorDescription = params.get("error_description") ?? params.get("error_description");

    if (!access_token && !refresh_token && !error) return;

    async function handleOAuthCallback() {
      setLoading(true);

      if (error) {
        toast.error(errorDescription || "Google sign-in failed.");
        setLoading(false);
        nav({ to: "/auth", replace: true });
        return;
      }

      if (!access_token || !refresh_token) {
        toast.error("Google sign-in did not return a valid session.");
        setLoading(false);
        nav({ to: "/auth", replace: true });
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        toast.error(friendly(sessionError.message));
        setLoading(false);
        nav({ to: "/auth", replace: true });
        return;
      }

      await qc.invalidateQueries({ queryKey: ["session"] });
      setLoading(false);
      toast.success("Signed in successfully!");
      go();
    }

    handleOAuthCallback();
  }, [go, nav, qc]);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return toast.error(friendly(error.message));
    }
    await qc.invalidateQueries({ queryKey: ["session"] });
    setLoading(false);
    toast.success("Welcome back!");
    go();
  }


  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName, farm_name: farmName },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(friendly(error.message));
    }
    await qc.invalidateQueries({ queryKey: ["session"] });
    setLoading(false);
    toast.success("Account created!");
    go();
  }


  async function forgot() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(friendly(error.message));
    toast.success("Check your inbox for a reset link.");
  }

  async function google() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: resolvedCallbackUrl,
    });
    if (result.error) {
      setLoading(false);
      return toast.error(result.error.message);
    }
    if (result.redirected) return; // browser is navigating to Google
    // Session is set — make sure cached session state refreshes, then continue.
    await qc.invalidateQueries({ queryKey: ["session"] });
    setLoading(false);
    toast.success("Welcome back!");
    go();
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-dawn">
      <ParticleField count={12} />
      <Link to="/" className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-leaf shadow-glow">
              <Leaf className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CropGuard AI</h1>
              <p className="text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Create your farm account"
                  : mode === "forgot"
                  ? "Reset your password"
                  : "Welcome back"}
              </p>
            </div>
          </div>
          <GlassCard className="rounded-3xl p-6">
            {mode !== "forgot" && (
              <div className="mb-4 flex rounded-2xl bg-muted p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`relative flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      mode === m ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {mode === m && (
                      <motion.div
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-xl bg-gradient-hero"
                      />
                    )}
                    <span className="relative">{m === "signin" ? "Sign in" : "Sign up"}</span>
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (mode === "signin") signIn();
                  else if (mode === "signup") signUp();
                  else forgot();
                }}
                className="space-y-3"
              >
                {mode === "signup" && (
                  <>
                    <Field id="name" label="Full name" icon={User}>
                      <Input
                        id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Farmer" className="rounded-xl"
                      />
                    </Field>
                    <Field id="farm" label="Farm name" icon={Leaf}>
                      <Input
                        id="farm" value={farmName} onChange={(e) => setFarmName(e.target.value)}
                        placeholder="Green Acres" className="rounded-xl"
                      />
                    </Field>
                  </>
                )}
                <Field id="email" label="Email" icon={Mail}>
                  <Input
                    id="email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@farm.com" className="rounded-xl"
                  />
                </Field>
                {mode !== "forgot" && (
                  <Field id="pw" label="Password" icon={Lock}>
                    <Input
                      id="pw" type="password" required minLength={8}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="8+ chars with a number & symbol" className="rounded-xl"
                    />
                  </Field>
                )}

                <Button
                  type="submit" disabled={loading}
                  className="mt-2 w-full rounded-2xl bg-gradient-hero shadow-elevated"
                >
                  {loading
                    ? "Please wait..."
                    : mode === "signin"
                    ? "Sign in"
                    : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
                </Button>
              </motion.form>
            </AnimatePresence>

            {mode !== "forgot" && (
              <>
                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  or continue with
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Button
                  type="button" variant="outline" onClick={google}
                  className="w-full rounded-2xl gap-2"
                >
                  <GoogleIcon /> Google
                </Button>
              </>
            )}

            <div className="mt-5 text-center text-xs text-muted-foreground">
              {mode === "signin" && (
                <button onClick={() => setMode("forgot")} className="underline hover:text-foreground">
                  Forgot password?
                </button>
              )}
              {mode === "forgot" && (
                <button onClick={() => setMode("signin")} className="underline hover:text-foreground">
                  Back to sign in
                </button>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  id, label, icon: Icon, children,
}: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <div className="[&_input]:pl-9">{children}</div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
