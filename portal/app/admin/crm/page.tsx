import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CrmClient from './CrmClient';

export default async function CrmPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,full_name,role')
    .eq('id', user.id)
    .maybeSingle();
