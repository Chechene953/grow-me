import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface DemoPaymentFormProps {
    amount: number;
    onPaymentSuccess: (paymentIntentId: string) => void;
    onPaymentError: (error: string) => void;
}

export const DemoPaymentForm: React.FC<DemoPaymentFormProps> = ({
    amount,
    onPaymentSuccess,
    onPaymentError,
}) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [loading, setLoading] = useState(false);

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '').slice(0, 16);
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }
        return cleaned;
    };

    const isCardComplete = () => {
        const cardDigits = cardNumber.replace(/\s/g, '');
        const expiryDigits = expiry.replace('/', '');
        return cardDigits.length === 16 && expiryDigits.length === 4 && cvc.length >= 3;
    };

    const handleSubmit = async () => {
        if (!isCardComplete()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please enter complete card details');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);

        // Simulate payment processing
        setTimeout(() => {
            setLoading(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onPaymentSuccess(`demo_${Date.now()}`);
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <View style={styles.demoBanner}>
                <MaterialCommunityIcons name="information-outline" size={16} color={colors.primary[600]} />
                <Text style={styles.demoText}>Demo Mode - Expo Go</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Card Number</Text>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="credit-card-outline" size={20} color={colors.neutral[400]} />
                    <TextInput
                        style={styles.input}
                        placeholder="4242 4242 4242 4242"
                        placeholderTextColor={colors.neutral[400]}
                        value={cardNumber}
                        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                        keyboardType="numeric"
                        maxLength={19}
                    />
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Expiry</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="MM/YY"
                                placeholderTextColor={colors.neutral[400]}
                                value={expiry}
                                onChangeText={(text) => setExpiry(formatExpiry(text))}
                                keyboardType="numeric"
                                maxLength={5}
                            />
                        </View>
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>CVC</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="123"
                                placeholderTextColor={colors.neutral[400]}
                                value={cvc}
                                onChangeText={(text) => setCvc(text.replace(/\D/g, '').slice(0, 4))}
                                keyboardType="numeric"
                                maxLength={4}
                                secureTextEntry
                            />
                        </View>
                    </View>
                </View>

                <Text style={styles.label}>Postal Code</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="12345"
                        placeholderTextColor={colors.neutral[400]}
                        value={postalCode}
                        onChangeText={setPostalCode}
                        keyboardType="numeric"
                        maxLength={10}
                    />
                </View>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
                style={styles.payButtonContainer}
                onPress={handleSubmit}
                disabled={loading || !isCardComplete()}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={loading || !isCardComplete() ? [colors.neutral[400], colors.neutral[500]] : [colors.primary[500], colors.primary[700]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.payButton}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" color={colors.neutral[0]} />
                            <Text style={styles.payButtonText}>Processing...</Text>
                        </>
                    ) : (
                        <>
                            <MaterialCommunityIcons name="lock" size={20} color={colors.neutral[0]} />
                            <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
                <MaterialCommunityIcons name="shield-check" size={14} color={colors.semantic.success} />
                <Text style={styles.securityText}>
                    Demo mode - Use any card number for testing
                </Text>
            </View>

            {/* Test Card Info */}
            <View style={styles.testInfo}>
                <Text style={styles.testInfoTitle}>Test Card:</Text>
                <Text style={styles.testInfoText}>4242 4242 4242 4242</Text>
                <Text style={styles.testInfoText}>Any future date • Any CVC</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.sm,
    },
    demoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[50],
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        gap: spacing.xs,
    },
    demoText: {
        ...typography.caption,
        color: colors.primary[600],
        fontWeight: '600',
    },
    card: {
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    label: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        ...typography.body,
        color: colors.neutral[900],
        paddingVertical: spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    payButtonContainer: {
        marginTop: spacing.lg,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        ...shadows.md,
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md + 2,
        gap: spacing.sm,
    },
    payButtonText: {
        ...typography.body,
        fontWeight: '700',
        color: colors.neutral[0],
        fontSize: 17,
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        gap: spacing.xs,
    },
    securityText: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    testInfo: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    testInfoTitle: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.neutral[600],
        marginBottom: spacing.xs,
    },
    testInfoText: {
        ...typography.caption,
        color: colors.neutral[500],
    },
});
