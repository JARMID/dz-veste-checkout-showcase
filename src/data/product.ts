export interface ProductSpec {
  readonly brand: string;
  readonly dropCode: string;
  readonly name: string;
  readonly shortName: string;
  readonly priceDzd: number;
  readonly compareAtPriceDzd: number;
  readonly fabricSpec: string;
  readonly fitLabel: string;
  readonly stockRemaining: number;
  readonly sizes: readonly ('S' | 'M' | 'L' | 'XL')[];
  readonly heroImage: string;
  readonly heroLightImage: string;
  readonly campaignWideImage: string;
  readonly detailImage: string;
}

export const ATLAS_JACKET: ProductSpec = {
  brand: 'ATELIER ATLAS',
  dropCode: 'AW26 // ARCHIVE 04',
  name: 'Veste Oversize Atlas',
  shortName: 'Veste Atlas 520g',
  priceDzd: 7800,
  compareAtPriceDzd: 15600,
  fabricSpec: '520 GSM Twill Technique Déperlant',
  fitLabel: 'Coupe Boxy Oversize',
  stockRemaining: 7,
  sizes: ['S', 'M', 'L', 'XL'],
  heroImage: '/assets/atlas-jacket-hero.png',
  heroLightImage: '/assets/atlas-jacket-light.jpg',
  campaignWideImage: '/assets/atlas-campaign-wide.jpg',
  detailImage: '/assets/atlas-jacket-detail.png',
} as const;

export const AGENCY_BRAND = {
  name: 'JARMID',
  handle: '@jar.mid',
  founder: 'Khalef Abdelmadjid',
  portfolioUrl: 'https://madjid-founder-portfolio.vercel.app',
  whatsappDisplay: '+213 781 69 41 23',
  whatsappHref: 'https://wa.me/213781694123?text=AUDIT%20-%20Je%20veux%20optimiser%20mon%20checkout%20e-commerce%20en%2048h',
  ctaHeadline: 'Commente AUDIT - Livré en 48h',
  ratingAvant: 'Avant : 9 champs · CTA 1.54:1 · Capture 24h',
  ratingApres: 'Après : 3 champs · HMAC 18 µs · Agent IA 2s',
} as const;

export interface CodFieldMeta {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
  readonly demoValue: string;
  readonly kept: boolean;
  readonly spanTwo?: boolean;
}

/**
 * Exact 9 bloated fields from Khalef's script (Clip 02 & Clip 03).
 * Exactly 3 survive the Act 3 filter: nom, telephone, wilaya.
 */
export const AVANT_COD_FIELDS: readonly CodFieldMeta[] = [
  { id: 'nom', label: 'Nom *', placeholder: 'Votre nom', demoValue: 'Benali', kept: true },
  { id: 'prenom', label: 'Prénom *', placeholder: 'Votre prénom', demoValue: 'Amine', kept: false },
  { id: 'email', label: 'Adresse Email *', placeholder: 'exemple@gmail.com', demoValue: 'amine.dz@mail.com', kept: false, spanTwo: true },
  { id: 'telephone', label: 'Téléphone 1 *', placeholder: '05 / 06 / 07...', demoValue: '0554 82 19 40', kept: true },
  { id: 'tel2', label: 'Téléphone 2 (Obligatoire)', placeholder: 'Numéro de secours', demoValue: '0771 10 44 29', kept: false },
  { id: 'adresse', label: 'Adresse complète *', placeholder: 'Rue, bâtiment, étage...', demoValue: 'Cité 400 Logts Bât B', kept: false, spanTwo: true },
  { id: 'code_postal', label: 'Code Postal *', placeholder: 'Ex: 16000', demoValue: '16035', kept: false },
  { id: 'commune', label: 'Commune / Daïra *', placeholder: 'Votre commune', demoValue: 'Hydra', kept: false },
  { id: 'wilaya', label: 'Wilaya (58) *', placeholder: 'Sélectionner', demoValue: '16 - Alger', kept: true, spanTwo: true },
] as const;

export function formatDzd(amount: number): string {
  const rounded = Math.round(amount);
  const str = String(rounded);
  const spaced = str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${spaced} DA`;
}
