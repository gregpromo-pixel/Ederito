'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

type Lang = 'en' | 'fr' | 'es';

const labels: Record<Lang, string> = {
  en: 'Workspace',
  fr: 'Espace',
  es: 'Espacio'
};

function currentLanguage(): Lang {
  const value = localStorage.getItem('ederito-portal-language') || localStorage.getItem('ederito-language');
  return value === 'fr' || value === 'es' ? value : 'en';
}

export default function AppleNavigationEnhancer() {
  const pathname = usePathname();

  useEffect(() => {
    document.querySelectorAll('.request-status-shortcut,.sales-shortcut').forEach((node) => node.remove());
    document.body.classList.add('apple-navigation-enabled');

    const header = document.querySelector<HTMLElement>('.portal-command-header');
    const workspace = document.querySelector<HTMLElement>('.portal-workspace-nav');
    const nav = document.querySelector<HTMLElement>('.portal-command-nav');

    document.querySelectorAll<HTMLButtonElement>('.apple-workspace-toggle').forEach((button) => button.remove());
    header?.classList.remove('apple-menu-open');

    if (!header || !nav || !workspace || !pathname.startsWith('/dashboard')) return;

    workspace.classList.add('apple-workspace-panel');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'apple-workspace-toggle';
    toggle.textContent = labels[currentLanguage()];
    toggle.setAttribute('aria-expanded', 'false');

    const close = () => {
      header.classList.remove('apple-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
      const open = header.classList.toggle('apple-menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    const onLanguage = (event: Event) => {
      const next = (event as CustomEvent<Lang>).detail;
      if (next === 'en' || next === 'fr' || next === 'es') toggle.textContent = labels[next];
    };

    toggle.addEventListener('click', openMenu);
    workspace.addEventListener('click', close);
    document.addEventListener('keydown', onEscape);
    window.addEventListener('ederito:language', onLanguage as EventListener);
    nav.prepend(toggle);

    return () => {
      toggle.removeEventListener('click', openMenu);
      workspace.removeEventListener('click', close);
      document.removeEventListener('keydown', onEscape);
      window.removeEventListener('ederito:language', onLanguage as EventListener);
      toggle.remove();
      header.classList.remove('apple-menu-open');
    };
  }, [pathname]);

  return null;
}
