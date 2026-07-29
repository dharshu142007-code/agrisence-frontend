
# CropGuard AI — Phase 1 Build Plan

Scope for this pass: **premium agriculture design system + landing page + full auth + farmer dashboard + AI disease detection**. Marketplace, expert consults, admin panel, chatbot, yield prediction, government schemes, etc. are deferred to future turns.

## 1. Design system

Set up an agriculture-inspired token system in `src/styles.css` (oklch conversions of the requested palette):

- `--primary` Leaf Green `#2E7D32`
- `--primary-glow` Light Green `#81C784`
- `--earth` Earth Brown `#8D6E63`
- `--sky` Sky Blue `#4FC3F7`
- Gradients: `--gradient-hero` (green→sky), `--gradient-field` (green→earth), soft glass tokens
- Radii bumped to 18–24px (`--radius: 1.25rem`)
- Shadows: `--shadow-glass`, `--shadow-elevated` (soft green-tinted)
- Full light + dark mode variables
- Poppins via `<link>` in `__root.tsx` head, wired into `font-sans`

Reusable primitives:
- `GlassCard` — glassmorphism wrapper (backdrop-blur, soft border, rounded-3xl)
- `AnimatedButton` — Framer Motion hover/tap ripple, variants: primary, secondary, ghost
- `Section` layout with parallax background slot
- `Leaves` / `Pollen` / `Clouds` — SVG particle layers using Framer Motion, react to mouse
- `DayNightBackdrop` — computes local time, cross-fades sky gradient + sun/moon
- `LoadingLeaf` — organic sprouting SVG spinner (no default spinners)

## 2. Routing (TanStack Start)

```text
src/routes/
  __root.tsx                      global shell, fonts, meta, auth listener
  index.tsx                       landing page (public)
  auth.tsx                        login / register / OTP / forgot flow (public)
  _authenticated/
    route.tsx                     integration-managed gate (ssr:false)
    dashboard.tsx                 farmer dashboard
    scan.tsx                      AI disease detection
    scan.$scanId.tsx              scan result detail + treatment plan
```

Landing page redirects "Get Started" → `/auth`; authenticated users get a "Go to dashboard" CTA in the header instead.

## 3. Landing page (`/`)

Sections:
1. **Hero** — headline "Protect Your Crops with AI", animated subtitle typing, primary "Get Started" + secondary "Watch Demo" buttons, animated SVG/PNG plant "3D-feel" illustration with mouse-tilt parallax (CSS transform + Framer Motion — no Three.js this phase), floating leaves reacting to cursor, drifting clouds, sun that shifts by local time.
2. **Stats strip** — Diseases detected, Farmers helped, Accuracy %, Crops supported (count-up animation).
3. **Feature cards** — 6 glass cards (Disease Detection, Weather Intelligence, Pest ID, Smart Irrigation, Yield Prediction, Expert Advice). Hover lift + gradient border.
4. **How it works** — 3-step animated timeline (Scan → Analyze → Treat).
5. **Testimonials** — carousel of 3 farmer quotes with photos.
6. **FAQ** — accordion, 6 items.
7. **Footer** — agriculture-themed with leaf motif, links, socials, language selector (UI only this phase, English default).

SEO: per-route `head()` with proper title/description/OG.

## 4. Auth (`/auth`)

Single route with tabbed UI: Sign in / Sign up / Forgot password. Framer Motion tab transitions.

Enable **Lovable Cloud** and wire real auth:
- Email + password (Supabase auth via generated `@/integrations/supabase/client`)
- Google sign-in via `lovable.auth.signInWithOAuth("google")` (managed)
- Forgot password → `resetPasswordForEmail` with `redirectTo: origin + "/reset-password"`
- `/reset-password` public route for setting new password
- Success/error inline states with Framer Motion + toast (sonner)

Ask user about profile fields on first turn of build (name, farm name, location) → create `profiles` table with trigger. RLS: users read/update own profile only.

## 5. Farmer dashboard (`/dashboard`)

Grid of glass cards over a subtle parallax farmland background (SVG layers):

