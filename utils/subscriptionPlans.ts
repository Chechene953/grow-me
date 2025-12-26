import { SubscriptionPlan } from '../types';

export const subscriptionPlans = {
  assistedMonitoring: {
    id: 'assisted-monitoring',
    name: 'Assisted Monitoring + Expert 24/7 + Insurance',
    pricePerMonth: 9.99,
    supportLevel: '24/7-expert',
    includesInsurance: true,
    description:
      'Continuous IoT monitoring maintenance, 24/7 expert chat, and damage insurance.',
  } as SubscriptionPlan,
};


