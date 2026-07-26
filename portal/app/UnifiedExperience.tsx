'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type Lang = 'en' | 'fr' | 'es';
type DashboardSection = 'projects' | 'proposals' | 'contracts' | 'invoices' | 'messages' | 'documents' | 'support';

const copy = {
  en: { home:'Ederito home', dashboard:'Dashboard', ai:'AI Studio', project:'New project', login:'Sign in', register:'Create account', signout:'Sign out', portal:'Client portal', projects:'Projects', proposals:'Proposals', contracts:'Contracts', invoices:'Invoices', messages:'Messages', documents:'Documents', support:'Support', operations:'Operations', company:'Company', services:'Services', legal:'Legal', privacy:'Privacy', terms:'Terms', contact:'Contact', rights:'All rights reserved.' },
  fr: { home:'Accueil Ederito', dashboard:'Tableau de bord', ai:'Studio IA', project:'Nouveau projet', login:'Connexion', register:'Créer un compte', signout:'Déconnexion', portal:'Portail client', projects:'Projets', proposals:'Propositions', contracts:'Contrats', invoices:'Factures', messages:'Messages', documents:'Documents', support:'Assistance', operations:'Opérations', company:'Entreprise', services:'Services', legal:'Juridique', privacy:'Confidentialité', terms:'Conditions', contact:'Contact', rights:'Tous droits réservés.' },
  es: { home:'Inicio de Ederito', dashboard:'Panel', ai:'Estudio IA', project:'Nuevo proyecto', login:'Iniciar sesión', register:'Crear cuenta', signout:'Cerrar sesión', portal:'Portal del cliente', projects:'Proyectos', proposals:'Propuestas', contracts:'Contratos', invoices:'Facturas', messages:'Mensajes', documents:'Documentos', support:'Soporte', operations:'Operaciones', company:'Empresa', services:'Servicios', legal:'Legal', privacy:'Privacidad', terms:'Términos', contact:'Contacto', rights:'Todos los derechos reservados.' }
};

function readCookie(): Lang | null {
  return document.cookie.match(/(?:^|; )ederito-language=(en|fr|es)/)?.[1] as Lang | null;
}

function persistLanguage(lang: Lang) {
  localStorage.setItem('ederito-language', lang);
  localStorage.setItem('ederito-portal-language', lang);
  document.cookie = `ederito-language=${lang}; Max-Age=31536000; Path=/; Domain=.ederito.com; SameSite=Lax; Secure`;
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
}

export default function UnifiedExperience() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>('en');
  const [dashboardSection, setDashboardSection] = useState<DashboardSection>('projects');
  const [hasOperations, setHasOperations] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem('ederito-portal-language') || localStorage.getItem('ederito-language')) as Lang | null;
    const next = readCookie() || (stored && ['en','fr','es'].includes(stored) ? stored : 'en');
    setLang(next);
    persistLanguage(next);
    const timer = window.setTimeout(() => setHasOperations(Boolean(document.querySelector('.admin-nav-link'))), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onLanguage = (event: Event) => {
      const next = (event as CustomEvent<Lang>).detail;
      if (!['en','fr','es'].includes(next)) return;
      setLang(next);
      persistLanguage(next);
    };
    window.addEventListener('ederito:language', onLanguage as EventListener);
    return () => window.removeEventListener('ederito:language', onLanguage as EventListener);
  }, []);

  const isAuth = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  const isDashboard = pathname.startsWith('/dashboard');
  const t = copy[lang];
  const section = useMemo(() => {
    if (pathname.startsWith('/ai-planner')) return t.ai;
    if (pathname.startsWith('/start-project')) return t.project;
    if (isDashboard) return t.dashboard;
    if (pathname.startsWith('/admin')) return t.operations;
    if (isAuth) return t.login;
    return t.portal;
  }, [isAuth, isDashboard, pathname, t]);

  function choose(next: Lang) {
    setLang(next);
    persistLanguage(next);
    window.dispatchEvent(new CustomEvent('ederito:language', { detail: next }));
  }

  function chooseDashboardSection(next: DashboardSection, index: number) {
    setDashboardSection(next);
    document.querySelectorAll<HTMLButtonElement>('.dashboard-nav button')[index]?.click();
    document.querySelector('.workspace-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const dashboardSections: DashboardSection[] = ['projects','proposals','contracts','invoices','messages','documents','support'];

  return <>
    <header className={`portal-command-header ${isDashboard ? 'has-workspace-row' : ''}`}>
      <div className="portal-command-inner">
        <a className="portal-command-brand" href="https://ederito.com" aria-label={t.home}>
          <img src="https://ederito.com/assets/eder-logo.png" alt=""/>
          <span>EDERITO</span>
          <small>{section}</small>
        </a>
        <nav className="portal-command-nav" aria-label="Portal navigation">
          {!isAuth && <Link className={isDashboard ? 'active' : ''} href="/dashboard">{t.dashboard}</Link>}
          {!isAuth && <Link className={pathname.startsWith('/ai-planner') ? 'active' : ''} href="/ai-planner">{t.ai}</Link>}
          {!isAuth && <Link className={pathname.startsWith('/start-project') ? 'active primary' : 'primary'} href="/start-project">{t.project}</Link>}
        </nav>
        <div className="portal-command-actions">
          <div className="portal-command-language" aria-label="Language">
            {(['en','fr','es'] as Lang[]).map((item) => <button type="button" key={item} onClick={() => choose(item)} className={lang === item ? 'active' : ''} aria-pressed={lang === item}>{item.toUpperCase()}</button>)}
          </div>
          {isAuth ? <div className="portal-auth-actions"><Link href="/login">{t.login}</Link><Link className="primary" href="/login?mode=register">{t.register}</Link></div> : <form action="/auth/signout" method="post"><button className="portal-signout">{t.signout}</button></form>}
        </div>
        {isDashboard && <nav className="portal-workspace-nav" aria-label="Workspace sections">
          {dashboardSections.map((item, index) => <button type="button" key={item} className={dashboardSection === item ? 'active' : ''} onClick={() => chooseDashboardSection(item, index)}>{t[item]}</button>)}
          {hasOperations && <Link href="/admin/intakes">{t.operations}</Link>}
        </nav>}
      </div>
    </header>

    <footer className="ederito-global-footer">
      <div className="ederito-footer-grid">
        <div className="ederito-footer-brand"><img src="https://ederito.com/assets/eder-logo.png" alt=""/><strong>EDERITO</strong><p>{t.portal}</p></div>
        <div><h3>{t.company}</h3><a href="https://ederito.com">{t.home}</a><Link href="/dashboard">{t.dashboard}</Link><Link href="/ai-planner">{t.ai}</Link></div>
        <div><h3>{t.services}</h3><Link href="/start-project">{t.project}</Link><a href="https://ederito.com/#services">{t.services}</a><a href="https://ederito.com/#contact">{t.contact}</a></div>
        <div><h3>{t.legal}</h3><a href="https://ederito.com/legal.html#terms">{t.terms}</a><a href="https://ederito.com/legal.html#privacy">{t.privacy}</a></div>
      </div>
      <div className="ederito-footer-bottom">
        <span>© {new Date().getFullYear()} Zanara Labs LLC. {t.rights}</span>
      </div>
    </footer>
  </>;
}
