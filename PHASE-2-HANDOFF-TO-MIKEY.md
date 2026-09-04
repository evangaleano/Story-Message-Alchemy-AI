# Phase 2 Handoff — Vercel Deployment Blocker

## Project Overview

**Story Message Alchemy AI Portal** — A Next.js app that gates AI-powered interview experiences behind a book-buyer login. Buyers can access three sequential AI agents (built with Claude Sonnet) that extract and synthesize business storytelling for founders.

**Tech Stack:**
- Next.js 14.2.35 (Pages Router)
- Supabase PostgreSQL (user auth, project state, usage tracking)
- Vercel (serverless deployment)
- Anthropic Claude API (Sonnet model)

**GitHub:** https://github.com/evangaleano/Story-Message-Alchemy-AI

---

## Phase 2 Complete ✅

### What's Built
1. **Supabase Database Schema** (`supabase/schema.sql`)
   - `users` table (auth + purchases JSONB)
   - `projects` table (interview state, conversation history)
   - `usage_log` table (cost tracking)

2. **API Endpoint** (`pages/api/ai/message.js`)
   - `POST /api/ai/message`
   - Flow: validate → verify user → check entitlement → load project → call Claude → save state → log usage
   - Returns: `{success, agent_response, current_stage, state, is_complete, usage}`

3. **Entitlements System** (`pages/api/lib/entitlements.js`)
   - Server-side purchase verification (never trusts client)
   - Supports individual product access ($17) + bundle ($47)

4. **Anthropic Integration** (`pages/api/ai/message.js`)
   - Direct fetch to Anthropic API (no SDK issues)
   - Claude 3.5 Sonnet, 1024 max tokens
   - Includes system prompt from skill instructions

5. **Environment Setup**
   - `.env.example` template
   - `.env.local` configured locally with all keys

---

## The Blocker ❌

**Vercel is not serving the application.** All requests return:
```
The page could not be found
NOT_FOUND
```

This happens at:
- Root URL: `https://story-message-alchemy-ai.vercel.app/` → NOT_FOUND
- API route: `https://story-message-alchemy-ai.vercel.app/api/ai/message` → NOT_FOUND

### Troubleshooting Attempts
1. ✅ Local dev server works perfectly: `npm run dev` compiles, API responds correctly
2. ✅ Code pushed to GitHub successfully
3. ✅ Environment variables set in Vercel (SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY, etc.)
4. ❌ Vercel build logs show `✓ Compiled successfully` but the deployed app serves nothing
5. ❌ Removed `vercel.json` to let Vercel auto-detect Next.js — still NOT_FOUND

### Build Output Status
```
> story-message-alchemy-ai-portal@1.0.0 build
> next build

✓ Compiled successfully
✓ Generating static pages (2/2)
```

The build succeeds, but the deployed app doesn't serve anything.

---

## What Mikey Needs to Check

1. **Vercel Project Settings**
   - Framework: should auto-detect "Next.js" (check if it does)
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm ci` (default)

2. **Deployment History**
   - Latest deployment status in Vercel dashboard
   - Whether any deployment actually shows as "Ready" and serving
   - Any error logs in the Deployment Details

3. **Git Connection**
   - Is the repo actually connected to Vercel?
   - Is Vercel pulling from main branch?
   - Last commit deployed: should be `9304403` (Remove vercel.json)

4. **Possible Root Causes**
   - Framework detection failing (Vercel thinks it's static HTML, not Next.js)
   - Build output not being found at `.next`
   - Project settings pointing to wrong source/output directories
   - Vercel cache needs clearing

---

## Files to Know

```
pages/
  _app.js                          (minimal Next.js app)
  api/
    ai/
      message.js                   (main API endpoint)
    lib/
      supabaseClient.js            (DB helpers)
      entitlements.js              (purchase verification)

lib/
  aiClient.js                      (frontend API client)

supabase/
  schema.sql                       (database setup)

.env.example                       (credential template)
package.json                       (dependencies)
PHASE-2-SETUP.md                  (full setup guide)
PHASE-2-SUMMARY.md                (architecture overview)
```

---

## What Works Locally

```bash
# Start dev server
npm run dev

# Test API (with test UUIDs from Supabase)
curl -X POST http://localhost:3000/api/ai/message \
  -H "Content-Type: application/json" \
  -d '{"user_id":"b2593d2f-1c04-4063-8b00-adcf2a240b4e","project_id":"4a717b4a-b430-45a8-adda-937ea327204e","product_id":1,"user_message":"Test"}'

# Response: 200 OK with JSON from Claude
```

---

## The Ask

**Fix the Vercel deployment so the app serves at `story-message-alchemy-ai.vercel.app`.**

Once that's working, Phase 3 can begin: building the chat UI component and integrating it into the book-buyer portal.

---

## Credentials

Environment variables are already set in Vercel:
- SUPABASE_URL, SUPABASE_SERVICE_KEY
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY  
- ANTHROPIC_API_KEY

Database is live at Supabase with test data ready.

---

**Thanks for the help, Mikey! 🙏**
