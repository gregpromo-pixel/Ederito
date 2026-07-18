import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminIntakesClient from './AdminIntakesClient';

type PackageRelation = { id: string; name: string; slug: string };
type ClientProfile = { id: string; full_name: string | null; company_name: string | null; phone: string | null };

export default async function AdminIntakesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,full_name,role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'owner', 'support'].includes(profile.role)) redirect('/dashboard');

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

  if (submissionsError) console.error('Unable to load intake submissions', submissionsError);

  const rows = submissions || [];
  const clientIds = Array.from(new Set(rows.map((item) => item.client_id)));
  let clients: ClientProfile[] = [];

  if (clientIds.length) {
    const { data: clientRows } = await supabase
      .from('profiles')
      .select('id,full_name,company_name,phone')
      .in('id', clientIds);
    clients = (clientRows || []) as ClientProfile[];
  }

  const { data: conversations } = await supabase
    .from('client_conversations')
    .select('id,client_id,intake_submission_id,category,title,status,created_at,updated_at')
    .order('updated_at', { ascending: false });

  const conversationIds = (conversations || []).map((item) => item.id);
  const { data: messages } = conversationIds.length
    ? await supabase
        .from('client_messages')
        .select('id,conversation_id,sender_id,sender_role,body,created_at,read_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true })
    : { data: [] };

  const messageIds = (messages || []).map((item) => item.id);
  const { data: attachments } = messageIds.length
    ? await supabase
        .from('client_message_attachments')
        .select('id,message_id,client_id,storage_path,file_name,mime_type,size_bytes,created_at')
        .in('message_id', messageIds)
        .order('created_at', { ascending: true })
    : { data: [] };

  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const hydrated = rows.map((item) => {
    const rawPackage = item.service_packages as PackageRelation | PackageRelation[] | null;
    const servicePackage = Array.isArray(rawPackage) ? rawPackage[0] || null : rawPackage;
    return {
      ...item,
      responses: (item.responses || {}) as Record<string, unknown>,
      service_packages: servicePackage,
      client: clientMap.get(item.client_id) || null
    };
  });

  return (
    <AdminIntakesClient
      initialSubmissions={hydrated}
      initialConversations={conversations || []}
      initialMessages={messages || []}
      initialAttachments={attachments || []}
      staffId={profile.id}
      staffName={profile.full_name || 'Ederito'}
    />
  );
}
