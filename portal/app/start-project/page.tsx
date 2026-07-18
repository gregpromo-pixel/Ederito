import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StartProjectClient from './StartProjectClient';

export default async function StartProjectPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: packages }, { data: services }, { data: stateFees }] = await Promise.all([
    supabase
      .from('service_packages')
      .select('id,slug,name,tagline,description,base_price_cents,requires_quote,state_fee_separate,includes_first_year_domain,included_domain_allowance_cents,included_maintenance_months,included_infrastructure_months,included_infrastructure_allowance_cents,estimated_timeline_min_days,estimated_timeline_max_days,features,exclusions,is_featured,service_id')
      .eq('is_active', true)
      .order('display_order'),
    supabase.from('services').select('id,slug,name').eq('is_active', true),
    supabase
      .from('state_filing_fees')
      .select('state_code,standard_filing_fee_cents,annual_report_fee_cents,publication_required,publication_notes,official_source_url,last_verified_at')
      .eq('entity_type', 'llc')
      .eq('is_active', true)
      .order('state_code')
  ]);

  return <StartProjectClient packages={packages || []} services={services || []} stateFees={stateFees || []} />;
}
