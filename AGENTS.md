# Nomi — Agent Handbook

## 1. What this project is

Nomi — a personal AI companion with a custom cartoon character for every user.
It is a pure React SPA (react-router-dom) inside a thin TanStack Start shell
used only for hosting on Lovable.

- `src/routes/__root.tsx` — HTML shell (head, fonts, theme/dir boot script). No page UI.
- `src/routes/index.tsx` + `src/routes/$.tsx` — mount the SPA (`ssr: false`) for every path.
- `src/lib/spaMount.tsx` → `src/App.tsx` — the real router (BrowserRouter) and page tree.
- `src/nomi/**` — everything Nomi: `types.ts`, `i18n.ts`, `intent.ts`, `ai.ts`,
  `store.tsx` (state), `avatar/` (SVG character + lip sync), `pages/`, `components/`.
- `src/routes/api/**` — server routes only (no page UI).

Rule: new pages go in `src/nomi/pages` and are wired in `src/App.tsx`.
Do NOT add files under `src/routes/` except real API endpoints — the router is React Router.

## 2. Backend rules

- External Supabase project `qdnqxjzjecaieuavagvq`. Schema changes go through migrations;
  never edit `src/integrations/supabase/types.ts` by hand.
- Every new table, column, function or storage bucket is prefixed `nomi_`.
  Never drop or alter the legacy Megsy tables that share this database.
- Nomi data lives in `nomi_companions`, `nomi_tasks`, `nomi_memories`, `nomi_messages`,
  `nomi_permissions`, `nomi_call_sessions`, all RLS-scoped to `auth.uid()`.
- Chat runs through the TanStack server route `src/routes/api/nomi-chat.ts` on the Lovable
  AI Gateway (`LOVABLE_API_KEY`, read inside the handler). New Supabase Edge Functions are
  not allowed in this stack; `src/nomi/ai.ts` falls back to a local reply when the call fails.
- Legacy provider keys stay encrypted in `service_keys`; the client never sees a raw key.

## 3. Front-end rules

- State lives in `NomiProvider` (`src/nomi/store.tsx`): localStorage first, Supabase sync
  when signed in, so the app works signed out too.
- NomiAvatar uses original seated 3D images with coordinated shape, colour, glasses and clothing presets.
- The call screen is immersive (no shell) and uses the `.nomi-call-edges` animated frame
  with `--nomi-edge-intensity` per call state.
- UI: shadcn, Paper & Cobalt, modest radii, Space Grotesk + DM Sans.
- First-time landing is a white full-width narrative; signed-in UI keeps Paper & Cobalt.
- English and Egyptian Arabic are supported.
- Navigation uses a top bar and on-demand sidebar; account controls and integrations live in Settings.

## 4. Checks before shipping

```bash
bunx tsgo --noEmit     # types
bun run build          # production build
```

Then smoke `/`, `/onboarding`, `/chat`, `/call`, `/tasks`, `/memory`, `/character`,
`/abilities`, `/privacy` at mobile and desktop width, light and dark.

## 5. Known open items

See `roadmap.md`.
