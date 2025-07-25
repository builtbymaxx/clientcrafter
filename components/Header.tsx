"use client";

import Link from 'next/link';
import { useSupabase } from './SupabaseProvider';

export default function Header() {
  const { session, supabase } = useSupabase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          ClientCrafter
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button onClick={handleSignOut} className="px-3 py-1 bg-primary text-white rounded">
                Logout
              </button>
            </>
          ) : (
            <Link href="/">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
