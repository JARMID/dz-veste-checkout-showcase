import React, { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { ATLAS_JACKET, formatDzd } from '../data/product';
import { LiquidGlassSurface } from './LiquidGlassSurface';

export interface EditorialLookbookProps {
  theme: 'light' | 'dark';
  onJumpToAct: (sec: number) => void;
  onJumpSandbox: () => void;
}

const MARQUEE_ITEMS = [
  'ATELIER ATLAS',
  '520 GSM TWILL',
  '9 → 3 CHAMPS COD',
  '58 WILAYAS',
  'WEBHOOK HMAC 18 µs',
  'AGENT IA 2S',
  'JARMID STUDIO',
];

/**
 * Single Scroll-Velocity Kinetic Typography Marquee (Taste-Skill compliant: max 1 marquee per page).
 * Physically speeds up and shifts flow direction proportional to user scroll velocity (zero React re-renders).
 */
const VelocityKineticBand: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 45, stiffness: 320 });
  const velocityFactor = useTransform(smoothVelocity, [-2400, 0, 2400], [-3.2, 0, 3.2]);
  const dirRef = useRef<number>(1);

  useAnimationFrame((_, delta) => {
    const v = velocityFactor.get();
    if (v < -0.1) dirRef.current = -1;
    else if (v > 0.1) dirRef.current = 1;

    let moveBy = dirRef.current * -1.8 * (delta / 1000);
    moveBy += dirRef.current * Math.abs(v) * -1.4 * (delta / 1000);

    let next = baseX.get() + moveBy;
    if (next <= -50) next += 50;
    if (next > 0) next -= 50;
    baseX.set(next);
  });

  const xPercent = useTransform(baseX, (v) => `${v}%`);
  const isLight = theme === 'light';

  return (
    <div
      className="relative w-full overflow-hidden py-5 select-none"
      style={{
        borderTop: '1px solid var(--hairline)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <motion.div
        style={{ x: xPercent }}
        className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform"
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-10">
            {MARQUEE_ITEMS.map((item, idx) => (
              <React.Fragment key={`${dup}-${idx}`}>
                <span
                  className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em]"
                  style={{
                    color:
                      idx % 3 === 0
                        ? 'var(--ink-primary)'
                        : isLight
                          ? 'rgba(9, 9, 11, 0.32)'
                          : 'rgba(245, 245, 242, 0.34)',
                  }}
                >
                  {item}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-emerald)' }}
                />
              </React.Fragment>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export const EditorialLookbook: React.FC<EditorialLookbookProps> = ({
  theme,
  onJumpToAct,
  onJumpSandbox,
}) => {
  const [plate, setPlate] = useState<'studio' | 'macro'>('studio');
  const isLight = theme === 'light';
  const studioSrc = isLight ? ATLAS_JACKET.heroLightImage : ATLAS_JACKET.heroImage;

  const specRows = [
    {
      index: '01',
      metric: '9 → 3',
      title: 'Formulaire COD condensé',
      detail: 'Nom, téléphone (+213) et Wilaya 58 uniquement. 6 champs bloquants supprimés.',
      targetT: 11.0,
    },
    {
      index: '02',
      metric: '18.6:1',
      title: 'Bouton tactile 56px WCAG AAA',
      detail: 'Remplace le bouton gris illisible 1.54:1 par une zone pouce haute précision.',
      targetT: 19.0,
    },
    {
      index: '03',
      metric: '18 µs',
      title: 'Webhook HMAC PostgreSQL RLS',
      detail: 'Élimine les fausses captures BaridiMob (7 800 DA édité en 780 DA en 10s).',
      targetT: 33.0,
    },
    {
      index: '04',
      metric: '2 sec',
      title: 'Agent IA WhatsApp autonome',
      detail: 'Confirmation automatique instantanée au lieu de 24h d’attente manuelle.',
      targetT: 44.0,
    },
  ];

  return (
    <section id="lookbook" className="relative z-10 space-y-16 py-12 lg:py-20">
      <VelocityKineticBand theme={theme} />

      {/* Asymmetric Museum Lookbook Split (7 cols Photography + 5 cols Architectural Hairline Index) */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 px-4 sm:px-6 lg:px-10 items-center">
        {/* Left: Theme-Matched Studio Garment Plate with GPU Shutter Wipe */}
        <div className="lg:col-span-6 space-y-4">
          <LiquidGlassSurface
            theme={theme}
            className="group/glass rounded-[28px] p-2.5"
          >
            <div
              data-cursor="INSPECT"
              onClick={() => setPlate((p) => (p === 'studio' ? 'macro' : 'studio'))}
              className="cursor-pointer relative aspect-[4/5] w-full overflow-hidden rounded-[20px]"
              style={{
                backgroundColor: isLight ? '#e8eaec' : '#090a0d',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${theme}-${plate}`}
                  src={plate === 'studio' ? studioSrc : ATLAS_JACKET.detailImage}
                  alt={
                    plate === 'studio'
                      ? `${ATLAS_JACKET.name} vue studio`
                      : `${ATLAS_JACKET.name} macro zip gunmetal`
                  }
                  loading="eager"
                  decoding="sync"
                  initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0.72 }}
                  animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                  exit={{ opacity: 0.45 }}
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>

              {/* Subtle Floating Liquid-Glass Spec Caption */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                <span
                  className="rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md"
                  style={{
                    backgroundColor:
                      plate === 'macro' || !isLight
                        ? 'rgba(9, 10, 14, 0.72)'
                        : 'rgba(255, 255, 255, 0.82)',
                    color: plate === 'macro' || !isLight ? '#f5f5f2' : '#09090b',
                    border:
                      plate === 'macro' || !isLight
                        ? '1px solid rgba(255,255,255,0.16)'
                        : '1px solid rgba(9,9,11,0.1)',
                  }}
                >
                  {plate === 'studio' ? 'STUDIO 80MM · ALABASTER' : 'MACRO YKK EXCELLA #8'}
                </span>
                <span
                  className="rounded-full px-3 py-1 font-mono text-[11px] font-bold tabular-nums backdrop-blur-md"
                  style={{
                    backgroundColor:
                      plate === 'macro' || !isLight
                        ? 'rgba(9, 10, 14, 0.72)'
                        : 'rgba(255, 255, 255, 0.82)',
                    color: plate === 'macro' || !isLight ? '#6ee7b7' : '#047857',
                    border:
                      plate === 'macro' || !isLight
                        ? '1px solid rgba(16,185,129,0.35)'
                        : '1px solid rgba(5,150,105,0.28)',
                  }}
                >
                  {formatDzd(ATLAS_JACKET.priceDzd)}
                </span>
              </div>
            </div>
          </LiquidGlassSurface>

          {/* Clean Plate Switcher Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
            <div className="flex items-center gap-2">
              {(
                [
                  { id: 'studio', label: '01 · Silhouette' },
                  { id: 'macro', label: '02 · Macro Zip' },
                ] as const
              ).map((tab) => {
                const active = plate === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPlate(tab.id)}
                    className="cursor-pointer whitespace-nowrap shrink-0 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold transition-colors duration-150"
                    style={{
                      backgroundColor: active ? 'var(--cta-bg)' : 'transparent',
                      color: active ? 'var(--cta-fg)' : 'var(--ink-secondary)',
                      border: active ? '1px solid transparent' : '1px solid var(--hairline-strong)',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <span
              className="font-mono text-[11px]"
              style={{ color: 'var(--ink-muted)' }}
            >
              Cliquez sur la photo pour permuter
            </span>
          </div>
        </div>

        {/* Right: Clean Architectural Hairline Spec Manifest (Zero Generic SaaS Metric Cards) */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-4">
            <h2
              className="display-safe font-display font-bold leading-[1.02] tracking-[-0.035em]"
              style={{
                fontSize: 'clamp(2.1rem, 3.8vw, 3.35rem)',
                color: 'var(--ink-primary)',
              }}
            >
              Conçue comme une pièce d&apos;atelier. Pensée pour convertir en 2 secondes.
            </h2>
            <p
              className="max-w-[56ch] text-base leading-relaxed"
              style={{ color: 'var(--ink-secondary)' }}
            >
              Chaque détail d&apos;ingénierie répond à une faille réelle du e-commerce algérien :
              cliquez sur une ligne pour sauter directement à son patch code-en-direct.
            </p>
          </div>

          <div
            className="divide-y"
            style={{
              borderTop: '1px solid var(--hairline)',
              borderBottom: '1px solid var(--hairline)',
              borderColor: 'var(--hairline)',
            }}
          >
            {specRows.map((row) => (
              <button
                key={row.index}
                type="button"
                onClick={() => onJumpToAct(row.targetT)}
                className={`group cursor-pointer flex w-full items-start justify-between gap-4 py-4 px-3 -mx-3 rounded-2xl text-left transition-colors duration-150 ${
                  isLight ? 'hover:bg-[#09090b]/[0.04]' : 'hover:bg-white/[0.045]'
                }`}
                style={{ borderColor: 'var(--hairline)' }}
              >
                <div className="flex items-baseline gap-4 min-w-0">
                  <span
                    className="font-mono text-[11px] tabular-nums shrink-0"
                    style={{ color: 'var(--ink-muted)' }}
                  >
                    {row.index}
                  </span>
                  <div className="min-w-0">
                    <div
                      className="font-display text-base sm:text-lg font-bold tracking-tight"
                      style={{ color: 'var(--ink-primary)' }}
                    >
                      {row.title}
                    </div>
                    <p
                      className="mt-0.5 text-xs sm:text-sm leading-relaxed"
                      style={{ color: 'var(--ink-secondary)' }}
                    >
                      {row.detail}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5 pt-0.5">
                  <span
                    className="font-mono text-base sm:text-lg font-bold tabular-nums whitespace-nowrap"
                    style={{
                      color:
                        row.index === '03' || row.index === '04'
                          ? 'var(--accent-emerald-text)'
                          : 'var(--ink-primary)',
                    }}
                  >
                    {row.metric}
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: 'var(--ink-muted)' }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onJumpSandbox}
              className="group cursor-pointer inline-flex items-center gap-2.5 font-display text-sm font-bold"
              style={{ color: 'var(--ink-primary)' }}
            >
              <span className="border-b pb-0.5" style={{ borderColor: 'var(--ink-primary)' }}>
                Ouvrir le checkout interactif 58 Wilayas
              </span>
              <ArrowUpRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
            <span
              className="font-mono text-[11px] tabular-nums"
              style={{ color: 'var(--ink-muted)' }}
            >
              {ATLAS_JACKET.stockRemaining} pièces restantes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
