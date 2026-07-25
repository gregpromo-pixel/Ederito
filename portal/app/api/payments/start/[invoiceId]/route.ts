import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const payableStatuses = new Set(['sent', 'overdue', 'open']);

export async function GET(request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.redirect(new URL('/dashboard/sales?payment=unavailable', request.url));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const { invoiceId } = await params;
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id,invoice_number,status,total_cents,description,currency')
    .eq('id', invoiceId)
    .eq('client_id', user.id)
    .maybeSingle();

  if (!invoice || !payableStatuses.has(String(invoice.status).toLowerCase())) {
    return NextResponse.redirect(new URL('/dashboard/sales?payment=invalid', request.url));
  }

  if (!Number.isInteger(invoice.total_cents) || invoice.total_cents < 50) {
    return NextResponse.redirect(new URL('/dashboard/sales?payment=invalid', request.url));
  }

  const currency = String(invoice.currency || 'USD').toLowerCase();
  if (!/^[a-z]{3}$/.test(currency)) {
    return NextResponse.redirect(new URL('/dashboard/sales?payment=invalid', request.url));
  }

  const origin = new URL(request.url).origin;
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('success_url', `${origin}/dashboard/sales?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  body.set('cancel_url', `${origin}/dashboard/sales?payment=cancelled`);
  body.set('locale', 'auto');
  if (user.email) body.set('customer_email', user.email);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', currency);
  body.set('line_items[0][price_data][unit_amount]', String(invoice.total_cents));
  body.set('line_items[0][price_data][product_data][name]', `Ederito invoice ${invoice.invoice_number}`);
  body.set('line_items[0][price_data][product_data][description]', invoice.description || 'Professional services');
  body.set('metadata[invoice_id]', invoice.id);
  body.set('metadata[client_id]', user.id);
  body.set('metadata[invoice_number]', invoice.invoice_number);
  body.set('payment_intent_data[metadata][invoice_id]', invoice.id);
  body.set('payment_intent_data[metadata][client_id]', user.id);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString(),
    cache: 'no-store'
  });

  const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) {
    console.error('Stripe Checkout session creation failed', session.error?.message || response.statusText);
    return NextResponse.redirect(new URL('/dashboard/sales?payment=error', request.url));
  }

  await supabase
    .from('invoices')
    .update({ stripe_checkout_session_id: session.id, updated_at: new Date().toISOString() })
    .eq('id', invoice.id)
    .eq('client_id', user.id);

  return NextResponse.redirect(session.url, 303);
}
