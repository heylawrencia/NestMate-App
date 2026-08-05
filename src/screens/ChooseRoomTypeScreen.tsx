/**
 * ChooseRoomTypeScreen — Illustrated room capacity selection cards (Spec §7.3)
 *
 * Displays room types as illustrated capacity cards:
 * "2 in a room · GH₵3,200/yr · 6 beds free"
 */

import React from 'react';
import {
  Pressable,
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
import AsyncBoundary from '../components/AsyncBoundary';
import IconCircle from '../components/IconCircle';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { HostelsStackParamList, RootStackParamList } from '../navigation/types';
import { fetchHostelById } from '../services/hostelService';
import { colors, elevation, radius, space, type } from '../theme';
import { RoomType } from '../types/hostel';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HostelsStackParamList, 'ChooseRoomType'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ChooseRoomTypeScreen({ route, navigation }: Props) {
  const { hostelId } = route.params;

  const {
    data: hostel,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchHostelById(hostelId), [hostelId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Room Type</Text>
      </View>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton variant="card" height={100} />
            <Skeleton variant="card" height={100} />
          </View>
        ) : hostel ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.hostelName}>{hostel.name}</Text>
            <Text style={styles.subhead}>Choose your preferred room capacity for this academic year</Text>

            <View style={styles.cardsContainer}>
              {hostel.roomTypes.map((rt: RoomType) => (
                <Pressable
                  key={rt.id}
                  style={({ pressed }) => [
                    styles.capacityCard,
                    pressed && styles.cardPressed,
                    rt.bedsLeft <= 0 && styles.cardDisabled,
                  ]}
                  disabled={rt.bedsLeft <= 0}
                  onPress={() =>
                    navigation.navigate('PickRoom', {
                      hostelId: hostel.id,
                      roomTypeId: rt.id,
                    })
                  }
                >
                  <IconCircle size={48} backgroundColor={colors.primaryLight}>
                    <Ionicons name="people" size={24} color={colors.primary} />
                  </IconCircle>

                  <View style={styles.cardTextCol}>
                    <Text style={styles.capacityTitle}>{rt.label}</Text>
                    <Text style={styles.capacitySubtext}>
                      GH₵{rt.pricePerYear.toLocaleString()}/yr ·{' '}
                      <Text
                        style={{
                          color: rt.bedsLeft > 0 ? colors.primary : colors.inkMuted,
                          fontWeight: '600',
                        }}
                      >
                        {rt.bedsLeft > 0 ? `${rt.bedsLeft} beds free` : 'Fully booked'}
                      </Text>
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color={colors.inkMuted} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : null}
      </AsyncBoundary>
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
  skeletonContainer: {
    padding: space.lg,
    gap: space.md,
  },
  scrollContent: {
    padding: space.lg,
  },
  hostelName: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '700',
    marginBottom: 4,
  },
  subhead: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: space.xl,
  },
  cardsContainer: {
    gap: space.md,
  },
  capacityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    ...elevation.card,
  },
  cardPressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceTint,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardTextCol: {
    flex: 1,
    marginLeft: space.md,
    marginRight: space.sm,
  },
  capacityTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '600',
  },
  capacitySubtext: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 4,
  },
});
