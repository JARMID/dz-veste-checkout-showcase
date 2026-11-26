import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll } from 'motion/react';
import Lenis from 'lenis';
import {
  ArrowRight,
  ArrowUpRight,
  Moon,
  Pause,
  Play,
  SpeakerHigh,
  SpeakerSlash,
  Sun,
  WhatsappLogo,
} from '@phosphor-icons/react';
import { AGENCY_BRAND, ATLAS_JACKET } from '../data/product';
import {
  CHAPTERS,
  TIMELINE_DURATION,
  VINE_BOOM_PEAK,
  computeTimelineFrame,
} from '../engine/timeline';
import { ObsidianShaderBackdrop } from './ObsidianShaderBackdrop';
import { LiquidGlassSurface, MagneticPill } from './LiquidGlassSurface';
import { MagneticCursor } from './MagneticCursor';
import { HeroApertureExperience } from './HeroApertureExperience';
import { EditorialLookbook } from './EditorialLookbook';
import { OversizedCursor } from './OversizedCursor';
import { KineticCaptionBar } from './KineticCaptionBar';
import { AvantCheckoutView } from './AvantCheckoutView';
import { ApresStorefrontView } from './ApresStorefrontView';
import { BeforeAfterCompare } from './BeforeAfterCompare';
import { TransformingCheckoutStage } from './TransformingCheckoutStage';
import { ContextualPanel } from './ContextualPanel';
import { FounderPersonaPip } from './FounderPersonaPip';

type SandboxTab = 'apres' | 'avant' | 'split';
type ThemeMode = 'light' | 'dark';

