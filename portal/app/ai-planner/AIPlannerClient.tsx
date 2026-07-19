'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

type Lang = 'en' | 'fr' | 'es';
type Plan = {
  project_title: string;
  summary: string;
  recommended_journey: 'website' | 'app' | 'business';
  recommended_service: string;
  core_features: string[];
  questions_to_answer: string[];
  risks_and_dependencies: string[];
  recommended_next_step: string;
};

const copy = {
  en: {
    eyebrow: 'AI project planner',
    title: 'Turn your idea into a clear project brief.',
    lead: 'Describe what you want to build. Ederito AI will organize the idea, recommend the right service path, and prepare the next questions for human review.',
    projectName: 'Project or business name',
    businessType: 'Business type or industry',
    description: 'Describe your idea',
    audience: 'Who is it for?',
    budget: 'Approximate budget',
    timeline: 'Preferred timeline',
    analyze: 'Build my project brief',
    analyzing: 'Preparing your brief…',
    summary: 'Project summary',
    service: 'Recommended Ederito service',
    features: 'Core features',
    questions: 'Questions to answer next',
    risks: 'Dependencies to review',
    next: 'Recommended next step',
    continue: 'Continue with this project',
    dashboard: 'Back to dashboard',
    disclaimer: 'AI recommendations are preliminary and are reviewed by an Ederito specialist before pricing, contracts, or work begins.',
    placeholder: 'Example: I want a bilingual booking website for my salon with online deposits, automated reminders, and a customer account area.'
  },
  fr: {
    eyebrow: 'Planificateur de projet IA',
    title: 'Transformez votre idée en cahier de projet clair.',
    lead: 'Décrivez ce que vous souhaitez créer. L’IA Ederito organisera l’idée, recommandera le bon service et préparera les prochaines questions pour une révision humaine.',
    projectName: 'Nom du projet ou de l’entreprise',
    businessType: 'Type d’entreprise ou secteur',
    description: 'Décrivez votre idée',
    audience: 'À qui s’adresse le projet ?',
    budget: 'Budget approximatif',
    timeline: 'Délai souhaité',
    analyze: 'Créer mon cahier de projet',
    analyzing: 'Préparation de votre cahier…',
    summary: 'Résumé du projet',
    service: 'Service Ederito recommandé',
    features: 'Fonctionnalités principales',
    questions: 'Questions à préciser',
    risks: 'Dépendances à examiner',
    next: 'Prochaine étape recommandée',
    continue: 'Continuer avec ce projet',
    dashboard: 'Retour au tableau de bord',
    disclaimer: 'Les recommandations de l’IA sont préliminaires et sont révisées par un spécialiste Ederito avant tout prix, contrat ou début de travail.',
    placeholder: 'Exemple : je veux un site bilingue de réservation pour mon salon avec acomptes en ligne, rappels automatiques et espace client.'
  },
  es: {
    eyebrow: 'Planificador de proyectos con IA',
    title: 'Convierte tu idea en un plan de proyecto claro.',
    lead: 'Describe lo que quieres crear. La IA de Ederito organizará la idea, recomendará el servicio correcto y preparará las próximas preguntas para revisión humana.',
    projectName: 'Nombre del proyecto o negocio',
    businessType: 'Tipo de negocio o industria',
    description: 'Describe tu idea',
    audience: '¿Para quién es?',
    budget: 'Presupuesto aproximado',
    timeline: 'Plazo preferido',
    analyze: 'Crear mi plan de proyecto',
    analyzing: 'Preparando tu plan…',
    summary: 'Resumen del proyecto',
    service: 'Servicio de Ederito recomendado',
    features: 'Funciones principales',
    questions: 'Preguntas para responder',
    risks: 'Dependencias a revisar',
    next: 'Próximo paso recomendado',
    continue: 'Continuar con este proyecto',
    dashboard: 'Volver al panel',
    disclaimer: 'Las recomendaciones de IA son preliminares y serán revisadas por un especialista de Ederito antes de establecer precios, contratos o comenzar el trabajo.',
    placeholder: 'Ejemplo: quiero un sitio bilingüe de reservas para mi salón con depósitos en línea, recordatorios automáticos y un área para clientes.'
  }
};

