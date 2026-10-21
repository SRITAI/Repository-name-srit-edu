# Social feed and glass navigation

This update keeps the current lavender canvas, white cards, violet gradients, blue actions and self-hosted Poppins font.

- The bottom dock is available on desktop and mobile: Feed, Share post, Messages and Profile. Friend discovery is available in the header; categories remain accessible through the feed’s All categories link and desktop community navigation.
- Share post opens the existing audience-controlled composer. On mobile it appears as a glass bottom sheet; photos, videos, captions, drafts and community selection retain their existing behavior.
- The feed starts with a compact heading, private membership shortcuts, composer and posts. Category circles link to communities; they do not represent unread user stories.
- Friends retain shared-topic/language filtering and mutual connection acceptance before chat.
- Dock badges derive from the current user's pending incoming requests and unread messages.
- The chat viewport and page bottom reserve room for the dock and device safe area. Reduced motion and keyboard focus are supported.
- Public shortcuts point to real account routes. The fictional preview remains explicitly labelled and uses browser-session data.

## Verification

The local execution environment was unavailable during implementation. The UI checks workflow runs lint, unit tests, a production build, type checking and the browser suite using an installed Playwright Chromium. The social dock suite covers 320, 390, 768 and 1440 px layouts, all four dock actions plus header friend discovery and feed category navigation, chat input clearance, category filtering, request creation, preview post persistence, public auth routes and reduced motion. Browser screenshots and failure diagnostics are retained as workflow artifacts.

The workflow result is the source of truth for executed checks. Adding tests is not evidence that they passed. Supabase signup, private Storage and Realtime remain outside this preview verification and require configured live infrastructure.

### Recorded run

[UI checks, run 39465231359](https://github.com/SRITAI/Repository-name-srit-edu/actions/runs/39465231359) on commit f672262 passed lint, all six media unit tests, production build, type checking and all 27 browser tests (including twelve-screen accessibility checks). Eight feed/chat screenshots are in that run's browser-report artifact. A follow-up extends the saved app motion preference to the portal-mounted composer and adds a regression case; check its own workflow result before treating it as verified.

### October 21 navigation and photo refinement

Removed Add friends and Categories from the shared bottom dock. Added a header
friend shortcut with the current user's incoming-request badge, including a real
account route on the public homepage. Category artwork is unique across all ten
category cards, with a separate homepage feature image. Square category crops stay
inside their round thumbnail frames. Member avatars remain the same identity
wherever that member appears.
