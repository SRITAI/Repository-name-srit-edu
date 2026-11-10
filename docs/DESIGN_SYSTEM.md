# Cinematic Editorial — Design System Specification

> Visual quality standard: Higgsfield / Runway / Linear luxury AI-video tier.

---

## 1. Golden Architecture Rule

> **MANDATORY**: All UI elements across all routes must be built strictly from the custom design-system primitives in `src/components/ui/*`.
> **Never** render raw, unstyled HTML elements like `<select>`, `<button>`, `<input>`, `<textarea>`, `<input type="file">`, or native radio/checkbox elements.

---

## 2. Color Tokens

All colors are exposed as CSS variables in `src/app/globals.css` and mapped in `tailwind.config.ts`:

| Token | Value | Role |
|---|---|---|
| `--bg` | `#09090B` | Deep film-set canvas page background |
| `--bg-elevated` | `#0F0F12` | Elevated section background |
| `--surface` | `#141418` | Standard card and container surface |
| `--surface-2` | `#1B1B21` | Interactive elements, inputs, hover state |
| `--surface-3` | `#24242C` | Active/selected background |
| `--border` | `rgba(255,255,255,0.08)` | Subdued card border |
| `--border-strong` | `rgba(255,255,255,0.16)` | Focused/hovered element border |
| `--text` | `#F6F6F3` | Primary crisp high-contrast body & heading text |
| `--text-muted` | `#9B9BA5` | Supporting captions, secondary descriptions |
| `--text-faint` | `#62626C` | Metadata, timestamps, subtle captions |
| `--accent` | `#D7FF3D` | **Electric Lime** — Primary CTAs, highlights, selected rings |
| `--accent-ink` | `#0B0D00` | High-contrast dark text rendered on top of lime fill |
| `--accent-2` | `#8B6CFF` | **Electric Violet** — AI moments, creative badges |
| `--accent-3` | `#FF6B3D` | **Warm Orange** — Cloud sync, viral alerts |
| `--danger` | `#FF5C6C` | 18+ adult gates, validation errors |
| `--success` | `#3DDC97` | Verified badges, completion indicators |
| `--glow-accent` | `0 0 0 1px rgba(215,255,61,0.35), 0 8px 40px rgba(215,255,61,0.18)` | Electric lime halo glow |

---

## 3. Typography Hierarchy

1. **Display Headings**: `Plus Jakarta Sans` / `Geist` (Weight 700–800, tracking `-0.035em`, line-height `0.95–1.05`).
2. **Signature Accent Words**: `Instrument Serif` (Italic 400, matching font-size, lime or white accent).
3. **Body & Controls**: `Plus Jakarta Sans` (Weight 400–500, line-height 1.6).
4. **Micro-Labels & Data**: `JetBrains Mono` (10–12px, uppercase, tracking `0.08em`).

---

## 4. Component Manifest (`src/components/ui/`)

1. **`Button`**:
   - `primary`: Electric lime pill with animated arrow-swap (`↗`), radial shine sweep, glow shadow.
   - `secondary`: Frosted glass with 1px border.
   - `ghost`: Transparent with hover surface fill.
   - `danger`: Red tint with warning styling.
   - Supports `isLoading` spinner state and `size="sm" | "md" | "lg"`.
2. **`Input`**:
   - 52px height, floating label, mono helper text, left/right icon slots, lime glow focus ring, error border.
3. **`Textarea`**:
   - Auto-resizing surface, floating mono label, character counter, lime glow focus ring.
4. **`Select`**:
   - 100% custom popover dropdown with keyboard navigation, option checkmarks, and search filter for >8 items.
5. **`Chip`**:
   - 40px height pill, icon + label with 8px gap, selection glow state, and optional mono badge.
6. **`ChoiceCard`**:
   - High-end selectable tile with icon container, selection check badge, and optional visual aspect-ratio indicator (`9:16`, `4:5`, `1:1`).
7. **`SegmentedControl`**:
   - Sliding highlight pill between options with optional badges and icons.
8. **`Stepper`**:
   - Numbered nodes with electric lime completed state and animated progress line.
9. **`Dropzone`**:
   - Large dashed upload zone, drag-and-drop hover glow, thumbnail grid with "Primary" tag and remove action.
10. **`Badge`**:
    - Mono-caps tag (`lime`, `violet`, `orange`, `danger`, `outline`, `sample`).
11. **`BentoTile`**:
    - Interactive card with cursor spotlight tracking (`--mx`, `--my`) and top inner highlight.
12. **`VideoTile`**:
    - 9:16 portrait video card, desktop hover-play, mobile viewport autoplay (`IntersectionObserver`), bottom gradient overlay with metadata.

---

## 5. Video Asset Specifications

For client media or marketing reel loops placed in `public/media/`:

- **Container**: MP4 (`.mp4`) with optional WebM fallback (`.webm`)
- **Video Codec**: H.264 / AVC (High Profile, Level 4.0)
- **Audio Codec**: AAC (128 kbps stereo) or muted
- **Aspect Ratio**: 9:16 portrait
- **Resolution**: `720 × 1280` px (or `1080 × 1920` px master)
- **Framerate**: 30 fps or 60 fps
- **Loop Duration**: 4 to 8 seconds seamless loop
- **Max File Size**: **≤ 3 MB** per video clip for instant, zero-buffer playback
- **HTML Video Attributes**: `muted loop playsinline preload="metadata" poster="/media/posters/..."`
- **Manifest**: Typed registry stored in `src/lib/media.ts`. Placeholder items are flagged with `Sample` badge.
