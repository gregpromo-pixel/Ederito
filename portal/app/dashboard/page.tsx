import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');

  const {data:profile}=await supabase.from('profiles').select('full_name,company_name,role').eq('id',user.id).maybeSingle();
  const [{data:projects},{data:contracts},{data:invoices},{data:tickets},{data:conversations}] = await Promise.all([
    supabase.from('projects').select('id,name,status,target_launch_date,free_maintenance_ends_at').eq('client_id',user.id).order('created_at',{ascending:false}),
    supabase.from('contracts').select('id,title,status,contract_number').eq('client_id',user.id).order('created_at',{ascending:false}),
    supabase.from('invoices').select('id,invoice_number,status,total_cents,due_date').eq('client_id',user.id).order('created_at',{ascending:false}),
    supabase.from('support_tickets').select('id,subject,status,priority').eq('client_id',user.id).order('created_at',{ascending:false}),
    supabase.from('client_conversations').select('id,client_id,intake_submission_id,category,title,status,created_at,updated_at').eq('client_id',user.id).order('updated_at',{ascending:false})
  ]);

  const conversationIds=(conversations||[]).map((item)=>item.id);
  const {data:messages}=conversationIds.length
    ? await supabase.from('client_messages').select('id,conversation_id,sender_id,sender_role,body,created_at,read_at').in('conversation_id',conversationIds).order('created_at',{ascending:true})
    : {data:[]};
  const messageIds=(messages||[]).map((item)=>item.id);
  const {data:attachments}=messageIds.length
    ? await supabase.from('client_message_attachments').select('id,message_id,client_id,storage_path,file_name,mime_type,size_bytes,created_at').in('message_id',messageIds).order('created_at',{ascending:true})
    : {data:[]};

  const name=profile?.full_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Client';
  const isStaff=['admin','owner','support'].includes(profile?.role||'');
  return <DashboardClient name={name} userId={user.id} isStaff={isStaff} projects={projects||[]} contracts={contracts||[]} invoices={invoices||[]} tickets={tickets||[]} initialConversations={conversations||[]} initialMessages={messages||[]} initialAttachments={attachments||[]}/>;
}
