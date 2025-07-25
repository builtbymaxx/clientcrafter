import './globals.css';
import type { Metadata } from 'next';
import { SupabaseProvider } from '../components/SupabaseProvider';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'ClientCrafter',
  description: 'Automate cold email outreach with AI and lead scraping',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-800 min-h-screen flex flex-col">
        <SupabaseProvider>
          <Header />
          <main className="flex-1 max-w-4xl mx-auto p-4 w-full">{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
