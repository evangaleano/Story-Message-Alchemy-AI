/**
 * Frontend helper to call the Story Message Alchemy AI Portal API
 * Use this from the portal pages to interact with the agents
 */

export class StoryDrivenAIClient {
  constructor(userId) {
    this.userId = userId;
    this.baseUrl = '/api/ai';
  }

  /**
   * Send a message to the AI agent
   * Returns the agent response and updated project state
   */
  async sendMessage(projectId, productId, userMessage) {
    const response = await fetch(`${this.baseUrl}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: this.userId,
        project_id: projectId,
        product_id: productId,
        user_message: userMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API error');
    }

    return await response.json();
  }

  /**
   * Create a new project
   * Call your backend endpoint or use Supabase client directly
   */
  async createProject(productId, projectName) {
    // TODO: In Phase 3, create an endpoint for this
    // For now, you can use Supabase client directly from the frontend
    throw new Error('createProject not yet implemented. Use Supabase client directly.');
  }

  /**
   * Get a project's current state
   * Useful for resuming conversations
   */
  async getProject(projectId) {
    // TODO: Create a GET endpoint for this
    throw new Error('getProject not yet implemented. Use Supabase client directly.');
  }

  /**
   * Get all projects for the user
   */
  async listProjects() {
    // TODO: Create a GET endpoint for this
    throw new Error('listProjects not yet implemented. Use Supabase client directly.');
  }
}

/**
 * Usage in the portal:
 *
 * import { StoryDrivenAIClient } from '@/lib/aiClient';
 *
 * const ai = new StoryDrivenAIClient(userId);
 *
 * const result = await ai.sendMessage(projectId, productId, 'User message here');
 *
 * console.log(result.agent_response);
 * console.log(result.current_stage);
 * console.log(result.is_complete);
 */

export default StoryDrivenAIClient;
