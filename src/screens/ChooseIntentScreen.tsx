/**
 * ChooseIntentScreen — Intent selection screen after email verification (Spec §2.2 & §5.2)
 *
 * Offers two primary intents: "Find a room" (direct to Home with no profile setup)
 * and "Find roommates" / "Do both" (proceeds to Essentials setup).
 */

import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../components/AppButton';
import { RootStackParamList } from '../navigation/types';
import { updateProfile } from '../services/profileService';
import { colors, elevation, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseIntent'>;

export default function ChooseIntentScreen({ navigation }: Props) {
  const [selectedIntent, setSelectedIntent] = useState<'ROOM' | 'ROOMMATES' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async (overrideIntent?: 'BOTH') => {
    const intentToSave = overrideIntent || (selectedIntent === 'ROOM' ? 'SEEKING_ROOM' : 'SEEKING_ROOMMATE');

    setLoading(true);
    try {
      await updateProfile({ seekingType: intentToSave === 'BOTH' ? 'SEEKING_ROOM' : intentToSave });
    } catch (e) {
      console.warn('Failed to save intent preference:', e);
    } finally {
      setLoading(false);
    }

    if (selectedIntent === 'ROOM' && !overrideIntent) {
      // "Find a room" -> Direct to Home with NO profile setup
      navigation.reset({ index: 0, routes: [{ name: 'Home', params: { email: '' } }] });
    } else {
      // "Find roommates" or "Do both" -> Proceed to Essentials setup
      navigation.navigate('Essentials');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headingTitle}>What brings you to NestMate?</Text>
          <Text style={styles.headingSubhead}>
            Choose your main goal to customize your experience
          </Text>
        </View>

        {/* Intent Cards */}
        <View style={styles.cardsContainer}>
          {/* Option 1: Find a room */}
          <Pressable
            style={({ pressed }) => [
              styles.intentCard,
              selectedIntent === 'ROOM' && styles.intentCardSelected,
              pressed && styles.cardPressed,
            ]}
            onPress={() => setSelectedIntent('ROOM')}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="business"
                size={32}
                color={selectedIntent === 'ROOM' ? colors.primary : colors.inkMuted}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Find a room</Text>
              <Text style={styles.cardDescription}>
                Browse verified hostels near campus and book a bed.
              </Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedIntent === 'ROOM' && styles.radioOuterSelected,
              ]}
            >
              {selectedIntent === 'ROOM' && <View style={styles.radioInner} />}
            </View>
          </Pressable>

          {/* Option 2: Find roommates */}
          <Pressable
            style={({ pressed }) => [
              styles.intentCard,
              selectedIntent === 'ROOMMATES' && styles.intentCardSelected,
              pressed && styles.cardPressed,
            ]}
            onPress={() => setSelectedIntent('ROOMMATES')}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="people"
                size={32}
                color={selectedIntent === 'ROOMMATES' ? colors.primary : colors.inkMuted}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Find roommates</Text>
              <Text style={styles.cardDescription}>
                Match with students who live the way you do.
              </Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedIntent === 'ROOMMATES' && styles.radioOuterSelected,
              ]}
            >
              {selectedIntent === 'ROOMMATES' && <View style={styles.radioInner} />}
            </View>
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <AppButton
            title="Continue"
            variant="primary"
            size="lg"
            disabled={!selectedIntent}
            loading={loading}
            onPress={() => handleContinue()}
          />

          <TouchableOpacity
            style={styles.tertiaryLink}
            onPress={() => handleContinue('BOTH')}
          >
            <Text style={styles.tertiaryText}>I want to do both →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.xxl,
    paddingBottom: space.xl,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: space.xl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  headingTitle: {
    fontFamily: type.display.fontFamily,
    fontSize: type.display.fontSize,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: space.xs,
  },
  headingSubhead: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: space.md,
    marginBottom: space.xl,
  },
  intentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...elevation.card,
  },
  intentCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceTint,
  },
  cardPressed: {
    opacity: 0.9,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.xs,
  },
  cardDescription: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.sm,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  actionContainer: {
    gap: space.md,
    alignItems: 'center',
  },
  tertiaryLink: {
    paddingVertical: space.sm,
  },
  tertiaryText: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
});
