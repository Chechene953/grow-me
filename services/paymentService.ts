// Stripe Payment Service
// For production, you need to set up a backend server to create Payment Intents

interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

// Configuration for Stripe
// In production, these should come from environment variables
const STRIPE_CONFIG = {
  // Use Stripe test publishable key for sandbox
  publishableKey: 'pk_test_51...',  // Replace with your Stripe test publishable key
  // Backend API URL for creating payment intents
  apiUrl: 'https://your-backend.com/api',  // Replace with your backend URL
  // Enable sandbox mode for testing
  sandboxMode: true,
};

// Simulated backend response for sandbox testing
// In production, this should call your actual backend
const createPaymentIntentOnBackend = async (amount: number, currency: string): Promise<PaymentIntent> => {
  if (STRIPE_CONFIG.sandboxMode) {
    // Sandbox mode - simulate successful payment intent creation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          clientSecret: `pi_test_${Date.now()}_secret_test`,
          paymentIntentId: `pi_test_${Date.now()}`,
          amount: Math.round(amount * 100), // Stripe uses cents
          currency,
        });
      }, 500);
    });
  }

  // Production mode - call your backend
  try {
    const response = await fetch(`${STRIPE_CONFIG.apiUrl}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to connect to payment server');
  }
};

export const paymentService = {
  // Get Stripe configuration
  getStripeConfig: () => ({
    publishableKey: STRIPE_CONFIG.publishableKey,
    sandboxMode: STRIPE_CONFIG.sandboxMode,
  }),

  // Create a Payment Intent (calls backend)
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    return createPaymentIntentOnBackend(amount, currency);
  },

  // Process payment with card details (sandbox mode)
  async processPayment(
    paymentMethodId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<PaymentResult> {
    if (STRIPE_CONFIG.sandboxMode) {
      // Sandbox mode - simulate payment processing
      return new Promise((resolve) => {
        setTimeout(() => {
          // Test card numbers for different scenarios
          // 4242424242424242 - Success
          // 4000000000000002 - Decline
          // 4000002500003155 - 3D Secure required

          resolve({
            success: true,
            paymentIntentId: `pi_sandbox_${Date.now()}`,
          });
        }, 1500);
      });
    }

    // Production mode - confirm payment with Stripe
    try {
      const paymentIntent = await this.createPaymentIntent(amount, currency);

      // In production, you would use the Stripe SDK to confirm the payment
      // const { error, paymentIntent: confirmedIntent } = await stripe.confirmPayment({
      //   clientSecret: paymentIntent.clientSecret,
      //   paymentMethodId,
      // });

      return {
        success: true,
        paymentIntentId: paymentIntent.paymentIntentId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  },

  // Process payment with Apple Pay / Google Pay
  async processDigitalWalletPayment(
    walletType: 'apple_pay' | 'google_pay',
    amount: number,
    currency: string = 'usd'
  ): Promise<PaymentResult> {
    if (STRIPE_CONFIG.sandboxMode) {
      // Sandbox mode - simulate digital wallet payment
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            paymentIntentId: `pi_${walletType}_${Date.now()}`,
          });
        }, 1000);
      });
    }

    // Production mode - use Stripe's Payment Sheet with digital wallet
    try {
      const paymentIntent = await this.createPaymentIntent(amount, currency);

      // In production, configure and present the Payment Sheet
      // await stripe.initPaymentSheet({
      //   merchantDisplayName: 'GrowMe',
      //   paymentIntentClientSecret: paymentIntent.clientSecret,
      //   applePay: { merchantCountryCode: 'US' },
      //   googlePay: { merchantCountryCode: 'US', testEnv: true },
      // });
      // const { error } = await stripe.presentPaymentSheet();

      return {
        success: true,
        paymentIntentId: paymentIntent.paymentIntentId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Digital wallet payment failed',
      };
    }
  },

  // Process PayPal payment
  async processPayPalPayment(amount: number, currency: string = 'usd'): Promise<PaymentResult> {
    if (STRIPE_CONFIG.sandboxMode) {
      // Sandbox mode - simulate PayPal payment
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            paymentIntentId: `pi_paypal_${Date.now()}`,
          });
        }, 1200);
      });
    }

    // Production mode - redirect to PayPal or use PayPal SDK
    try {
      // For Stripe-integrated PayPal, you would use Stripe's Payment Element
      // which supports PayPal as a payment method
      return {
        success: true,
        paymentIntentId: `pi_paypal_${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'PayPal payment failed',
      };
    }
  },

  // Card validation helpers
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s|-/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    // Luhn algorithm for card validation
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },

  validateExpiryDate(month: string, year: string): boolean {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;

    return true;
  },

  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  },

  // Get card brand from card number
  getCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s|-/g, '');

    const patterns: Record<string, RegExp> = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35)/,
    };

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleaned)) return brand;
    }

    return 'unknown';
  },
};

// Export types for use in components
export type { PaymentIntent, PaymentResult };
