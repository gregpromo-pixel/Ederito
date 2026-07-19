'use client';

import { useEffect } from 'react';
import fr from './start-project-translations-fr';
import es from './start-project-translations-es';

type Lang = 'en' | 'fr' | 'es';
type Dictionary = Record<string, string>;

const dictionaries: Record<Exclude<Lang, 'en'>, Dictionary> = { fr, es };
const ignoredTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE']);
const attributes = ['placeholder', 'aria-label', 'title'] as const;

function translateValue(value: string, lang: Exclude<Lang, 'en'>, dictionary: Dictionary): string {
  const exact = dictionary[value];
  if (exact) return exact;

  const weeks = value.match(/^(\d+)(?:-(\d+))? weeks$/);
  if (weeks) {
    const range = weeks[2] ? `${weeks[1]}-${weeks[2]}` : weeks[1];
    return lang === 'fr' ? `${range} semaines` : `${range} semanas`;
  }

  const registeredAddress = value.match(/^Registered-agent physical street address in (.+)$/);
  if (registeredAddress) {
    return lang === 'fr'
      ? `Adresse physique de l’agent enregistré en ${registeredAddress[1]}`
      : `Dirección física del agente registrado en ${registeredAddress[1]}`;
  }

  return value;
}

function translatePage(lang: Lang) {
  if (lang === 'en') return;
  const dictionary = dictionaries[lang];
  const root = document.querySelector('.intake-page');
  if (!root) return;

  document.documentElement.lang = lang;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || ignoredTags.has(parent.tagName) || parent.closest('textarea,[contenteditable="true"]')) continue;
    const current = node.nodeValue || '';
    const original = current.trim();
    if (!original) continue;
    const translated = translateValue(original, lang, dictionary);
    if (translated !== original) node.nodeValue = current.replace(original, translated);
  }

  root.querySelectorAll<HTMLElement>('[placeholder],[aria-label],[title]').forEach((element) => {
    for (const attribute of attributes) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const translated = translateValue(value, lang, dictionary);
      if (translated !== value) element.setAttribute(attribute, translated);
    }
  });
}

export default function StartProjectTranslations() {
  useEffect(() => {
    if (!window.location.pathname.startsWith('/start-project')) return;
    const saved = localStorage.getItem('ederito-portal-language');
    const lang: Lang = saved === 'fr' || saved === 'es' ? saved : 'en';
    if (lang === 'en') return;

    let scheduled = false;
    const run = () => {
      scheduled = false;
      translatePage(lang);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(run);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title']
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
