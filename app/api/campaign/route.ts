import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OpenAI } from 'openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper to base64url encode a string for Gmail API
function base64UrlEncode(str: string) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function POST(req: Request) {
  try {
    const { niche, location, offer, calendly } = await req.json();
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // Check Gmail connection
    const { data: token } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    if (!token) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    // Scrape leads using SerpAPI
    const query = `${niche} in ${location}`;
    const serpRes = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&num=20&api_key=${process.env.SERP_API_KEY}`
    );
    if (!serpRes.ok) {
      return NextResponse.json({ error: 'Failed to scrape leads' }, { status: 500 });
    }
    const serpData = await serpRes.json();
    const leads: any[] = [];
    if (serpData.organic_results) {
      serpData.organic_results.forEach((item: any) => {
        leads.push({ name: item.title, website: item.link });
      });
    }
    // Limit leads between 20 and 50
    const limitedLeads = leads.slice(0, 20);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Prepare Gmail client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oauth2Client.setCredentials({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      scope: token.scope,
      token_type: token.token_type,
      expiry_date: token.expires_at,
    });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    let sentCount = 0;
    for (const lead of limitedLeads) {
      // Compose email using GPT-4
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that writes personalized cold outreach emails.',
          },
          {
            role: 'user',
            content: `Write a short cold outreach email to a business with the following details:\nBusiness Name: ${lead.name}\nNiche: ${niche}\nLocation: ${location}\nOffer: ${offer}\nCalendly Link: ${calendly}\nEmail should be friendly and encourage them to book a call.`,
          },
        ],
        max_tokens: 250,
        temperature: 0.7,
      });
      const body = completion.choices[0].message?.content || '';
      // We don't have the lead's email address from SerpAPI directly. In a real
      // implementation you would scrape the lead's contact details or use
      // another API. Here we skip sending if no email is found.
      const to = '';
      if (!to) continue;
      const subject = `Grow your ${niche} business`;
      const raw = [
        `From: ${session.user.email}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        body,
      ].join('\n');
      const encoded = base64UrlEncode(raw);
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encoded },
      });
      sentCount++;
    }
    const { data: campaign } = await supabase
      .from('campaigns')
      .insert({
        user_id: session.user.id,
        niche,
        location,
        offer,
        calendly,
        leads_count: limitedLeads.length,
        sent_count: sentCount,
      })
      .select()
      .single();
    return NextResponse.json({ campaign, leads: limitedLeads });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
