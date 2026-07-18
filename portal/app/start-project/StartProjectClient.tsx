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
type ChoiceSetter = React.Dispatch<React.SetStateAction<Set<string>>>;

const journeys: Record<Journey, { number: string; eyebrow: string; title: string; text: string }> = {
  website: {
    number: '01',
    eyebrow: 'Web presence',
    title: 'Build a website',
    text: 'Answer only the questions needed to define your pages, content, domain, and required functions.'
  },
  app: {
    number: '02',
    eyebrow: 'Digital product',
    title: 'Build an app',
    text: 'Define the audience, unique value, core features, data, monetization, and store requirements.'
  },
  business: {
    number: '03',
    eyebrow: 'Business formation',
    title: 'Start an LLC',
    text: 'Provide the formation information required by your state, with EIN questions shown only when selected.'
  }
};

const websiteFeatureChoices = [
  ['contact', 'Contact or quote form'],
  ['booking', 'Booking or appointments'],
  ['payments', 'Online payments'],
  ['store', 'Online store'],
  ['blog', 'Blog or news'],
  ['multilingual', 'Multiple languages'],
  ['member-login', 'Customer or member login'],
  ['integrations', 'External integrations']
] as const;

const appFeatureChoices = [
  ['accounts', 'Login and user accounts'],
  ['profiles', 'User profiles'],
  ['payments', 'Payments or subscriptions'],
  ['notifications', 'Push notifications'],
  ['chat', 'Messaging or chat'],
  ['location', 'Maps or location'],
  ['uploads', 'Photo, video, or file uploads'],
  ['public-content', 'Posts, comments, reviews, or public content'],
  ['admin', 'Admin dashboard'],
  ['ai', 'AI-generated content or an AI assistant']
] as const;

const pageChoices = [
  ['home', 'Home'],
  ['about', 'About'],
  ['services', 'Services'],
  ['portfolio', 'Portfolio or gallery'],
  ['contact', 'Contact'],
  ['booking', 'Booking'],
  ['shop', 'Shop'],
  ['blog', 'Blog or news']
] as const;

