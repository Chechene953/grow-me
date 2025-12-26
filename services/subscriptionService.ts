import { subscriptionPlans } from '../utils/subscriptionPlans';
import { paymentService } from './paymentService';
import { authService } from './authService';
import { Subscription } from '../types';
import { useAuthStore } from '../stores/authStore';

class SubscriptionService {
  getPlan() {
    return subscriptionPlans.assistedMonitoring;
  }

  async startAssistedMonitoring(): Promise<Subscription> {
    const plan = this.getPlan();
    const amount = plan.pricePerMonth;

    // Mock charge first month
    await paymentService.processPayment({
      cardNumber: '4242424242424242',
      expiry: '12/30',
      cvv: '123',
      amount,
      description: `Subscription: ${plan.name}`,
    });

    const now = Date.now();
    const nextMonth = now + 30 * 24 * 60 * 60 * 1000;
    const sub: Subscription = {
      planId: plan.id,
      active: true,
      startedAt: now,
      renewsAt: nextMonth,
      supportLevel: plan.supportLevel,
      includesInsurance: plan.includesInsurance,
      pricePerMonth: plan.pricePerMonth,
    };

    const user = useAuthStore.getState().user;
    if (user) {
      await authService.updateProfile(user.id, { subscription: sub });
      useAuthStore.setState({ user: { ...user, subscription: sub } });
    }
    return sub;
  }
}

export const subscriptionService = new SubscriptionService();


