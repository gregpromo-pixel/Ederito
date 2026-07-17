import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StartProjectClient from './StartProjectClient';

export default async function StartProjectPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');

  const {data:packages}=await supabase
    .from('service_packages')
    .select('id,slug,name,tagline,description,base_price_cents,requires_quote,includes_first_year_domain,included_maintenance_months,included_infrastructure_months,service_id')
    .eq('is_active',true)
    .order('display_order');

  const {data:services}=await supabase
    .from('services')
    .select('id,slug,name')
    .eq('is_active',true);

  return <StartProjectClient packages={packages||[]} services={services||[]}/>;
}
