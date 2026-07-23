import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import ScreenHeader from '../components/ScreenHeader';
import IconCircle from '../components/IconCircle';
import Badge from '../components/Badge';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  InviteCode,
  RedeemedHold,
  RoomSuggestion,
  fetchMyHousing,
  fetchRoomSuggestions,
  generateInviteCode,
  redeemInviteCode,
} from '../services/inviteService';

type Props = NativeStackScreenProps<RootStackParamList, 'Invites'>;

function formatExpiry(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function InvitesScreen({ navigation }: Props) {
  const { data: housing, loading: housingLoading, error: housingError, reload: reloadHousing } =
    useAsyncData(fetchMyHousing, []);

  const roomId = housing?.hasRoom ? housing.roomId : undefined;
  const { data: suggestions, loading: suggestionsLoading } = useAsyncData(
    () => (roomId ? fetchRoomSuggestions(roomId) : Promise.resolve<RoomSuggestion[]>([])),
    [roomId],
  );

  const [generating, setGenerating] = useState(false);
  const [invite, setInvite] = useState<InviteCode | null>(null);

  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | undefined>();
  const [redeemedHold, setRedeemedHold] = useState<RedeemedHold | null>(null);

  async function handleGenerate() {
    if (!roomId) return;
    setGenerating(true);
    const result = await generateInviteCode(roomId);
    setInvite(result);
    setGenerating(false);
  }

  async function handleRedeem() {
    if (!code.trim() || redeeming) return;
    setRedeeming(true);
    setRedeemError(undefined);
    const result = await redeemInviteCode(code);
    setRedeeming(false);
    if (result.success && result.hold) {
      setRedeemedHold(result.hold);
    } else {
      setRedeemError(result.errorMessage);
    }
  }

  function renderSuggestion(s: RoomSuggestion) {
    return (
      <View key={s.userId} style={styles.suggestionRow}>
        <IconCircle size={40} backgroundColor={colors.primaryLight}>
          <Text style={styles.suggestionInitial}>{s.fullName.charAt(0).toUpperCase()}</Text>
        </IconCircle>
        <View style={styles.suggestionText}>
          <Text style={styles.suggestionName}>{s.fullName}</Text>
          <Badge label={`${Math.round(s.score)}% fit`} tone="success" />
        </View>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => navigation.navigate('IndividualChat', { matchId: String(s.userId), name: s.fullName })}
          accessibilityLabel={`Message ${s.fullName}`}
          accessibilityRole="button"
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Invites" onBack={() => navigation.goBack()} />
        <AsyncBoundary loading={housingLoading} error={housingError} onRetry={reloadHousing}>
          {housing?.hasRoom && roomId ? (
            <>
              <ElevatedCard style={styles.card}>
                <Text style={styles.sectionTitle}>Invite a roommate</Text>
                <Text style={styles.sectionSubtitle}>
                  Generate a code for {housing.hostelName}, Room {housing.roomNumber} and share it with
                  whoever you want to room with. They can redeem it to reserve the next open bed.
                </Text>
                {invite ? (
                  <View style={styles.codeRow}>
                    <Ionicons name="key-outline" size={18} color={colors.success} />
                    <Text style={styles.codeText}>{invite.code}</Text>
                    <Text style={styles.codeHint}>expires {formatExpiry(invite.expiresAt)}</Text>
                  </View>
                ) : (
                  <AppButton title="Generate invite code" onPress={handleGenerate} loading={generating} />
                )}
              </ElevatedCard>

              <Text style={styles.sectionTitle}>Suggested roommates for this room</Text>
              <AsyncBoundary loading={suggestionsLoading} error={null}>
                {suggestions && suggestions.length > 0 ? (
                  <ElevatedCard style={styles.card}>
                    {suggestions.map(renderSuggestion)}
                  </ElevatedCard>
                ) : (
                  <Text style={styles.emptyText}>No suggestions right now - check back later.</Text>
                )}
              </AsyncBoundary>
            </>
          ) : redeemedHold ? (
            <ElevatedCard style={styles.card}>
              <View style={styles.centeredGroup}>
                <IconCircle size={72} backgroundColor="#FCEEDC" style={styles.iconCircle}>
                  <Ionicons name="checkmark-circle-outline" size={32} color="#B8722A" />
                </IconCircle>
                <Text style={styles.title}>Bed reserved!</Text>
                <Text style={styles.sectionSubtitle}>
                  Pay GHS {redeemedHold.amount.toLocaleString()} at the {redeemedHold.hostelName} office
                  (room {redeemedHold.roomLabel}) to get your access code before the hold expires.
                </Text>
              </View>
            </ElevatedCard>
          ) : (
            <ElevatedCard style={styles.card}>
              <Text style={styles.sectionTitle}>Have an invite code?</Text>
              <Text style={styles.sectionSubtitle}>
                Enter the code a roommate shared with you to reserve a bed in their room.
              </Text>
              <AppTextInput
                label="Invite code"
                placeholder="NEST-203-AB"
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                autoCorrect={false}
                error={redeemError}
              />
              <AppButton title="Redeem code" onPress={handleRedeem} loading={redeeming} />
            </ElevatedCard>
          )}
        </AsyncBoundary>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#E3F5EE',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  codeText: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.success,
    letterSpacing: 2,
  },
  codeHint: {
    fontSize: typography.caption,
    color: colors.success,
    flex: 1,
    textAlign: 'right',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  suggestionInitial: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  suggestionText: {
    flex: 1,
    gap: 4,
  },
  suggestionName: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  emptyText: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  centeredGroup: {
    alignItems: 'center',
  },
  iconCircle: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
