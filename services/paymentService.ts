interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export const paymentService = {
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    return {
      clientSecret: 'mock_client_secret',
      amount,
      currency,
    };
  },

  async processPayment(
    paymentMethodId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<PaymentResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentIntentId: 'pi_mock_' + Date.now(),
        });
      }, 1500);
    });
  },

  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s|-/g, '');
    return /^\d{13,19}$/.test(cleaned);
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
};
