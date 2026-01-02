import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  Platform,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface PickerOption {
  label: string;
  value: string;
  icon?: string;
  subtitle?: string;
}

interface PremiumPickerProps {
  label: string;
  placeholder?: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
  searchable?: boolean;
  error?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const PremiumPicker: React.FC<PremiumPickerProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onValueChange,
  searchable = false,
  error,
  icon,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleSelect = (option: PickerOption) => {
    onValueChange(option.value);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            error && styles.pickerButtonError,
          ]}
          onPress={() => setModalVisible(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={colors.neutral[400]}
              style={styles.leftIcon}
            />
          )}
          <Text style={[
            styles.pickerText,
            !selectedOption && styles.placeholderText,
          ]}>
            {selectedOption?.label || placeholder}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={colors.neutral[400]}
          />
        </TouchableOpacity>
      </Animated.View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={[styles.modalContent, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.modalBackground}>
              {Platform.OS === 'ios' ? (
                <BlurView
                  intensity={90}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
            </View>
            <View style={styles.modalInner}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.neutral[600]}
                  />
                </TouchableOpacity>
              </View>

              {searchable && (
                <View style={styles.searchContainer}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={colors.neutral[400]}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={colors.neutral[400]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={18}
                        color={colors.neutral[400]}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      item.value === value && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    {item.icon && (
                      <Text style={styles.optionIcon}>{item.icon}</Text>
                    )}
                    <View style={styles.optionText}>
                      <Text style={[
                        styles.optionLabel,
                        item.value === value && styles.optionLabelSelected,
                      ]}>
                        {item.label}
                      </Text>
                      {item.subtitle && (
                        <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                      )}
                    </View>
                    {item.value === value && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={22}
                        color={colors.primary[600]}
                      />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyList}>
                    <MaterialCommunityIcons
                      name="magnify-close"
                      size={48}
                      color={colors.neutral[300]}
                    />
                    <Text style={styles.emptyText}>No results found</Text>
                  </View>
                }
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// Country data with flags
export const COUNTRIES: PickerOption[] = [
  { label: 'United States', value: 'US', icon: '🇺🇸' },
  { label: 'Canada', value: 'CA', icon: '🇨🇦' },
  { label: 'United Kingdom', value: 'GB', icon: '🇬🇧' },
  { label: 'France', value: 'FR', icon: '🇫🇷' },
  { label: 'Germany', value: 'DE', icon: '🇩🇪' },
  { label: 'Spain', value: 'ES', icon: '🇪🇸' },
  { label: 'Italy', value: 'IT', icon: '🇮🇹' },
  { label: 'Netherlands', value: 'NL', icon: '🇳🇱' },
  { label: 'Belgium', value: 'BE', icon: '🇧🇪' },
  { label: 'Switzerland', value: 'CH', icon: '🇨🇭' },
  { label: 'Austria', value: 'AT', icon: '🇦🇹' },
  { label: 'Australia', value: 'AU', icon: '🇦🇺' },
  { label: 'New Zealand', value: 'NZ', icon: '🇳🇿' },
  { label: 'Japan', value: 'JP', icon: '🇯🇵' },
  { label: 'South Korea', value: 'KR', icon: '🇰🇷' },
  { label: 'Singapore', value: 'SG', icon: '🇸🇬' },
  { label: 'Hong Kong', value: 'HK', icon: '🇭🇰' },
  { label: 'Mexico', value: 'MX', icon: '🇲🇽' },
  { label: 'Brazil', value: 'BR', icon: '🇧🇷' },
  { label: 'Argentina', value: 'AR', icon: '🇦🇷' },
  { label: 'Ireland', value: 'IE', icon: '🇮🇪' },
  { label: 'Sweden', value: 'SE', icon: '🇸🇪' },
  { label: 'Norway', value: 'NO', icon: '🇳🇴' },
  { label: 'Denmark', value: 'DK', icon: '🇩🇰' },
  { label: 'Finland', value: 'FI', icon: '🇫🇮' },
  { label: 'Portugal', value: 'PT', icon: '🇵🇹' },
  { label: 'Poland', value: 'PL', icon: '🇵🇱' },
  { label: 'Czech Republic', value: 'CZ', icon: '🇨🇿' },
  { label: 'Greece', value: 'GR', icon: '🇬🇷' },
  { label: 'India', value: 'IN', icon: '🇮🇳' },
  { label: 'United Arab Emirates', value: 'AE', icon: '🇦🇪' },
  { label: 'Saudi Arabia', value: 'SA', icon: '🇸🇦' },
  { label: 'Israel', value: 'IL', icon: '🇮🇱' },
  { label: 'South Africa', value: 'ZA', icon: '🇿🇦' },
  { label: 'China', value: 'CN', icon: '🇨🇳' },
  { label: 'Taiwan', value: 'TW', icon: '🇹🇼' },
  { label: 'Thailand', value: 'TH', icon: '🇹🇭' },
  { label: 'Malaysia', value: 'MY', icon: '🇲🇾' },
  { label: 'Philippines', value: 'PH', icon: '🇵🇭' },
  { label: 'Indonesia', value: 'ID', icon: '🇮🇩' },
  { label: 'Vietnam', value: 'VN', icon: '🇻🇳' },
];

// US States
export const US_STATES: PickerOption[] = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
  { label: 'District of Columbia', value: 'DC' },
];

// Canadian Provinces
export const CA_PROVINCES: PickerOption[] = [
  { label: 'Alberta', value: 'AB' },
  { label: 'British Columbia', value: 'BC' },
  { label: 'Manitoba', value: 'MB' },
  { label: 'New Brunswick', value: 'NB' },
  { label: 'Newfoundland and Labrador', value: 'NL' },
  { label: 'Northwest Territories', value: 'NT' },
  { label: 'Nova Scotia', value: 'NS' },
  { label: 'Nunavut', value: 'NU' },
  { label: 'Ontario', value: 'ON' },
  { label: 'Prince Edward Island', value: 'PE' },
  { label: 'Quebec', value: 'QC' },
  { label: 'Saskatchewan', value: 'SK' },
  { label: 'Yukon', value: 'YT' },
];

export const getStatesForCountry = (countryCode: string): PickerOption[] => {
  switch (countryCode) {
    case 'US':
      return US_STATES;
    case 'CA':
      return CA_PROVINCES;
    default:
      return [];
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  pickerButtonError: {
    borderColor: colors.semantic.error,
    backgroundColor: `${colors.semantic.error}08`,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  pickerText: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
  },
  placeholderText: {
    color: colors.neutral[400],
  },
  errorText: {
    ...typography.caption,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : colors.neutral[0],
  },
  modalInner: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.neutral[900],
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.lg,
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
    paddingVertical: spacing.sm,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[50],
  },
  optionItemSelected: {
    backgroundColor: colors.primary[50],
  },
  optionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    ...typography.body,
    color: colors.neutral[900],
  },
  optionLabelSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  optionSubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    marginTop: spacing.md,
  },
});
