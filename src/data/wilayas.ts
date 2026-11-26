export interface Wilaya {
  readonly code: string;
  readonly nameFr: string;
  readonly nameAr: string;
  readonly stopDeskDzd: number;
  readonly domicileDzd: number;
  readonly etaLabel: string;
}

/**
 * Complete 58 Algerian Wilayas (01 Adrar -> 58 El Meniaa)
 * with realistic apparel Stop-Desk and Domicile COD courier tariffs.
 */
export const ALGERIA_WILAYAS: readonly Wilaya[] = [
  { code: '01', nameFr: 'Adrar', nameAr: 'أدرار', stopDeskDzd: 800, domicileDzd: 1100, etaLabel: '48-72h' },
  { code: '02', nameFr: 'Chlef', nameAr: 'الشلف', stopDeskDzd: 450, domicileDzd: 650, etaLabel: '24-48h' },
  { code: '03', nameFr: 'Laghouat', nameAr: 'الأغواط', stopDeskDzd: 600, domicileDzd: 850, etaLabel: '48h' },
  { code: '04', nameFr: 'Oum El Bouaghi', nameAr: 'أم البواقي', stopDeskDzd: 500, domicileDzd: 700, etaLabel: '24-48h' },
  { code: '05', nameFr: 'Batna', nameAr: 'باتنة', stopDeskDzd: 500, domicileDzd: 700, etaLabel: '24-48h' },
  { code: '06', nameFr: 'Béjaïa', nameAr: 'بجاية', stopDeskDzd: 450, domicileDzd: 650, etaLabel: '24h' },
  { code: '07', nameFr: 'Biskra', nameAr: 'بسكرة', stopDeskDzd: 550, domicileDzd: 800, etaLabel: '48h' },
  { code: '08', nameFr: 'Béchar', nameAr: 'بشار', stopDeskDzd: 750, domicileDzd: 1050, etaLabel: '48-72h' },
  { code: '09', nameFr: 'Blida', nameAr: 'البليدة', stopDeskDzd: 400, domicileDzd: 550, etaLabel: '24h' },
  { code: '10', nameFr: 'Bouira', nameAr: 'البويرة', stopDeskDzd: 450, domicileDzd: 600, etaLabel: '24h' },
  { code: '11', nameFr: 'Tamanrasset', nameAr: 'تمنراست', stopDeskDzd: 900, domicileDzd: 1200, etaLabel: '72h' },
  { code: '12', nameFr: 'Tébessa', nameAr: 'تبسة', stopDeskDzd: 550, domicileDzd: 800, etaLabel: '48h' },
  { code: '13', nameFr: 'Tlemcen', nameAr: 'تلمسان', stopDeskDzd: 500, domicileDzd: 750, etaLabel: '24-48h' },
  { code: '14', nameFr: 'Tiaret', nameAr: 'تيارت', stopDeskDzd: 500, domicileDzd: 750, etaLabel: '24-48h' },
  { code: '15', nameFr: 'Tizi Ouzou', nameAr: 'تيزي وزو', stopDeskDzd: 450, domicileDzd: 600, etaLabel: '24h' },
  { code: '16', nameFr: 'Alger', nameAr: 'الجزائر', stopDeskDzd: 400, domicileDzd: 500, etaLabel: '24h' },
  { code: '17', nameFr: 'Djelfa', nameAr: 'الجلفة', stopDeskDzd: 550, domicileDzd: 800, etaLabel: '48h' },
  { code: '18', nameFr: 'Jijel', nameAr: 'جيجل', stopDeskDzd: 500, domicileDzd: 700, etaLabel: '24-48h' },
  { code: '19', nameFr: 'Sétif', nameAr: 'سطيف', stopDeskDzd: 450, domicileDzd: 650, etaLabel: '24h' },
  { code: '20', nameFr: 'Saïda', nameAr: 'سعيدة', stopDeskDzd: 550, domicileDzd: 750, etaLabel: '48h' },
  { code: '21', nameFr: 'Skikda', nameAr: 'سكيكدة', stopDeskDzd: 500, domicileDzd: 700, etaLabel: '24-48h' },
  { code: '22', nameFr: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', stopDeskDzd: 500, domicileDzd: 750, etaLabel: '24-48h' },
  { code: '23', nameFr: 'Annaba', nameAr: 'عنابة', stopDeskDzd: 500, domicileDzd: 700, etaLabel: '24-48h' },
  { code: '24', nameFr: 'Guelma', nameAr: 'قالمة', stopDeskDzd: 500, domicileDzd: 750, etaLabel: '24-48h' },
  { code: '25', nameFr: 'Constantine', nameAr: 'قسنطينة', stopDeskDzd: 450, domicileDzd: 650, etaLabel: '24h' },
  { code: '26', nameFr: 'Médéa', nameAr: 'المدية', stopDeskDzd: 450, domicileDzd: 650, etaLabel: '24h' },
  { code: '27', nameFr: 'Mostaganem', nameAr: 'مستغانم', stopDeskDzd: 500, domicileDzd: 700, etaLabel: '24-48h' },
  { code: '28', nameFr: "M'Sila", nameAr: 'المسيلة', stopDeskDzd: 500, domicileDzd: 750, etaLabel: '24-48h' },
  { code: '29', nameFr: 'Mascara', nameAr: 'معسكر', stopDeskDzd: 500, domicileDzd: 750, etaLabel: '24-48h' },
  { code: '30', nameFr: 'Ouargla', nameAr: 'ورقلة', stopDeskDzd: 700, domicileDzd: 950, etaLabel: '48-72h' },
  { code: '31', nameFr: 'Oran', nameAr: 'وهران', stopDeskDzd: 450, domicileDzd: 650, etaLabel: '24h' },
  { code: '32', nameFr: 'El Bayadh', nameAr: 'البيض', stopDeskDzd: 650, domicileDzd: 900, etaLabel: '48h' },
  { code: '33', nameFr: 'Illizi', nameAr: 'إليزي', stopDeskDzd: 900, domicileDzd: 1200, etaLabel: '72h' },
  { code: '34', nameFr: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج', stopDeskDzd: 450, domicileDzd: 650, etaLabel: '24h' },
  { code: '35', nameFr: 'Boumerdès', nameAr: 'بومرداس', stopDeskDzd: 400, domicileDzd: 550, etaLabel: '24h' },
  { code: '36', nameFr: 'El Tarf', nameAr: 'الطارف', stopDeskDzd: 550, domicileDzd: 750, etaLabel: '48h' },
  { code: '37', nameFr: 'Tindouf', nameAr: 'تندوف', stopDeskDzd: 900, domicileDzd: 1200, etaLabel: '72h' },
  { code: '38', nameFr: 'Tissemsilt', nameAr: 'تيسمسيلت', stopDeskDzd: 500, domicileDzd: 750, etaLabel: '48h' },
  { code: '39', nameFr: 'El Oued', nameAr: 'الوادي', stopDeskDzd: 650, domicileDzd: 900, etaLabel: '48h' },
  { code: '40', nameFr: 'Khenchela', nameAr: 'خنشلة', stopDeskDzd: 550, domicileDzd: 800, etaLabel: '48h' },
  { code: '41', nameFr: 'Souk Ahras', nameAr: 'سوق أهراس', stopDeskDzd: 550, domicileDzd: 800, etaLabel: '48h' },
  { code: '42', nameFr: 'Tipaza', nameAr: 'تيبازة', stopDeskDzd: 400, domicileDzd: 550, etaLabel: '24h' },
  { code: '43', nameFr: 'Mila', nameAr: 'ميلة', stopDeskDzd: 500, domicileDzd: 700, etaLabel: '24-48h' },
  { code: '44', nameFr: 'Aïn Defla', nameAr: 'عين الدفلى', stopDeskDzd: 450, domicileDzd: 650, etaLabel: '24h' },
  { code: '45', nameFr: 'Naâma', nameAr: 'النعامة', stopDeskDzd: 650, domicileDzd: 900, etaLabel: '48h' },
  { code: '46', nameFr: 'Aïn Témouchent', nameAr: 'عين تموشنت', stopDeskDzd: 500, domicileDzd: 750, etaLabel: '24-48h' },
  { code: '47', nameFr: 'Ghardaïa', nameAr: 'غرداية', stopDeskDzd: 650, domicileDzd: 900, etaLabel: '48h' },
  { code: '48', nameFr: 'Relizane', nameAr: 'غليزان', stopDeskDzd: 500, domicileDzd: 700, etaLabel: '24-48h' },
  { code: '49', nameFr: 'Timimoun', nameAr: 'تيميمون', stopDeskDzd: 850, domicileDzd: 1150, etaLabel: '72h' },
  { code: '50', nameFr: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار', stopDeskDzd: 900, domicileDzd: 1200, etaLabel: '72h' },
  { code: '51', nameFr: 'Ouled Djellal', nameAr: 'أولاد جلال', stopDeskDzd: 600, domicileDzd: 850, etaLabel: '48h' },
  { code: '52', nameFr: 'Béni Abbès', nameAr: 'بني عباس', stopDeskDzd: 800, domicileDzd: 1100, etaLabel: '72h' },
  { code: '53', nameFr: 'In Salah', nameAr: 'عين صالح', stopDeskDzd: 850, domicileDzd: 1150, etaLabel: '72h' },
  { code: '54', nameFr: 'In Guezzam', nameAr: 'عين قزام', stopDeskDzd: 900, domicileDzd: 1200, etaLabel: '72h' },
  { code: '55', nameFr: 'Touggourt', nameAr: 'تقرت', stopDeskDzd: 650, domicileDzd: 900, etaLabel: '48h' },
  { code: '56', nameFr: 'Djanet', nameAr: 'جانت', stopDeskDzd: 900, domicileDzd: 1200, etaLabel: '72h' },
  { code: '57', nameFr: "El M'Ghair", nameAr: 'المغير', stopDeskDzd: 650, domicileDzd: 900, etaLabel: '48h' },
  { code: '58', nameFr: 'El Meniaa', nameAr: 'المنيعة', stopDeskDzd: 750, domicileDzd: 1050, etaLabel: '48-72h' },
] as const;

export function getWilayaByCode(code: string): Wilaya {
  const match = ALGERIA_WILAYAS.find((w) => w.code === code);
  return match ?? ALGERIA_WILAYAS[15]!; // Default 16 - Alger
}
