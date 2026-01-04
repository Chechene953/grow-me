# GrowMe Stripe Backend

Payment processing backend for the GrowMe application.

## Deployment

```bash
npm install -g vercel
cd stripe-backend
npm install
vercel
```

Add environment variable:

```bash
vercel env add STRIPE_SECRET_KEY
vercel --prod
```

## API

### POST /api/create-payment-intent

```json
{
  "amount": 1000,
  "currency": "usd"
}
```

Response:

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |

## Test Cards

- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
