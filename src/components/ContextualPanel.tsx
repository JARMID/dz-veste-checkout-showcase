import React from 'react';
import {
  ArrowRight,
  CheckCircle,
  LockKey,
  Prohibit,
  ShieldCheck,
  Sparkle,
  WarningCircle,
} from '@phosphor-icons/react';
import { AGENCY_BRAND } from '../data/product';
import { clamp01, easeOutQuart, lerp, progressBetween } from '../engine/easing';
import type { TimelineFrameState } from '../engine/timeline';
import { VSCodeDiffPanel } from './VSCodeDiffPanel';
import { BaridiMobFraudCard } from './BaridiMobFraudCard';

export interface ContextualPanelProps {
  frame: TimelineFrameState;
  compact?: boolean;
  /** Visual surface theme (Capture Mode always defaults to dark obsidian) */
  theme?: 'light' | 'dark';
}

export const ContextualPanel: React.FC<ContextualPanelProps> = React.memo(
  ({ frame, compact = false, theme = 'dark' }) => {
    const { act, time } = frame;
    const isLight = theme === 'light';
    const outerClass = isLight ? 'liquid-bezel-outer' : 'bezel-dark-outer';
    const innerClass = isLight ? 'liquid-bezel-inner' : 'bezel-dark-inner';
    const inkPrimary = isLight ? 'text-[#09090b]' : 'text-[#f5f5f2]';
    const inkSecondary = isLight ? 'text-[#52525b]' : 'text-[#a1a1aa]';
    const borderHair = isLight ? 'border-[#09090b]/10' : 'border-white/[0.08]';
    const rowSurface = isLight
      ? 'border-[#09090b]/8 bg-[#f7f8fa]'
      : 'border-white/[0.08] bg-[#0a0b0e]';

    // Act 1: Initial Audit Baseline Telemetry with smooth staggered multi-property entrance
    if (act === 1) {
      const leaks = [
        { code: '01', title: 'Formulaire bloquant (9 champs)', impact: 'Friction mobile', start: 0.7 },
        { code: '02', title: 'Bouton gris illisible (1.54:1)', impact: 'WCAG FAIL', start: 1.45 },
        { code: '03', title: 'Upload capture BaridiMob', impact: 'Fraude 10s', start: 2.2 },
      ];
      return (
        <div className={`${outerClass} w-full`}>
          <div className={`${innerClass} ${compact ? 'p-5 space-y-3.5' : 'p-5 space-y-4'}`}>
            <div className={`flex items-center justify-between gap-3 border-b ${borderHair} pb-3`}>
              <div className="min-w-0">
                <div
                  className={`font-mono ${compact ? 'text-[14px]' : 'text-[11px]'} font-semibold uppercase tracking-[0.16em] ${
                    isLight ? 'text-red-600' : 'text-red-400'
                  }`}
                >
                  Audit Checkout DZ · En direct
                </div>
                <h3
                  className={`mt-0.5 font-display font-bold leading-tight ${inkPrimary} ${
                    compact ? 'text-[27px]' : 'text-[21px] xl:text-2xl'
                  }`}
                >
                  3 failles qui tuent vos commandes
                </h3>
              </div>
              <span
                className={`shrink-0 whitespace-nowrap rounded-xl border px-3.5 py-1.5 font-mono ${compact ? 'text-[15px]' : 'text-[12px]'} font-bold tabular-nums ${
                  isLight
                    ? 'border-red-600/25 bg-red-600/10 text-red-700'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                9 champs
              </span>
            </div>

            <div className="space-y-2.5">
              {leaks.map((leak) => {
                const p = easeOutQuart(progressBetween(time, leak.start, leak.start + 0.55));
                return (
                  <div
                    key={leak.code}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${rowSurface}`}
                    style={{
                      opacity: 0.22 + p * 0.78,
                      transform: `translate3d(${(1 - p) * 18}px, 0, 0) scale(${0.97 + p * 0.03})`,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`font-mono ${compact ? 'text-[16px]' : 'text-[12px]'} font-bold tabular-nums ${
                          isLight ? 'text-red-600' : 'text-red-400'
                        }`}
                      >
                        {leak.code}
                      </span>
                      <span
                        className={`font-semibold truncate ${inkPrimary} ${
                          compact ? 'text-[21px]' : 'text-[14px]'
                        }`}
                      >
                        {leak.title}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-md border px-3 py-1 font-mono ${compact ? 'text-[14px]' : 'text-[11px]'} font-bold ${
                        isLight
                          ? 'border-red-600/25 bg-red-600/10 text-red-700'
                          : 'border-red-500/30 bg-red-500/15 text-red-300'
                      }`}
                    >
                      {leak.impact}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Act 2 or early Act 4 before code diff enters: Friction / Contrast Diagnostic Card
    if (act === 2 || (act === 4 && time < 14.85)) {
      const isCtaDiagnostic = act === 4;
      const enterP = easeOutQuart(
        progressBetween(time, isCtaDiagnostic ? 12.67 : 5.48, isCtaDiagnostic ? 13.15 : 5.95)
      );
      return (
        <div
          className={`${outerClass} w-full`}
          style={{
            opacity: enterP,
            transform: `translate3d(0, ${(1 - enterP) * 16}px, 0) scale(${0.97 + enterP * 0.03})`,
          }}
        >
          <div className={`${innerClass} ${compact ? 'p-5 space-y-3.5' : 'p-5 space-y-4'}`}>
            <div className="flex items-center justify-between gap-2">
              <div
                className={`flex items-center gap-2 ${isLight ? 'text-red-600' : 'text-red-400'}`}
              >
                <WarningCircle size={compact ? 24 : 20} weight="fill" className="shrink-0" />
                <span className={`font-mono ${compact ? 'text-[16px]' : 'text-[12px]'} font-bold uppercase tracking-wider`}>
                  {isCtaDiagnostic ? 'Audit Accessibilité CTA' : 'Audit Friction Formulaire'}
                </span>
              </div>
              <span
                className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1 font-mono ${compact ? 'text-[14px]' : 'text-[11px]'} font-bold ${
                  isLight
                    ? 'border-red-600/25 bg-red-600/10 text-red-700'
                    : 'bg-red-500/20 border-red-500/40 text-red-300'
                }`}
              >
                {isCtaDiagnostic ? 'CONTRASTE 1.54:1' : '9 CHAMPS / 1 VESTE'}
              </span>
            </div>

            {isCtaDiagnostic ? (
              <div className={`rounded-xl border p-4 space-y-2.5 ${rowSurface}`}>
                <div className={`flex items-center justify-between font-mono ${compact ? 'text-[17px]' : 'text-[13px]'}`}>
                  <span className={inkSecondary}>Couleur texte / fond</span>
                  <span className={inkPrimary}>#9ca3af sur #d1d5db</span>
                </div>
                <div className={`flex items-center justify-between font-mono ${compact ? 'text-[17px]' : 'text-[13px]'}`}>
                  <span className={inkSecondary}>Hauteur cible mobile</span>
                  <span className={`font-bold ${isLight ? 'text-red-600' : 'text-red-400'}`}>
                    36px (trop petit &lt; 48px)
                  </span>
                </div>
                <div className={`flex items-center justify-between font-mono ${compact ? 'text-[17px]' : 'text-[13px]'}`}>
                  <span className={inkSecondary}>Perception acheteur</span>
                  <span className={`font-semibold ${isLight ? 'text-red-700' : 'text-red-300'}`}>
                    Semble désactivé
                  </span>
                </div>
              </div>
            ) : (
              <div className={`grid grid-cols-3 gap-2.5 font-mono ${compact ? 'text-[16px] font-bold' : 'text-[12px]'}`}>
                {[
                  { label: 'Nom', keep: true },
                  { label: 'Prénom', keep: false },
                  { label: 'Email', keep: false },
                  { label: 'Tél 1', keep: true },
                  { label: 'Tél 2', keep: false },
                  { label: 'Adresse', keep: false },
                  { label: 'Code Postal', keep: false },
                  { label: 'Commune', keep: false },
                  { label: 'Wilaya', keep: true },
                ].map((item, idx) => {
                  const rowP = easeOutQuart(
                    progressBetween(time, 5.55 + idx * 0.08, 5.95 + idx * 0.08)
                  );
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between rounded-xl border ${compact ? 'px-3.5 py-2.5' : 'px-2.5 py-2'} ${
                        item.keep
                          ? isLight
                            ? 'border-emerald-600/35 bg-emerald-600/12 text-emerald-800'
                            : 'border-emerald-500/35 bg-emerald-500/12 text-emerald-300'
                          : isLight
                            ? 'border-red-600/30 bg-red-600/10 text-red-700'
                            : 'border-red-500/30 bg-red-500/12 text-red-300'
                      }`}
                      style={{
                        opacity: 0.25 + rowP * 0.75,
                        transform: `translate3d(0, ${(1 - rowP) * 8}px, 0)`,
                      }}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.keep ? (
                        <CheckCircle size={compact ? 18 : 13} weight="fill" className="shrink-0" />
                      ) : (
                        <Prohibit size={compact ? 18 : 13} weight="bold" className="shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Acts 3, 4 (after 14.85s), 6: Live Floating Dark VS Code Diff Panel
    if (frame.activeDiffId) {
      const footerMetric =
        frame.activeDiffId === 'form'
          ? { label: 'Champs COD', before: '9 champs', after: '3 champs', accent: 'emerald' as const }
          : frame.activeDiffId === 'cta'
            ? {
                label: 'Contraste & Mobile',
                before: '1.54:1 · 36px',
                after: '18.6:1 AAA · 56px',
                accent: 'chalk' as const,
              }
            : {
                label: 'Sécurité & Confirmation',
                before: 'Capture 24h',
                after: 'HMAC 18 µs · IA 2s',
                accent: 'emerald' as const,
              };

      return (
        <VSCodeDiffPanel
          scriptId={frame.activeDiffId}
          typingProgress={frame.diffTypingProgress}
          opacity={frame.diffPanelOpacity}
          cursorBlinkOn={frame.cursorBlinkOn}
          compact={compact}
          footerMetric={footerMetric}
        />
      );
    }

    // Act 5: BaridiMob Forged Receipt Forensics (7 800 DA -> 780 DA)
    if (act === 5) {
      return (
        <BaridiMobFraudCard
          fraudEditProgress={frame.fraudEditProgress}
          vineBoom={frame.vineBoom}
          compact={compact}
          theme={theme}
        />
      );
    }

    // Act 7: Alive Playful Rating Morph + Count-Up Proof Metrics + Breathing AUDIT 48h CTA
    const morph = frame.ratingMorphProgress;
    const footerAlpha = clamp01(frame.auditFooterProgress);
    const countP = easeOutQuart(progressBetween(time, 41.0, 42.6));
    const fieldsVal = Math.round(lerp(9, 3, countP));
    const hmacVal = Math.round(lerp(0, 18, countP));
    const aiVal = Math.max(2, Math.round(lerp(24, 2, countP)));
    const breathingHalo = 0.14 + 0.1 * Math.sin(time * 2.5);
    const arrowNudgeX = Math.sin(time * 3.1) * 3.5;

    return (
      <div className="w-full space-y-3">
        <div className={`${outerClass} w-full`}>
          <div className={`${innerClass} ${compact ? 'p-4 space-y-3' : 'p-5 space-y-4'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`font-mono text-[11px] uppercase tracking-[0.16em] ${inkSecondary}`}>
                Verdict Final · Avant vs Après
              </span>
              <span
                className={`inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                  isLight
                    ? 'border-emerald-600/30 bg-emerald-600/10 text-emerald-800'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                }`}
              >
                <ShieldCheck size={13} weight="fill" />
                Optimisé JARMID
              </span>
            </div>

            <div
              className={`rounded-xl border px-3.5 py-2.5 ${
                isLight
                  ? 'border-red-600/25 bg-red-600/[0.06]'
                  : 'border-red-500/35 bg-red-500/[0.08]'
              }`}
              style={{
                opacity: 1 - morph * 0.2,
                transform: `scale(${1 - morph * 0.015})`,
              }}
            >
              <div
                className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${
                  isLight ? 'text-red-600' : 'text-red-400'
                }`}
              >
                Note de l&apos;ancienne page
              </div>
              <div
                className={`mt-0.5 font-display font-bold ${inkPrimary} ${
                  compact ? 'text-[18px]' : 'text-[18px] xl:text-[19px]'
                }`}
              >
                {AGENCY_BRAND.ratingAvant}
              </div>
            </div>

            <div
              className="grid grid-cols-3 gap-2"
              style={{
                opacity: Math.max(0.65, morph),
                transform: `translate3d(0, ${(1 - morph) * 12}px, 0)`,
              }}
            >
              <div className={`rounded-xl border p-2.5 text-center ${rowSurface}`}>
                <div className={`font-mono text-[19px] font-bold tabular-nums ${inkPrimary}`}>
                  {fieldsVal}
                </div>
                <div className={`font-mono text-[11px] font-semibold ${isLight ? 'text-[#3f3f46]' : 'text-[#d4d4d8]'}`}>Champs COD</div>
              </div>
              <div
                className={`rounded-xl border p-2.5 text-center ${
                  isLight
                    ? 'border-emerald-600/25 bg-emerald-600/[0.06]'
                    : 'border-emerald-500/30 bg-emerald-500/[0.08]'
                }`}
              >
                <div
                  className={`font-mono text-[19px] font-bold tabular-nums ${
                    isLight ? 'text-emerald-700' : 'text-emerald-300'
                  }`}
                >
                  {countP === 0 ? 'Aucun' : `${hmacVal} µs`}
                </div>
                <div
                  className={`font-mono text-[11px] font-semibold ${
                    isLight ? 'text-emerald-800' : 'text-emerald-200'
                  }`}
                >
                  HMAC RLS
                </div>
              </div>
              <div
                className={`rounded-xl border p-2.5 text-center ${
                  isLight
                    ? 'border-emerald-600/25 bg-emerald-600/[0.06]'
                    : 'border-emerald-500/30 bg-emerald-500/[0.08]'
                }`}
              >
                <div
                  className={`font-mono text-[19px] font-bold tabular-nums ${
                    isLight ? 'text-emerald-700' : 'text-emerald-300'
                  }`}
                >
                  {aiVal === 2 ? '2s' : `${aiVal}h`}
                </div>
                <div
                  className={`font-mono text-[11px] font-semibold ${
                    isLight ? 'text-emerald-800' : 'text-emerald-200'
                  }`}
                >
                  Agent IA
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-between gap-3 rounded-[22px] px-5 py-4 ${
            isLight ? 'bg-[#09090b] text-[#f5f5f2]' : 'bg-[#f5f5f2] text-[#060607]'
          }`}
          style={{
            opacity: footerAlpha,
            transform: `translate3d(0, ${(1 - footerAlpha) * 14}px, 0) scale(${0.95 + footerAlpha * 0.05})`,
            boxShadow: isLight
              ? `0 20px 56px rgba(9, 9, 11, ${breathingHalo + 0.08})`
              : `0 20px 56px rgba(245, 245, 242, ${breathingHalo})`,
          }}
        >
          <div className="min-w-0">
            <div
              className={`flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] ${
                isLight ? 'text-emerald-300' : 'text-[#52525b]'
              }`}
            >
              <LockKey size={13} weight="bold" />
              <span>
                {AGENCY_BRAND.handle} · {AGENCY_BRAND.name}
              </span>
            </div>
            <div
              className={`mt-0.5 font-display font-bold tracking-tight whitespace-nowrap ${
                compact ? 'text-[23px]' : 'text-[20px] xl:text-[24px]'
              }`}
            >
              {AGENCY_BRAND.ctaHeadline}
            </div>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isLight ? 'bg-[#f5f5f2] text-[#09090b]' : 'bg-[#060607] text-[#f5f5f2]'
            }`}
            style={{ transform: `translate3d(${arrowNudgeX}px, 0, 0)` }}
          >
            {compact ? <Sparkle size={20} weight="fill" /> : <ArrowRight size={20} weight="bold" />}
          </div>
        </div>
      </div>
    );
  }
);

ContextualPanel.displayName = 'ContextualPanel';
