# ClientCrafter

ClientCrafter is a SaaS template that helps agency owners automate cold email outreach using AI and lead scraping. Users can authenticate, connect their Gmail account, describe their niche and offer, and then launch campaigns that scrape leads from Google, generate personalized cold emails with GPT-4 and send them via the Gmail API. Campaigns and metrics are tracked in Supabase.

## Features

- **Authentication** via Supabase Auth (email/password or magic link) with prebuilt UI.
- **Gmail Integration** – connect your Gmail account via OAuth2 to allow ClientCrafter to send emails on your behalf.
- **Campaign Management** – input your niche, location, cold offer and Calendly link then launch a campaign.
- **Lead Scraping** – uses SerpAPI to scrape businesses in your niche and location (20 leads by default).
- **Personalized Emails** – uses the OpenAI GPT-4 API to generate friendly, personalized cold emails for each lead.
- **Email Sending** – sends emails through the Gmail API on behalf of the connected user.
- **Metrics** – stores and displays the number of leads scraped, emails sent and campaign history.

## Stack

- **Next.js** (App Router) with TypeScript
- **Tailwind CSS** for a minimal SaaS-inspired UI (white background, slate gray text, purple accents)
- **Supabase** for authentication, database and storing OAuth tokens
- **Google APIs** (OAuth2 + Gmail)
- **SerpAPI** for scraping business leads
- **OpenAI** GPT-4 for generating outreach emails
- Deployment target: **Vercel**

## Environment variables

The app relies on several environment variables. Create a `.env.local` file in the root of the project based on the following keys. Actual values are provided by your deployment environment:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
REDIRECT_URI=<your-vercel-domain>/api/oauth/callback
OPENAI_API_KEY=<your-openai-api-key>
SERP_API_KEY=<your-serp-api-key>
```

These variables are automatically injected in production on Vercel. During local development you must supply your own credentials.

## Database schema

Create the following tables in Supabase to store user profiles, campaign data and Gmail tokens:

- **profiles** – stores the user’s niche, location, offer and Calendly link.
  - `id` (uuid, primary key, references `auth.users.id`)
  - `niche` (text)
  - `location` (text)
  - `offer` (text)
  - `calendly` (text)

- **campaigns** – records each campaign run.
  - `id` (bigint, primary key)
  - `user_id` (uuid, references `auth.users.id`)
  - `niche` (text)
  - `location` (text)
  - `offer` (text)
  - `calendly` (text)
  - `leads_count` (integer)
  - `sent_count` (integer)
  - `created_at` (timestamp with time zone, default `now()`)

- **gmail_tokens** – stores Gmail OAuth tokens for each user.
  - `user_id` (uuid, primary key, references `auth.users.id`)
  - `access_token` (text)
  - `refresh_token` (text)
  - `scope` (text)
  - `token_type` (text)
  - `expires_at` (bigint)

You can create these tables via the Supabase SQL editor.

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the `.env.local.example` file to `.env.local` and fill in your own credentials.

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## Deployment

The project is designed to be deployed to Vercel. Create a new Vercel project, import this repository and set the environment variables defined above in the project settings. After deployment, update `REDIRECT_URI` to match your live domain (e.g. `https://clientcrafter.vercel.app/api/oauth/callback`).

## Usage

1. Sign up or log in with your email.
2. On your first visit to the dashboard, connect your Gmail account by clicking “Connect Gmail.” You will be redirected to Google to grant permission.
3. Enter your niche, location, cold offer and Calendly link and save your profile.
4. Click “Launch Campaign” to scrape leads, generate personalized emails and send them via Gmail. Campaign results are saved and displayed on the dashboard.
