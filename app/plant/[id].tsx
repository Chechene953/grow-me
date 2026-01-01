import { useLocalSearchParams } from 'expo-router';
import { PlantDetailScreen } from '../../screens/PlantDetailScreen';

export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlantDetailScreen plantId={id || ''} />;
}
