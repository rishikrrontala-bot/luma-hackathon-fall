/** Reference paper sizes in millimetres (ISO 216 A4; ANSI US Letter). */
export type PaperSizeId = 'letter' | 'a4';

export interface PaperSize {
  id: PaperSizeId;
  label: string;
  short: number;
  long: number;
}

export const PAPER_SIZES: Record<PaperSizeId, PaperSize> = {
  letter: { id: 'letter', label: 'US Letter', short: 215.9, long: 279.4 },
  a4: { id: 'a4', label: 'A4', short: 210, long: 297 },
};

/** US, Canada, Mexico, the Philippines and a few others use Letter; everyone else A4. */
const LETTER_REGIONS = new Set(['US', 'CA', 'MX', 'PH', 'CL', 'CO', 'VE', 'GT', 'CR', 'PR', 'DO', 'SV', 'PA', 'NI', 'HN', 'BZ']);

export function defaultPaperForLocale(locale: string | undefined): PaperSizeId {
  const region = (locale ?? '').split(/[-_]/)[1]?.toUpperCase();
  if (!region) return (locale ?? '').toLowerCase().startsWith('en') ? 'letter' : 'a4';
  return LETTER_REGIONS.has(region) ? 'letter' : 'a4';
}
