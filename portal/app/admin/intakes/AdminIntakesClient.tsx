'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Lang = 'en' | 'fr' | 'es';
type Submission = {
  id: string; client_id: string; request_number: string | null; status: string;
  responses: Record<string, unknown>; calculated_service_fee_cents: number;
  calculated_third_party_fees_cents: number; calculated_addons_cents: number;
  estimated_total_cents: number; quote_required: boolean; signed_name: string | null;
  submitted_at: string | null; created_at: string; updated_at: string; assigned_to: string | null;
  review_summary: string | null; correction_message: string | null; reviewed_at: string | null;
  completed_at: string | null; service_packages: { id: string; name: string; slug: string } | null;
  client: { id: string; full_name: string | null; company_name: string | null; phone: string | null } | null;
};
type Conversation = { id: string; client_id: string; intake_submission_id: string | null; category: string; title: string; status: string; created_at: string; updated_at: string };
type Message = { id: string; conversation_id: string; sender_id: string; sender_role: string; body: string | null; created_at: string; read_at: string | null };
type Attachment = { id: string; message_id: string; client_id: string; storage_path: string; file_name: string; mime_type: string | null; size_bytes: number | null; created_at: string };
type Props = { initialSubmissions: Submission[]; initialConversations: Conversation[]; initialMessages: Message[]; initialAttachments: Attachment[]; staffId: string; staffName: string };

const statuses = ['submitted', 'under_review', 'correction_required', 'approved', 'filed', 'completed', 'declined'];
const copy = {
  en: { back:'Back to dashboard', workspace:'Internal workspace', title:'Client operations', subtitle:'Review every request, preserve every answer, and communicate securely with each client.', new:'New', review:'Under review', corrections:'Corrections', total:'Total', search:'Search clients or requests', all:'All services', intake:'Application', messages:'Messages & files', notes:'Review & status', submitted:'Submitted information', print:'Print summary', no:'Select a client request.', send:'Send message', attach:'Attach documents or photos', sending:'Sending…', saved:'Review saved.', sent:'Message sent.', status:'Status', private:'Private review summary', correction:'Client correction request', save:'Save review', clientPortal:'Client portal', operations:'Operations', noMessages:'No messages yet.', serviceFee:'Service fee', thirdParty:'Third-party fees', estimated:'Estimated total', quote:'Quote required', yes:'Yes', noWord:'No' },
  fr: { back:'Retour au tableau de bord', workspace:'Espace interne', title:'Opérations clients', subtitle:'Examinez chaque demande, conservez chaque réponse et communiquez de façon sécurisée avec chaque client.', new:'Nouvelles', review:'En examen', corrections:'Corrections', total:'Total', search:'Rechercher un client ou une demande', all:'Tous les services', intake:'Dossier', messages:'Messages et fichiers', notes:'Examen et statut', submitted:'Informations fournies', print:'Imprimer le résumé', no:'Sélectionnez une demande client.', send:'Envoyer le message', attach:'Joindre des documents ou photos', sending:'Envoi…', saved:'Examen enregistré.', sent:'Message envoyé.', status:'Statut', private:'Résumé privé de l’examen', correction:'Demande de correction au client', save:'Enregistrer', clientPortal:'Portail client', operations:'Opérations', noMessages:'Aucun message.', serviceFee:'Frais de service', thirdParty:'Frais tiers', estimated:'Total estimé', quote:'Devis requis', yes:'Oui', noWord:'Non' },
  es: { back:'Volver al panel', workspace:'Espacio interno', title:'Operaciones de clientes', subtitle:'Revisa cada solicitud, conserva cada respuesta y comunícate de forma segura con cada cliente.', new:'Nuevas', review:'En revisión', corrections:'Correcciones', total:'Total', search:'Buscar clientes o solicitudes', all:'Todos los servicios', intake:'Solicitud', messages:'Mensajes y archivos', notes:'Revisión y estado', submitted:'Información enviada', print:'Imprimir resumen', no:'Selecciona una solicitud.', send:'Enviar mensaje', attach:'Adjuntar documentos o fotos', sending:'Enviando…', saved:'Revisión guardada.', sent:'Mensaje enviado.', status:'Estado', private:'Resumen privado de revisión', correction:'Solicitud de corrección al cliente', save:'Guardar revisión', clientPortal:'Portal del cliente', operations:'Operaciones', noMessages:'Aún no hay mensajes.', serviceFee:'Tarifa de servicio', thirdParty:'Costos de terceros', estimated:'Total estimado', quote:'Cotización requerida', yes:'Sí', noWord:'No' }
};

