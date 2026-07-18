import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const site=process.env.NEXT_PUBLIC_SITE_URL||'https://portal.ederito.com';

function emailContent(template:string,payload:Record<string,unknown>){
 const title=template==='proposal_sent'?'Your Ederito proposal is ready':template==='proposal_accepted'?'Proposal accepted — next steps ready':template==='status_changed'?'Your Ederito request was updated':template==='staff_message'?'New secure message from Ederito':'Ederito portal update';
 const detail=template==='proposal_sent'?`Proposal ${String(payload.proposal_number||'')} is ready for review.`:template==='proposal_accepted'?'Your agreement and initial invoice are now available in your secure portal.':template==='status_changed'?`Your request status is now ${String(payload.status||'updated')}.`:template==='staff_message'?'Ederito sent you a new message or file.':'There is a new update in your Ederito portal.';
 return {subject:title,html:`<!doctype html><html><body style="margin:0;background:#050505;color:#f4f1e9;font-family:Arial,sans-serif"><div style="max-width:640px;margin:auto;padding:42px"><p style="color:#f4bf32;letter-spacing:3px;font-size:12px;font-weight:700">EDERITO</p><h1 style="font-size:42px;line-height:1.05">${title}</h1><p style="color:#b4afa5;font-size:17px;line-height:1.65">${detail}</p><a href="${site}/dashboard/sales" style="display:inline-block;margin-top:20px;background:#f4bf32;color:#111;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:10px">Open secure portal</a><p style="margin-top:34px;color:#77736c;font-size:12px">This message contains no sensitive tax information. Sign in directly to the Ederito portal to review details.</p></div></body></html>`};
}

async function processQueue(request:Request){
 const secret=process.env.CRON_SECRET; const auth=request.headers.get('authorization');
 if(secret&&auth!==`Bearer ${secret}`) return NextResponse.json({error:'Unauthorized'},{status:401});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY; const resend=process.env.RESEND_API_KEY;
 if(!url||!key||!resend) return NextResponse.json({error:'Missing server environment variables'},{status:503});
 const supabase=createClient(url,key,{auth:{persistSession:false}});
 const {data:jobs,error}=await supabase.from('notification_queue').select('*').eq('status','pending').lte('available_at',new Date().toISOString()).order('created_at').limit(20);
 if(error) return NextResponse.json({error:error.message},{status:500});
 let sent=0,failed=0;
 for(const job of jobs||[]){
  let email=job.recipient_email as string|null;
  if(!email&&job.recipient_user_id){const {data}=await supabase.auth.admin.getUserById(job.recipient_user_id);email=data.user?.email||null;}
  if(!email){await supabase.from('notification_queue').update({status:'failed',attempts:job.attempts+1,last_error:'No recipient email'}).eq('id',job.id);failed++;continue;}
  const content=emailContent(job.template_key,(job.payload||{}) as Record<string,unknown>);
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resend}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL||'Ederito <notifications@ederito.com>',to:[email],subject:content.subject,html:content.html})});
  if(response.ok){await supabase.from('notification_queue').update({status:'sent',sent_at:new Date().toISOString(),attempts:job.attempts+1,last_error:null}).eq('id',job.id);sent++;}
  else{const text=await response.text();await supabase.from('notification_queue').update({status:job.attempts>=4?'failed':'pending',attempts:job.attempts+1,last_error:text.slice(0,800),available_at:new Date(Date.now()+15*60*1000).toISOString()}).eq('id',job.id);failed++;}
 }
 return NextResponse.json({processed:(jobs||[]).length,sent,failed});
}

export async function GET(request:Request){return processQueue(request)}
export async function POST(request:Request){return processQueue(request)}
