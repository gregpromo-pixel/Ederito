'use client';

import { useEffect } from 'react';
import baseFr from './start-project-translations-fr';
import baseEs from './start-project-translations-es';
import { fr as extraFr, es as extraEs } from './start-project-translations-extra';

type Lang = 'en' | 'fr' | 'es';
type Dictionary = Record<string, string>;

const dictionaries: Record<Exclude<Lang, 'en'>, Dictionary> = {
  fr: { ...baseFr, ...extraFr },
  es: { ...baseEs, ...extraEs }
};

const ignoredTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE']);
const attributes = ['placeholder', 'aria-label', 'title'] as const;
const textOriginals = new WeakMap<Text, string>();
const attributeOriginals = new WeakMap<Element, Partial<Record<(typeof attributes)[number], string>>>();

function language(): Lang {
  const stored = localStorage.getItem('ederito-portal-language') || localStorage.getItem('ederito-language');
  return stored === 'fr' || stored === 'es' ? stored : 'en';
}

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

  const person = value.match(/^Person (\d+)$/);
  if (person) return lang === 'fr' ? `Personne ${person[1]}` : `Persona ${person[1]}`;

  return value;
}

function shouldSkip(parent: HTMLElement | null) {
  if (!parent || ignoredTags.has(parent.tagName)) return true;
  if (parent.closest('textarea,[contenteditable="true"],.client-thread,.message-thread,.raw-responses')) return true;
  return false;
}

function translatePage(lang: Lang) {
  const root = document.querySelector('.intake-page');
  if (!root) return;
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;

  const dictionary = lang === 'en' ? null : dictionaries[lang];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const parent = node.parentElement;
    if (shouldSkip(parent)) continue;
    const current = node.nodeValue || '';
    const trimmed = current.trim();
    if (!trimmed) continue;

    if (!textOriginals.has(node)) textOriginals.set(node, trimmed);
    const original = textOriginals.get(node) || trimmed;
    const next = dictionary ? translateValue(original, lang as Exclude<Lang, 'en'>, dictionary) : original;
    if (trimmed !== next) node.nodeValue = current.replace(trimmed, next);
  }

  root.querySelectorAll<HTMLElement>('[placeholder],[aria-label],[title]').forEach((element) => {
    const known = attributeOriginals.get(element) || {};
    for (const attribute of attributes) {
      const current = element.getAttribute(attribute);
      if (!current) continue;
      if (!known[attribute]) known[attribute] = current;
      const original = known[attribute] || current;
      const next = dictionary ? translateValue(original, lang as Exclude<Lang, 'en'>, dictionary) : original;
      if (current !== next) element.setAttribute(attribute, next);
    }
    attributeOriginals.set(element, known);
  });
}

export default function StartProjectTranslations() {
  useEffect(() => {
    if (!window.location.pathname.startsWith('/start-project')) return;
    let activeLanguage = language();
    let scheduled = false;

    const run = () => {
      scheduled = false;
      translatePage(activeLanguage);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(run);
    };
    const onLanguage = (event: Event) => {
      const next = (event as CustomEvent<Lang>).detail;
      if (next !== 'en' && next !== 'fr' && next !== 'es') return;
      activeLanguage = next;
      schedule();
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
    window.addEventListener('ederito:language', onLanguage as EventListener);

    return () => {
      observer.disconnect();
      window.removeEventListener('ederito:language', onLanguage as EventListener);
    };
  }, []);

  return null;
}
