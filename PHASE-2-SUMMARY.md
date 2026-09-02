# Phase 2 — Story Message Alchemy AI Portal: Infrastructure Complete ✓

## What's Built

### 1. **Database Schema** (`supabase/schema.sql`)
- `users` — Portal accounts with entitlements
- `projects` — AI product sessions (structured state storage)
- `usage_log` — API call tracking (tokens, cost, status)
- Indexes for performance
- Row-level security (RLS) for multi-tenant safety

### 2. **Supabase Client** (`api/lib/supabaseClient.js`)
Helpers for:
- User lookup / creation
- Project CRUD
- Conversation history management
- Usage logging
- Cost calculation (Sonnet pricing)

### 3. **Entitlements** (`api/lib/entitlements.js`)
Server-side verification:
- `canAccessProduct(user, productId)` — Checks purchases
- `getAccessibleProducts(user)` — Lists what user can access
- `canAccessBook(user)` — Book access
- Product info lookup

### 4. **Main API Endpoint** (`api/ai/message.js`)
The core endpoint: `POST /api/ai/message`

Flow:
1. Validates user & project ownership
2. Verifies entitlement (server-side)
3. Builds system prompt from skill instructions
4. Calls Claude (Sonnet, 1024 max tokens)
5. Saves conversation history
6. Updates structured project state
7. Logs usage for cost tracking
8. Returns agent response + state

Error handling & security:
- User ID validation
- Project ownership checks
- Entitlement verification
- Anthropic API key never exposed
- 403/401 on unauthorized access

### 5. **Frontend Client** (`lib/aiClient.js`)
Browser helper to call the API:
```javascript
const ai = new StoryDrivenAIClient(userId);
const result = await ai.sendMessage(projectId, productId, 'User message');
```

### 6. **Environment Template** (`.env.example`)
All required variables documented

### 7. **Setup Guide** (`PHASE-2-SETUP.md`)
Step-by-step to:
- Create Supabase project
- Run schema
- Configure API route
- Test with cURL
- Troubleshoot

---

## Architecture

```
Browser (portal UI)
    ↓
    POST /api/ai/message (Vercel)
    ↓
    [Entitlement Check] — Supabase
    [Load Project State] — Supabase
    [Build System Prompt] — agent-knowledge.json
    [Call Claude API] — Sonnet
    ↓
    [Parse Response]
    [Update Project State] — Supabase
    [Log Usage] — Supabase
    ↓
    Return: { agent_response, state, stage, is_complete }
    ↓
Browser (display response, update UI)
```

---

## What's NOT Built Yet (Phase 3)

1. **Product-specific state parsing** — Currently `parseAgentResponse()` is a no-op
   - Phase 3 will implement rules for Product 1 (extract WHY story fields)
   - Phase 3 will implement rules for Product 2 (extract client journey fields)
   - Phase 3 will implement rules for Product 3 (extract offer fields)

2. **Chat UI Component** — The conversation interface
   - Messages display
   - Input field
   - Progress indicators
   - Result view when completed

3. **Sidebar Integration** — Reorganize portal sidebar
   - Replace "YOUR CHATGPT AGENTS" with "STORY-DRIVEN AI TOOLS"
   - Add lock badges
   - Add state indicators (not started / in progress / completed)

4. **Result Synthesis View** — Polished final output
   - When `is_complete: true`, show a cleaned-up results page
   - Allow users to copy, download, refine

5. **Cross-product Handoff** — Agent 3 auto-receives Agent 1 & 2 outputs
   - When Product 1 completes, save key outputs
   - When Product 3 starts, auto-load those outputs
   - Avoid user re-entering data

---

## Files Created

```
/supabase/schema.sql
/api/lib/supabaseClient.js
/api/lib/entitlements.js
/api/ai/message.js
/lib/aiClient.js
/.env.example
/PHASE-2-SETUP.md
/PHASE-2-SUMMARY.md (this file)
```

---

## Next: Phase 3 — Agent 1 MVP

Once you've completed the setup in PHASE-2-SETUP.md:

1. **Implement Story-Driven Message agent logic**
   - Load agent-knowledge.json skill instructions
   - Implement stage-by-stage interviewing
   - Extract WHY story fields into structured state

2. **Build chat UI component**
   - Display conversation thread
   - User input field at bottom
   - Progress bar (current stage / total stages)
   - Show final result when completed

3. **Integrate into portal**
   - Update sidebar to show AI products
   - Make product clickable to open chat
   - Wire entitlements to lock UI

4. **Test end-to-end**
   - Complete a full Story-Driven Message interview
   - Verify structured state is saved
   - View final synthesis

Phase 3 target: **Complete, working Story-Driven Message MVP** that users can actually use.

---

## Cost Estimate (After Phase 3)

Per user completing one product:
- **API calls:** ~5-20 turns × 1 call each
- **Tokens:** ~1,000-4,000 tokens per completion
- **Cost:** ~$0.02-0.05 per user per product
- **Monthly (20-30 customers):** ~$1.20-4.50

Negligible cost for the value delivered.

---

## Status

✅ Phase 1: Inspect — Complete
✅ Phase 2: Shared Infrastructure — Complete
🔄 Phase 3: Agent 1 MVP — Next (in progress)
⏳ Phase 4: Agent 2 — Queued
⏳ Phase 5: Agent 3 — Queued
⏳ Phase 6: Commerce/Locks — Queued
⏳ Phase 7: Measurement — Queued
