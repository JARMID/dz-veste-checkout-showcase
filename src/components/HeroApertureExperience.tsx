import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowDown, ArrowUpRight, Play, ShieldCheck, Sparkle } from '@phosphor-icons/react';
import { ATLAS_JACKET, formatDzd } from '../data/product';
import { MagneticPill } from './LiquidGlassSurface';

export interface HeroApertureExperienceProps {
  theme: 'light' | 'dark';
  onPlayFilm: () => void;
  onJumpSandbox: () => void;
  onJumpToAct: (sec: number) => void;
}

type HeroViewMode = 'gallery' | 'studio' | 'macro';

const ANATOMY_PINS = [
  {
    id: 'fabric',
    num: '01',
    tag: 'MATIÈRE · 520 GSM',
    title: 'Twill Technique Déperlant',
    body: 'Coupe boxy structurée, zip central gunmetal YKK Excella et poches soufflets.',
    pinPos: { left: '49%', top: '34%' },
    cardPos: 'left-4 sm:left-8 lg:left-[8%] top-[22%] sm:top-[26%]',
    targetT: 3.0,
    emerald: false,
  },
  {
    id: 'cod',
    num: '02',
    tag: 'CONVERSION · 9 → 3',
    title: '58 Wilayas · Stop-Desk & Domicile',
    body: 'Nom, téléphone et wilaya uniquement. Bouton tactile 56px contraste 18.6:1 AAA.',
    pinPos: { left: '56%', top: '53%' },
    cardPos: 'right-4 sm:right-8 lg:right-[7%] top-[44%] sm:top-[42%]',
    targetT: 11.0,
    emerald: false,
  },
  {
    id: 'hmac',
    num: '03',
    tag: 'ZÉRO FAUX REÇU BARIDIMOB',
    title: 'Webhook HMAC 18 µs · Agent IA 2s',
    body: 'Verrouillage PostgreSQL RLS anti-replay et confirmation WhatsApp immédiate.',
    pinPos: { left: '46%', top: '69%' },
    cardPos: 'left-4 sm:left-8 lg:left-[9%] bottom-[14%] sm:bottom-[15%]',
    targetT: 33.0,
    emerald: true,
  },
] as const;

/**
 * Bulletproof Awwwards Interactive Sticky Scroll Hero ("3D Monolith -> Full-Bleed Expansion -> Interactive Anatomy").
 *
 * - Uses native CSS `position: sticky` inside a `270dvh` scroll runway driven by Motion `useScroll` + `useSpring`.
 * - Works reliably at EVERY viewport width (390px mobile, 800px IDE pane, 1440px desktop, 4K) with zero GSAP pin glitches.
 * - Interactive BEFORE scroll: live 3D mouse-tilt monolith (`rotateX`/`rotateY`), holographic glass glare sweep,
 *   and clickable 3-angle studio viewer (`Galerie` / `Studio` / `Macro Zip`).
 * - Explosive scroll choreography: monolith expands from `0.56 -> 1.00` full-bleed while `ATELIER` & `ATLAS` sweep apart,
 *   then reveals 3 interactive clickable glowing reticle beacons + frosted Liquid Glass cards, then pulls back into Section 2.
 */