const loginChoices = [
  ['email-password', 'Email and password'],
  ['phone', 'Phone number'],
  ['apple', 'Sign in with Apple'],
  ['google', 'Sign in with Google'],
  ['magic-link', 'Email magic link']
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

function ChoiceGrid({
  legend,
  choices,
  selected,
  setSelected
}: {
  legend: string;
  choices: readonly (readonly [string, string])[];
  selected: Set<string>;
  setSelected: ChoiceSetter;
}) {
  function toggle(value: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  return (
    <fieldset className="choice-field full">
      <legend>{legend}</legend>
      <div className="choice-grid">
        {choices.map(([value, label]) => (
          <label key={value} className={selected.has(value) ? 'choice-selected' : ''}>
            <input
              type="checkbox"
              name={`${legend.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${value}`}
              value="yes"
              checked={selected.has(value)}
              onChange={() => toggle(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function StartProjectClient({ packages, services, stateFees }: Props) {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const [ownershipType, setOwnershipType] = useState('');
  const [mailingDifferent, setMailingDifferent] = useState(false);
  const [registeredAgentChoice, setRegisteredAgentChoice] = useState('');
  const [managementType, setManagementType] = useState('');
  const [outsideManager, setOutsideManager] = useState('');
  const [organizerChoice, setOrganizerChoice] = useState('ederito');
  const [effectiveTiming, setEffectiveTiming] = useState('immediate');
  const [professionalService, setProfessionalService] = useState('no');
  const [einTradeNameDifferent, setEinTradeNameDifferent] = useState(false);
  const [einEmployees, setEinEmployees] = useState('no');
  const [einAccountingYear, setEinAccountingYear] = useState('december');
  const [einPrior, setEinPrior] = useState('no');

  const [websiteProjectType, setWebsiteProjectType] = useState('new');
  const [websiteDomainStatus, setWebsiteDomainStatus] = useState('');
  const [websiteContentStatus, setWebsiteContentStatus] = useState('');
  const [websiteDeadline, setWebsiteDeadline] = useState('no');
  const [websiteFeatures, setWebsiteFeatures] = useState<Set<string>>(new Set());
  const [websitePages, setWebsitePages] = useState<Set<string>>(new Set());

  const [appPlatforms, setAppPlatforms] = useState('');
  const [appFeatures, setAppFeatures] = useState<Set<string>>(new Set());
  const [appLoginMethods, setAppLoginMethods] = useState<Set<string>>(new Set());
  const [appRevenueModel, setAppRevenueModel] = useState('');
  const [appAgeGroup, setAppAgeGroup] = useState('adults');
  const [appSensitiveData, setAppSensitiveData] = useState('none');
  const [appDeadline, setAppDeadline] = useState('no');
  const [appleAccountStatus, setAppleAccountStatus] = useState('');
  const [googleAccountStatus, setGoogleAccountStatus] = useState('');
  const [developerAccountType, setDeveloperAccountType] = useState('');

  const selected = useMemo(() => packages.find((item) => item.id === selectedId), [packages, selectedId]);
  const service = services.find((item) => item.id === selected?.service_id);
  const selectedState = stateFees.find((item) => item.state_code === stateCode);
  const isWebsite = service?.slug === 'website-development';
  const isApp = service?.slug === 'mobile-app-development';
  const isLLC = service?.slug === 'business-formation';
  const isEinPackage = selected?.slug === 'llc-ein-assistance';
  const isCustom = Boolean(selected?.requires_quote && selected.base_price_cents === 0);
  const governmentFee = isLLC ? selectedState?.standard_filing_fee_cents || 0 : 0;
  const estimatedTotal = (selected?.base_price_cents || 0) + governmentFee;

  const isArkansas = stateCode === 'AR';
  const isFlorida = stateCode === 'FL';
  const isTexas = stateCode === 'TX';
  const isDelaware = stateCode === 'DE';

  const appHasAccounts = appFeatures.has('accounts');
  const appHasUGC = appFeatures.has('chat') || appFeatures.has('uploads') || appFeatures.has('public-content');
  const appHasPayments = appFeatures.has('payments') || ['subscriptions', 'digital-purchases', 'marketplace'].includes(appRevenueModel);
  const appHasLocation = appFeatures.has('location');
  const appHasAI = appFeatures.has('ai');
  const appIncludesIOS = ['ios-android', 'ios-first', 'mobile-web'].includes(appPlatforms);
  const appIncludesAndroid = ['ios-android', 'android-first', 'mobile-web'].includes(appPlatforms);
  const needsDeveloperEnrollment = appleAccountStatus === 'need-enrollment' || googleAccountStatus === 'need-enrollment';

  const visiblePackages = packages.filter((item) => {
    const slug = services.find((serviceItem) => serviceItem.id === item.service_id)?.slug;
    if (journey === 'website') return slug === 'website-development';
    if (journey === 'app') return slug === 'mobile-app-development';
    if (journey === 'business') return slug === 'business-formation';
    return false;
  });

  function resetConditionalAnswers() {
    setOwnershipType('');
    setMailingDifferent(false);
    setRegisteredAgentChoice('');
    setManagementType('');
    setOutsideManager('');
    setOrganizerChoice('ederito');
    setEffectiveTiming('immediate');
    setProfessionalService('no');
    setEinTradeNameDifferent(false);
    setEinEmployees('no');
    setEinAccountingYear('december');
    setEinPrior('no');
    setWebsiteProjectType('new');
    setWebsiteDomainStatus('');
    setWebsiteContentStatus('');
    setWebsiteDeadline('no');
    setWebsiteFeatures(new Set());
    setWebsitePages(new Set());
    setAppPlatforms('');
    setAppFeatures(new Set());
    setAppLoginMethods(new Set());
    setAppRevenueModel('');
    setAppAgeGroup('adults');
    setAppSensitiveData('none');
    setAppDeadline('no');
    setAppleAccountStatus('');
    setGoogleAccountStatus('');
    setDeveloperAccountType('');
  }

  function chooseJourney(next: Journey) {
    setJourney(next);
    setSelectedId('');
    setStateCode('');
    setMessage('');
    resetConditionalAnswers();
  }

  function choosePackage(id: string) {
    setSelectedId(id);
    setStateCode('');
    setMessage('');
    resetConditionalAnswers();
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
        <Link className="button secondary" href="/dashboard">Back to dashboard</Link>
      </header>

      <section className="intake-hero">
        <div>
          <p className="eyebrow">Project concierge</p>
          <h1>Start with the right plan.</h1>
          <p>The form changes with your selections, so you answer only what Ederito needs to review, quote, file, or build your project.</p>
        </div>
        <div className="hero-proof" aria-label="Ederito project benefits">
          <span>Questions matched to your service</span>
          <span>Transparent third-party costs</span>
          <span>Human review before work begins</span>
        </div>
      </section>

      <section className="journey-grid" aria-label="Choose a service path">
        {(Object.keys(journeys) as Journey[]).map((key) => {
          const item = journeys[key];
          return (
            <button type="button" key={key} onClick={() => chooseJourney(key)} className={`journey-card ${journey === key ? 'selected' : ''}`}>
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
              <div><p className="eyebrow">Choose one plan</p><h2>{journeys[journey].title}</h2></div>
              <p>Each plan has a defined scope. Ederito confirms the final scope, exclusions, timeline, and any optional costs before work begins.</p>
            </div>

            <div className="package-grid focused">
              {visiblePackages.map((item) => {
                const itemTimeline = timeline(item);
                const custom = item.requires_quote && item.base_price_cents === 0;
                return (
                  <button type="button" key={item.id} onClick={() => choosePackage(item.id)} className={`package-card ${selectedId === item.id ? 'selected' : ''}`}>
                    <div className="package-topline"><small>{item.is_featured ? 'Most popular' : custom ? 'Custom scope' : 'Defined package'}</small><span className="radio-dot" aria-hidden="true" /></div>
                    <h3>{item.name}</h3>
                    <div className="package-price">
                      {custom ? 'Custom proposal' : money(item.base_price_cents)}
                      {services.find((serviceItem) => serviceItem.id === item.service_id)?.slug === 'business-formation' && !custom ? <small>Ederito fee + state fee</small> : null}
                    </div>
                    <p>{item.tagline || item.description}</p>
                    <ul>{(item.features || []).slice(0, 6).map((feature) => <li key={feature}>{feature}</li>)}</ul>
                    <div className="package-meta"><span>{itemTimeline || 'Reviewed after submission'}</span><strong>{selectedId === item.id ? 'Plan selected' : 'Choose plan'}</strong></div>
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
                    <div><p className="eyebrow">Required information</p><h2>{isLLC ? 'Prepare the filing.' : isWebsite ? 'Define the website.' : 'Define the product.'}</h2></div>
                    <span className="step-pill">Conditional form</span>
                  </div>

                  {isLLC && (
                    <div className="conditional-form">
                      <div className="question-group">
                        <div className="question-group-head"><span>01</span><div><h3>Formation details</h3><p>Core information used to prepare the state formation document.</p></div></div>
                        <div className="form-grid">
                          <label className="field">
                            <span>Formation state</span>
                            <select name="formation_state" value={stateCode} onChange={(event: ChangeEvent<HTMLSelectElement>) => setStateCode(event.target.value)} required>
                              <option value="">Select state</option>
                              {stateFees.map((item) => <option key={item.state_code} value={item.state_code}>{item.state_code}</option>)}
                            </select>
                          </label>
                          <label className="field">
                            <span>Number of owners</span>
                            <select name="ownership_type" value={ownershipType} onChange={(event) => setOwnershipType(event.target.value)} required>
                              <option value="">Select one</option>
                              <option value="single">One owner</option>
                              <option value="multiple">Two or more owners</option>
                            </select>
                          </label>
                          <label className="field full"><span>Preferred legal LLC name</span><input name="preferred_name_1" placeholder="Include LLC, L.L.C., or the state-approved ending" required /></label>
                          <label className="field"><span>Second name choice</span><input name="preferred_name_2" placeholder="Optional" /></label>
                          <label className="field"><span>Third name choice</span><input name="preferred_name_3" placeholder="Optional" /></label>
                          <label className="field full"><span>Principal office street address</span><textarea name="principal_address" placeholder="Street, city, state, ZIP code, and country if outside the United States" required /></label>
                          <label className="switch-field full"><input type="checkbox" name="mailing_address_different" checked={mailingDifferent} onChange={(event) => setMailingDifferent(event.target.checked)} /><span>The mailing address is different from the principal office.</span></label>
                          {mailingDifferent && <label className="field full conditional-block"><span>Mailing address</span><textarea name="mailing_address" required /></label>}
                          <label className="field full"><span>Specific business purpose or activity</span><textarea name="business_description" placeholder="Describe the main product or service. Avoid vague answers such as only 'any lawful activity.'" required /></label>
                        </div>
                      </div>

                      <div className="question-group">
                        <div className="question-group-head"><span>02</span><div><h3>Registered agent</h3><p>The agent must meet the physical-address rules of the formation state and consent to the appointment.</p></div></div>
                        <div className="form-grid">
                          <label className="field full">
                            <span>Who will serve as registered agent?</span>
                            <select name="registered_agent_choice" value={registeredAgentChoice} onChange={(event) => setRegisteredAgentChoice(event.target.value)} required>
                              <option value="">Select one</option>
                              <option value="self">I will serve as registered agent</option>
                              <option value="existing">I already have a registered agent</option>
                              <option value="provider">I need help finding a registered-agent provider</option>
                            </select>
                          </label>
                          {(registeredAgentChoice === 'self' || registeredAgentChoice === 'existing') && (
                            <>
                              <label className="field"><span>Registered-agent legal name</span><input name="registered_agent_name" required /></label>
                              <label className="field"><span>Agent type</span><select name="registered_agent_type" required><option value="individual">Individual</option><option value="business">Registered business</option></select></label>
                              <label className="field full"><span>Registered-agent physical street address in {stateCode || 'the formation state'}</span><textarea name="registered_agent_address" required /></label>
                              <label className="check-row full"><input type="checkbox" name="registered_agent_consent" required /><span>I confirm that the registered agent has agreed to serve and that the address is a valid physical street address.</span></label>
                            </>
                          )}
                          {registeredAgentChoice === 'provider' && <div className="inline-note full">Ederito will contact you with available provider options and their separate annual fee before filing.</div>}
                          {isDelaware && <div className="inline-note full">Delaware requires a registered office and registered agent located in Delaware.</div>}
                        </div>
                      </div>

                      {ownershipType && (
                        <div className="question-group">
                          <div className="question-group-head"><span>03</span><div><h3>Owners and management</h3><p>Only the ownership and management information needed for this structure is displayed.</p></div></div>
                          <div className="form-grid">
                            {ownershipType === 'single' ? (
                              <>
                                <label className="field"><span>Owner's full legal name</span><input name="single_owner_name" required /></label>
                                <label className="field"><span>Will a non-owner manage the LLC?</span><select name="outside_manager" value={outsideManager} onChange={(event) => setOutsideManager(event.target.value)} required><option value="">Select one</option><option value="no">No, the owner will manage it</option><option value="yes">Yes</option></select></label>
                                <label className="field full"><span>Owner's residential or business address</span><textarea name="single_owner_address" required /></label>
                                {outsideManager === 'yes' && <label className="field full conditional-block"><span>Manager's legal name and address</span><textarea name="outside_manager_details" required /></label>}
                              </>
                            ) : (
                              <>
                                <label className="field"><span>Management structure</span><select name="management_structure" value={managementType} onChange={(event) => setManagementType(event.target.value)} required><option value="">Select one</option><option value="member-managed">Member-managed</option><option value="manager-managed">Manager-managed</option></select></label>
                                <label className="field"><span>Number of owners</span><input name="member_count" type="number" min="2" required /></label>
                                <label className="field full"><span>Each owner's legal name, address, and ownership percentage</span><textarea name="members" placeholder="One owner per line" required /></label>
                                {managementType === 'manager-managed' && <label className="field full conditional-block"><span>Each manager's legal name and address</span><textarea name="manager_details" required /></label>}
                              </>
                            )}

                            <label className="field">
                              <span>Organizer</span>
                              <select name="organizer_choice" value={organizerChoice} onChange={(event) => setOrganizerChoice(event.target.value)} required>
                                <option value="ederito">Authorize Ederito or its filing representative</option>
                                <option value="other">Another organizer</option>
                              </select>
                            </label>
                            {organizerChoice === 'other' && <label className="field conditional-block"><span>Organizer's legal name</span><input name="organizer_name" required /></label>}

                            {isArkansas && <label className="field full conditional-block"><span>Arkansas franchise-tax officer: at least one member or manager's name and address</span><textarea name="arkansas_franchise_officer" required /></label>}
                            {isTexas && (
                              <>
                                <label className="field conditional-block"><span>Texas governing authority</span><select name="texas_governing_authority" required><option value="members">Members</option><option value="managers">Managers</option></select></label>
                                <label className="field full conditional-block"><span>Initial governing persons and addresses</span><textarea name="texas_governing_people" required /></label>
                              </>
                            )}
                            {isFlorida && (
                              <>
                                <label className="field conditional-block"><span>Is this a licensed professional LLC?</span><select name="professional_service" value={professionalService} onChange={(event) => setProfessionalService(event.target.value)} required><option value="no">No</option><option value="yes">Yes</option></select></label>
                                {professionalService === 'yes' && <label className="field full conditional-block"><span>Licensed profession and Florida license details</span><textarea name="professional_license_details" required /></label>}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="question-group">
                        <div className="question-group-head"><span>{isEinPackage ? '04' : '04'}</span><div><h3>Effective date</h3><p>Choose immediate filing unless a future effective date is genuinely needed.</p></div></div>
                        <div className="form-grid">
                          <label className="field"><span>When should the LLC become effective?</span><select name="effective_timing" value={effectiveTiming} onChange={(event) => setEffectiveTiming(event.target.value)} required><option value="immediate">When accepted by the state</option><option value="future">A future date, if permitted</option></select></label>
                          {effectiveTiming === 'future' && <label className="field conditional-block"><span>Requested effective date</span><input name="requested_effective_date" type="date" required /></label>}
                        </div>
                      </div>

                      {isEinPackage && (
                        <div className="question-group ein-group">
                          <div className="question-group-head"><span>05</span><div><h3>EIN information</h3><p>These questions appear only because you selected LLC + EIN Assistance. Never enter a full SSN or ITIN in this form.</p></div></div>
                          <div className="form-grid">
                            <label className="switch-field full"><input type="checkbox" name="trade_name_different" checked={einTradeNameDifferent} onChange={(event) => setEinTradeNameDifferent(event.target.checked)} /><span>The business will use a trade name or DBA different from its legal LLC name.</span></label>
                            {einTradeNameDifferent && <label className="field full conditional-block"><span>Trade name or DBA</span><input name="trade_name" required /></label>}
                            <label className="field"><span>Responsible party's full legal name</span><input name="ein_responsible_party_name" required /></label>
                            <label className="field"><span>Responsible party's tax-ID status</span><select name="responsible_party_tax_id_status" required><option value="">Select one</option><option value="has-ssn">Has an SSN</option><option value="has-itin">Has an ITIN</option><option value="no-tin">Does not have an SSN or ITIN</option><option value="guidance">Needs guidance</option></select><small>The number itself will be collected later through a secure process when required.</small></label>
                            <label className="field"><span>Reason for applying for an EIN</span><select name="ein_reason" required><option value="new-business">Started a new business</option><option value="banking">Banking purpose</option><option value="employees">Hired employees</option><option value="changed-entity">Changed organization type</option><option value="purchased-business">Purchased an active business</option><option value="other">Other</option></select></label>
                            <label className="field"><span>Business start or acquisition date</span><input name="business_start_date" type="date" required /></label>
                            <label className="field"><span>Accounting-year closing month</span><select name="accounting_year" value={einAccountingYear} onChange={(event) => setEinAccountingYear(event.target.value)} required><option value="december">December</option><option value="other">Another month</option></select></label>
                            {einAccountingYear === 'other' && <label className="field conditional-block"><span>Closing month</span><select name="accounting_close_month" required>{['January','February','March','April','May','June','July','August','September','October','November'].map((month) => <option key={month}>{month}</option>)}</select></label>}
                            <label className="field"><span>Will the business have employees in the next 12 months?</span><select name="expected_employees" value={einEmployees} onChange={(event) => setEinEmployees(event.target.value)} required><option value="no">No</option><option value="yes">Yes</option></select></label>
                            {einEmployees === 'yes' && (
                              <>
                                <label className="field conditional-block"><span>Expected agricultural employees</span><input name="agricultural_employees" type="number" min="0" required /></label>
                                <label className="field conditional-block"><span>Expected household employees</span><input name="household_employees" type="number" min="0" required /></label>
                                <label className="field conditional-block"><span>Expected other employees</span><input name="other_employees" type="number" min="0" required /></label>
                                <label className="field conditional-block"><span>First expected wage-payment date</span><input name="first_wage_date" type="date" required /></label>
                              </>
                            )}
                            <label className="field"><span>Principal activity category</span><select name="principal_activity" required><option value="">Select one</option><option>Accommodation or food service</option><option>Construction</option><option>Finance or insurance</option><option>Healthcare or social assistance</option><option>Manufacturing</option><option>Real estate</option><option>Rental or leasing</option><option>Retail</option><option>Transportation or warehousing</option><option>Wholesale</option><option>Professional or other service</option></select></label>
                            <label className="field"><span>Specific product, service, or work performed</span><input name="specific_activity" required /></label>
                            <label className="field"><span>Has this business or owner previously received an EIN for this entity?</span><select name="prior_ein" value={einPrior} onChange={(event) => setEinPrior(event.target.value)} required><option value="no">No</option><option value="yes">Yes</option><option value="not-sure">Not sure</option></select></label>
                            {einPrior !== 'no' && <div className="inline-note conditional-block">Ederito will request any previous EIN through a secure follow-up. Do not enter it here.</div>}
                            <label className="field"><span>Authorize Ederito as third-party designee for EIN questions?</span><select name="third_party_designee" required><option value="yes">Yes</option><option value="no">No</option></select></label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isWebsite && (
                    <div className="conditional-form">
                      <div className="question-group">
                        <div className="question-group-head"><span>01</span><div><h3>Business and audience</h3><p>Enough context to design the right structure without a long generic questionnaire.</p></div></div>
                        <div className="form-grid">
                          <label className="field"><span>Business or project name</span><input name="business_name" required /></label>
                          <label className="field"><span>New website or redesign?</span><select name="website_project_type" value={websiteProjectType} onChange={(event) => setWebsiteProjectType(event.target.value)} required><option value="new">New website</option><option value="redesign">Redesign an existing website</option></select></label>
                          {websiteProjectType === 'redesign' && <label className="field full conditional-block"><span>Current website URL</span><input name="current_website_url" type="url" placeholder="https://" required /></label>}
                          <label className="field"><span>Primary goal</span><select name="website_goal" required><option value="">Select one</option><option value="leads">Generate leads or quote requests</option><option value="credibility">Build credibility and explain services</option><option value="portfolio">Showcase work or a portfolio</option><option value="booking">Accept bookings or appointments</option><option value="commerce">Sell products or services</option><option value="content">Publish information, articles, or news</option></select></label>
                          <label className="field"><span>Primary target audience</span><input name="target_audience" placeholder="Who should the website attract?" required /></label>
                          <label className="field full"><span>What makes this business different?</span><textarea name="business_differentiator" placeholder="The strongest reason a customer should choose this business" required /></label>
                        </div>
                      </div>

                      <div className="question-group">
                        <div className="question-group-head"><span>02</span><div><h3>Pages and functions</h3><p>The package sets the page limit. Choose only the pages and functions you actually need.</p></div></div>
                        <div className="form-grid">
                          {selected.slug !== 'landing-page' ? (
                            <ChoiceGrid legend="Pages needed" choices={pageChoices} selected={websitePages} setSelected={setWebsitePages} />
                          ) : (
                            <label className="field full"><span>Main action visitors should take</span><input name="landing_page_call_to_action" placeholder="Book, call, register, buy, request a quote..." required /></label>
                          )}
                          <ChoiceGrid legend="Website features" choices={websiteFeatureChoices} selected={websiteFeatures} setSelected={setWebsiteFeatures} />

                          {websiteFeatures.has('booking') && <label className="field full conditional-block"><span>Booking requirements</span><textarea name="booking_requirements" placeholder="Services, durations, staff, locations, deposits, or an existing booking platform" required /></label>}
                          {(websiteFeatures.has('payments') || websiteFeatures.has('store')) && (
                            <>
                              <label className="field conditional-block"><span>What will be sold?</span><select name="commerce_type" required><option value="physical">Physical products</option><option value="digital">Digital products</option><option value="services">Services</option><option value="mixed">A mix</option></select></label>
                              <label className="field conditional-block"><span>Approximate number of products or services</span><input name="commerce_item_count" type="number" min="1" required /></label>
                              <label className="field full conditional-block"><span>Existing payment or commerce platform</span><input name="commerce_platform" placeholder="Stripe, Square, Shopify, none, or not sure" required /></label>
                            </>
                          )}
                          {websiteFeatures.has('multilingual') && <label className="field full conditional-block"><span>Required languages</span><input name="website_languages" placeholder="English, French, Haitian Creole..." required /></label>}
                          {websiteFeatures.has('member-login') && <label className="field full conditional-block"><span>Who needs an account, and what should they access after signing in?</span><textarea name="member_portal_requirements" required /></label>}
                          {websiteFeatures.has('blog') && <label className="field conditional-block"><span>Who will prepare articles?</span><select name="blog_content_owner" required><option value="client">The client</option><option value="ederito-help">I need content assistance</option><option value="not-sure">Not sure</option></select></label>}
                          {websiteFeatures.has('integrations') && <label className="field full conditional-block"><span>Required integrations</span><textarea name="website_integrations" placeholder="CRM, email marketing, accounting, calendar, forms, APIs..." required /></label>}
                        </div>
                      </div>

                      <div className="question-group">
                        <div className="question-group-head"><span>03</span><div><h3>Domain, brand, and launch readiness</h3><p>Questions appear only when access, content help, or a fixed deadline affects the project.</p></div></div>
                        <div className="form-grid">
                          <label className="field"><span>Domain status</span><select name="domain_status" value={websiteDomainStatus} onChange={(event) => setWebsiteDomainStatus(event.target.value)} required><option value="">Select one</option><option value="need-domain">I need a domain</option><option value="own-domain">I already own a domain</option><option value="transfer">I want to transfer a domain</option><option value="not-sure">Not sure</option></select></label>
                          {(websiteDomainStatus === 'own-domain' || websiteDomainStatus === 'transfer') && <label className="field conditional-block"><span>Domain name</span><input name="domain_name" placeholder="example.com" required /></label>}
                          {(websiteDomainStatus === 'own-domain' || websiteDomainStatus === 'transfer') && <label className="field conditional-block"><span>Current registrar</span><input name="domain_registrar" placeholder="Namecheap, GoDaddy, Cloudflare..." required /></label>}
                          {websiteDomainStatus === 'transfer' && <label className="field conditional-block"><span>Do you control the registrar account?</span><select name="domain_account_control" required><option value="yes">Yes</option><option value="no">No</option><option value="not-sure">Not sure</option></select></label>}
                          <label className="field"><span>Logo, written content, and images</span><select name="content_status" value={websiteContentStatus} onChange={(event) => setWebsiteContentStatus(event.target.value)} required><option value="">Select one</option><option value="ready">Everything is ready</option><option value="partial">Partly ready</option><option value="need-help">I need help creating them</option></select></label>
                          {websiteContentStatus !== '' && websiteContentStatus !== 'ready' && <label className="field full conditional-block"><span>What content or branding help is needed?</span><textarea name="content_help_needed" required /></label>}
                          <label className="field"><span>Is there a fixed launch deadline?</span><select name="fixed_deadline" value={websiteDeadline} onChange={(event) => setWebsiteDeadline(event.target.value)} required><option value="no">No</option><option value="yes">Yes</option></select></label>
                          {websiteDeadline === 'yes' && <label className="field conditional-block"><span>Required launch date and reason</span><input name="preferred_launch" type="date" required /></label>}
                          {isCustom && <label className="field"><span>Expected budget</span><select name="budget" required><option value="">Select one</option><option>$500-$1,000</option><option>$1,000-$2,500</option><option>$2,500-$5,000</option><option>$5,000+</option></select></label>}
                          <label className="field full"><span>Reference websites or final notes</span><textarea name="website_references" placeholder="Optional: links or details that would help us understand the preferred direction" /></label>
                        </div>
                      </div>
                    </div>
                  )}

                  {isApp && (
                    <div className="conditional-form">
                      <div className="question-group">
                        <div className="question-group-head"><span>01</span><div><h3>Product strategy</h3><p>App stores review usefulness, completeness, policy compliance, and whether an app adds meaningful value.</p></div></div>
                        <div className="form-grid">
                          <label className="field"><span>App or business name</span><input name="app_name" required /></label>
                          <label className="field"><span>Target users</span><input name="app_target_users" placeholder="Who is this for?" required /></label>
                          <label className="field full"><span>What problem will the app solve?</span><textarea name="app_purpose" placeholder="Explain the main problem and the result users should get" required /></label>
                          <label className="field full"><span>What makes the app meaningfully different from existing apps?</span><textarea name="app_unique_value" placeholder="Specific workflow, audience, data, community, technology, or experience competitors do not provide" required /></label>
                          <label className="field"><span>Platforms</span><select name="app_platforms" value={appPlatforms} onChange={(event) => setAppPlatforms(event.target.value)} required><option value="">Select one</option><option value="ios-android">iOS and Android</option><option value="ios-first">iOS first</option><option value="android-first">Android first</option><option value="mobile-web">Mobile app plus web dashboard</option></select></label>
                          <label className="field"><span>Age group</span><select name="app_age_group" value={appAgeGroup} onChange={(event) => setAppAgeGroup(event.target.value)} required><option value="adults">Adults only</option><option value="teens">Includes teenagers</option><option value="children">Designed for children</option><option value="all-ages">All ages</option></select></label>
                          {appAgeGroup !== 'adults' && <label className="field full conditional-block"><span>Age screening, parental controls, and child-safety approach</span><textarea name="minor_safety_plan" required /></label>}
                        </div>
                      </div>

                      <div className="question-group">
                        <div className="question-group-head"><span>02</span><div><h3>Core features</h3><p>Each selection opens only the questions needed for that feature.</p></div></div>
                        <div className="form-grid">
                          <ChoiceGrid legend="App features" choices={appFeatureChoices} selected={appFeatures} setSelected={setAppFeatures} />

                          {appHasAccounts && (
                            <>
                              <ChoiceGrid legend="Sign-in methods" choices={loginChoices} selected={appLoginMethods} setSelected={setAppLoginMethods} />
                              <label className="field conditional-block"><span>Account deletion</span><select name="account_deletion_plan" required><option value="included">Include in-app account deletion and a web deletion-request page</option><option value="existing">Already available in an existing system</option><option value="discuss">Needs discussion</option></select></label>
                              <label className="field conditional-block"><span>Reviewer access</span><select name="review_demo_account" required><option value="ederito-create">Ederito should prepare a review demo account</option><option value="client-provide">Client will provide review credentials</option><option value="not-applicable">No login will be required during review</option></select></label>
                            </>
                          )}

                          {appHasUGC && (
                            <>
                              <label className="field full conditional-block"><span>What user-generated content will be shared?</span><textarea name="ugc_types" placeholder="Messages, profiles, photos, posts, reviews, comments..." required /></label>
                              <label className="field conditional-block"><span>Moderation responsibility</span><select name="moderation_owner" required><option value="client-team">Client moderation team</option><option value="shared">Shared workflow with Ederito tools</option><option value="not-decided">Not decided</option></select></label>
                              <label className="field conditional-block"><span>Required safety tools</span><select name="ugc_safety_tools" required><option value="full">Terms acceptance, content filtering, report, block, and admin moderation</option><option value="custom">Custom moderation plan</option></select></label>
                              <label className="field full conditional-block"><span>Prohibited content and community-safety rules</span><textarea name="community_safety_rules" required /></label>
                            </>
                          )}

                          <label className="field"><span>Revenue model</span><select name="revenue_model" value={appRevenueModel} onChange={(event) => setAppRevenueModel(event.target.value)} required><option value="">Select one</option><option value="free">Free</option><option value="subscriptions">Digital subscriptions</option><option value="digital-purchases">One-time digital purchases</option><option value="physical-services">Physical goods or real-world services</option><option value="marketplace">Marketplace commission</option><option value="ads">Advertising</option><option value="not-decided">Not decided</option></select></label>
                          {appHasPayments && <label className="field full conditional-block"><span>What exactly will users pay for, and what prices or subscription periods are planned?</span><textarea name="payment_details" required /></label>}
                          {appHasLocation && <label className="field conditional-block"><span>Location access needed</span><select name="location_access" required><option value="approximate">Approximate location</option><option value="precise">Precise location while using the app</option><option value="background">Background location</option><option value="address-only">User-entered address only</option></select></label>}
                          {appHasAI && <label className="field full conditional-block"><span>AI purpose, provider, user inputs, generated outputs, and safety controls</span><textarea name="ai_requirements" required /></label>}
                        </div>
                      </div>

                      <div className="question-group">
                        <div className="question-group-head"><span>03</span><div><h3>Data, privacy, and brand</h3><p>Only data relevant to the app should be collected, disclosed, and protected.</p></div></div>
                        <div className="form-grid">
                          <label className="field"><span>Personal or sensitive data</span><select name="sensitive_data_level" value={appSensitiveData} onChange={(event) => setAppSensitiveData(event.target.value)} required><option value="none">No personal data beyond basic contact information</option><option value="basic">Profiles, photos, messages, or contacts</option><option value="location">Precise or background location</option><option value="financial">Financial or payment-related data</option><option value="health">Health or medical data</option><option value="multiple">Multiple sensitive categories</option></select></label>
                          <label className="field"><span>Brand identity</span><select name="branding_status" required><option value="">Select one</option><option value="existing">I already have a complete brand</option><option value="included">Use the included starter app branding</option><option value="custom">I need a custom brand system beyond the package</option></select></label>
                          {appSensitiveData !== 'none' && <label className="field full conditional-block"><span>List the data collected, why it is needed, who can access it, and any retention requirements</span><textarea name="data_collected" required /></label>}
                          <label className="field"><span>Domain and app website</span><select name="app_domain_status" required><option value="included">Use the included eligible domain and one-page app website</option><option value="existing">Connect an existing domain and website</option><option value="custom-site">I need a larger custom website</option></select></label>
                          <label className="field"><span>Policies</span><select name="policy_status" required><option value="templates">Use Ederito's project-specific Privacy Policy and Terms templates</option><option value="existing">Existing policies will be reviewed</option><option value="legal-counsel">Client's legal counsel will provide policies</option></select></label>
                        </div>
                      </div>

                      <div className="question-group">
                        <div className="question-group-head"><span>04</span><div><h3>Developer accounts and launch</h3><p>Questions appear only for the selected stores and enrollment status.</p></div></div>
                        <div className="form-grid">
                          {appIncludesIOS && <label className="field"><span>Apple Developer account</span><select name="apple_account_status" value={appleAccountStatus} onChange={(event) => setAppleAccountStatus(event.target.value)} required><option value="">Select one</option><option value="active">Already active</option><option value="need-enrollment">Need help enrolling</option><option value="client-handle">Client will handle enrollment</option></select></label>}
                          {appIncludesAndroid && <label className="field"><span>Google Play developer account</span><select name="google_account_status" value={googleAccountStatus} onChange={(event) => setGoogleAccountStatus(event.target.value)} required><option value="">Select one</option><option value="active">Already active</option><option value="need-enrollment">Need help enrolling</option><option value="client-handle">Client will handle enrollment</option></select></label>}

                          {needsDeveloperEnrollment && (
                            <>
                              <label className="field conditional-block"><span>Account type</span><select name="developer_account_type" value={developerAccountType} onChange={(event) => setDeveloperAccountType(event.target.value)} required><option value="">Select one</option><option value="individual">Individual</option><option value="organization">Organization or legal entity</option></select></label>
                              {developerAccountType === 'organization' && (
                                <>
                                  <label className="field conditional-block"><span>Legal entity name</span><input name="developer_legal_entity" required /></label>
                                  <label className="field conditional-block"><span>D-U-N-S Number status</span><select name="duns_status" required><option value="available">Already available</option><option value="requested">Requested or pending</option><option value="need-help">Need guidance</option></select></label>
                                  <label className="field conditional-block"><span>Public company website</span><input name="organization_website" type="url" placeholder="https://" required /></label>
                                  <label className="field conditional-block"><span>Work email using the company domain</span><input name="organization_email" type="email" required /></label>
                                </>
                              )}
                            </>
                          )}

                          <label className="field"><span>Is there a fixed launch deadline?</span><select name="fixed_deadline" value={appDeadline} onChange={(event) => setAppDeadline(event.target.value)} required><option value="no">No</option><option value="yes">Yes</option></select></label>
                          {appDeadline === 'yes' && <label className="field conditional-block"><span>Requested launch date</span><input name="preferred_launch" type="date" required /></label>}
                          {isCustom && <label className="field"><span>Expected budget</span><select name="budget" required><option value="">Select one</option><option>$2,500-$5,000</option><option>$5,000-$10,000</option><option>$10,000-$25,000</option><option>$25,000+</option></select></label>}
                          <label className="field full"><span>Existing designs, prototype, technical documentation, or final notes</span><textarea name="app_existing_materials" placeholder="Optional" /></label>
                        </div>
                      </div>

                      <div className="store-risk-box">
                        <strong>App-store review acknowledgment</strong>
                        <p>Ederito is responsible for correcting defects in Ederito-delivered code that fall within the signed scope. Ederito does not guarantee Apple or Google approval and is not responsible for rejection caused by the app concept, category saturation, insufficient differentiation, client content, metadata, business model, licensing, account verification, policy changes, third-party services, or another issue outside Ederito's code and agreed scope.</p>
                        <label className="check-row"><input type="checkbox" name="store_review_risk_acknowledgment" required /><span>I understand and accept this app-store review limitation.</span></label>
                      </div>
                    </div>
                  )}
                </section>

                <section className="intake-section contact-section">
                  <div className="section-heading"><div><p className="eyebrow">Contact and authorization</p><h2>Review and submit.</h2></div></div>
                  <div className="form-grid">
                    <label className="field"><span>Full legal name</span><input name="signed_name" autoComplete="name" required /></label>
                    <label className="field"><span>Best phone number</span><input name="phone" type="tel" autoComplete="tel" required /></label>
                    <label className="field"><span>Email</span><input name="contact_email" type="email" autoComplete="email" required /></label>
                    <label className="field"><span>Preferred contact</span><select name="preferred_contact" required><option value="">Select one</option><option>Email</option><option>Phone call</option><option>Text message</option><option>WhatsApp</option></select></label>
                    <label className="check-row full"><input type="checkbox" name="accuracy_authorization" required /><span>I certify that the information is accurate and authorize Ederito to use it to review the project, prepare the selected filing service, or issue a proposal and contract. Submission does not guarantee approval, filing acceptance, price, or project start.</span></label>
                  </div>
                  {message && <div className={`notice ${message.includes('received') ? 'success' : 'error'}`}>{message}</div>}
                  <button className="button submit-button" disabled={busy}>{busy ? 'Sending request...' : isLLC ? 'Submit formation request' : 'Request project review'}</button>
                </section>
              </div>

              <aside className="project-summary">
                <div className="summary-card">
                  <p className="eyebrow">Your selection</p>
                  <h3>{selected.name}</h3>
                  <p>{selected.tagline || selected.description}</p>
                  <div className="summary-price"><span>{isCustom ? 'Custom proposal' : money(selected.base_price_cents)}</span>{!isCustom && <small>{isLLC ? 'Ederito service fee' : 'Starting project price'}</small>}</div>

                  {isLLC && <div className="llc-estimate"><div><span>State filing fee</span><strong>{selectedState ? money(governmentFee) : 'Select state'}</strong></div><div className="estimate-total"><span>Estimated total</span><strong>{selectedState ? money(estimatedTotal) : '--'}</strong></div></div>}

                  <div className="summary-list">{(selected.features || []).map((feature) => <span key={feature}>{feature}</span>)}</div>

                  {isApp && (
                    <>
                      <div className="cost-note"><strong>Separate third-party costs</strong><p>Apple Developer Program: $99 per year. Google Play full distribution: $25 one time. Supabase may begin on a free tier; production usage, paid APIs, SMS, email, maps, AI, storage, and other services may create continuing costs. The selected package includes only the database allowance stated in the package.</p></div>
                      <div className="cost-note risk"><strong>Approval is not guaranteed</strong><p>Apple and Google independently review the final app, developer account, content, metadata, functionality, business model, safety systems, and policy compliance. A technically working build can still be rejected for reasons outside Ederito's code.</p></div>
                    </>
                  )}

                  {isWebsite && <div className="cost-note"><strong>Before work begins</strong><p>Ederito reviews the selected pages and functions, then sends the final proposal and contract. Premium domains, paid plugins, commerce fees, copywriting, custom branding, and work outside the package are separate.</p></div>}

                  {isLLC && <div className="cost-note"><strong>Formation limitations</strong><p>The state fee is separate. EINs are issued by the IRS without an IRS application fee; the EIN package pays Ederito for administrative preparation and assistance. Registered-agent providers, publication, licenses, annual reports, legal advice, tax advice, and government corrections are separate unless expressly included.</p>{selectedState?.publication_required && <p className="warning">This state has a publication requirement. Publication costs are separate.</p>}{selectedState?.publication_notes && <p className="warning">{selectedState.publication_notes}</p>}</div>}

                  <p className="summary-disclaimer">No store, state, tax, banking, funding, name-availability, approval, processing-time, revenue, ranking, or publication result is guaranteed.</p>
                </div>
              </aside>
            </div>
          )}
        </form>
      )}
    </main>
  );
}
