'use client';

import { useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'fr' | 'es';
type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  total_cents: number;
  description: string | null;
  currency?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
};

type Props = { invoices: Invoice[] };

const copy = {
  en: {
    eyebrow: 'Billing center', title: 'Secure invoice payments', subtitle: 'Review issued invoices and complete payment through Stripe Checkout.',
    invoice: 'Ederito invoice', due: 'Due', paid: 'Paid', pay: 'Pay securely', unavailable: 'Online payment is temporarily unavailable. Please contact Ederito.',
    invalid: 'This invoice cannot be paid online.', error: 'Stripe Checkout could not be opened. Please try again.', cancelled: 'Payment was cancelled. No charge was made.',
    success: 'Payment received. The invoice status will update after Stripe confirms the transaction.', empty: 'No payable invoice is available.', secure: 'Encrypted checkout powered by Stripe.'
  },
  fr: {
    eyebrow: 'Centre de facturation', title: 'Paiement sécurisé des factures', subtitle: 'Consultez les factures émises et effectuez le paiement avec Stripe Checkout.',
    invoice: 'Facture Ederito', due: 'Échéance', paid: 'Payée', pay: 'Payer en toute sécurité', unavailable: 'Le paiement en ligne est temporairement indisponible. Veuillez contacter Ederito.',
    invalid: 'Cette facture ne peut pas être payée en ligne.', error: 'Stripe Checkout n’a pas pu être ouvert. Veuillez réessayer.', cancelled: 'Le paiement a été annulé. Aucun débit n’a été effectué.',
    success: 'Paiement reçu. Le statut de la facture sera mis à jour après confirmation de Stripe.', empty: 'Aucune facture payable n’est disponible.', secure: 'Paiement chiffré propulsé par Stripe.'
  },
  es: {
    eyebrow: 'Centro de facturación', title: 'Pagos seguros de facturas', subtitle: 'Revisa las facturas emitidas y completa el pago mediante Stripe Checkout.',
    invoice: 'Factura de Ederito', due: 'Vence', paid: 'Pagada', pay: 'Pagar de forma segura', unavailable: 'El pago en línea no está disponible temporalmente. Contacta a Ederito.',
    invalid: 'Esta factura no se puede pagar en línea.', error: 'No se pudo abrir Stripe Checkout. Inténtalo de nuevo.', cancelled: 'El pago fue cancelado. No se realizó ningún cargo.',
    success: 'Pago recibido. El estado de la factura se actualizará cuando Stripe confirme la transacción.', empty: 'No hay facturas disponibles para pagar.', secure: 'Pago cifrado procesado por Stripe.'
  }
} as const;

function currentLanguage(): Lang {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('ederito-portal-language') || localStorage.getItem('ederito-language');
  return saved === 'fr' || saved === 'es' ? saved : 'en';
}

function money(value: number, currency = 'USD', lang: Lang = 'en') {
  const locale = lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-US' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency.toUpperCase() }).format(value / 100);
}

function paymentMessage(code: string | null, lang: Lang) {
  if (!code) return '';
  const t = copy[lang];
  if (code === 'success') return t.success;
  if (code === 'cancelled') return t.cancelled;
  if (code === 'unavailable') return t.unavailable;
  if (code === 'invalid') return t.invalid;
  if (code === 'error') return t.error;
  return '';
}

export default function BillingCenter({ invoices }: Props) {
  const [lang, setLang] = useState<Lang>('en');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sync = () => {
      const next = currentLanguage();
      setLang(next);
      const code = new URLSearchParams(window.location.search).get('payment');
      setMessage(paymentMessage(code, next));
    };
    sync();
    const onLanguage = (event: Event) => {
      const next = (event as CustomEvent<Lang>).detail;
      if (next === 'en' || next === 'fr' || next === 'es') {
        setLang(next);
        const code = new URLSearchParams(window.location.search).get('payment');
        setMessage(paymentMessage(code, next));
      }
    };
    window.addEventListener('ederito:language', onLanguage as EventListener);
    return () => window.removeEventListener('ederito:language', onLanguage as EventListener);
  }, []);

  const payableStatuses = useMemo(() => new Set(['sent', 'overdue', 'open']), []);
  const t = copy[lang];

  if (!invoices.length) return null;

  return (
    <section className="billing-center" aria-labelledby="billing-center-title">
      <header className="billing-center-head">
        <div>
          <p>{t.eyebrow}</p>
          <h2 id="billing-center-title">{t.title}</h2>
          <span>{t.subtitle}</span>
        </div>
        <small>{t.secure}</small>
      </header>

      {message && <div className="billing-payment-notice" role="status">{message}</div>}

      <div className="billing-invoice-list">
        {invoices.map((item) => {
          const status = String(item.status || '').toLowerCase();
          const paid = status === 'paid';
          const payable = payableStatuses.has(status) && Number.isInteger(item.total_cents) && item.total_cents >= 50;
          return (
            <article key={item.id}>
              <div className="billing-invoice-copy">
                <small>{item.invoice_number}</small>
                <strong>{item.description || t.invoice}</strong>
                {item.due_date && !paid && <span>{t.due}: {item.due_date}</span>}
              </div>
              <div className="billing-invoice-action">
                <b>{money(item.total_cents, item.currency || 'USD', lang)}</b>
                {paid ? <span className="billing-paid">✓ {t.paid}</span> : payable ? <a href={`/api/payments/start/${item.id}`}>{t.pay}</a> : <span>{t.invalid}</span>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
