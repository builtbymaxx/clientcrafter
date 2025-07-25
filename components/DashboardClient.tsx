"use client";

import { useState } from 'react';
import { useSupabase } from './SupabaseProvider';

interface DashboardProps {
  profile: any;
  campaigns: any[];
  gmailConnected: boolean;
}

export default function DashboardClient({ profile, campaigns, gmailConnected }: DashboardProps) {
  const { supabase, session } = useSupabase();
  const [niche, setNiche] = useState<string>(profile?.niche || '');
  const [location, setLocation] = useState<string>(profile?.location || '');
  const [offer, setOffer] = useState<string>(profile?.offer || '');
  const [calendly, setCalendly] = useState<string>(profile?.calendly || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const saveProfile = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: session?.user.id,
      niche,
      location,
      offer,
      calendly,
    });
    setLoading(false);
    setMessage(error ? error.message : 'Profile saved!');
  };

  const launchCampaign = async () => {
    setLoading(true);
    setMessage('Launching campaign...');
    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, location, offer, calendly }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Campaign launched. Scraped ${data.leads?.length || 0} leads and sent ${data.campaign?.sent_count || 0} emails.`);
      } else {
        setMessage(data.error || 'Something went wrong');
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectGmail = async () => {
    const res = await fetch('/api/oauth/url');
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  if (!gmailConnected) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Connect Your Gmail</h1>
        <p className="mb-6">To send outreach emails, please connect your Gmail account.</p>
        <button onClick={connectGmail} className="bg-primary text-white px-4 py-2 rounded">
          Connect Gmail
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-3 max-w-lg mb-6">
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Niche (e.g. dentists)"
          className="border p-2 rounded"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (e.g. New York)"
          className="border p-2 rounded"
        />
        <input
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder="Cold offer"
          className="border p-2 rounded"
        />
        <input
          value={calendly}
          onChange={(e) => setCalendly(e.target.value)}
          placeholder="Calendly link"
          className="border p-2 rounded"
        />
        <button
          onClick={saveProfile}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
        <button
          onClick={launchCampaign}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          {loading ? 'Launching...' : 'Launch Campaign'}
        </button>
      </div>
      {message && <p className="mb-6 text-primary font-medium">{message}</p>}
      <h2 className="text-2xl font-semibold mb-3">Previous Campaigns</h2>
      <ul className="space-y-2">
        {campaigns?.map((c: any) => (
          <li key={c.id} className="border p-3 rounded flex justify-between items-center">
            <span className="font-medium">
              {c.niche} in {c.location}
            </span>
            <span className="text-sm text-gray-600">
              {c.sent_count}/{c.leads_count} emails sent
            </span>
          </li>
        ))}
        {campaigns?.length === 0 && <li>No campaigns yet.</li>}
      </ul>
    </div>
  );
}
