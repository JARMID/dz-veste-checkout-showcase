# Atelier Atlas (DZ Veste Checkout Showcase)

Single-page Algerian streetwear e-commerce showcase and deterministic 60fps video capture stage built by **Khalef Abdelmadjid** (**JARMID**, `@jar.mid`).

## Features

- **Interactive Visitor Mode:** Light Mode (Satin Porcelain-Pearl 3D-normal liquid silk WebGL shader with frosted Liquid Glass) and Dark Mode (Obsidian-Titanium silk), sticky 270dvh expanding hero aperture with 3 studio angles, scroll-velocity editorial lookbook, 340dvh sticky 49.43s code-to-UI cinema theater, and interactive Avant COD vs Apres JARMID vs Split checkout sandbox (`58` Algerian Wilayas).
- **Deterministic Video Capture Mode (`?capture=1&viewport=9x16` or `16x9`):** Exposes synchronous `window.__seek(t)` across `0.00s` to `49.43s` for lossless 60fps HyperFrames/Playwright MP4 rendering synced to Khalef's mastered audio mix, with bilingual Darija/French kinetic captions and 3D founder reaction PiP.

## Stack

- React 19, TypeScript 5.8, Vite 6, Tailwind CSS v4
- Motion (`motion/react`), Lenis, WebGL GLSL, `@phosphor-icons/react`
- Vitest, Playwright, FFmpeg 8.1

## Quick Start

```bash
npm install
npm run dev
```

## Verification & Scripts

```bash
npm test
npm run typecheck
npm run build
```

- Dual-viewport Playwright QA: `python scripts/capture_verification.py`
- 60fps MP4 Reel renderer: `python scripts/render_reel_mp4.py --viewport 9x16 --fps 60`
