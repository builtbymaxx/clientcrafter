"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabase } from './SupabaseProvider';

export default function AuthComponent() {
  const { supabase } = useSupabase();
  return (
    <Auth
      supabaseClient={supabase}
      providers={[]}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: '#7C3AED',
              brandAccent: '#6d28d9',
            },
          },
        },
      }}
      theme="default"
    />
  );
}
