# Veyra AI

A cinematic demo studio for creating illustrative image and video previews. This replaces the former community site interface with a single creative workspace.

## Demo behavior

- Image and video creation screens accept prompts, style, aspect ratio, and video duration.
- Generate creates a **simulated preview** in the browser; no AI service or video renderer is connected.
- The library and saved inspiration use browser local storage. They are specific to each browser and can be cleared by its user.
- Image and video preview cards use CSS illustration. The library can download an SVG demo poster, not generated media.
- Old application routes redirect to the new studio. The former backend is not included in this version.

## Run locally

```sh
pnpm install
pnpm dev
```

Checks: `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
