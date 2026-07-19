'use client';

import { useEffect } from 'react';

type Journey = 'website' | 'app' | 'business';

const journeyIndex: Record<Journey, number> = {
  website: 0,
  app: 1,
  business: 2
};

export default function ProjectJourneyPrefill() {
  useEffect(() => {
    if (window.location.pathname !== '/start-project') return;

    const requested = new URLSearchParams(window.location.search).get('journey');
    if (requested !== 'website' && requested !== 'app' && requested !== 'business') return;

    let attempts = 0;
    const selectJourney = () => {
      const cards = Array.from(document.querySelectorAll<HTMLButtonElement>('.journey-card'));
      const card = cards[journeyIndex[requested]];
      if (!card) return false;

      card.click();
      window.setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      return true;
    };

    if (selectJourney()) return;

    const timer = window.setInterval(() => {
      attempts += 1;
      if (selectJourney() || attempts >= 30) window.clearInterval(timer);
    }, 100);

    return () => window.clearInterval(timer);
  }, []);

  return null;
}
