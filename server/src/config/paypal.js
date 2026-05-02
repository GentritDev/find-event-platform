'use strict';

const env = require('./env');

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
    throw new Error(`PayPal create order error: ${JSON.stringify(errData)}`);
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
    throw new Error(`PayPal capture error: ${JSON.stringify(errData)}`);
  }

  return response.json();
}

module.exports = { createOrder, captureOrder };
