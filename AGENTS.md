# Nomi architecture rules

- Nomi is a React SPA mounted through the TanStack Start shell; add UI pages under `src/nomi/pages` and wire them in `src/App.tsx` because React Router owns app navigation.
- Keep `src/routes` for the SPA mounts and genuine API endpoints only because TanStack hosts rather than structures the Nomi UI.
- Prefix every new Supabase table, column, function, or bucket with `nomi_`; never modify legacy Megsy data because both products share the external project.
- Use migrations for schema changes and never edit generated Supabase types manually because the schema is the source of truth.
- Keep app state local-first in `NomiProvider` with signed-in Supabase sync because Nomi must also work for guests.
- Use the TanStack `/api/nomi-chat` route and Lovable AI Gateway for chat; do not add Supabase Edge Functions because this stack uses server routes.
- NomiAvatar uses 121 deterministic full-character images for all 10 glasses × 10 outfits plus plain states; selectors use isolated item art because composited layers overlap.
- Preserve the immersive call screen and its animated edge frame because it intentionally bypasses the normal shell.
- Use shadcn, Paper & Cobalt, Space Grotesk + DM Sans, semantic tokens, rounded controls, and black/white button treatments because the app needs one consistent visual system.
- Support English and Egyptian Arabic in every user-facing addition because both are first-class app languages.
- Keep the first-time landing white and narrative; authenticated navigation uses a borderless header and on-demand sidebar because the product starts with the companion, not a dashboard.
- Settings contains language and integrations; non-secret agent account labels and memory each use separate pages because these workflows have distinct privacy expectations.
- Before shipping, run type checks and production build, then smoke core routes at mobile and desktop widths because the SPA is interaction-heavy.