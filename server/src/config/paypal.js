'use strict';

const env = require('./env');
const crypto = require('crypto');

const PAYPAL_BASE_URL = env.PAYPAL_BASE_URL;

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

async function createOrderV6(amount, currency = 'EUR') {
  if (env.PAYPAL_MOCK_MODE) {
    const formattedAmount = parseFloat(amount).toFixed(2);
    const mockOrderId = `MOCK-${crypto.randomUUID().replace(/-/g, '').slice(0, 17).toUpperCase()}`;

    console.log('[PayPal] MOCK MODE - Simulating order creation:', mockOrderId);
    return {
      id: mockOrderId,
      status: 'CREATED',
      purchase_units: [
        {
          reference_id: `event-ticket-${Date.now()}`,
          amount: {
            currency_code: currency,
            value: formattedAmount,
          },
        },
      ],
      links: [],
    };
  }

  const accessToken = await getAccessToken();
  
  // Generate unique request ID to prevent duplicate charges
  const requestId = crypto.randomUUID();
  
  // Ensure amount is properly formatted as string with 2 decimals
  const formattedAmount = parseFloat(amount).toFixed(2);
  
  // Simplified payload without items to avoid PayPal sandbox compliance issues
  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: `event-ticket-${Date.now()}`,
        description: 'Event Ticket Purchase',
        amount: {
          currency_code: currency,
          value: formattedAmount,
        },
      },
    ],
  };

  console.log('[PayPal] Creating order with payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': requestId,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json();
    console.error('[PayPal] Create order error:', JSON.stringify(errData, null, 2));
    throw new Error(`PayPal create order error: ${JSON.stringify(errData)}`);
  }

  const orderData = await response.json();
  console.log('[PayPal] Order created successfully:', orderData.id);
  return orderData;
}

async function captureOrder(orderId) {
  // Validate orderId to prevent SSRF - PayPal order IDs are alphanumeric
  if (!orderId || !/^[A-Z0-9]+$/i.test(orderId)) {
    throw new Error('Invalid PayPal order ID format');
  }

  // MOCK MODE FOR TESTING - bypasses PayPal compliance issues
  if (env.PAYPAL_MOCK_MODE) {
    console.log('[PayPal] MOCK MODE - Simulating capture lookup for order:', orderId);
    return {
      id: orderId,
      status: 'COMPLETED',
      purchase_units: [],
    };
  }

  const accessToken = await getAccessToken();
  
  // Generate unique request ID for capture
  const requestId = crypto.randomUUID();

  console.log('[PayPal] Capturing order:', orderId);

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': requestId,
        'Prefer': 'return=representation',
      },
      body: '{}',
    }
  );

  if (!response.ok) {
    const errData = await response.json();
    console.error('[PayPal] Capture error:', JSON.stringify(errData, null, 2));
    throw new Error(`PayPal capture error: ${JSON.stringify(errData)}`);
  }

  const captureData = await response.json();
  console.log('[PayPal] Order captured successfully:', orderId);
  return captureData;
}

module.exports = { createOrderV6, captureOrder };
