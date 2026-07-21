import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime='nodejs';

export async function GET(request:Request,{params}:{params:Promise<{invoiceId:string}>}){
 const secret=process.env.STRIPE_SECRET_KEY;
 if(!secret)return NextResponse.redirect(new URL('/dashboard/sales?payment=unavailable',request.url));
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.redirect(new URL('/login',request.url));
 const {invoiceId}=await params;
 const {data:invoice}=await supabase.from('invoices').select('id,invoice_number,status,total_cents,description').eq('id',invoiceId).eq('client_id',user.id).maybeSingle();
 if(!invoice||invoice.status==='paid'||!Number.isInteger(invoice.total_cents)||invoice.total_cents<50)return NextResponse.redirect(new URL('/dashboard/sales?payment=invalid',request.url));
 const origin=new URL(request.url).origin;
 const body=new URLSearchParams();
 body.set('mode','payment');
 body.set('success_url',`${origin}/dashboard/sales?payment=success&session_id={CHECKOUT_SESSION_ID}`);
 body.set('cancel_url',`${origin}/dashboard/sales?payment=cancelled`);
 if(user.email)body.set('customer_email',user.email);
 body.set('line_items[0][quantity]','1');
 body.set('line_items[0][price_data][currency]','usd');
 body.set('line_items[0][price_data][unit_amount]',String(invoice.total_cents));
 body.set('line_items[0][price_data][product_data][name]',`Ederito invoice ${invoice.invoice_number}`);
 body.set('line_items[0][price_data][product_data][description]',invoice.description||'Professional services');
 body.set('metadata[invoice_id]',invoice.id);
 body.set('metadata[client_id]',user.id);
 body.set('payment_intent_data[metadata][invoice_id]',invoice.id);
 body.set('payment_intent_data[metadata][client_id]',user.id);
 const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()});
 const session=await response.json() as {url?:string};
 return session.url?NextResponse.redirect(session.url,303):NextResponse.redirect(new URL('/dashboard/sales?payment=error',request.url));
}
