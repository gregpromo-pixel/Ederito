'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Package = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  base_price_cents: number;
  requires_quote: boolean;
  state_fee_separate: boolean;
  includes_first_year_domain: boolean;
  included_domain_allowance_cents: number;
  included_maintenance_months: number;
  included_infrastructure_months: number;
  included_infrastructure_allowance_cents: number;
  estimated_timeline_min_days: number | null;
  estimated_timeline_max_days: number | null;
  features: string[];
  exclusions: string[];
  is_featured: boolean;
  service_id: string;
};

type Service = { id: string; slug: string; name: string };
type StateFee = {
  state_code: string;
  standard_filing_fee_cents: number;
  annual_report_fee_cents: number;
  publication_required: boolean;
  publication_notes: string | null;
  official_source_url: string | null;
  last_verified_at: string | null;
};
type Props = { packages: Package[]; services: Service[]; stateFees: StateFee[] };
type Journey = 'website' | 'app' | 'business';

const journeys: Record<Journey, { number: string; eyebrow: string; title: string; text: string }> = {
  website: {
    number: '01',
    eyebrow: 'Web presence',
    title: 'Build a website',
    text: 'Choose a clear package for a landing page, business site, or a custom platform.'
  },
  app: {
    number: '02',
    eyebrow: 'Digital product',
    title: 'Build an app',
    text: 'Launch an iOS and Android product with branding, a web presence, and backend setup.'
  },
  business: {
    number: '03',
    eyebrow: 'Business formation',
    title: 'Start an LLC',
    text: 'Pay a transparent Ederito service fee plus the exact filing fee charged by your state.'
  }
};

const appFeatureChoices = [
  ['app_feature_accounts', 'Login and user accounts'],
  ['app_feature_profiles', 'User profiles'],
  ['app_feature_payments', 'Payments or subscriptions'],
  ['app_feature_notifications', 'Push notifications'],
  ['app_feature_chat', 'Messaging or chat'],
  ['app_feature_location', 'Maps or location'],
  ['app_feature_uploads', 'Photo or file uploads'],
  ['app_feature_admin', 'Admin dashboard']
] as const;

const websiteFeatureChoices = [
  ['web_feature_contact', 'Contact or quote form'],
  ['web_feature_booking', 'Booking'],
  ['web_feature_payments', 'Online payments'],
  ['web_feature_store', 'Online store'],
  ['web_feature_blog', 'Blog or news'],
  ['web_feature_multilingual', 'Multiple languages']
] as const;

const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

function timeline(item: Package) {
  const min = item.estimated_timeline_min_days;
  const max = item.estimated_timeline_max_days;
  if (!min && !max) return null;
  const minWeeks = Math.max(1, Math.ceil((min || max || 7) / 7));
  const maxWeeks = Math.max(minWeeks, Math.ceil((max || min || 7) / 7));
  return minWeeks === maxWeeks ? `${minWeeks} weeks` : `${minWeeks}-${maxWeeks} weeks`;
}

