# CVera - Payment URLs Guide

## Epoint.az Integration URLs

### Base Domain
```
https://cvera.az
```

### Payment Success URL
```
https://cvera.az/payment/success?transactionId=TXN123&orderId=ORDER123&amount=2000&status=success
```

### Payment Error URL  
```
https://cvera.az/payment/fail?error=payment_failed&message=Ödəniş uğursuz oldu&orderId=ORDER123
```

### Payment Result/Webhook URL
```
https://cvera.az/api/webhooks/epoint
```

## Example Payment Flow

1. **User selects subscription plan on pricing page**
   - Navigate to: `https://cvera.az/pricing`
   - Click "Satın Al" button for desired plan

2. **Payment creation request**
   - POST to: `/api/payments/create`
   - Body: `{ planId: "medium", amount: 2000 }`

3. **Redirect to Epoint.az payment gateway**
   - User completes payment on Epoint.az

4. **Payment completion redirects**
   - Success: `https://cvera.az/payment/success?transactionId=TXN123&orderId=ORDER123&amount=2000&status=success`
   - Failure: `https://cvera.az/payment/fail?error=payment_failed&message=Ödəniş uğursuz oldu&orderId=ORDER123`

5. **Webhook notification**
   - Epoint.az sends POST to: `https://cvera.az/api/webhooks/epoint`
   - Updates subscription status in database

## Configuration

Current Epoint.az configuration:
- **Public Key**: `i000200891`
- **API URL**: `https://epoint.az/api/1`
- **Development Mode**: `false` (real payments)

## Testing

To test payments with real API:
1. Go to: `https://cvera.az/pricing`
2. Select a plan
3. Complete payment with real card
4. Check success/error redirects
5. Verify subscription activation

## Development Mode (if needed)

To enable development mode for testing:
```bash
# In .env.local
EPOINT_DEVELOPMENT_MODE=true
```

This will simulate payments without real API calls.
