# Nomi customization and app redesign

## What will change

1. **Character choices**
   - Replace full-character choice thumbnails with clean circular previews showing only the glasses or clothing item.
   - Create ten distinct cute glasses and ten distinct cute outfits; no duplicated shirt.
   - Keep the main preview as a complete Nomi image and ensure every glasses + outfit pairing displays both selections together.
   - Use a clear animated two-tab control for glasses and clothes.
   - Remove all later onboarding steps. The confirmation button saves the look and opens chat immediately.

2. **Chat**
   - Rebuild the empty and active conversation states with a clean, rounded shadcn layout.
   - Keep Nomi visible, simplify suggestions, improve message bubbles, and polish the rounded composer.
   - Preserve existing chat behavior, permissions, languages, and message sending.

3. **Settings and navigation**
   - Redesign Settings into clear rounded sections for profile, connections, appearance, and account actions.
   - Redesign the slide-out navigation with clearer active states, spacing, and compact account details.
   - Preserve all existing destinations and settings behavior.

4. **Unified controls**
   - Standardize primary buttons as black with white text and secondary buttons as white with black text.
   - Apply consistent rounded geometry, borders, focus states, and press animations across the app without changing landing-page content.

## Technical details

- Continue using the existing React SPA shell and shadcn components.
- Generate accessory artwork as transparent item sheets, then export consistent isolated thumbnails.
- Keep full-character combination images for the main preview and add deterministic fallbacks while every pairing is completed.
- Verify character selection, direct navigation to chat, chat interactions, settings, and sidebar on mobile and desktop.