export default function StartProjectClient({ packages, services, stateFees }: Props) {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const selected = useMemo(() => packages.find((item) => item.id === selectedId), [packages, selectedId]);
  const service = services.find((item) => item.id === selected?.service_id);
  const selectedState = stateFees.find((item) => item.state_code === stateCode);
  const isWebsite = service?.slug === 'website-development';
  const isApp = service?.slug === 'mobile-app-development';
  const isLLC = service?.slug === 'business-formation';
  const isCustom = Boolean(selected?.requires_quote && selected.base_price_cents === 0);
  const governmentFee = isLLC ? selectedState?.standard_filing_fee_cents || 0 : 0;
  const estimatedTotal = (selected?.base_price_cents || 0) + governmentFee;

  const visiblePackages = packages.filter((item) => {
    const slug = services.find((serviceItem) => serviceItem.id === item.service_id)?.slug;
    if (journey === 'website') return slug === 'website-development';
    if (journey === 'app') return slug === 'mobile-app-development';
    if (journey === 'business') return slug === 'business-formation';
    return false;
  });

  function chooseJourney(next: Journey) {
    setJourney(next);
    setSelectedId('');
    setStateCode('');
    setMessage('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setMessage('Choose a package first.');
      return;
    }
    if (isLLC && !selectedState) {
      setMessage('Choose the state where the LLC will be formed.');
      return;
    }

    setBusy(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { error } = await supabase.from('intake_submissions').insert({
      client_id: user.id,
      service_package_id: selected.id,
      status: 'submitted',
      responses: Object.fromEntries(form.entries()),
      calculated_service_fee_cents: selected.base_price_cents,
      calculated_third_party_fees_cents: governmentFee,
      calculated_addons_cents: 0,
      estimated_total_cents: estimatedTotal,
      quote_required: isWebsite || isApp || selected.requires_quote,
      certified_accurate: true,
      signed_name: String(form.get('signed_name') || ''),
      signed_at: new Date().toISOString(),
      submitted_at: new Date().toISOString()
    });

    setMessage(error ? error.message : 'Your request was received. Ederito will review it and contact you with the next step.');
    setBusy(false);
  }

  return (
    <main className="shell portal intake-page">
      <header className="topbar intake-topbar">
        <div className="brand">
          <img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito logo" />
          <span>EDERITO</span>
        </div>
        <Link className="button secondary" href="/dashboard">
          Back to dashboard
        </Link>
      </header>

      <section className="intake-hero">
        <div>
          <p className="eyebrow">Project concierge</p>
          <h1>Start with the right plan.</h1>
          <p>Clear prices, focused questions, and a human review before any website or app project begins.</p>
        </div>
        <div className="hero-proof" aria-label="Ederito project benefits">
          <span>Transparent pricing</span>
          <span>Human scope review</span>
          <span>No forced subscription</span>
        </div>
      </section>

      <section className="journey-grid" aria-label="Choose a service path">
        {(Object.keys(journeys) as Journey[]).map((key) => {
          const item = journeys[key];
          return (
            <button
              type="button"
              key={key}
              onClick={() => chooseJourney(key)}
              className={`journey-card ${journey === key ? 'selected' : ''}`}
            >
              <div className="journey-number">{item.number}</div>
              <p className="eyebrow">{item.eyebrow}</p>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <span>{journey === key ? 'Selected' : 'View plans'} <b>+</b></span>
            </button>
          );
        })}
      </section>

      {journey && (
        <form className="project-form" onSubmit={submit}>
          <section className="intake-section package-section">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Choose one plan</p>
                <h2>{journeys[journey].title}</h2>
              </div>
              <p>Every plan has a defined scope. Anything beyond it receives a custom proposal before work starts.</p>
            </div>

            <div className="package-grid focused">
              {visiblePackages.map((item) => {
                const itemTimeline = timeline(item);
                const custom = item.requires_quote && item.base_price_cents === 0;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      setStateCode('');
                      setMessage('');
                    }}
                    className={`package-card ${selectedId === item.id ? 'selected' : ''}`}
                  >
                    <div className="package-topline">
                      <small>{item.is_featured ? 'Most popular' : custom ? 'Custom scope' : 'Fixed package'}</small>
                      <span className="radio-dot" aria-hidden="true" />
                    </div>
                    <h3>{item.name}</h3>
                    <div className="package-price">
                      {custom ? 'Custom proposal' : money(item.base_price_cents)}
                      {isLLC && !custom ? <small> Ederito fee + state fee</small> : null}
                    </div>
                    <p>{item.tagline || item.description}</p>
                    <ul>
                      {(item.features || []).slice(0, 6).map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <div className="package-meta">
                      {itemTimeline ? <span>{itemTimeline}</span> : <span>Reviewed after submission</span>}
                      <strong>{selectedId === item.id ? 'Plan selected' : 'Choose plan'}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {selected && (
            <div className="intake-workspace">
              <div className="intake-main">
                <section className="intake-section form-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">A few essentials</p>
                      <h2>Tell us what you need.</h2>
                    </div>
                    <span className="step-pill">About 3 minutes</span>
                  </div>

                  {isLLC && (
                    <div className="form-grid">
                      <label className="field">
                        <span>Formation state</span>
                        <select name="formation_state" value={stateCode} onChange={(event: ChangeEvent<HTMLSelectElement>) => setStateCode(event.target.value)} required>
                          <option value="">Select state</option>
                          {stateFees.map((item) => (
                            <option key={item.state_code} value={item.state_code}>{item.state_code}</option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        <span>Ownership</span>
                        <select name="ownership_type" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>One owner</option>
                          <option>Two or more owners</option>
                          <option>Not sure</option>
                        </select>
                      </label>
                      <label className="field full">
                        <span>Preferred LLC name</span>
                        <input name="preferred_name_1" placeholder="First choice" required />
                      </label>
                      <label className="field">
                        <span>Second name choice</span>
                        <input name="preferred_name_2" placeholder="Optional" />
                      </label>
                      <label className="field">
                        <span>Third name choice</span>
                        <input name="preferred_name_3" placeholder="Optional" />
                      </label>
                      <label className="field full">
                        <span>What will the business do?</span>
                        <textarea name="business_description" placeholder="Describe the main product or service in a few sentences." required />
                      </label>
                      <label className="field full">
                        <span>Principal business address</span>
                        <textarea name="principal_address" placeholder="Street, city, state and ZIP code" required />
                      </label>
                      <label className="field">
                        <span>Registered agent</span>
                        <select name="registered_agent_choice" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>I will be my own registered agent</option>
                          <option>I already have a registered agent</option>
                          <option>I need help finding a provider</option>
                        </select>
                      </label>
                      {selected.slug === 'llc-ein-assistance' && (
                        <label className="field">
                          <span>EIN responsible party</span>
                          <select name="responsible_party_tax_id_status" required defaultValue="">
                            <option value="" disabled>Select one</option>
                            <option>Has an SSN or ITIN</option>
                            <option>Does not have an SSN or ITIN</option>
                            <option>Needs guidance</option>
                          </select>
                          <small>Do not enter an SSN or ITIN in this form.</small>
                        </label>
                      )}
                    </div>
                  )}

                  {isWebsite && (
                    <div className="form-grid">
                      <label className="field">
                        <span>Business or project name</span>
                        <input name="business_name" required />
                      </label>
                      <label className="field">
                        <span>Main website goal</span>
                        <select name="website_goal" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>Generate leads</option>
                          <option>Showcase services or work</option>
                          <option>Accept bookings</option>
                          <option>Sell products</option>
                          <option>Share information or news</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Domain status</span>
                        <select name="domain_status" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>I need a domain</option>
                          <option>I already own a domain</option>
                          <option>I want to transfer a domain</option>
                          <option>Not sure</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Content and logo</span>
                        <select name="content_status" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>Everything is ready</option>
                          <option>Partly ready</option>
                          <option>I need help creating it</option>
                        </select>
                      </label>
                      <fieldset className="choice-field full">
                        <legend>Features you need</legend>
                        <div className="choice-grid">
                          {websiteFeatureChoices.map(([name, label]) => (
                            <label key={name}><input type="checkbox" name={name} value="yes" /><span>{label}</span></label>
                          ))}
                        </div>
                      </fieldset>
                      <label className="field">
                        <span>Preferred launch date</span>
                        <input name="preferred_launch" type="date" />
                      </label>
                      {isCustom && (
                        <label className="field">
                          <span>Expected budget</span>
                          <select name="budget" required defaultValue="">
                            <option value="" disabled>Select one</option>
                            <option>$500-$1,000</option>
                            <option>$1,000-$2,500</option>
                            <option>$2,500-$5,000</option>
                            <option>$5,000+</option>
                          </select>
                        </label>
                      )}
                      <label className="field full">
                        <span>Anything important we should know?</span>
                        <textarea name="project_description" placeholder="Describe the pages, style, examples, or special functions you have in mind." required />
                      </label>
                    </div>
                  )}

                  {isApp && (
                    <div className="form-grid">
                      <label className="field">
                        <span>App or business name</span>
                        <input name="app_name" required />
                      </label>
                      <label className="field">
                        <span>Platforms</span>
                        <select name="app_platforms" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>iOS and Android</option>
                          <option>iOS first</option>
                          <option>Android first</option>
                          <option>Mobile app plus web dashboard</option>
                        </select>
                      </label>
                      <label className="field full">
                        <span>What problem will the app solve?</span>
                        <textarea name="app_purpose" placeholder="Explain the app in plain language and who will use it." required />
                      </label>
                      <fieldset className="choice-field full">
                        <legend>Must-have features</legend>
                        <div className="choice-grid">
                          {appFeatureChoices.map(([name, label]) => (
                            <label key={name}><input type="checkbox" name={name} value="yes" /><span>{label}</span></label>
                          ))}
                        </div>
                      </fieldset>
                      <label className="field">
                        <span>Revenue model</span>
                        <select name="revenue_model" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>Free app</option>
                          <option>Subscriptions</option>
                          <option>One-time purchases</option>
                          <option>Marketplace commission</option>
                          <option>Not decided</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Existing brand identity</span>
                        <select name="branding_status" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>I already have a logo and brand</option>
                          <option>I need the included starter app branding</option>
                          <option>I need a complete custom brand system</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Apple developer account</span>
                        <select name="apple_account" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>Already active</option>
                          <option>Need help enrolling</option>
                          <option>Not ready yet</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Google Play account</span>
                        <select name="google_account" required defaultValue="">
                          <option value="" disabled>Select one</option>
                          <option>Already active</option>
                          <option>Need help enrolling</option>
                          <option>Not ready yet</option>
                        </select>
                      </label>
                      <label className="field full">
                        <span>What information will users submit?</span>
                        <textarea name="data_collected" placeholder="Examples: names, emails, photos, messages, payments, location, health or financial information." required />
                      </label>
                      <label className="field">
                        <span>Preferred launch date</span>
                        <input name="preferred_launch" type="date" />
                      </label>
                      {isCustom && (
                        <label className="field">
                          <span>Expected budget</span>
                          <select name="budget" required defaultValue="">
                            <option value="" disabled>Select one</option>
                            <option>$2,500-$5,000</option>
                            <option>$5,000-$10,000</option>
                            <option>$10,000+</option>
                          </select>
                        </label>
                      )}
                    </div>
                  )}
                </section>

                <section className="intake-section contact-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Contact and review</p>
                      <h2>Where should we reach you?</h2>
                    </div>
                  </div>
                  <div className="form-grid">
                    <label className="field">
                      <span>Full legal name</span>
                      <input name="signed_name" autoComplete="name" required />
                    </label>
                    <label className="field">
                      <span>Best phone number</span>
                      <input name="phone" type="tel" autoComplete="tel" required />
                    </label>
                    <label className="field">
                      <span>Email</span>
                      <input name="contact_email" type="email" autoComplete="email" required />
                    </label>
                    <label className="field">
                      <span>Preferred contact</span>
                      <select name="preferred_contact" required defaultValue="">
                        <option value="" disabled>Select one</option>
                        <option>Email</option>
                        <option>Phone call</option>
                        <option>Text message</option>
                        <option>WhatsApp</option>
                      </select>
                    </label>
                    <label className="check-row full">
                      <input type="checkbox" required />
                      <span>I confirm this information is accurate and understand that Ederito will review the request before filing an LLC or issuing a website or app contract.</span>
                    </label>
                  </div>

                  {message && <div className={`notice ${message.includes('received') ? 'success' : 'error'}`}>{message}</div>}
                  <button className="button submit-button" disabled={busy}>
                    {busy ? 'Sending request...' : isLLC ? 'Continue with this LLC plan' : 'Request project review'}
                  </button>
                </section>
              </div>

              <aside className="project-summary">
                <div className="summary-card">
                  <p className="eyebrow">Your selection</p>
                  <h3>{selected.name}</h3>
                  <p>{selected.tagline || selected.description}</p>

                  <div className="summary-price">
                    <span>{isCustom ? 'Custom proposal' : money(selected.base_price_cents)}</span>
                    {!isCustom && <small>{isLLC ? 'Ederito service fee' : 'Starting project price'}</small>}
                  </div>

                  {isLLC && (
                    <div className="llc-estimate">
                      <div><span>State filing fee</span><strong>{selectedState ? money(governmentFee) : 'Select state'}</strong></div>
                      <div className="estimate-total"><span>Estimated total</span><strong>{selectedState ? money(estimatedTotal) : '--'}</strong></div>
                    </div>
                  )}

                  <div className="summary-list">
                    {(selected.features || []).map((feature) => <span key={feature}>{feature}</span>)}
                  </div>

                  {isApp && (
                    <div className="cost-note">
                      <strong>Third-party costs</strong>
                      <p>Apple Developer Program: $99/year. Google Play full distribution: $25 one time. Supabase can start free; production Pro pricing starts at $25/month. The selected app plan includes two months of standard database allowance, up to $50 total.</p>
                    </div>
                  )}

                  {isWebsite && (
                    <div className="cost-note">
                      <strong>Before work begins</strong>
                      <p>Ederito reviews your exact pages and functions, then sends a proposal and contract. Premium domains, paid plugins, e-commerce fees, and services outside the package are separate.</p>
                    </div>
                  )}

                  {isLLC && (
                    <div className="cost-note">
                      <strong>Transparent LLC pricing</strong>
                      <p>The state filing fee is separate. EINs are issued free by the IRS; the $50 package pays Ederito for preparation and assistance. Registered-agent providers, publication, licenses, annual reports, legal advice, and tax advice are not included.</p>
                      {selectedState?.publication_required && <p className="warning">This state has a publication requirement. Publication costs are separate.</p>}
                      {selectedState?.publication_notes && <p className="warning">{selectedState.publication_notes}</p>}
                    </div>
                  )}

                  <p className="summary-disclaimer">No store, state, banking, tax, name-availability, approval, or processing-time result is guaranteed.</p>
                </div>
              </aside>
            </div>
          )}
        </form>
      )}
    </main>
  );
}
