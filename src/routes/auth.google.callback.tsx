import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "./auth";

export const Route = createFileRoute("/auth/google/callback")({
  head: () => ({
    meta: [
      { title: "Sign in — CropGuard AI" },
      { name: "description", content: "Complete Google sign-in for CropGuard AI." },
    ],
  }),
  component: AuthPage,
});
