'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Lang = 'en' | 'fr' | 'es';
const text = {
  en: { eyebrow:'Secure client access', title:'Everything about your project, in one place.', lead:'Review projects, contracts, invoices, maintenance and support requests.', signIn:'Sign in', register:'Create account', name:'Full name', email:'Email', password:'Password', submitIn:'Continue securely', submitUp:'Create secure account', switchUp:'New to Ederito?', switchIn:'Already have an account?', verify:'Check your email to verify your account.', forgot:'Forgot password?' },
  fr: { eyebrow:'Accès client sécurisé', title:'Tout votre projet, au même endroit.', lead:'Consultez vos projets, contrats, factures, maintenance et demandes d’assistance.', signIn:'Connexion', register:'Créer un compte', name:'Nom complet', email:'E-mail', password:'Mot de passe', submitIn:'Continuer en sécurité', submitUp:'Créer le compte', switchUp:'Nouveau chez Ederito ?', switchIn:'Vous avez déjà un compte ?', verify:'Consultez votre e-mail pour vérifier votre compte.', forgot:'Mot de passe oublié ?' },
  es: { eyebrow:'Acceso seguro para clientes', title:'Todo sobre tu proyecto, en un solo lugar.', lead:'Consulta proyectos, contratos, facturas, mantenimiento y soporte.', signIn:'Iniciar sesión', register:'Crear cuenta', name:'Nombre completo', email:'Correo electrónico', password:'Contraseña', submitIn:'Continuar de forma segura', submitUp:'Crear cuenta segura', switchUp:'¿Nuevo en Ederito?', switchIn:'¿Ya tienes una cuenta?', verify:'Revisa tu correo para verificar la cuenta.', forgot:'¿Olvidaste tu contraseña?' }
};

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

function sharedLanguage(): Lang | null {
  return document.cookie.match(/(?:^|; )ederito-language=(en|fr|es)/)?.[1] as Lang | null;
}

function persistLanguage(language: Lang) {
  localStorage.setItem('ederito-language', language);
  localStorage.setItem('ederito-portal-language', language);
  document.cookie = `ederito-language=${language}; Max-Age=31536000; Path=/; Domain=.ederito.com; SameSite=Lax; Secure`;
  document.documentElement.lang = language;
  document.documentElement.dataset.lang = language;
}

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [mode, setMode] = useState<'signin'|'register'>('signin');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [nextPath, setNextPath] = useState('/dashboard');
  const t = text[lang];

  useEffect(() => {
    const saved = (localStorage.getItem('ederito-portal-language') || localStorage.getItem('ederito-language')) as Lang | null;
    const nextLanguage = sharedLanguage() || (saved && ['en','fr','es'].includes(saved) ? saved : 'en');
    setLang(nextLanguage);
    persistLanguage(nextLanguage);

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') setMode('register');
    const requestedNext = safeNext(params.get('next'));
    setNextPath(requestedNext);
    if (requestedNext !== '/dashboard') localStorage.setItem('ederito-pending-project-path', requestedNext);

    const onLanguage = (event: Event) => {
      const next = (event as CustomEvent<Lang>).detail;
      if (!['en','fr','es'].includes(next)) return;
      setLang(next);
      persistLanguage(next);
    };
    window.addEventListener('ederito:language', onLanguage as EventListener);
    return () => window.removeEventListener('ederito:language', onLanguage as EventListener);
  }, []);

  const confirmationUrl = useMemo(() => {
    const encodedNext = encodeURIComponent(nextPath);
    return `${typeof window === 'undefined' ? '' : window.location.origin}/dashboard?next=${encodedNext}`;
  }, [nextPath]);

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
        options: { data: { full_name: fullName }, emailRedirectTo: confirmationUrl }
      });
      setMessage(error ? error.message : t.verify);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = nextPath;
    }
    setBusy(false);
  }

  return <main className="shell auth-layout">
    <section className="auth-copy">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="hero-title">{t.title}</h1>
      <p className="lead">{t.lead}</p>
    </section>
    <section className="card">
      <div className="switch"><strong>{mode === 'signin' ? t.signIn : t.register}</strong></div>
      <form className="form" onSubmit={submit}>
        {mode === 'register' && <label className="field"><span>{t.name}</span><input name="fullName" required minLength={2} maxLength={100}/></label>}
        <label className="field"><span>{t.email}</span><input name="email" type="email" required autoComplete="email"/></label>
        <label className="field"><span>{t.password}</span><input name="password" type="password" required minLength={10} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}/></label>
        {mode === 'signin' && <div className="password-link"><Link href="/forgot-password">{t.forgot}</Link></div>}
        {message && <div className="notice">{message}</div>}
        <button className="button" disabled={busy}>{busy ? '…' : mode === 'signin' ? t.submitIn : t.submitUp}</button>
      </form>
      <p className="switch" style={{marginTop:20}}><span>{mode === 'signin' ? t.switchUp : t.switchIn}</span><button type="button" onClick={() => { setMode(mode === 'signin' ? 'register' : 'signin'); setMessage(''); }}>{mode === 'signin' ? t.register : t.signIn}</button></p>
    </section>
  </main>;
}
