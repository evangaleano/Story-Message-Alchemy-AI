/**
 * POST /api/ai/message
 * Main endpoint for Story Message Alchemy AI Portal interview interactions
 *
 * Request body:
 * {
 *   user_id: string (UUID),
 *   project_id: string (UUID),
 *   product_id: 1 | 2 | 3,
 *   user_message: string,
 * }
 *
 * Response:
 * {
 *   agent_response: string,
 *   current_stage: number,
 *   state: object,
 *   is_complete: boolean,
 *   usage: { input_tokens, output_tokens, ... }
 * }
 */

import {
  getUser,
  getProject,
  updateProject,
  addMessageToConversation,
  logUsage,
} from '../lib/supabaseClient.js';
import { canAccessProduct, getProductInfo } from '../lib/entitlements.js';

async function callAnthropicAPI(messages, systemPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}

export default async function handler(req, res) {

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, project_id, product_id, user_message } = req.body;

    // 1. Validate input
    if (!user_id || !project_id || !product_id || !user_message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (![1, 2, 3].includes(product_id)) {
      return res.status(400).json({ error: 'Invalid product_id (must be 1, 2, or 3)' });
    }

    // 2. Verify user exists
    let user;
    try {
      user = await getUser(user_id);
    } catch (e) {
      return res.status(401).json({ error: 'User not found' });
    }

    // 3. Verify entitlement (server-side)
    if (!canAccessProduct(user, product_id)) {
      return res.status(403).json({ error: 'Product not purchased' });
    }

    // 4. Load project
    let project;
    try {
      project = await getProject(project_id);
    } catch (e) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 5. Verify user owns project
    if (project.user_id !== user_id || project.product_id !== product_id) {
      return res.status(403).json({ error: 'Unauthorized: project mismatch' });
    }

    // 6. Build system prompt (optimized, not full 2000-line doc)
    const systemPrompt = buildSystemPrompt(product_id, project);

    // 7. Build messages array (include conversation history for context)
    const messages = buildMessagesArray(project, user_message);

    // 8. Call Claude (Sonnet)
    const message = await callAnthropicAPI(messages, systemPrompt);
    const agent_response = message.content[0].text;

    // 9. Extract structured state updates from the agent response
    // (This is a placeholder — Phase 3 will implement product-specific parsers)
    const { updated_state, next_stage, is_complete } = parseAgentResponse(
      agent_response,
      product_id,
      project.state,
      project.current_stage
    );

    // 10. Save conversation and state
    await updateProject(project_id, {
      state: updated_state,
      current_stage: next_stage,
      completed: is_complete,
    });

    // Add both user and agent messages to conversation history
    await addMessageToConversation(project_id, 'user', user_message);
    await addMessageToConversation(project_id, 'assistant', agent_response);

    // 11. Track usage
    await logUsage(user_id, project_id, product_id, message.usage, is_complete ? 'completed' : 'in_progress');

    // 12. Return response
    return res.status(200).json({
      success: true,
      agent_response,
      current_stage: next_stage,
      state: updated_state,
      is_complete,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cache_creation_input_tokens: message.usage.cache_creation_input_tokens || 0,
        cache_read_input_tokens: message.usage.cache_read_input_tokens || 0,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Build system prompt from the skill instructions
 * This is where we load the relevant part of agent-knowledge.json
 * Phase 3 will refine this with prompt caching
 */
function buildSystemPrompt(productId, project) {
  const productInfo = getProductInfo(productId);
  const skillInstructions = getSkillInstructions(productId);
  const currentStage = project.current_stage;

  // Simplified for now — Phase 3 will optimize this with prompt caching
  return `
You are a ${productInfo.name} strategist and interviewer.

${skillInstructions.role}

## Current Stage
Stage ${currentStage} of the workflow: ${skillInstructions.workflow[currentStage - 1]?.name || 'Unknown'}

## Key Philosophy
${skillInstructions.philosophy}

## Interaction Guidelines
- Ask ONE focused question at a time
- Encourage casual, messy answers (voice-note style)
- Challenge vague thinking with direct questions
- Extract, don't invent
- Preserve the user's language
- Only synthesize when the stage is complete

## Already Extracted
${JSON.stringify(project.state, null, 2)}

Proceed with the next focused question or move to synthesis as appropriate for this stage.
  `;
}

/**
 * Load skill instructions from the canonical knowledge base
 * In production, cache this or load from file system
 */
function getSkillInstructions(productId) {
  // TODO: Load from /data/agent-knowledge.json
  // For now, return minimal structure
  const instructions = {
    1: {
      role: 'You are a Story-Driven Message Strategist and Interviewer.',
      philosophy: 'Extract the founder\'s past hero\'s journey that initiated them into becoming a guide.',
      workflow: [
        { name: 'Identify the WHY Story', description: 'Ask: Why do you do the work you do, and how did your story shape it?' },
        { name: 'Map the Seven Plot Points', description: 'Explore the ordinary world, inciting incident, falling action, dark night, rising action, breakthrough, and remedy/return.' },
        { name: 'Strengthen the Logic', description: 'Review for clear chronology and cause-and-effect.' },
        { name: 'Extract the Remedy', description: 'What unique combination of skills, practices, lessons created the breakthrough?' },
        { name: 'Build the Belief Statement', description: 'Create the one-sentence "I Believe..." statement' },
      ],
    },
    2: {
      role: 'You are a Conversion Client Impact Story Strategist and Interviewer.',
      philosophy: 'Turn one real client transformation into proof that the remedy works for others.',
      workflow: [
        { name: 'Select the Strongest Client', description: 'Which client had the most meaningful transformation and strongest proof?' },
        { name: 'Brain Dump the Client Journey', description: 'Explore who they were, what they wanted, what was blocking them, what they tried, and what changed.' },
        { name: 'Map the Client\'s Hero\'s Journey', description: 'Seven-point structure where the client is the hero and you are the guide.' },
        { name: 'Create Hooks and Endings', description: 'Build both pain-led and aspiration-led hooks, and founder/client belief endings.' },
      ],
    },
    3: {
      role: 'You are a Story-Driven Offer Strategist and Interviewer.',
      philosophy: 'Use the founder\'s story + proven client transformation to build a credible offer.',
      workflow: [
        { name: 'Reconnect the Story', description: 'Summarize the founder\'s story, belief, proven client transformation, and remedy.' },
        { name: 'Extract Customer Journey Intelligence', description: 'From the client proof, what does this teach about who gets the strongest result?' },
        { name: 'Define the Offer Mechanics', description: 'Choose the vehicle (product/service/experience), delivery mechanism, direct result, aspirational possibility.' },
        { name: 'Evaluate Client-Side Value', description: 'What is this transformation worth? What does staying stuck cost?' },
        { name: 'Build the Market-Facing Offer', description: 'Synthesize into a clear, credible, compelling offer.' },
      ],
    },
  };

  return instructions[productId] || instructions[1];
}

/**
 * Parse agent response to extract state updates
 * This is a placeholder — Phase 3 will implement product-specific parsers
 *
 * For now, we assume the agent tells us what to extract (structured response)
 * Later, we'll use Claude to parse its own conversational output
 */
function parseAgentResponse(agentResponse, productId, currentState, currentStage) {
  // TODO: Implement product-specific parsing in Phase 3
  // For MVP, assume agent response contains structured data or we use Claude to parse it

  return {
    updated_state: currentState, // No-op for now
    next_stage: currentStage, // No-op for now
    is_complete: false,
  };
}

/**
 * Build messages array including conversation history
 * Keeps recent context but avoids context bloat
 */
function buildMessagesArray(project, newMessage) {
  const conversation = Array.isArray(project.conversation) ? project.conversation : [];

  // Keep last 10 messages (20 turns) to maintain context but avoid bloat
  const recentMessages = conversation.slice(-20);

  // Convert stored conversation format to Claude API format
  const messages = recentMessages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Add the new user message
  messages.push({
    role: 'user',
    content: newMessage,
  });

  return messages;
}

