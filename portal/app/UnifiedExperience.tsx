'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Lang = 'en' | 'fr' | 'es';
const copy = {
  en: { home: 'Website', dashboard: 'Dashboard', ai: 'AI Studio', project: 'New project' },
  fr: { home: 'Site web', dashboard: 'Tableau de bord', ai: 'Studio IA', project: 'Nouveau projet' },
  es: { home: 'Sitio web', dashboard: 'Panel', ai: 'Estudio IA', project: 'Nuevo proyecto' }
};

export default function UnifiedExperience() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const cookieLang = document.cookie.match(/(?:^|; )ederito-language=(en|fr|es)/)?.[1] as Lang | undefined;
    const stored = (localStorage.getItem('ederito-portal-language') || localStorage.getItem('ederito-language')) as Lang | null;
    const next = cookieLang || (stored && ['en','fr','es'].includes(stored) ? stored : 'en');
    setLang(next);
    localStorage.setItem('ederito-language', next);
    localStorage.setItem('ederito-portal-language', next);
    document.documentElement.lang = next;
  }, [pathname]);

  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password')) return null;
  const t = copy[lang];

  return <nav className="portal-experience-dock" aria-label="Ederito navigation">
    <a href="https://ederito.com"><b>⌂</b><span>{t.home}</span></a>
    <Link className={pathname.startsWith('/dashboard') ? 'active' : ''} href="/dashboard"><b>▦</b><span>{t.dashboard}</span></Link>
    <Link className={pathname.startsWith('/ai-planner') ? 'active' : ''} href="/ai-planner"><b>✦</b><span>{t.ai}</span></Link>
    <Link className={pathname.startsWith('/start-project') ? 'active primary' : 'primary'} href="/start-project"><b>＋</b><span>{t.project}</span></Link>
  </nav>;
}
