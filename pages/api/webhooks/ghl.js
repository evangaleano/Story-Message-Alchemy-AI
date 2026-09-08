/**
 * POST /api/webhooks/ghl
 * Webhook handler for GHL purchase events
 *
 * Expected GHL webhook payload:
 * {
 *   email: string,
 *   productId: number (1, 2, 3, or 0 for bundle/book-only),
 *   firstName: string (optional),
 *   lastName: string (optional),
 *   customerId: string (optional)
 * }
 */

import { supabase } from '../lib/supabaseClient.js';

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, productId, firstName, lastName, customerId } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Build purchases object based on productId
    const purchases = {
      book: true, // Assume they have the book if they're purchasing
      product_1: false,
      product_2: false,
      product_3: false,
      bundle_3ai: false,
    };

    // Set purchases based on product
    if (productId === 1) {
      purchases.product_1 = true;
    } else if (productId === 2) {
      purchases.product_2 = true;
    } else if (productId === 3) {
      purchases.product_3 = true;
    } else if (productId === 0) {
      // Bundle: all three products
      purchases.product_1 = true;
      purchases.product_2 = true;
      purchases.product_3 = true;
      purchases.bundle_3ai = true;
    }

    // Upsert user in Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          email,
          purchases,
          first_name: firstName || '',
          last_name: lastName || '',
          ghl_customer_id: customerId || '',
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: 'Failed to create/update user' });
    }

    // Success
    return res.status(200).json({
      success: true,
      message: 'User created/updated successfully',
      userId: data.id,
      email: data.email,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
