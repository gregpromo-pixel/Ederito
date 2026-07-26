'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

type Lang = 'en' | 'fr' | 'es';

const copy = {
  en: {
    eyebrow: 'Payment and platform costs',
    title: 'Know what happens before you pay.',
    intro: 'Submitting a project request does not charge your card. Ederito reviews the selected plan and requirements first so the invoice matches the real scope.',
    step1: 'Submit the request', step1Text: 'Choose the plan and provide the project details. No payment is collected at this step.',
    step2: 'Scope confirmation', step2Text: 'Ederito confirms included work, optional additions, timeline, and any third-party services your project needs.',
    step3: 'Agreement and secure payment', step3Text: 'You receive the final proposal, agreement, and invoice. Payment is completed securely from your client portal.',
    thirdParty: 'Login, dashboard, hosting, and external-service plans',
    thirdPartyText: 'Websites and apps with customer login, member areas, admin dashboards, booking, commerce, subscriptions, email or SMS, maps, AI, storage, or higher traffic may require a paid third-party plan. Ederito will identify the provider, expected billing cycle, account owner, and whether the cost is included or billed separately before you sign or pay.',
    note: 'Why direct payment is not collected now:',
    noteText: 'Charging before review could collect the wrong amount when selected features require a different platform, paid plugin, API, hosting tier, store account, or custom work.'
  },
  fr: {
    eyebrow: 'Paiement et coûts de plateforme',
    title: 'Sachez ce qui se passe avant de payer.',
    intro: 'L’envoi d’une demande de projet ne débite pas votre carte. Ederito examine d’abord l’offre et les besoins afin que la facture corresponde au périmètre réel.',
    step1: 'Envoyer la demande', step1Text: 'Choisissez l’offre et fournissez les détails du projet. Aucun paiement n’est prélevé à cette étape.',
    step2: 'Confirmation du périmètre', step2Text: 'Ederito confirme le travail inclus, les options, le calendrier et les services tiers nécessaires.',
    step3: 'Contrat et paiement sécurisé', step3Text: 'Vous recevez la proposition finale, le contrat et la facture. Le paiement s’effectue en sécurité dans le portail client.',
    thirdParty: 'Connexion, tableau de bord, hébergement et services externes',
    thirdPartyText: 'Les sites et applications avec connexion client, espace membre, tableau de bord administrateur, réservation, commerce, abonnements, e-mail ou SMS, cartes, IA, stockage ou trafic élevé peuvent nécessiter une offre payante auprès d’un tiers. Ederito précisera le fournisseur, la fréquence de facturation, le propriétaire du compte et si le coût est inclus ou séparé avant toute signature ou paiement.',
    note: 'Pourquoi le paiement direct n’est pas prélevé maintenant :',
    noteText: 'Un paiement avant examen pourrait facturer un montant incorrect si les fonctions choisies exigent une autre plateforme, une extension payante, une API, un hébergement supérieur, un compte de boutique ou du travail personnalisé.'
  },
  es: {
    eyebrow: 'Pago y costos de plataformas',
    title: 'Conoce lo que ocurre antes de pagar.',
    intro: 'Enviar una solicitud de proyecto no cobra tu tarjeta. Ederito revisa primero el plan y los requisitos para que la factura corresponda al alcance real.',
    step1: 'Enviar la solicitud', step1Text: 'Elige el plan y proporciona los detalles del proyecto. No se cobra ningún pago en este paso.',
    step2: 'Confirmación del alcance', step2Text: 'Ederito confirma el trabajo incluido, extras opcionales, calendario y servicios de terceros necesarios.',
    step3: 'Acuerdo y pago seguro', step3Text: 'Recibes la propuesta final, el acuerdo y la factura. El pago se completa de forma segura desde el portal del cliente.',
    thirdParty: 'Inicio de sesión, panel, alojamiento y servicios externos',
    thirdPartyText: 'Los sitios y aplicaciones con cuentas de clientes, áreas de miembros, panel administrativo, reservas, comercio, suscripciones, correo o SMS, mapas, IA, almacenamiento o mayor tráfico pueden requerir un plan pago de terceros. Ederito indicará el proveedor, la frecuencia de facturación, el propietario de la cuenta y si el costo está incluido o se factura por separado antes de firmar o pagar.',
    note: 'Por qué no se cobra directamente ahora:',
    noteText: 'Cobrar antes de la revisión podría aplicar un monto incorrecto si las funciones seleccionadas requieren otra plataforma, complemento pago, API, nivel de alojamiento, cuenta de tienda o trabajo personalizado.'
  }
} as const;

function currentLanguage(): Lang {
  const value = localStorage.getItem('ederito-portal-language') || localStorage.getItem('ederito-language');
  return value === 'fr' || value === 'es' ? value : 'en';
}

export default function ProjectPaymentGuidance() {
  const pathname = usePathname();
  const [target, setTarget] = useState<Element | null>(null);
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    if (!pathname.startsWith('/start-project')) {
      setTarget(null);
      return;
    }
    setLang(currentLanguage());
    const findTarget = () => setTarget(document.querySelector('.package-section'));
    findTarget();
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    const onLanguage = (event: Event) => {
      const next = (event as CustomEvent<Lang>).detail;
      if (next === 'en' || next === 'fr' || next === 'es') setLang(next);
    };
    window.addEventListener('ederito:language', onLanguage as EventListener);
    return () => {
      observer.disconnect();
      window.removeEventListener('ederito:language', onLanguage as EventListener);
    };
  }, [pathname]);

  if (!target) return null;
  const t = copy[lang];

  return createPortal(
    <section className="project-payment-guidance" aria-label={t.eyebrow}>
      <header>
        <div><p className="eyebrow">{t.eyebrow}</p><h2>{t.title}</h2></div>
        <p>{t.intro}</p>
      </header>
      <div className="payment-guidance-steps">
        <article><small>01</small><h3>{t.step1}</h3><p>{t.step1Text}</p></article>
        <article><small>02</small><h3>{t.step2}</h3><p>{t.step2Text}</p></article>
        <article><small>03</small><h3>{t.step3}</h3><p>{t.step3Text}</p></article>
      </div>
      <div className="third-party-guidance"><span>3P</span><div><h3>{t.thirdParty}</h3><p>{t.thirdPartyText}</p></div></div>
      <div className="payment-guidance-note"><b>{t.note}</b><span>{t.noteText}</span></div>
    </section>,
    target
  );
}
