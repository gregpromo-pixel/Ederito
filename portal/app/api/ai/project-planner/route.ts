import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type PlannerRequest = {
  language?: 'en' | 'fr' | 'es';
  projectName?: string;
  businessType?: string;
  description?: string;
  audience?: string;
  budget?: string;
  timeline?: string;
};

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'project_title',
    'summary',
    'recommended_journey',
    'recommended_service',
    'core_features',
    'questions_to_answer',
    'risks_and_dependencies',
    'recommended_next_step'
  ],
  properties: {
    project_title: { type: 'string' },
    summary: { type: 'string' },
    recommended_journey: { type: 'string', enum: ['website', 'app', 'business'] },
    recommended_service: { type: 'string' },
    core_features: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 8 },
    questions_to_answer: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 8 },
    risks_and_dependencies: { type: 'array', items: { type: 'string' }, maxItems: 6 },
    recommended_next_step: { type: 'string' }
  }
} as const;

function getOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as { output_text?: unknown; output?: unknown };
  if (typeof data.output_text === 'string') return data.output_text;
  if (!Array.isArray(data.output)) return null;

  for (const item of data.output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === 'string') return text;
    }
  }
  return null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI planning is not configured yet. Add OPENAI_API_KEY in Vercel.' },
      { status: 503 }
    );
  }

  let body: PlannerRequest;
  try {
    body = (await request.json()) as PlannerRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const description = String(body.description || '').trim();
  if (description.length < 25) {
    return NextResponse.json({ error: 'Please describe the project in at least 25 characters.' }, { status: 400 });
  }

  const language = body.language === 'fr' || body.language === 'es' ? body.language : 'en';
  const languageName = language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English';

  const prompt = `You are Ederito's project-planning assistant. Turn the client's idea into a concise professional brief in ${languageName}.

Ederito offers websites, landing pages, portfolios, e-commerce, booking systems, mobile apps, web apps, client portals, branding, SEO, AI assistants, infrastructure, maintenance, and administrative LLC formation assistance.

Rules:
- Recommend exactly one journey: website, app, or business.
- Do not provide legal, tax, financial, or guaranteed pricing advice.
- Do not invent facts, deadlines, or budgets.
- Keep the result practical and suitable for review by a human Ederito specialist.
- For branding, SEO, infrastructure, maintenance, e-commerce, and AI automation, choose the closest website or app journey and name the specific service.

Client information:
Project name: ${String(body.projectName || 'Not provided')}
Business or industry: ${String(body.businessType || 'Not provided')}
Project description: ${description}
Target audience: ${String(body.audience || 'Not provided')}
Budget: ${String(body.budget || 'Not provided')}
Preferred timeline: ${String(body.timeline || 'Not provided')}`;

  const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_PROJECT_PLANNER_MODEL || 'gpt-4.1-mini',
      input: prompt,
      text: {
        format: {
          type: 'json_schema',
          name: 'ederito_project_plan',
          strict: true,
          schema: responseSchema
        }
      }
    })
  });

  if (!openAIResponse.ok) {
    const details = await openAIResponse.text();
    console.error('OpenAI project planner error:', openAIResponse.status, details.slice(0, 500));
    return NextResponse.json({ error: 'The AI planner is temporarily unavailable.' }, { status: 502 });
  }

  const payload = (await openAIResponse.json()) as unknown;
  const outputText = getOutputText(payload);
  if (!outputText) {
    return NextResponse.json({ error: 'The AI planner returned an empty response.' }, { status: 502 });
  }

  try {
    return NextResponse.json({ plan: JSON.parse(outputText) });
  } catch {
    return NextResponse.json({ error: 'The AI planner returned an invalid response.' }, { status: 502 });
  }
}
