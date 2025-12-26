import 'react-native-gesture-handler';
// Import firebase/auth early to ensure the Auth component is registered
import 'firebase/auth';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);


