// Server-only Google Gemini AI provider.
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function createLovableAI(opts?: { structuredOutputs?: boolean }) {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const google = createGoogleGenerativeAI({
    apiKey: key,
  });

  return google;
}