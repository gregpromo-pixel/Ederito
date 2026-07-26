'use client';

import { useEffect } from 'react';

type Lang = 'en' | 'fr' | 'es';

type PackageRule = {
  canonical: string;
  kind: 'full' | 'deposit';
};

const packageRules: Record<string, PackageRule> = {
  'llc filing': { canonical: 'LLC Filing', kind: 'full' },
  'dépôt de llc': { canonical: 'LLC Filing', kind: 'full' },
  'registro de llc': { canonical: 'LLC Filing', kind: 'full' },
  'llc + ein assistance': { canonical: 'LLC + EIN Assistance', kind: 'full' },
  'assistance llc + ein': { canonical: 'LLC + EIN Assistance', kind: 'full' },
  'asistencia llc + ein': { canonical: 'LLC + EIN Assistance', kind: 'full' },
  'landing page': { canonical: 'Landing Page', kind: 'full' },
  'page d’atterrissage': { canonical: 'Landing Page', kind: 'full' },
  'página de aterrizaje': { canonical: 'Landing Page', kind: 'full' },
  'starter website': { canonical: 'Starter Website', kind: 'full' },
  'site web de démarrage': { canonical: 'Starter Website', kind: 'full' },
  'sitio web inicial': { canonical: 'Starter Website', kind: 'full' },
  'app launch': { canonical: 'App Launch', kind: 'deposit' },
  'lancement d’application': { canonical: 'App Launch', kind: 'deposit' },
  'lanzamiento de aplicación': { canonical: 'App Launch', kind: 'deposit' },
  'app business': { canonical: 'App Business', kind: 'deposit' },
  'application professionnelle': { canonical: 'App Business', kind: 'deposit' },
  'aplicación empresarial': { canonical: 'App Business', kind: 'deposit' }
};

const labels = {
  en: {
    full: 'Submit and pay securely',
    deposit: 'Submit and pay 50% deposit',
    processing: 'Preparing secure checkout…',
    error: 'We could not prepare checkout. Please review the form and try again.'
  },
  fr: {
    full: 'Envoyer et payer en sécurité',
    deposit: 'Envoyer et payer l’acompte de 50 %',
    processing: 'Préparation du paiement sécurisé…',
    error: 'Le paiement n’a pas pu être préparé. Vérifiez le formulaire et réessayez.'
  },
  es: {
    full: 'Enviar y pagar de forma segura',
    deposit: 'Enviar y pagar el depósito del 50 %',
    processing: 'Preparando el pago seguro…',
    error: 'No pudimos preparar el pago. Revisa el formulario e inténtalo de nuevo.'
  }
} as const;

function language(): Lang {
  const value = localStorage.getItem('ederito-portal-language') || localStorage.getItem('ederito-language');
  return value === 'fr' || value === 'es' ? value : 'en';
}

function selectedRule(): PackageRule | null {
  const heading = document.querySelector<HTMLElement>('.package-card.selected h3');
  if (!heading) return null;
  return packageRules[heading.textContent?.trim().toLowerCase() || ''] || null;
}

function formValues(form: HTMLFormElement) {
  const data = new FormData(form);
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of data.entries()) {
    const text = typeof value === 'string' ? value : value.name;
    const existing = result[key];
    if (existing === undefined) result[key] = text;
    else if (Array.isArray(existing)) existing.push(text);
    else result[key] = [existing, text];
  }
  return result;
}

function showError(form: HTMLFormElement, message: string) {
  let notice = form.querySelector<HTMLElement>('.direct-checkout-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.className = 'notice error direct-checkout-notice';
    form.querySelector('.contact-section')?.appendChild(notice);
  }
  notice.textContent = message;
}

export default function DirectCheckoutEnhancer() {
  useEffect(() => {
    if (!window.location.pathname.startsWith('/start-project')) return;
    const form = document.querySelector<HTMLFormElement>('.project-form');
    if (!form) return;

    const button = form.querySelector<HTMLButtonElement>('.submit-button');
    const original = button?.textContent || '';

    const sync = () => {
      if (!button) return;
      const rule = selectedRule();
      const t = labels[language()];
      button.dataset.directCheckout = rule ? rule.kind : '';
      button.textContent = rule ? t[rule.kind] : original;
    };

    const onLanguage = () => sync();
    const observer = new MutationObserver(sync);
    observer.observe(form, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('ederito:language', onLanguage);
    sync();

    const onSubmit = async (event: Event) => {
      const rule = selectedRule();
      if (!rule) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (!form.reportValidity()) return;
      if (!button) return;

      const t = labels[language()];
      button.disabled = true;
      button.textContent = t.processing;

      try {
        const response = await fetch('/api/intakes/direct-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageName: rule.canonical, responses: formValues(form) })
        });
        const payload = await response.json() as { checkoutUrl?: string; error?: string; reviewRequired?: boolean };
        if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error || t.error);
        window.location.assign(payload.checkoutUrl);
      } catch (error) {
        showError(form, error instanceof Error ? error.message : t.error);
        button.disabled = false;
        button.textContent = t[rule.kind];
      }
    };

    form.addEventListener('submit', onSubmit, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('ederito:language', onLanguage);
      form.removeEventListener('submit', onSubmit, true);
    };
  }, []);

  return null;
}
