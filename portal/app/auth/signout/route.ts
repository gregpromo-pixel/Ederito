import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeReturnTo(value: string | null) {
  if (!value) return '/login';
  try {
    const url = new URL(value);
    if (url.hostname === 'ederito.com' || url.hostname === 'www.ederito.com' || url.hostname === 'portal.ederito.com') return url.toString();
  } catch {
    if (value.startsWith('/') && !value.startsWith('//')) return value;
  }
  return '/login';
}

async function signOut(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(safeReturnTo(url.searchParams.get('returnTo')), url.origin), 303);
}

export async function POST(request: Request) {
  return signOut(request);
}

export async function GET(request: Request) {
  return signOut(request);
}
