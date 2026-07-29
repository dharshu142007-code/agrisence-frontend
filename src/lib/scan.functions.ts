import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAI } from "./ai-gateway.server";

const AnalyzeInput = z.object({
  imagePath: z.string().min(1),
  language: z.string().default("English"),
});


const TreatmentSchema = z.object({
  chemicals: z.array(z.string()),
  organic: z.array(z.string()),
  fertilizers: z.array(z.string()),
  prevention: z.array(z.string()),
  safety: z.array(z.string()),
  costEstimateINR: z.string(),
  schedule: z.array(z.string()),
});

const DiagnosisSchema = z.object({
  crop: z.string(),
  disease: z.string(),
  confidence: z.number(),
  severity: z.enum(["healthy", "mild", "moderate", "severe"]),
  healthStatus: z.string(),
  affectedParts: z.array(z.string()),
  description: z.string(),
  treatment: TreatmentSchema,
});

export const analyzeCropImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AnalyzeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Get a temporary signed URL so the model can fetch the private image
    const { data: signed, error: signedErr } = await supabase.storage
      .from("scans")
      .createSignedUrl(data.imagePath, 60 * 10);
    if (signedErr || !signed?.signedUrl) {
      throw new Error("Could not read uploaded image");
    }

    const gateway = createLovableAI({ structuredOutputs: true });
    const model = gateway("openai/gpt-5.5");

    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: DiagnosisSchema }),
        instructions:
          "You are an expert agricultural plant pathologist and horticulturist. You can analyze ANY plantation material: whole trees, orchard and plantation crops, vegetable and fruit plants, saplings, stems, trunks, bark, branches, roots, leaves, flowers and fruits. Identify the plant/crop, then diagnose diseases, nutrient deficiencies, pest damage or physiological disorders visible on the part shown, and return a result strictly matching the schema. If the plant looks healthy, set severity to healthy, disease to 'None', and provide preventive advice as treatment. If the photo is not plant material at all, set crop to 'Unknown', disease to 'Not a plant image' and explain in description. Keep all arrays to 3-5 concise items. costEstimateINR is a short human string like '₹300 - ₹600 per acre'. " +
          `Write every human-readable value (disease, healthStatus, affectedParts, description and all treatment text) in ${data.language}.`,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Diagnose this plantation photo (it may show a tree, stem, branch, root, leaf, flower, fruit or vegetable plant) and provide a full treatment plan.",
              },
              { type: "image", image: new URL(signed.signedUrl) },
            ],
          },
        ],
      });


      const { data: row, error } = await supabase
        .from("scans")
        .insert({
          user_id: userId,
          image_path: data.imagePath,
          crop: output.crop,
          disease: output.disease,
          confidence: output.confidence,
          severity: output.severity,
          health_status: output.healthStatus,
          affected_parts: output.affectedParts,
          description: output.description,
          treatment: output.treatment,
        })
        .select()
        .single();
      if (error) throw error;
      return row;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        throw new Error("The AI response could not be parsed. Please try again with a clearer photo.");
      }
      throw err;
    }
  });

export const getMyScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  });

export const getScan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("scans")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Scan not found");
    // Sign the image URL for display
    const { data: signed } = await context.supabase.storage
      .from("scans")
      .createSignedUrl(row.image_path, 60 * 30);
    return { ...row, imageUrl: signed?.signedUrl ?? null };
  });

export const getScanImageUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ path: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage
      .from("scans")
      .createSignedUrl(data.path, 60 * 30);
    if (error) throw error;
    return { url: signed.signedUrl };
  });
