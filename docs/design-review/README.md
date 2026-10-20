# Black and pink dashboard refresh

The public landing page, home dashboard and community list/detail pages now use
rounded cards, pink gradient headers, photo covers and Poppins typography. The
application sidebar, navigation, feed cards and profile summary follow the same
visual treatment. Fonts and the five downloaded photos are served from the app.
See [reference and asset credits](../design-assets.md) for sources and the exact
Figma typography access limitation.

| Screen | Desktop | Phone |
| --- | --- | --- |
| Landing | [View](landing-desktop.webp) | [View](landing-mobile.webp) |
| Dashboard | [View](home-desktop.webp) | [View](home-mobile.webp) |
| Communities | [View](communities-desktop.webp) | [View](communities-mobile.webp) |

Application screenshots contain only the labelled fictional preview. Editorial
photographs are category illustrations, never actual member profiles or stories.

## Verification

- `npm run typecheck`, `npm run lint` and a clean `npm run build` passed.
- All **20 browser tests passed**, using the production server and Chromium.
- Tests include editorial image loading, community search/join persistence,
  photo and video conversations, stories, comments, reactions, bookmarks,
  journeys, profile editing, privacy settings, reports and keyboard dialogs.
- Rendered landing text/action bounds and expanding navigation were checked at
  320, 360, 393, 480, 600 and 760 pixels. Eight public/preview routes were checked
  for horizontal overflow at 360, 390, 768 and 1440 pixels.
- The existing six-screen WCAG A/AA automated checks passed after adjusting
  sidebar and community-caption contrast.
- Six desktop/phone review captures recorded no page exceptions and no horizontal
  overflow. See [capture metrics](verification.json).

Browser tests exercise fictional session data. Live email delivery, Supabase
Storage/Realtime and live account flows were not newly verified by this design
change. No database migrations or account changes were made.
