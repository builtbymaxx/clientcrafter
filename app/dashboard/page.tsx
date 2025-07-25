import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';
import DashboardClient from '../../components/DashboardClient';

export default async function Dashboard() {
  const supabase = createServerComponentSupabaseClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/');
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  const { data: token } = await supabase
    .from('gmail_tokens')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();
  const gmailConnected = !!token;
  return <DashboardClient profile={profile} campaigns={campaigns || []} gmailConnected={gmailConnected} />;
}
