'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Package={id:string;slug:string;name:string;tagline:string|null;description:string|null;base_price_cents:number;requires_quote:boolean;includes_first_year_domain:boolean;included_maintenance_months:number;included_infrastructure_months:number;service_id:string};
type Service={id:string;slug:string;name:string};
type StateFee={state_code:string;standard_filing_fee_cents:number;annual_report_fee_cents:number;publication_required:boolean;publication_notes:string|null;last_verified_at:string|null};
type Props={packages:Package[];services:Service[];stateFees:StateFee[]};
type Journey='website'|'app'|'business';

const journeyCopy={
  website:{title:'Build a website',text:'Choose the level that fits your business. We will confirm scope before work begins.'},
  app:{title:'Build an app or AI product',text:'Tell us the features you need. Every app receives a reviewed custom proposal.'},
  business:{title:'Start and launch a business',text:'Combine formation assistance with branding, domain, email and a digital launch.'}
};

export default function StartProjectClient({packages,services,stateFees}:Props){
  const [journey,setJourney]=useState<Journey|null>(null);
  const [selectedId,setSelectedId]=useState('');
  const [stateCode,setStateCode]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  const selected=useMemo(()=>packages.find(x=>x.id===selectedId),[packages,selectedId]);
  const service=services.find(x=>x.id===selected?.service_id);
  const selectedState=stateFees.find(x=>x.state_code===stateCode);
  const isApp=service?.slug==='mobile-app-development';
  const isLLC=service?.slug==='business-formation';
  const isWebsite=service?.slug==='website-development';
  const governmentFee=isLLC?(selectedState?.standard_filing_fee_cents||0):0;
  const total=(selected?.base_price_cents||0)+governmentFee;

  const visiblePackages=packages.filter(item=>{
    const itemService=services.find(x=>x.id===item.service_id)?.slug;
    if(journey==='website') return itemService==='website-development';
    if(journey==='app') return itemService==='mobile-app-development';
    if(journey==='business') return itemService==='business-formation';
    return false;
  });

  function chooseJourney(next:Journey){setJourney(next);setSelectedId('');setStateCode('');setMessage('');}

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!selected){setMessage('Choose a package first.');return;}
    if(isLLC&&!selectedState){setMessage('Choose the state where the LLC will be formed.');return;}
    setBusy(true);setMessage('');
    const form=new FormData(event.currentTarget);
    const responses=Object.fromEntries(form.entries());
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href='/login';return;}
    const {error}=await supabase.from('intake_submissions').insert({
      client_id:user.id,
      service_package_id:selected.id,
      status:'submitted',
      responses,
      calculated_service_fee_cents:selected.base_price_cents,
      calculated_third_party_fees_cents:governmentFee,
      calculated_addons_cents:0,
      estimated_total_cents:total,
      quote_required:selected.requires_quote||isApp,
      certified_accurate:true,
      signed_name:String(form.get('signed_name')||''),
      signed_at:new Date().toISOString(),
      submitted_at:new Date().toISOString()
    });
    setMessage(error?error.message:'Your request was submitted for review.');
    if(!error){event.currentTarget.reset();setSelectedId('');setStateCode('');}
    setBusy(false);
  }

  return <main className="shell portal intake-page">
    <header className="topbar intake-topbar">
      <div className="brand"><img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito logo"/><span>EDERITO</span></div>
      <Link className="button secondary" href="/dashboard">Dashboard</Link>
    </header>

    <section className="intake-hero">
      <p className="eyebrow">Start with clarity</p>
      <h1>What are you building?</h1>
      <p>Choose one path. You will only see the packages and questions that apply to you.</p>
    </section>

    <section className="journey-grid">
      {(Object.keys(journeyCopy) as Journey[]).map(key=><button type="button" key={key} onClick={()=>chooseJourney(key)} className={`journey-card ${journey===key?'selected':''}`}><small>0{key==='website'?1:key==='app'?2:3}</small><h2>{journeyCopy[key].title}</h2><p>{journeyCopy[key].text}</p><span>Continue -></span></button>)}
    </section>

    {journey&&<form className="project-form" onSubmit={submit}>
      <section className="intake-section">
        <div className="section-label"><span>01</span><div><p className="eyebrow">Choose your package</p><h2>{journeyCopy[journey].title}</h2></div></div>
        <div className="package-grid focused">{visiblePackages.map(item=><button type="button" key={item.id} onClick={()=>{setSelectedId(item.id);setStateCode('')}} className={`package-card ${selectedId===item.id?'selected':''}`}><span>{item.name}</span><strong>{item.requires_quote?'Reviewed custom quote':`Package from $${(item.base_price_cents/100).toFixed(0)}`}</strong><small>{item.tagline||item.description}</small></button>)}</div>
      </section>

      {selected&&<>
        {isLLC&&<>
          <section className="intake-section"><div className="section-label"><span>02</span><div><p className="eyebrow">Formation details</p><h2>Tell us about the company.</h2></div></div><div className="form-grid">
            <label className="field"><span>Formation state</span><select name="formation_state" value={stateCode} onChange={e=>setStateCode(e.target.value)} required><option value="">Select state</option>{stateFees.map(x=><option key={x.state_code} value={x.state_code}>{x.state_code}</option>)}</select></label>
            <label className="field"><span>Industry</span><input name="industry" required/></label>
            <label className="field"><span>First company-name choice</span><input name="preferred_name_1" required/></label>
            <label className="field"><span>Second choice</span><input name="preferred_name_2"/></label>
            <label className="field"><span>Third choice</span><input name="preferred_name_3"/></label>
            <label className="field"><span>Ownership</span><select name="ownership_type" required><option value="">Select</option><option>Single-member</option><option>Multi-member</option></select></label>
            <label className="field"><span>Management</span><select name="management_structure" required><option value="">Select</option><option>Member-managed</option><option>Manager-managed</option></select></label>
            <label className="field"><span>EIN assistance</span><select name="ein_assistance" required><option>Yes</option><option>No</option><option>Not sure</option></select></label>
            <label className="field full"><span>What will the business do?</span><textarea name="business_description" required minLength={20}/></label>
            <label className="field full"><span>Principal business address</span><textarea name="principal_address" required/></label>
            <label className="field full"><span>Registered agent name and physical address</span><textarea name="registered_agent" required/></label>
            <label className="field full"><span>Owners, legal names, addresses and ownership percentages</span><textarea name="members" required/></label>
          </div></section>

          <section className="intake-section"><div className="section-label"><span>03</span><div><p className="eyebrow">Your estimate</p><h2>One package. One state cost.</h2></div></div>{selectedState?<div className="price-breakdown"><div><span>{selected.name}</span><strong>${(selected.base_price_cents/100).toFixed(2)}</strong><small>Ederito package</small></div><b>+</b><div><span>{selectedState.state_code} filing cost</span><strong>${(governmentFee/100).toFixed(2)}</strong><small>Paid to the state</small></div><b>=</b><div className="total-card"><span>Estimated total</span><strong>${(total/100).toFixed(2)}</strong><small>Before optional add-ons</small></div></div>:<div className="empty">Choose a state to see the government filing cost.</div>}<p className="disclosure">The state filing cost is not another Ederito fee. It is collected for the government filing. Fees are reconfirmed before submission, and approval, timing, name availability and EIN issuance are never guaranteed.</p></section>

          <section className="intake-section"><div className="section-label"><span>04</span><div><p className="eyebrow">Launch options</p><h2>What else should we prepare?</h2></div></div><div className="form-grid"><label className="field"><span>Domain</span><select name="domain_status"><option>No domain needed</option><option>Help me register one</option><option>I already own one</option><option>Not sure</option></select></label><label className="field"><span>Preferred or existing domain</span><input name="domain_name" placeholder="example.com"/></label><label className="field"><span>Website</span><select name="website_needed"><option>No</option><option>Yes</option><option>Not sure</option></select></label><label className="field"><span>Brand identity</span><select name="branding_needed"><option>No</option><option>Yes</option><option>Not sure</option></select></label></div></section>
        </>}

        {(isWebsite||isApp)&&<section className="intake-section"><div className="section-label"><span>02</span><div><p className="eyebrow">Project details</p><h2>Tell us what success looks like.</h2></div></div><div className="form-grid"><label className="field"><span>Business or project name</span><input name="business_name" required/></label><label className="field"><span>Industry</span><input name="industry" required/></label><label className="field"><span>Budget range</span><select name="budget" required><option value="">Select</option><option>Under $500</option><option>$500-$1,500</option><option>$1,500-$3,000</option><option>$3,000-$7,500</option><option>$7,500+</option></select></label><label className="field"><span>Preferred launch date</span><input name="preferred_launch" type="date"/></label><label className="field full"><span>Describe the product and your main goals</span><textarea name="project_description" required minLength={30}/></label></div></section>}

        {isWebsite&&<section className="intake-section"><div className="section-label"><span>03</span><div><p className="eyebrow">Website setup</p><h2>Shape the experience.</h2></div></div><div className="form-grid"><label className="field"><span>Website type</span><select name="website_type"><option>Business website</option><option>Landing page</option><option>Portfolio</option><option>Restaurant</option><option>Church</option><option>School</option><option>Online store</option></select></label><label className="field"><span>Estimated pages</span><input name="page_count" type="number" min="1"/></label><label className="field"><span>Domain status</span><select name="domain_status"><option>Need a new domain</option><option>Connect my domain</option><option>Discuss a transfer</option><option>Not sure</option></select></label><label className="field"><span>Domain name</span><input name="domain_name"/></label><label className="field"><span>Booking or payments</span><select name="commerce_needs"><option>Neither</option><option>Booking</option><option>Payments</option><option>Both</option></select></label><label className="field"><span>Content readiness</span><select name="content_status"><option>Not ready</option><option>Partly ready</option><option>Ready</option></select></label></div><p className="disclosure">Qualifying builds include one eligible standard domain for the first year. Eligible standard renewals are $29 per year. Premium domains are priced separately.</p></section>}

        {isApp&&<section className="intake-section"><div className="section-label"><span>03</span><div><p className="eyebrow">Product requirements</p><h2>Define the core app.</h2></div></div><div className="form-grid"><label className="field"><span>Platforms</span><select name="app_platforms" required><option>iOS and Android</option><option>iOS only</option><option>Android only</option><option>Mobile app and web dashboard</option></select></label><label className="field"><span>Revenue model</span><select name="revenue_model"><option>Free</option><option>Subscriptions</option><option>One-time purchases</option><option>Marketplace commissions</option><option>Not decided</option></select></label><label className="field"><span>Apple Developer account</span><select name="apple_account"><option>No</option><option>Yes</option><option>Need guidance</option></select></label><label className="field"><span>Google Play account</span><select name="google_account"><option>No</option><option>Yes</option><option>Need guidance</option></select></label><label className="field full"><span>Required features</span><textarea name="app_features" placeholder="Profiles, payments, messaging, maps, AI, notifications, uploads, admin dashboard..." required/></label><label className="field full"><span>What information will users provide?</span><textarea name="data_collected" required/></label></div><p className="disclosure">Apple membership, Google Play registration, hosting, AI usage and paid integrations are separate third-party costs. Store approval and publication dates are never guaranteed.</p></section>}

        <section className="intake-section"><div className="section-label"><span>{isLLC?'05':'04'}</span><div><p className="eyebrow">Review request</p><h2>Send it to Ederito.</h2></div></div><div className="form-grid"><label className="field"><span>Full legal name</span><input name="signed_name" required/></label><label className="field"><span>Best contact phone</span><input name="phone" required/></label><label className="check-row full"><input type="checkbox" required/><span>I confirm the information is accurate and understand that final scope, price, third-party costs and timeline require Ederito review.</span></label></div>{message&&<div className={`notice ${message.includes('submitted')?'success':'error'}`}>{message}</div>}<button className="button" disabled={busy}>{busy?'Submitting...':'Submit for review'}</button></section>
      </>}
    </form>}
  </main>;
}
