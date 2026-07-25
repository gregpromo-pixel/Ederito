import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function validSignature(payload: string, header: string, secret: string) {
  const parts = header.split(',');
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return signatures.some((signature) => {
    try {
      const received = Buffer.from(signature, 'hex');
      return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
    } catch {
      return false;
    }
  });
}

type StripeCheckoutSession = {
  id?: string;
  payment_status?: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
};

type StripeEvent = {
  id?: string;
  type?: string;
  data?: { object?: StripeCheckoutSession };
};

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Payment webhook is not configured.' }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') || '';
  if (!validSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid event payload.' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return NextResponse.json({ received: true });
  }

  const session = event.data?.object;
  if (!session || session.payment_status !== 'paid') {
    return NextResponse.json({ received: true });
  }

  const invoiceId = session.metadata?.invoice_id;
  const clientId = session.metadata?.client_id;
  const sessionId = session.id;
  const amountTotal = session.amount_total;
  const currency = session.currency?.toUpperCase();

  if (!invoiceId || !clientId || !sessionId || !Number.isInteger(amountTotal) || !currency) {
    return NextResponse.json({ error: 'Incomplete payment metadata.' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id,client_id,status,total_cents,currency,stripe_checkout_session_id')
    .eq('id', invoiceId)
    .eq('client_id', clientId)
    .maybeSingle();

  if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 500 });
  if (!invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });

  if (invoice.status === 'paid') return NextResponse.json({ received: true, duplicate: true });

  if (invoice.stripe_checkout_session_id && invoice.stripe_checkout_session_id !== sessionId) {
    return NextResponse.json({ error: 'Checkout session mismatch.' }, { status: 409 });
  }

  if (invoice.total_cents !== amountTotal || String(invoice.currency || 'USD').toUpperCase() !== currency) {
    return NextResponse.json({ error: 'Payment amount or currency mismatch.' }, { status: 409 });
  }

  const paidAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: paidAt,
      paid_amount_cents: amountTotal,
      paid_currency: currency,
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      updated_at: paidAt
    })
    .eq('id', invoiceId)
    .eq('client_id', clientId)
    .neq('status', 'paid');

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await supabase.from('sales_workflow_events').insert({
    client_id: clientId,
    invoice_id: invoiceId,
    actor_id: clientId,
    event_type: 'invoice_paid',
    metadata: {
      stripe_event_id: event.id || null,
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      amount_cents: amountTotal,
      currency
    }
  });

  return NextResponse.json({ received: true });
}
