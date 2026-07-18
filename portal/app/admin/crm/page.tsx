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

  if (!profile || !['admin', 'owner', 'support', 'staff'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const [clientsResult, tasksResult, notesResult, activityResult, staffResult] = await Promise.all([
    supabase.from('crm_clients').select('*').order('updated_at', { ascending: false }),
    supabase.from('crm_tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('crm_notes').select('*').order('created_at', { ascending: false }),
    supabase.from('crm_activity').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id,full_name,company_name,phone,role').in('role', ['admin', 'owner', 'support', 'staff'])
  ]);

  return (
    <CrmClient
      staffId={profile.id}
      staffName={profile.full_name || 'Ederito'}
      initialClients={clientsResult.data || []}
      initialTasks={tasksResult.data || []}
      initialNotes={notesResult.data || []}
      initialActivity={activityResult.data || []}
      staffProfiles={staffResult.data || []}
    />
  );
}
