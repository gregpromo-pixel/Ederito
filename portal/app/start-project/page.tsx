import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StartProjectClient from './StartProjectClient';

export default async function StartProjectPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');

  const [{data:packages},{data:services},{data:stateFees}]=await Promise.all([
    supabase.from('service_packages').select('id,slug,name,tagline,description,base_price_cents,requires_quote,includes_first_year_domain,included_maintenance_months,included_infrastructure_months,service_id').eq('is_active',true).order('display_order'),
    supabase.from('services').select('id,slug,name').eq('is_active',true),
    supabase.from('state_filing_fees').select('state_code,standard_filing_fee_cents,annual_report_fee_cents,publication_required,publication_notes,last_verified_at').eq('entity_type','llc').eq('is_active',true).order('state_code')
  ]);

  return <StartProjectClient packages={packages||[]} services={services||[]} stateFees={stateFees||[]}/>;
}