const money = (cents: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const titleCase = (value:string) => value.replace(/_/g,' ').replace(/\b\w/g,(c)=>c.toUpperCase());
function rawValue(value:unknown){ if(value===null||value===undefined||value==='') return '—'; if(typeof value==='boolean') return value?'Yes':'No'; if(typeof value==='object') return JSON.stringify(value,null,2); return String(value); }
function categoryFromSlug(slug?:string|null){ if(!slug) return 'general'; if(slug.includes('llc')) return 'llc'; if(slug.includes('app')) return 'app'; if(slug.includes('website')||slug.includes('landing')) return 'website'; return 'general'; }

export default function AdminIntakesClient({initialSubmissions,initialConversations,initialMessages,initialAttachments,staffId,staffName}:Props){
  const [lang,setLang]=useState<Lang>('en');
  const [submissions,setSubmissions]=useState(initialSubmissions);
  const [conversations,setConversations]=useState(initialConversations);
  const [messages,setMessages]=useState(initialMessages);
  const [attachments,setAttachments]=useState(initialAttachments);
  const [selectedId,setSelectedId]=useState(initialSubmissions[0]?.id||'');
  const [serviceFilter,setServiceFilter]=useState('all');
  const [search,setSearch]=useState('');
  const [view,setView]=useState<'intake'|'messages'|'notes'>('intake');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [files,setFiles]=useState<File[]>([]);
  const t=copy[lang];

  useEffect(()=>{ const saved=localStorage.getItem('ederito-portal-language') as Lang|null; if(saved&&['en','fr','es'].includes(saved)) setLang(saved); },[]);
  function chooseLang(next:Lang){ setLang(next); localStorage.setItem('ederito-portal-language',next); }

  const services=useMemo(()=>Array.from(new Set(submissions.map(s=>s.service_packages?.name||'Custom request'))),[submissions]);
  const filtered=useMemo(()=>submissions.filter(s=>{
    const matchesService=serviceFilter==='all'||(s.service_packages?.name||'Custom request')===serviceFilter;
    const hay=`${s.request_number||''} ${s.client?.full_name||''} ${s.client?.company_name||''} ${s.service_packages?.name||''}`.toLowerCase();
    return matchesService&&hay.includes(search.toLowerCase());
  }),[submissions,serviceFilter,search]);
  const selected=submissions.find(s=>s.id===selectedId)||filtered[0]||null;
  const conversation=selected?conversations.find(c=>c.intake_submission_id===selected.id)||null:null;
  const thread=conversation?messages.filter(m=>m.conversation_id===conversation.id):[];

  async function saveReview(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); if(!selected) return; setBusy(true); setNotice('');
    const form=new FormData(event.currentTarget); const status=String(form.get('status')||selected.status);
    const review_summary=String(form.get('review_summary')||'').trim()||null;
    const correction_message=String(form.get('correction_message')||'').trim()||null;
    const now=new Date().toISOString(); const supabase=createClient();
    const patch={status,review_summary,correction_message,reviewed_at:['under_review','correction_required','approved','declined'].includes(status)?now:selected.reviewed_at,completed_at:status==='completed'?now:null,updated_at:now};
    const {error}=await supabase.from('intake_submissions').update(patch).eq('id',selected.id);
    if(error) setNotice(error.message); else { setSubmissions(v=>v.map(s=>s.id===selected.id?{...s,...patch}:s)); setNotice(t.saved); }
    setBusy(false);
  }

  async function sendMessage(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); if(!selected) return; setBusy(true); setNotice('');
    const formElement=event.currentTarget; const form=new FormData(formElement); const body=String(form.get('body')||'').trim();
    if(!body&&!files.length){ setBusy(false); return; }
    const supabase=createClient(); let active=conversation;
    if(!active){
      const {data,error}=await supabase.from('client_conversations').insert({client_id:selected.client_id,intake_submission_id:selected.id,category:categoryFromSlug(selected.service_packages?.slug),title:selected.service_packages?.name||'Ederito request',status:'waiting_on_client',created_by:staffId}).select('id,client_id,intake_submission_id,category,title,status,created_at,updated_at').single();
      if(error){setNotice(error.message);setBusy(false);return;} active=data as Conversation; setConversations(v=>[active!,...v]);
    }
    const {data:msg,error:msgError}=await supabase.from('client_messages').insert({conversation_id:active.id,sender_id:staffId,sender_role:'staff',body:body||null}).select('id,conversation_id,sender_id,sender_role,body,created_at,read_at').single();
    if(msgError||!msg){setNotice(msgError?.message||'Unable to send message.');setBusy(false);return;}
    const newAttachments:Attachment[]=[];
    for(const file of files){
      const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'-'); const path=`${selected.client_id}/${active.id}/${msg.id}-${Date.now()}-${safe}`;
      const {error:uploadError}=await supabase.storage.from('client-communications').upload(path,file,{upsert:false,contentType:file.type});
      if(uploadError){setNotice(uploadError.message);continue;}
      const {data:row,error:rowError}=await supabase.from('client_message_attachments').insert({message_id:msg.id,client_id:selected.client_id,storage_path:path,file_name:file.name,mime_type:file.type||null,size_bytes:file.size}).select('id,message_id,client_id,storage_path,file_name,mime_type,size_bytes,created_at').single();
      if(!rowError&&row)newAttachments.push(row as Attachment);
    }
    setMessages(v=>[...v,msg as Message]); setAttachments(v=>[...v,...newAttachments]); setFiles([]); formElement.reset(); setNotice(t.sent); setBusy(false);
  }

  async function openAttachment(item:Attachment){ const supabase=createClient(); const {data}=await supabase.storage.from('client-communications').createSignedUrl(item.storage_path,300); if(data?.signedUrl) window.open(data.signedUrl,'_blank','noopener,noreferrer'); }

  return <main className="admin-intakes premium-ops">
    <header className="admin-bar premium-admin-bar">
      <Link href="/dashboard" className="admin-brand"><img src="https://ederito.com/assets/eder-logo.png" alt="Ederito"/><span>EDERITO</span><em>{t.operations}</em></Link>
      <nav><Link href="/dashboard">← {t.back}</Link><span>{staffName}</span><div className="language-mini">{(['en','fr','es'] as Lang[]).map(x=><button key={x} onClick={()=>chooseLang(x)} className={lang===x?'active':''}>{x.toUpperCase()}</button>)}</div></nav>
    </header>

    <section className="admin-hero premium-admin-hero"><p>{t.workspace}</p><h1>{t.title}.</h1><span>{t.subtitle}</span>
      <div className="admin-metrics"><article><span>{t.new}</span><strong>{submissions.filter(x=>x.status==='submitted').length}</strong></article><article><span>{t.review}</span><strong>{submissions.filter(x=>x.status==='under_review').length}</strong></article><article><span>{t.corrections}</span><strong>{submissions.filter(x=>x.status==='correction_required').length}</strong></article><article><span>{t.total}</span><strong>{submissions.length}</strong></article></div>
    </section>

    <section className="admin-workspace premium-workspace">
      <aside className="intake-queue"><div className="queue-tools"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}/><select value={serviceFilter} onChange={e=>setServiceFilter(e.target.value)}><option value="all">{t.all}</option>{services.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="service-pills"><button className={serviceFilter==='all'?'active':''} onClick={()=>setServiceFilter('all')}>{t.all}</button>{services.map(x=><button key={x} className={serviceFilter===x?'active':''} onClick={()=>setServiceFilter(x)}>{x}</button>)}</div>
        <div className="queue-list">{filtered.map(item=><button key={item.id} className={item.id===selected?.id?'active':''} onClick={()=>{setSelectedId(item.id);setView('intake');setNotice('');}}><small>{item.request_number||item.id.slice(0,8).toUpperCase()}</small><strong>{item.client?.full_name||item.signed_name||'Unnamed client'}</strong><span>{item.service_packages?.name||'Custom request'}</span><em>{titleCase(item.status)}</em></button>)}{!filtered.length&&<p className="queue-empty">No requests match this view.</p>}</div>
      </aside>

      <section className="review-panel">{!selected?<div className="review-empty">{t.no}</div>:<>
        <div className="review-head"><div><p>{selected.request_number||'INTAKE REQUEST'}</p><h2>{selected.client?.full_name||selected.signed_name||'Unnamed client'}</h2><span>{selected.service_packages?.name||'Custom request'} · {selected.client?.company_name||selected.client?.phone||'Ederito client'}</span></div><div className="review-total"><small>{t.estimated}</small><strong>{money(selected.estimated_total_cents)}</strong></div></div>
        <div className="review-tabs"><button className={view==='intake'?'active':''} onClick={()=>setView('intake')}>{t.intake}</button><button className={view==='messages'?'active':''} onClick={()=>setView('messages')}>{t.messages}</button><button className={view==='notes'?'active':''} onClick={()=>setView('notes')}>{t.notes}</button></div>
        <div className="review-grid"><article><span>{t.serviceFee}</span><strong>{money(selected.calculated_service_fee_cents)}</strong></article><article><span>{t.thirdParty}</span><strong>{money(selected.calculated_third_party_fees_cents)}</strong></article><article><span>{t.status}</span><strong>{titleCase(selected.status)}</strong></article><article><span>{t.quote}</span><strong>{selected.quote_required?t.yes:t.noWord}</strong></article></div>

        {view==='intake'&&<section className="response-section"><div className="response-title"><h3>{t.submitted}</h3><button onClick={()=>window.print()}>{t.print}</button></div><div className="response-list raw-responses">{Object.entries(selected.responses||{}).map(([key,value])=><div key={key}><span>{key}</span><pre>{rawValue(value)}</pre></div>)}</div></section>}

        {view==='messages'&&<section className="message-center"><div className="message-thread">{thread.map(msg=><article key={msg.id} className={msg.sender_role==='staff'?'staff-message':'client-message'}><header><strong>{msg.sender_role==='staff'?'Ederito':selected.client?.full_name||'Client'}</strong><time>{new Date(msg.created_at).toLocaleString()}</time></header>{msg.body&&<p>{msg.body}</p>}<div className="message-files">{attachments.filter(a=>a.message_id===msg.id).map(a=><button key={a.id} onClick={()=>openAttachment(a)}>{a.mime_type?.startsWith('image/')?'🖼':'📄'} {a.file_name}</button>)}</div></article>)}{!thread.length&&<div className="thread-empty">{t.noMessages}</div>}</div><form className="message-composer" onSubmit={sendMessage}><textarea name="body" placeholder={t.send}/><label className="file-picker"><input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={(e:ChangeEvent<HTMLInputElement>)=>setFiles(Array.from(e.target.files||[]))}/><span>{t.attach}</span></label>{files.length>0&&<div className="selected-files">{files.map(f=><span key={`${f.name}-${f.size}`}>{f.name}</span>)}</div>}<button disabled={busy}>{busy?t.sending:t.send}</button></form></section>}

        {view==='notes'&&<form className="review-form" onSubmit={saveReview}><label><span>{t.status}</span><select name="status" defaultValue={selected.status} key={`${selected.id}-status`}>{statuses.map(s=><option key={s} value={s}>{titleCase(s)}</option>)}</select></label><label><span>{t.private}</span><textarea name="review_summary" defaultValue={selected.review_summary||''} key={`${selected.id}-summary`}/></label><label><span>{t.correction}</span><textarea name="correction_message" defaultValue={selected.correction_message||''} key={`${selected.id}-correction`}/></label><button disabled={busy}>{busy?t.sending:t.save}</button></form>}
        {notice&&<div className={notice===t.saved||notice===t.sent?'admin-success':'admin-error'}>{notice}</div>}
      </>}</section>
    </section>
  </main>;
}
