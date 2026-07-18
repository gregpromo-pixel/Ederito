import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminIntakesClient from './AdminIntakesClient';

export default async function AdminIntakesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let { data: profile } = await supabase
    .from('profiles')
    .select('id,full_name,role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'staff'].includes(profile.role)) {
    await supabase.rpc('claim_initial_admin');
    const result = await supabase
      .from('profiles')
      .select('id,full_name,role')
      .eq('id', user.id)
      .single();
    profile = result.data;
  }

  if (!profile || !['admin', 'staff'].includes(profile.role)) redirect('/dashboard');

  const { data: submissions } = await supabase
    .from('intake_submissions')
    .select(`
      id,client_id,request_number,status,responses,
      calculated_service_fee_cents,calculated_third_party_fees_cents,
      calculated_addons_cents,estimated_total_cents,quote_required,
      signed_name,submitted_at,created_at,updated_at,assigned_to,
      review_summary,correction_message,reviewed_at,completed_at,
      service_packages(id,name,slug)
    `)
    .order('created_at', { ascending: false });

  const clientIds = Array.from(new Set((submissions || []).map((item) => item.client_id)));
  const { data: clients } = clientIds.length
    ? await supabase.from('profiles').select('id,full_name,company_name,phone').in('id', clientIds)
    : { data: [] };

  const clientMap = new Map((clients || []).map((client) => [client.id, client]));
  const hydrated = (submissions || []).map((item) => ({
    ...item,
    client: clientMap.get(item.client_id) || null
  }));

  return <AdminIntakesClient initialSubmissions={hydrated} staffName={profile.full_name || 'Ederito'} />;
}
