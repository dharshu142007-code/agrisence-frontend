import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WeatherInput = z.object({
  lat: z.number().default(28.6139),
  lng: z.number().default(77.209),
});

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => WeatherInput.parse(d ?? {}))
  .handler(async ({ data }) => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(data.lat));
    url.searchParams.set("longitude", String(data.lng));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
    );
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    );
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "5");
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Weather service unavailable");
    return (await res.json()) as {
      current: {
        temperature_2m: number;
        relative_humidity_2m: number;
        precipitation: number;
        weather_code: number;
        wind_speed_10m: number;
      };
      daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
      };
    };
  });
