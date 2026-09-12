/**
 * SITE SETTINGS — the one file to fill in.
 *
 * Every value wrapped in TODO() is a placeholder. It renders visibly on the
 * page as "[TODO: …]" so nothing fake can slip through, and it is excluded
 * from structured data until you replace it. Run `npm run placeholders` to
 * list everything still outstanding.
 */

export const TODO = (label: string) => `[TODO: ${label}]`;
export const isPlaceholder = (v: unknown) =>
  typeof v === 'string' && v.startsWith('[TODO:');

export const site = {
  /** Trading name shown in the header, titles and footer. */
  name: 'Cheshire Stoneworks',
  /** Used in page titles: "Page | Cheshire Stoneworks Worktops". */
  titleSuffix: 'Cheshire Stoneworks Worktops',
  /** Default meta description. */
  description:
    'Quartz, granite and ultra-compact worktops, templated, made and fitted by the team that does it every day for the national kitchen retailers. Based in Lymm, Cheshire, covering the North West and North Wales.',

  contact: {
    /** Public phone number, as displayed. */
    phoneDisplay: TODO('public phone number'),
    /** Same number in E.164 for tel: links, e.g. +441925000000. Placeholder keeps the link inert. */
    phoneE164: TODO('phone in E.164'),
    /** WhatsApp number in international format without +, e.g. 441925000000. Leave empty to hide WhatsApp. */
    whatsapp: '',
    email: TODO('public email address'),
    /** Free-text hours shown on the Contact page and in the footer. */
    hoursText: TODO('business hours, e.g. Monday to Friday, 8am to 5pm'),
    /** Structured hours for schema.org. Days: Mo Tu We Th Fr Sa Su. Set null to omit. */
    openingHours: null as null | { days: string[]; opens: string; closes: string }[],
  },

  address: {
    /** Where the business operates from. Used on Contact and in LocalBusiness schema. */
    street: TODO('street address'),
    locality: 'Lymm',
    region: 'Cheshire',
    postcode: TODO('postcode'),
    country: 'GB',
  },

  legal: {
    registeredName: 'Cheshire Stoneworks Ltd',
    companyNumber: TODO('company number'),
    placeOfRegistration: 'England and Wales',
    registeredOffice: TODO('registered office address'),
    /** Set vatRegistered to false if not registered; the footer then omits the VAT line. */
    vatRegistered: true,
    vatNumber: TODO('VAT number'),
  },

  /** Approximate coverage radius from Lymm, in miles. Used in copy and schema. */
  coverageRadiusMiles: 40,

  /** Honest lead time statements. Replace with real figures. */
  leadTimes: {
    enquiryToSurvey: TODO('time from enquiry to survey, e.g. "within five working days"'),
    templateToInstall: TODO('working days from template to install, e.g. "seven to ten working days"'),
  },

  guarantee: {
    summary: TODO('guarantee summary, e.g. "12 months on our workmanship, plus the manufacturer warranty on the material"'),
    remedy: TODO('what happens if a piece is wrong, e.g. "we re-make and re-fit it at our cost"'),
  },

  /** External review profiles. Leave url empty to hide. No invented ratings. */
  reviews: {
    google: { url: '', label: 'Google reviews' },
    checkatrade: { url: '', label: 'Checkatrade' },
    trustpilot: { url: '', label: 'Trustpilot' },
  },

  /** Social links. Leave empty to hide. */
  social: {
    instagram: '',
    facebook: '',
  },

  /**
   * Set to true once the site is live on its final domain.
   * While false, every page carries a noindex tag so a half-finished
   * site does not get indexed under placeholder details.
   */
  indexable: false,

  /** Cloudflare Web Analytics token. Leave empty for no analytics at all. */
  cloudflareAnalyticsToken: '',
};

export type Site = typeof site;
