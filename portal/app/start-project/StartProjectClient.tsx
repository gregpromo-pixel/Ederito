'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Package={id:string;slug:string;name:string;tagline:string|null;description:string|null;base_price_cents:number;requires_quote:boolean;service_id:string};
type Service={id:string;slug:string;name:string};
type StateFee={state_code:string;standard_filing_fee_cents:number;publication_required:boolean;publication_notes:string|null};
type Props={packages:Package[];services:Service[];stateFees:StateFee[]};
type Journey='website'|'app'|'business';

const journeys={
  website:{title:'Build a website',text:'A clear, professional online presence for your business.'},
  app:{title:'Build an app or AI product',text:'A custom mobile or intelligent product shaped around your goals.'},
  business:{title:'Start and launch a business',text:'Formation support, branding, domain and digital launch in one place.'}
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
  const isWebsite=service?.slug==='website-development';
  const isApp=service?.slug==='mobile-app-development';
  const isLLC=service?.slug==='business-formation';
  const governmentFee=isLLC?(selectedState?.standard_filing_fee_cents||0):0;
  const total=(selected?.base_price_cents||0)+governmentFee;

  const visiblePackages=packages.filter(item=>{
    const slug=services.find(x=>x.id===item.service_id)?.slug;
    if(journey==='website') return slug==='website-development';
    if(journey==='app') return slug==='mobile-app-development';
    if(journey==='business') return slug==='business-formation';
    return false;
  });

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!selected){setMessage('Choose a package first.');return;}
    if(isLLC&&!selectedState){setMessage('Choose a formation state.');return;}
    setBusy(true);setMessage('');
    const form=new FormData(event.currentTarget);
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href='/login';return;}
    const {error}=await supabase.from('intake_submissions').insert({
      client_id:user.id,
      service_package_id:selected.id,
      status:'submitted',
      responses:Object.fromEntries(form.entries()),
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
    setBusy(false);
  }

  return <main className="shell portal intake-page">
    <header className="topbar intake-topbar">
      <div className="brand"><img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito logo"/><span>EDERITO</span></div>
      <Link className="button secondary" href="/dashboard">Dashboard</Link>
    </header>

    <section className="intake-hero"><p className="eyebrow">Start with clarity</p><h1>What are you building?</h1><p>Choose one path and answer only the questions that apply to your project.</p></section>

    <section className="journey-grid">
      {(Object.keys(journeys) as Journey[]).map((key,index)=><button type="button" key={key} onClick={()=>{setJourney(key);setSelectedId('');setStateCode('')}} className={`journey-card ${journey===key?'selected':''}`}><small>0{index+1}</small><h2>{journeys[key].title}</h2><p>{journeys[key].text}</p><span>Continue</span></button>)}
    </section>

    {journey&&<form className="project-form" onSubmit={submit}>
      <section className="intake-section"><div className="section-label"><span>01</span><div><p className="eyebrow">Choose your package</p><h2>{journeys[journey].title}</h2></div></div><div className="package-grid focused">{visiblePackages.map(item=><button type="button" key={item.id} onClick={()=>{setSelectedId(item.id);setStateCode('')}} className={`package-card ${selectedId===item.id?'selected':''}`}><span>{item.name}</span><strong>{item.requires_quote?'Custom proposal':`From $${(item.base_price_cents/100).toFixed(0)}`}</strong><small>{item.tagline||item.description}</small></button>)}</div></section>

      {selected&&<>
        {isLLC&&<>
          <section className="intake-section"><div className="section-label"><span>02</span><div><p className="eyebrow">Formation details</p><h2>Tell us about the company.</h2></div></div><div className="form-grid">
            <label className="field"><span>Formation state</span><select name="formation_state" value={stateCode} onChange={e=>setStateCode(e.target.value)} required><option value="">Select state</option>{stateFees.map(x=><option key={x.state_code}>{x.state_code}</option>)}</select></label>
            <label className="field"><span>Industry</span><input name="industry" required/></label>
            <label className="field"><span>First company-name choice</span><input name="preferred_name_1" required/></label>
            <label className="field"><span>Second choice</span><input name="preferred_name_2"/></label>
            <label className="field"><span>Third choice</span><input name="preferred_name_3"/></label>
            <label className="field"><span>Ownership</span><select name="ownership_type" required><option value="">Select</option><option>Single-member</option><option>Multi-member</option></select></label>
            <label className="field"><span>Management</span><select name="management_structure" required><option value="">Select</option><option>Member-managed</option><option>Manager-managed</option></select></label>
            <label className="field"><span>EIN assistance</span><select name="ein_assistance"><option>Yes</option><option>No</option><option>Not sure</option></select></label>
            <label className="field full"><span>What will the business do?</span><textarea name="business_description" required/></label>
            <label className="field full"><span>Principal business address</span><textarea name="principal_address" required/></label>
            <label className="field full"><span>Registered agent name and physical address</span><textarea name="registered_agent" required/></label>
            <label className="field full"><span>Owners, legal names, addresses and ownership percentages</span><textarea name="members" required/></label>
          </div></section>
          <section className="intake-section"><div className="section-label"><span>03</span><div><p className="eyebrow">Estimated cost</p><h2>Your package plus the state filing cost.</h2></div></div>{selectedState?<div className="price-breakdown"><div><span>{selected.name}</span><strong>${(selected.base_price_cents/100).toFixed(2)}</strong><small>Ederito package</small></div><b>+</b><div><span>{selectedState.state_code} filing cost</span><strong>${(governmentFee/100).toFixed(2)}</strong><small>Government cost</small></div><b>=</b><div className="total-card"><span>Estimated total</span><strong>${(total/100).toFixed(2)}</strong><small>Before optional add-ons</small></div></div>:<div className="empty">Choose a state to see the filing cost.</div>}<p className="disclosure">The state filing amount is not an extra Ederito charge. It is a government cost. All fees are reconfirmed before filing, and approval is never guaranteed.</p></section>
        </>}

        {(isWebsite||isApp)&&<section className="intake-section"><div className="section-label"><span>02</span><div><p className="eyebrow">Project details</p><h2>Tell us what success looks like.</h2></div></div><div className="form-grid"><label className="field"><span>Business or project name</span><input name="business_name" required/></label><label className="field"><span>Industry</span><input name="industry" required/></label><label className="field"><span>Budget range</span><select name="budget" required><option value="">Select</option><option>Under $500</option><option>$500-$1,500</option><option>$1,500-$3,000</option><option>$3,000-$7,500</option><option>$7,500+</option></select></label><label className="field"><span>Preferred launch date</span><input name="preferred_launch" type="date"/></label><label className="field full"><span>Describe the project and your main goals</span><textarea name="project_description" required/></label></div></section>}

        {isWebsite&&<section className="intake-section"><div className="section-label"><span>03</span><div><p className="eyebrow">Website setup</p><h2>Shape the experience.</h2></div></div><div className="form-grid"><label className="field"><span>Website type</span><select name="website_type"><option>Business website</option><option>Landing page</option><option>Portfolio</option><option>Online store</option></select></label><label className="field"><span>Estimated pages</span><input name="page_count" type="number" min="1"/></label><label className="field"><span>Domain status</span><select name="domain_status"><option>Need a new domain</option><option>Connect my domain</option><option>Discuss a transfer</option></select></label><label className="field"><span>Domain name</span><input name="domain_name"/></label><label className="field"><span>Booking or payments</span><select name="commerce_needs"><option>Neither</option><option>Booking</option><option>Payments</option><option>Both</option></select></label><label className="field"><span>Content readiness</span><select name="content_status"><option>Not ready</option><option>Partly ready</option><option>Ready</option></select></label></div></section>}

        {isApp&&<section className="intake-section"><div className="section-label"><span>03</span><div><p className="eyebrow">Product requirements</p><h2>Define the core app.</h2></div></div><div className="form-grid"><label className="field"><span>Platforms</span><select name="app_platforms"><option>iOS and Android</option><option>iOS only</option><option>Android only</option><option>Mobile app and web dashboard</option></select></label><label className="field"><span>Revenue model</span><select name="revenue_model"><option>Free</option><option>Subscriptions</option><option>One-time purchases</option><option>Marketplace commissions</option></select></label><label className="field"><span>Apple Developer account</span><select name="apple_account"><option>No</option><option>Yes</option><option>Need guidance</option></select></label><label className="field"><span>Google Play account</span><select name="google_account"><option>No</option><option>Yes</option><option>Need guidance</option></select></label><label className="field full"><span>Required features</span><textarea name="app_features" required/></label><label className="field full"><span>What information will users provide?</span><textarea name="data_collected" required/></label></div><p className="disclosure">Apple, Google, hosting, AI usage and paid integrations are separate third-party costs. Store approval and publication dates are never guaranteed.</p></section>}

        <section className="intake-section"><div className="section-label"><span>{isLLC?'04':'04'}</span><div><p className="eyebrow">Review request</p><h2>Send it to Ederito.</h2></div></div><div className="form-grid"><label className="field"><span>Full legal name</span><input name="signed_name" required/></label><label className="field"><span>Best contact phone</span><input name="phone" required/></label><label className="check-row full"><input type="checkbox" required/><span>I confirm the information is accurate and understand that final scope, price, third-party costs and timeline require Ederito review.</span></label></div>{message&&<div className={`notice ${message.includes('submitted')?'success':'error'}`}>{message}</div>}<button className="button" disabled={busy}>{busy?'Submitting...':'Submit for review'}</button></section>
      </>}
    </form>}
  </main>;
}
