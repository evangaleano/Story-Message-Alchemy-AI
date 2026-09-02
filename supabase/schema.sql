-- ============================================================
-- STORY MESSAGE ALCHEMY AI PORTAL — Supabase Schema
-- ============================================================

-- Users table (extend existing if you have one)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  pin_hash TEXT, -- Hashed PIN for authentication
  purchases JSONB DEFAULT '{"book": true, "product_1": false, "product_2": false, "product_3": false, "bundle_3ai": false}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table (stores state for each AI product session)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL CHECK (product_id IN (1, 2, 3)),
  project_name TEXT NOT NULL, -- e.g., "My Story - Sept 2026"
  current_stage INT DEFAULT 1,
  state JSONB NOT NULL DEFAULT '{}'::jsonb, -- All extracted fields
  conversation JSONB DEFAULT '[]'::jsonb, -- Chat history for UI
  completed BOOLEAN DEFAULT FALSE,
  final_output JSONB, -- Polished synthesis when completed
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Usage tracking (for monitoring cost and performance)
CREATE TABLE IF NOT EXISTS usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  product_id INT NOT NULL,
  request_count INT DEFAULT 1,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  cache_creation_tokens INT DEFAULT 0,
  cache_read_tokens INT DEFAULT 0,
  estimated_cost DECIMAL(10, 4),
  session_status TEXT, -- "in_progress" or "completed"
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_product_id ON projects(product_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_project_id ON usage_log(project_id);

-- Enable Row Level Security (optional, for multi-tenant safety)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own usage" ON usage_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert usage logs" ON usage_log
  FOR INSERT WITH CHECK (TRUE);
