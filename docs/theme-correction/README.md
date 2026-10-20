# Reference light theme

The public homepage now opens as a dashboard with its own navigation sidebar,
welcome header, white introduction card with a violet header and photo panel. It replaces the old
large marketing headline and ribbon/board composition. Community cards, steps,
care panel and closing invitation follow the same composition.

The clarified direction replaces the earlier black/pink palette with the reference’s light lavender canvas, white sidebar and cards, violet gradient headers and blue buttons. Dark ink text, the profile summary and rounded card composition follow that light theme across public and application pages.

| Screen      | Desktop                          | Phone                           |
| ----------- | -------------------------------- | ------------------------------- |
| Homepage    | [View](landing-desktop.webp)     | [View](landing-mobile.webp)     |
| Dashboard   | [View](home-desktop.webp)        | [View](home-mobile.webp)        |
| Communities | [View](communities-desktop.webp) | [View](communities-mobile.webp) |

The application screenshots use labelled fictional preview data. Photo and font
credits, including the limitation on verifying exact Figma typography, are in
[design assets](../design-assets.md). [Earlier screenshots](../design-review/README.md)
remain available for comparison.

Validation: TypeScript, lint, clean production build and all 20 browser tests
passed. Checks include landing text/control bounds at 320–760 pixels, mobile
navigation, responsive public and preview routes, automated accessibility across twelve public/application screens,
community membership, story/media/chat flows, profile editing and privacy
controls. Six desktop/phone captures recorded no page exceptions or horizontal
overflow; see [capture metrics](verification.json).

No backend behavior or database migrations changed. Live backend verification
remains outside this interface update.
