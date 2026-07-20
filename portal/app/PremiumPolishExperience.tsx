'use client';

import { useEffect } from 'react';

const supported = ['en', 'fr', 'es'] as const;
type Language = (typeof supported)[number];

function cookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function normalize(value: string | null): Language | null {
  return supported.includes(value as Language) ? (value as Language) : null;
}

export default function PremiumPolishExperience() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');

    const syncEnvironment = () => {
      root.classList.toggle('reduced-motion', reduced.matches);
      root.classList.toggle('coarse-pointer', coarse.matches);
      root.style.setProperty('--app-height', `${window.visualViewport?.height || window.innerHeight}px`);
    };

    const syncLanguage = () => {
      const selected = normalize(cookie('ederito-language')) || normalize(localStorage.getItem('ederito-portal-language')) || normalize(localStorage.getItem('ederito-language')) || 'en';
      root.lang = selected;
      root.dataset.lang = selected;
      localStorage.setItem('ederito-language', selected);
      localStorage.setItem('ederito-portal-language', selected);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) body.classList.add('keyboard-open');
    };
    const onFocusOut = () => window.setTimeout(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active?.matches('input, textarea, select, [contenteditable="true"]')) body.classList.remove('keyboard-open');
    }, 80);
    const onPointer = () => body.classList.add('had-pointer');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') body.classList.remove('had-pointer');
      if (event.key === 'Escape') (document.activeElement as HTMLElement | null)?.blur();
    };

    syncEnvironment();
    syncLanguage();
    window.addEventListener('resize', syncEnvironment, { passive: true });
    window.visualViewport?.addEventListener('resize', syncEnvironment, { passive: true });
    reduced.addEventListener('change', syncEnvironment);
    coarse.addEventListener('change', syncEnvironment);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('pointerdown', onPointer, { passive: true });
    document.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('resize', syncEnvironment);
      window.visualViewport?.removeEventListener('resize', syncEnvironment);
      reduced.removeEventListener('change', syncEnvironment);
      coarse.removeEventListener('change', syncEnvironment);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return null;
}
