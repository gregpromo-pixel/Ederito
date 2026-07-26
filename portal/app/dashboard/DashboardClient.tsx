'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Lang = 'en' | 'fr' | 'es';
type Tab = 'projects' | 'proposals' | 'contracts' | 'invoices' | 'messages' | 'documents' | 'support';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  target_launch_date: string | null;
  launched_at: string | null;
  free_maintenance_starts_at: string | null;
  free_maintenance_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

type Proposal = {
  id: string;
  proposal_number: string;
  title: string;
  scope_summary: string;
  total_cents: number;
  currency: string;
  status: string;
  valid_until: string | null;
  deposit_percent: number;
  timeline_summary: string | null;
  payment_schedule: string | null;
  created_at: string;
  updated_at: string;
};

type Contract = {
  id: string;
  title: string;
  status: string;
  contract_number: string;
  amount_cents: number | null;
  currency: string;
  sent_at: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
};

type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  total_cents: number;
  due_date: string | null;
  paid_at: string | null;
  description: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
};

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
};

type Conversation = {
  id: string;
  client_id: string;
  intake_submission_id: string | null;
  category: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: string;
  body: string | null;
  created_at: string;
  read_at: string | null;
};

type Attachment = {
  id: string;
  message_id: string;
  client_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

type WorkflowEvent = {
  id: string;
  event_type: string;
  metadata: unknown;
  proposal_id: string | null;
  contract_id: string | null;
  invoice_id: string | null;
  created_at: string;
};

type Props = {
  name: string;
  email: string;
  companyName: string;
  phone: string;
  userId: string;
  isStaff: boolean;
  projects: Project[];
  proposals: Proposal[];
  contracts: Contract[];
  invoices: Invoice[];
  tickets: Ticket[];
  workflowEvents: WorkflowEvent[];
  initialConversations: Conversation[];
  initialMessages: Message[];
  initialAttachments: Attachment[];
};

type DocumentItem =
  | {
      type: 'link';
      id: string;
      kind: string;
      title: string;
      meta: string;
      status: string;
      href: string;
      createdAt: string;
    }
  | {
      type: 'file';
      id: string;
      kind: string;
      title: string;
      meta: string;
      status: string;
      attachment: Attachment;
      createdAt: string;
    };

const tabs: Tab[] = ['projects', 'proposals', 'contracts', 'invoices', 'messages', 'documents', 'support'];

const copy = {
  en: {
    workspace: 'Client command center', welcome: 'Welcome back', lead: 'Everything important about your Ederito projects, approvals, payments, files, and support—organized in one secure place.',
    projects: 'Projects', proposals: 'Proposals', contracts: 'Contracts', invoices: 'Invoices', messages: 'Messages', documents: 'Documents', support: 'Support',
    actionsRequired: 'Actions required', activeProjects: 'Active projects', openInvoices: 'Open invoices', unreadMessages: 'Unread messages', nextAction: 'Your next action',
    startProject: 'Start a new project', reviewProposal: 'Review proposal', signAgreement: 'Sign agreement', payInvoice: 'Pay invoice securely', replyMessage: 'Reply to Ederito', viewProject: 'View project workspace',
    allClear: 'You are all caught up', allClearText: 'There are no urgent actions waiting for you.', projectProgress: 'Project progress', recentActivity: 'Recent activity', quickActions: 'Quick actions',
    billingSummary: 'Billing summary', amountDue: 'Amount due', upcomingDeadline: 'Upcoming deadline', clientProfile: 'Client profile', contact: 'Your Ederito contact', contactText: 'Questions about your project? Send a secure message from the portal.', openMessages: 'Open messages',
    account: 'Account', company: 'Company', phone: 'Phone', email: 'Email', status: 'Status', target: 'Target launch', maintenance: 'Maintenance through', lastUpdated: 'Last updated', currentStage: 'Current stage',
    noProjects: 'No active project yet. Start a request and Ederito will review the scope before issuing a proposal.', noProposals: 'No proposal has been issued yet. Your proposal will appear here after Ederito reviews your request.', noContracts: 'No agreement has been issued yet. Agreements appear after a proposal is accepted.', noInvoices: 'No invoice yet. An invoice will appear after you approve a proposal.', noMessages: 'No secure messages yet.', noDocuments: 'No documents yet. Contracts, invoices, receipts, and uploaded files will appear here.', noTickets: 'No support requests yet.',
    createTicket: 'Create a support request', subject: 'Subject', description: 'Describe the issue or request', priority: 'Priority', normal: 'Normal', high: 'High', urgent: 'Urgent', submit: 'Submit request', created: 'Your support request was created.',
    reply: 'Reply to Ederito', attach: 'Attach documents or photos', send: 'Send reply', sent: 'Reply sent.', view: 'View details', due: 'Due', validUntil: 'Valid until', deposit: 'Deposit', review: 'Review', securePayment: 'Pay securely', download: 'Open file', activityEmpty: 'No project activity yet.', operations: 'Operations',
    stageRequest: 'Request', stageProposal: 'Proposal', stageAgreement: 'Agreement', stagePayment: 'Payment', stageBuild: 'Build', stageReview: 'Review', stageLaunch: 'Launch'
  },
  fr: {
    workspace: 'Centre de commande client', welcome: 'Bon retour', lead: 'Tout ce qui concerne vos projets Ederito, validations, paiements, fichiers et assistance—réuni dans un espace sécurisé.',
    projects: 'Projets', proposals: 'Propositions', contracts: 'Contrats', invoices: 'Factures', messages: 'Messages', documents: 'Documents', support: 'Assistance',
    actionsRequired: 'Actions requises', activeProjects: 'Projets actifs', openInvoices: 'Factures ouvertes', unreadMessages: 'Messages non lus', nextAction: 'Votre prochaine action',
    startProject: 'Démarrer un nouveau projet', reviewProposal: 'Examiner la proposition', signAgreement: 'Signer le contrat', payInvoice: 'Payer la facture en sécurité', replyMessage: 'Répondre à Ederito', viewProject: 'Voir l’espace projet',
    allClear: 'Tout est à jour', allClearText: 'Aucune action urgente ne vous attend.', projectProgress: 'Progression du projet', recentActivity: 'Activité récente', quickActions: 'Actions rapides',
    billingSummary: 'Résumé de facturation', amountDue: 'Montant dû', upcomingDeadline: 'Prochaine échéance', clientProfile: 'Profil client', contact: 'Votre contact Ederito', contactText: 'Une question sur votre projet ? Envoyez un message sécurisé depuis le portail.', openMessages: 'Ouvrir les messages',
    account: 'Compte', company: 'Entreprise', phone: 'Téléphone', email: 'E-mail', status: 'Statut', target: 'Lancement prévu', maintenance: 'Maintenance jusqu’au', lastUpdated: 'Dernière mise à jour', currentStage: 'Étape actuelle',
    noProjects: 'Aucun projet actif. Envoyez une demande et Ederito examinera le périmètre avant de proposer une offre.', noProposals: 'Aucune proposition n’a encore été émise. Elle apparaîtra ici après l’examen de votre demande.', noContracts: 'Aucun contrat n’a encore été émis. Il apparaîtra après l’acceptation d’une proposition.', noInvoices: 'Aucune facture. Une facture apparaîtra après l’acceptation d’une proposition.', noMessages: 'Aucun message sécurisé.', noDocuments: 'Aucun document. Les contrats, factures, reçus et fichiers apparaîtront ici.', noTickets: 'Aucune demande d’assistance.',
    createTicket: 'Créer une demande d’assistance', subject: 'Sujet', description: 'Décrivez le problème ou la demande', priority: 'Priorité', normal: 'Normale', high: 'Élevée', urgent: 'Urgente', submit: 'Envoyer la demande', created: 'Votre demande d’assistance a été créée.',
    reply: 'Répondre à Ederito', attach: 'Joindre des documents ou photos', send: 'Envoyer la réponse', sent: 'Réponse envoyée.', view: 'Voir les détails', due: 'Échéance', validUntil: 'Valable jusqu’au', deposit: 'Acompte', review: 'Examiner', securePayment: 'Payer en sécurité', download: 'Ouvrir le fichier', activityEmpty: 'Aucune activité projet.', operations: 'Opérations',
    stageRequest: 'Demande', stageProposal: 'Proposition', stageAgreement: 'Contrat', stagePayment: 'Paiement', stageBuild: 'Création', stageReview: 'Révision', stageLaunch: 'Lancement'
  },
  es: {
    workspace: 'Centro de control del cliente', welcome: 'Bienvenido de nuevo', lead: 'Todo lo importante sobre tus proyectos Ederito, aprobaciones, pagos, archivos y soporte—organizado en un solo espacio seguro.',
    projects: 'Proyectos', proposals: 'Propuestas', contracts: 'Contratos', invoices: 'Facturas', messages: 'Mensajes', documents: 'Documentos', support: 'Soporte',
    actionsRequired: 'Acciones requeridas', activeProjects: 'Proyectos activos', openInvoices: 'Facturas abiertas', unreadMessages: 'Mensajes no leídos', nextAction: 'Tu próxima acción',
    startProject: 'Iniciar un nuevo proyecto', reviewProposal: 'Revisar propuesta', signAgreement: 'Firmar acuerdo', payInvoice: 'Pagar factura de forma segura', replyMessage: 'Responder a Ederito', viewProject: 'Ver espacio del proyecto',
    allClear: 'Todo está al día', allClearText: 'No tienes acciones urgentes pendientes.', projectProgress: 'Progreso del proyecto', recentActivity: 'Actividad reciente', quickActions: 'Acciones rápidas',
    billingSummary: 'Resumen de facturación', amountDue: 'Monto pendiente', upcomingDeadline: 'Próxima fecha límite', clientProfile: 'Perfil del cliente', contact: 'Tu contacto Ederito', contactText: '¿Preguntas sobre tu proyecto? Envía un mensaje seguro desde el portal.', openMessages: 'Abrir mensajes',
    account: 'Cuenta', company: 'Empresa', phone: 'Teléfono', email: 'Correo', status: 'Estado', target: 'Lanzamiento previsto', maintenance: 'Mantenimiento hasta', lastUpdated: 'Última actualización', currentStage: 'Etapa actual',
    noProjects: 'Aún no hay proyectos activos. Envía una solicitud y Ederito revisará el alcance antes de emitir una propuesta.', noProposals: 'Aún no hay propuestas. Aparecerán aquí después de que Ederito revise tu solicitud.', noContracts: 'Aún no hay acuerdos. Aparecerán después de aceptar una propuesta.', noInvoices: 'Aún no hay facturas. Una factura aparecerá después de aprobar una propuesta.', noMessages: 'Aún no hay mensajes seguros.', noDocuments: 'Aún no hay documentos. Los contratos, facturas, recibos y archivos aparecerán aquí.', noTickets: 'Aún no hay solicitudes de soporte.',
    createTicket: 'Crear solicitud de soporte', subject: 'Asunto', description: 'Describe el problema o la solicitud', priority: 'Prioridad', normal: 'Normal', high: 'Alta', urgent: 'Urgente', submit: 'Enviar solicitud', created: 'Tu solicitud de soporte fue creada.',
    reply: 'Responder a Ederito', attach: 'Adjuntar documentos o fotos', send: 'Enviar respuesta', sent: 'Respuesta enviada.', view: 'Ver detalles', due: 'Vence', validUntil: 'Válida hasta', deposit: 'Depósito', review: 'Revisar', securePayment: 'Pagar de forma segura', download: 'Abrir archivo', activityEmpty: 'Aún no hay actividad del proyecto.', operations: 'Operaciones',
    stageRequest: 'Solicitud', stageProposal: 'Propuesta', stageAgreement: 'Acuerdo', stagePayment: 'Pago', stageBuild: 'Creación', stageReview: 'Revisión', stageLaunch: 'Lanzamiento'
  }
} as const;

function money(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(value / 100);
}

function formatDate(value: string | null, lang: Lang) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).format(new Date(value));
}

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function isOpen(status: string) {
  return !['paid', 'completed', 'closed', 'resolved', 'declined', 'cancelled'].includes(status.toLowerCase());
}

