# Navigation and photography refinement — 2026-10-21

The shared bottom dock now contains Feed, Share post, Messages and Profile.
Add friends is in the top header with the signed-in owner’s incoming-request
badge. Categories remain available through All categories in the feed and the
existing desktop community navigation.

Ten communities now use ten distinct editorial photographs. The landing feature
uses an eleventh separate photo. The category image remains consistent when
opening its community, and a member’s avatar remains consistent throughout the app.
The circle thumbnails use a fixed square crop inside the circular border.

## Verification

- Lint, TypeScript and production build passed.
- All 28 browser tests passed against the production build with Chromium 153.
- Layouts checked at 320, 360, 390/393, 480, 600, 760, 768 and 1440 px.
- Header friend discovery, four dock actions, post/photo/video flows, chat clearance,
  private category navigation, persistence and twelve-screen accessibility checks passed.
- Editorial image loading, unique image sources per page and square thumbnail
  bounds passed on mobile and desktop.

Screenshots show explicitly labelled fictional preview data. Live Supabase account,
Storage and Realtime verification remains outside these browser-session checks.

[Mobile](mobile.jpg) · [Desktop](desktop.jpg)
