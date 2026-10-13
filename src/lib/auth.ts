import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type StaffProfile = {
  id: string;
  full_name: string;
  role: 'admin' | 'operator' | 'verifier' | 'viewer' | 'auditor';
  is_active: boolean;
  office_id: string;
};

export async function requireStaff() {
  const supabase = await createClient();
  const { data: claimData, error: claimError } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (claimError || !userId) redirect('/login');

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, role, is_active, office_id')
    .eq('id', userId)
    .maybeSingle();

  if (error || !profile || !profile.is_active) {
    redirect('/login?error=no-access');
  }

  return { supabase, profile: profile as StaffProfile };
}
