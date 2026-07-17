'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Lang='en'|'fr'|'es';
const copy={
  en:{title:'Choose a new password',lead:'Use at least 10 characters for stronger protection.',password:'New password',confirm:'Confirm password',save:'Update password',success:'Your password has been updated. You can now sign in.',mismatch:'Passwords do not match.',back:'Go to sign in'},
  fr:{title:'Choisissez un nouveau mot de passe',lead:'Utilisez au moins 10 caractères pour une meilleure sécurité.',password:'Nouveau mot de passe',confirm:'Confirmer le mot de passe',save:'Mettre à jour',success:'Votre mot de passe a été mis à jour. Vous pouvez vous connecter.',mismatch:'Les mots de passe ne correspondent pas.',back:'Aller à la connexion'},
  es:{title:'Elige una nueva contraseña',lead:'Usa al menos 10 caracteres para mayor seguridad.',password:'Nueva contraseña',confirm:'Confirmar contraseña',save:'Actualizar contraseña',success:'Tu contraseña fue actualizada. Ya puedes iniciar sesión.',mismatch:'Las contraseñas no coinciden.',back:'Ir al inicio de sesión'}
};

export default function ResetPasswordPage(){
  const [lang,setLang]=useState<Lang>('en');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{const saved=localStorage.getItem('ederito-portal-language') as Lang|null;if(saved&&['en','fr','es'].includes(saved))setLang(saved)},[]);
  const t=copy[lang];
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage(null);setError(null);
    const form=new FormData(event.currentTarget);const password=String(form.get('password')||'');const confirm=String(form.get('confirm')||'');
    if(password!==confirm){setError(t.mismatch);setBusy(false);return}
    const supabase=createClient();const {error}=await supabase.auth.updateUser({password});
    if(error)setError(error.message);else setMessage(t.success);setBusy(false);
  }
  function choose(next:Lang){setLang(next);localStorage.setItem('ederito-portal-language',next)}
  return <main className="shell auth-layout single-auth">
    <section className="auth-copy"><div className="brand"><img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito logo"/><span>EDERITO PORTAL</span></div><p className="eyebrow" style={{marginTop:64}}>ACCOUNT SECURITY</p><h1 className="hero-title compact-title">{t.title}</h1><p className="lead">{t.lead}</p></section>
    <section className="card"><div className="switch"><strong>{t.title}</strong><span>{(['en','fr','es'] as Lang[]).map(x=><button type="button" key={x} onClick={()=>choose(x)} style={{marginLeft:10,fontWeight:x===lang?800:500}}>{x.toUpperCase()}</button>)}</span></div>
      <form className="form" onSubmit={submit}><label className="field"><span>{t.password}</span><input name="password" type="password" required minLength={10} autoComplete="new-password"/></label><label className="field"><span>{t.confirm}</span><input name="confirm" type="password" required minLength={10} autoComplete="new-password"/></label>{error&&<div className="notice error">{error}</div>}{message&&<div className="notice success">{message}</div>}<button className="button" disabled={busy}>{busy?'…':t.save}</button></form><p className="switch" style={{marginTop:20}}><Link href="/login">{t.back}</Link></p>
    </section>
  </main>
}
