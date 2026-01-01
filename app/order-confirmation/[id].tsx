import { useLocalSearchParams } from 'expo-router';
import { OrderConfirmationScreen } from '../../screens/OrderConfirmationScreen';

export default function OrderConfirmation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrderConfirmationScreen orderId={id || ''} />;
}
