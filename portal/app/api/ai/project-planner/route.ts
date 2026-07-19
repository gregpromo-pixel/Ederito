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
  properties: {
    project_title: { type: 'string' },
    summary: { type