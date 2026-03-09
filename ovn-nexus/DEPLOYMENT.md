# OVN Nexus - Deployment Guide

## Prerequisites

- Node.js 18+
- Supabase account (supabase.com)
- Vercel account (vercel.com)

## 1. Supabase Setup

### Create Project
1. Go to supabase.com and create a new project
2. Note your project URL and anon key from Settings > API

### Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

### Configure Auth
1. Go to Authentication > Settings
2. Enable Email/Password sign-in
3. Set site URL to your domain
4. Add redirect URLs for your domain

### Storage Setup
1. Go to Storage
2. Create bucket: `ovn-nexus-datasets`
3. Set appropriate policies for authenticated uploads

## 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 3. Local Development

```bash
cd ovn-nexus
npm install
npm run dev
```

Open http://localhost:3000

## 4. Seed Data

```bash
npm run db:seed
```

## 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings > Environment Variables
```

### Vercel Configuration
- Framework: Next.js
- Build Command: `next build`
- Output Directory: `.next`
- Node.js Version: 18.x

## 6. Optional: Cloudflare CDN

1. Add your domain to Cloudflare
2. Point DNS to Vercel
3. Enable caching for static assets
4. Configure WAF rules for API protection

## 7. Optional: Snowflake/BigQuery

For large-scale analytics:
1. Set up data pipeline from Supabase to warehouse
2. Use Supabase webhooks or pg_cron for sync
3. Connect BI tools to warehouse for research analytics

## Architecture

```
[Clinics] --> [Supabase/Postgres] --> [Next.js API] --> [Vercel]
                    |                                       |
                    v                                       v
              [Data Lake]                           [ML Pipelines]
              [Storage]                             [Serverless]
                    |
                    v
            [Snowflake/BigQuery]
            [Analytics/BI]
```

## Security Checklist

- [ ] Row-level security enabled on all tables
- [ ] Service role key never exposed to client
- [ ] HIPAA-compliant data handling
- [ ] Audit logging enabled
- [ ] API rate limiting configured
- [ ] De-identification verified for patient data
- [ ] Backup and disaster recovery plan
- [ ] Penetration testing completed
