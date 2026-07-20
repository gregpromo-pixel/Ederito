'use client';

import { useEffect } from 'react';

export default function AppleNavigationEnhancer() {
  useEffect(() => {
    document.querySelectorAll('.request-status-shortcut,.sales-shortcut').forEach((node) => node.remove());
    document.body.classList.add('apple-navigation-enabled');
    const header = document.querySelector('.portal-command-header');
    const workspace = document.querySelector('.portal-workspace-nav');
    const nav = document.querySelector('.portal-command-nav');
    if (!header || !workspace || !nav || header.querySelector('.apple-workspace-toggle')) return;
    workspace.classList.add('apple-workspace-panel');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'apple-workspace-toggle';
    toggle.textContent = 'Workspace';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('apple-menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.prepend(toggle);
    workspace.addEventListener('click', () => {
      header.classList.remove('apple-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }, []);
  return null;
}
