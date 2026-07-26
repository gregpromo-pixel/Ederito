import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,company_name,phone,role')
    .eq('id', user.id)
    .maybeSingle();

  const [
    { data: projects },
    { data: proposals },
    { data: contracts },
    { data: invoices },
    { data: tickets },
    { data: conversations },
    { data: workflowEvents }
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id,name,description,status,start_date,target_launch_date,launched_at,free_maintenance_starts_at,free_maintenance_ends_at,created_at,updated_at')
      .eq('client_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('proposals')
      .select('id,proposal_number,title,scope_summary,total_cents,currency,status,valid_until,deposit_percent,timeline_summary,payment_schedule,created_at,updated_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('contracts')
      .select('id,title,status,contract_number,amount_cents,currency,sent_at,signed_at,created_at,updated_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('id,invoice_number,status,total_cents,due_date,paid_at,description,currency,created_at,updated_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('support_tickets')
      .select('id,subject,status,priority,created_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('client_conversations')
      .select('id,client_id,intake_submission_id,category,title,status,created_at,updated_at')
      .eq('client_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('sales_workflow_events')
      .select('id,event_type,metadata,proposal_id,contract_id,invoice_id,created_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
  ]);

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
        .order('created_at', { ascending: false })
    : { data: [] };

  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client';
  const isStaff = ['admin', 'owner', 'support'].includes(profile?.role || '');

  return (
    <DashboardClient
      name={name}
      email={user.email || ''}
      companyName={profile?.company_name || ''}
      phone={profile?.phone || ''}
      userId={user.id}
      isStaff={isStaff}
      projects={projects || []}
      proposals={proposals || []}
      contracts={contracts || []}
      invoices={invoices || []}
      tickets={tickets || []}
      workflowEvents={workflowEvents || []}
      initialConversations={conversations || []}
      initialMessages={messages || []}
      initialAttachments={attachments || []}
    />
  );
}
