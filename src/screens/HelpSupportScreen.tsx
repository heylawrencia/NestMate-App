/**
 * HelpSupportScreen — Student Help & Support Center (Spec §10.3 & Item 22)
 *
 * Layout:
 *  1. Header Illustration
 *  2. Primary WhatsApp Card ("Usually replies in 1 hr") using spec §10.3 openWhatsApp helper
 *     with prefilled email & app version (wa.me fallback)
 *  3. Call Card with hours (Mon-Fri 8am-6pm GMT per D5) opening phone dialler
 *  4. 5 FAQ accordions expanding IN PLACE (no navigation, no network)
 */

import React, { useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

const SUPPORT_PHONE = '233532423802';
const APP_VERSION = 'v2.0';

/** Verbatim openWhatsApp implementation per spec §10.3 */
async function openWhatsApp(userEmail: string) {
  const text = encodeURIComponent(
    `Hi NESTMATE Support! I need assistance with my account.\nAccount: ${userEmail || 'Student'}\nVersion: ${APP_VERSION}`
  );
  const nativeUrl = `whatsapp://send?phone=${SUPPORT_PHONE}&text=${text}`;
  const webUrl = `https://wa.me/${SUPPORT_PHONE}?text=${text}`;

  try {
    const canOpen = await Linking.canOpenURL(nativeUrl);
    if (canOpen) {
      await Linking.openURL(nativeUrl);
    } else {
      await Linking.openURL(webUrl);
    }
  } catch {
    await Linking.openURL(webUrl);
  }
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do 48-hour bed holds work?',
    answer:
      'When you pick an available bed, NESTMATE reserves it exclusively for you for 48 hours. This holds the bed while you arrange payment directly with the hostel manager. If unconfirmed after 48 hours, the bed returns to free availability.',
  },
  {
    id: 'faq-2',
    question: 'How do I pay my hostel manager?',
    answer:
      'You pay room booking fees directly to your hostel manager or owner offline using Mobile Money (MoMo) or cash. NESTMATE never collects or holds student booking funds.',
  },
  {
    id: 'faq-3',
    question: 'What if I do not receive an access code?',
    answer:
      'Upon receiving payment, your hostel manager generates a 6-character receipt code (e.g. 123-456). If you have paid but haven’t received a code, contact support on WhatsApp or call us with your payment receipt.',
  },
  {
    id: 'faq-4',
    question: 'How is roommate compatibility calculated?',
    answer:
      'Compatibility is computed using a weighted 5-factor lifestyle model: Sleep Schedule (25%), Cleanliness (25%), Noise Level (20%), Social Energy (15%), and Budget (15%). Hard clashes like smoking or pet allergies are flagged automatically.',
  },
  {
    id: 'faq-5',
    question: 'Can I cancel or change my bed booking?',
    answer:
      'You can cancel an active bed hold at any time prior to code redemption via the Hold Pending screen. Confirmed allocations require manager approval for room reassignment.',
  },
];

export default function HelpSupportScreen({ navigation }: Props) {
  const { email } = useAuth();
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleCall = () => {
    Linking.openURL(`tel:+${SUPPORT_PHONE}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Header Hero */}
        <ElevatedCard style={styles.heroCard}>
          <IconCircle size={64} backgroundColor={colors.primaryLight} style={styles.iconCenter}>
            <Ionicons name="headset-outline" size={32} color={colors.primary} />
          </IconCircle>
          <Text style={styles.heroTitle}>We&apos;re Here to Help</Text>
          <Text style={styles.heroSubtitle}>
            Have questions about room booking, access codes, or roommate matching? Reach out directly.
          </Text>
        </ElevatedCard>

        {/* 2. Primary WhatsApp Card */}
        <ElevatedCard style={styles.supportCard}>
          <View style={styles.cardHeaderRow}>
            <IconCircle size={44} backgroundColor={colors.primaryLight}>
              <Ionicons name="logo-whatsapp" size={24} color={colors.primary} />
            </IconCircle>
            <View style={styles.cardTextCol}>
              <View style={styles.badgeRow}>
                <Text style={styles.cardTitle}>WhatsApp Support</Text>
                <View style={styles.fastReplyBadge}>
                  <Text style={styles.fastReplyText}>Usually replies in 1 hr</Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>Chat directly with NESTMATE student support team</Text>
            </View>
          </View>

          <AppButton
            title="Chat on WhatsApp →"
            variant="primary"
            size="lg"
            onPress={() => openWhatsApp(email ?? '')}
          />
        </ElevatedCard>

        {/* 3. Call Card */}
        <ElevatedCard style={styles.supportCard}>
          <View style={styles.cardHeaderRow}>
            <IconCircle size={44} backgroundColor={colors.primaryLight}>
              <Ionicons name="call-outline" size={24} color={colors.primary} />
            </IconCircle>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Phone Support</Text>
              <Text style={styles.cardPhone}>+233 53 242 3802</Text>
              <Text style={styles.cardSubtitle}>Mon – Fri: 8:00 AM – 6:00 PM GMT</Text>
            </View>
          </View>

          <AppButton
            title="Call Support"
            variant="outline"
            size="md"
            onPress={handleCall}
          />
        </ElevatedCard>

        {/* 4. Five FAQ Accordions */}
        <Text style={styles.faqSectionHeading}>Frequently Asked Questions</Text>

        <View style={styles.faqGroup}>
          {FAQS.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqAccordionCard}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.85}
              >
                <View style={styles.faqQuestionRow}>
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.inkMuted}
                  />
                </View>

                {/* Expanded content IN PLACE */}
                {isExpanded && (
                  <View style={styles.faqAnswerWrapper}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    padding: space.xs,
    marginRight: space.sm,
  },
  headerTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  scrollContent: {
    padding: space.lg,
    gap: space.md,
  },
  heroCard: {
    padding: space.xl,
    alignItems: 'center',
    borderRadius: radius.xl,
  },
  iconCenter: {
    marginBottom: space.md,
  },
  heroTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: space.xs,
  },
  heroSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  supportCard: {
    padding: space.lg,
    borderRadius: radius.xl,
    gap: space.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  cardTextCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    color: colors.ink,
    fontWeight: '700',
  },
  fastReplyBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  fastReplyText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  cardPhone: {
    fontFamily: type.price.fontFamily,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
  },
  faqSectionHeading: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
    marginTop: space.sm,
  },
  faqGroup: {
    gap: space.sm,
  },
  faqAccordionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestionText: {
    flex: 1,
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
    marginRight: space.xs,
  },
  faqAnswerWrapper: {
    marginTop: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  faqAnswerText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 19,
  },
});
