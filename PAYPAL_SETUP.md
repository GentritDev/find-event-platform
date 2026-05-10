# PayPal SDK v6 Integration Guide

## 📋 Prerequisites

Before setting up PayPal payments, you need:
1. A PayPal Developer account
2. Client ID and Client Secret from PayPal
3. Your application URLs (frontend and backend)

## 🔐 Getting PayPal Credentials

### Step 1: Create/Login to PayPal Developer Account
- Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- Log in with your PayPal business account or create one

### Step 2: Create an App
1. Navigate to **Apps & Credentials** 
2. Make sure you're on the **Sandbox** tab
3. Click **Create App** under the Sandbox section
4. Name your app (e.g., "Find Event Platform")
5. Select **Merchant** as the app type
6. Click **Create App**

### Step 3: Get Your Credentials
1. In the **Sandbox** section, find your app
2. Copy the **Client ID** 
3. Under your app name, click **Show** to reveal the **Secret**

Your credentials will look like:
```
Client ID: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Secret: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## ⚙️ Environment Configuration

### Backend (.env file)

Create or update your `.server/.env` file:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_secret_here
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# URLs for success/cancel redirects
CLIENT_URL=http://localhost:5173
```

### Frontend (.env file)

Create or update your `client/.env` file:

```env
# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id_here
```

### Frontend (vite.config.js)

Make sure your `.env` variables are exposed in `vite.config.js`:

```javascript
export default defineConfig({
  define: {
    'import.meta.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(process.env.VITE_PAYPAL_CLIENT_ID),
  },
  // ... other config
})
```

## 📝 How the Payment Flow Works (SDK v6)

```
1. User visits Event Detail Page
   ↓
2. User clicks "Buy with PayPal" button
   ↓
3. Frontend initializes PayPal SDK v6 with Client ID
   ↓
4. SDK checks payment eligibility (currency, location, etc)
   ↓
5. User clicks PayPal button → PayPal approval modal opens
   ↓
6. Backend creates PayPal Order and returns orderId
   ↓
7. User approves payment in PayPal modal
   ↓
8. Frontend captures the order on backend
   ↓
9. Backend processes payment and generates ticket
   ↓
10. User redirected to success page with ticket
```

## 🔗 API Endpoints

### Create PayPal Order
```
POST /api/payments/paypal/create-order
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "event_id": "uuid"
}

Response:
{
  "success": true,
  "data": {
    "order": { ... },
    "paypalOrderId": "7C679815D..."
  }
}
```

### Capture PayPal Order
```
POST /api/payments/paypal/capture-order
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "paypal_order_id": "7C679815D..."
}

Response:
{
  "success": true,
  "data": {
    "order": { ... },
    "ticket": { ... }
  }
}
```

### Get User Orders
```
GET /api/payments/orders
Authorization: Bearer <user_token>

Response:
{
  "success": true,
  "data": [
    { order details... }
  ]
}
```

## 🧪 Testing Payments

### Sandbox Test Cards

PayPal provides test accounts for sandbox testing:

1. **Go to Sandbox Accounts:**
   - PayPal Developer Dashboard → Apps & Credentials → Sandbox → Accounts
   - You'll see pre-created Personal and Business accounts

2. **Testing Payments:**
   - Click "Buy with PayPal" on an event
   - Use the sandbox credentials to log in
   - Use the test payment methods provided

3. **Common Test Scenarios:**
   - Successful payment: Use the default business account
   - Declined payment: Use a personal account
   - Change status: Edit sandbox account settings

### Currency Note
Currently configured for **EUR** (Euros). The SDK v6 automatically handles:
- Currency conversion if needed
- Eligibility checks based on location
- Available payment methods per region

## 🚀 Deploying to Production

### Step 1: Switch to Live Credentials
1. In PayPal Developer Dashboard, switch from **Sandbox** to **Live** tab
2. Get your **Live Client ID** and **Secret**

### Step 2: Update Environment Variables
```env
# Production
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_secret
PAYPAL_BASE_URL=https://api-m.paypal.com
VITE_PAYPAL_CLIENT_ID=your_live_client_id
```

### Step 3: Update PayPal SDK Script
In `client/index.html`, change:
```html
<!-- Sandbox (testing) -->
<script src="https://www.sandbox.paypal.com/web-sdk/v6/core"></script>

<!-- Production (real money) -->
<script src="https://www.paypal.com/web-sdk/v6/core"></script>
```

### Step 4: Enable Required Features
In PayPal Dashboard → Account Settings:
- Enable PayPal Payments Standard or Plus
- Set up webhook notifications
- Configure return URLs (if using redirect flow)

## 🐛 Troubleshooting

### Error: "PayPal SDK not loaded"
- Check if the script is loaded in `index.html`
- Wait for page to fully load before clicking button
- Check browser console for CORS errors

### Error: "PayPal is not available for your location"
- PayPal eligibility depends on currency and location
- Currently set to EUR, change in settings if needed
- Some payment methods not available in all countries

### Order not found / 404 errors
- Verify backend is running: `npm run dev` in `server/` folder
- Check API endpoint URLs in `client/src/lib/api.js`
- Verify database is connected

### Payment captured but ticket not generated
- Check database migrations have run: `npm run migrate` in `server/`
- Verify tickets table exists
- Check server logs for ticket generation errors

## 📚 Additional Resources

- [PayPal SDK v6 Documentation](https://developer.paypal.com/sdk/js/reference)
- [PayPal Orders v2 API](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal Sandbox Testing Guide](https://developer.paypal.com/tools/sandbox/)

## 🔒 Security Checklist

- ✅ Never expose `PAYPAL_CLIENT_SECRET` in frontend code
- ✅ Always validate order details on backend before capture
- ✅ Use HTTPS in production
- ✅ Implement proper authentication (JWT tokens)
- ✅ Log all payment transactions
- ✅ Implement webhook handlers for payment notifications

## 📞 Support

For PayPal-specific issues:
- Check PayPal Developer Forums
- Contact PayPal Merchant Support
- Review error codes in PayPal API documentation

For application issues:
- Check server logs: `npm run dev` output
- Check browser console: F12 → Console tab
- Verify database connectivity