- **Greeting card**: "Good morning, {name}" with time-based sun/moon icon, current date, farm name.
- **Weather widget**: current temp, condition, 5-day forecast. Uses **Open-Meteo** (free, no API key) via a `createServerFn`, geolocated from profile lat/lng (fallback to a default region until location captured).
- **Crop health score** — animated radial gauge (0–100), derived from last N scans in DB.
- **Recent scans** — last 5 from `scans` table, thumbnail + disease + severity chip.
- **Disease alerts** — cards tied to recent unhealthy scans.
- **AI recommendations** — generated on demand by AI Gateway based on recent scans + weather (openai/gpt-5.5).
- **Upcoming tasks** — simple `tasks` table, checkbox complete.
- **Quick action**: prominent "Scan a crop" button → `/scan`.

## 6. AI disease detection (`/scan`)

Flow on one page:
1. **Upload** — drag-and-drop zone, "Take photo" (opens camera via `<input capture>`), or "Choose file". Preview with remove.
2. **Analyze** — animated laser-scan overlay + progress bar + organic leaf spinner. Calls a `createServerFn` that:
   - Uploads image to Supabase Storage (`scans` bucket, private, RLS by owner).
   - Calls Lovable AI Gateway `openai/gpt-5.5` (vision) with structured output (Zod schema): `{ crop, disease, confidence, severity, affectedParts[], healthStatus, description }`.
   - Also generates a treatment plan in the same or a chained call: `{ chemicals[], organic[], fertilizers[], prevention[], safety[], costEstimateINR, schedule[] }`.
   - Inserts a `scans` row and returns the record.
3. **Result view** — `/scan/$scanId` renders the diagnosis card (disease, confidence gauge, severity chip, health status pill, affected parts list) + treatment plan tabs (Chemical / Organic / Fertilizer / Prevention / Safety) + cost + schedule timeline. Plant-growth success animation on healthy result; laser + warning pulse on disease.

## 7. Database (Lovable Cloud)

Migration in one shot:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  farm_name text,
  location text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now()
);

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null,
  crop text,
  disease text,
  confidence numeric,
  severity text,           -- healthy | mild | moderate | severe
  health_status text,
  affected_parts text[],
  description text,
  treatment jsonb,         -- full plan object
  created_at timestamptz default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date,
  done boolean default false,
  created_at timestamptz default now()
);
```

GRANTs to `authenticated` + `service_role`; RLS enabled; per-table policies `user_id = auth.uid()` for all CRUD. Storage bucket `scans` (private) with owner-only RLS. Trigger `handle_new_user` inserts a `profiles` row on signup.

## 8. Server functions

`src/lib/*.functions.ts`:
- `getWeather({ lat, lng })` — Open-Meteo fetch (public, no key).
- `analyzeCropImage({ imagePath })` — auth-required; downloads signed URL, calls AI Gateway with `openai/gpt-5.5` + structured output; writes `scans` row.
- `generateRecommendations()` — auth-required; pulls last 5 scans + weather; asks model for 3 short tips.
- `getMyScans`, `getScan`, `listTasks`, `toggleTask`, `updateProfile` — auth-required CRUD.

All use `requireSupabaseAuth` middleware. `LOVABLE_API_KEY` provisioned via `ai_gateway--create`.

## 9. Accessibility & performance

- Semantic HTML, one H1 per route.
- All buttons ≥44px tap target, focus rings via `--ring`.
- `prefers-reduced-motion` disables leaves/parallax.
- Images lazy-loaded, generated hero illustration served as optimized JPG through lovable-assets.
- Skeletons for dashboard cards.

## 10. Deferred (explicitly out of scope this turn)

Marketplace, payments, expert video/audio consultation, government schemes, PWA/offline, chatbot with voice, admin panel, multi-language runtime switching, Three.js 3D crop model, admin analytics — will be planned in follow-up turns after this foundation lands.

## Technical notes

- Stack: TanStack Start + React 19 + Tailwind v4 + shadcn + Framer Motion + Lovable Cloud + Lovable AI Gateway.
- All 3D-feel effects via CSS transforms + SVG + Framer Motion; no Three.js.
- Weather: Open-Meteo, no secret needed.
- Vision AI: `openai/gpt-5.5` through AI Gateway with structured output (`Output.object` + Zod, `structuredOutputs: true` on provider).
- Realistic seed data: none — dashboard reads real user rows; empty states guide the user to make their first scan.
