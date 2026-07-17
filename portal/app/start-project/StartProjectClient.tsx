'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Package={id:string;slug:string;name:string;tagline:string|null;description:string|null;base_price_cents:number;requires_quote:boolean;includes_first_year_domain:boolean;included_maintenance_months:number;included_infrastructure_months:number;service_id:string};
type Service={id:string;slug:string;name:string};
type Props={packages:Package[];services:Service[]};

export default function StartProjectClient({packages,services}:Props){
  const [selectedId,setSelectedId]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const selected=useMemo(()=>packages.find(x=>x.id===selectedId),[packages,selectedId]);
  const service=services.find(x=>x.id===selected?.service_id);
  const isApp=service?.slug==='mobile-apps'||service?.slug==='ai-solutions';

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!selected){setMessage('Select a package first.');return;}
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
      calculated_third_party_fees_cents:0,
      calculated_addons_cents:0,
      estimated_total_cents:selected.base_price_cents,
      quote_required:selected.requires_quote,
      certified_accurate:true,
      signed_name:String(form.get('signed_name')||''),
      signed_at:new Date().toISOString(),
      submitted_at:new Date().toISOString()
    });
    setMessage(error?error.message:'Your project request was submitted for review.');
    if(!error) event.currentTarget.reset();
    setBusy(false);
  }

  return <main className="shell portal">
    <header className="topbar"><div className="brand"><img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito logo"/><span>START A PROJECT</span></div><Link className="button secondary" href="/dashboard">Back to dashboard</Link></header>
    <section className="dashboard-head"><p className="eyebrow">Guided project intake</p><h1>Tell us what you want to build.</h1><p className="lead">Choose a starting package, answer the questions that apply, and receive a reviewed proposal before payment.</p></section>

    <form className="project-form" onSubmit={submit}>
      <section className="panel"><h2>1. Select a package</h2><div className="package-grid">{packages.map(item=><button type="button" key={item.id} onClick={()=>setSelectedId(item.id)} className={`package-card ${selectedId===item.id?'selected':''}`}><span>{item.name}</span><strong>{item.requires_quote?'Custom quote':`Starting at $${(item.base_price_cents/100).toFixed(0)}`}</strong><small>{item.tagline||item.description}</small></button>)}</div></section>

      {selected&&<>
      <section className="panel"><h2>2. Business and project</h2><div className="form-grid">
        <label className="field"><span>Business or project name</span><input name="business_name" required/></label>
        <label className="field"><span>Industry</span><input name="industry" required/></label>
        <label className="field"><span>Budget range</span><select name="budget" required><option value="">Select</option><option>Under $500</option><option>$500–$1,500</option><option>$1,500–$3,000</option><option>$3,000–$7,500</option><option>$7,500+</option></select></label>
        <label className="field"><span>Preferred launch date</span><input name="preferred_launch" type="date"/></label>
        <label className="field full"><span>What do you want us to build?</span><textarea name="project_description" required minLength={30}/></label>
        <label className="field full"><span>Main goals and required features</span><textarea name="required_features" required minLength={20}/></label>
      </div></section>

      <section className="panel"><h2>3. Brand, domain and content</h2><div className="form-grid">
        <label className="field"><span>Do you already own a domain?</span><select name="domain_status" required><option value="">Select</option><option value="need_domain">No, help me register one</option><option value="connect_existing">Yes, connect my existing domain</option><option value="transfer_later">Yes, discuss a future transfer</option><option value="unsure">I am not sure</option></select></label>
        <label className="field"><span>Existing or preferred domain</span><input name="domain_name" placeholder="example.com"/></label>
        <label className="field"><span>Do you have a logo?</span><select name="logo_status"><option>No</option><option>Yes</option><option>I need a redesign</option></select></label>
        <label className="field"><span>Is your content ready?</span><select name="content_status"><option>No</option><option>Partly</option><option>Yes</option></select></label>
      </div><p className="disclosure">Qualifying packages may include one eligible standard domain for the first year. Eligible domains renew at $29/year after the first year. Premium or specialty domains are priced separately. Direct domain purchasing is coming soon.</p></section>

      {isApp&&<section className="panel"><h2>4. App requirements</h2><div className="form-grid">
        <label className="field"><span>Platforms</span><select name="app_platforms" required><option>iOS and Android</option><option>iOS only</option><option>Android only</option><option>Mobile app and web dashboard</option></select></label>
        <label className="field"><span>Revenue model</span><select name="revenue_model"><option>Free</option><option>Subscriptions</option><option>One-time purchases</option><option>Marketplace commissions</option><option>Not decided</option></select></label>
        <label className="field"><span>Apple Developer account?</span><select name="apple_account"><option>No</option><option>Yes</option><option>Need guidance</option></select></label>
        <label className="field"><span>Google Play account?</span><select name="google_account"><option>No</option><option>Yes</option><option>Need guidance</option></select></label>
        <label className="field full"><span>Choose important features</span><textarea name="app_features" placeholder="Login, profiles, payments, messaging, maps, AI, notifications, uploads, admin dashboard..." required/></label>
        <label className="field full"><span>What user data will the app collect?</span><textarea name="data_collected" required/></label>
      </div><p className="disclosure">Apple Developer membership is currently $99/year and Google Play registration is currently a one-time $25 fee. These and other third-party costs are paid separately. Ederito does not guarantee approval, publication date, or acceptance by Apple, Google, or any third party.</p></section>}

      <section className="panel"><h2>{isApp?'5':'4'}. Final confirmation</h2><div className="form-grid"><label className="field"><span>Full legal name</span><input name="signed_name" required/></label><label className="field"><span>Best contact phone</span><input name="phone" required/></label><label className="check-row full"><input type="checkbox" required/><span>I confirm that the information is accurate and understand that displayed prices are starting estimates. Final scope, fees, timeline and third-party costs require Ederito review and a written proposal.</span></label></div>{message&&<div className={`notice ${message.includes('submitted')?'success':'error'}`}>{message}</div>}<button className="button" disabled={busy}>{busy?'Submitting…':'Submit for review'}</button></section>
      </>}
    </form>
  </main>;
}
