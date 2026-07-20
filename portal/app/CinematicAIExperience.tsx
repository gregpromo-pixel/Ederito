'use client';

import { useEffect } from 'react';

type Lang = 'en' | 'fr' | 'es';

const copy = {
  en: {
    title: 'Building your project universe',
    subtitle: 'Ederito AI is connecting strategy, experience, technology, and launch.',
    stages: ['Reading your vision', 'Structuring the opportunity', 'Designing the experience', 'Mapping the technology', 'Preparing the launch'],
    graph: ['Idea', 'Strategy', 'Experience', 'Technology', 'Launch'],
    complete: 'Your project universe is ready.'
  },
  fr: {
    title: 'Création de votre univers de projet',
    subtitle: 'L’IA Ederito relie la stratégie, l’expérience, la technologie et le lancement.',
    stages: ['Lecture de votre vision', 'Structuration de l’opportunité', 'Conception de l’expérience', 'Cartographie de la technologie', 'Préparation du lancement'],
    graph: ['Idée', 'Stratégie', 'Expérience', 'Technologie', 'Lancement'],
    complete: 'Votre univers de projet est prêt.'
  },
  es: {
    title: 'Creando el universo de tu proyecto',
    subtitle: 'La IA de Ederito conecta estrategia, experiencia, tecnología y lanzamiento.',
    stages: ['Leyendo tu visión', 'Estructurando la oportunidad', 'Diseñando la experiencia', 'Trazando la tecnología', 'Preparando el lanzamiento'],
    graph: ['Idea', 'Estrategia', 'Experiencia', 'Tecnología', 'Lanzamiento'],
    complete: 'El universo de tu proyecto está listo.'
  }
} as const;

function getLang(): Lang {
  const stored = localStorage.getItem('ederito-language') || localStorage.getItem('ederito-portal-language');
  return stored === 'fr' || stored === 'es' ? stored : 'en';
}

function buildOverlay(lang: Lang) {
  const t = copy[lang];
  const overlay = document.createElement('section');
  overlay.className = 'cinematic-ai-overlay';
  overlay.setAttribute('aria-live', 'polite');
  overlay.innerHTML = `
    <div class="cinematic-ai-backdrop"></div>
    <div class="cinematic-ai-stage">
      <div class="cinematic-ai-orbit" aria-hidden="true">
        <span class="cinematic-ai-core">AI</span>
        <i></i><i></i><i></i><i></i>
      </div>
      <p class="eyebrow">EDERITO INTELLIGENCE</p>
      <h2>${t.title}</h2>
      <p>${t.subtitle}</p>
      <div class="cinematic-ai-progress"><span></span></div>
      <strong class="cinematic-ai-status">${t.stages[0]}</strong>
      <div class="cinematic-ai-nodes">
        ${t.graph.map((item, index) => `<article style="--node-index:${index}"><b>${String(index + 1).padStart(2, '0')}</b><span>${item}</span></article>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  return overlay;
}

function addResultUniverse(result: Element, lang: Lang) {
  if (result.querySelector('.cinematic-result-universe')) return;
  const t = copy[lang];
  const universe = document.createElement('section');
  universe.className = 'cinematic-result-universe';
  universe.innerHTML = `
    <header><span>PROJECT UNIVERSE</span><strong>${t.complete}</strong></header>
    <div class="cinematic-universe-map">
      ${t.graph.map((item, index) => `<article style="--node-index:${index}"><i></i><b>${String(index + 1).padStart(2, '0')}</b><span>${item}</span></article>`).join('')}
      <svg viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true"><path d="M95 90 C180 20 270 160 365 90 S550 20 640 90 S820 160 905 90"/></svg>
    </div>`;
  const heading = result.querySelector('h2');
  if (heading?.parentElement) heading.parentElement.insertBefore(universe, heading.nextSibling);
  else result.prepend(universe);
  requestAnimationFrame(() => universe.classList.add('visible'));
}

export default function CinematicAIExperience() {
  useEffect(() => {
    if (!document.querySelector('.ai-planner-page')) return;

    let overlay: HTMLElement | null = null;
    let timers: number[] = [];

    const clearTimers = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
    };

    const removeOverlay = () => {
      clearTimers();
      if (!overlay) return;
      overlay.classList.add('complete');
      window.setTimeout(() => {
        overlay?.remove();
        overlay = null;
      }, 650);
    };

    const runSequence = () => {
      removeOverlay();
      const lang = getLang();
      overlay = buildOverlay(lang);
      const status = overlay.querySelector('.cinematic-ai-status');
      const nodes = Array.from(overlay.querySelectorAll('.cinematic-ai-nodes article'));
      const progress = overlay.querySelector('.cinematic-ai-progress span') as HTMLElement | null;
      copy[lang].stages.forEach((stage, index) => {
        timers.push(window.setTimeout(() => {
          if (status) status.textContent = stage;
          nodes[index]?.classList.add('active');
          if (progress) progress.style.width = `${((index + 1) / copy[lang].stages.length) * 100}%`;
        }, 350 + index * 700));
      });
    };

    const form = document.querySelector('.ai-planner-form');
    const submit = form?.querySelector('button[type="submit"]');
    submit?.addEventListener('click', runSequence);

    const observer = new MutationObserver(() => {
      const result = document.querySelector('.ai-plan-result');
      if (!result) return;
      addResultUniverse(result, getLang());
      removeOverlay();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      submit?.removeEventListener('click', runSequence);
      observer.disconnect();
      removeOverlay();
    };
  }, []);

  return null;
}
