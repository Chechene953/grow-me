import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ModernHeader } from '../components/ModernHeader';
import { useAuthStore } from '../stores/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  quickReplies?: string[];
}

interface QuickReply {
  text: string;
  response: string;
  followUp?: string[];
}

const QUICK_REPLIES: Record<string, QuickReply> = {
  'Order Status': {
    text: 'Order Status',
    response: 'I can help you track your order! To check your order status, please go to Profile > My Orders. There you\'ll find all your orders with real-time tracking information. Is there anything specific about an order you\'d like to know?',
    followUp: ['Track my order', 'Cancel order', 'Return request'],
  },
  'Track my order': {
    text: 'Track my order',
    response: 'You can track your order in the "My Orders" section. Each order shows its current status: Processing, Shipped, Out for Delivery, or Delivered. Once shipped, you\'ll receive an email with the tracking number.',
  },
  'Cancel order': {
    text: 'Cancel order',
    response: 'To cancel an order, please contact us within 2 hours of placing it. After that, the order enters processing and cannot be cancelled. Would you like me to connect you with our support team?',
    followUp: ['Contact support', 'Back to menu'],
  },
  'Return request': {
    text: 'Return request',
    response: 'We accept returns within 14 days for non-plant items. For plants, we offer replacements if they arrive damaged. To start a return, go to My Orders > Select Order > Request Return.',
  },
  'Shipping Info': {
    text: 'Shipping Info',
    response: 'We offer several shipping options:\n\n📦 Standard (3-5 days): Free on orders over $50\n🚀 Express (1-2 days): $9.99\n⚡ Same-day (select areas): $14.99\n\nAll plants are carefully packaged to ensure they arrive healthy!',
    followUp: ['Shipping to my area', 'Track my order', 'Back to menu'],
  },
  'Shipping to my area': {
    text: 'Shipping to my area',
    response: 'We currently ship to all 50 US states and Canada. Delivery times may vary based on your location. Would you like me to check estimated delivery times for your zip code?',
  },
  'Plant Care': {
    text: 'Plant Care',
    response: 'Great question! Each plant in our app has detailed care instructions. You can find them by:\n\n1. Go to the plant\'s page\n2. Tap "Care Tips"\n3. View watering, lighting, and feeding schedules\n\nWe also have a comprehensive Care Tips section in your Profile!',
    followUp: ['Watering tips', 'Light requirements', 'Back to menu'],
  },
  'Watering tips': {
    text: 'Watering tips',
    response: 'Here are some general watering tips:\n\n💧 Check soil moisture before watering\n💧 Water when top inch is dry\n💧 Use room temperature water\n💧 Ensure proper drainage\n💧 Reduce watering in winter\n\nWant specific tips for a particular plant?',
  },
  'Light requirements': {
    text: 'Light requirements',
    response: 'Plants have different light needs:\n\n☀️ Bright direct: Cacti, succulents\n🌤️ Bright indirect: Monstera, Fiddle leaf\n🌥️ Medium: Pothos, Dracaena\n🌙 Low light: Snake plant, ZZ plant\n\nCheck each plant\'s page for specific recommendations!',
  },
  'Payment Issues': {
    text: 'Payment Issues',
    response: 'I\'m sorry to hear you\'re having payment issues. Here are some common solutions:\n\n• Verify card details are correct\n• Check if your card is enabled for online purchases\n• Try a different payment method\n• Clear app cache and retry\n\nIf issues persist, our support team can help!',
    followUp: ['Update payment method', 'Contact support', 'Back to menu'],
  },
  'Update payment method': {
    text: 'Update payment method',
    response: 'To update your payment method:\n\n1. Go to Profile > Settings\n2. Select "Payment Methods"\n3. Add or edit your card details\n\nWe accept Visa, Mastercard, Amex, and Google Pay.',
  },
  'Subscription Help': {
    text: 'Subscription Help',
    response: 'I can help with your GrowMe Premium subscription! What would you like to know?',
    followUp: ['Premium benefits', 'Cancel subscription', 'Billing questions'],
  },
  'Premium benefits': {
    text: 'Premium benefits',
    response: 'GrowMe Premium includes:\n\n👑 Free shipping on all orders\n👑 20% off all purchases\n👑 Exclusive plant releases\n👑 Priority customer support\n👑 Free plant insurance\n👑 Monthly care tips newsletter\n\nAll for just $9.99/month!',
  },
  'Cancel subscription': {
    text: 'Cancel subscription',
    response: 'To cancel your subscription:\n\n1. Go to Profile > Subscription\n2. Tap "Manage Subscription"\n3. Select "Cancel Subscription"\n\nYou\'ll keep premium benefits until your billing period ends. We\'d hate to see you go! 💚',
  },
  'Billing questions': {
    text: 'Billing questions',
    response: 'For billing inquiries:\n\n• View invoices in Profile > Subscription\n• Billing occurs on your signup date each month\n• Failed payments are retried after 3 days\n\nNeed help with a specific charge?',
    followUp: ['Contact support', 'Back to menu'],
  },
  'Contact support': {
    text: 'Contact support',
    response: 'You can reach our support team:\n\n📧 Email: support@growme.app\n📞 Phone: 1-800-123-4567\n⏰ Hours: Mon-Fri 9am-6pm EST\n💬 This chat: 24/7\n\nOur team typically responds within 2 hours during business hours!',
  },
  'Back to menu': {
    text: 'Back to menu',
    response: 'Sure! How can I help you today?',
    followUp: ['Order Status', 'Shipping Info', 'Plant Care', 'Payment Issues', 'Subscription Help'],
  },
};

