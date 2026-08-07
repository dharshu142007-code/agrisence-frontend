# Frontend Environment Variables

Place client-side environment variables in a `.env` file for local development and in your deployment provider (Vercel) for production.

Required variables
- `VITE_SUPABASE_URL` — your Supabase project URL (if using Supabase auth)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable key
- `VITE_GOOGLE_CALLBACK_URL` — full callback URL used by Google OAuth, e.g. `https://<your-vercel-domain>/auth/google/callback`
- `VITE_SUPABASE_PROJECT_ID` — (optional) your Supabase project id

Optional / integration variables
- `LOVABLE_API_KEY` — if using Lovable cloud auth

Set variables in Vercel
1. Open your Vercel project → Settings → Environment Variables.
2. Add the keys (use Production and Preview as appropriate).
3. Redeploy the site after saving.

Notes
- Never commit your `.env` file to git. Add `.env` to `.gitignore`.
- Make sure the callback URL you register in Supabase (Auth → Redirect URLs) exactly matches `VITE_GOOGLE_CALLBACK_URL`.
