import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminIntakesClient from './AdminIntakesClient';

export default async function AdminIntakesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,full_name,role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'staff'].includes(profile.role)) redirect('/dashboard');

  const { data: submissions } = await supabase
    .from('intake_submissions')
    .select(`
      id,client_id,status,responses,calculated_service_fee_cents,
      calculated_third_party_fees_cents,calculated_addons_cents,
      estimated_total_cents,quote_required,signed_name,submitted_at,
      created_at,updated_at,staff_notes,correction_message,reviewed_at,
      service_packages(id,name,slug),profiles!intake_submissions_client_id_fkey(id,full_name,company_name,phone)
    `)
    .order('created_at', { ascending: false });

  return <AdminIntakesClient initialSubmissions={submissions || []} staffName={profile.full_name || 'Ederito'} />;
}
