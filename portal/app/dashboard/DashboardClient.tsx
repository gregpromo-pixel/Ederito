'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Lang = 'en' | 'fr' | 'es';
type Tab = 'projects' | 'contracts' | 'invoices' | 'support';
type Project = { id:string; name:string; status:string; target_launch_date:string|null; free_maintenance_ends_at:string|null };
type Contract = { id:string; title:string; status:string; contract_number:string };
type Invoice = { id:string; invoice_number:string; status:string; total_cents:number; due_date:string|null };
type Ticket = { id:string; subject:string; status:string; priority:string };
type Props = { name:string; projects:Project[]; contracts:Contract[]; invoices:Invoice[]; tickets:Ticket[] };

const copy = {
  en:{workspace:'Private client workspace',welcome:'Welcome',lead:'Track active work, review agreements, check billing and manage post-launch support.',projects:'Projects',contracts:'Contracts',invoices:'Invoices',support:'Support',activeProjects:'Active projects',openInvoices:'Open invoices',openTickets:'Open support tickets',noProjects:'No active project yet. Approved client work will appear here.',noContracts:'No contract has been issued yet.',noInvoices:'No invoices yet.',noTickets:'No support tickets yet.',status:'Status',target:'Target',due:'Due',createTicket:'Create support ticket',subject:'Subject',description:'Describe the issue or request',priority:'Priority',normal:'Normal',high:'High',urgent:'Urgent',submit:'Submit ticket',created:'Your support ticket was created.',signOut:'Sign out'},
  fr:{workspace:'Espace client privé',welcome:'Bienvenue',lead:'Suivez vos projets, consultez vos contrats, vérifiez la facturation et gérez le support après lancement.',projects:'Projets',contracts:'Contrats',invoices:'Factures',support:'Assistance',activeProjects:'Projets actifs',openInvoices:'Factures ouvertes',openTickets:'Tickets ouverts',noProjects:'Aucun projet actif. Les projets approuvés apparaîtront ici.',noContracts:'Aucun contrat n’a encore été émis.',noInvoices:'Aucune facture.',noTickets:'Aucun ticket d’assistance.',status:'Statut',target:'Date cible',due:'Échéance',createTicket:'Créer un ticket',subject:'Sujet',description:'Décrivez le problème ou la demande',priority:'Priorité',normal:'Normale',high:'Élevée',urgent:'Urgente',submit:'Envoyer le ticket',created:'Votre ticket a été créé.',signOut:'Déconnexion'},
  es:{workspace:'Espacio privado del cliente',welcome:'Bienvenido',lead:'Sigue tus proyectos, revisa contratos, consulta facturas y administra el soporte posterior al lanzamiento.',projects:'Proyectos',contracts:'Contratos',invoices:'Facturas',support:'Soporte',activeProjects:'Proyectos activos',openInvoices:'Facturas abiertas',openTickets:'Tickets abiertos',noProjects:'Aún no hay proyectos activos. Los proyectos aprobados aparecerán aquí.',noContracts:'Aún no se ha emitido ningún contrato.',noInvoices:'Aún no hay facturas.',noTickets:'Aún no hay tickets de soporte.',status:'Estado',target:'Fecha objetivo',due:'Vence',createTicket:'Crear ticket de soporte',subject:'Asunto',description:'Describe el problema o la solicitud',priority:'Prioridad',normal:'Normal',high:'Alta',urgent:'Urgente',submit:'Enviar ticket',created:'Tu ticket fue creado.',signOut:'Cerrar sesión'}
};

