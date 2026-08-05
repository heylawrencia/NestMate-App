/**
 * AccessCodeScreen — Access Code Redemption Screen (Spec §7.3 & Task 9)
 *
 * Input for 6-digit access code issued by manager after payment.
 * Automatically formats code with a hyphen (e.g. 123-456).
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import { HostelsStackParamList, RootStackParamList } from '../navigation/types';
import { formatAccessCode, verifyAccessCode } from '../services/hostelService';
import { colors, radius, space, type } from '../theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HostelsStackParamList, 'AccessCode'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AccessCodeScreen({ route, navigation }: Props) {
  const { hostelId } = route.params;

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChangeText = (text: string) => {
    // Allow uppercase alphanumeric characters and optional hyphen directly up to 7 chars (e.g. 123-456 or 123456)
    const cleaned = text.toUpperCase().slice(0, 7);
    setCode(cleaned);
    if (error) setError('');
  };

  const handleVerify = async () => {
    const rawCode = code.replace(/[^A-Za-z0-9]/g, '');
    if (rawCode.length < 6) {
      setError('Please enter the full 6-character access code.');
      return;
    }

    setError('');
    setSubmitting(true);
    const result = await verifyAccessCode(hostelId, rawCode);
    setSubmitting(false);

    if (result.success) {
      navigation.navigate('CodeVerified', { hostelId, code: rawCode });
    } else {
      setError(result.errorMessage ?? 'Invalid access code. Please check with your hostel manager.');
    }
  };

  const rawCodeLength = code.replace(/[^A-Za-z0-9]/g, '').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Access Code</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ElevatedCard style={styles.card}>
          <IconCircle size={64} backgroundColor={colors.primaryLight} style={styles.iconCenter}>
            <Ionicons name="key-outline" size={32} color={colors.primary} />
          </IconCircle>

          <Text style={styles.cardTitle}>Hostel Manager Receipt Code</Text>
          <Text style={styles.cardSubtitle}>
            Enter the 6-character access code provided by your hostel manager after paying your booking fee.
          </Text>

          <View style={styles.inputContainer}>
            <AppTextInput
              label="Access Code (e.g. 123-456)"
              value={code}
              onChangeText={handleChangeText}
              placeholder="123-456"
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="default"
              maxLength={7}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actionRow}>
            <AppButton
              title="Verify Code & Confirm Bed →"
              variant="primary"
              size="lg"
              disabled={rawCodeLength < 6}
              loading={submitting}
              onPress={handleVerify}
            />
          </View>
        </ElevatedCard>
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
    justifyContent: 'center',
  },
  card: {
    padding: space.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  iconCenter: {
    marginBottom: space.lg,
  },
  cardTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: space.xs,
  },
  cardSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: space.xl,
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: space.md,
  },
  errorText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: space.md,
  },
  actionRow: {
    width: '100%',
  },
});
