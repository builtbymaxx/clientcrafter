import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';
import AuthComponent from '../components/Auth';

export default async function Home() {
  const supabase = createServerComponentSupabaseClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4 text-center">Welcome to ClientCrafter</h1>
      <p className="mb-6 text-center text-gray-600 max-w-xl">
        Automate your cold email outreach with AI and lead scraping. Sign up or log in below to get
        started.
      </p>
      <div className="w-full max-w-md">
        <AuthComponent />
      </div>
    </div>
  );
}
