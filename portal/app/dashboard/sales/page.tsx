import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ClientSales from './ClientSales';
import BillingCenter from './BillingCenter';

export default async function ClientSalesPage(){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect('/login');
 const [{data:proposals},{data:contracts},{data:signatures},{data:invoices}]=await Promise.all([
  supabase.from('proposals').select('*').eq('client_id',user.id).order('created_at',{ascending:false}),
  supabase.from('contracts').select('*').eq('client_id',user.id).order('created_at',{ascending:false}),
  supabase.from('contract_signatures').select('*').eq('signer_id',user.id).order('signed_at',{ascending:false}),
  supabase.from('invoices').select('*').eq('client_id',user.id).order('created_at',{ascending:false})
 ]);
 return <><ClientSales userId={user.id} userEmail={user.email||''} proposals={proposals||[]} contracts={contracts||[]} signatures={signatures||[]} invoices={invoices||[]}/><BillingCenter invoices={invoices||[]}/></>;
}
