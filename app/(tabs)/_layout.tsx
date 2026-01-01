import { Platform, DynamicColorIOS } from 'react-native';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { useCartStore } from '../../stores/cartStore';
import { colors } from '../../theme';

export default function TabLayout() {
  const { items } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Dynamic colors for iOS liquid glass effect
  const dynamicTintColor = Platform.OS === 'ios'
    ? DynamicColorIOS({ dark: '#FFFFFF', light: colors.primary[600] })
    : colors.primary[600];

  const dynamicLabelColor = Platform.OS === 'ios'
    ? DynamicColorIOS({ dark: '#FFFFFF', light: '#000000' })
    : '#000000';

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
        {Platform.select({
          ios: (
            <Icon
              sf={{
                default: 'house',
                selected: 'house.fill'
              }}
            />
          ),
          android: (
            <Icon
              drawable="ic_home"
            />
          ),
        })}
        <Label>Home</Label>
      </NativeTabs.Trigger>

      {/* Cart Tab */}
      <NativeTabs.Trigger name="cart">
        {Platform.select({
          ios: (
            <Icon
              sf={{
                default: 'cart',
                selected: 'cart.fill'
              }}
            />
          ),
          android: (
            <Icon
              drawable="ic_cart"
            />
          ),
        })}
        <Label>Cart</Label>
        {cartItemCount > 0 && (
          <Badge>{cartItemCount > 9 ? '9+' : String(cartItemCount)}</Badge>
        )}
      </NativeTabs.Trigger>

      {/* Profile Tab */}
      <NativeTabs.Trigger name="profile">
        {Platform.select({
          ios: (
            <Icon
              sf={{
                default: 'person.circle',
                selected: 'person.circle.fill'
              }}
            />
          ),
          android: (
            <Icon
              drawable="ic_profile"
            />
          ),
        })}
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
