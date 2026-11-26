# Implementation Plan and Verification Checklist

**Document ID:** `06_IMPLEMENTATION_PLAN.md`
**Target Root:** `D:\Downloads\JP\demos\dz_veste_checkout_showcase`
**Status:** Pending Goldfish Review Resolution

## 1. Execution Sequence (Dependency Order)

1. **Foundation & Assets (Complete):**
   - Studio photography staged at `public/assets/atlas-jacket-hero.png` and `public/assets/atlas-jacket-detail.png`.
   - Mastered voice preview staged at `public/audio/hyper_master_preview.mp3`.
   - Vite 6 + React 19 + TypeScript 5.8 + Tailwind CSS v4 + Motion + Phosphor Icons + Fontsource dependencies installed.
2. **Phase A: Pure Domain Data & Deterministic Timeline Engine (TDD First):**
   - Write `src/data/wilayas.ts` (all 58 Algerian Wilayas with Stop-Desk/Domicile pricing and transit hours).
   - Write `src/data/diffScripts.ts` (syntax-tokenized VS Code diffs for Acts 3, 4, and 6).
   - Write `src/engine/easing.ts` and `src/engine/timeline.ts` (`computeTimelineFrame(t)` for `[0, 49.43]`).
   - Write and pass `src/engine/timeline.test.ts` (`npx vitest run`) verifying every beat boundary, Vine Boom impulse peak at `22.827s`, and 58-Wilaya completeness.
3. **Phase B: Styling Tokens & Core Visual Surfaces:**
   - Write `src/index.css` with Tailwind v4 `@theme`, self-hosted `@fontsource` imports, Double-Bezel utility tokens, descender safety, and `[data-capture="true"]` transition suppression.
   - Build `src/components/AvantCheckoutCard.tsx` (cluttered 9-field COD page, `#9ca3af` on `#d1d5db` CTA, red-flagged BaridiMob screenshot upload box).
   - Build `src/components/ApresStorefront.tsx` (Awwwards Cold Architectural Luxury dark editorial storefront, Double-Bezel product viewer, 3-field 58-Wilaya COD form, 56px CTA, PostgreSQL HMAC 18us verifier, 2s AI Confirmation Agent).
4. **Phase C: Hyperplexed Transformation & Dual-Viewport Capture Engine:**
   - Build `src/components/VSCodeDiffPanel.tsx`, `src/components/BaridiMobFraudCard.tsx`, `src/components/BeforeAfterCompare.tsx`, and `src/components/TransformingCheckoutStage.tsx`.
   - Build `src/components/CaptureStage.tsx` (`1080x1920` safe-zone compliant 9:16 and `1920x1080` 16:9, exposing `window.__seek(t)` via `ReactDOM.flushSync`).
   - Build `src/components/VisitorExperience.tsx` (Fluid Island nav, Avant/Apres/Split toggle, Play 49s Transformation with synced audio + interactive scrubber, JARMID footer) and wire `src/App.tsx` + `src/main.tsx`.
5. **Phase D: Verification & Visual Audit Loop:**
   - Run `npx vitest run`, `npx tsc --noEmit`, and `npm run build`.
   - Execute `scripts/capture_verification.py` to capture all 12 verification frames (`t=3s, 11s, 19s, 22.83s, 33s, 44s` in both `9x16` and `16x9`) plus desktop/mobile Visitor Mode screenshots.
   - Inspect every captured PNG via `read_file` and fix any visual overlap, contrast, clipping, or safe-zone defect before declaring completion.
