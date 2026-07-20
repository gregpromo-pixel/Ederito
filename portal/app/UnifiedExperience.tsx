'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type Lang = 'en' | 'fr' | 'es';
type DashboardSection = 'projects' | 'contracts' | 'invoices' | 'messages' | 'support';

const copy = {
  en: { explore:'Explore Ederito', dashboard:'Dashboard', ai:'AI Studio', project:'New project', login:'Sign in', register:'Create account', signout:'Sign out', portal:'Client portal', projects:'Projects', contracts:'Contracts', invoices:'Invoices', messages:'Messages', support:'Support', operations:'Operations' },
  fr: { explore:'Découvrir Ederito', dashboard:'Tableau de bord', ai:'Studio IA', project:'Nouveau projet', login:'Connexion', register:'Créer un compte', signout:'Déconnexion', portal:'Portail client', projects:'Projets', contracts:'Contrats', invoices:'Factures', messages:'Messages', support:'Assistance', operations:'Opérations' },
  es: { explore:'Explorar Ederito', dashboard:'Panel', ai:'Estudio IA', project:'Nuevo proyecto', login:'Iniciar sesión', register:'Crear cuenta', signout:'Cerrar sesión', portal:'Portal del cliente', projects:'Proyectos', contracts:'Contratos', invoices:'Facturas', messages:'Mensajes', support:'Soporte', operations:'Operaciones' }
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

    const syncFromPage = () => setHasOperations(Boolean(document.querySelector('.admin-nav-link')));
    const timer = window.setTimeout(syncFromPage, 0);
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
    if (isAuth) return t.login;
    return t.portal;
  }, [isAuth, isDashboard, pathname, t]);

  function choose(next: Lang) {
    setLang(next);
    persistLanguage(next);
    window.dispatchEvent(new CustomEvent('ederito:language', { detail: next }));
    const localControl = Array.from(document.querySelectorAll<HTMLButtonElement>('.language-mini button')).find(button => button.textContent?.trim().toLowerCase() === next);
    if (localControl && !localControl.classList.contains('active')) localControl.click();
  }

  function chooseDashboardSection(next: DashboardSection, index: number) {
    setDashboardSection(next);
    const control = document.querySelectorAll<HTMLButtonElement>('.dashboard-nav button')[index];
    control?.click();
    document.querySelector('.workspace-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const dashboardSections: DashboardSection[] = ['projects','contracts','invoices','messages','support'];

  return <header className={`portal-command-header ${isDashboard ? 'has-workspace-row' : ''}`}>
    <div className="portal-command-inner">
      <a className="portal-command-brand" href="https://ederito.com" aria-label={t.explore}>
        <img src="https://ederito.com/assets/eder-logo.png" alt=""/>
        <span>EDERITO</span>
        <small>{section}</small>
      </a>

      <nav className="portal-command-nav" aria-label="Portal navigation">
        <a href="https://ederito.com" className={isAuth ? 'portal-explore-link' : ''}>{t.explore}</a>
        {!isAuth && <Link className={isDashboard ? 'active' : ''} href="/dashboard">{t.dashboard}</Link>}
        {!isAuth && <Link className={pathname.startsWith('/ai-planner') ? 'active' : ''} href="/ai-planner">{t.ai}</Link>}
        {!isAuth && <Link className={pathname.startsWith('/start-project') ? 'active primary' : 'primary'} href="/start-project">{t.project}</Link>}
      </nav>

      <div className="portal-command-actions">
        <div className="portal-command-language" aria-label="Language">
          {(['en','fr','es'] as Lang[]).map(code => <button type="button" key={code} className={code === lang ? 'active' : ''} onClick={() => choose(code)}>{code.toUpperCase()}</button>)}
        </div>
        {isAuth ? <div className="portal-auth-actions"><Link href="/login">{t.login}</Link><Link className="primary" href="/login?mode=register">{t.register}</Link></div> : <form action="/auth/signout" method="post"><button className="portal-signout">{t.signout}</button></form>}
      </div>

      {isDashboard && <nav className="portal-workspace-nav" aria-label="Workspace sections">
        {dashboardSections.map((item, index) => <button type="button" key={item} className={dashboardSection === item ? 'active' : ''} onClick={() => chooseDashboardSection(item, index)}>{t[item]}</button>)}
        {hasOperations && <Link href="/admin/intakes">{t.operations}</Link>}
      </nav>}
    </div>
  </header>;
}
