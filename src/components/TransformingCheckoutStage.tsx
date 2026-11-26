import React from 'react';
import {
  ArrowUpRight,
  CheckCircle,
  LockKey,
  ShieldCheck,
  Sparkle,
  WarningOctagon,
} from '@phosphor-icons/react';
import { ATLAS_JACKET, AVANT_COD_FIELDS, formatDzd } from '../data/product';
import { clamp01, lerp } from '../engine/easing';
import type { TimelineFrameState } from '../engine/timeline';
import { BeforeAfterCompare } from './BeforeAfterCompare';

export interface TransformingCheckoutStageProps {
  frame: TimelineFrameState;
  compact?: boolean;
}

function lerpRgb(
  from: [number, number, number],
  to: [number, number, number],
  t: number
): string {
  const r = Math.round(lerp(from[0], to[0], t));
  const g = Math.round(lerp(from[1], to[1], t));
  const b = Math.round(lerp(from[2], to[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Pure deterministic live Code-to-UI morphing stage for Acts 1-6,
 * handing off Act 7 cleanly to BeforeAfterCompare.
 * Zero motion/react runtimes, zero CSS transitions, 100% pure f(t).
 */
export const TransformingCheckoutStage: React.FC<TransformingCheckoutStageProps> = React.memo(
  ({ frame, compact = false }) => {
    if (frame.act === 7) {
      return (
        <BeforeAfterCompare
          deterministicWipe={frame.revealWipeProgress}
          deterministicPulse={frame.deterministicPulse}
          heroKenBurns={frame.heroKenBurns}
          compact={compact}
        />
      );
    }

    const theme = frame.themeProgress;
    const isDark = theme >= 0.45;
    const ctaMorph = frame.ctaMorphProgress;
    const collapse = frame.formCollapseProgress;
    const strike = frame.formStrikeProgress;
    const swap = frame.securitySwapProgress;

    // Continuous surface RGB morph: Avant (#f3f4f6 / #ffffff) -> Apres (#0d0f14 / #14171e)
    const outerBg = lerpRgb([243, 244, 246], [14, 16, 21], theme);
    const cardBg = lerpRgb([255, 255, 255], [20, 22, 28], theme);
    const cardBorder = lerpRgb([203, 213, 225], [42, 46, 56], theme);
    const primaryText = lerpRgb([17, 24, 39], [245, 245, 242], theme);
    const mutedText = lerpRgb([75, 85, 99], [161, 161, 170], theme);
    const inputBg = lerpRgb([249, 250, 251], [10, 11, 15], theme);
    const inputBorder = lerpRgb([156, 163, 175], [48, 53, 64], theme);

    // CTA morph: #d1d5db bg / #9ca3af text / 36px -> #f5f5f2 bg / #060607 text / 56px
    const ctaBg = lerpRgb([209, 213, 219], [245, 245, 242], ctaMorph);
    const ctaColor = lerpRgb([156, 163, 175], [6, 6, 7], ctaMorph);
    const ctaHeight = Math.round(lerp(compact ? 36 : 38, 56, ctaMorph));
    const ctaRadius = Math.round(lerp(4, 16, ctaMorph));

    // Synchronized total (7 800 DA + 400 DA Stop-Desk Alger = 8 200 DA) so Act 6 -> Act 7 is seamless
    const displayTotal = collapse > 0.55 ? 8200 : ATLAS_JACKET.priceDzd;

    // Section spotlight dimming + optical Hasselblad lens defocus (motionmaxxing ui-demo.md 1.6)
    const dimNonForm = frame.formSpotlight * 0.44;
    const dimNonCta = frame.ctaSpotlight * 0.5;
    const dimNonBaridi = frame.baridiSpotlight * 0.48;

    const headerOpacity = 1 - Math.max(dimNonForm, dimNonCta, dimNonBaridi);
    const formOpacity = 1 - Math.max(dimNonCta, dimNonBaridi);
    const ctaSectionOpacity = 1 - Math.max(dimNonForm, dimNonBaridi);
    const paymentSectionOpacity = 1 - Math.max(dimNonForm, dimNonCta);

    // Pure GPU compositor opacity dimming (avoids 60fps continuous filter:blur raster thrashing!)
    const headerBlur = undefined;
    const formBlur = undefined;
    const ctaBlur = undefined;
    const paymentBlur = undefined;

    const promoOpacity = Math.max(0, 1 - theme * 2.4);
    const formSuccess = collapse >= 0.45;

    return (
      <div style={{ perspective: '1400px' }} className="relative w-full">
        <div
          className="relative w-full"
          style={{
            transform: `translate3d(${frame.vineBoom.shakeX}px, ${frame.cameraTranslateY}px, 0) scale(${frame.cameraScale}) rotateX(${frame.cameraRotateX}deg) rotateY(${frame.cameraRotateY}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <div
            className="relative w-full overflow-hidden rounded-[26px] border"
            style={{
              backgroundColor: outerBg,
              borderColor:
                frame.vineBoom.whiteFlash > 0.35
                  ? `rgba(255, 255, 255, ${0.65 + frame.vineBoom.whiteFlash * 0.35})`
                  : frame.vineBoom.impact > 0.05
                    ? `rgba(239, 68, 68, ${0.6 + frame.vineBoom.impact * 0.4})`
                    : cardBorder,
              boxShadow:
                frame.vineBoom.impact > 0.05
                  ? `0 24px 70px rgba(239, 68, 68, ${0.24 + frame.vineBoom.impact * 0.32}), inset 0 0 0 2px rgba(239,68,68,${0.3 + frame.vineBoom.impact * 0.6})`
                  : theme > 0.5
                    ? 'inset 0 1px 0 rgba(255,255,255,0.22), 0 28px 70px rgba(0, 0, 0, 0.58)'
                    : '0 20px 50px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Deterministic Specular Top Rim Light Sweep on dark obsidian stage */}
            {isDark && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[1.5px]"
                style={{
                  background: `linear-gradient(90deg, transparent ${frame.specularSweepPct - 24}%, rgba(245,245,242,0.55) ${frame.specularSweepPct}%, transparent ${frame.specularSweepPct + 24}%)`,
                }}
              />
            )}

            {/* Garish Red Promo Marquee (dissolves cleanly as Avant morphs to Apres) */}
            {promoOpacity > 0.02 && (
              <div
                className="overflow-hidden bg-[#dc2626] py-1.5 text-white border-b-2 border-[#facc15]"
                style={{ opacity: promoOpacity * headerOpacity }}
              >
                <div
                  className="flex whitespace-nowrap gap-8 text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-avant)',
                    transform: `translate3d(${frame.marqueeOffsetPx}px, 0, 0)`,
                  }}
                >
                  <span>PROMO -50% AUJOURD&apos;HUI SEULEMENT !! LIVRAISON 58 WILAYAS !!</span>
                  <span>DERNIÈRES PIÈCES EN STOCK !! PAIEMENT À LA LIVRAISON OU BARIDIMOB !!</span>
                  <span>PROMO -50% AUJOURD&apos;HUI SEULEMENT !! LIVRAISON 58 WILAYAS !!</span>
                </div>
              </div>
            )}

            {/* Storefront Header & Product Showcase Strip */}
            <div
              className={compact ? 'px-4 pt-3 pb-2 space-y-2.5' : 'px-5 pt-4 pb-2.5 space-y-3'}
              style={{ opacity: headerOpacity, filter: headerBlur }}
            >
              <div
                className="flex items-center justify-between border-b pb-2"
                style={{ borderColor: cardBorder }}
              >
                <div className="flex items-center gap-2.5">
                  {isDark && (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#f5f5f2] font-display text-[11px] font-bold text-[#060607]">
                      A4
                    </span>
                  )}
                  <span
                    className="font-bold tracking-tight"
                    style={{
                      color: primaryText,
                      fontFamily: isDark ? 'var(--font-display)' : 'var(--font-avant-serif)',
                      fontSize: compact ? '15px' : '16px',
                      letterSpacing: isDark ? '0.14em' : '0em',
                    }}
                  >
                    {isDark ? ATLAS_JACKET.brand : 'DZ_FASHION_SHOP_16'}
                  </span>
                </div>

                {isDark ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                    <LockKey size={12} weight="fill" />
                    58 WILAYAS · RLS
                  </span>
                ) : (
                  <span className="rounded-xs border border-[#ca8a04] bg-[#fef08a] px-2 py-0.5 text-[10px] font-bold text-[#991b1b] tabular-nums">
                    FIN PROMO: 00:14:52
                  </span>
                )}
              </div>

              {/* Product Card: Veste Oversize Atlas - 7 800 DA */}
              <div
                className="flex items-center gap-3.5 border p-2.5"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  borderRadius: `${Math.round(lerp(4, 16, theme))}px`,
                }}
              >
                <div
                  className={`relative shrink-0 overflow-hidden bg-[#0a0b0d] border ${
                    compact ? 'h-22 w-18' : 'h-24 w-20'
                  }`}
                  style={{
                    borderColor: cardBorder,
                    borderRadius: `${Math.round(lerp(2, 12, theme))}px`,
                  }}
                >
                  <img
                    src={ATLAS_JACKET.heroImage}
                    alt={ATLAS_JACKET.name}
                    loading="eager"
                    decoding="sync"
                    className="h-full w-full object-cover"
                  />
                  {promoOpacity > 0.1 && (
                    <span
                      className="absolute top-0.5 left-0.5 bg-[#dc2626] px-1 py-0.5 text-[8px] font-black text-[#fef08a]"
                      style={{ opacity: promoOpacity }}
                    >
                      -50%
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="font-bold leading-tight truncate"
                    style={{
                      color: primaryText,
                      fontFamily: isDark ? 'var(--font-display)' : 'var(--font-avant-serif)',
                      fontSize: compact ? '18px' : '19px',
                    }}
                  >
                    {ATLAS_JACKET.name}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2.5 tabular-nums">
                    <span
                      className="font-bold"
                      style={{
                        color: isDark ? '#f5f5f2' : '#dc2626',
                        fontFamily: isDark ? 'var(--font-mono)' : 'var(--font-avant)',
                        fontSize: compact ? '20px' : '22px',
                      }}
                    >
                      {formatDzd(ATLAS_JACKET.priceDzd)}
                    </span>
                    {promoOpacity > 0.1 && (
                      <span
                        className="text-[12px] text-[#9ca3af] line-through"
                        style={{ opacity: promoOpacity }}
                      >
                        {formatDzd(ATLAS_JACKET.compareAtPriceDzd)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {isDark ? (
                      <span className="font-mono text-[11px] text-[#a1a1aa]">
                        {ATLAS_JACKET.fabricSpec} · Taille L
                      </span>
                    ) : (
                      <span className="bg-[#ffedd5] border border-[#fb923c] px-1.5 py-0.5 text-[10px] font-bold text-[#9a3412]">
                        47 personnes regardent cet article !
                      </span>
                    )}
                  </div>
                </div>

                {frame.act === 1 && frame.auditMarkersProgress > 0.25 && (
                  <div
                    className="shrink-0 rounded-lg border border-red-500 bg-red-600 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white shadow-lg"
                    style={{ opacity: frame.auditMarkersProgress }}
                  >
                    AUDIT LIVE
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Form + Payment + CTA Core Body */}
            <div className={compact ? 'px-4 pb-4 space-y-2.5' : 'px-5 pb-5 space-y-3'}>
              {/* 9-Field -> 3-Field Zero-Smear Collapsing Form Module */}
              <div
                className="relative border p-3"
                style={{
                  opacity: formOpacity,
                  filter: formBlur,
                  backgroundColor: cardBg,
                  borderColor:
                    frame.formSpotlight > 0.2 && !formSuccess
                      ? `rgba(239, 68, 68, ${0.45 + frame.formSpotlight * 0.55})`
                      : formSuccess
                        ? 'rgba(16, 185, 129, 0.42)'
                        : cardBorder,
                  borderRadius: `${Math.round(lerp(4, 16, theme))}px`,
                  boxShadow:
                    frame.formSpotlight > 0.2
                      ? `0 0 0 2px rgba(${formSuccess ? '16,185,129' : '239,68,68'}, ${frame.formSpotlight * 0.5})`
                      : 'none',
                }}
              >
                {/* Act 1 Surgical Callout Tag #01 */}
                {frame.act === 1 && frame.auditMarkersProgress > 0.2 && (
                  <span
                    className="absolute -top-2.5 left-3 rounded bg-red-600 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow"
                    style={{ opacity: frame.auditMarkersProgress }}
                  >
                    FAILLE 01
                  </span>
                )}

                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="font-mono text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: mutedText }}
                  >
                    {formSuccess
                      ? 'Checkout Express (3 champs essentiels)'
                      : 'Formulaire COD Classique'}
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tabular-nums"
                    style={{
                      backgroundColor: formSuccess
                        ? 'rgba(16, 185, 129, 0.16)'
                        : 'rgba(239, 68, 68, 0.16)',
                      color: formSuccess ? '#34d399' : '#f87171',
                    }}
                  >
                    {formSuccess ? '3 CHAMPS · EXPRESS' : '9 CHAMPS BLOQUANTS'}
                  </span>
                </div>

                {/* 2-Stage Zero-Smear Grid: removed fields slide out & vanish cleanly before collapse completes */}
                <div
                  className={`grid ${compact && !formSuccess ? 'gap-1.5' : 'gap-2'}`}
                  style={{
                    gridTemplateColumns: collapse > 0.35 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                  }}
                >
                  {AVANT_COD_FIELDS.map((field, idx) => {
                    // Unmount removed fields cleanly as soon as collapse reaches 0.72 (zero squished ghosts at t=11s!)
                    if (!field.kept && collapse >= 0.72) return null;

                    const fadeOut = field.kept ? 1 : clamp01(1 - collapse * 2.1);
                    const slideX = field.kept ? 0 : collapse * 28;
                    const maxH = field.kept ? 68 : Math.max(0, Math.round((1 - collapse / 0.72) * 52));
                    const isStruck = !field.kept && strike > 0.15;

                    const displayLabel =
                      field.kept && formSuccess
                        ? field.id === 'nom'
                          ? 'Nom complet'
                          : field.id === 'telephone'
                            ? 'Numéro (+213)'
                            : 'Wilaya (58 Wilayas)'
                        : `${idx + 1}. ${field.label}`;

                    const displayVal =
                      field.kept && formSuccess
                        ? field.id === 'nom'
                          ? 'Amine Benali'
                          : field.id === 'telephone'
                            ? '0554 82 19 40'
                            : '16 - Alger · الجزائر (Stop-Desk 400 DA · 24h)'
                        : field.placeholder;

                    return (
                      <div
                        key={field.id}
                        className={field.spanTwo || collapse > 0.35 ? 'col-span-full' : 'col-span-1'}
                        style={{
                          opacity: fadeOut,
                          maxHeight: `${maxH}px`,
                          overflow: 'hidden',
                          transform: `translate3d(${slideX}px, 0, 0)`,
                        }}
                      >
                        <div className="mb-0.5 flex items-center justify-between">
                          <span
                            className={`${compact && !formSuccess ? 'text-[11px]' : 'text-[12px]'} font-semibold ${
                              isStruck ? 'line-through text-red-400' : ''
                            }`}
                            style={{ color: isStruck ? '#f87171' : mutedText }}
                          >
                            {displayLabel}
                          </span>
                          {isStruck && (
                            <span className="font-mono text-[9px] font-bold text-red-400">
                              SUPPRIMÉ
                            </span>
                          )}
                        </div>
                        <div
                          className="flex items-center justify-between border px-3"
                          style={{
                            height: formSuccess ? '40px' : compact ? '25px' : '30px',
                            backgroundColor: isStruck ? 'rgba(239, 68, 68, 0.14)' : inputBg,
                            borderColor: isStruck
                              ? '#ef4444'
                              : field.kept && formSuccess
                                ? 'rgba(245, 245, 242, 0.16)'
                                : inputBorder,
                            borderRadius: `${Math.round(lerp(3, 11, theme))}px`,
                            color:
                              field.kept && formSuccess
                                ? isDark
                                  ? '#f5f5f2'
                                  : '#111827'
                                : '#9ca3af',
                            fontSize: formSuccess ? '14px' : '11px',
                            fontFamily:
                              field.id === 'telephone' && formSuccess
                                ? 'var(--font-mono)'
                                : undefined,
                          }}
                        >
                          <span className="truncate">{displayVal}</span>
                          {field.kept && formSuccess && (
                            <CheckCircle
                              size={15}
                              weight="fill"
                              className="shrink-0 text-emerald-400"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Verification Zone: BaridiMob Screenshot Upload -> PostgreSQL HMAC 18us + Agent IA 2s */}
              <div className="relative" style={{ opacity: paymentSectionOpacity, filter: paymentBlur }}>
                {swap < 0.55 ? (
                  <div
                    className="relative overflow-hidden border-2 border-dashed p-3"
                    style={{
                      opacity: 1 - swap * 1.8,
                      borderColor:
                        frame.vineBoom.whiteFlash > 0.35
                          ? '#ffffff'
                          : frame.baridiSpotlight > 0.2
                            ? '#ef4444'
                            : 'rgba(239, 68, 68, 0.78)',
                      backgroundColor:
                        frame.baridiSpotlight > 0.2
                          ? 'rgba(127, 29, 29, 0.36)'
                          : isDark
                            ? 'rgba(127, 29, 29, 0.18)'
                            : '#fef2f2',
                      borderRadius: `${Math.round(lerp(4, 14, theme))}px`,
                      boxShadow:
                        frame.vineBoom.impact > 0.05
                          ? `0 0 0 3px rgba(239, 68, 68, ${0.45 + frame.vineBoom.impact * 0.55})`
                          : 'none',
                    }}
                  >
                    {/* Soft Background Radial Shockwave Ring behind text on Vine Boom 22.83s */}
                    {frame.vineBoom.shockwave > 0.02 && frame.vineBoom.shockwave < 0.98 && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-1/2 z-0 rounded-full border border-red-400/70"
                        style={{
                          width: `${96 + frame.vineBoom.shockwave * 240}px`,
                          height: `${96 + frame.vineBoom.shockwave * 240}px`,
                          opacity: (1 - frame.vineBoom.shockwave) * 0.34,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <WarningOctagon
                          size={18}
                          weight="fill"
                          className="shrink-0 text-red-500"
                        />
                        <span
                          className="font-bold leading-snug truncate"
                          style={{
                            color: isDark ? '#fecaca' : '#991b1b',
                            fontSize: compact ? '13px' : '13.5px',
                          }}
                        >
                          Envoyez une capture d&apos;écran BaridiMob (Upload Screenshot)
                        </span>
                      </div>
                      <span className="shrink-0 rounded bg-red-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                        {frame.fraudEditProgress > 0.35 ? 'FAUX REÇU !' : 'FAILLE 03'}
                      </span>
                    </div>

                    <div className="relative z-10 mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${
                            isDark
                              ? 'border-red-400/50 bg-black/35 text-red-200'
                              : 'border-red-300 bg-red-100 text-red-800'
                          }`}
                        >
                          recu_baridimob.png
                        </span>
                        <span
                          className="truncate font-mono text-[11px] font-bold"
                          style={{
                            color:
                              frame.fraudEditProgress > 0.35
                                ? '#fca5a5'
                                : isDark
                                  ? '#a1a1aa'
                                  : '#7f1d1d',
                          }}
                        >
                          {frame.fraudEditProgress > 0.35
                            ? '780 DA → 7 800 DA (Édité !)'
                            : 'Confirmation manuelle 24h'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Replaced Production Architecture: PostgreSQL HMAC Webhook + Inline AI Confirmation Agent */
                  <div className="space-y-2">
                    <div
                      className="rounded-xl border border-emerald-500/40 bg-emerald-500/[0.09] p-3"
                      style={{
                        opacity: frame.hmacRevealProgress,
                        transform: `translate3d(0, ${(1 - frame.hmacRevealProgress) * 10}px, 0)`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <ShieldCheck
                            size={19}
                            weight="fill"
                            className="shrink-0 text-emerald-400"
                          />
                          <span className="font-mono text-[12px] font-bold text-emerald-200 truncate">
                            Webhook HMAC Vérifié - 18 µs - PostgreSQL RLS Locked
                          </span>
                        </div>
                        <span className="shrink-0 rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                          ANTI-REPLAY
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-[#a1a1aa]">
                        <span>sig: sha256:9f4e8c...c81a</span>
                        <span className="text-emerald-300">UNIQUE(tx_ref) · 0 Fraude</span>
                      </div>
                    </div>

                    <div
                      className="rounded-xl border border-white/[0.12] bg-[#0b0d11] p-3"
                      style={{
                        opacity: frame.aiAgentRevealProgress,
                        transform: `translate3d(0, ${(1 - frame.aiAgentRevealProgress) * 10}px, 0)`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400"
                            style={{
                              opacity: 0.45 + frame.deterministicPulse * 0.55,
                              transform: `scale(${0.86 + frame.deterministicPulse * 0.2})`,
                            }}
                          />
                          <span className="font-display text-[13px] font-bold text-[#f5f5f2]">
                            Agent IA : Commande confirmée en 2s
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                          <Sparkle size={11} weight="fill" />
                          00:02s
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-[#a1a1aa]">
                        <span className="truncate">WhatsApp auto · Alger 16 · Expédition 24h</span>
                        <span className="shrink-0 text-red-400/75 line-through">24h attente</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Morphing CTA Button + Animated WCAG & 56px Thumb Caliper */}
              <div className="relative" style={{ opacity: ctaSectionOpacity, filter: ctaBlur }}>
                {frame.ctaCaliperProgress > 0.05 && (
                  <div
                    className="mb-2 space-y-1.5 font-mono text-[11px]"
                    style={{ opacity: frame.ctaCaliperProgress }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-md border border-white/15 bg-[#0a0b0e] px-2.5 py-0.5 text-[#f5f5f2] tabular-nums">
                        min-h-[56px] · Zone Pouce Mobile
                      </span>
                      <span className="rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-0.5 font-bold text-emerald-300 tabular-nums">
                        Contraste {lerp(1.54, 18.6, ctaMorph).toFixed(1)}:1{' '}
                        {ctaMorph > 0.6 ? 'WCAG AAA' : 'FAIL'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.1]">
                      <div
                        className="h-full origin-left rounded-full"
                        style={{
                          transform: `scaleX(${0.12 + ctaMorph * 0.88})`,
                          backgroundColor: ctaMorph > 0.5 ? '#10b981' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div
                  className="flex w-full items-center justify-between gap-2 px-3.5 sm:px-4"
                  style={{
                    backgroundColor: ctaBg,
                    color: ctaColor,
                    height: `${ctaHeight}px`,
                    borderRadius: `${ctaRadius}px`,
                    border:
                      frame.ctaSpotlight > 0.25
                        ? `2px solid ${ctaMorph > 0.5 ? '#10b981' : '#ef4444'}`
                        : ctaMorph > 0.5
                          ? '1px solid rgba(255,255,255,0.22)'
                          : '1px solid #cbd5e1',
                    boxShadow:
                      ctaMorph > 0.5 ? '0 14px 36px rgba(245, 245, 242, 0.16)' : 'none',
                  }}
                >
                  <div
                    className={`min-w-0 flex-1 truncate ${ctaMorph > 0.45 ? 'text-left' : 'text-center'}`}
                    style={{
                      fontFamily: ctaMorph > 0.45 ? 'var(--font-display)' : 'var(--font-avant)',
                      fontWeight: ctaMorph > 0.45 ? 700 : 400,
                      fontSize: `${Math.round(lerp(12, 15, ctaMorph))}px`,
                    }}
                  >
                    {ctaMorph > 0.45 ? (
                      <>
                        Commander<span className="hidden sm:inline"> maintenant</span> ·{' '}
                        <span className="whitespace-nowrap font-mono tabular-nums">
                          {formatDzd(displayTotal)}
                        </span>
                      </>
                    ) : (
                      'Envoyer ma commande'
                    )}
                  </div>

                  {ctaMorph > 0.35 && (
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#060607] text-[#f5f5f2]"
                      style={{
                        opacity: Math.min(1, (ctaMorph - 0.35) / 0.45),
                        transform: `scale(${0.7 + Math.min(1, (ctaMorph - 0.35) / 0.45) * 0.3})`,
                      }}
                    >
                      <ArrowUpRight size={17} weight="bold" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Crisp Perimeter-Only Vine Boom Strike Ring (zero muddy haze over receipt!) */}
            {frame.vineBoom.flashOpacity > 0.01 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[26px]"
                style={{
                  opacity: frame.vineBoom.flashOpacity,
                  boxShadow: `inset 0 0 46px rgba(239, 68, 68, 0.85), inset 0 0 0 3px ${
                    frame.vineBoom.whiteFlash > 0.35 ? '#ffffff' : '#ef4444'
                  }`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

TransformingCheckoutStage.displayName = 'TransformingCheckoutStage';
