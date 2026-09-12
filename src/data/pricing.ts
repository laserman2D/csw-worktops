/**
 * PRICING GUIDE data. Indicative only.
 * The typical-kitchen range is a placeholder until you decide what to publish.
 */
import { TODO } from './site';

export const typicalKitchen = {
  /** What "typical" means, so the range is honest. */
  description:
    'a 20mm quartz worktop of around 6 to 8 square metres in three or four pieces, with one sink cut-out, one hob cut-out, polished square edges and 100mm upstands',
  /** Publish a real range or leave the placeholder. Example format: "£2,800 to £4,200 including VAT and fitting". */
  range: TODO('published price range for a typical kitchen, including VAT and fitting'),
};

export const priceDrivers = [
  {
    name: 'Material and colour',
    effect: 'Biggest single factor',
    detail:
      'Within one brand, colours sit in price groups. A plain white quartz and a heavily veined marble-effect quartz from the same range can differ by 50 percent or more. Ultra-compact costs more than quartz. Granite varies by slab.',
  },
  {
    name: 'Area and number of pieces',
    effect: 'Large',
    detail:
      'Price is driven by how many slabs are needed, not just the area. A layout that fits on two slabs with little waste is cheaper than one that needs three slabs with a lot of offcut.',
  },
  {
    name: 'Thickness',
    effect: 'Moderate',
    detail:
      '20mm is standard for quartz. 30mm costs more and is heavier. 12mm ultra-compact is common and needs a different support build-up.',
  },
  {
    name: 'Cut-outs',
    effect: 'Moderate',
    detail:
      'Every sink, hob, tap hole, socket and drainer groove is extra machining. Undermount sinks cost more than inset because the cut-out edge is polished. Flush-fitted hobs cost more again.',
  },
  {
    name: 'Edge detail',
    effect: 'Moderate',
    detail:
      'A polished square or pencil edge is standard. Bevels, bullnoses and ogees cost more. Mitred waterfall ends and built-up edges are the most expensive.',
  },
  {
    name: 'Splashbacks and upstands',
    effect: 'Moderate',
    detail:
      'Upstands (100mm) are cheap per metre. Full-height splashbacks behind a hob are priced like a worktop and often need a separate template visit after the worktops are in.',
  },
  {
    name: 'Access and removal',
    effect: 'Small to moderate',
    detail:
      'Tight access, upper floors and large single pieces need more people and time. Removing old stone worktops is charged. Removing laminate usually is not.',
  },
];