export default function DashboardClient({name,projects,contracts,invoices,tickets:initialTickets}:Props){
  const [lang,setLang] = useState<Lang>('en');
  const [tab,setTab] = useState<Tab>('projects');
  const [tickets,setTickets] = useState(initialTickets);
  const [message,setMessage] = useState<string|null>(null);
  const [busy,setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ederito-portal-language') as Lang | null;
    if (saved && ['en','fr','es'].includes(saved)) setLang(saved);
  }, []);

  const t = copy[lang];
  const openInvoices = invoices.filter((item) => item.status !== 'paid').length;
  const openTickets = tickets.filter((item) => !['closed','resolved'].includes(item.status)).length;

  function choose(next:Lang){
    setLang(next);
    localStorage.setItem('ederito-portal-language', next);
  }

  async function submitTicket(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const subject = String(form.get('subject') || '').trim();
    const description = String(form.get('description') || '').trim();
    const priority = String(form.get('priority') || 'normal');
    const supabase = createClient();
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { data,error } = await supabase.from('support_tickets').insert({client_id:user.id,subject,description,priority,status:'open'}).select('id,subject,status,priority').single();
    if (error) setMessage(error.message);
    else if (data) {
      setTickets((current) => [data,...current]);
      setMessage(t.created);
      formElement.reset();
    }
    setBusy(false);
  }

  const tabs:Tab[] = ['projects','contracts','invoices','support'];

  return <main className="portal shell">
    <header className="topbar">
      <div className="brand"><img className="brand-logo" src="/ederito-logo.svg" alt="Ederito logo"/><span>EDERITO PORTAL</span></div>
      <nav className="navlinks">{tabs.map((item) => <button key={item} className={tab===item?'nav-active':''} onClick={() => setTab(item)}>{t[item]}</button>)}</nav>
      <div className="top-actions">
        <div className="language-mini">{(['en','fr','es'] as Lang[]).map((item) => <button key={item} onClick={() => choose(item)} className={item===lang?'active':''}>{item.toUpperCase()}</button>)}</div>
        <form action="/auth/signout" method="post"><button className="button secondary" type="submit">{t.signOut}</button></form>
      </div>
    </header>

    <section className="dashboard-head"><p className="eyebrow">{t.workspace}</p><h1>{t.welcome}, {name}.</h1><p className="lead">{t.lead}</p></section>
    <section className="stats">
      <article className="stat"><span>{t.activeProjects}</span><strong>{projects.length}</strong></article>
      <article className="stat"><span>{t.contracts}</span><strong>{contracts.length}</strong></article>
      <article className="stat"><span>{t.openInvoices}</span><strong>{openInvoices}</strong></article>
      <article className="stat"><span>{t.openTickets}</span><strong>{openTickets}</strong></article>
    </section>

    <section className="panel dashboard-panel">
      {tab==='projects' && <><h2>{t.projects}</h2>{projects.length ? projects.map((item) => <div className="record" key={item.id}><strong>{item.name}</strong><span>{t.status}: {item.status}{item.target_launch_date ? ` · ${t.target}: ${item.target_launch_date}` : ''}</span></div>) : <div className="empty">{t.noProjects}</div>}</>}
      {tab==='contracts' && <><h2>{t.contracts}</h2>{contracts.length ? contracts.map((item) => <div className="record" key={item.id}><strong>{item.title}</strong><span>{item.contract_number} · {t.status}: {item.status}</span></div>) : <div className="empty">{t.noContracts}</div>}</>}
      {tab==='invoices' && <><h2>{t.invoices}</h2>{invoices.length ? invoices.map((item) => <div className="record" key={item.id}><strong>{item.invoice_number}</strong><span>${(item.total_cents/100).toFixed(2)} · {t.status}: {item.status}{item.due_date ? ` · ${t.due}: ${item.due_date}` : ''}</span></div>) : <div className="empty">{t.noInvoices}</div>}</>}
      {tab==='support' && <div className="support-layout">
        <div><h2>{t.support}</h2>{tickets.length ? tickets.map((item) => <div className="record" key={item.id}><strong>{item.subject}</strong><span>{item.priority} · {item.status}</span></div>) : <div className="empty">{t.noTickets}</div>}</div>
        <form className="form support-form" onSubmit={submitTicket}>
          <h3>{t.createTicket}</h3>
          <label className="field"><span>{t.subject}</span><input name="subject" required maxLength={160}/></label>
          <label className="field"><span>{t.description}</span><textarea name="description" required minLength={10} maxLength={4000}/></label>
          <label className="field"><span>{t.priority}</span><select name="priority"><option value="normal">{t.normal}</option><option value="high">{t.high}</option><option value="urgent">{t.urgent}</option></select></label>
          {message && <div className="notice success">{message}</div>}
          <button className="button" disabled={busy}>{busy ? '…' : t.submit}</button>
        </form>
      </div>}
    </section>
  </main>;
}