function formatClock(sec: number): string {
  const clamped = Math.max(0, Math.min(TIMELINE_DURATION, sec));
  const m = Math.floor(clamped / 60);
  const s = Math.floor(clamped % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const VisitorExperience: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [sandboxTab, setSandboxTab] = useState<SandboxTab>('apres');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioFallback, setAudioFallback] = useState(false);
  const [timelineSec, setTimelineSec] = useState(3.0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastPerfRef = useRef<number | null>(null);
  const timeRef = useRef<number>(3.0);
  const isPlayingRef = useRef<boolean>(false);
  isPlayingRef.current = isPlaying;

  const cinemaRunwayRef = useRef<HTMLElement | null>(null);
  const sandboxRef = useRef<HTMLElement | null>(null);
  const auditRef = useRef<HTMLElement | null>(null);

  // Native sticky 340dvh Cinema Runway scroll coupling (zero GSAP pin-spacer jumps, zero viewport clipping!)
  const { scrollYProgress: cinemaScrollP } = useScroll({
    target: cinemaRunwayRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsub = cinemaScrollP.on('change', (v) => {
      if (!isPlayingRef.current) {
        const clamped = Math.max(0, Math.min(1, v));
        // Only let runway scroll drive timeline while actively inside the cinema runway
        if (clamped > 0.002 && clamped < 0.998) {
          const t = clamped * TIMELINE_DURATION;
          timeRef.current = t;
          setTimelineSec(t);
        }
      }
    });
    return () => unsub();
  }, [cinemaScrollP]);

  // Sync root data-theme attribute cleanly for CSS variables & color-scheme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const stopAudioLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastPerfRef.current = null;
  }, []);

  const pausePlayback = useCallback(() => {
    stopAudioLoop();
    setIsPlaying(false);
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [stopAudioLoop]);

  const scrollToElement = useCallback((el: HTMLElement | null, offset = -76) => {
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset, duration: 1.0 });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }, []);

  const handleSandboxJump = useCallback(
    (tab: SandboxTab) => {
      pausePlayback();
      setSandboxTab(tab);
      scrollToElement(sandboxRef.current, -82);
    },
    [pausePlayback, scrollToElement]
  );

  const handleJumpToAct = useCallback(
    (sec: number) => {
      pausePlayback();
      const clamped = Math.max(0, Math.min(TIMELINE_DURATION, sec));
      timeRef.current = clamped;
      setTimelineSec(clamped);
      if (cinemaRunwayRef.current) {
        const runwayTop = cinemaRunwayRef.current.getBoundingClientRect().top + window.scrollY;
        const travel = Math.max(1, cinemaRunwayRef.current.offsetHeight - window.innerHeight);
        const frac = clamped / TIMELINE_DURATION;
        const dest = runwayTop + travel * frac;
        if (lenisRef.current) {
          lenisRef.current.scrollTo(dest, { duration: 1.0 });
        } else {
          window.scrollTo({ top: dest, behavior: 'smooth' });
        }
      }
    },
    [pausePlayback]
  );

  const startPlayback = useCallback(
    (fromSec?: number) => {
      scrollToElement(cinemaRunwayRef.current, 0);
      const targetStart =
        typeof fromSec === 'number'
          ? Math.max(0, Math.min(TIMELINE_DURATION, fromSec))
          : timeRef.current >= TIMELINE_DURATION - 0.25
            ? 0
            : timeRef.current;

      timeRef.current = targetStart;
      setTimelineSec(targetStart);
      setIsPlaying(true);

      const audio = audioRef.current;
      if (audio) {
        try {
          audio.currentTime = targetStart;
          audio.muted = isMuted;
          const p = audio.play();
          if (p && typeof p.catch === 'function') {
            p.then(() => setAudioFallback(false)).catch(() => setAudioFallback(true));
          }
        } catch {
          setAudioFallback(true);
        }
      } else {
        setAudioFallback(true);
      }
    },
    [isMuted, scrollToElement]
  );

  const handleScrub = useCallback((nextSec: number) => {
    const clamped = Math.max(0, Math.min(TIMELINE_DURATION, nextSec));
    timeRef.current = clamped;
    setTimelineSec(clamped);
    if (audioRef.current && audioRef.current.readyState >= 1) {
      try {
        audioRef.current.currentTime = clamped;
      } catch {
        // Ignore seek before metadata ready
      }
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  // Single clean Lenis smooth wheel transport (native touch preserved!)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.088,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e: { progress?: number }) => {
      if (typeof e.progress === 'number' && Number.isFinite(e.progress)) {
        setScrollProgress(e.progress);
      }
    });

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Audio-Clock Master Playback Loop (when user clicks Play 49s)
  useEffect(() => {
    if (!isPlaying) {
      stopAudioLoop();
      return;
    }

    const tick = (now: number) => {
      const audio = audioRef.current;
      let nextTime = timeRef.current;

      if (audio && !audioFallback && !audio.paused && Number.isFinite(audio.currentTime)) {
        nextTime = audio.currentTime;
      } else {
        if (lastPerfRef.current === null) {
          lastPerfRef.current = now;
        }
        const dt = (now - lastPerfRef.current) / 1000;
        lastPerfRef.current = now;
        nextTime = timeRef.current + dt;
      }

      if (nextTime >= TIMELINE_DURATION) {
        timeRef.current = TIMELINE_DURATION;
        setTimelineSec(TIMELINE_DURATION);
        setIsPlaying(false);
        if (audio && !audio.paused) audio.pause();
        stopAudioLoop();
        return;
      }

      timeRef.current = nextTime;
      setTimelineSec(nextTime);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopAudioLoop();
  }, [isPlaying, audioFallback, stopAudioLoop]);

  const frame = computeTimelineFrame(timelineSec);
  const isLight = theme === 'light';

  return (
    <div
      data-theme={theme}
      className="relative min-h-[100dvh] w-full"
      style={{
        backgroundColor: 'var(--surface-canvas)',
        color: 'var(--ink-primary)',
      }}
    >
      {/* Mastered Khalef Voiceover Track (with Vine Boom peak at 22.83s) */}
      <audio ref={audioRef} src="/audio/hyper_master_preview.mp3" preload="metadata" />

      {/* Layer 0: Living Dual-Theme 3D-Normal Liquid Silk & Holographic Pearl/Titanium Shader */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <ObsidianShaderBackdrop
          lightMode={isLight}
          crimsonIntensity={frame.shaderCrimson * 0.82}
          emeraldIntensity={Math.max(0.26, frame.shaderEmerald)}
          scrollProgress={scrollProgress}
          className="h-full w-full"
        />
      </div>

      {/* Fine-Pointer Desktop Magnetic Cursor */}
      <MagneticCursor theme={theme} />

      {/* =====================================================================
          FLOATING CRYSTAL / OBSIDIAN LIQUID GLASS NAVBAR (Single Line, 60px)
          ===================================================================== */}
      <header className="fixed inset-x-0 top-3.5 z-40 mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-10">
        <div className="liquid-island flex h-14 sm:h-[60px] items-center justify-between gap-2 rounded-full px-3 sm:px-4">
          <button
            type="button"
            onClick={() => scrollToElement(document.getElementById('hero-experience'), 0)}
            className="cursor-pointer flex items-center gap-2.5 text-left shrink-0"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full font-display text-[11px] font-bold tracking-tight"
              style={{
                backgroundColor: 'var(--cta-bg)',
                color: 'var(--cta-fg)',
              }}
            >
              A4
            </span>
            <div className="leading-none">
              <div
                className="font-display text-xs font-bold tracking-[0.16em]"
                style={{ color: 'var(--ink-primary)' }}
              >
                {ATLAS_JACKET.brand}
              </div>
              <div className="font-mono text-[10px] font-medium" style={{ color: isLight ? '#3f3f46' : '#d4d4d8' }}>
                {AGENCY_BRAND.name} · {AGENCY_BRAND.handle}
              </div>
            </div>
          </button>

          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-1 rounded-full p-1"
            style={{
              backgroundColor: isLight ? 'rgba(9,9,11,0.04)' : 'rgba(255,255,255,0.04)',
              border: '1px solid var(--hairline)',
            }}
          >
            {[
              { label: 'Archive', action: () => scrollToElement(document.getElementById('lookbook'), -76) },
              { label: 'Film 49s', action: () => scrollToElement(cinemaRunwayRef.current, 0) },
              { label: 'Avant COD', action: () => handleSandboxJump('avant') },
              { label: 'Après JARMID', action: () => handleSandboxJump('apres') },
              { label: 'Split', action: () => handleSandboxJump('split') },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                  isLight ? 'hover:bg-black/[0.06] hover:text-[#09090b]' : 'hover:bg-white/[0.08] hover:text-white'
                }`}
                style={{ color: 'var(--ink-secondary)' }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div
              role="group"
              aria-label="Changer le thème Clair ou Sombre"
              className="flex items-center rounded-full p-0.5"
              style={{
                backgroundColor: isLight ? 'rgba(9,9,11,0.06)' : 'rgba(255,255,255,0.07)',
                border: '1px solid var(--hairline)',
              }}
            >
              {(
                [
                  { id: 'light', label: 'Clair', icon: Sun },
                  { id: 'dark', label: 'Sombre', icon: Moon },
                ] as const
              ).map((opt) => {
                const active = theme === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTheme(opt.id)}
                    className="relative cursor-pointer inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 font-mono text-[10.5px] font-semibold whitespace-nowrap transition-colors duration-150"
                    style={{
                      color: active ? '#09090b' : isLight ? '#27272a' : '#e4e4e7',
                    }}
                  >
                    {active && (
                      <motion.span
                        layoutId="theme-toggle-thumb"
                        transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                        className="absolute inset-0 rounded-full shadow-xs"
                        style={{
                          backgroundColor: isLight ? '#ffffff' : '#f5f5f2',
                        }}
                      />
                    )}
                    <Icon size={13} weight={active ? 'fill' : 'regular'} className="relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <MagneticPill strength={0.18}>
              <button
                type="button"
                data-cursor="PLAY 49S"
                aria-label={isPlaying ? 'Mettre en pause le film 49s' : 'Lancer le film 49s'}
                onClick={() => (isPlaying ? pausePlayback() : startPlayback())}
                className="cursor-pointer inline-flex h-9 w-9 sm:w-auto items-center justify-center sm:justify-between gap-2 rounded-full sm:pl-3.5 sm:pr-1.5 font-display text-xs font-bold whitespace-nowrap transition-transform duration-150 active:scale-[0.97]"
                style={{
                  backgroundColor: isPlaying ? 'var(--accent-emerald)' : 'var(--cta-bg)',
                  color: isPlaying ? '#ffffff' : 'var(--cta-fg)',
                }}
              >
                <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play 49s'}</span>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isPlaying
                      ? 'rgba(0,0,0,0.2)'
                      : isLight
                        ? 'rgba(255,255,255,0.16)'
                        : 'rgba(6,6,8,0.14)',
                  }}
                >
                  {isPlaying ? <Pause size={12} weight="fill" /> : <Play size={12} weight="fill" />}
                </span>
              </button>
            </MagneticPill>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ===================================================================
            SECTION 1: INTERACTIVE STICKY SCROLL HERO (270dvh Runway)
            =================================================================== */}
        <HeroApertureExperience
          theme={theme}
          onPlayFilm={() => startPlayback(0)}
          onJumpSandbox={() => handleSandboxJump('apres')}
          onJumpToAct={handleJumpToAct}
        />

        {/* ===================================================================
            SECTION 2: SCROLL-VELOCITY MARQUEE + MUSEUM EDITORIAL LOOKBOOK
            =================================================================== */}
        <EditorialLookbook
          theme={theme}
          onJumpToAct={handleJumpToAct}
          onJumpSandbox={() => handleSandboxJump('apres')}
        />

        {/* ===================================================================
            SECTION 3: VIEWPORT-LOCKED STICKY 49.43s CODE-TO-UI CINEMA THEATER
            Native 340dvh sticky runway -> 100% fits inside 768px-1080px viewports
            with ZERO top navbar clipping and ZERO bottom scrubber clipping!
            =================================================================== */}
        <section
          ref={cinemaRunwayRef}
          id="scroll-cinema"
          className="relative w-full lg:h-[340dvh]"
        >
          <div className="lg:sticky lg:top-0 lg:h-[100dvh] w-full flex items-center">
            <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between gap-2.5 px-4 sm:px-6 lg:px-10 pt-20 pb-3.5 lg:pt-[80px] lg:pb-3.5">
              {/* Center Balanced Theater Frame (Light Crystal Glass in Light Mode, Smoked Glass in Dark Mode) */}
              <div className="relative flex-1 min-h-0 flex items-center">
                <div
                  className={`relative w-full rounded-[28px] p-3 sm:p-3.5 lg:p-4 ${
                    isLight ? 'liquid-glass-shell' : 'bezel-dark-outer'
                  }`}
                >
                  <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
                    {/* Left: Compact Viewport-Safe Morphing Checkout Stage (clipped cleanly during Vine Boom zoom so it never bleeds into right text!) */}
                    <div className="lg:col-span-6 xl:col-span-7 overflow-hidden rounded-[24px] p-2">
                      <TransformingCheckoutStage frame={frame} compact />
                    </div>

                    {/* Right: Editorial Chapter Statement + 3D Founder Persona + Theme-Harmonized Contextual Panel + Voice Caption */}
                    <div className="relative z-20 lg:col-span-6 xl:col-span-5 flex flex-col justify-center space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider whitespace-nowrap"
                              style={{
                                borderColor:
                                  frame.act === 5
                                    ? 'rgba(220,38,38,0.4)'
                                    : 'var(--accent-emerald-border)',
                                backgroundColor:
                                  frame.act === 5
                                    ? 'rgba(220,38,38,0.1)'
                                    : 'var(--accent-emerald-soft)',
                                color:
                                  frame.act === 5
                                    ? isLight
                                      ? '#dc2626'
                                      : '#f87171'
                                    : 'var(--accent-emerald-text)',
                              }}
                            >
                              ACTE {frame.chapter.code} / 07
                            </span>
                            <span
                              className="font-mono text-[11px] font-semibold tabular-nums whitespace-nowrap"
                              style={{ color: 'var(--ink-muted)' }}
                            >
                              {isPlaying ? 'Voix Khalef · ' : ''}
                              {formatClock(timelineSec)} / {formatClock(TIMELINE_DURATION)}
                            </span>
                          </div>
                          <h3
                            className="font-display text-xl xl:text-2xl font-bold tracking-tight leading-tight"
                            style={{ color: 'var(--ink-primary)' }}
                          >
                            {frame.chapter.title}
                          </h3>
                          <p
                            className="text-xs xl:text-sm leading-snug"
                            style={{ color: 'var(--ink-secondary)' }}
                          >
                            {frame.chapter.captionSummary}
                          </p>
                        </div>
                        <div className="hidden sm:flex shrink-0 items-center justify-center rounded-[22px] p-1">
                          <div className="origin-center scale-[0.76]">
                            <FounderPersonaPip frame={frame} compact contained />
                          </div>
                        </div>
                      </div>

                      <ContextualPanel frame={frame} compact={false} theme={theme} />

                      <KineticCaptionBar time={timelineSec} compact={false} theme={theme} />
                    </div>

                    {/* Curved-Arc Oversized Protagonist Cursor */}
                    <div className="pointer-events-none hidden lg:block absolute inset-0 z-30">
                      <OversizedCursor time={timelineSec} viewport="16x9" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Single-Row Liquid Glass Scrubber Dock (Zero bottom viewport cutoff!) */}
              <LiquidGlassSurface
                theme={theme}
                className="group/glass shrink-0 rounded-2xl px-3.5 py-2.5"
              >
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                  {/* Play / Mute / Clock */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => (isPlaying ? pausePlayback() : startPlayback())}
                      className="cursor-pointer inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold whitespace-nowrap active:scale-[0.97]"
                      style={{
                        backgroundColor: 'var(--cta-bg)',
                        color: 'var(--cta-fg)',
                      }}
                    >
                      {isPlaying ? (
                        <Pause size={13} weight="fill" />
                      ) : (
                        <Play size={13} weight="fill" />
                      )}
                      <span>{isPlaying ? 'Pause' : 'Play 49s'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleMute}
                      aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                      className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-150"
                      style={{
                        border: '1px solid var(--hairline-strong)',
                        color: 'var(--ink-primary)',
                      }}
                    >
                      {isMuted ? <SpeakerSlash size={15} /> : <SpeakerHigh size={15} />}
                    </button>

                    <span
                      className="hidden sm:inline font-mono text-[11px] tabular-nums whitespace-nowrap"
                      style={{ color: 'var(--ink-secondary)' }}
                    >
                      {timelineSec.toFixed(1)}s
                      {audioFallback && isPlaying ? ' · muet' : ''}
                    </span>
                  </div>

                  {/* Inline Precision Scrubber with Crimson Vine Boom Tick */}
                  <div className="relative flex flex-1 min-w-[140px] items-center">
                    <div
                      title="Pic Vine Boom : 22.83s"
                      className="pointer-events-none absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-red-500"
                      style={{ left: `${(VINE_BOOM_PEAK / TIMELINE_DURATION) * 100}%` }}
                    />
                    <input
                      type="range"
                      aria-label="Timeline de transformation 49 secondes"
                      min={0}
                      max={TIMELINE_DURATION}
                      step={0.01}
                      value={timelineSec}
                      onChange={(e) => {
                        pausePlayback();
                        handleScrub(Number(e.target.value));
                      }}
                      className={`h-1.5 w-full cursor-pointer appearance-none rounded-full ${
                        isLight
                          ? 'bg-black/15 accent-[#09090b]'
                          : 'bg-white/15 accent-[#f5f5f2]'
                      }`}
                    />
                  </div>

                  {/* Compact 7-Act Jump Pills */}
                  <div className="flex flex-wrap items-center gap-1 shrink-0">
                    {CHAPTERS.map((ch) => {
                      const active = frame.act === ch.act;
                      return (
                        <button
                          key={ch.act}
                          type="button"
                          title={`${ch.code}. ${ch.title}`}
                          onClick={() => {
                            pausePlayback();
                            handleScrub(ch.act === 5 ? VINE_BOOM_PEAK : ch.windowStart + 1.5);
                          }}
                          className="cursor-pointer rounded-lg px-2 py-1 font-mono text-[10.5px] font-semibold whitespace-nowrap transition-colors duration-150"
                          style={{
                            backgroundColor: active
                              ? 'var(--cta-bg)'
                              : isLight
                                ? 'rgba(9,9,11,0.045)'
                                : 'rgba(255,255,255,0.05)',
                            color: active ? 'var(--cta-fg)' : isLight ? '#18181b' : '#e4e4e7',
                            border: active ? '1px solid transparent' : '1px solid var(--hairline-strong)',
                          }}
                        >
                          <span className="hidden xl:inline">{ch.code}. {ch.shortLabel}</span>
                          <span className="xl:hidden">{ch.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </LiquidGlassSurface>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 4: INTERACTIVE AVANT VS APRES 58-WILAYA SANDBOX
            =================================================================== */}
        <section
          ref={sandboxRef}
          id="sandbox"
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-14 lg:py-20 space-y-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="space-y-2">
              <h2
                className="display-safe font-display font-bold tracking-[-0.035em] leading-[1.02]"
                style={{
                  fontSize: 'clamp(2rem, 3.6vw, 3.1rem)',
                  color: 'var(--ink-primary)',
                }}
              >
                Testez les deux checkouts vous-même.
              </h2>
              <p className="text-sm sm:text-base" style={{ color: 'var(--ink-secondary)' }}>
                Basculez entre la boutique optimisée Atelier Atlas (58 Wilayas), l&apos;ancienne page
                COD et le comparateur rideau.
              </p>
            </div>

            <div
              className="flex items-center rounded-full p-1"
              style={{
                backgroundColor: isLight ? 'rgba(9,9,11,0.055)' : 'rgba(255,255,255,0.05)',
                border: '1px solid var(--hairline)',
              }}
            >
              {(
                [
                  { id: 'avant', label: 'Avant COD' },
                  { id: 'apres', label: 'Après JARMID' },
                  { id: 'split', label: 'Comparateur Split' },
                ] as const
              ).map((tab) => {
                const active = sandboxTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSandboxTab(tab.id)}
                    className="relative cursor-pointer rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors duration-150"
                    style={{
                      color: active ? 'var(--cta-fg)' : 'var(--ink-secondary)',
                    }}
                  >
                    {active && (
                      <motion.span
                        layoutId="sandbox-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: 'var(--cta-bg)' }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {sandboxTab === 'apres' && (
              <motion.div
                key={`apres-${theme}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <ApresStorefrontView interactive forceVerified={false} theme={theme} />
              </motion.div>
            )}

            {sandboxTab === 'avant' && (
              <motion.div
                key="avant"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <div className="lg:col-span-7">
                  <AvantCheckoutView interactive />
                </div>
                <div className="lg:col-span-5">
                  <div className={isLight ? 'liquid-bezel-outer' : 'bezel-dark-outer'}>
                    <div className={`${isLight ? 'liquid-bezel-inner' : 'bezel-dark-inner'} p-6 space-y-4`}>
                      <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
                        Autopsie de conversion
                      </div>
                      <h3
                        className="font-display text-2xl font-bold"
                        style={{ color: 'var(--ink-primary)' }}
                      >
                        {AGENCY_BRAND.ratingAvant}
                      </h3>
                      <div className="space-y-2.5 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-3">
                          <strong style={{ color: 'var(--ink-primary)' }}>1. Formulaire 9 champs :</strong>{' '}
                          Email, Téléphone 2 et Code Postal font fuir les acheteurs mobiles.
                        </div>
                        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-3">
                          <strong style={{ color: 'var(--ink-primary)' }}>2. Bouton gris 1.54:1 :</strong>{' '}
                          Hauteur 36px et contraste cassé : le bouton paraît désactivé.
                        </div>
                        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-3">
                          <strong style={{ color: 'var(--ink-primary)' }}>3. Capture BaridiMob :</strong>{' '}
                          7 800 DA devient 780 DA en 10 secondes sur Photoshop + 24h d&apos;attente.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSandboxTab('apres')}
                        className="cursor-pointer flex min-h-[48px] w-full items-center justify-between rounded-xl px-4 text-sm font-bold active:scale-[0.98]"
                        style={{
                          backgroundColor: 'var(--cta-bg)',
                          color: 'var(--cta-fg)',
                        }}
                      >
                        <span>Passer au Checkout Optimisé JARMID</span>
                        <ArrowRight size={17} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {sandboxTab === 'split' && (
              <motion.div
                key="split"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <BeforeAfterCompare theme={theme} />
                <p
                  className="text-center font-mono text-xs"
                  style={{ color: 'var(--ink-muted)' }}
                >
                  Glissez la poignée gauche / droite (ou flèches clavier) pour comparer Avant COD et
                  Après JARMID.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ===================================================================
            SECTION 5: MONUMENTAL EDITORIAL CLOSER (Commente AUDIT - Livré en 48h)
            =================================================================== */}
        <section
          ref={auditRef}
          id="audit-cta"
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-8 pb-20"
        >
          <LiquidGlassSurface
            theme={theme}
            tint="emerald"
            className="group/glass rounded-[32px] p-8 sm:p-12 lg:p-16"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              <div className="space-y-4 max-w-2xl">
                <div
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: 'var(--accent-emerald-text)' }}
                >
                  {AGENCY_BRAND.handle} · {AGENCY_BRAND.name} · LIVRAISON 48H
                </div>
                <h2
                  className="display-safe font-display font-bold leading-[0.98] tracking-[-0.04em]"
                  style={{
                    fontSize: 'clamp(2.4rem, 5.2vw, 4.4rem)',
                    color: 'var(--ink-primary)',
                  }}
                >
                  {AGENCY_BRAND.ctaHeadline}
                </h2>
                <p
                  className="max-w-[54ch] text-base leading-relaxed"
                  style={{ color: 'var(--ink-secondary)' }}
                >
                  Audit complet de votre boutique e-commerce algérienne, checkout 3 champs 58
                  Wilayas, Webhook HMAC PostgreSQL anti-fraude BaridiMob et Agent IA WhatsApp.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <MagneticPill>
                  <a
                    href={AGENCY_BRAND.whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="AUDIT 48H"
                    className="inline-flex min-h-[56px] items-center gap-2.5 rounded-full px-7 font-display text-sm font-bold whitespace-nowrap transition-transform duration-150 active:scale-[0.98]"
                    style={{
                      backgroundColor: 'var(--cta-bg)',
                      color: 'var(--cta-fg)',
                    }}
                  >
                    <WhatsappLogo size={20} weight="fill" />
                    <span>WhatsApp {AGENCY_BRAND.whatsappDisplay}</span>
                  </a>
                </MagneticPill>
                <a
                  href={AGENCY_BRAND.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[56px] items-center gap-2 rounded-full px-6 font-mono text-xs font-semibold whitespace-nowrap transition-colors duration-150"
                  style={{
                    border: '1px solid var(--hairline-strong)',
                    color: 'var(--ink-primary)',
                  }}
                >
                  <span>Portfolio {AGENCY_BRAND.founder}</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>

            <div
              className="mt-12 flex flex-wrap items-center justify-between gap-4 pt-6 font-mono text-xs"
              style={{
                borderTop: '1px solid var(--hairline)',
                color: 'var(--ink-muted)',
              }}
            >
              <span>
                {AGENCY_BRAND.founder} · {AGENCY_BRAND.name} ({AGENCY_BRAND.handle})
              </span>
              <span>
                {ATLAS_JACKET.brand} · 58 Wilayas COD · Webhook HMAC 18 µs · Agent IA 2s
              </span>
            </div>
          </LiquidGlassSurface>
        </section>
      </main>
    </div>
  );
};
