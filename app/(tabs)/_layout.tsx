import { Platform, DynamicColorIOS } from 'react-native';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { useCartStore } from '../../stores/cartStore';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as defaultColors } from '../../theme';

export default function TabLayout() {
  const { items } = useCartStore();
  const { isDark } = useTheme();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Dynamic colors for iOS liquid glass effect
  const dynamicTintColor = Platform.OS === 'ios'
    ? DynamicColorIOS({ dark: '#FFFFFF', light: defaultColors.primary[600] })
    : isDark ? '#FFFFFF' : defaultColors.primary[600];

  const dynamicLabelColor = Platform.OS === 'ios'
    ? DynamicColorIOS({ dark: '#FFFFFF', light: '#000000' })
    : isDark ? '#FFFFFF' : '#000000';

  return (
    <NativeTabs
      tintColor={dynamicTintColor}
      labelStyle={{
        color: dynamicLabelColor,
      }}
      // iOS 26+ feature: minimize tab bar on scroll
      minimizeBehavior="onScrollDown"
    >
      {/* Home Tab */}
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{
            default: 'house',
            selected: 'house.fill'
          }}
          fontawesomeregular="home"
          fontawesomebold="home"
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      {/* Cart Tab */}
      <NativeTabs.Trigger name="cart">
        <Icon
          sf={{
            default: 'cart',
            selected: 'cart.fill'
          }}
          fontawesomeregular="shopping-cart"
          fontawesomebold="shopping-cart"
        />
        <Label>Cart</Label>
        {cartItemCount > 0 && (
          <Badge>{cartItemCount > 9 ? '9+' : String(cartItemCount)}</Badge>
        )}
      </NativeTabs.Trigger>

      {/* Profile Tab */}
      <NativeTabs.Trigger name="profile">
        <Icon
          sf={{
            default: 'person.circle',
            selected: 'person.circle.fill'
          }}
          fontawesomeregular="user"
          fontawesomebold="user"
        />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
