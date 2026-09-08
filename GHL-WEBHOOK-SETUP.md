# GHL Webhook Setup Guide

## Overview
When a buyer purchases from your GHL landing page, this webhook automatically creates/updates them in Supabase with the correct purchase flags, so they can immediately log in to the portal.

## Webhook Endpoint
```
POST https://story-message-alchemy-ai.vercel.app/api/webhooks/ghl
```

## Required Payload
```json
{
  "email": "buyer@example.com",
  "productId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "customerId": "ghl_customer_123"
}
```

## Product ID Mapping
- **productId: 1** → Story-Driven Message (product_1)
- **productId: 2** → Conversion Client Impact Story (product_2)
- **productId: 3** → Story-Driven Offer (product_3)
- **productId: 0** → Bundle (all three products + book)

## Setting Up the Webhook in GHL

### Steps:
1. Go to your GHL workspace → Settings → Integrations/Webhooks
2. Create a new webhook
3. **Event**: Choose the purchase/order event that triggers on payment success
4. **URL**: `https://story-message-alchemy-ai.vercel.app/api/webhooks/ghl`
5. **Method**: POST
6. **Content-Type**: application/json

### Mapping GHL Fields to Payload
In GHL's webhook payload builder, map these fields:
- GHL Contact Email → `email`
- GHL Contact First Name → `firstName`
- GHL Contact Last Name → `lastName`
- Product ID or SKU → `productId` (you may need a custom field for this)
- GHL Customer ID → `customerId`

## Expected Response
### Success (200)
```json
{
  "success": true,
  "message": "User created/updated successfully",
  "userId": "user-uuid",
  "email": "buyer@example.com"
}
```

### Error (400/500)
```json
{
  "error": "Error message"
}
```

## What Happens
1. **New buyer**: User is created in Supabase with purchase flags set
2. **Returning buyer**: User's purchases are updated (adds new products)
3. **Result**: Buyer can immediately log in with their email and PIN

## Testing the Webhook
Use curl to test:
```bash
curl -X POST https://story-message-alchemy-ai.vercel.app/api/webhooks/ghl \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "productId": 1,
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Troubleshooting

### Users can't log in after purchase
- Check Supabase: verify email exists and has correct purchase flags
- Verify webhook was sent (check GHL webhook logs)
- Check Vercel logs for errors

### Webhook returns error
- Ensure email field is present in payload
- Verify productId is 0, 1, 2, or 3
- Check network connectivity

### Users already exist but purchases aren't updating
- The webhook uses email as the unique key
- It will update existing users with new purchase flags
- Both old and new purchases are preserved

## After Launch
Once the webhook is live and working:
1. Buyers purchase from GHL
2. Webhook fires automatically
3. User added to Supabase with purchases
4. User goes to portal, logs in with email
5. PIN is created on first login
6. User accesses AI chat immediately

## Notes
- The webhook assumes all buyers have the book (sets `book: true`)
- ProductId 0 means they bought the bundle (all 3 AI products)
- If a buyer purchases multiple products over time, both are preserved in their account
