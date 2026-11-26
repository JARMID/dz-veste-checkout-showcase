# UI/UX Design Brief and Style Token Specification

**Document ID:** `04_UIUX_DESIGN_BRIEF.md`
**Design Read:** Single-page Algerian luxury streetwear e-commerce transformation demo for D2C founders and Instagram Reel viewers, combining an intentionally cluttered legacy COD "Avant" surface with an Awwwards Cold Architectural Luxury dark-editorial "Apres" surface.

## 1. Brand Metaphor and Invention Gate

- **Metaphor:** "Obsidian Atelier vs. Chaotic COD." The exact same heavyweight technical garment (`Veste Oversize Atlas`, `7 800 DA`) sits in both worlds. The transformation proves visually that architecture, friction removal, and cryptographic trust convert a commodity COD listing into a luxury technical outerwear flagship.
- **Brand Identity:** Storefront brand `ATELIER ATLAS` (Archive 04), engineered by `JARMID` (`@jar.mid`, Khalef Abdelmadjid).

## 2. Anti-Slop Compliance Lock

- Zero purple/violet gradients, zero generic `slate-900` backgrounds, zero warm-beige/brass/oxblood clichés.
- Zero raw emojis as UI icons; all "Apres" iconography uses `@phosphor-icons/react` with consistent light/regular stroke weight.
- Zero placeholder images; both `atlas-jacket-hero.png` and `atlas-jacket-detail.png` are custom dark-studio product photographs.
- Zero em dashes or en dashes across all visible copy and documentation.

## 3. Dual Color Token Architecture

### Surface System A: "Avant" (Legacy Algerian COD Storefront)
| Token | Value | Role |
| :--- | :--- | :--- |
| `--avant-canvas` | `#f3f4f6` | Stark generic store background |
| `--avant-card` | `#ffffff` | Flat boxed container with harsh `#d1d5db` border |
| `--avant-promo-red` | `#dc2626` | Garish top promo strip and "-50%" sticker |
| `--avant-promo-yellow` | `#facc15` | Clashing urgency countdown badge |
| `--avant-cta-bg` | `#d1d5db` | Washed-out disabled-looking CTA fill |
| `--avant-cta-text` | `#9ca3af` | Low-contrast CTA label (1.54:1 WCAG fail) |
| `--avant-danger-box` | `#fef2f2` / `#ef4444` | Red-flagged BaridiMob screenshot upload zone |

### Surface System B: "Apres" (Cold Architectural Luxury Dark Editorial)
| Token | Value | Role |
| :--- | :--- | :--- |
| `--obsidian-canvas` | `#060607` | Deep OLED obsidian primary backdrop |
| `--obsidian-shell` | `#0e0f12` | Outer Double-Bezel machined enclosure |
| `--obsidian-core` | `#14161a` | Inner Double-Bezel card surface (`inset 0 1px 0 rgba(255,255,255,0.10)`) |
| `--obsidian-hairline` | `rgba(255, 255, 255, 0.09)` | Crisp 1px architectural containment border |
| `--chalk-primary` | `#f5f5f2` | Primary luxury typography and high-contrast CTA fill (18.6:1 contrast on `#060607`) |
| `--ash-secondary` | `#a1a1aa` | Secondary technical metadata and labels |
| `--ash-muted` | `#71717a` | Tertiary captions and field hints |
| `--signal-emerald` | `#10b981` | Strictly locked to HMAC Webhook Verified and AI Agent 2s telemetry |
| `--alert-crimson` | `#ef4444` | Strictly locked to BaridiMob fraud detection and Vine Boom impact |

## 4. Typography Scale (Self-Hosted)

- **"Avant" Typography:** Clashing generic `Arial, Tahoma, sans-serif` and `Georgia, serif` headings to mirror low-trust COD templates.
- **"Apres" Typography:**
  - Display Headings: `Space Grotesk` (weights 600, 700), tight tracking (`-0.03em`), descender safety (`padding-bottom: 0.18em; overflow: visible`).
  - UI Body: `Plus Jakarta Sans` (weights 400, 500, 600, 700), body leading `1.55`.
  - Telemetry, Prices, Code Diffs: `JetBrains Mono` (`font-variant-numeric: tabular-nums`).
  - Arabic/Darija Labels: `Cairo` (weights 500, 600, 700) for clean bilingual Wilaya names (`16 - Alger / الجزائر`).

## 5. Micro-Geometry and Double-Bezel Spec

- **Concentric Radii Law:** Outer shell `rounded-[28px]` with `p-2` (`8px`) encloses inner core `rounded-[20px]` (`28 - 8 = 20px`).
- **Button-in-Button CTA:** `min-h-[56px]` luxury CTA button houses a flush circular trailing icon pill (`w-10 h-10 rounded-full bg-[#060607] text-[#f5f5f2]`) with diagonal translation on hover (`translate-x-0.5 -translate-y-0.5`).
- **Viewport Stability:** Interactive visitor hero uses `min-h-[100dvh]` rather than `100vh`.
