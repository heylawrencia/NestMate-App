/**
 * HostelDetailScreen — Full-bleed gallery & hostel details screen (Spec §7.3)
 *
 * Opens on a full-bleed swipeable gallery from photoUrls with a page indicator (1 of N).
 * Shows hostel name, location, rating badge, amenity chips, and room types with capacity and prices.
 */

import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
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
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { HostelsStackParamList, RootStackParamList } from '../navigation/types';
import { fetchHostelById } from '../services/hostelService';
import { colors, elevation, radius, space, type } from '../theme';
import { RoomType } from '../types/hostel';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HostelsStackParamList, 'HostelDetail'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AMENITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Wifi: 'wifi-outline',
  Security: 'shield-checkmark-outline',
  Generator: 'flash-outline',
  Water: 'water-outline',
  Laundry: 'shirt-outline',
  Gym: 'fitness-outline',
  StudyRoom: 'book-outline',
  Parking: 'car-outline',
};

export default function HostelDetailScreen({ route, navigation }: Props) {
  const { hostelId } = route.params;
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const {
    data: hostel,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchHostelById(hostelId), [hostelId]);

  const photos = hostel?.imageUrls && hostel.imageUrls.length > 0
    ? hostel.imageUrls
    : hostel?.imageUrl
    ? [hostel.imageUrl]
    : [];

  return (
    <View style={styles.container}>
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {loading ? (
          <SafeAreaView style={styles.loadingContainer}>
            <Skeleton variant="card" height={280} />
            <View style={{ padding: space.lg, gap: space.md }}>
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="40%" height={18} />
              <Skeleton variant="card" height={100} />
            </View>
          </SafeAreaView>
        ) : hostel ? (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Full-Bleed Swipeable Gallery */}
              <View style={styles.galleryWrapper}>
                {photos.length > 0 ? (
                  <FlatList
                    data={photos}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, idx) => String(idx)}
                    onScroll={(e) => {
                      const offset = e.nativeEvent.contentOffset.x;
                      const index = Math.round(offset / SCREEN_WIDTH);
                      setActivePhotoIndex(index);
                    }}
                    renderItem={({ item }) => (
                      <Image source={{ uri: item }} style={styles.galleryPhoto} resizeMode="cover" />
                    )}
                  />
                ) : (
                  <View style={styles.placeholderGallery}>
                    <Ionicons name="business-outline" size={64} color={colors.inkFaint} />
                  </View>
                )}

                {/* Back Button Overlay */}
                <SafeAreaView style={styles.backButtonOverlay}>
                  <TouchableOpacity
                    style={styles.circleBackBtn}
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                  >
                    <Ionicons name="chevron-back" size={24} color={colors.ink} />
                  </TouchableOpacity>
                </SafeAreaView>

                {/* Gallery Page Indicator */}
                {photos.length > 1 && (
                  <View style={styles.pageIndicatorPill}>
                    <Text style={styles.pageIndicatorText}>
                      {activePhotoIndex + 1} of {photos.length}
                    </Text>
                  </View>
                )}
              </View>

              {/* Details Body */}
              <View style={styles.bodyContainer}>
                {/* Header Info */}
                <View style={styles.titleRow}>
                  <View style={styles.titleTextCol}>
                    <Text style={styles.hostelName}>{hostel.name}</Text>
                    <Text style={styles.hostelLocation}>
                      <Ionicons name="location-outline" size={14} color={colors.primary} /> {hostel.location}
                    </Text>
                  </View>

                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingText}>{hostel.rating.toFixed(1)}</Text>
                  </View>
                </View>

                {/* Price Subtitle */}
                <Text style={styles.startingPriceText}>
                  from GH₵{hostel.fromPricePerYear.toLocaleString()} <Text style={styles.periodText}>/ year</Text>
                </Text>

                {/* Amenities Chips */}
                {hostel.amenities && hostel.amenities.length > 0 && (
                  <View style={styles.amenitiesSection}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesGrid}>
                      {hostel.amenities.map((amenity) => (
                        <View key={amenity} style={styles.amenityChip}>
                          <Ionicons
                            name={AMENITY_ICONS[amenity] ?? 'checkmark-circle-outline'}
                            size={16}
                            color={colors.primary}
                          />
                          <Text style={styles.amenityText}>{amenity}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Room Types Section */}
                <View style={styles.roomTypesSection}>
                  <Text style={styles.sectionTitle}>Available Room Types</Text>

                  {hostel.roomTypes && hostel.roomTypes.length > 0 ? (
                    hostel.roomTypes.map((rt: RoomType) => (
                      <ElevatedCard key={rt.id} style={styles.roomTypeCard}>
                        <View style={styles.rtHeaderRow}>
                          <IconCircle size={40} backgroundColor={colors.primaryLight}>
                            <Ionicons name="bed-outline" size={20} color={colors.primary} />
                          </IconCircle>

                          <View style={styles.rtTextCol}>
                            <Text style={styles.rtLabel}>{rt.label}</Text>
                            <Text style={styles.rtPrice}>
                              GH₵{rt.pricePerYear.toLocaleString()} <Text style={styles.periodText}>/ year</Text>
                            </Text>
                          </View>
                        </View>

                        <View style={styles.rtFooterRow}>
                          <Text style={styles.bedsLeftText}>
                            {rt.bedsLeft > 0 ? `${rt.bedsLeft} beds free` : 'Fully booked'}
                          </Text>

                          <AppButton
                            title="Choose Room →"
                            variant="primary"
                            size="md"
                            disabled={rt.bedsLeft <= 0}
                            onPress={() =>
                              navigation.navigate('PickRoom', {
                                hostelId: hostel.id,
                                roomTypeId: rt.id,
                              })
                            }
                          />
                        </View>
                      </ElevatedCard>
                    ))
                  ) : (
                    <Text style={styles.noRoomsText}>No room types listed for this hostel.</Text>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        ) : null}
      </AsyncBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: space.xxl,
  },
  galleryWrapper: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: colors.line,
    position: 'relative',
  },
  galleryPhoto: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  placeholderGallery: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: space.md,
    left: space.md,
    zIndex: 10,
  },
  circleBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },
  pageIndicatorPill: {
    position: 'absolute',
    bottom: space.md,
    right: space.md,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
  },
  pageIndicatorText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  bodyContainer: {
    padding: space.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleTextCol: {
    flex: 1,
    marginRight: space.md,
  },
  hostelName: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '700',
    marginBottom: 4,
  },
  hostelLocation: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
  },
  ratingBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ratingText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 12,
    color: colors.ink,
    fontWeight: '700',
  },
  startingPriceText: {
    fontFamily: type.price.fontFamily,
    fontSize: 22,
    color: colors.primary,
    fontWeight: '700',
    marginTop: space.md,
  },
  periodText: {
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
    fontWeight: '400',
  },
  amenitiesSection: {
    marginTop: space.xl,
  },
  sectionTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.sm,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    gap: space.xs,
  },
  amenityText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.ink,
  },
  roomTypesSection: {
    marginTop: space.xl,
  },
  roomTypeCard: {
    padding: space.lg,
    borderRadius: radius.xl,
    marginBottom: space.md,
  },
  rtHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.md,
  },
  rtTextCol: {
    flex: 1,
  },
  rtLabel: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '600',
  },
  rtPrice: {
    fontFamily: type.price.fontFamily,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  rtFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.md,
  },
  bedsLeftText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
  noRoomsText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
});
