'use strict';

const env = require('./env');

const PAYPAL_BASE_URL = env.PAYPAL_BASE_URL;

function buildPayPalError(prefix, errData) {
  const issue = errData?.details?.[0]?.issue;
  const description = errData?.details?.[0]?.description || errData?.message;
  const debugId = errData?.debug_id;

  const parts = [prefix];
  if (issue) parts.push(`issue=${issue}`);
  if (description) parts.push(`description=${description}`);
  if (debugId) parts.push(`debug_id=${debugId}`);

  const err = new Error(parts.join(' | '));
  err.status = 422;
  err.paypal = errData;
  return err;
}

async function getAccessToken() {
  const credentials = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`PayPal token error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function createOrder(amount, currency = 'USD', returnUrl, cancelUrl) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: parseFloat(amount).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw buildPayPalError('PayPal create order failed', errData);
  }

  return response.json();
}

// SDK v6 version - doesn't need return URLs as SDK handles the flow
async function createOrderV6(amount, currency = 'EUR') {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: parseFloat(amount).toFixed(2),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw buildPayPalError('PayPal create order failed', errData);
  }

  return response.json();
}

async function captureOrder(orderId) {
  // Validate orderId to prevent SSRF - PayPal order IDs are alphanumeric
  if (!orderId || !/^[A-Z0-9]+$/i.test(orderId)) {
    throw new Error('Invalid PayPal order ID format');
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errData = await response.json();
    throw buildPayPalError('PayPal capture failed', errData);
  }

  return response.json();
}

module.exports = { createOrder, createOrderV6, captureOrder };
