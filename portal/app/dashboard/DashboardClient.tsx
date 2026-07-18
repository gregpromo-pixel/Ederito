'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Lang = 'en' | 'fr' | 'es';
type Tab = 'projects' | 'contracts' | 'invoices' | 'support';
type Project = { id: string; name: string; status: string; target_launch_date: string | null; free_maintenance_ends_at: string | null };
type Contract = { id: string; title: string; status: string; contract_number: string };
type Invoice = { id: string; invoice_number: string; status: string; total_cents: number; due_date: string | null };
type Ticket = { id: string; subject: string; status: string; priority: string };
type Props = { name: string; isStaff: boolean; projects: Project[]; contracts: Contract[]; invoices: Invoice[]; tickets: Ticket[] };

const copy = {
  en: {
    workspace: 'Private client workspace', welcome: 'Welcome', lead: 'A clear view of every project, agreement, invoice, and support request.',
    projects: 'Projects', contracts: 'Contracts', invoices: 'Invoices', support: 'Support', activeProjects: 'Active projects',
    openInvoices: 'Open invoices', openTickets: 'Open support tickets', noProjects: 'No active project yet. Start a request and Ederito will review the scope before issuing a proposal.',
    noContracts: 'No contract has been issued yet.', noInvoices: 'No invoices yet.', noTickets: 'No support tickets yet.', status: 'Status', target: 'Target', due: 'Due',
    createTicket: 'Create a support request', subject: 'Subject', description: 'Describe the issue or request', priority: 'Priority', normal: 'Normal', high: 'High', urgent: 'Urgent',
    submit: 'Submit request', created: 'Your support request was created.', signOut: 'Sign out', startProject: 'Start a project', overview: 'Client overview', admin: 'Operations',
    nextStep: 'Ready for the next move?', nextStepText: 'Choose a service, answer only the relevant questions, and receive a reviewed proposal before work begins.',
    openWorkspace: 'Open workspace', secure: 'Secure workspace', concierge: 'Project concierge', response: 'Human review before payment'
  },
  fr: {
    workspace: 'Espace client privé', welcome: 'Bienvenue', lead: 'Une vue claire de chaque projet, contrat, facture et demande de support.',
    projects: 'Projets', contracts: 'Contrats', invoices: 'Factures', support: 'Assistance', activeProjects: 'Projets actifs',
    openInvoices: 'Factures ouvertes', openTickets: 'Tickets ouverts', noProjects: 'Aucun projet actif. Envoyez une demande et Ederito examinera le périmètre avant de proposer une offre.',
    noContracts: 'Aucun contrat n’a encore été émis.', noInvoices: 'Aucune facture.', noTickets: 'Aucun ticket d’assistance.', status: 'Statut', target: 'Date cible', due: 'Échéance',
    createTicket: 'Créer une demande de support', subject: 'Sujet', description: 'Décrivez le problème ou la demande', priority: 'Priorité', normal: 'Normale', high: 'Élevée', urgent: 'Urgente',
    submit: 'Envoyer la demande', created: 'Votre demande de support a été créée.', signOut: 'Déconnexion', startProject: 'Démarrer un projet', overview: 'Vue client', admin: 'Opérations',
    nextStep: 'Prêt pour la prochaine étape ?', nextStepText: 'Choisissez un service, répondez seulement aux questions pertinentes et recevez une proposition examinée avant le début du travail.',
    openWorkspace: 'Ouvrir l’espace', secure: 'Espace sécurisé', concierge: 'Conciergerie projet', response: 'Examen humain avant paiement'
  },
  es: {
    workspace: 'Espacio privado del cliente', welcome: 'Bienvenido', lead: 'Una vista clara de cada proyecto, contrato, factura y solicitud de soporte.',
    projects: 'Proyectos', contracts: 'Contratos', invoices: 'Facturas', support: 'Soporte', activeProjects: 'Proyectos activos',
    openInvoices: 'Facturas abiertas', openTickets: 'Tickets abiertos', noProjects: 'Aún no hay proyectos activos. Envía una solicitud y Ederito revisará el alcance antes de emitir una propuesta.',
    noContracts: 'Aún no se ha emitido ningún contrato.', noInvoices: 'Aún no hay facturas.', noTickets: 'Aún no hay tickets de soporte.', status: 'Estado', target: 'Fecha objetivo', due: 'Vence',
    createTicket: 'Crear solicitud de soporte', subject: 'Asunto', description: 'Describe el problema o la solicitud', priority: 'Prioridad', normal: 'Normal', high: 'Alta', urgent: 'Urgente',
    submit: 'Enviar solicitud', created: 'Tu solicitud de soporte fue creada.', signOut: 'Cerrar sesión', startProject: 'Iniciar un proyecto', overview: 'Vista del cliente', admin: 'Operaciones',
    nextStep: '¿Listo para el próximo paso?', nextStepText: 'Elige un servicio, responde solo las preguntas pertinentes y recibe una propuesta revisada antes de comenzar.',
    openWorkspace: 'Abrir espacio', secure: 'Espacio seguro', concierge: 'Concierge de proyecto', response: 'Revisión humana antes del pago'
  }
};

