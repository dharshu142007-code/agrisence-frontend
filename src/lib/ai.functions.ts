import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAI } from "./ai-gateway.server";

function langLine(language: string) {
  return ` Respond entirely in ${language}. Use Indian farming context, INR currency and metric units.`;
}

async function safeObject<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) return fallback;
    throw err;
  }
}

/* ---------------- Yield prediction ---------------- */

const YieldSchema = z.object({
  estimatedYield: z.string(),
  confidence: z.number(),
  revenueEstimateINR: z.string(),
  drivers: z.array(z.string()),
  risks: z.array(z.string()),
  actions: z.array(z.string()),
  monthlyOutlook: z.array(z.object({ label: z.string(), value: z.number() })),
});

export const predictYield = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        crop: z.string().min(1),
        areaAcres: z.number().positive(),
        soil: z.string().default("Loamy"),
        irrigation: z.string().default("Canal"),
        sowingMonth: z.string().default("June"),
        location: z.string().default("India"),
        language: z.string().default("English"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const gateway = createLovableAI({ structuredOutputs: true });
    return safeObject(
      async () => {
        const { output } = await generateText({
          model: gateway("openai/gpt-5.5"),
          output: Output.object({ schema: YieldSchema }),
          instructions:
            "You are an agronomy yield-forecasting expert. Estimate realistic yield for the given farm inputs. monthlyOutlook must contain 5-6 points of a growth/production index between 0 and 100. Keep arrays to 3-5 short items." +
            langLine(data.language),
          prompt: `Crop: ${data.crop}. Area: ${data.areaAcres} acres. Soil: ${data.soil}. Irrigation: ${data.irrigation}. Sowing month: ${data.sowingMonth}. Location: ${data.location}.`,
        });
        return output;
      },
      {
        estimatedYield: "—",
        confidence: 0,
        revenueEstimateINR: "—",
        drivers: [],
        risks: [],
        actions: [],
        monthlyOutlook: [],
      },
    );
  });

/* ---------------- Government schemes ---------------- */

const SchemesSchema = z.object({
  schemes: z.array(
    z.object({
      name: z.string(),
      authority: z.string(),
      benefit: z.string(),
      eligibility: z.string(),
      deadline: z.string(),
      howToApply: z.string(),
      category: z.string(),
    }),
  ),
});

export const getSchemes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        state: z.string().default("India"),
        crop: z.string().default("mixed crops"),
        language: z.string().default("English"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const gateway = createLovableAI({ structuredOutputs: true });
    return safeObject(
      async () => {
        const { output } = await generateText({
          model: gateway("openai/gpt-5.5"),
          output: Output.object({ schema: SchemesSchema }),
          instructions:
            "List 6 real, currently relevant Indian central or state government schemes, subsidies or insurance programmes for farmers. deadline may be a general window such as 'Rolling / kharif season'. Keep each field to one or two sentences." +
            langLine(data.language),
          prompt: `State: ${data.state}. Farmer grows: ${data.crop}.`,
        });
        return output;
      },
      { schemes: [] },
    );
  });

/* ---------------- Market prices ---------------- */

const PricesSchema = z.object({
  updatedNote: z.string(),
  items: z.array(
    z.object({
      commodity: z.string(),
      market: z.string(),
      modalPriceINR: z.number(),
      unit: z.string(),
      changePercent: z.number(),
      advice: z.string(),
    }),
  ),
});

export const getMarketPrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ state: z.string().default("India"), language: z.string().default("English") })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const gateway = createLovableAI({ structuredOutputs: true });
    return safeObject(
      async () => {
        const { output } = await generateText({
          model: gateway("openai/gpt-5.5"),
          output: Output.object({ schema: PricesSchema }),
          instructions:
            "Give 8 indicative mandi prices for common crops and vegetables. modalPriceINR is per quintal unless the unit says otherwise. changePercent is a week-on-week change between -15 and 15. updatedNote must state these are indicative estimates, not live mandi feeds. advice is one short sell/hold suggestion." +
            langLine(data.language),
          prompt: `State: ${data.state}.`,
        });
        return output;
      },
      { updatedNote: "", items: [] },
    );
  });

/* ---------------- Crop care calendar ---------------- */

const CalendarSchema = z.object({
  crop: z.string(),
  season: z.string(),
  weeks: z.array(
    z.object({
      period: z.string(),
      stage: z.string(),
      tasks: z.array(z.string()),
      inputs: z.string(),
      watchOut: z.string(),
    }),
  ),
});

export const getCropCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        crop: z.string().min(1),
        sowingMonth: z.string().default("June"),
        location: z.string().default("India"),
        language: z.string().default("English"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const gateway = createLovableAI({ structuredOutputs: true });
    return safeObject(
      async () => {
        const { output } = await generateText({
          model: gateway("openai/gpt-5.5"),
          output: Output.object({ schema: CalendarSchema }),
          instructions:
            "Build a crop care calendar with 6-8 periods from land preparation to harvest. Each period has 2-4 short tasks." +
            langLine(data.language),
          prompt: `Crop: ${data.crop}. Sowing month: ${data.sowingMonth}. Location: ${data.location}.`,
        });
        return output;
      },
      { crop: data.crop, season: "", weeks: [] },
    );
  });

/* ---------------- AI chatbot / voice assistant ---------------- */

export const askFarmAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        language: z.string().default("English"),
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }))
          .min(1)
          .max(30),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const gateway = createLovableAI();
    const { text } = await generateText({
      model: gateway("openai/gpt-5.5"),
      instructions:
        "You are CropGuard AI, a friendly farming assistant for Indian farmers. Answer questions about crops, diseases, pests, irrigation, fertilizers, weather, market prices and government schemes. Be practical and concise (under 150 words), use simple language and bullet points where helpful. If a question is outside farming, politely steer back." +
        langLine(data.language),
      messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return { text };
  });

/* ---------------- Plant profile / details ---------------- */

const PlantInfoSchema = z.object({
  commonName: z.string(),
  scientificName: z.string(),
  family: z.string(),
  type: z.string(),
  overview: z.string(),
  idealSoil: z.string(),
  climate: z.string(),
  waterNeeds: z.string(),
  sunlight: z.string(),
  growthDuration: z.string(),
  harvestSeason: z.string(),
  spacing: z.string(),
  nutrition: z.array(z.string()),
  companionPlants: z.array(z.string()),
  commonPests: z.array(z.string()),
  careTips: z.array(z.string()),
});

export const getPlantInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        crop: z.string().min(1),
        language: z.string().default("English"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const gateway = createLovableAI({ structuredOutputs: true });
    return safeObject(
      async () => {
        const { output } = await generateText({
          model: gateway("openai/gpt-5.5"),
          output: Output.object({ schema: PlantInfoSchema }),
          instructions:
            "You are a botanist and horticulturist. Give an accurate plant profile for the given crop/plant. overview is 2-3 sentences. Keep every other string field to one short sentence. Arrays hold 3-5 short items." +
            langLine(data.language),
          prompt: `Plant / crop: ${data.crop}.`,
        });
        return output;
      },
      {
        commonName: data.crop,
        scientificName: "—",
        family: "—",
        type: "—",
        overview: "",
        idealSoil: "—",
        climate: "—",
        waterNeeds: "—",
        sunlight: "—",
        growthDuration: "—",
        harvestSeason: "—",
        spacing: "—",
        nutrition: [],
        companionPlants: [],
        commonPests: [],
        careTips: [],
      },
    );
  });
