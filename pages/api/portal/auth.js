import { promisify } from 'node:util';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

import { supabase } from '../lib/supabaseClient.js';

const scryptAsync = promisify(scrypt);
const PIN_PATTERN = /^\d{4}$/;

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function toPortalPurchases(purchases = {}) {
  return {
    book: purchases.book === true,
    gptMessage: purchases.product_1 === true || purchases.bundle_3ai === true,
    gptAvatar: purchases.product_2 === true || purchases.bundle_3ai === true,
    gptOffer: purchases.product_3 === true || purchases.bundle_3ai === true,
    masterclass: purchases.masterclass === true,
  };
}

function toPortalBuyer(user) {
  return {
    email: user.email,
    purchases: toPortalPurchases(user.purchases),
  };
}

async function findUser(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id,email,pin_hash,purchases')
    .ilike('email', email)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function hashPin(pin) {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(pin, salt, 64);

  return `scrypt:${salt.toString('hex')}:${Buffer.from(derivedKey).toString('hex')}`;
}

async function verifyPin(pin, storedHash) {
  if (typeof storedHash !== 'string') return false;

  const [algorithm, saltHex, keyHex] = storedHash.split(':');
  if (algorithm !== 'scrypt' || !saltHex || !keyHex) return false;

  try {
    const expectedKey = Buffer.from(keyHex, 'hex');
    const actualKey = Buffer.from(await scryptAsync(pin, Buffer.from(saltHex, 'hex'), expectedKey.length));

    return expectedKey.length === actualKey.length && timingSafeEqual(expectedKey, actualKey);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const email = normalizeEmail(req.body?.email);
  const action = req.body?.action;

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      error: 'INVALID_EMAIL',
      message: 'Enter a valid email address.',
    });
  }

  if (!['lookup', 'create_pin', 'login'].includes(action)) {
    return res.status(400).json({ error: 'INVALID_ACTION' });
  }

  try {
    const user = await findUser(email);

    if (action === 'lookup') {
      return res.status(200).json({
        exists: Boolean(user),
        has_pin: Boolean(user?.pin_hash),
      });
    }

    const pin = req.body?.pin;
    if (!PIN_PATTERN.test(pin)) {
      return res.status(400).json({
        error: 'INVALID_PIN_FORMAT',
        message: 'Enter a 4-digit PIN.',
      });
    }

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'We could not find a purchase under that email.',
      });
    }

    if (action === 'create_pin') {
      if (user.pin_hash) {
        return res.status(409).json({
          error: 'PIN_ALREADY_SET',
          message: 'A PIN already exists for this account.',
        });
      }

      const pinHash = await hashPin(pin);
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          pin_hash: pinHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .is('pin_hash', null)
        .select('id,email,purchases')
        .maybeSingle();

      if (error) throw error;
      if (!updatedUser) {
        return res.status(409).json({
          error: 'PIN_ALREADY_SET',
          message: 'A PIN already exists for this account.',
        });
      }

      return res.status(200).json({
        success: true,
        buyer: toPortalBuyer(updatedUser),
      });
    }

    if (action === 'login') {
      const isValidPin = await verifyPin(pin, user.pin_hash);
      if (!isValidPin) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'That PIN is incorrect. Please try again.',
        });
      }

      return res.status(200).json({
        success: true,
        buyer: toPortalBuyer(user),
      });
    }
  } catch (error) {
    console.error('[PORTAL_AUTH] REQUEST_FAILED', {
      action,
      error: error.message,
    });

    return res.status(500).json({
      error: 'AUTH_SERVICE_ERROR',
      message: 'Unable to sign in right now. Please try again.',
    });
  }
}
