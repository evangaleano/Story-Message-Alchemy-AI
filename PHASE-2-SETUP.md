# Phase 2 — Shared AI Infrastructure Setup

## Overview

This guide walks through setting up the backend infrastructure for the Story Message Alchemy AI Portal.

**What's included:**
- Supabase PostgreSQL schema (users, projects, usage_log)
- Vercel API routes (Node.js, serverless)
- Entitlement verification
- State management
- Usage tracking

**What you need:**
- Supabase account (https://supabase.com)
- Anthropic API key (https://console.anthropic.com)
- Vercel account (you're already using this)

---

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization, project name (e.g., "story-driven-ai"), database password, region
4. Wait for it to initialize (~2 min)

### 1.2 Get Your Credentials

Once the project is ready:

1. Click **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Key** (NOT the anon key!) → `SUPABASE_SERVICE_KEY`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3 Run the Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click **Run**

You should see messages like "CREATE TABLE" and "CREATE INDEX" succeed.

### 1.4 Verify Tables

1. Click **Table Editor** in the left sidebar
2. Refresh the page
3. You should see three new tables:
   - `users`
   - `projects`
   - `usage_log`

---

## Step 2: Set Up Vercel API Routes

### 2.1 Add Node Dependencies

In your project root, run:

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk
```

(If you don't have a `package.json`, create one first with `npm init -y`)

### 2.2 Create Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in the values:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=sbp_...your_service_key...
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key...
   ANTHROPIC_API_KEY=sk-ant-...
   ```

### 2.3 Verify API Route

In Vercel:

1. Go to your project settings
2. Make sure **Environment Variables** are set with the above values
3. Deploy (or test locally with `vercel dev`)

---

## Step 3: Test the API

### 3.1 Create a Test User in Supabase

1. Go to **Table Editor** → **users**
2. Click **Insert** → **New Row**
3. Fill in:
   - `email`: `test@example.com`
   - `pin_hash`: `test123` (or any value, for now)
   - `purchases`: Keep default or set `{"book": true, "product_1": true, "product_2": false, "product_3": false, "bundle_3ai": false}`

### 3.2 Create a Test Project

1. Go to **Table Editor** → **projects**
2. Click **Insert** → **New Row**
3. Fill in:
   - `user_id`: Copy the UUID from the user you just created
   - `product_id`: `1` (Story-Driven Message)
   - `project_name`: `Test Project`
   - `current_stage`: `1`
   - `state`: `{}`
   - `conversation`: `[]`

Note the **project UUID** you just created.

### 3.3 Test API Call (Using cURL or Postman)

```bash
curl -X POST http://localhost:3000/api/ai/message \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_UUID",
    "project_id": "YOUR_PROJECT_UUID",
    "product_id": 1,
    "user_message": "Tell me about your hero'\''s journey."
  }'
```

Expected response:
```json
{
  "success": true,
  "agent_response": "Great! Let'\''s start...",
  "current_stage": 1,
  "state": {},
  "is_complete": false,
  "usage": {
    "input_tokens": 123,
    "output_tokens": 456,
    ...
  }
}
```

---

## Step 4: Frontend Integration (Coming in Phase 3)

In Phase 3, we'll wire the chat UI to call `/api/ai/message` and display responses.

For now, the API is ready to go.

---

## Troubleshooting

### "SUPABASE_URL is not defined"
- Check `.env.local` exists and has `SUPABASE_URL=...`
- Restart dev server after adding env vars

### "User not found"
- Make sure the `user_id` you're passing exists in the `users` table
- Check the UUID format is correct (should be a long hex string)

### "Module not found: @supabase/supabase-js"
- Run `npm install @supabase/supabase-js @anthropic-ai/sdk`
- Check `package.json` includes these in `dependencies`

### "ANTHROPIC_API_KEY missing"
- Go to https://console.anthropic.com
- Create an API key
- Add it to `.env.local` and redeploy

---

## Next Steps

Phase 2 is complete. In **Phase 3**, we'll:

1. Load the `agent-knowledge.json` into the system prompt
2. Implement product-specific state parsing
3. Build the chat UI component
4. Wire everything together into the portal

See you in Phase 3! 🚀
