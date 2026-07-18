import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ClientRequests from './ClientRequests';

type PackageRelation={name:string;slug:string}|{name:string;slug:string}[]|null;

export default async function RequestsPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');

  const {data:requestRows}=await supabase
    .from('intake_submissions')
    .select('id,request_number,status,client_visible_status,client_status_message,correction_message,submitted_at,created_at,updated_at,estimated_total_cents,service_packages(name,slug)')
    .eq('client_id',user.id)
    .order('created_at',{ascending:false});

  const {data:conversations}=await supabase
    .from('client_conversations')
    .select('id,intake_submission_id,title,status,client_last_read_at,staff_last_read_at,updated_at')
    .eq('client_id',user.id)
    .order('updated_at',{ascending:false});

  const conversationIds=(conversations||[]).map(item=>item.id);
  const {data:messages}=conversationIds.length
    ? await supabase.from('client_messages').select('id,conversation_id,sender_role,body,created_at,read_at').in('conversation_id',conversationIds).order('created_at',{ascending:false})
    : {data:[]};

  const requests=(requestRows||[]).map(item=>{
    const raw=item.service_packages as PackageRelation;
    const service=Array.isArray(raw)?raw[0]||null:raw;
    return {...item,service_packages:service};
  });

  return <ClientRequests requests={requests} conversations={conversations||[]} messages={messages||[]} />;
}
