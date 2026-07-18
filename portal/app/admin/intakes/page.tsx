import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminIntakesClient from './AdminIntakesClient';

type PackageRelation = { id: string; name: string; slug: string };
type ClientProfile = { id: string; full_name: string | null; company_name: string | null; phone: string | null };

export default async function AdminIntakesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user