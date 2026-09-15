import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}

// Generate a UUID v4 without requiring crypto module
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Service role client (server-side only, uses service key)
// This bypasses RLS for admin operations like logging usage
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

// Helper: Get user record by ID
export async function getUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(`User not found: ${error.message}`);
  return data;
}

// Helper: Get or create user by email (for login flow)
export async function getOrCreateUser(email) {
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  console.log(`getOrCreateUser lookup for ${email}:`, { error: error?.code, has_user: !!user });

  if (error && error.code === 'PGRST116') {
    // User doesn't exist, create them
    const userId = generateUUID();
    console.log(`Creating new user ${email} with id ${userId}`);

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email,
        purchases: {
          book: true,
          product_1: false,
          product_2: false,
          product_3: false,
          bundle_3ai: false,
        },
      }])
      .select()
      .single();

    console.log(`User creation result:`, { createError: createError?.message, has_user: !!newUser });
    if (createError) throw new Error(`Failed to create user: ${createError.message}`);
    return newUser;
  } else if (error) {
    throw new Error(`Database error: ${error.code} - ${error.message}`);
  }

  // If user exists but doesn't have an id, generate one and update
  if (user && !user.id) {
    const userId = generateUUID();
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ id: userId })
      .eq('email', email)
      .select()
      .single();

    if (updateError) throw new Error(`Failed to update user: ${updateError.message}`);
    return updatedUser;
  }

  return user;
}

// Helper: Get project by ID
export async function getProject(projectId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (error) throw new Error(`Project lookup failed: ${error.message}`);
  return data;
}

// Helper: Create a new project
export async function createProject(userId, productId, projectName) {
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      user_id: userId,
      product_id: productId,
      project_name: projectName,
      current_stage: 1,
      state: {},
      conversation: [],
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to create project: ${error.message}`);
  return data;
}

// Helper: Update project state
export async function updateProject(projectId, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      last_updated: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update project: ${error.message}`);
  return data;
}

// Helper: Add message to conversation
export async function addMessageToConversation(projectId, role, content) {
  const project = await getProject(projectId);
  const conversation = Array.isArray(project.conversation) ? project.conversation : [];

  conversation.push({
    role,
    content,
    timestamp: new Date().toISOString(),
  });

  await updateProject(projectId, { conversation });
}

// Helper: Log API usage
export async function logUsage(userId, projectId, productId, usage, sessionStatus) {
  const { data, error } = await supabase
    .from('usage_log')
    .insert([{
      user_id: userId,
      project_id: projectId,
      product_id: productId,
      input_tokens: usage.input_tokens || 0,
      output_tokens: usage.output_tokens || 0,
      cache_creation_tokens: usage.cache_creation_input_tokens || 0,
      cache_read_tokens: usage.cache_read_input_tokens || 0,
      estimated_cost: calculateCost(usage),
      session_status: sessionStatus,
    }]);

  if (error) console.error('Failed to log usage:', error.message);
}

// Helper: Calculate estimated cost (Sonnet pricing)
function calculateCost(usage) {
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
  const cacheReadTokens = usage.cache_read_input_tokens || 0;

  // Sonnet pricing: $3/1M input, $15/1M output, $0.30/1M cache write, $0.06/1M cache read
  const inputCost = (inputTokens * 3) / 1000000;
  const outputCost = (outputTokens * 15) / 1000000;
  const cacheWriteCost = (cacheCreationTokens * 0.30) / 1000000;
  const cacheReadCost = (cacheReadTokens * 0.06) / 1000000;

  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}

export default supabase;
