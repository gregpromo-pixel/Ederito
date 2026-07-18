import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminIntakesClient from './AdminIntakesClient';

type PackageRelation = { id: string; name: string; slug: string };
type ClientProfile = { id: string; full_name: string | null; company_name: string | null; phone: string | null };

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

  const { data: submissions, error: submissionsError } = await supabase
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

  if (submissionsError) {
    console.error('Unable to load intake submissions', submissionsError);
  }

  const rows = submissions || [];
  const clientIds = Array.from(new Set(rows.map((item) => item.client_id)));
  let clients: ClientProfile[] = [];

  if (clientIds.length) {
    const { data: clientRows, error: clientsError } = await supabase
      .from('profiles')
      .select('id,full_name,company_name,phone')
      .in('id', clientIds);

    if (clientsError) console.error('Unable to load intake clients', clientsError);
    clients = (clientRows || []) as ClientProfile[];
  }

  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const hydrated = rows.map((item) => {
    const rawPackage = item.service_packages as PackageRelation | PackageRelation[] | null;
    const servicePackage = Array.isArray(rawPackage) ? rawPackage[0] || null : rawPackage;

    return {
      id: item.id,
      client_id: item.client_id,
      request_number: item.request_number,
      status: item.status,
      responses: (item.responses || {}) as Record<string, unknown>,
      calculated_service_fee_cents: item.calculated_service_fee_cents,
      calculated_third_party_fees_cents: item.calculated_third_party_fees_cents,
      calculated_addons_cents: item.calculated_addons_cents,
      estimated_total_cents: item.estimated_total_cents,
      quote_required: item.quote_required,
      signed_name: item.signed_name,
      submitted_at: item.submitted_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      assigned_to: item.assigned_to,
      review_summary: item.review_summary,
      correction_message: item.correction_message,
      reviewed_at: item.reviewed_at,
      completed_at: item.completed_at,
      service_packages: servicePackage,
      client: clientMap.get(item.client_id) || null
    };
  });

  return <AdminIntakesClient initialSubmissions={hydrated} staffName={profile.full_name || 'Ederito'} />;
}
