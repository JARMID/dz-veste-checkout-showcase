import React from 'react';
import { CursorClick, ShieldWarning, WarningOctagon } from '@phosphor-icons/react';
import { clamp01, lerp, type VineBoomPhysics } from '../engine/easing';

export interface BaridiMobFraudCardProps {
  fraudEditProgress: number;
  vineBoom: VineBoomPhysics;
  compact?: boolean;
  theme?: 'light' | 'dark';
}

export const BaridiMobFraudCard: React.FC<BaridiMobFraudCardProps> = React.memo(
  ({ fraudEditProgress, vineBoom, compact = false, theme = 'dark' }) => {
    const isLight = theme === 'light';
    const editedVisible = fraudEditProgress >= 0.35;
    // Physical stamp slam settling into place right at 22.83s peak
    const slamP = clamp01((fraudEditProgress - 0.25) / 0.55);
    const stampScale = lerp(1.24, 1.0, slamP) + vineBoom.impact * 0.04;
    const stampRotate = lerp(-2.2, 0, slamP);
    const lostDzd = Math.round(lerp(0, 7020, slamP));
    const chroma = Math.min(1.8, vineBoom.chromaPx);

    return (
      <div
        className={`relative w-full overflow-hidden rounded-[22px] border-2 ${
          isLight ? 'bg-[#fff5f5] text-[#18181b]' : 'bg-[#12080a]/95 text-[#f5f5f2]'
        }`}
        style={{
          borderColor:
            vineBoom.whiteFlash > 0.35
              ? isLight
                ? 'rgba(220, 38, 38, 0.95)'
                : `rgba(255, 255, 255, ${0.55 + vineBoom.whiteFlash * 0.45})`
              : `rgba(220, 38, 38, ${0.52 + vineBoom.impact * 0.44})`,
          boxShadow: `0 20px 60px rgba(239, 68, 68, ${isLight ? 0.12 + vineBoom.impact * 0.2 : 0.18 + vineBoom.impact * 0.34})`,
        }}
      >
        {/* Crimson Impact Header */}
        <div
          className={`flex items-center justify-between border-b px-4 py-2.5 ${
            isLight
              ? 'border-red-600/20 bg-red-600/10'
              : 'border-red-500/30 bg-red-600/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <WarningOctagon size={18} weight="fill" className={isLight ? 'text-red-600' : 'text-red-400'} />
            <span
              className={`font-mono text-[12px] font-bold uppercase tracking-wider ${
                isLight ? 'text-red-800' : 'text-red-200'
              }`}
            >
              Faille Critique : Capture Falsifiée
            </span>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-md bg-red-600 px-2 py-0.5 font-mono text-[10.5px] sm:text-[11px] font-bold text-white">
            PHOTOSHOP · 10s
          </span>
        </div>

        {/* Simulated Forged BaridiMob Mobile Receipt */}
        <div className={compact ? 'p-3.5 space-y-3' : 'p-5 space-y-4'}>
          <div
            className={`rounded-2xl border p-4 space-y-3 ${
              isLight
                ? 'border-red-900/12 bg-white shadow-xs'
                : 'border-white/[0.1] bg-[#0b0c10]'
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2.5 ${
                isLight ? 'border-zinc-200' : 'border-white/[0.08]'
              }`}
            >
              <div>
                <div
                  className={`font-mono text-[11px] uppercase tracking-widest ${
                    isLight ? 'text-zinc-700' : 'text-[#a1a1aa]'
                  }`}
                >
                  Algérie Poste · Reçu BaridiMob
                </div>
                <div
                  className={`font-mono text-[11px] tabular-nums ${
                    isLight ? 'text-zinc-500' : 'text-[#a1a1aa]'
                  }`}
                >
                  RIP 00799999 · REF #BM-449102
                </div>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                  isLight
                    ? 'border-amber-600/35 bg-amber-100 text-amber-900'
                    : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                }`}
              >
                calque_prix.psd
              </span>
            </div>

            {/* Amount Tampering Visual: 7 800 DA -> 780 DA with Photoshop selection marquee + crisp RGB split */}
            <div
              className={`relative rounded-xl border border-dashed p-3.5 ${
                isLight
                  ? 'border-red-500/60 bg-red-50/90'
                  : 'border-red-500/60 bg-red-500/[0.08]'
              }`}
            >
              <div
                className={`font-mono text-[11px] uppercase tracking-wider ${
                  isLight ? 'text-red-700 font-semibold' : 'text-red-300'
                }`}
              >
                Montant réel reçu vs capture falsifiée
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-nowrap items-baseline gap-2 sm:gap-2.5 tabular-nums min-w-0">
                  <span
                    className={`whitespace-nowrap font-mono font-bold ${
                      compact ? 'text-[21px]' : 'text-[16px] sm:text-[20px] xl:text-[24px]'
                    } ${
                      editedVisible
                        ? isLight
                          ? 'text-zinc-500 line-through decoration-red-600 decoration-2'
                          : 'text-[#a1a1aa] line-through decoration-red-500 decoration-2'
                        : isLight
                          ? 'text-zinc-900'
                          : 'text-[#f5f5f2]'
                    }`}
                  >
                    780 DA
                  </span>
                  <span className={`shrink-0 font-mono text-sm sm:text-base font-bold ${isLight ? 'text-red-600' : 'text-red-400'}`}>→</span>
                  <span
                    className={`whitespace-nowrap font-mono font-extrabold ${
                      isLight ? 'text-red-600' : 'text-red-400'
                    } ${compact ? 'text-[28px]' : 'text-[21px] sm:text-[26px] xl:text-[33px]'}`}
                    style={{
                      opacity: Math.max(0.2, fraudEditProgress),
                      transform: `scale(${0.92 + fraudEditProgress * 0.08 + vineBoom.impact * 0.05})`,
                      transformOrigin: 'left center',
                      textShadow:
                        chroma > 0.3
                          ? `${chroma.toFixed(1)}px 0 rgba(239,68,68,0.65), -${chroma.toFixed(1)}px 0 rgba(56,189,248,0.45)`
                          : 'none',
                    }}
                  >
                    7 800 DA
                  </span>
                </div>

                <div
                  className={`shrink-0 flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[11px] font-bold whitespace-nowrap ${
                    isLight
                      ? 'border-red-600/35 bg-red-600/10 text-red-700'
                      : 'border-red-400/50 bg-red-500/20 text-red-200'
                  }`}
                >
                  <CursorClick size={14} weight="fill" />
                  <span>+0 FAKE</span>
                </div>
              </div>

              {/* Physical Slammed Fraud Stamp */}
              <div
                className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-red-400/60 bg-red-600 px-3 py-2 text-white shadow-[0_8px_24px_rgba(239,68,68,0.35)]"
                style={{
                  transform: `scale(${stampScale}) rotate(${stampRotate}deg)`,
                  opacity: Math.max(0.25, slamP),
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldWarning size={17} weight="fill" className="shrink-0" />
                  <span className="truncate font-mono text-[11px] xl:text-[12px] font-extrabold uppercase tracking-wide">
                    FRAUDE DÉTECTÉE : MONTANT MODIFIÉ
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap font-mono text-[11px] font-bold tabular-nums">
                  -{lostDzd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DA
                </span>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center justify-between gap-3 px-1 font-mono text-[11px] xl:text-[12px] ${
              isLight ? 'text-red-900' : 'text-red-200/90'
            }`}
          >
            <span>Vérification par capture = perte directe de trésorerie</span>
            <span className={`shrink-0 whitespace-nowrap font-bold ${isLight ? 'text-red-700' : 'text-red-400'}`}>
              0% Sécurité
            </span>
          </div>
        </div>
      </div>
    );
  }
);

BaridiMobFraudCard.displayName = 'BaridiMobFraudCard';
