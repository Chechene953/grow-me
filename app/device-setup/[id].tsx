import { useLocalSearchParams } from 'expo-router';
import { DeviceSetupScreen } from '../../screens/DeviceSetupScreen';

export default function DeviceSetup() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DeviceSetupScreen plantId={id || ''} />;
}
