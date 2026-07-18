import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');

  let {data:profile}=await supabase.from('profiles').select('full_name,company_name,role').eq('id',user.id).maybeSingle();
  if(profile && !['admin','staff'].includes(profile.role)){
    await supabase.rpc('claim_initial_admin');
    const refreshed=await supabase.from('profiles').select('full_name,company_name,role').eq('id',user.id).maybeSingle();
    profile=refreshed.data;
  }

  const [{data:projects},{data:contracts},{data:invoices},{data:tickets}] = await Promise.all([
    supabase.from('projects').select('id,name,status,target_launch_date,free_maintenance_ends_at').eq('client_id',user.id).order('created_at',{ascending:false}),
    supabase.from('contracts').select('id,title,status,contract_number').eq('client_id',user.id).order('created_at',{ascending:false}),
    supabase.from('invoices').select('id,invoice_number,status,total_cents,due_date').eq('client_id',user.id).order('created_at',{ascending:false}),
    supabase.from('support_tickets').select('id,subject,status,priority').eq('client_id',user.id).order('created_at',{ascending:false})
  ]);

  const name=profile?.full_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Client';
  const isStaff=['admin','staff'].includes(profile?.role||'');
  return <DashboardClient name={name} isStaff={isStaff} projects={projects||[]} contracts={contracts||[]} invoices={invoices||[]} tickets={tickets||[]}/>;
}
