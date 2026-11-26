import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  CaretDown,
  Check,
  CheckCircle,
  LockKey,
  MagnifyingGlass,
  Phone,
  ShieldCheck,
  Sparkle,
  Truck,
  User,
} from '@phosphor-icons/react';
import { ATLAS_JACKET, formatDzd } from '../data/product';
import { ALGERIA_WILAYAS, getWilayaByCode } from '../data/wilayas';

export interface ApresStorefrontViewProps {
  /** Compact framing for Capture 9:16 / Split comparator */
  compact?: boolean;
  /** Interactive controls enabled in Visitor Mode */
  interactive?: boolean;
  /** Deterministic pulse opacity 0..1 when rendered inside Capture Mode */
  deterministicPulse?: number;
  /** Deterministic Ken Burns progress (0..1) on jacket photography in Capture Mode */
  heroKenBurns?: number;
  /** Force showing confirmed order state (used in Capture Mode Act 7) */
  forceVerified?: boolean;
  /** Visual surface theme (Capture Mode always defaults to dark obsidian) */
  theme?: 'light' | 'dark';
}

type ConfirmStage = 'idle' | 'verifying' | 'confirmed';

export const ApresStorefrontView: React.FC<ApresStorefrontViewProps> = React.memo(
  ({
    compact = false,
    interactive = false,
    deterministicPulse,
    heroKenBurns = 0,
    forceVerified = true,
    theme = 'dark',
  }) => {
    const [photoMode, setPhotoMode] = useState<'hero' | 'detail'>('hero');
    const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL'>('L');
    const [fullName, setFullName] = useState('Amine Benali');
    const [phone, setPhone] = useState('0554 82 19 40');
    const [wilayaCode, setWilayaCode] = useState('16');
    const [deliveryType, setDeliveryType] = useState<'stopdesk' | 'domicile'>('stopdesk');
    const [confirmStage, setConfirmStage] = useState<ConfirmStage>(
      forceVerified ? 'confirmed' : 'idle'
    );
    const [formError, setFormError] = useState<string | null>(null);

    const [wilayaOpen, setWilayaOpen] = useState(false);
    const [wilayaQuery, setWilayaQuery] = useState('');
    const comboRef = useRef<HTMLDivElement | null>(null);

    const wilaya = getWilayaByCode(wilayaCode);
    const shippingDzd =
      deliveryType === 'stopdesk' ? wilaya.stopDeskDzd : wilaya.domicileDzd;
    const totalDzd = ATLAS_JACKET.priceDzd + shippingDzd;

    const filteredWilayas = useMemo(() => {
      const q = wilayaQuery.trim().toLowerCase();
      if (!q) return ALGERIA_WILAYAS;
      return ALGERIA_WILAYAS.filter(
        (w) =>
          w.code.includes(q) ||
          w.nameFr.toLowerCase().includes(q) ||
          w.nameAr.includes(q)
      );
    }, [wilayaQuery]);

    useEffect(() => {
      if (!wilayaOpen) return;
      const onPointerDown = (e: PointerEvent) => {
        if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
          setWilayaOpen(false);
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setWilayaOpen(false);
      };
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('keydown', onKey);
      };
    }, [wilayaOpen]);

    const handleConfirm = (e: React.FormEvent) => {
      e.preventDefault();
      if (!interactive) return;
      if (fullName.trim().length < 2 || phone.replace(/\D/g, '').length < 9) {
        setFormError('Renseignez votre nom et un numéro algérien valide (10 chiffres).');
        return;
      }
      setFormError(null);
      setConfirmStage('verifying');
      window.setTimeout(() => {
        setConfirmStage('confirmed');
      }, 420);
    };

    const pulseStyle =
      typeof deterministicPulse === 'number'
        ? {
            opacity: 0.45 + deterministicPulse * 0.55,
            transform: `scale(${0.88 + deterministicPulse * 0.16})`,
          }
        : undefined;

    const kenBurnsTransform =
      !interactive && heroKenBurns > 0
        ? `scale(${1 + heroKenBurns * 0.06}) translate3d(0, ${-heroKenBurns * 6}px, 0)`
        : undefined;

    const isLight = theme === 'light';
    const heroImgSrc = isLight ? ATLAS_JACKET.heroLightImage : ATLAS_JACKET.heroImage;

    // Theme-calibrated token classes (Dark Obsidian vs Cold Architectural Alabaster)
    const outerClass = isLight ? 'liquid-bezel-outer' : 'bezel-dark-outer';
    const innerClass = isLight ? 'liquid-bezel-inner' : 'bezel-dark-inner';
    const inkPrimary = isLight ? 'text-[#09090b]' : 'text-[#f5f5f2]';
    const inkSecondary = isLight ? 'text-[#52525b]' : 'text-[#a1a1aa]';
    const inkMuted = isLight ? 'text-[#71717a]' : 'text-[#71717a]';
    const borderHair = isLight ? 'border-[#09090b]/10' : 'border-white/[0.08]';
    const inputBg = isLight
      ? 'border-[#09090b]/14 bg-white text-[#09090b] placeholder:text-[#a1a1aa] focus:border-[#09090b]/45'
      : 'border-white/[0.12] bg-[#090a0d] text-[#f5f5f2] placeholder:text-[#52525b] focus:border-[#f5f5f2]/50';
    const chipBg = isLight
      ? 'border-[#09090b]/10 bg-[#f4f4f1]'
      : 'border-white/[0.08] bg-white/[0.02]';

    return (
      <div className={`${outerClass} w-full ${inkPrimary}`}>
        <div
          className={`${innerClass} overflow-visible ${
            compact ? 'p-3.5 space-y-3' : 'p-5 lg:p-6 space-y-5'
          }`}
        >
          {/* Minimal Luxury Storefront Top Bar */}
          <div className={`flex items-center justify-between gap-2 border-b ${borderHair} pb-3`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold tracking-tight ${
                  isLight ? 'bg-[#09090b] text-[#f5f5f2]' : 'bg-[#f5f5f2] text-[#060607]'
                }`}
              >
                A4
              </span>
              <div className="min-w-0">
                <div className={`truncate font-display text-xs font-semibold tracking-[0.18em] ${inkPrimary}`}>
                  {ATLAS_JACKET.brand}
                </div>
                <div className={`font-mono text-[10px] ${inkMuted}`}>{ATLAS_JACKET.dropCode}</div>
              </div>
            </div>
            <div
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 whitespace-nowrap ${
                isLight
                  ? 'border-emerald-600/28 bg-emerald-600/10 text-emerald-800'
                  : 'border-emerald-500/28 bg-emerald-500/10 text-emerald-300'
              }`}
            >
              <LockKey
                size={13}
                weight="regular"
                className={isLight ? 'text-emerald-700' : 'text-emerald-400'}
              />
              <span className="font-mono text-[10px] font-semibold">RLS · 58 WILAYAS</span>
            </div>
          </div>

          {/* Product Editorial Presentation + Checkout Grid */}
          <div
            className={
              compact
                ? 'grid grid-cols-1 gap-3'
                : 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
            }
          >
            {/* Left / Top: Studio Product Showcase (ZERO image hover scale per impeccable ban!) */}
            <div className={compact ? 'flex items-center gap-4' : 'lg:col-span-5 space-y-3'}>
              <div
                data-cursor={interactive ? 'INSPECT' : undefined}
                className={`relative overflow-hidden rounded-[16px] border ${
                  isLight ? 'border-[#09090b]/10 bg-[#e8eaec]' : 'border-white/[0.1] bg-[#090a0c]'
                } ${compact ? 'h-36 w-28 shrink-0' : 'aspect-[3/4] w-full'}`}
              >
                {interactive ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${theme}-${photoMode}`}
                      src={photoMode === 'hero' ? heroImgSrc : ATLAS_JACKET.detailImage}
                      alt={ATLAS_JACKET.name}
                      loading="eager"
                      decoding="sync"
                      initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0.7 }}
                      animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                      exit={{ opacity: 0.4 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full w-full object-cover"
                    />
                  </AnimatePresence>
                ) : (
                  <img
                    src={heroImgSrc}
                    alt={ATLAS_JACKET.name}
                    loading="eager"
                    decoding="sync"
                    style={{ transform: kenBurnsTransform }}
                    className="h-full w-full object-cover"
                  />
                )}
                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent ${
                    isLight && photoMode === 'hero' ? 'from-black/25' : 'from-[#060607]/85'
                  }`}
                />
                {!compact && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] backdrop-blur-md ${
                        isLight && photoMode === 'hero'
                          ? 'border-[#09090b]/12 bg-white/88 text-[#09090b]'
                          : 'border-white/15 bg-[#060607]/82 text-[#f5f5f2]'
                      }`}
                    >
                      {ATLAS_JACKET.fabricSpec}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 font-mono text-[10px] font-semibold tabular-nums backdrop-blur-md ${
                        isLight && photoMode === 'hero'
                          ? 'border-emerald-600/25 bg-white/88 text-emerald-700'
                          : 'border-white/15 bg-[#060607]/82 text-emerald-300'
                      }`}
                    >
                      {ATLAS_JACKET.stockRemaining} pcs
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Switcher & Specs */}
              {compact ? (
                <div className="min-w-0 flex-1 space-y-2">
                  <div className={`font-mono text-[11px] uppercase tracking-[0.14em] ${inkSecondary}`}>
                    {ATLAS_JACKET.fitLabel} · 520 GSM
                  </div>
                  <h3 className={`font-display text-[22px] font-bold tracking-tight leading-tight ${inkPrimary}`}>
                    {ATLAS_JACKET.name}
                  </h3>
                  <div className="flex items-center gap-2.5">
                    <span className={`font-mono text-[22px] font-bold tabular-nums ${inkPrimary}`}>
                      {formatDzd(ATLAS_JACKET.priceDzd)}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${chipBg} ${inkSecondary}`}>
                      Taille {selectedSize}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {interactive && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPhotoMode('hero')}
                        className={`cursor-pointer flex items-center gap-2 rounded-xl border p-1.5 text-left transition-colors duration-150 ${
                          photoMode === 'hero'
                            ? isLight
                              ? 'border-[#09090b]/45 bg-[#09090b]/[0.05]'
                              : 'border-[#f5f5f2]/40 bg-white/[0.07]'
                            : isLight
                              ? 'border-[#09090b]/10 bg-white/60 hover:border-[#09090b]/25'
                              : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <img
                          src={heroImgSrc}
                          alt="Vue Studio"
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className={`text-[11px] font-semibold ${inkPrimary}`}>Silhouette</div>
                          <div className={`font-mono text-[9px] ${inkMuted}`}>Studio 80mm</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoMode('detail')}
                        className={`cursor-pointer flex items-center gap-2 rounded-xl border p-1.5 text-left transition-colors duration-150 ${
                          photoMode === 'detail'
                            ? isLight
                              ? 'border-[#09090b]/45 bg-[#09090b]/[0.05]'
                              : 'border-[#f5f5f2]/40 bg-white/[0.07]'
                            : isLight
                              ? 'border-[#09090b]/10 bg-white/60 hover:border-[#09090b]/25'
                              : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <img
                          src={ATLAS_JACKET.detailImage}
                          alt="Macro Hardware"
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className={`text-[11px] font-semibold ${inkPrimary}`}>Macro Zip</div>
                          <div className={`font-mono text-[9px] ${inkMuted}`}>Gunmetal YKK</div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Size Selector with shared layoutId spring */}
                  <div className={`flex items-center justify-between rounded-xl border p-2.5 ${chipBg}`}>
                    <span className={`font-mono text-[11px] uppercase tracking-wider ${inkSecondary}`}>
                      Taille
                    </span>
                    <div className="flex items-center gap-1.5">
                      {ATLAS_JACKET.sizes.map((size) => {
                        const active = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => interactive && setSelectedSize(size)}
                            className={`relative cursor-pointer h-8 w-9 rounded-lg font-mono text-xs font-semibold transition-colors duration-150 ${
                              active
                                ? isLight
                                  ? 'text-[#f5f5f2]'
                                  : 'text-[#060607]'
                                : isLight
                                  ? 'border border-[#09090b]/12 text-[#52525b] hover:text-[#09090b]'
                                  : 'border border-white/10 text-[#a1a1aa] hover:text-[#f5f5f2]'
                            }`}
                          >
                            {active && interactive ? (
                              <motion.span
                                layoutId="atlas-size-pill"
                                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                                className={`absolute inset-0 rounded-lg ${
                                  isLight ? 'bg-[#09090b]' : 'bg-[#f5f5f2]'
                                }`}
                              />
                            ) : active ? (
                              <span
                                className={`absolute inset-0 rounded-lg ${
                                  isLight ? 'bg-[#09090b]' : 'bg-[#f5f5f2]'
                                }`}
                              />
                            ) : null}
                            <span className="relative z-10">{size}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right / Bottom: Crisp 3-Field Checkout + Luxury CTA + HMAC + AI Agent */}
            <form
              onSubmit={handleConfirm}
              className={compact ? '@container space-y-2.5' : '@container lg:col-span-7 space-y-3.5'}
            >
              {!compact && (
                <div className={`flex items-end justify-between gap-3 border-b ${borderHair} pb-3`}>
                  <div className="min-w-0">
                    <div className={`font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.16em] ${inkSecondary}`}>
                      Checkout Express · 3 Champs
                    </div>
                    <h2 className={`mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight ${inkPrimary}`}>
                      {ATLAS_JACKET.name}
                    </h2>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`whitespace-nowrap font-mono text-xl sm:text-2xl font-bold tabular-nums ${inkPrimary}`}>
                      {formatDzd(ATLAS_JACKET.priceDzd)}
                    </div>
                    <div
                      className={`whitespace-nowrap font-mono text-[10px] font-medium ${
                        isLight ? 'text-emerald-700' : 'text-emerald-400'
                      }`}
                    >
                      Livraison {wilaya.etaLabel} · {wilaya.nameFr}
                    </div>
                  </div>
                </div>
              )}

              {/* The 3 Crisp Fields: Nom, Telephone, 58 Wilayas */}
              <div
                className={
                  compact ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                }
              >
                <div>
                  <label
                    htmlFor={interactive ? 'apres-nom' : undefined}
                    className={`mb-1 flex items-center gap-1.5 text-[12px] font-medium ${inkSecondary}`}
                  >
                    <User size={13} weight="regular" />
                    Nom complet
                  </label>
                  <input
                    id={interactive ? 'apres-nom' : undefined}
                    type="text"
                    readOnly={!interactive}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setConfirmStage('idle');
                    }}
                    className={`w-full rounded-xl border px-3.5 ${inputBg} ${
                      compact ? 'h-10 text-[14px]' : 'h-12 text-sm'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor={interactive ? 'apres-tel' : undefined}
                    className={`mb-1 flex items-center gap-1.5 text-[12px] font-medium ${inkSecondary}`}
                  >
                    <Phone size={13} weight="regular" />
                    Numéro (+213)
                  </label>
                  <div className="relative flex items-center">
                    <span className={`pointer-events-none absolute left-3 font-mono text-[11px] ${inkMuted}`}>
                      DZ
                    </span>
                    <input
                      id={interactive ? 'apres-tel' : undefined}
                      type="tel"
                      readOnly={!interactive}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setConfirmStage('idle');
                      }}
                      className={`w-full rounded-xl border pl-10 pr-3.5 font-mono tabular-nums ${inputBg} ${
                        compact ? 'h-10 text-[14px]' : 'h-12 text-sm'
                      }`}
                    />
                  </div>
                </div>

                {/* Custom Searchable 58-Wilaya Combobox (Visitor) / Clean Readout (Capture) */}
                <div ref={comboRef} className={compact ? 'relative' : 'relative sm:col-span-2'}>
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5">
                    <label
                      htmlFor={interactive ? 'apres-wilaya-btn' : undefined}
                      className={`flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium ${inkSecondary}`}
                    >
                      <Truck size={13} weight="regular" className="shrink-0" />
                      Wilaya (58 Wilayas)
                    </label>
                    <div
                      className={`flex shrink-0 items-center gap-1 rounded-lg border p-0.5 font-mono text-[10px] ${
                        isLight
                          ? 'border-[#09090b]/10 bg-[#efefe9]'
                          : 'border-white/[0.08] bg-[#090a0d]'
                      }`}
                    >
                      {(
                        [
                          { id: 'stopdesk', label: `Stop-Desk ${wilaya.stopDeskDzd} DA` },
                          { id: 'domicile', label: `Domicile ${wilaya.domicileDzd} DA` },
                        ] as const
                      ).map((opt) => {
                        const active = deliveryType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => interactive && setDeliveryType(opt.id)}
                            className={`relative cursor-pointer whitespace-nowrap rounded-md px-2 py-0.5 transition-colors duration-150 ${
                              active
                                ? inkPrimary
                                : isLight
                                  ? 'text-[#71717a] hover:text-[#09090b]'
                                  : 'text-[#71717a] hover:text-[#a1a1aa]'
                            }`}
                          >
                            {active && interactive ? (
                              <motion.span
                                layoutId="atlas-delivery-pill"
                                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                                className={`absolute inset-0 rounded-md ${
                                  isLight ? 'bg-white shadow-xs' : 'bg-white/[0.14]'
                                }`}
                              />
                            ) : active ? (
                              <span
                                className={`absolute inset-0 rounded-md ${
                                  isLight ? 'bg-white shadow-xs' : 'bg-white/[0.14]'
                                }`}
                              />
                            ) : null}
                            <span className="relative z-10 font-semibold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {interactive ? (
                    <>
                      <button
                        id="apres-wilaya-btn"
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={wilayaOpen}
                        onClick={() => setWilayaOpen((o) => !o)}
                        className={`cursor-pointer flex h-12 w-full items-center justify-between rounded-xl border px-3.5 text-left text-sm transition-colors duration-150 ${inputBg}`}
                      >
                        <span className="truncate">
                          <span className={`font-mono mr-1.5 ${inkSecondary}`}>{wilaya.code}</span>
                          {wilaya.nameFr} ·{' '}
                          <span style={{ fontFamily: 'var(--font-arabic)' }}>{wilaya.nameAr}</span>{' '}
                          <span
                            className={`font-mono text-xs font-medium ${
                              isLight ? 'text-emerald-700' : 'text-emerald-400'
                            }`}
                          >
                            ({wilaya.etaLabel})
                          </span>
                        </span>
                        <CaretDown
                          size={15}
                          className={`shrink-0 ${inkSecondary} transition-transform duration-150 ${
                            wilayaOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {wilayaOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: -4 }}
                            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                            style={{ transformOrigin: 'top center' }}
                            className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border backdrop-blur-2xl ${
                              isLight
                                ? 'border-[#09090b]/14 bg-white/96 shadow-[0_24px_60px_rgba(15,23,42,0.16)]'
                                : 'border-white/[0.14] bg-[#0d0e13]/96 shadow-[0_24px_60px_rgba(0,0,0,0.75)]'
                            }`}
                          >
                            <div className={`flex items-center gap-2 border-b ${borderHair} px-3 py-2`}>
                              <MagnifyingGlass size={15} className={inkMuted} />
                              <input
                                type="text"
                                autoFocus
                                value={wilayaQuery}
                                onChange={(e) => setWilayaQuery(e.target.value)}
                                placeholder="Rechercher code (16), Alger, وهران..."
                                className={`w-full bg-transparent text-xs focus:outline-none ${inkPrimary} placeholder:text-[#71717a]`}
                              />
                            </div>
                            <ul
                              role="listbox"
                              data-lenis-prevent
                              className="max-h-56 overflow-y-auto p-1.5 space-y-0.5"
                            >
                              {filteredWilayas.map((w) => {
                                const selected = w.code === wilayaCode;
                                return (
                                  <li key={w.code}>
                                    <button
                                      type="button"
                                      role="option"
                                      aria-selected={selected}
                                      onClick={() => {
                                        setWilayaCode(w.code);
                                        setWilayaOpen(false);
                                        setWilayaQuery('');
                                        setConfirmStage('idle');
                                      }}
                                      className={`cursor-pointer flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors duration-100 ${
                                        selected
                                          ? isLight
                                            ? 'bg-[#09090b]/[0.08] text-[#09090b] font-semibold'
                                            : 'bg-white/[0.12] text-[#f5f5f2] font-semibold'
                                          : isLight
                                            ? 'text-[#52525b] hover:bg-[#09090b]/[0.04] hover:text-[#09090b]'
                                            : 'text-[#a1a1aa] hover:bg-white/[0.06] hover:text-[#f5f5f2]'
                                      }`}
                                    >
                                      <span>
                                        <span className={`font-mono mr-2 ${inkMuted}`}>{w.code}</span>
                                        {w.nameFr} ·{' '}
                                        <span style={{ fontFamily: 'var(--font-arabic)' }}>
                                          {w.nameAr}
                                        </span>
                                      </span>
                                      <span className="flex items-center gap-2 font-mono text-[11px] tabular-nums">
                                        <span className={isLight ? 'text-emerald-700' : 'text-emerald-300'}>
                                          {deliveryType === 'stopdesk'
                                            ? `${w.stopDeskDzd} DA`
                                            : `${w.domicileDzd} DA`}
                                        </span>
                                        {selected && <Check size={13} weight="bold" />}
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div
                      className={`flex w-full items-center justify-between rounded-xl border px-3.5 ${inputBg} ${
                        compact ? 'h-10 text-[14px]' : 'h-12 text-sm'
                      }`}
                    >
                      <span className="truncate">
                        {wilaya.code} - {wilaya.nameFr} ·{' '}
                        <span style={{ fontFamily: 'var(--font-arabic)' }}>{wilaya.nameAr}</span> (
                        {wilaya.etaLabel})
                      </span>
                      <CaretDown size={14} className={`shrink-0 ${inkMuted}`} />
                    </div>
                  )}
                </div>
              </div>

              {/* High-Contrast Mobile Thumb CTA (min-h-[56px]) with Rolling Tabular Price */}
              <button
                type="submit"
                className={`group cursor-pointer flex min-h-[56px] w-full items-center justify-between gap-2 rounded-2xl pl-4 sm:pl-5 pr-2 py-2 transition-transform duration-100 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] ${
                  isLight
                    ? 'bg-[#09090b] text-[#f5f5f2] shadow-[0_14px_34px_rgba(9,9,11,0.2)]'
                    : 'bg-[#f5f5f2] text-[#060607] shadow-[0_12px_32px_rgba(245,245,242,0.14)]'
                }`}
              >
                <div className="min-w-0 text-left">
                  <div className="flex flex-nowrap items-center gap-1.5 font-display text-[13.5px] sm:text-[15px] font-bold tracking-tight">
                    <span className="truncate">
                      {confirmStage === 'verifying' ? (
                        'Vérification HMAC 18 µs...'
                      ) : confirmStage === 'confirmed' && interactive ? (
                        'Confirmée ·'
                      ) : (
                        <>
                          Commander<span className="hidden sm:inline"> maintenant</span> ·
                        </>
                      )}
                    </span>
                    {interactive ? (
                      <span className="inline-block shrink-0 overflow-hidden align-bottom h-[22px] whitespace-nowrap">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={totalDzd}
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -16, opacity: 0 }}
                            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                            className="inline-block whitespace-nowrap font-mono tabular-nums"
                          >
                            {formatDzd(totalDzd)}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                    ) : (
                      <span className="shrink-0 whitespace-nowrap font-mono tabular-nums">
                        {formatDzd(totalDzd)}
                      </span>
                    )}
                  </div>
                  <div
                    className={`truncate font-mono text-[10px] font-medium tabular-nums ${
                      isLight ? 'text-[#a1a1aa]' : 'text-[#3f3f46]'
                    }`}
                  >
                    {formatDzd(ATLAS_JACKET.priceDzd)} + {formatDzd(shippingDzd)} ({wilaya.nameFr})
                  </div>
                </div>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                    isLight ? 'bg-[#f5f5f2] text-[#09090b]' : 'bg-[#060607] text-[#f5f5f2]'
                  }`}
                >
                  {confirmStage === 'confirmed' && interactive ? (
                    <Check
                      size={18}
                      weight="bold"
                      className={isLight ? 'text-emerald-600' : 'text-emerald-400'}
                    />
                  ) : (
                    <ArrowUpRight size={18} weight="bold" />
                  )}
                </span>
              </button>

              {interactive && formError && (
                <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                  {formError}
                </div>
              )}

              {/* PostgreSQL HMAC Webhook Verifier + Inline AI Confirmation Agent */}
              <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 @[460px]:grid-cols-2'}`}>
                <div
                  className={`rounded-xl border p-3 ${
                    isLight
                      ? 'border-emerald-600/25 bg-emerald-600/[0.06]'
                      : 'border-emerald-500/28 bg-emerald-500/[0.07]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck
                        size={17}
                        weight="fill"
                        className={`shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}
                      />
                      <span
                        className={`truncate font-mono text-[11px] font-semibold ${
                          isLight ? 'text-emerald-900' : 'text-emerald-300'
                        }`}
                      >
                        Webhook HMAC Vérifié
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
                        isLight
                          ? 'bg-emerald-600/14 text-emerald-800'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      18 µs
                    </span>
                  </div>
                  <div className={`mt-1.5 flex items-center justify-between gap-2 font-mono text-[10px] ${inkSecondary}`}>
                    <span className="truncate">PostgreSQL RLS Locked</span>
                    <span className={`shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400/80'}`}>
                      sha256:9f4e..c81a
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-xl border p-3 ${
                    isLight
                      ? 'border-[#09090b]/10 bg-[#f7f7f4]'
                      : 'border-white/[0.1] bg-[#0b0d10]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={
                          pulseStyle
                            ? 'inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500'
                            : 'visitor-pulse-dot inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500'
                        }
                        style={pulseStyle}
                      />
                      <span className={`truncate whitespace-nowrap text-[11px] font-semibold ${inkPrimary}`}>
                        Agent IA : Confirmée en 2s
                      </span>
                    </div>
                    <Sparkle
                      size={14}
                      weight="fill"
                      className={`shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}
                    />
                  </div>
                  <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${inkSecondary}`}>
                    <CheckCircle
                      size={12}
                      weight="fill"
                      className={`shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}
                    />
                    <span className="truncate">
                      {confirmStage === 'confirmed'
                        ? `Confirmé pour ${fullName} · ${wilaya.nameFr} (${wilaya.etaLabel})`
                        : 'Prêt : confirmation auto WhatsApp sans attente 24h'}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
);

ApresStorefrontView.displayName = 'ApresStorefrontView';
