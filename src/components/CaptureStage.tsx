import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { ATLAS_JACKET, AGENCY_BRAND } from '../data/product';
import { easeOutQuart, progressBetween } from '../engine/easing';
import { TIMELINE_DURATION, computeTimelineFrame } from '../engine/timeline';
import { ObsidianShaderBackdrop } from './ObsidianShaderBackdrop';
import { OversizedCursor } from './OversizedCursor';
import { KineticCaptionBar } from './KineticCaptionBar';
import { TransformingCheckoutStage } from './TransformingCheckoutStage';
import { ContextualPanel } from './ContextualPanel';
import { FounderPersonaPip } from './FounderPersonaPip';

export type CaptureViewport = '9x16' | '16x9';

export interface CaptureStageProps {
  viewport: CaptureViewport;
  theme?: 'dark' | 'light';
  initialTime?: number;
}

/**
 * Deterministic 60fps HyperFrames / Motionmaxxing Video Capture Stage (`?capture=1`).
 * - Pure synchronous f(t) driven by window.__seek(t) via ReactDOM.flushSync.
 * - Supports BOTH Dark Mode (Obsidian Titanium Silk) and Light Mode (`?theme=light`, Satin Porcelain-Pearl Silk).
 */
export const CaptureStage: React.FC<CaptureStageProps> = ({
  viewport,
  theme = 'dark',
  initialTime = 0,
}) => {
  const isLight = theme === 'light';
  const [time, setTime] = useState<number>(() =>
    Number.isFinite(initialTime) ? Math.max(0, Math.min(TIMELINE_DURATION, initialTime)) : 0
  );

  useEffect(() => {
    let cancelled = false;
    document.documentElement.setAttribute('data-capture', 'true');
    window.__duration = TIMELINE_DURATION;
    window.__viewport = viewport;
    window.__seekReady = false;

    window.__seek = (rawT: number): number => {
      const safeT = Number.isFinite(rawT)
        ? Math.max(0, Math.min(TIMELINE_DURATION, rawT))
        : 0;
      flushSync(() => {
        setTime(safeT);
      });
      return safeT;
    };

    const preloadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        if (typeof img.decode === 'function') {
          img.decode().then(() => resolve()).catch(() => resolve());
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

    const preloadFonts = async () => {
      if (!document.fonts) return;
      await Promise.allSettled([
        document.fonts.load('700 48px "Space Grotesk"'),
        document.fonts.load('600 20px "Space Grotesk"'),
        document.fonts.load('500 18px "Plus Jakarta Sans"'),
        document.fonts.load('700 18px "Plus Jakarta Sans"'),
        document.fonts.load('500 16px "JetBrains Mono"'),
        document.fonts.load('700 16px "JetBrains Mono"'),
        document.fonts.load('700 24px "Cairo"', 'الديڨاااا الجزائر'),
        document.fonts.ready,
      ]);
    };

    Promise.all([
      preloadFonts(),
      preloadImage(ATLAS_JACKET.heroImage),
      preloadImage(ATLAS_JACKET.detailImage),
      preloadImage('/persona/pose_01_explaining.png'),
      preloadImage('/persona/pose_02_vineboom_shock.png'),
      preloadImage('/persona/pose_03_laughing_roast.png'),
      preloadImage('/persona/pose_04_skeptical_squint.png'),
      preloadImage('/persona/pose_05_facepalm_frustrated.png'),
      preloadImage('/persona/pose_06_mindblown_eureka.png'),
      preloadImage('/persona/pose_07_pointing_screen.png'),
      preloadImage('/persona/pose_08_coding_locked_in.png'),
      preloadImage('/persona/pose_09_arms_crossed_boss.png'),
      preloadImage('/persona/pose_10_pos_scanner_grin.png'),
      preloadImage('/persona/pose_11_four_fingers_deadpan.png'),
      preloadImage('/persona/pose_12_dog_sunset_accepting_fate.png'),
      preloadImage('/persona/pose_13_speed_trying_not_to_laugh.png'),
      preloadImage('/persona/pose_14_shush_wait_one_finger.png'),
      preloadImage('/persona/pose_15_shrug_deadpan.png'),
      preloadImage('/persona/pose_16_pointing_at_viewer_you.png'),
      preloadImage('/persona/pose_17_sipping_coffee_unbothered.png'),
      preloadImage('/persona/pose_18_cool_shades_smirk.png'),
    ]).then(() => {
      if (!cancelled) {
        window.__seekReady = true;
      }
    });

    return () => {
      cancelled = true;
      document.documentElement.removeAttribute('data-capture');
      delete window.__seek;
      delete window.__seekReady;
      delete window.__duration;
      delete window.__viewport;
    };
  }, [viewport]);

  const frame = computeTimelineFrame(time);
  const isVertical = viewport === '9x16';
  const titleRevealP =
    0.88 +
    0.12 *
      easeOutQuart(
        progressBetween(time, frame.chapter.windowStart, frame.chapter.windowStart + 0.32)
      );
  const grainShift = (Math.floor(time * 60) * 17) % 180;

  if (isVertical) {
    /**
     * 9:16 Vertical Capture Stage (1080 x 1920)
     * Strict Instagram Reels Safe Box: top 186px, left 60px, width 888px (right 948px clears IG right rail)
     */
    return (
      <div
        data-capture="true"
        data-viewport="9x16"
        data-theme={theme}
        className={`relative overflow-hidden ${isLight ? 'bg-[#f4f5f7] text-[#0f172a]' : 'bg-[#060607] text-[#f5f5f2]'}`}
        style={{ width: '1080px', height: '1920px' }}
      >
        {/* Layer 1: Synchronous Dual-Theme Holographic Liquid Silk WebGL Shader */}
        <ObsidianShaderBackdrop
          deterministicTime={time}
          crimsonIntensity={frame.shaderCrimson}
          emeraldIntensity={frame.shaderEmerald}
          lightMode={isLight}
          className="absolute inset-0 z-0"
        />

        {/* Layer 2: Full-Bleed V6 Vertical Cinema Safe Stage (X: 32..1048 = 1016px wide, Y: 94..1718) */}
        <div
          data-safe-box="true"
          className="relative z-10 flex flex-col justify-between"
          style={{
            position: 'absolute',
            top: '94px',
            left: '32px',
            width: '1016px',
            height: '1624px',
          }}
        >
          {/* Bold Large Headline + Prominent 2D Founder Reaction Cutout */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2.5 overflow-hidden pt-1">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[16px] font-bold ${
                  isLight
                    ? 'border-slate-900/15 bg-[#0f172a] text-emerald-300 shadow-sm'
                    : 'border-white/[0.18] bg-[#0b0d12]/86 text-emerald-300'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                {AGENCY_BRAND.handle}
              </div>
              <div
                className={`display-safe font-display text-[60px] font-bold leading-[0.96] tracking-[-0.035em] ${
                  isLight ? 'text-[#0f172a]' : 'text-[#f5f5f2]'
                }`}
                style={{
                  opacity: titleRevealP,
                  transform: `translate3d(0, ${(1 - titleRevealP) * 20}px, 0)`,
                }}
              >
                {frame.chapter.title}
              </div>
            </div>
            <div className="shrink-0">
              <FounderPersonaPip frame={frame} compact />
            </div>
          </div>

          {/* Center Hero Stage: True Edge-to-Edge 1016px Morphing Checkout (1.144x macro mobile readability!) */}
          <div className="flex flex-1 items-center justify-center overflow-visible">
            <div
              style={{
                width: '888px',
                transform: 'scale(1.144)',
                transformOrigin: 'center center',
              }}
            >
              <TransformingCheckoutStage frame={frame} compact />
            </div>
          </div>

          {/* Bottom Full-Width Contextual Code Diff / Fraud Forensics / AUDIT Reveal + Large Verbatim Darija Caption */}
          <div className="space-y-4 pb-1">
            <ContextualPanel frame={frame} compact theme={theme} />
            <KineticCaptionBar time={time} compact theme={theme} />
          </div>
        </div>

        {/* Layer 3: Curved-Arc Oversized Protagonist Cursor */}
        <OversizedCursor time={time} viewport="9x16" />

        {/* Layer 4: Subtle Vignette + Micro Grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40"
          style={{
            background: isLight
              ? 'radial-gradient(ellipse at 50% 48%, transparent 62%, rgba(15,23,42,0.12) 100%)'
              : 'radial-gradient(ellipse at 50% 48%, transparent 56%, rgba(3,3,5,0.52) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40 opacity-[0.03]"
          style={{
            backgroundImage: isLight
              ? 'radial-gradient(rgba(15,23,42,0.45) 0.5px, transparent 0.5px)'
              : 'radial-gradient(rgba(255,255,255,0.6) 0.5px, transparent 0.5px)',
            backgroundSize: '3px 3px',
            backgroundPosition: `${grainShift}px ${grainShift}px`,
          }}
        />
      </div>
    );
  }

  /**
   * 16:9 Widescreen Capture Stage (1920 x 1080)
   * Clean studio split with Holographic Silk ground + Kinetic Captions + Curved-Arc Cursor.
   */
  return (
    <div
      data-capture="true"
      data-viewport="16x9"
      data-theme={theme}
      className={`relative overflow-hidden ${isLight ? 'bg-[#f4f5f7] text-[#0f172a]' : 'bg-[#060607] text-[#f5f5f2]'}`}
      style={{ width: '1920px', height: '1080px' }}
    >
      {/* Layer 1: Synchronous Dual-Theme Holographic Liquid Silk Shader */}
      <ObsidianShaderBackdrop
        deterministicTime={time}
        crimsonIntensity={frame.shaderCrimson}
        emeraldIntensity={frame.shaderEmerald}
        lightMode={isLight}
        className="absolute inset-0 z-0"
      />

      {/* Layer 2: Safe Studio Stage */}
      <div
        data-safe-box="true"
        className="relative z-10 flex h-full w-full flex-col justify-between"
        style={{ padding: '44px 68px' }}
      >
        {/* Main 2-Column Studio Stage */}
        <div className="grid flex-1 grid-cols-12 items-center gap-12">
          {/* Left Hero Column (7 cols): Live Morphing Checkout Showcase with Vine Boom cushion */}
          <div className="col-span-7 px-5">
            <TransformingCheckoutStage frame={frame} compact={false} />
          </div>

          {/* Right Context Column (5 cols): Editorial Title + 2D Founder Reaction + Live Code Diff */}
          <div className="col-span-5 flex flex-col justify-center space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-mono text-[12px] font-semibold ${
                    isLight
                      ? 'border-slate-900/15 bg-[#0f172a] text-emerald-300 shadow-sm'
                      : 'border-white/[0.14] bg-[#0b0d12]/80 text-emerald-300'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {AGENCY_BRAND.name} · {AGENCY_BRAND.handle}
                </div>
                <div className="overflow-hidden">
                  <h1
                    className={`display-safe font-display text-[44px] font-bold leading-[1.03] tracking-[-0.035em] ${
                      isLight ? 'text-[#0f172a]' : 'text-[#f5f5f2]'
                    }`}
                    style={{
                      opacity: titleRevealP,
                      transform: `translate3d(0, ${(1 - titleRevealP) * 20}px, 0)`,
                    }}
                  >
                    {frame.chapter.title}
                  </h1>
                </div>
              </div>
              <div className="shrink-0">
                <FounderPersonaPip frame={frame} compact={false} />
              </div>
            </div>

            <ContextualPanel frame={frame} compact={false} theme={theme} />
          </div>
        </div>

        {/* Bottom Voice-Synced Kinetic Caption Strip */}
        <div className="pt-3">
          <KineticCaptionBar time={time} compact={false} theme={theme} />
        </div>
      </div>

      {/* Layer 3: Curved-Arc Oversized Protagonist Cursor */}
      <OversizedCursor time={time} viewport="16x9" />

      {/* Layer 4: Subtle Vignette + Micro Grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at 50% 50%, transparent 62%, rgba(15,23,42,0.12) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(3,3,5,0.46) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40 opacity-[0.028]"
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(rgba(15,23,42,0.45) 0.5px, transparent 0.5px)'
            : 'radial-gradient(rgba(255,255,255,0.6) 0.5px, transparent 0.5px)',
          backgroundSize: '3px 3px',
          backgroundPosition: `${grainShift}px ${grainShift}px`,
        }}
      />
    </div>
  );
};
