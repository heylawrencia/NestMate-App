/**
 * ProfileCompletenessCard — Dismissible Home card for profile completeness (Spec §5.7)
 *
 * Renders a ScoreRing and the single highest-value missing profile item with its reason.
 * Reappears after 7 days if dismissed and still incomplete. Hidden at 100%.
 */

import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import ScoreRing from './ScoreRing';
import { fetchProfileCompleteness, ProfileCompleteness } from '../services/profileService';
import { colors, elevation, radius, space, type } from '../theme';

interface Props {
  onActionPress?: () => void;
}

const DISMISS_KEY = 'nestmate_completeness_dismissed_at';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const isWeb = Platform.OS === 'web';

async function getDismissedAt(): Promise<string | null> {
  if (isWeb) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(DISMISS_KEY) : null;
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(DISMISS_KEY);
  } catch {
    return null;
  }
}

async function setDismissedAt(val: string): Promise<void> {
  if (isWeb) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(DISMISS_KEY, val);
    } catch {}
    return;
  }
  try {
    await SecureStore.setItemAsync(DISMISS_KEY, val);
  } catch {}
}

export default function ProfileCompletenessCard({ onActionPress }: Props) {
  const [data, setData] = useState<ProfileCompleteness | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    async function checkState() {
      try {
        const dismissedAtStr = await getDismissedAt();
        if (dismissedAtStr) {
          const dismissedAt = parseInt(dismissedAtStr, 10);
          if (Date.now() - dismissedAt < SEVEN_DAYS_MS) {
            setDismissed(true);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to read completeness card dismissal status:', e);
      }

      const comp = await fetchProfileCompleteness();
      setData(comp);
    }

    checkState();
  }, []);

  const handleDismiss = async () => {
    setDismissed(true);
    await setDismissedAt(String(Date.now()));
  };

  // Hidden at 100% complete or if dismissed within 7 days
  if (dismissed || !data || data.score >= 100 || !data.missingItem) {
    return null;
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleDismiss}
        accessibilityLabel="Dismiss card"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={18} color={colors.inkMuted} />
      </TouchableOpacity>

      <View style={styles.contentRow}>
        <ScoreRing score={data.score} size={54} strokeWidth={5} />

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>Profile {data.score}% Complete</Text>
          <Text style={styles.actionText}>{data.missingItem}</Text>
          {data.reason ? <Text style={styles.reasonText}>{data.reason}</Text> : null}
        </View>

        {onActionPress && (
          <TouchableOpacity style={styles.ctaButton} onPress={onActionPress}>
            <Text style={styles.ctaText}>Add →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    ...elevation.card,
    marginHorizontal: space.lg,
    marginVertical: space.sm,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: space.xs,
    right: space.xs,
    padding: space.xs,
    zIndex: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionText: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
    marginTop: 2,
  },
  reasonText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
  },
  ctaText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
});
