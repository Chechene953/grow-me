import { ENV } from '../utils/env';

async function http(path: string, options?: RequestInit) {
  if (!ENV.STRIPE_BACKEND_URL) throw new Error('Missing STRIPE backend URL');
  const res = await fetch(`${ENV.STRIPE_BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(options || {}),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json();
}

export const stripeService = {
  async createSubscriptionCheckoutSession({ userId, email }: { userId: string; email: string }) {
    return http('/create-subscription-checkout-session', {
      body: JSON.stringify({ userId, email }),
    });
  },

  async getBillingPortalUrl({ customerId }: { customerId: string }) {
    return http('/create-billing-portal-session', {
      body: JSON.stringify({ customerId }),
    });
  },

  async cancelSubscription({ subscriptionId }: { subscriptionId: string }) {
    return http('/cancel-subscription', {
      body: JSON.stringify({ subscriptionId }),
    });
  },
};