function getStageIndex(project: Project | null, proposals: Proposal[], contracts: Contract[], invoices: Invoice[]) {
  if (!project) return 0;
  if (project.launched_at || project.status.toLowerCase().includes('launch')) return 6;
  if (project.status.toLowerCase().includes('review')) return 5;
  if (project.status.toLowerCase().includes('build') || project.status.toLowerCase().includes('progress')) return 4;
  if (invoices.some((item) => item.status.toLowerCase() === 'paid')) return 4;
  if (invoices.length) return 3;
  if (contracts.length) return 2;
  if (proposals.length) return 1;
  return 0;
}

export default function DashboardClient({
  name, email, companyName, phone, userId, isStaff, projects, proposals, contracts, invoices,
  tickets: initialTickets, workflowEvents, initialConversations, initialMessages, initialAttachments
}: Props) {
  const [lang, setLang] = useState<Lang>('en');
  const [tab, setTab] = useState<Tab>('projects');
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [conversations] = useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [selectedConversation, setSelectedConversation] = useState(initialConversations[0]?.id || '');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ederito-portal-language') as Lang | null;
    if (stored && ['en', 'fr', 'es'].includes(stored)) setLang(stored);
  }, []);

  useEffect(() => {
    const listener = (event: Event) => {
      const next = (event as CustomEvent<Lang>).detail;
      if (['en', 'fr', 'es'].includes(next)) setLang(next);
    };
    window.addEventListener('ederito:language', listener as EventListener);
    return () => window.removeEventListener('ederito:language', listener as EventListener);
  }, []);

  const t = copy[lang];
  const openInvoices = invoices.filter((item) => isOpen(item.status));
  const unreadMessages = messages.filter((item) => item.sender_role !== 'client' && !item.read_at).length;
  const pendingProposal = proposals.find((item) => ['sent', 'pending'].includes(item.status.toLowerCase()));
  const unsignedContract = contracts.find((item) => ['sent', 'pending'].includes(item.status.toLowerCase()));
  const unpaidInvoice = openInvoices[0];
  const waitingConversation = conversations.find((item) => ['waiting_on_client', 'open'].includes(item.status.toLowerCase()));
  const activeProject = projects.find((item) => !['completed', 'launched', 'cancelled'].includes(item.status.toLowerCase())) || projects[0] || null;
  const actionCount = [pendingProposal, unsignedContract, unpaidInvoice, waitingConversation].filter(Boolean).length;
  const thread = messages.filter((item) => item.conversation_id === selectedConversation);

  const documents = useMemo<DocumentItem[]>(() => {
    const linked: DocumentItem[] = [
      ...contracts.map((item): DocumentItem => ({
        type: 'link', id: `contract-${item.id}`, kind: t.contracts, title: item.title,
        meta: item.contract_number, status: item.status, href: '/dashboard/sales', createdAt: item.created_at
      })),
      ...invoices.map((item): DocumentItem => ({
        type: 'link', id: `invoice-${item.id}`, kind: t.invoices, title: item.description || item.invoice_number,
        meta: item.invoice_number, status: item.status, href: '/dashboard/sales', createdAt: item.created_at
      })),
      ...attachments.map((item): DocumentItem => ({
        type: 'file', id: `file-${item.id}`, kind: t.documents, title: item.file_name,
        meta: item.mime_type || t.documents, status: 'file', attachment: item, createdAt: item.created_at
      }))
    ];
    return linked.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  }, [attachments, contracts, invoices, t]);

  const stages = [t.stageRequest, t.stageProposal, t.stageAgreement, t.stagePayment, t.stageBuild, t.stageReview, t.stageLaunch];
  const currentStage = getStageIndex(activeProject, proposals, contracts, invoices);
  const progress = activeProject ? Math.round(((currentStage + 1) / stages.length) * 100) : 0;
  const amountDue = openInvoices.reduce((sum, item) => sum + item.total_cents, 0);

  const nextAction = pendingProposal
    ? { label: t.reviewProposal, detail: pendingProposal.title, href: '/dashboard/sales', tab: 'proposals' as Tab }
    : unsignedContract
      ? { label: t.signAgreement, detail: unsignedContract.title, href: '/dashboard/sales', tab: 'contracts' as Tab }
      : unpaidInvoice
        ? { label: t.payInvoice, detail: `${unpaidInvoice.invoice_number} · ${money(unpaidInvoice.total_cents, unpaidInvoice.currency)}`, href: '/dashboard/sales', tab: 'invoices' as Tab }
        : waitingConversation
          ? { label: t.replyMessage, detail: waitingConversation.title, href: '#workspace', tab: 'messages' as Tab }
          : activeProject
            ? { label: t.viewProject, detail: activeProject.name, href: '#workspace', tab: 'projects' as Tab }
            : { label: t.startProject, detail: t.allClearText, href: '/start-project', tab: 'projects' as Tab };

  const nextDeadline = [
    ...invoices.filter((item) => item.due_date && isOpen(item.status)).map((item) => ({ label: item.invoice_number, date: item.due_date as string })),
    ...projects.filter((item) => item.target_launch_date).map((item) => ({ label: item.name, date: item.target_launch_date as string }))
  ].sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())[0];

  function choose(next: Lang) {
    setLang(next);
    localStorage.setItem('ederito-portal-language', next);
    localStorage.setItem('ederito-language', next);
    document.cookie = `ederito-language=${next}; Max-Age=31536000; Path=/; Domain=.ederito.com; SameSite=Lax; Secure`;
    window.dispatchEvent(new CustomEvent('ederito:language', { detail: next }));
  }

  function openTab(next: Tab) {
    setTab(next);
    window.setTimeout(() => document.querySelector('#workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  }

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        client_id: userId,
        subject: String(form.get('subject') || '').trim(),
        description: String(form.get('description') || '').trim(),
        priority: String(form.get('priority') || 'normal'),
        status: 'open'
      })
      .select('id,subject,status,priority,created_at')
      .single();
    if (error) setMessage(error.message);
    else if (data) {
      setTickets((current) => [data as Ticket, ...current]);
      setMessage(t.created);
      formElement.reset();
    }
    setBusy(false);
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConversation) return;
    setBusy(true);
    setMessage(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const body = String(form.get('body') || '').trim();
    if (!body && !files.length) {
      setBusy(false);
      return;
    }
    const supabase = createClient();
    const { data: createdMessage, error } = await supabase
      .from('client_messages')
      .insert({ conversation_id: selectedConversation, sender_id: userId, sender_role: 'client', body: body || null })
      .select('id,conversation_id,sender_id,sender_role,body,created_at,read_at')
      .single();
    if (error || !createdMessage) {
      setMessage(error?.message || 'Unable to send.');
      setBusy(false);
      return;
    }

    const uploaded: Attachment[] = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `${userId}/${selectedConversation}/${createdMessage.id}-${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('client-communications').upload(path, file, { contentType: file.type });
      if (uploadError) {
        setMessage(uploadError.message);
        continue;
      }
      const { data: attachment } = await supabase
        .from('client_message_attachments')
        .insert({ message_id: createdMessage.id, client_id: userId, storage_path: path, file_name: file.name, mime_type: file.type || null, size_bytes: file.size })
        .select('id,message_id,client_id,storage_path,file_name,mime_type,size_bytes,created_at')
        .single();
      if (attachment) uploaded.push(attachment as Attachment);
    }

    setMessages((current) => [...current, createdMessage as Message]);
    setAttachments((current) => [...current, ...uploaded]);
    setFiles([]);
    formElement.reset();
    setMessage(t.sent);
    setBusy(false);
  }

  async function openAttachment(item: Attachment) {
    const supabase = createClient();
    const { data } = await supabase.storage.from('client-communications').createSignedUrl(item.storage_path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  const locale = lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';

  return (
    <main className="portal shell dashboard-shell client-command-center">
      <header className="topbar dashboard-topbar">
        <a className="brand" href="/dashboard"><img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito logo"/><span>EDERITO</span></a>
        <nav className="navlinks dashboard-nav">
          {tabs.map((item) => <button type="button" key={item} className={tab === item ? 'nav-active' : ''} onClick={() => openTab(item)}>{t[item]}</button>)}
          {isStaff && <a href="/admin/intakes" className="admin-nav-link">{t.operations}</a>}
        </nav>
        <div className="top-actions"><div className="language-mini">{(['en', 'fr', 'es'] as Lang[]).map((item) => <button type="button" key={item} onClick={() => choose(item)} className={item === lang ? 'active' : ''}>{item.toUpperCase()}</button>)}</div></div>
      </header>

      <section className="client-command-hero">
        <div className="client-command-welcome">
          <p className="eyebrow">{t.workspace}</p>
          <h1>{t.welcome}, <span>{name}.</span></h1>
          <p>{t.lead}</p>
          <div className="client-command-meta"><span>{companyName || t.account}</span><i>•</i><span>{t.lastUpdated}: {formatDate(new Date().toISOString(), lang)}</span></div>
        </div>
        <article className={`next-action-card ${actionCount ? 'attention' : ''}`}>
          <div><small>{t.nextAction}</small><span>{actionCount ? `${actionCount} ${t.actionsRequired.toLowerCase()}` : t.allClear}</span></div>
          <h2>{nextAction.label}</h2><p>{nextAction.detail}</p>
          <a href={nextAction.href} onClick={(event: React.MouseEvent<HTMLAnchorElement>) => { if (nextAction.href === '#workspace') { event.preventDefault(); openTab(nextAction.tab); } }}>{nextAction.label}<b>↗</b></a>
        </article>
      </section>

      <section className="client-command-stats">
        <button type="button" onClick={() => openTab('projects')}><small>01</small><span>{t.activeProjects}</span><strong>{projects.filter((item) => !['completed', 'launched', 'cancelled'].includes(item.status.toLowerCase())).length}</strong></button>
        <button type="button" onClick={() => openTab(pendingProposal ? 'proposals' : unsignedContract ? 'contracts' : unpaidInvoice ? 'invoices' : 'messages')}><small>02</small><span>{t.actionsRequired}</span><strong>{actionCount}</strong></button>
        <button type="button" onClick={() => openTab('invoices')}><small>03</small><span>{t.openInvoices}</span><strong>{openInvoices.length}</strong></button>
        <button type="button" onClick={() => openTab('messages')}><small>04</small><span>{t.unreadMessages}</span><strong>{unreadMessages}</strong></button>
      </section>

      <section className="client-command-grid">
        <div className="client-command-main">
          <article className="project-progress-card">
            <header><div><p className="eyebrow">{t.projectProgress}</p><h2>{activeProject?.name || t.noProjects}</h2></div>{activeProject && <span>{progress}%</span>}</header>
            {activeProject ? <>
              <div className="project-progress-bar"><i style={{ width: `${progress}%` }}/></div>
              <div className="project-stage-row">{stages.map((stage, index) => <button type="button" key={stage} className={index < currentStage ? 'complete' : index === currentStage ? 'active' : ''} onClick={() => openTab(index === 1 ? 'proposals' : index === 2 ? 'contracts' : index === 3 ? 'invoices' : 'projects')}><b>{index < currentStage ? '✓' : String(index + 1).padStart(2, '0')}</b><span>{stage}</span></button>)}</div>
              <div className="project-progress-details">
                <div><span>{t.currentStage}</span><strong>{stages[currentStage]}</strong></div>
                <div><span>{t.target}</span><strong>{formatDate(activeProject.target_launch_date, lang)}</strong></div>
                <div><span>{t.maintenance}</span><strong>{formatDate(activeProject.free_maintenance_ends_at, lang)}</strong></div>
                <div><span>{t.lastUpdated}</span><strong>{formatDate(activeProject.updated_at, lang)}</strong></div>
              </div>
            </> : <a className="button" href="/start-project">{t.startProject}</a>}
          </article>

          <article className="activity-card">
            <header><div><p className="eyebrow">{t.recentActivity}</p><h2>{t.recentActivity}</h2></div><span>{workflowEvents.length}</span></header>
            <div className="activity-list">{workflowEvents.slice(0, 8).map((item, index) => <div key={item.id}><i>{String(index + 1).padStart(2, '0')}</i><div><strong>{titleCase(item.event_type)}</strong><span>{formatDate(item.created_at, lang)}</span></div></div>)}{!workflowEvents.length && <p className="command-empty">{t.activityEmpty}</p>}</div>
          </article>
        </div>

        <aside className="client-command-side">
          <article className="quick-actions-card"><p className="eyebrow">{t.quickActions}</p><h3>{t.quickActions}</h3><a href="/start-project"><span>{t.startProject}</span><b>↗</b></a><button type="button" onClick={() => openTab('messages')}><span>{t.openMessages}</span><b>↗</b></button><a href="/dashboard/sales"><span>{t.proposals} &amp; {t.invoices}</span><b>↗</b></a>{isStaff && <a href="/admin/intakes"><span>{t.operations}</span><b>↗</b></a>}</article>
          <article className="billing-summary-card"><p className="eyebrow">{t.billingSummary}</p><h3>{t.amountDue}</h3><strong>{money(amountDue, openInvoices[0]?.currency || 'USD')}</strong><span>{openInvoices.length} {t.openInvoices.toLowerCase()}</span>{unpaidInvoice ? <a href={`/api/payments/start/${unpaidInvoice.id}`}>{t.securePayment}<b>↗</b></a> : <button type="button" onClick={() => openTab('invoices')}>{t.invoices}<b>↗</b></button>}</article>
          <article className="deadline-card"><p className="eyebrow">{t.upcomingDeadline}</p>{nextDeadline ? <><h3>{nextDeadline.label}</h3><strong>{formatDate(nextDeadline.date, lang)}</strong></> : <><h3>{t.allClear}</h3><span>{t.allClearText}</span></>}</article>
          <article className="profile-card"><p className="eyebrow">{t.clientProfile}</p><h3>{name}</h3><dl><div><dt>{t.email}</dt><dd>{email || '—'}</dd></div><div><dt>{t.company}</dt><dd>{companyName || '—'}</dd></div><div><dt>{t.phone}</dt><dd>{phone || '—'}</dd></div></dl></article>
          <article className="contact-card"><p className="eyebrow">{t.contact}</p><h3>Ederito Studio</h3><p>{t.contactText}</p><button type="button" onClick={() => openTab('messages')}>{t.openMessages}<b>↗</b></button></article>
        </aside>
      </section>

      <section className="workspace-section" id="workspace">
        <header className="workspace-heading"><div><p className="eyebrow">{t.workspace}</p><h2>{t[tab]}</h2></div><div className="workspace-tabs">{tabs.map((item) => <button type="button" key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{t[item]}{item === 'proposals' && pendingProposal ? <b>1</b> : item === 'invoices' && openInvoices.length ? <b>{openInvoices.length}</b> : item === 'messages' && unreadMessages ? <b>{unreadMessages}</b> : null}</button>)}</div></header>
        <div className="workspace-panel">
          {tab === 'projects' && <div className="command-records">{projects.length ? projects.map((item) => <article className="command-record project-record" key={item.id}><div className="record-icon">P</div><div><small>{t.projects}</small><h3>{item.name}</h3><p>{item.description || `${t.currentStage}: ${titleCase(item.status)}`}</p></div><dl><div><dt>{t.status}</dt><dd>{titleCase(item.status)}</dd></div><div><dt>{t.target}</dt><dd>{formatDate(item.target_launch_date, lang)}</dd></div></dl></article>) : <EmptyState number="01" title={t.projects} text={t.noProjects} action={<a className="button" href="/start-project">{t.startProject}</a>}/>}</div>}

          {tab === 'proposals' && <div className="command-records">{proposals.length ? proposals.map((item) => <article className="command-record proposal-record" key={item.id}><div className="record-icon">P</div><div><small>{item.proposal_number}</small><h3>{item.title}</h3><p>{item.scope_summary}</p><div className="record-tags"><span>{t.deposit}: {item.deposit_percent}%</span>{item.timeline_summary && <span>{item.timeline_summary}</span>}{item.valid_until && <span>{t.validUntil}: {formatDate(item.valid_until, lang)}</span>}</div></div><div className="record-action"><strong>{money(item.total_cents, item.currency)}</strong><span>{titleCase(item.status)}</span><a href="/dashboard/sales">{t.review}<b>↗</b></a></div></article>) : <EmptyState number="02" title={t.proposals} text={t.noProposals}/>}</div>}

          {tab === 'contracts' && <div className="command-records">{contracts.length ? contracts.map((item) => <article className="command-record" key={item.id}><div className="record-icon">C</div><div><small>{item.contract_number}</small><h3>{item.title}</h3><p>{t.status}: {titleCase(item.status)}</p></div><div className="record-action">{item.amount_cents !== null && <strong>{money(item.amount_cents, item.currency)}</strong>}<span>{item.signed_at ? `${t.lastUpdated}: ${formatDate(item.signed_at, lang)}` : titleCase(item.status)}</span><a href="/dashboard/sales">{t.view}<b>↗</b></a></div></article>) : <EmptyState number="03" title={t.contracts} text={t.noContracts}/>}</div>}

          {tab === 'invoices' && <div className="command-records">{invoices.length ? invoices.map((item) => <article className={`command-record invoice-record ${item.status.toLowerCase() === 'paid' ? 'paid' : ''}`} key={item.id}><div className="record-icon">I</div><div><small>{item.invoice_number}</small><h3>{item.description || t.invoices}</h3><p>{item.due_date ? `${t.due}: ${formatDate(item.due_date, lang)}` : titleCase(item.status)}</p></div><div className="record-action"><strong>{money(item.total_cents, item.currency)}</strong><span>{titleCase(item.status)}</span>{item.status.toLowerCase() === 'paid' ? <a href="/dashboard/sales">{t.view}<b>↗</b></a> : <a className="pay-link" href={`/api/payments/start/${item.id}`}>{t.securePayment}<b>↗</b></a>}</div></article>) : <EmptyState number="04" title={t.invoices} text={t.noInvoices}/>}</div>}

          {tab === 'messages' && <div className="client-message-layout command-messages"><aside>{conversations.map((item) => <button type="button" key={item.id} className={selectedConversation === item.id ? 'active' : ''} onClick={() => setSelectedConversation(item.id)}><strong>{item.title}</strong><span>{item.category} · {titleCase(item.status)}</span></button>)}{!conversations.length && <p>{t.noMessages}</p>}</aside><section><div className="client-thread">{thread.map((item) => <article key={item.id} className={item.sender_role === 'client' ? 'mine' : 'theirs'}><header><strong>{item.sender_role === 'client' ? name : 'Ederito'}</strong><time>{new Date(item.created_at).toLocaleString(locale)}</time></header>{item.body && <p>{item.body}</p>}<div>{attachments.filter((attachment) => attachment.message_id === item.id).map((attachment) => <button type="button" key={attachment.id} onClick={() => openAttachment(attachment)}>{attachment.mime_type?.startsWith('image/') ? '🖼' : '📄'} {attachment.file_name}</button>)}</div></article>)}</div>{selectedConversation && <form className="client-reply" onSubmit={sendReply}><textarea name="body" placeholder={t.reply}/><label><input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={(event: ChangeEvent<HTMLInputElement>) => setFiles(Array.from(event.target.files || []))}/><span>{t.attach}</span></label>{files.length > 0 && <div>{files.map((file) => <small key={`${file.name}-${file.size}`}>{file.name}</small>)}</div>}<button className="button" disabled={busy}>{busy ? '…' : t.send}</button></form>}</section></div>}

          {tab === 'documents' && <div className="document-grid">{documents.length ? documents.map((item) => <article key={item.id}><div className="document-icon">{item.kind.slice(0, 1)}</div><div><small>{item.kind}</small><h3>{item.title}</h3><span>{item.meta} · {formatDate(item.createdAt, lang)}</span></div>{item.type === 'file' ? <button type="button" onClick={() => openAttachment(item.attachment)}>{t.download}</button> : <a href={item.href}>{t.view}</a>}</article>) : <EmptyState number="06" title={t.documents} text={t.noDocuments}/>}</div>}

          {tab === 'support' && <div className="support-layout command-support"><div className="command-records">{tickets.length ? tickets.map((item) => <article className="command-record" key={item.id}><div className="record-icon">S</div><div><small>{titleCase(item.priority)}</small><h3>{item.subject}</h3><p>{formatDate(item.created_at, lang)}</p></div><span className="status-pill">{titleCase(item.status)}</span></article>) : <EmptyState number="07" title={t.support} text={t.noTickets}/>}</div><form className="form support-form premium-support-form" onSubmit={submitTicket}><p className="eyebrow">{t.support}</p><h3>{t.createTicket}</h3><label className="field"><span>{t.subject}</span><input name="subject" required/></label><label className="field"><span>{t.description}</span><textarea name="description" required/></label><label className="field"><span>{t.priority}</span><select name="priority"><option value="normal">{t.normal}</option><option value="high">{t.high}</option><option value="urgent">{t.urgent}</option></select></label><button className="button" disabled={busy}>{busy ? '…' : t.submit}</button></form></div>}

          {message && <div className="notice success">{message}</div>}
        </div>
      </section>
    </main>
  );
}

function EmptyState({ number, title, text, action }: { number: string; title: string; text: string; action?: React.ReactNode }) {
  return <div className="command-empty-state"><span>{number}</span><h3>{title}</h3><p>{text}</p>{action}</div>;
}
