'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Lang = 'en' | 'fr' | 'es';
const text = {
  en: { eyebrow:'Secure client access', title:'Everything about your project, in one place.', lead:'Review projects, contracts, invoices, maintenance and support requests.', signIn:'Sign in', register:'Create account', name:'Full name', email:'Email', password:'Password', submitIn:'Continue securely', submitUp:'Create secure account', switchUp:'New to Ederito?', switchIn:'Already have an account?', verify:'Check your email to verify your account.', forgot:'Forgot password?' },
  fr: { eyebrow:'Accès client sécurisé', title:'Tout votre projet, au même endroit.', lead:'Consultez vos projets, contrats, factures, maintenance et demandes d’assistance.', signIn:'Connexion', register:'Créer un compte', name:'Nom complet', email:'E-mail', password:'Mot de passe', submitIn:'Continuer en sécurité', submitUp:'Créer le compte', switchUp:'Nouveau chez Ederito ?', switchIn:'Vous avez déjà un compte ?', verify:'Consultez votre e-mail pour vérifier votre compte.', forgot:'Mot de passe oublié ?' },
  es: { eyebrow:'Acceso seguro para clientes', title:'Todo sobre tu proyecto, en un solo lugar.', lead:'Consulta proyectos, contratos, facturas, mantenimiento y soporte.', signIn:'Iniciar sesión', register:'Crear cuenta', name:'Nombre completo', email:'Correo electrónico', password:'Contraseña', submitIn:'Continuar de forma segura', submitUp:'Crear cuenta segura', switchUp:'¿Nuevo en Ederito?', switchIn:'¿Ya tienes una cuenta?', verify:'Revisa tu correo para verificar la cuenta.', forgot:'¿Olvidaste tu contraseña?' }
};

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [mode, setMode] = useState<'signin'|'register'>('signin');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>('');
  const t = text[lang];

  useEffect(() => {
    const saved = localStorage.getItem('ederito-portal-language') as Lang | null;
    if (saved && ['en','fr','es'].includes(saved)) setLang(saved);
  }, []);

  function choose(next: Lang) {
    setLang(next);
    localStorage.setItem('ederito-portal-language', next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const fullName = String(form.get('fullName') || '').trim();
    const supabase = createClient();

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/dashboard` }
      });
      setMessage(error ? error.message : t.verify);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/dashboard';
    }
    setBusy(false);
  }

  return <main className="shell auth-layout">
    <section className="auth-copy">
      <div className="brand"><img className="brand-logo" src="/ederito-logo.svg" alt="Ederito logo"/><span>EDERITO PORTAL</span></div>
      <p className="eyebrow" style={{marginTop:64}}>{t.eyebrow}</p>
      <h1 className="hero-title">{t.title}</h1>
      <p className="lead">{t.lead}</p>
    </section>
    <section className="card">
      <div className="switch"><strong>{mode === 'signin' ? t.signIn : t.register}</strong><span>{(['en','fr','es'] as Lang[]).map(code => <button key={code} onClick={() => choose(code)} style={{marginLeft:10,fontWeight:code === lang ? 800 : 500}}>{code.toUpperCase()}</button>)}</span></div>
      <form className="form" onSubmit={submit}>
        {mode === 'register' && <label className="field"><span>{t.name}</span><input name="fullName" required minLength={2} maxLength={100}/></label>}
        <label className="field"><span>{t.email}</span><input name="email" type="email" required autoComplete="email"/></label>
        <label className="field"><span>{t.password}</span><input name="password" type="password" required minLength={10} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}/></label>
        {mode === 'signin' && <div className="password-link"><Link href="/forgot-password">{t.forgot}</Link></div>}
        {message && <div className="notice">{message}</div>}
        <button className="button" disabled={busy}>{busy ? '…' : mode === 'signin' ? t.submitIn : t.submitUp}</button>
      </form>
      <p className="switch" style={{marginTop:20}}><span>{mode === 'signin' ? t.switchUp : t.switchIn}</span><button onClick={() => { setMode(mode === 'signin' ? 'register' : 'signin'); setMessage(''); }}>{mode === 'signin' ? t.register : t.signIn}</button></p>
    </section>
  </main>;
}
