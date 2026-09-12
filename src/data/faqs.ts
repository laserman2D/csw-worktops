/** Genuine FAQs. Shown on the relevant page and emitted as FAQPage schema. */
import { site } from './site';

export interface Faq {
  q: string;
  a: string;
}

export const homeFaqs: Faq[] = [
  {
    q: 'Do you supply the worktops or just fit them?',
    a: 'Both. We template, arrange fabrication, deliver and fit. You choose the material with us and we handle the rest.',
  },
  {
    q: 'Can you template before the kitchen is fitted?',
    a: 'No. The template is taken from the fitted base units, with the sink and hob on site. That is what makes it accurate. If the kitchen moves after we template, the worktops will not fit.',
  },
  {
    q: 'How long does it take?',
    a: `We aim to survey ${site.leadTimes.enquiryToSurvey}. From template to install is typically ${site.leadTimes.templateToInstall}, depending on the material.`,
  },
  {
    q: 'Do you remove the old worktops?',
    a: 'We can, by arrangement. Tell us on the enquiry form. Laminate is straightforward. Removing old stone is quoted separately.',
  },
  {
    q: 'What happens if a piece is wrong?',
    a: site.guarantee.remedy,
  },
];

export const pricingFaqs: Faq[] = [
  {
    q: 'Why will you not give a price per square metre?',
    a: 'Because it would mislead you. Two kitchens with the same area can differ by a third in price depending on the material, the number of pieces, cut-outs, edge detail and access. We quote each job from a plan or a survey.',
  },
  {
    q: 'Is the survey free?',
    a: 'We give an indicative quote from your plan or photos first. If you want to go ahead, we book the template. Whether the template is charged if you later cancel is set out in our terms.',
  },
  {
    q: 'Do you need a deposit?',
    a: 'Yes. Worktops are made to measure for your kitchen and cannot be resold. We take a deposit once you have approved the written quote and specification, before the material is ordered.',
  },
];

export const processFaqs: Faq[] = [
  {
    q: 'What needs to be ready before you template?',
    a: 'All base units fitted, level and fixed. Sink, hob and taps on site (they do not need to be plumbed in). Wall panels, end panels and appliance housings in place. Old worktops removed, or arranged for us to remove.',
  },
  {
    q: 'Can I be out during the install?',
    a: 'Someone needs to let us in and be contactable. You do not need to be there all day. We need water and power.',
  },
  {
    q: 'Will there be joins?',
    a: 'Usually, yes. Slabs have a maximum size and rooms have doors. We plan joins where they are least visible and fill them with colour-matched resin. On a good install they are hard to find. They are never invisible.',
  },
];
