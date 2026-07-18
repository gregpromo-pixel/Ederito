'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type Lang='en'|'fr'|'es';
type RequestItem={id:string;request_number:string|null;status:string;client_visible_status:string|null;client_status_message:string|null;correction_message:string|null;submitted_at:string|null;created_at:string;updated_at:string;estimated_total_cents:number;service_packages:{name:string;slug:string}|null};
type Conversation={id:string;intake_submission_id:string|null;title:string;status:string;client_last_read_at:string|null;staff_last_read_at:string|null;updated_at:string};
type Message={id:string;conversation_id:string;sender_role:string;body:string|null;created_at:string;read_at:string|null};
type Props={requests:RequestItem[];conversations:Conversation[];messages:Message[]};

const copy={
 en:{back:'Back to dashboard',eyebrow:'Client request center',title:'Track every request.',lead:'See the latest Ederito review status, correction request, and unread communication connected to each service.',all:'All requests',number:'Request',submitted:'Submitted',updated:'Last updated',total:'Estimated total',message:'Latest update',correction:'Action required',open:'Open messages',none:'No project requests yet.',start:'Start a project',unread:'unread',received:'Received',review:'Under review',correctionStatus:'Correction required',approved:'Approved',filed:'Filed',completed:'Completed',declined:'Declined'},
 fr:{back:'Retour au tableau de bord',eyebrow:'Centre des demandes',title:'Suivez chaque demande.',lead:'Consultez le statut d’examen, les corrections demandées et les communications non lues liées à chaque service.',all:'Toutes les demandes',number:'Demande',submitted:'Envoyée',updated:'Dernière mise à jour',total:'Total estimé',message:'Dernière mise à jour',correction:'Action requise',open:'Ouvrir les messages',none:'Aucune demande de projet.',start:'Démarrer un projet',unread:'non lu(s)',received:'Reçue',review:'En examen',correctionStatus:'Correction requise',approved:'Approuvée',filed:'Déposée',completed:'Terminée',declined:'Refusée'},
 es:{back:'Volver al panel',eyebrow:'Centro de solicitudes',title:'Sigue cada solicitud.',lead:'Consulta el estado de revisión, las correcciones solicitadas y las comunicaciones no leídas relacionadas con cada servicio.',all:'Todas las solicitudes',number:'Solicitud',submitted:'Enviada',updated:'Última actualización',total:'Total estimado',message:'Última actualización',correction:'Acción requerida',open:'Abrir mensajes',none:'Aún no hay solicitudes de proyecto.',start:'Iniciar un proyecto',unread:'sin leer',received:'Recibida',review:'En revisión',correctionStatus:'Corrección requerida',approved:'Aprobada',filed:'Presentada',completed:'Completada',declined:'Rechazada'}
};

const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);

export default function ClientRequests({requests,conversations,messages}:Props){
 const [lang,setLang]=useState<Lang>('en');
 useEffect(()=>{const saved=localStorage.getItem('ederito-portal-language') as Lang|null;if(saved&&['en','fr','es'].includes(saved))setLang(saved)},[]);
 const t=copy[lang];
 const conversationByRequest=useMemo(()=>new Map(conversations.filter(x=>x.intake_submission_id).map(x=>[x.intake_submission_id!,x])),[conversations]);
 const statusLabel=(value:string|null)=>{switch(value){case'under_review':return t.review;case'correction_required':return t.correctionStatus;case'approved':return t.approved;case'filed':return t.filed;case'completed':return t.completed;case'declined':return t.declined;default:return t.received}};
 async function markViewed(item:RequestItem){const supabase=createClient();await supabase.from('intake_submissions').update({last_client_viewed_at:new Date().toISOString()}).eq('id',item.id)}
 function unreadFor(item:RequestItem){const c=conversationByRequest.get(item.id);if(!c)return 0;const lastRead=c.client_last_read_at?new Date(c.client_last_read_at).getTime():0;return messages.filter(m=>m.conversation_id===c.id&&m.sender_role==='staff'&&new Date(m.created_at).getTime()>lastRead).length}
 function choose(next:Lang){setLang(next);localStorage.setItem('ederito-portal-language',next)}
 return <main className="request-center shell portal">
  <header className="topbar request-topbar"><Link className="brand" href="/dashboard"><img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito"/><span>EDERITO</span></Link><div className="top-actions"><div className="language-mini">{(['en','fr','es'] as Lang[]).map(x=><button key={x} className={x===lang?'active':''} onClick={()=>choose(x)}>{x.toUpperCase()}</button>)}</div><Link className="button secondary" href="/dashboard">← {t.back}</Link></div></header>
  <section className="request-hero"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.lead}</p></section>
  <section className="request-list"><header><span>{t.all}</span><strong>{requests.length.toString().padStart(2,'0')}</strong></header>{requests.map(item=>{const unread=unreadFor(item);const c=conversationByRequest.get(item.id);return <article key={item.id} className={`request-card status-${item.client_visible_status||item.status}`} onMouseEnter={()=>markViewed(item)}><div className="request-card-head"><div><small>{t.number} {item.request_number||item.id.slice(0,8).toUpperCase()}</small><h2>{item.service_packages?.name||'Ederito request'}</h2></div><span>{statusLabel(item.client_visible_status||item.status)}</span></div><div className="request-meta"><div><small>{t.submitted}</small><strong>{new Date(item.submitted_at||item.created_at).toLocaleDateString()}</strong></div><div><small>{t.updated}</small><strong>{new Date(item.updated_at).toLocaleDateString()}</strong></div><div><small>{t.total}</small><strong>{money(item.estimated_total_cents)}</strong></div></div>{item.client_status_message&&<div className="request-message"><small>{t.message}</small><p>{item.client_status_message}</p></div>}{item.correction_message&&<div className="request-correction"><small>{t.correction}</small><p>{item.correction_message}</p></div>}{c&&<Link href="/dashboard#messages" className="request-open" onClick={async()=>{const supabase=createClient();await supabase.from('client_conversations').update({client_last_read_at:new Date().toISOString()}).eq('id',c.id)}}>{t.open}{unread>0&&<b>{unread} {t.unread}</b>}<span>↗</span></Link>}</article>})}{!requests.length&&<div className="request-empty"><p>{t.none}</p><Link className="button" href="/start-project">{t.start}</Link></div>}</section>
 </main>
}