const INITIAL_MESSAGE: Message = {
  id: '1',
  text: 'Hi there! 👋 I\'m Leaf, your GrowMe assistant. How can I help you today?',
  isBot: true,
  timestamp: new Date(),
  quickReplies: ['Order Status', 'Shipping Info', 'Plant Care', 'Payment Issues', 'Subscription Help'],
};

export const LiveChatScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (text: string, isBot: boolean, quickReplies?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
      quickReplies,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);

    // Find matching quick reply or default response
    const reply = QUICK_REPLIES[userMessage];

    setTimeout(() => {
      setIsTyping(false);
      if (reply) {
        addMessage(reply.response, true, reply.followUp);
      } else {
        // Default response for unrecognized messages
        addMessage(
          'Thanks for your message! For this specific question, I recommend contacting our support team for personalized help. Is there anything else I can help you with?',
          true,
          ['Contact support', 'Back to menu']
        );
      }

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000 + Math.random() * 500);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addMessage(inputText.trim(), false);
    setInputText('');
    simulateBotResponse(inputText.trim());

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickReply = (reply: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addMessage(reply, false);
    simulateBotResponse(reply);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <ModernHeader title="Live Chat" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Bot Avatar Header */}
          <View style={styles.botHeader}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[700]]}
              style={styles.botAvatar}
            >
              <MaterialCommunityIcons name="leaf" size={24} color={colors.neutral[0]} />
            </LinearGradient>
            <View style={styles.botInfo}>
              <Text style={styles.botName}>Leaf</Text>
              <View style={styles.onlineStatus}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
          </View>

          {/* Messages */}
          {messages.map((message, index) => (
            <View key={message.id}>
              <View
                style={[
                  styles.messageRow,
                  message.isBot ? styles.messageRowBot : styles.messageRowUser,
                ]}
              >
                {message.isBot && (
                  <View style={styles.messageBotAvatar}>
                    <MaterialCommunityIcons name="leaf" size={16} color={colors.primary[600]} />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.isBot ? styles.messageBubbleBot : styles.messageBubbleUser,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.isBot ? styles.messageTextBot : styles.messageTextUser,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
                </View>
              </View>

              {/* Quick Replies */}
              {message.quickReplies && index === messages.length - 1 && !isTyping && (
                <View style={styles.quickRepliesContainer}>
                  {message.quickReplies.map((reply) => (
                    <TouchableOpacity
                      key={reply}
                      style={styles.quickReplyButton}
                      onPress={() => handleQuickReply(reply)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickReplyText}>{reply}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowBot]}>
              <View style={styles.messageBotAvatar}>
                <MaterialCommunityIcons name="leaf" size={16} color={colors.primary[600]} />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleBot, styles.typingBubble]}>
                <TypingIndicator />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.neutral[400]}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={inputText.trim() ? colors.neutral[0] : colors.neutral[400]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// Typing Indicator Component
const TypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = animate(dot1, 0);
    const anim2 = animate(dot2, 150);
    const anim3 = animate(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  const getDotStyle = (dot: Animated.Value) => ({
    opacity: dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [{
      translateY: dot.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -4],
      }),
    }],
  });

  return (
    <View style={styles.typingIndicator}>
      <Animated.View style={[styles.typingDot, getDotStyle(dot1)]} />
      <Animated.View style={[styles.typingDot, getDotStyle(dot2)]} />
      <Animated.View style={[styles.typingDot, getDotStyle(dot3)]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
  },

  // Bot Header
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botInfo: {
    marginLeft: spacing.md,
  },
  botName: {
    ...typography.title3,
    color: colors.neutral[900],
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.success,
    marginRight: spacing.xs,
  },
  onlineText: {
    ...typography.caption,
    color: colors.semantic.success,
  },

  // Messages
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageBotAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  messageBubbleBot: {
    backgroundColor: colors.neutral[0],
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary[600],
    borderBottomRightRadius: 4,
  },
  messageText: {
    ...typography.body,
    lineHeight: 22,
  },
  messageTextBot: {
    color: colors.neutral[800],
  },
  messageTextUser: {
    color: colors.neutral[0],
  },
  messageTime: {
    ...typography.caption,
    color: colors.neutral[400],
    marginTop: spacing.xs,
    textAlign: 'right',
  },

  // Quick Replies
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 36,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  quickReplyButton: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  quickReplyText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.primary[600],
  },

  // Typing
  typingBubble: {
    paddingVertical: spacing.md,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[400],
  },

  // Input
  inputArea: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.xl,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[200],
  },
});
