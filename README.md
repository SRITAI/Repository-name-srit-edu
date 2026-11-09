# Mindly°
> "A clearer mind for a brighter you."

A pixel-perfect, high-fidelity landing page for **Mindly°**, replicating the exact design, typography, layout, glassmorphism, and micro-interactions from the uploaded design mockup.

---

## 🎨 Visual & Typography Stack

- **Headline Font**: `Instrument Serif` (Google Fonts)
  - Regular 400 for `"A clearer mind"`
  - Italic 400 for `"*for a brighter you.*"` (characterized by calligraphic single-story *g*, graceful descenders, teardrop terminals)
- **UI & Body Font**: `Plus Jakarta Sans` (Google Fonts)
  - Geometric, clean weights from 400 to 800 for the `Mindly°` logo, pill navigation, cards, and buttons.
- **Color Palette**:
  - Warm serene canvas: `#FAF8F5`
  - Deep obsidian text: `#111111` / `#18181B`
  - Muted zinc subtext: `#71717A` / `#8E8E93`
  - Halo accents: Lime Green (`#84CC16`), Purple (`#A855F7`), Vibrant Orange (`#F97316`)
  - Ambient glow presentation container: `box-shadow: 0 0 65px -10px rgba(168, 192, 255, 0.42)`

---

## 🧩 Key Components

1. **Header Navigation**:
   - Brand logo: `Mindly°`
   - Floating frosted pill navigation (`Features`, `How it works`, active `Integrations`, `Pricing`)
   - Black pill action button: `Get the app ↗`
2. **Hero Centerpiece**:
   - Contemplative portrait with upward gaze
   - 3D orbiting cylindrical halo of frosted glass cards (`Focus`, `Ideas`, `Plan`, mountain peak landscape, and celestial moon sphere)
3. **Floating Connected Cards**:
   - Left card: Voice equalizer soundwave icon, `"Turn thoughts into progress."`, `"Capture, organise and do more."`
   - Right card: Team avatar stack + `+` badge, `"Ideas, anytime, anywhere."`, `"Sync across all your devices."`
   - Smooth SVG spline curves dynamically connecting the cards to the central halo, complete with traveling pulse energy dots.
4. **Rotating Stamp**:
   - SVG text path continuously rotating: `"A MORE FOCUSED YOU • EVERYDAY •"` around a central 4-pointed star.
5. **Bottom Badges**:
   - Bottom-left: `"Trusted by 50,000+ creators worldwide."` with 4 creator avatars + `+`.
   - Bottom-right: 4-pointed star divider with `"Less chaos. / More clarity."`
6. **Interactive Features**:
   - Subtle 3D mouse parallax on cards and centerpiece.
   - Interactive watch video modal dialog.
   - Fluid responsive layout down to 360px mobile view with zero layout overflow.

---

## 🚀 Running Locally

```bash
# Start the local server
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser.