export const HeroApertureExperience: React.FC<HeroApertureExperienceProps> = ({
  theme,
  onPlayFilm,
  onJumpSandbox,
  onJumpToAct,
}) => {
  const runwayRef = useRef<HTMLElement | null>(null);
  const [heroView, setHeroView] = useState<HeroViewMode>('gallery');
  const [activePin, setActivePin] = useState<string>('hmac');
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [pctLabel, setPctLabel] = useState<number>(0);

  // Scroll progress across the 270dvh sticky runway (0 = top resting, 1 = bottom handoff)
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ['start start', 'end end'],
  });
  const smoothP = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.35,
  });

  // Update lightweight discrete stage indicator only when integer pct/stage actually changes
  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      const clamped = Math.max(0, Math.min(1, v));
      const pct = Math.round(clamped * 100);
      setPctLabel((prev) => (prev === pct ? prev : pct));
      const nextStage = clamped < 0.16 ? 0 : clamped < 0.5 ? 1 : clamped < 0.86 ? 2 : 3;
      setStageIndex((prev) => (prev === nextStage ? prev : nextStage));
    });
    return () => unsub();
  }, [scrollYProgress]);

  // Interactive 3D mouse tilt & holographic glass glare on the Monolith (active at scroll 0, eases flat during full-bleed)
  const pointerNormX = useMotionValue(0);
  const pointerNormY = useMotionValue(0);
  const smoothMouseX = useSpring(pointerNormX, { stiffness: 180, damping: 24, mass: 0.4 });
  const smoothMouseY = useSpring(pointerNormY, { stiffness: 180, damping: 24, mass: 0.4 });

  // Multiply mouse tilt by (1 - expansion) so it flattens smoothly as monolith expands full-bleed
  const tiltWeight = useTransform(smoothP, [0, 0.32], [1, 0]);
  const rotateY = useTransform([smoothMouseX, tiltWeight], ([mx = 0, w = 1]: number[]) => mx * 8.5 * w);
  const rotateX = useTransform([smoothMouseY, tiltWeight], ([my = 0, w = 1]: number[]) => -my * 6.5 * w);
  const glareX = useTransform(smoothMouseX, [-1, 1], ['15%', '85%']);
  const glareY = useTransform(smoothMouseY, [-1, 1], ['15%', '85%']);
  const glareBg = useMotionTemplate`radial-gradient(520px circle at ${glareX} ${glareY}, rgba(255,255,255,0.28), rgba(16,185,129,0.08) 38%, transparent 68%)`;

  // Explosive GPU scroll transforms
  // Stage 0 -> 1 (0..0.46): Compact floating 3D monolith (0.56) SURGES to full-bleed 1.00!
  // Stage 2 -> 3 (0.84..1.0): Smooth Keynote pull-back (1.00 -> 0.90) handing off to Section 2!
  const frameScale = useTransform(smoothP, [0, 0.46, 0.84, 1], [0.56, 1, 1, 0.9]);
  const frameRadius = useTransform(smoothP, [0, 0.42, 0.84, 1], [30, 0, 0, 32]);
  const innerImgScale = useTransform(smoothP, [0, 0.5, 1], [1.22, 1.04, 1.0]);

  // Monumental split display typography sweeps explosively apart on scroll
  const wordLeftX = useTransform(smoothP, [0, 0.42], ['0vw', '-42vw']);
  const wordLeftY = useTransform(smoothP, [0, 0.42], ['0vh', '-12vh']);
  const wordRightX = useTransform(smoothP, [0, 0.42], ['0vw', '42vw']);
  const wordRightY = useTransform(smoothP, [0, 0.42], ['0vh', '12vh']);
  const wordsOpacity = useTransform(smoothP, [0, 0.34], [1, 0]);

  // Initial Hero UI fades cleanly while full-bleed scrim & HUD rise in
  const heroUiOpacity = useTransform(smoothP, [0, 0.24], [1, 0]);
  const heroUiY = useTransform(smoothP, [0, 0.24], [0, 24]);
  const monolithBarOpacity = useTransform(smoothP, [0, 0.28], [1, 0]);

  const scrimOpacity = useTransform(smoothP, [0.22, 0.52], [0.08, 0.85]);
  const expandedHudOpacity = useTransform(smoothP, [0.38, 0.54, 0.88, 0.98], [0, 1, 1, 0]);
  const expandedHudY = useTransform(smoothP, [0.38, 0.54], [18, 0]);

  // Staggered interactive anatomy pins & cards (45% -> 84%)
  const pin1Opacity = useTransform(smoothP, [0.44, 0.56, 0.88, 0.97], [0, 1, 1, 0]);
  const pin1Y = useTransform(smoothP, [0.44, 0.56], [28, 0]);
  const pin2Opacity = useTransform(smoothP, [0.54, 0.66, 0.88, 0.97], [0, 1, 1, 0]);
  const pin2Y = useTransform(smoothP, [0.54, 0.66], [28, 0]);
  const pin3Opacity = useTransform(smoothP, [0.64, 0.76, 0.88, 0.97], [0, 1, 1, 0]);
  const pin3Y = useTransform(smoothP, [0.64, 0.76], [28, 0]);

  const pinAnimations = [
    { opacity: pin1Opacity, y: pin1Y },
    { opacity: pin2Opacity, y: pin2Y },
    { opacity: pin3Opacity, y: pin3Y },
  ];

  const railScaleY = useTransform(smoothP, [0, 1], [0.05, 1]);

  const handleStageClick = (fraction: number) => {
    if (!runwayRef.current) return;
    const rect = runwayRef.current.getBoundingClientRect();
    const runwayTop = rect.top + window.scrollY;
    const travel = Math.max(1, runwayRef.current.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: runwayTop + travel * fraction,
      behavior: 'smooth',
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    pointerNormX.set(Math.max(-1, Math.min(1, nx)));
    pointerNormY.set(Math.max(-1, Math.min(1, ny)));
  };

  const handlePointerLeave = () => {
    pointerNormX.set(0);
    pointerNormY.set(0);
  };

  const isLight = theme === 'light';
  const activeImgSrc =
    heroView === 'gallery'
      ? ATLAS_JACKET.campaignWideImage
      : heroView === 'studio'
        ? isLight
          ? ATLAS_JACKET.heroLightImage
          : ATLAS_JACKET.heroImage
        : ATLAS_JACKET.detailImage;

  return (
    <section
      ref={runwayRef}
      id="hero-experience"
      className="relative w-full h-[270dvh]"
    >
      {/* Native Sticky 100dvh Interactive Cinema Stage */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="sticky top-0 h-[100dvh] w-full overflow-hidden"
        style={{ perspective: '1400px' }}
      >
        {/* Top Architectural Metadata Line (fades smoothly on scroll) */}
        <motion.div
          style={{ opacity: heroUiOpacity }}
          className="pointer-events-none absolute inset-x-0 top-20 sm:top-22 z-20 mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-10 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em]"
        >
          <span style={{ color: 'var(--ink-secondary)' }}>{ATLAS_JACKET.dropCode}</span>
          <span className="hidden sm:inline" style={{ color: 'var(--ink-secondary)' }}>
            {ATLAS_JACKET.name} · {formatDzd(ATLAS_JACKET.priceDzd)}
          </span>
          <span style={{ color: 'var(--ink-secondary)' }}>ALGER · 58 WILAYAS</span>
        </motion.div>

        {/* Monumental Kinetic Display Words Flanking the 3D Monolith */}
        <div className="pointer-events-none absolute inset-0 z-20 mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-10">
          <motion.div
            style={{ x: wordLeftX, y: wordLeftY, opacity: wordsOpacity }}
            className="absolute left-4 sm:left-8 lg:left-10 top-[14%] sm:top-[12%] will-change-transform"
          >
            <h1
              className="display-safe font-display font-bold leading-[0.86] tracking-[-0.045em] select-none"
              style={{
                fontSize: 'clamp(3.1rem, 8.8vw, 8.4rem)',
                color: 'var(--ink-primary)',
                textShadow: isLight
                  ? '0 4px 24px rgba(246, 247, 249, 0.72)'
                  : '0 10px 36px rgba(0, 0, 0, 0.55)',
              }}
            >
              ATELIER
            </h1>
          </motion.div>

          <motion.div
            style={{ x: wordRightX, y: wordRightY, opacity: wordsOpacity }}
            className="absolute right-4 sm:right-8 lg:right-10 bottom-[30%] sm:bottom-[15%] text-right will-change-transform"
          >
            <div
              className="display-safe font-display font-bold leading-[0.86] tracking-[-0.045em] select-none"
              style={{
                fontSize: 'clamp(3.1rem, 8.8vw, 8.4rem)',
                color: 'var(--ink-primary)',
                textShadow: isLight
                  ? '0 4px 24px rgba(246, 247, 249, 0.72)'
                  : '0 10px 36px rgba(0, 0, 0, 0.55)',
              }}
            >
              ATLAS
            </div>
          </motion.div>
        </div>

        {/* ===================================================================
            THE 3D INTERACTIVE MONOLITH -> FULL-BLEED 100vw x 100dvh EXPANSION
            =================================================================== */}
        <motion.div
          data-cursor={stageIndex < 2 ? 'SCROLL / INSPECT' : 'ANATOMIE'}
          style={{
            scale: frameScale,
            borderRadius: frameRadius,
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="relative z-10 h-full w-full overflow-hidden will-change-transform shadow-[0_40px_110px_rgba(0,0,0,0.42)]"
        >
          {/* Animated Multi-Angle Studio Photography */}
          <motion.div
            style={{ scale: innerImgScale }}
            className="relative h-full w-full will-change-transform"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`${heroView}-${theme}`}
                src={activeImgSrc}
                alt="Atelier Atlas : Veste Oversize Atlas"
                loading="eager"
                decoding="sync"
                initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0.72 }}
                animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                exit={{ opacity: 0.45 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full object-cover object-center"
              />
            </AnimatePresence>
          </motion.div>

          {/* Interactive Holographic Specular Glare Sweep across the Glass */}
          <motion.div
            aria-hidden="true"
            style={{ background: glareBg, opacity: monolithBarOpacity }}
            className="pointer-events-none absolute inset-0 z-10 mix-blend-screen"
          />

          {/* Glass Edge Fresnel Border on Monolith */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: monolithBarOpacity, borderRadius: frameRadius }}
            className="pointer-events-none absolute inset-0 z-10"
          >
            <div
              className="h-full w-full rounded-[inherit]"
              style={{
                border: isLight
                  ? '1.5px solid rgba(255, 255, 255, 0.85)'
                  : '1.5px solid rgba(255, 255, 255, 0.22)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.45)',
              }}
            />
          </motion.div>

          {/* Cinema Scrim deepening smoothly as monolith expands full-bleed */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: scrimOpacity }}
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#060608]/85 via-[#060608]/20 to-[#060608]/50"
          />
        </motion.div>

        {/* Unscaled Full-Resolution 3-Angle Selector Dock floating cleanly on bottom rim of Monolith */}
        <motion.div
          style={{ opacity: monolithBarOpacity, y: heroUiY }}
          className={`absolute bottom-[23.5%] sm:bottom-[23.5%] left-1/2 z-30 -translate-x-1/2 flex items-center gap-1 rounded-full border p-1 backdrop-blur-xl shadow-2xl ${
            isLight
              ? 'border-white/90 bg-white/86 shadow-[0_14px_34px_rgba(15,23,42,0.16)]'
              : 'border-white/25 bg-[#090a0e]/82'
          }`}
        >
          {(
            [
              { id: 'gallery', label: '01 · Galerie' },
              { id: 'studio', label: '02 · Studio' },
              { id: 'macro', label: '03 · Macro Zip' },
            ] as const
          ).map((opt) => {
            const active = heroView === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroView(opt.id);
                }}
                className={`cursor-pointer rounded-full px-3 sm:px-3.5 py-1.5 font-mono text-[10.5px] sm:text-[11px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                  active
                    ? isLight
                      ? 'bg-[#09090b] text-[#f5f5f2]'
                      : 'bg-[#f5f5f2] text-[#060608]'
                    : isLight
                      ? 'text-[#4a4d57] hover:text-[#09090b]'
                      : 'text-[#d4d4d8] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </motion.div>

        {/* ===================================================================
            RESTING HERO BOTTOM CONTROLS (scroll = 0, fades away as expansion hits)
            =================================================================== */}
        <motion.div
          style={{ opacity: heroUiOpacity, y: heroUiY }}
          className="absolute inset-x-0 bottom-5 sm:bottom-7 z-30 mx-auto flex max-w-[1440px] flex-col sm:flex-row sm:items-end justify-between gap-4 px-4 sm:px-8 lg:px-10"
        >
          <div className="max-w-md space-y-3">
            <p
              className="text-xs sm:text-sm leading-relaxed font-medium"
              style={{ color: 'var(--ink-secondary)' }}
            >
              Checkout streetwear 58 Wilayas transformé en direct : 9 champs réduits à 3, Webhook
              HMAC 18 µs et Agent IA confirmé en 2 secondes.
            </p>
            <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 sm:gap-2.5">
              <MagneticPill>
                <button
                  type="button"
                  data-cursor="PLAY 49S"
                  onClick={onPlayFilm}
                  className="group cursor-pointer inline-flex h-11 sm:h-12 items-center gap-2 sm:gap-3 rounded-full pl-3.5 sm:pl-5 pr-1.5 font-display text-[11.5px] sm:text-xs font-bold tracking-wide whitespace-nowrap transition-transform duration-150 active:scale-[0.98]"
                  style={{
                    backgroundColor: 'var(--cta-bg)',
                    color: 'var(--cta-fg)',
                  }}
                >
                  <span>Lancer le film 49s</span>
                  <span
                    className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{
                      backgroundColor: isLight ? '#ffffff' : '#060608',
                      color: isLight ? '#09090b' : '#f5f5f2',
                    }}
                  >
                    <Play size={13} weight="fill" />
                  </span>
                </button>
              </MagneticPill>

              <button
                type="button"
                onClick={onJumpSandbox}
                className="cursor-pointer inline-flex h-11 sm:h-12 items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-5 font-mono text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors duration-150"
                style={{
                  border: '1px solid var(--hairline-strong)',
                  backgroundColor: 'var(--glass-island-bg)',
                  color: 'var(--ink-primary)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <span>Tester le Checkout</span>
                <ArrowDown size={14} className="shrink-0" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleStageClick(0.68)}
            className="hidden sm:flex cursor-pointer flex-col items-end gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] group"
            style={{ color: 'var(--ink-secondary)' }}
          >
            <span className="group-hover:opacity-100">Scrollez ou cliquez pour ouvrir</span>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-px w-12"
                style={{ backgroundColor: 'var(--hairline-strong)' }}
              />
              <ArrowDown size={13} className="animate-bounce" />
            </div>
          </button>
        </motion.div>

        {/* ===================================================================
            EXPANDED FULL-BLEED INTERACTIVE ANATOMY LAYER (44% -> 94%)
            =================================================================== */}
        <motion.div
          style={{ opacity: expandedHudOpacity, y: expandedHudY }}
          className="pointer-events-none absolute inset-x-0 top-22 sm:top-24 z-30 mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-10"
        >
          <div className="rounded-full border border-white/20 bg-[#090a0d]/70 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-[#f5f5f2] backdrop-blur-xl">
            ARCHIVE 04 · VESTE OVERSIZE ATLAS · 7 800 DA
          </div>
          <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-[#090a0d]/70 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] text-[#f5f5f2] backdrop-blur-xl tabular-nums">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>OUVERTURE</span>
            <span className="font-bold text-emerald-300">
              {String(pctLabel).padStart(2, '0')}%
            </span>
          </div>
        </motion.div>

        {/* Interactive Pulsing Optical Reticles & Frosted Glass Anatomy Cards */}
        {ANATOMY_PINS.map((pin, idx) => {
          const anim = pinAnimations[idx]!;
          const isSelected = activePin === pin.id;
          return (
            <React.Fragment key={pin.id}>
              {/* Interactive Glowing Reticle Beacon right on the garment */}
              <motion.button
                type="button"
                aria-label={`Inspecter ${pin.title}`}
                onClick={() => setActivePin(pin.id)}
                style={{
                  opacity: anim.opacity,
                  left: pin.pinPos.left,
                  top: pin.pinPos.top,
                }}
                className="hidden md:flex cursor-pointer absolute z-30 -translate-x-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full"
              >
                <span
                  className={`absolute inset-0 rounded-full border transition-transform duration-300 ${
                    isSelected
                      ? 'scale-125 border-emerald-400 bg-emerald-400/20'
                      : 'scale-100 border-white/45 bg-white/10 hover:scale-115'
                  }`}
                />
                <span
                  className={`relative h-2.5 w-2.5 rounded-full ${
                    isSelected ? 'bg-emerald-400 shadow-[0_0_16px_#10b981]' : 'bg-white'
                  }`}
                />
              </motion.button>

              {/* Frosted Liquid Glass Anatomy Card (clickable to jump to that Act) */}
              <motion.button
                type="button"
                onClick={() => {
                  setActivePin(pin.id);
                  onJumpToAct(pin.targetT);
                }}
                style={{ opacity: anim.opacity, y: anim.y }}
                className={`cursor-pointer group absolute z-30 max-w-[275px] sm:max-w-[330px] text-left rounded-2xl p-3.5 sm:p-4 text-[#f5f5f2] backdrop-blur-xl transition-colors duration-200 ${pin.cardPos} ${
                  pin.emerald || isSelected
                    ? 'border border-emerald-400/45 bg-[#071410]/80 shadow-[0_24px_60px_rgba(0,0,0,0.55)]'
                    : 'border border-white/20 bg-[#090a0e]/72 shadow-[0_20px_50px_rgba(0,0,0,0.48)] hover:border-white/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    {pin.emerald && <ShieldCheck size={13} weight="fill" />}
                    {pin.num} · {pin.tag}
                  </span>
                  <ArrowUpRight
                    size={13}
                    className="opacity-70 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 font-display text-sm sm:text-[15px] font-bold">
                  <span>{pin.title}</span>
                  {pin.emerald && <Sparkle size={14} weight="fill" className="shrink-0 text-emerald-400" />}
                </div>
                <p className="mt-1 text-[11.5px] sm:text-xs leading-relaxed text-[#d4d4d8]">
                  {pin.body}
                </p>
              </motion.button>
            </React.Fragment>
          );
        })}

        {/* Interactive Bottom 4-Stage Scroll Stepper Pill (always visible during scroll expansion!) */}
        <motion.div
          style={{ opacity: expandedHudOpacity }}
          className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 flex items-center gap-1 rounded-full border border-white/18 bg-[#090a0e]/75 p-1 backdrop-blur-xl shadow-2xl"
        >
          {[
            { label: '01 Monolithe', frac: 0.0 },
            { label: '02 Ouverture', frac: 0.46 },
            { label: '03 Anatomie', frac: 0.72 },
            { label: '04 Suite ↓', frac: 1.0 },
          ].map((st, idx) => {
            const active = stageIndex === idx;
            return (
              <button
                key={st.label}
                type="button"
                onClick={() => handleStageClick(st.frac)}
                className={`cursor-pointer rounded-full px-3 py-1 font-mono text-[10px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                  active
                    ? 'bg-emerald-400 text-[#060608]'
                    : 'text-[#d4d4d8] hover:text-white'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </motion.div>

        {/* Right-Edge Minimal Scroll Progress Rail */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 sm:right-5 top-1/2 z-30 h-28 w-[2px] -translate-y-1/2 overflow-hidden rounded-full"
          style={{
            backgroundColor: isLight ? 'rgba(9,9,11,0.14)' : 'rgba(255,255,255,0.16)',
          }}
        >
          <motion.div
            style={{ scaleY: railScaleY }}
            className="h-full w-full origin-top bg-emerald-400"
          />
        </div>
      </div>
    </section>
  );
};
