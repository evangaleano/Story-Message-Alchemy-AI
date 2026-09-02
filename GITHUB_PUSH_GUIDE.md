# Push to GitHub — Phase 2 Complete

## Current Project Structure

```
story-message-alchemy-ai-portal/
├── pages/
│   ├── _app.js
│   └── api/
│       └── ai/
│           └── message.js
│       └── lib/
│           ├── supabaseClient.js
│           └── entitlements.js
├── lib/
│   └── aiClient.js
├── supabase/
│   └── schema.sql
├── .env.example
├── .env.local (DO NOT COMMIT — add to .gitignore)
├── package.json
├── next.config.js
├── PHASE-2-SETUP.md
├── PHASE-2-SUMMARY.md
├── .gitignore
└── README.md

```

## Files to Commit

✅ **Push these:**
- `pages/` — All API routes
- `lib/` — Frontend AI client
- `supabase/` — Database schema
- `package.json` — Dependencies
- `next.config.js` — Next.js config
- `.env.example` — Template (no secrets)
- `PHASE-2-*.md` — Documentation
- `.gitignore`
- `README.md`

❌ **Do NOT push:**
- `.env.local` (contains API keys)
- `node_modules/` (in .gitignore)
- `.next/` (build cache, in .gitignore)

## Step 1: Create `.gitignore`

If you don't have one, create it:

```bash
cat > /Users/evan/Desktop/Claude\ Code/Unlock\ the\ Power\ of\ Your\ Story\ Book\ \+\ Mini\ Course\ Funnel/.gitignore << 'EOF'
node_modules/
.next/
.env.local
.env
*.log
.DS_Store
EOF
```

## Step 2: Initialize Git (if not already done)

```bash
cd /Users/evan/Desktop/Claude\ Code/Unlock\ the\ Power\ of\ Your\ Story\ Book\ \+\ Mini\ Course\ Funnel
git init
git config user.name "Your Name"
git config user.email "evan@brand-story.agency"
```

## Step 3: Add Files

```bash
git add .
git status  # Review what will be committed
```

## Step 4: Commit

```bash
git commit -m "Phase 2: Story Message Alchemy AI Portal infrastructure

- Database schema (users, projects, usage_log)
- API route: POST /api/ai/message with entitlement verification
- Anthropic Claude Sonnet integration (direct fetch, no SDK)
- State management and usage tracking
- Frontend AI client helper
- Environment setup and deployment docs"
```

## Step 5: Create GitHub Repo

1. Go to https://github.com/new
2. Name it: `story-message-alchemy-ai-portal`
3. Add description: "AI-powered interview platform for story extraction"
4. Click "Create repository"

## Step 6: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/story-message-alchemy-ai-portal.git
git branch -M main
git push -u origin main
```

## What Vercel Will See

When you deploy to Vercel:
1. Add these **Environment Variables** in Vercel Settings:
   ```
   SUPABASE_URL=https://giwmgvhhvkggquharuoi.supabase.co
   SUPABASE_SERVICE_KEY=[your_service_key]
   NEXT_PUBLIC_SUPABASE_URL=https://giwmgvhhvkggquharuoi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_anon_key]
   ANTHROPIC_API_KEY=[your_api_key]
   ```

2. Click "Deploy" — Vercel will:
   - Clone from GitHub
   - Run `npm install`
   - Build with `npm run build`
   - Deploy to `https://your-project.vercel.app`

## Verify Deployment Works

Once deployed to Vercel, test the API:

```bash
curl -X POST https://your-project.vercel.app/api/ai/message \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "b2593d2f-1c04-4063-8b00-adcf2a240b4e",
    "project_id": "4a717b4a-b430-45a8-adda-937ea327204e",
    "product_id": 1,
    "user_message": "Test message"
  }'
```

Expected response:
```json
{
  "success": true,
  "agent_response": "...",
  "current_stage": 1,
  "state": {},
  "is_complete": false,
  "usage": { ... }
}
```

## Next: Phase 3

After deployment, begin Phase 3:
1. Build chat UI component (React)
2. Integrate into portal sidebar
3. Implement product-specific state parsing
4. Add result synthesis view

---

**Ready to push?** Follow steps 1-6 above.
