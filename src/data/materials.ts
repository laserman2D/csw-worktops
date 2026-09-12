/**
 * Materials offered retail, and the honest comparison table.
 * Relative cost is shown as £ bands rather than invented prices.
 * Brand lists: edit to match what you actually supply direct.
 */
export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Material {
  slug: string;
  name: string;
  short: string;
  brands: string[];
  costBand: '££' | '£££' | '££££';
  /** 1 = poor, 5 = excellent */
  scores: {
    scratch: Rating;
    heat: Rating;
    stain: Rating;
    chip: Rating;
    repair: Rating;
    consistency: Rating;
    outdoor: Rating;
  };
  goodFor: string[];
  letsYouDown: string[];
  care: string;
}

export const materials: Material[] = [
  {
    slug: 'quartz',
    name: 'Quartz',
    short:
      'Engineered stone: crushed quartz bound in resin. The most popular choice for a reason. Consistent colour, easy to live with, no sealing.',
    brands: ['Caesarstone', 'Silestone', 'Compac', 'Unistone'],
    costBand: '£££',
    scores: { scratch: 4, heat: 2, stain: 5, chip: 4, repair: 3, consistency: 5, outdoor: 1 },
    goodFor: [
      'Busy family kitchens where stains matter more than anything',
      'Plain whites, greys and marble-effect patterns that look the same across every piece',
      'People who do not want to seal or maintain anything',
    ],
    letsYouDown: [
      'Heat. The resin scorches and can discolour under a hot pan. Use a trivet, always.',
      'Sunlight. Some colours yellow over time in a south-facing window or conservatory.',
      'Not suitable outdoors.',
      'Chips can be filled but the repair is rarely invisible on plain, light colours.',
    ],
    care: 'Warm soapy water. No bleach, no oven cleaner, no abrasive pads.',
  },
  {
    slug: 'granite',
    name: 'Granite',
    short:
      'Natural stone, quarried and polished. Every slab is different. Tolerates heat that would mark quartz, but needs sealing and shows its origins.',
    brands: ['Natural stone, sourced by slab. You can view and choose your slab before it is cut.'],
    costBand: '£££',
    scores: { scratch: 5, heat: 5, stain: 3, chip: 3, repair: 4, consistency: 2, outdoor: 4 },
    goodFor: [
      'Cooks who put hot pans down',
      'Anyone who wants natural variation and a genuine stone surface',
      'Outdoor kitchens and utility rooms',
    ],
    letsYouDown: [
      'It is porous. It needs sealing on install and re-sealing every year or two, or it will mark. Oils and red wine are the usual culprits.',
      'Colour consistency. Two pieces from the same slab can look different. We plan cuts to minimise this but cannot eliminate it.',
      'Fissures and pits are natural and not defects, but some people do not like them.',
      'Dark polished granites show water marks and fingerprints.',
    ],
    care: 'Wipe spills promptly. Use a pH-neutral cleaner. Re-seal when water stops beading on the surface.',
  },
  {
    slug: 'ultra-compact',
    name: 'Ultra-compact (sintered)',
    short:
      'Minerals fired at very high temperature and pressure. The toughest surface against heat, scratches, UV and stains. Also the least forgiving to work with and the most likely to chip on an edge.',
    brands: ['Dekton', 'Neolith', 'Lapitec'],
    costBand: '££££',
    scores: { scratch: 5, heat: 5, stain: 5, chip: 2, repair: 1, consistency: 4, outdoor: 5 },
    goodFor: [
      'Heavy-use kitchens and serious cooks',
      'Outdoor kitchens, sunny rooms, and anywhere UV would fade other materials',
      'Thin profiles (12mm) and large-format designs with few joins',
    ],
    letsYouDown: [
      'Edge chips. It is very hard but brittle. A dropped pan on a corner can chip it, and a chip cannot be repaired invisibly.',
      'It is the most expensive option and the most expensive to fabricate. Cut-outs and detailed edges cost more than in quartz.',
      'Slabs are large and heavy. Access and handling on site are a real consideration.',
      'If a piece is wrong it is remade, not adjusted. There is very little on-site tolerance.',
    ],
    care: 'Almost anything. Avoid products containing hydrofluoric acid (some descalers).',
  },
];

export const comparisonRows: { key: keyof Material['scores']; label: string; note: string }[] = [
  { key: 'scratch', label: 'Scratch resistance', note: 'Everyday knives and pans' },
  { key: 'heat', label: 'Heat resistance', note: 'A hot pan straight from the hob' },
  { key: 'stain', label: 'Stain resistance', note: 'Wine, oil, turmeric, beetroot' },
  { key: 'chip', label: 'Chip resistance', note: 'Knocks on edges and corners' },
  { key: 'repair', label: 'Repairability', note: 'Can damage be fixed in place?' },
  { key: 'consistency', label: 'Colour consistency', note: 'Will separate pieces match?' },
  { key: 'outdoor', label: 'Outdoor and UV', note: 'Sunlight and weather' },
];

export const ratingWords: Record<Rating, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};