export default function AIPlannerClient() {
  const [lang, setLang] = useState<Lang>('en');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const t = copy[lang];

  useEffect(() => {
    const saved = localStorage.getItem('ederito-portal-language') as Lang | null;
    if (saved && ['en', 'fr', 'es'].includes(saved)) setLang(saved);
  }, []);

  function chooseLanguage(next: Lang) {
    setLang(next);
    localStorage.setItem('ederito-portal-language', next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setPlan(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/ai/project-planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang,
        projectName: form.get('projectName'),
        businessType: form.get('businessType'),
        description: form.get('description'),
        audience: form.get('audience'),
        budget: form.get('budget'),
        timeline: form.get('timeline')
      })
    });

    const result = (await response.json()) as { plan?: Plan; error?: string };
    if (!response.ok || !result.plan) setError(result.error || 'Unable to prepare the project brief.');
    else setPlan(result.plan);
    setBusy(false);
  }

  const nextUrl = plan ? `/start-project?journey=${encodeURIComponent(plan.recommended_journey)}&service=${encodeURIComponent(plan.recommended_service)}` : '/start-project';

  return (
    <main className="shell portal ai-planner-page">
      <header className="topbar ai-planner-topbar">
        <Link className="brand" href="/dashboard">
          <img className="brand-logo" src="https://ederito.com/assets/eder-logo.png" alt="Ederito logo" />
          <span>EDERITO AI</span>
        </Link>
        <div className="ai-planner-actions">
          <div className="language-mini">
            {(['en', 'fr', 'es'] as Lang[]).map((code) => (
              <button type="button" key={code} className={lang === code ? 'active' : ''} onClick={() => chooseLanguage(code)}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <Link className="button secondary" href="/dashboard">{t.dashboard}</Link>
        </div>
      </header>

      <section className="ai-planner-hero">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.lead}</p>
        </div>
        <div className="ai-planner-proof">
          <span>01 · Structured brief</span>
          <span>02 · Service recommendation</span>
          <span>03 · Human review</span>
        </div>
      </section>

      <div className="ai-planner-layout">
        <form className="ai-planner-form" onSubmit={submit}>
          <label className="field"><span>{t.projectName}</span><input name="projectName" maxLength={120} /></label>
          <label className="field"><span>{t.businessType}</span><input name="businessType" maxLength={120} /></label>
          <label className="field full"><span>{t.description}</span><textarea name="description" rows={8} minLength={25} maxLength={4000} placeholder={t.placeholder} required /></label>
          <label className="field"><span>{t.audience}</span><input name="audience" maxLength={300} /></label>
          <label className="field"><span>{t.budget}</span><input name="budget" maxLength={100} placeholder="$500–$2,000" /></label>
          <label className="field full"><span>{t.timeline}</span><input name="timeline" maxLength={120} /></label>
          {error && <div className="notice error full">{error}</div>}
          <button className="button full" disabled={busy}>{busy ? t.analyzing : t.analyze}</button>
          <p className="ai-disclaimer full">{t.disclaimer}</p>
        </form>

        <section className={`ai-plan-result ${plan ? 'ready' : ''}`}>
          {!plan ? (
            <div className="ai-plan-empty">
              <span>AI</span>
              <h2>{t.summary}</h2>
              <p>{t.disclaimer}</p>
            </div>
          ) : (
            <>
              <p className="eyebrow">{t.summary}</p>
              <h2>{plan.project_title}</h2>
              <p className="ai-summary">{plan.summary}</p>
              <div className="ai-recommendation"><small>{t.service}</small><strong>{plan.recommended_service}</strong></div>
              <ResultList title={t.features} items={plan.core_features} />
              <ResultList title={t.questions} items={plan.questions_to_answer} />
              <ResultList title={t.risks} items={plan.risks_and_dependencies} />
              <div className="ai-next-step"><small>{t.next}</small><p>{plan.recommended_next_step}</p></div>
              <Link className="button" href={nextUrl}>{t.continue}</Link>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <div className="ai-result-list"><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
