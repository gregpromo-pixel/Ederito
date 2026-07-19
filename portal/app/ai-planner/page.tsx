import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AIPlannerClient from './AIPlannerClient';

export default async function AIPlannerPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?mode=register&next=%2Fai-planner');

  return <AIPlannerClient />;
}
