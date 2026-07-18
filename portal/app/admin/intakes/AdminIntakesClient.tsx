'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Submission = {
  id: string;
  client_id: string;
  request_number: string | null;
  status: string;
  responses: Record<string, unknown>;
  calculated_service_fee_cents: number;
  calculated_third_party_fees_cents: number;
  calculated_addons_cents: number;
  estimated_total_cents: number;
  quote_required: boolean;
  signed_name: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  review_summary: string | null;
  correction_message: string | null;
  reviewed_at: string | null;
  completed_at: string | null;
  service_packages: { id: string; name: string; slug: string } | null;
  client: { id: string; full_name: string | null; company_name: string | null; phone: string | null } | null;
};

type Props = { initialSubmissions: Submission[]; staffName: string };
const statuses = ['submitted', 'under_review', 'correction_required', 'approved', 'filed', 'completed', 'declined'];
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

function label(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export default function AdminIntakesClient({ initialSubmissions, staffName }: Props) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selectedId, setSelectedId] = useState(initialSubmissions[0]?.id || '');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const filtered = useMemo(() => submissions.filter((item) => {
    const matchesStatus = filter === 'all' || item.status === filter;
    const haystack = `${item.request_number || ''} ${item.client?.full_name || ''} ${item.client?.company_name || ''} ${item.service_packages?.name || ''}`.toLowerCase();
    return matchesStatus && haystack.includes(search.toLowerCase());
  }), [submissions, filter, search]);

  const selected = submissions.find((item) => item.id === selectedId) || filtered[0] || null;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const status = String(form.get('status') || selected.status);
    const reviewSummary = String(form.get('review_summary') || '').trim();
    const correctionMessage = String(form.get('correction_message') || '').trim();
    const now = new Date().toISOString();
    const supabase = createClient();
    const patch: Record<string, unknown> = {
      status,
      review_summary: reviewSummary || null,
      correction_message: correctionMessage || null,
      reviewed_at: ['under_review', 'correction_required', 'approved', 'declined'].includes(status) ? now : selected.reviewed_at,
      completed_at: status === 'completed' ? now : null,
      updated_at: now
    };
    const { error } = await supabase.from('intake_submissions').update(patch).eq('id', selected.id);
    if (error) setMessage(error.message);
    else {
      setSubmissions((current) => current.map((item) => item.id === selected.id ? { ...item, ...patch } as Submission : item));
      setMessage('Review saved.');
    }
    setBusy(false);
  }

  return (
    <main className="admin-intakes">
      <header className="admin-bar">
        <Link href="/dashboard" className="admin-brand">EDERITO <span>OPERATIONS</span></Link>
        <div><span>{staffName}</span><Link href="/dashboard">Client portal</Link></div>
      </header>

      <section className="admin-hero">
        <p>INTERNAL WORKSPACE</p>
        <h1>Intake review.</h1>
        <div className="admin-metrics">
          <article><span>New</span><strong>{submissions.filter((item) => item.status === 'submitted').length}</strong></article>
          <article><span>Under review</span><strong>{submissions.filter((item) => item.status === 'under_review').length}</strong></article>
          <article><span>Corrections</span><strong>{submissions.filter((item) => item.status === 'correction_required').length}</strong></article>
          <article><span>Total</span><strong>{submissions.length}</strong></article>
        </div>
      </section>

      <section className="admin-workspace">
        <aside className="intake-queue">
          <div className="queue-tools">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests" />
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
            </select>
          </div>
          <div className="queue-list">
            {filtered.map((item) => (
              <button key={item.id} className={item.id === selected?.id ? 'active' : ''} onClick={() => setSelectedId(item.id)}>
                <small>{item.request_number || item.id.slice(0, 8).toUpperCase()}</small>
                <strong>{item.client?.full_name || item.signed_name || 'Unnamed client'}</strong>
                <span>{item.service_packages?.name || 'Custom request'}</span>
                <em>{label(item.status)}</em>
              </button>
            ))}
            {!filtered.length && <p className="queue-empty">No requests match this view.</p>}
          </div>
        </aside>

        <section className="review-panel">
          {!selected ? <div className="review-empty">Select an intake request.</div> : (
            <>
              <div className="review-head">
                <div>
                  <p>{selected.request_number || 'INTAKE REQUEST'}</p>
                  <h2>{selected.client?.full_name || selected.signed_name || 'Unnamed client'}</h2>
                  <span>{selected.client?.company_name || selected.service_packages?.name || 'Ederito client'}</span>
                </div>
                <div className="review-total"><small>Estimated total</small><strong>{money(selected.estimated_total_cents)}</strong></div>
              </div>

              <div className="review-grid">
                <article><span>Service fee</span><strong>{money(selected.calculated_service_fee_cents)}</strong></article>
                <article><span>Third-party fees</span><strong>{money(selected.calculated_third_party_fees_cents)}</strong></article>
                <article><span>Submitted</span><strong>{new Date(selected.submitted_at || selected.created_at).toLocaleDateString()}</strong></article>
                <article><span>Quote required</span><strong>{selected.quote_required ? 'Yes' : 'No'}</strong></article>
              </div>

              <section className="response-section">
                <div className="response-title"><h3>Submitted information</h3><button type="button" onClick={() => window.print()}>Print summary</button></div>
                <div className="response-list">
                  {Object.entries(selected.responses || {}).map(([key, value]) => (
                    <div key={key}><span>{label(key)}</span><pre>{displayValue(value)}</pre></div>
                  ))}
                </div>
              </section>

              <form className="review-form" onSubmit={save}>
                <label><span>Status</span><select name="status" defaultValue={selected.status} key={`${selected.id}-status`}>{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></label>
                <label><span>Private review summary</span><textarea name="review_summary" defaultValue={selected.review_summary || ''} key={`${selected.id}-summary`} placeholder="Internal notes, filing checks, quote details, or next actions" /></label>
                <label><span>Message requesting corrections</span><textarea name="correction_message" defaultValue={selected.correction_message || ''} key={`${selected.id}-correction`} placeholder="Visible correction request to send to the client later" /></label>
                {message && <div className={message === 'Review saved.' ? 'admin-success' : 'admin-error'}>{message}</div>}
                <button disabled={busy}>{busy ? 'Saving…' : 'Save review'}</button>
              </form>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
