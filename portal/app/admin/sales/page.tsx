import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSalesClient from './AdminSalesClient';

export default async function AdminSalesPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('full_name,role').eq('id',user.id).maybeSingle();
  if(!profile||!['admin','owner','support'].includes(profile.role)) redirect('/dashboard');

  const [{data:intakes},{data:proposals},{data:contracts},{data:invoices},{data:profiles}] = await Promise.all([
    supabase.from('intake_submissions').select('id,client_id,request_number,status,estimated_total_cents,responses,service_packages(name,slug)').order('created_at',{ascending:false}),
    supabase.from('proposals').select('*').order('created_at',{ascending:false}),
    supabase.from('contracts').select('id,client_id,proposal_id,contract_number,title,status,language,amount_cents,sent_at,signed_at,created_at').order('created_at',{ascending:false}),
    supabase.from('invoices').select('id,client_id,proposal_id,contract_id,invoice_number,status,total_cents,due_date,paid_at,sent_at,description,created_at').order('created_at',{ascending:false}),
    supabase.from('profiles').select('id,full_name,company_name,phone')
  ]);

  return <AdminSalesClient staffId={user.id} staffName={profile.full_name||'Ederito'} intakes={intakes||[]} proposals={proposals||[]} contracts={contracts||[]} invoices={invoices||[]} profiles={profiles||[]}/>;
}
