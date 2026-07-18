import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSalesClient from './AdminSalesClient';

type ServicePackage = { name: string; slug: string };
type RawIntake = {
  id: string;
  client_id: string;
  request_number: string | null;
  status: string;
  estimated_total_cents: number;
  responses: Record<string, unknown>;
  service_packages: ServicePackage | ServicePackage[] | null;
};

export default async function AdminSalesPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');

  const {data:profile}=await supabase
    .from('profiles')
    .select('full_name,role')
    .eq('id',user.id)
    .maybeSingle();

  if(!profile||!['admin','owner','support'].includes(profile.role)) redirect('/dashboard');

  const [{data:rawIntakes},{data:proposals},{data:contracts},{data:invoices},{data:profiles}] = await Promise.all([
    supabase.from('intake_submissions').select('id,client_id,request_number,status,estimated_total_cents,responses,service_packages(name,slug)').order('created_at',{ascending:false}),
    supabase.from('proposals').select('*').order('created_at',{ascending:false}),
    supabase.from('contracts').select('id,client_id,proposal_id,contract_number,title,status,language,amount_cents,sent_at,signed_at,created_at').order('created_at',{ascending:false}),
    supabase.from('invoices').select('id,client_id,proposal_id,contract_id,invoice_number,status,total_cents,due_date,paid_at,sent_at,description,created_at').order('created_at',{ascending:false}),
    supabase.from('profiles').select('id,full_name,company_name,phone')
  ]);

  const intakes=(rawIntakes||[]).map((row)=>{
    const intake=row as unknown as RawIntake;
    return {
      ...intake,
      service_packages:Array.isArray(intake.service_packages)
        ? intake.service_packages[0]||null
        : intake.service_packages
    };
  });

  return (
    <AdminSalesClient
      staffId={user.id}
      staffName={profile.full_name||'Ederito'}
      intakes={intakes}
      proposals={proposals||[]}
      contracts={contracts||[]}
      invoices={invoices||[]}
      profiles={profiles||[]}
    />
  );
}
