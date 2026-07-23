import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHostelById, getPriceRange, getRoomTypeSummary } from '../services/hostelService';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'HostelDetail'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HostelDetailScreen({ navigation, route }: Props) {
  const { hostelId } = route.params;
  const { data: hostel, loading, error, reload } = useAsyncData(
    () => fetchHostelById(hostelId),
    [hostelId],
  );
  const { openDrawer } = useDrawer();

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>{hostel?.name ?? 'Hostel'}</Text>
      </GradientHeader>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {hostel ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.imagePlaceholder}>
              {hostel.imageUrl ? (
                <Image source={{ uri: hostel.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <Ionicons name="image-outline" size={40} color={colors.textMuted} />
              )}
              {hostel.photoCount ? (
                <View style={styles.photoCountBadge}>
                  <Text style={styles.photoCountText}>1/{hostel.photoCount}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.imageDots}>
              <View style={[styles.imageDot, styles.imageDotActive]} />
              <View style={styles.imageDot} />
            </View>

            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{hostel.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#F5A623" />
                  <Text style={styles.ratingText}>{hostel.rating}</Text>
                </View>
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={styles.locationText}>
                  {hostel.location} · {hostel.distanceNote}
                </Text>
              </View>

              <View style={styles.amenitiesRow}>
                {hostel.amenities.map((amenity) => (
                  <View key={amenity} style={styles.amenityPill}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>

              <ElevatedCard style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Price range</Text>
                  <Text style={styles.summaryValue}>
                    GHS {getPriceRange(hostel).min.toLocaleString()} – {getPriceRange(hostel).max.toLocaleString()}
                    /yr
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text style={styles.summaryLabel}>Room types</Text>
                  <Text style={styles.summaryValue}>{getRoomTypeSummary(hostel)} in a room</Text>
                </View>
              </ElevatedCard>

              <AppButton
                title="Choose a room"
                onPress={() => navigation.navigate('ChooseRoomType', { hostelId })}
              />

              <TouchableOpacity
                style={styles.secondaryLink}
                onPress={() => navigation.navigate('AccessCode', { hostelId })}
              >
                <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
                <Text style={styles.secondaryLinkText}>Already paid? Enter your access code</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.notFoundText}>Hostel not found.</Text>
        )}
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
  },
  headerTitle: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 10,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  photoCountText: {
    fontSize: typography.caption,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  imageDot: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  imageDotActive: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: typography.body,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  locationText: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  amenityPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  amenityText: {
    fontSize: typography.caption,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
  summaryCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryRowLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  secondaryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  secondaryLinkText: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  notFoundText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
