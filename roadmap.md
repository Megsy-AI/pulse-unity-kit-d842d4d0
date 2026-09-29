# Nomi — roadmap

## Done
- Removed the old Megsy pages and kept React (no TanStack pages).
- Landing, sign in / sign up, 4-step onboarding, chat, call, tasks, memory,
  character settings, abilities and privacy pages.
- Custom cartoon companion (5 shapes, colour palettes, poses per task, blinking,
  lip sync while speaking).
- English / Egyptian Arabic with RTL, light and dark themes.
- Local-first state with Supabase sync into the `nomi_*` tables.
- Chat replies through the Lovable AI Gateway server route with an offline fallback.
- Redesigned Nomi around the original animated moon-drop companion, clean chat, contextual action cards, and lighter navigation.

## Open
- [x] Replace animated avatar with image-based character customization: glasses, colors, shapes, clothes, and more during onboarding.
- [x] Place the selected character sitting above the chat composer.
- [x] Replace the landing page with the supplied studio footer composition, local fonts/video, responsive stacking, and desktop gaze scrubbing.
- Real voice on the call screen (speech-to-text + text-to-speech); the screen is currently
  a visual simulation with mic/speaker controls.
- Nomi creating tasks and memories automatically from the conversation.
- Real integrations: phone calls, email, calendar, web tasks (permission toggles exist).
- Push notifications for reminders.

## Current request
- [x] Show the Nomi landing page only before setup, then continue through registration and onboarding into chat.
- [x] Remove bottom navigation and replace it with a clean top bar and responsive sidebar.
- [x] Add Projects and Settings destinations; consolidate integrations and profile access in Settings.
- [x] Rebuild chat around a centered companion, seated composer, contextual integration prompt, and borderless thinking state.
- [x] Redesign the full application with shadcn components using the Paper & Cobalt palette, Space Grotesk + DM Sans, and a centered conversation layout.
- [x] Rebuild the first-time welcome page as a cinematic video opening followed by a clean, white narrative of Nomi's abilities, approvals, integrations, and privacy.
- [x] Remove the hero video entirely and use a clean white opening.
- [x] Always open the welcome page at `/` and optimize its initial loading path and avatar assets.
- [x] Rebuild the welcome story with the Nomi check logo, rotating promises, character-led sign-in opening, and original conversation, action, approval, goals, and integrations artwork.