export default function DashboardClient({ name, isStaff, projects, contracts, invoices, tickets: initialTickets }: Props) {
  const [lang, setLang] = useState<Lang>('en');
  const [tab, setTab] = useState<Tab>('projects');
  const [tickets, setTickets] = useState(initialTickets);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ederito-portal-language') as Lang | null;
    if (saved && ['en', 'fr', 'es'].includes(saved)) setLang(saved);
  }, []);

  const t = copy[lang];
  const openInvoices = invoices.filter((item) => item.status !== 'paid').length;
  const openTickets = tickets.filter((item) => !['closed', 'resolved'].includes(item.status)).length;
  const tabs: Tab[] = ['projects', 'contracts', 'invoices', 'support'];

  function choose(next: Lang) {
    setLang(next);
    localStorage.setItem('ederito-portal-language', next);
  }

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const subject = String(form.get('subject') || '').trim();
    const description = String(form.get('description') || '').trim();
    const priority = String(form.get('priority') || 'normal');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { data, error } = await supabase.from('support_tickets').insert({ client_id: user.id, subject, description, priority, status: 'open' }).select('id,subject,status,priority').single();
    if (error) setMessage(error.message);
    else if (data) {
      setTickets((current) => [data, ...current]);
      setMessage(t.created);
      formElement.reset();
    }
    setBusy(false);
  }

  return (
    <main className="portal shell dashboard-shell">
      <header className="topbar dashboard-topbar">
        <a className="brand" href="/dashboard" aria-label="Ederito client portal home">
          <img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito logo" />
          <span>EDERITO</span>
        </a>
        <nav className="navlinks dashboard-nav" aria-label="Client portal navigation">
          {tabs.map((item) => <button key={item} className={tab === item ? 'nav-active' : ''} onClick={() => setTab(item)}>{t[item]}</button>)}
          {isStaff && <a href="/admin/intakes" className="admin-nav-link">{t.admin}</a>}
        </nav>
        <div className="top-actions">
          <div className="language-mini">{(['en', 'fr', 'es'] as Lang[]).map((item) => <button key={item} onClick={() => choose(item)} className={item === lang ? 'active' : ''}>{item.toUpperCase()}</button>)}</div>
          <form action="/auth/signout" method="post"><button className="button secondary" type="submit">{t.signOut}</button></form>
        </div>
      </header>

      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="eyebrow">{t.workspace}</p>
          <h1>{t.welcome},<br /><span>{name}.</span></h1>
          <p>{t.lead}</p>
          <div className="dashboard-hero-actions"><a className="button" href="/start-project">{t.startProject}</a>{isStaff && <a className="dashboard-link" href="/admin/intakes">{t.admin} <span>↗</span></a>}<button className="dashboard-link" onClick={() => setTab('projects')}>{t.openWorkspace} <span>↘</span></button></div>
        </div>
        <aside className="concierge-card">
          <div className="concierge-index">01 / {t.concierge}</div>
          <div>
            <p className="eyebrow">{t.nextStep}</p>
            <h2>{t.response}</h2>
            <p>{t.nextStepText}</p>
          </div>
          <a href="/start-project">{t.startProject}<span>↗</span></a>
        </aside>
      </section>

      <section className="dashboard-ticker" aria-label="Portal features"><div><span>{t.secure}</span><i>✦</i><span>{t.projects}</span><i>✦</i><span>{t.contracts}</span><i>✦</i><span>{t.invoices}</span><i>✦</i><span>{t.support}</span></div></section>

      <section className="dashboard-stats" aria-label={t.overview}>
        <article><small>01</small><span>{t.activeProjects}</span><strong>{projects.length.toString().padStart(2, '0')}</strong></article>
        <article><small>02</small><span>{t.contracts}</span><strong>{contracts.length.toString().padStart(2, '0')}</strong></article>
        <article><small>03</small><span>{t.openInvoices}</span><strong>{openInvoices.toString().padStart(2, '0')}</strong></article>
        <article><small>04</small><span>{t.openTickets}</span><strong>{openTickets.toString().padStart(2, '0')}</strong></article>
      </section>

      <section className="workspace-section">
        <header className="workspace-heading">
          <div><p className="eyebrow">{t.overview}</p><h2>{t[tab]}</h2></div>
          <div className="workspace-tabs">{tabs.map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{t[item]}</button>)}</div>
        </header>

        <div className="workspace-panel">
          {tab === 'projects' && <div className="records-list">{projects.length ? projects.map((item) => <article className="record premium-record" key={item.id}><div><small>{t.projects}</small><strong>{item.name}</strong></div><span>{t.status}: {item.status}{item.target_launch_date ? ` · ${t.target}: ${item.target_launch_date}` : ''}</span></article>) : <div className="empty premium-empty"><span>01</span><p>{t.noProjects}</p><a className="button" href="/start-project">{t.startProject}</a></div>}</div>}
          {tab === 'contracts' && <div className="records-list">{contracts.length ? contracts.map((item) => <article className="record premium-record" key={item.id}><div><small>{item.contract_number}</small><strong>{item.title}</strong></div><span>{t.status}: {item.status}</span></article>) : <div className="empty premium-empty"><span>02</span><p>{t.noContracts}</p></div>}</div>}
          {tab === 'invoices' && <div className="records-list">{invoices.length ? invoices.map((item) => <article className="record premium-record" key={item.id}><div><small>{item.invoice_number}</small><strong>${(item.total_cents / 100).toFixed(2)}</strong></div><span>{t.status}: {item.status}{item.due_date ? ` · ${t.due}: ${item.due_date}` : ''}</span></article>) : <div className="empty premium-empty"><span>03</span><p>{t.noInvoices}</p></div>}</div>}
          {tab === 'support' && <div className="support-layout premium-support"><div className="records-list">{tickets.length ? tickets.map((item) => <article className="record premium-record" key={item.id}><div><small>{item.priority}</small><strong>{item.subject}</strong></div><span>{item.status}</span></article>) : <div className="empty premium-empty"><span>04</span><p>{t.noTickets}</p></div>}</div><form className="form support-form premium-support-form" onSubmit={submitTicket}><p className="eyebrow">{t.support}</p><h3>{t.createTicket}</h3><label className="field"><span>{t.subject}</span><input name="subject" required maxLength={160} /></label><label className="field"><span>{t.description}</span><textarea name="description" required minLength={10} maxLength={4000} /></label><label className="field"><span>{t.priority}</span><select name="priority"><option value="normal">{t.normal}</option><option value="high">{t.high}</option><option value="urgent">{t.urgent}</option></select></label>{message && <div className={`notice ${message === t.created ? 'success' : 'error'}`}>{message}</div>}<button className="button" disabled={busy}>{busy ? '…' : t.submit}</button></form></div>}
        </div>
      </section>
    </main>
  );
}
