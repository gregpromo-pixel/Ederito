'use client';

import { useEffect } from 'react';

const labels = {
  en: 'Plan with AI',
  fr: 'Planifier avec l’IA',
  es: 'Planificar con IA'
};

export default function AIPlannerShortcut() {
  useEffect(() => {
    if (window.location.pathname !== '/dashboard') return;

    const install = () => {
      if (document.querySelector('[data-ai-planner-shortcut]')) return true;
      const actions = document.querySelector('.dashboard-hero-actions');
      if (!actions) return false;

      const lang = (localStorage.getItem('ederito-portal-language') || 'en') as keyof typeof labels;
      const link = document.createElement('a');
      link.href = '/ai-planner';
      link.className = 'button secondary ai-planner-shortcut';
      link.dataset.aiPlannerShortcut = 'true';
      link.textContent = labels[lang] || labels.en;
      actions.appendChild(link);
      return true;
    };

    if (install()) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (install() || attempts >= 30) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
