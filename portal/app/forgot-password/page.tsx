'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Lang='en'|'fr'|'es';
const copy={
  en:{title:'Reset your password',lead:'Enter your email and we will send you a secure reset link.',email:'Email',send:'Send reset link',sent:'Check your email for the reset link.',back:'Back to sign in'},
  fr:{title:'Réinitialiser votre mot de passe',lead:'Saisissez votre e-mail et nous vous enverrons un lien sécurisé.',email:'E-mail',send:'Envoyer le lien',sent:'Consultez votre e-mail pour le lien de réinitialisation.',back:'Retour à la connexion'},
  es:{title:'Restablecer tu contraseña',lead:'Ingresa tu correo y te enviaremos un enlace seguro.',email:'Correo electrónico',send:'Enviar enlace',sent:'Revisa tu correo para encontrar el enlace.',back:'Volver al inicio de sesión'}
};

export default function ForgotPasswordPage(){
  const [lang,setLang]=useState<Lang>('en');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{const saved=localStorage.getItem('ederito-portal-language') as Lang|null;if(saved&&['en','fr','es'].includes(saved))setLang(saved)},[]);
  const t=copy[lang];
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage(null);setError(null);
    const email=String(new FormData(event.currentTarget).get('email')||'').trim();
    const supabase=createClient();
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});
    if(error)setError(error.message);else setMessage(t.sent);
    setBusy(false);
  }
  function choose(next:Lang){setLang(next);localStorage.setItem('ederito-portal-language',next)}
  return <main className="shell auth-layout single-auth">
    <section className="auth-copy">
      <div className="brand"><img className="brand-logo" src="/ederito-logo.svg" alt="Ederito logo"/><span>EDERITO PORTAL</span></div>
      <p className="eyebrow" style={{marginTop:64}}>ACCOUNT SECURITY</p>
      <h1 className="hero-title compact-title">{t.title}</h1><p className="lead">{t.lead}</p>
    </section>
    <section className="card">
      <div className="switch"><strong>{t.title}</strong><span>{(['en','fr','es'] as Lang[]).map(x=><button type="button" key={x} onClick={()=>choose(x)} style={{marginLeft:10,fontWeight:x===lang?800:500}}>{x.toUpperCase()}</button>)}</span></div>
      <form className="form" onSubmit={submit}>
        <label className="field"><span>{t.email}</span><input name="email" type="email" required autoComplete="email"/></label>
        {error&&<div className="notice error">{error}</div>}{message&&<div className="notice success">{message}</div>}
        <button className="button" disabled={busy}>{busy?'…':t.send}</button>
      </form>
      <p className="switch" style={{marginTop:20}}><Link href="/login">{t.back}</Link></p>
    </section>
  </main>
}