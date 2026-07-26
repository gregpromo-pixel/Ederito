import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type RequestBody = {
  packageName?: string;
  responses?: Record<string, FormDataEntryValue | string | boolean | number | null>;
};

const fullPaymentPackages = new Set(['llc-filing', 'llc-ein-assistance', 'landing-page', 'starter-website']);
const depositPackages = new Set(['basic-mobile-app', 'business-mobile-app']);

function invoiceNumber() {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const random = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `EDR-${stamp}-${random}`;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Direct checkout is not configured.' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  let payload: RequestBody;
  try {
    payload = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const packageName = String(payload.packageName || '').trim();
  const responses = payload.responses && typeof payload.responses === 'object' ? payload.responses : {};
  if (!packageName) return NextResponse.json({ error: 'Choose a package first.' }, { status: 400 });

  const admin = createAdminClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: selectedPackage, error: packageError } = await admin
    .from('service_packages')
    .select('id,slug,name,base_price_cents,requires_quote,service_id,services!inner(slug)')
    .eq('name', packageName)
    .eq('is_active', true)
    .maybeSingle();

  if (packageError) return NextResponse.json({ error: packageError.message }, { status: 500 });
  if (!selectedPackage) return NextResponse.json({ error: 'Package not found.' }, { status: 404 });

  const packageSlug = String(selectedPackage.slug);
  const isFullPayment = fullPaymentPackages.has(packageSlug);
  const isDeposit = depositPackages.has(packageSlug);
  if (!isFullPayment && !isDeposit) {
    return NextResponse.json({ reviewRequired: true });
  }

  let thirdPartyFees = 0;
  if (packageSlug === 'llc-filing' || packageSlug === 'llc-ein-assistance') {
    const stateCode = String(responses.formation_state || '').trim().toUpperCase();
    if (!stateCode) return NextResponse.json({ error: 'Choose the state where the LLC will be formed.' }, { status: 400 });
    const { data: stateFee, error: feeError } = await admin
      .from('state_filing_fees')
      .select('standard_filing_fee_cents')
      .eq('state_code', stateCode)
      .eq('entity_type', 'llc')
      .eq('is_active', true)
      .maybeSingle();
    if (feeError) return NextResponse.json({ error: feeError.message }, { status: 500 });
    if (!stateFee) return NextResponse.json({ error: 'The state filing fee is unavailable.' }, { status: 400 });
    thirdPartyFees = Number(stateFee.standard_filing_fee_cents || 0);
  }

  const fullProjectAmount = Number(selectedPackage.base_price_cents || 0) + thirdPartyFees;
  const dueNow = isDeposit ? Math.round(Number(selectedPackage.base_price_cents || 0) * 0.5) : fullProjectAmount;
  const remainingBalance = isDeposit ? Number(selectedPackage.base_price_cents || 0) - dueNow : 0;
  const paymentKind = isDeposit ? 'deposit' : 'full';
  const now = new Date().toISOString();

  const { data: intake, error: intakeError } = await admin
    .from('intake_submissions')
    .insert({
      client_id: user.id,
      service_package_id: selectedPackage.id,
      status: 'submitted',
      responses,
      calculated_service_fee_cents: Number(selectedPackage.base_price_cents || 0),
      calculated_third_party_fees_cents: thirdPartyFees,
      calculated_addons_cents: 0,
      estimated_total_cents: fullProjectAmount,
      quote_required: Boolean(selectedPackage.requires_quote),
      certified_accurate: true,
      signed_name: String(responses.signed_name || ''),
      signed_at: now,
      submitted_at: now,
      payment_status: 'pending',
      payment_kind: paymentKind,
      amount_due_now_cents: dueNow,
      remaining_balance_cents: remainingBalance
    })
    .select('id,request_number')
    .single();

  if (intakeError || !intake) {
    return NextResponse.json({ error: intakeError?.message || 'Unable to save the project request.' }, { status: 500 });
  }

  const description = isDeposit
    ? `${selectedPackage.name} — 50% project deposit`
    : `${selectedPackage.name}${thirdPartyFees ? ' — service and state filing fee' : ' — full package payment'}`;

  const { data: invoice, error: invoiceError } = await admin
    .from('invoices')
    .insert({
      client_id: user.id,
      intake_submission_id: intake.id,
      invoice_number: invoiceNumber(),
      status: 'sent',
      subtotal_cents: dueNow,
      tax_cents: 0,
      total_cents: dueNow,
      description,
      currency: 'USD',
      sent_at: now,
      due_date: now.slice(0, 10),
      payment_kind: paymentKind,
      remaining_balance_cents: remainingBalance
    })
    .select('id,invoice_number')
    .single();

  if (invoiceError || !invoice) {
    await admin.from('intake_submissions').update({ payment_status: 'not_required', payment_kind: 'review', amount_due_now_cents: 0, remaining_balance_cents: 0 }).eq('id', intake.id);
    return NextResponse.json({ error: invoiceError?.message || 'Unable to create the invoice.' }, { status: 500 });
  }

  return NextResponse.json({
    intakeId: intake.id,
    requestNumber: intake.request_number,
    invoiceId: invoice.id,
    paymentKind,
    amountDueNowCents: dueNow,
    remainingBalanceCents: remainingBalance,
    checkoutUrl: `/api/payments/start/${invoice.id}`
  });
}
