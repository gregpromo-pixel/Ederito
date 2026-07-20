import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const allowedOrigin = 'https://ederito.com';

export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let firstName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client';
    firstName = String(fullName).trim().split(/\s+/)[0] || 'Client';
  }

  const response = NextResponse.json({ authenticated: Boolean(user), firstName });
  if (origin === allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  if (origin === allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Vary', 'Origin');
  }
  return response;
}
