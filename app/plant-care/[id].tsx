import { useLocalSearchParams } from 'expo-router';
import { PlantCareScreen } from '../../screens/PlantCareScreen';

export default function PlantCare() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlantCareScreen plantId={id || ''} />;
}
