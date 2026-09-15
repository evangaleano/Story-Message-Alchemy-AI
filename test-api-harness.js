#!/usr/bin/env node
/**
 * Regression test harness for the AI message API
 * Tests that the complete request path works end-to-end:
 * - Email resolution to user UUID
 * - Project creation with user UUID
 * - Authorization check
 * - Anthropic invocation
 * - Usage logging with UUID
 */

import fetch from 'node-fetch';

const VERCEL_URL = process.env.VERCEL_URL || 'https://story-message-alchemy-ai.vercel.app';
const TEST_EMAIL = 'demo@brandstory.test';
const TEST_PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const TEST_PRODUCT_ID = 1;

async function testAPI() {
  console.log('🧪 Starting API regression test...\n');
  console.log(`📍 Target: ${VERCEL_URL}/api/ai/message`);
  console.log(`👤 Test user: ${TEST_EMAIL}`);
  console.log(`📦 Product: ${TEST_PRODUCT_ID}\n`);

  const request = {
    user_id: TEST_EMAIL,
    project_id: TEST_PROJECT_ID,
    product_id: TEST_PRODUCT_ID,
    user_message: 'Begin the interview with one focused question.'
  };

  console.log('📤 Sending request:', JSON.stringify(request, null, 2));
  console.log('');

  try {
    const response = await fetch(`${VERCEL_URL}/api/ai/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    console.log(`✓ HTTP ${response.status} ${response.statusText}`);

    const data = await response.json();
    console.log('📥 Response:', JSON.stringify(data, null, 2));
    console.log('');

    // Acceptance criteria
    const checks = {
      'HTTP 200': response.status === 200,
      'success is true': data.success === true,
      'agent_response exists': !!data.agent_response && data.agent_response.length > 0,
      'current_stage is number': typeof data.current_stage === 'number',
      'state is object': typeof data.state === 'object',
      'is_complete is boolean': typeof data.is_complete === 'boolean',
      'usage has input_tokens': typeof data.usage?.input_tokens === 'number',
      'No internal details leaked': !data.details && !data.project_user_id && !data.user_id,
    };

    console.log('✅ Acceptance Criteria:');
    let passed = 0;
    let total = 0;
    for (const [check, result] of Object.entries(checks)) {
      total++;
      if (result) {
        console.log(`  ✓ ${check}`);
        passed++;
      } else {
        console.log(`  ✗ ${check}`);
      }
    }

    console.log(`\n📊 Result: ${passed}/${total} checks passed`);

    if (passed === total) {
      console.log('\n🎉 All tests passed! API is working correctly.');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Network or parsing error:', error.message);
    process.exit(1);
  }
}

testAPI();
