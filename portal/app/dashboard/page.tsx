import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');

  const [{data:profile},{data:projects},{data:contracts},{data:invoices},{data:tickets}] = await Promise.all([
    supabase.from('profiles').select('full_name,company_name,role').eq('id',user.id).maybeSingle(),
    supabase.from('projects').select('id,name,status,target_launch_date,free_maintenance_ends_at').eq('client_id',user.id).order('created_at',{ascending:false}).limit(5),
    supabase.from('contracts').select('id,title,status,contract_number').eq('client_id',user.id).order('created_at',{ascending:false}).limit(5),
    supabase.from('invoices').select('id,invoice_number,status,total_cents,due_date').eq('client_id',user.id).order('created_at',{ascending:false}).limit(5),
    supabase.from('support_tickets').select('id,subject,status,priority').eq('client_id',user.id).order('created_at',{ascending:false}).limit(5)
  ]);

  async function signOut(){
    'use server';
    const client=await createClient();
    await client.auth.signOut();
    redirect('/login');
  }

  const name=profile?.full_name||user.email?.split('@')[0]||'Client';
  const openInvoices=(invoices||[]).filter(x=>x.status!=='paid').length;
  const openTickets=(tickets||[]).filter(x=>!['closed','resolved'].includes(x.status)).length;

  return <main className="portal shell">
    <header className="topbar">
      <div className="brand"><span className="mark">E</span><span>EDERITO PORTAL</span></div>
      <nav className="navlinks"><a href="#projects">Projects</a><a href="#contracts">Contracts</a><a href="#billing">Invoices</a><a href="#support">Support</a></nav>
      <form action={signOut}><button className="button secondary" type="submit">Sign out</button></form>
    </header>

    <section className="dashboard-head">
      <p className="eyebrow">Private client workspace</p>
      <h1>Welcome, {name}.</h1>
      <p className="lead">Track active work, review agreements, check billing and manage post-launch support.</p>
    </section>

    <section className="stats">
      <article className="stat"><span>Active projects</span><strong>{projects?.length||0}</strong></article>
      <article className="stat"><span>Contracts</span><strong>{contracts?.length||0}</strong></article>
      <article className="stat"><span>Open invoices</span><strong>{openInvoices}</strong></article>
      <article className="stat"><span>Open support tickets</span><strong>{openTickets}</strong></article>
    </section>

    <section className="grid">
      <div>
        <article className="panel" id="projects"><h2>Projects</h2>{projects?.length?<div>{projects.map(project=><div className="empty" style={{textAlign:'left',marginTop:10}} key={project.id}><strong>{project.name}</strong><div className="muted">Status: {project.status}{project.target_launch_date?` · Target ${project.target_launch_date}`:''}</div></div>)}</div>:<div className="empty">No active project yet. Approved client work will appear here.</div>}</article>
        <article className="panel" id="contracts" style={{marginTop:18}}><h2>Contracts</h2>{contracts?.length?<div>{contracts.map(contract=><div className="empty" style={{textAlign:'left',marginTop:10}} key={contract.id}><strong>{contract.title}</strong><div className="muted">{contract.contract_number} · {contract.status}</div></div>)}</div>:<div className="empty">No contract has been issued yet.</div>}</article>
      </div>
      <div>
        <article className="panel" id="billing"><h2>Invoices</h2>{invoices?.length?<div>{invoices.map(invoice=><div className="empty" style={{textAlign:'left',marginTop:10}} key={invoice.id}><strong>{invoice.invoice_number}</strong><div className="muted">${(invoice.total_cents/100).toFixed(2)} · {invoice.status}</div></div>)}</div>:<div className="empty">No invoices yet.</div>}</article>
        <article className="panel" id="support" style={{marginTop:18}}><h2>Support</h2>{tickets?.length?<div>{tickets.map(ticket=><div className="empty" style={{textAlign:'left',marginTop:10}} key={ticket.id}><strong>{ticket.subject}</strong><div className="muted">{ticket.priority} · {ticket.status}</div></div>)}</div>:<div className="empty">No support tickets. Ticket creation is the next portal milestone.</div>}</article>
      </div>
    </section>
  </main>;
}
