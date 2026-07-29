// Server-only Lovable AI Gateway provider.
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAI(opts?: { structuredOutputs?: boolean }) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: opts?.structuredOutputs ?? false,
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}
