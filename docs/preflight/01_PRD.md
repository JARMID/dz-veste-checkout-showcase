# Product Requirements Document (PRD): DZ Veste Checkout Showcase

**Document ID:** `01_PRD.md`
**Project:** `dz_veste_checkout_showcase` (`D:\Downloads\JP\demos\dz_veste_checkout_showcase`)
**Brand / Studio:** JARMID (`@jar.mid`), founded by Khalef Abdelmadjid
**Target Audio Sync:** `D:\Downloads\JP\audio\mastered_founder_voice\MASTERED_VOICE_MANIFEST.json` (`hyper`, `49.43s`)

## 1. Problem Statement

Algerian e-commerce stores selling streetwear and apparel on Cash-on-Delivery (COD) lose mobile buyers at three exact points on their checkout pages:
1. Bloated 9-field forms ask for secondary phone numbers, postal codes, email addresses, and street lines that buyers abandon on smartphones.
2. Low-contrast, undersized Call-to-Action (CTA) buttons fail mobile thumb ergonomics and read as disabled controls.
3. Manual BaridiMob screenshot upload boxes invite trivial amount tampering (editing 7 800 DA to 780 DA in seconds) and force merchants into 24-hour manual WhatsApp confirmation loops.

JARMID needs a single production web application that serves two roles without drifting between separate codebases: an interactive client-facing portfolio demo deployed live for prospects from `@jar.mid`, and a deterministic 60fps Hyperplexed-style visual stage captured via Playwright/HyperFrames synced to Khalef Abdelmadjid's recorded 49.43s Darija/French voiceover.

## 2. Target User Personas

1. **Algerian E-Commerce Store Owner (Visitor Mode):** Mobile-first merchant running Instagram/TikTok ads to a COD page. Wants immediate proof of how form reduction, mobile CTA clarity, cryptographic payment verification, and 2-second AI confirmation increase conversion and block fake receipts.
2. **Video Production Pipeline (Capture Mode):** Automated Playwright or HyperFrames renderer driving `window.__seek(t)` at 60fps across `1080x1920` (Instagram Reels `9:16`) and `1920x1080` (YouTube/Portfolio `16:9`) without UI chrome, timing jitter, or safe-zone clipping.

## 3. Functional Requirements

- **FR-01 (Interactive Mode Switcher):** Default visitor route (`/`) provides instant switching between `Avant (Page COD Classique)`, `Apres (Checkout Optimise JARMID)`, and `Avant / Apres Split`, plus a `Play 49s Transformation` button with synced mastered audio (`hyper_master_preview.mp3`) and scrubbable chapter controls.
- **FR-02 (Authentic "Avant" COD Page):** Renders a realistic, visually cluttered Algerian COD checkout page for `"Veste Oversize Atlas - 7 800 DA"` featuring a 9-field form (`Nom`, `Prenom`, `Email`, `Tel 1`, `Tel 2`, `Adresse`, `Code Postal`, `Wilaya`, `Commune`), a washed-out grey CTA (`#9ca3af` on `#d1d5db`, 36px height), and a red-flagged `"Envoyez une capture d'ecran BaridiMob (Upload Screenshot)"` upload box.
- **FR-03 (Luxury "Apres" Storefront & Interactive Checkout):** Renders an obsidian dark-editorial streetwear product and checkout page using two studio-photographed product assets (`atlas-jacket-hero.png` and `atlas-jacket-detail.png`), size selection (`S`, `M`, `L`, `XL`), a 3-field COD form (`Nom`, `Numero`, full 58 Algerian Wilayas selector with Stop-Desk vs Domicile shipping math), a `min-h-[56px]` high-contrast luxury CTA, a `"Webhook HMAC Verifie - 18us - PostgreSQL RLS Locked"` badge, and an `"Agent IA: Commande confirmee en 2s"` card.
- **FR-04 (Deterministic Capture Mode):** Navigating to `?capture=1&viewport=9x16` or `?capture=1&viewport=16x9` hides interactive visitor chrome, locks the canvas to exact `1080x1920` or `1920x1080` stage geometry, disables CSS transition lag, and exposes a pure synchronous `window.__seek(t: number)` function for `t` in `[0.00, 49.43]`.
- **FR-05 (Beat-Synchronized 7-Act Choreography):**
  - `0.00s - 5.32s`: Cluttered COD page establishing shot with leak audit reticles.
  - `5.48s - 9.05s`: Camera spotlight isolates the 9-field form.
  - `9.21s - 12.51s`: Floating dark VS Code diff panel types `fields.filter(['nom', 'telephone', 'wilaya'])` and collapses 9 inputs down to 3.
  - `12.67s - 21.81s`: Spotlight zooms onto the `#9ca3af` on `#d1d5db` CTA button; code diff transforms contrast, spacing, and `min-h-[56px]` mobile height live.
  - `22.03s - 28.23s`: Camera snaps onto the BaridiMob screenshot upload box. At exact Vine Boom peak `t = 22.83s` (`22.827s`), triggers damped camera punch/shake, crimson warning flash, and fake edited receipt visual (`7 800 DA -> 780 DA`).
  - `28.45s - 36.66s`: Code diff swaps the upload box for the PostgreSQL HMAC Webhook verifier (`18us`, `PostgreSQL RLS Locked`) and inline AI Confirmation Agent (`Commande confirmee en 2s`, green pulse).
  - `36.82s - 49.43s`: Clean Before vs After reveal with playful rating badge (`Avant: 3 commandes perdues / 17 boutons casses`) morphing into the finished dark-mode storefront and CTA footer (`Commente AUDIT - Livre en 48h`).
- **FR-06 (Zero Placeholders & Zero Browser Storage):** All product imagery comes from local studio PNGs in `public/assets/`. Application state uses React state only, with zero `localStorage` or `sessionStorage` access.

## 4. Out-of-Scope Anti-Goals

- Live payment processing, real PostgreSQL server deployment, or external Chargily/BaridiMob API calls (all verification demos run deterministic client-side cryptographic/state simulations).
- Multi-product catalog browsing, user login accounts, or shopping cart persistence across sessions.
- External runtime font or image CDN dependencies that could stall headless Playwright capture.

## 5. Measurable Success Metrics

- Zero TypeScript errors under strict mode (`npx tsc --noEmit`).
- Passing automated Vitest unit tests covering 100% of timeline beat boundaries, Vine Boom peak physics at `22.827s`, and 58-Wilaya pricing math.
- Clean Vite production build (`npm run build`).
- 12 verified Playwright screenshots (`t=3s, 11s, 19s, 22.83s, 33s, 44s` across both `1080x1920` and `1920x1080`) passing visual inspection with zero text clipping, zero overflow, and strict `9:16` Reels safe-zone compliance.
