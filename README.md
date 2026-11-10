# infimindss° — Human + AI Brand Video Studio
> "Real humans. AI-fast. Zero robotic-looking videos."

A cinematic, high-performance web platform for **infimindss°** — delivering real-human-style marketing video ads, viral Instagram Reels, and Meta-ready creative assets with 48-hour turnarounds.

---

## ⚡ Design System Architecture Rule (MANDATORY)

> **CRITICAL RULE**: To maintain visual consistency and prevent raw browser default rendering:
> **All UI across the application MUST be built using the design-system components in `src/components/ui/*`.**
> 
> Never render raw, unstyled HTML controls like `<select>`, `<input>`, `<button>`, `<textarea>`, or native checkboxes. Always import from `@/components/ui`:
> `Button`, `Badge`, `Input`, `Textarea`, `Select`, `Chip`, `ChoiceCard`, `SegmentedControl`, `Stepper`, `Dropzone`, `BentoTile`, `VideoTile`.

Full documentation is available in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

---

## 🎨 Visual Identity: "Cinematic Editorial"

- **Canvas & Surfaces**:
  - Film-set page background: `--bg: #09090B`
  - Elevated containers: `--bg-elevated: #0F0F12`
  - Cards & Glass: `--surface: #141418`, `--surface-2: #1B1B21` with `backdrop-filter: blur(20px)`
- **Accent Palette**:
  - Primary Action / Highlights: `--accent: #D7FF3D` (**Electric Lime**)
  - AI Moments & Creative Badges: `--accent-2: #8B6CFF` (**Electric Violet**)
  - Viral / Cloud Alerts: `--accent-3: #FF6B3D` (**Warm Orange**)
- **Typography**:
  - Display / Headings: `Plus Jakarta Sans` 700–800, tracking `-0.035em`
  - Signature Accent Words: `Instrument Serif` *Italic*
  - Body & UI: `Plus Jakarta Sans` 400–500
  - Micro-Labels & Badges: `JetBrains Mono` 11px uppercase
- **Texture**:
  - Fixed SVG film-grain noise overlay (3–4% opacity)
  - Ambient radial glow gradients behind key viewports

---

## 📹 Video Asset Specifications

For custom videos placed in `public/media/` and registered in `src/lib/media.ts`:

- **Container**: MP4 (`.mp4`) + optional WebM (`.webm`)
- **Video Codec**: H.264
- **Resolution**: `720 × 1280` px (9:16 vertical portrait)
- **Duration**: 4–8 second seamless loops
- **File Size**: **≤ 3 MB** per clip
- **Playback**: `muted loop playsinline preload="metadata"`
- **Hover Play**: Desktop plays on pointer hover; mobile autoplays when ≥60% in view.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Production build & test
pnpm build
pnpm start
```

Visit [http://localhost:3000](http://localhost:3000) (or whichever port is assigned).

---

## 🛠️ Visual QA Route

Navigate to `/_kit` in development to inspect all design system components across their hover, selected, error, and disabled states.
