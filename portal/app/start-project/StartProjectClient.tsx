'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Package={id:string;slug:string;name:string;tagline:string|null;description:string|null;base_price_cents:number;requires_quote:boolean;includes_first_year_domain:boolean;included_maintenance_months:number;included_infrastructure_months:number;service_id:string};
type Service={id:string;slug:string;name:string};
type StateFee={state_code:string;standard_filing_fee_cents:number;annual_report_fee_cents:number;publication_required:boolean;publication_notes:string|null;last_verified_at:string|null};
type Props={packages:Package[];services:Service[];stateFees:StateFee[]};

export default function StartProjectClient({packages,services,stateFees}:Props){
  const [selectedId,setSelectedId]=useState('');
  const [stateCode,setStateCode]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const selected=useMemo(()=>packages.find(x=>x.id===selectedId),[packages,selectedId]);
  const service=services.find(x=>x.id===selected?.service_id);
  const selectedState=stateFees.find(x=>x.state_code===stateCode);
  const isApp=service?.slug==='mobile-apps'||service?.slug==='ai-solutions';
  const isLLC=service?.slug==='business-formation';
  const isWebsite=service?.slug==='website-development';
  const thirdPartyFee=isLLC?(selectedState?.standard_filing_fee_cents||0):0;
  const estimatedTotal=(selected?.base_price_cents||0)+thirdPartyFee;

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!selected){setMessage('Select a package first.');return;}
    if(isLLC&&!selectedState){setMessage('Select a formation state.');return;}
    setBusy(true);setMessage('');
    const form=new FormData(event.currentTarget);
    const responses=Object.fromEntries(form.entries());
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href='/login';return;}
    const {error}=await supabase.from('intake_submissions').insert({
      client_id:user.id,service_package_id:selected.id,status:'submitted',responses,
      calculated_service_fee_cents:selected.base_price_cents,
      calculated_third_party_fees_cents:thirdPartyFee,
      calculated_addons_cents:0,estimated_total_cents:estimatedTotal,
      quote_required:selected.requires_quote||isApp,
      certified_accurate:true,signed_name:String(form.get('signed_name')||''),
      signed_at:new Date().toISOString(),submitted_at:new Date().toISOString()
    });
    setMessage(error?error.message:'Your request was submitted for review.');
    if(!error){event.currentTarget.reset();setSelectedId('');setStateCode('');}
    setBusy(false);
  }

  return <main className="shell portal">
    <header className="topbar"><div className="brand"><img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito logo"/><span>START A PROJECT</span></div><Link className="button secondary" href="/dashboard">Back to dashboard</Link></header>
    <section className="dashboard-head"><p className="eyebrow">Guided intake</p><h1>Choose what you need.</h1><p className="lead">Your questions and estimated fees change based on the package you select.</p></section>

    <form className="project-form" onSubmit={submit}>
      <section className="panel"><h2>1. Select a package</h2><div className="package-grid">{packages.map(item=><button type="button" key={item.id} onClick={()=>{setSelectedId(item.id);setStateCode('')}} className={`package-card ${selectedId===item.id?'selected':''}`}><span>{item.name}</span><strong>{item.requires_quote?'Custom quote':`Starting at $${(item.base_price_cents/100).toFixed(0)}`}</strong><small>{item.tagline||item.description}</small></button>)}</div></section>

      {selected&&<>
        {isLLC?<>
          <section className="panel"><h2>2. LLC formation details</h2><div className="form-grid">
            <label className="field"><span>Formation state</span><select name="formation_state" required value={stateCode} onChange={e=>setStateCode(e.target.value)}><option value="">Select state</option>{stateFees.map(x=><option key={x.state_code} value={x.state_code}>{x.state_code}</option>)}</select></label>
            <label className="field"><span>Business industry</span><input name="industry" required/></label>
            <label className="field"><span>First preferred LLC name</span><input name="preferred_name_1" required/></label>
            <label className="field"><span>Second preferred name</span><input name="preferred_name_2"/></label>
            <label className="field"><span>Third preferred name</span><input name="preferred_name_3"/></label>
            <label className="field"><span>Ownership</span><select name="ownership_type" required><option value="">Select</option><option>Single-member</option><option>Multi-member</option></select></label>
            <label className="field"><span>Management</span><select name="management_structure" required><option value="">Select</option><option>Member-managed</option><option>Manager-managed</option></select></label>
            <label className="field"><span>Need EIN assistance?</span><select name="ein_assistance" required><option>Yes</option><option>No</option><option>Not sure</option></select></label>
            <label className="field full"><span>Describe the business activity</span><textarea name="business_description" required minLength={20}/></label>
            <label className="field full"><span>Principal business address</span><textarea name="principal_address" required/></label>
            <label className="field full"><span>Registered agent name and physical address</span><textarea name="registered_agent" required/></label>
            <label className="field full"><span>Owners, legal names, addresses and ownership percentages</span><textarea name="members" required/></label>
          </div></section>
          <section className="panel"><h2>3. LLC estimated fees</h2>{selectedState?<div className="fee-summary"><p><span>Ederito service fee</span><strong>${(selected.base_price_cents/100).toFixed(2)}</strong></p><p><span>{selectedState.state_code} government filing fee</span><strong>${(selectedState.standard_filing_fee_cents/100).toFixed(2)}</strong></p><p className="fee-total"><span>Estimated total</span><strong>${(estimatedTotal/100).toFixed(2)}</strong></p>{selectedState.publication_required&&<p className="disclosure">Publication is required and costs are separate. {selectedState.publication_notes}</p>}<p className="disclosure">Annual or recurring state obligations may apply. Fees are reconfirmed before filing. State approval, processing time, name availability and EIN issuance are never guaranteed.</p></div>:<div className="empty">Select a state to see the government filing fee.</div>}</section>
          <section className="panel"><h2>4. Digital launch options</h2><div className="form-grid"><label className="field"><span>Do you need a domain?</span><select name="domain_status"><option>No</option><option>Yes, help me register one</option><option>I already own one</option><option>Not sure</option></select></label><label className="field"><span>Preferred or existing domain</span><input name="domain_name" placeholder="example.com"/></label><label className="field"><span>Do you need a website?</span><select name="website_needed"><option>No</option><option>Yes</option><option>Not sure</option></select></label><label className="field"><span>Do you need branding?</span><select name="branding_needed"><option>No</option><option>Yes</option><option>Not sure</option></select></label></div></section>
        </>:<>
          <section className="panel"><h2>2. Business and project</h2><div className="form-grid"><label className="field"><span>Business or project name</span><input name="business_name" required/></label><label className="field"><span>Industry</span><input name="industry" required/></label><label className="field"><span>Budget range</span><select name="budget" required><option value="">Select</option><option>Under $500</option><option>$500-$1,500</option><option>$1,500-$3,000</option><option>$3,000-$7,500</option><option>$7,500+</option></select></label><label className="field"><span>Preferred launch date</span><input name="preferred_launch" type="date"/></label><label className="field full"><span>What do you want us to build?</span><textarea name="project_description" required minLength={30}/></label></div></section>
          {isWebsite&&<section className="panel"><h2>3. Website questions</h2><div className="form-grid"><label className="field"><span>Website type</span><select name="website_type"><option>Business website</option><option>Landing page</option><option>Portfolio</option><option>Restaurant</option><option>Church</option><option>School</option><option>Online store</option></select></label><label className="field"><span>Estimated pages</span><input name="page_count" type="number" min="1"/></label><label className="field"><span>Do you already own a domain?</span><select name="domain_status"><option>No, help me register one</option><option>Yes, connect it</option><option>Yes, discuss transfer</option><option>Not sure</option></select></label><label className="field"><span>Existing or preferred domain</span><input name="domain_name"/></label><label className="field"><span>Need booking or payments?</span><select name="commerce_needs"><option>No</option><option>Booking</option><option>Payments</option><option>Both</option></select></label><label className="field"><span>Is content ready?</span><select name="content_status"><option>No</option><option>Partly</option><option>Yes</option></select></label></div><p className="disclosure">Qualifying packages include an eligible standard domain for the first year. Eligible renewals are $29/year; premium domains cost extra.</p></section>}
          {isApp&&<section className="panel"><h2>3. App and AI questions</h2><div className="form-grid"><label className="field"><span>Platforms</span><select name="app_platforms" required><option>iOS and Android</option><option>iOS only</option><option>Android only</option><option>Mobile app and web dashboard</option></select></label><label className="field"><span>Revenue model</span><select name="revenue_model"><option>Free</option><option>Subscriptions</option><option>One-time purchases</option><option>Marketplace commissions</option><option>Not decided</option></select></label><label className="field"><span>Apple Developer account?</span><select name="apple_account"><option>No</option><option>Yes</option><option>Need guidance</option></select></label><label className="field"><span>Google Play account?</span><select name="google_account"><option>No</option><option>Yes</option><option>Need guidance</option></select></label><label className="field full"><span>Required features</span><textarea name="app_features" placeholder="Login, payments, messaging, maps, AI, notifications, uploads, admin dashboard..." required/></label><label className="field full"><span>What user data will be collected?</span><textarea name="data_collected" required/></label></div><p className="disclosure">Apple membership is currently $99/year and Google Play registration is currently $25 one time. Hosting, AI usage and other services are separate. Approval and publication are not guaranteed.</p></section>}
        </>}

        <section className="panel"><h2>{isLLC?'5':'4'}. Final confirmation</h2><div className="form-grid"><label className="field"><span>Full legal name</span><input name="signed_name" required/></label><label className="field"><span>Best contact phone</span><input name="phone" required/></label><label className="check-row full"><input type="checkbox" required/><span>I confirm the information is accurate. I understand all prices are estimates until reviewed, third-party and government fees may change, and Ederito does not guarantee approval or processing time.</span></label></div>{message&&<div className={`notice ${message.includes('submitted')?'success':'error'}`}>{message}</div>}<button className="button" disabled={busy}>{busy?'Submitting...':'Submit for review'}</button></section>
      </>}
    </form>
  </main>;
}