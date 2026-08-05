/**
 * HostelCard — 16:9 photo, name, area, "from GH₵x / year", beds pill (Spec §3.6)
 *
 * Usage:
 * <HostelCard name="Evandy Hostel" area="KNUST Campus" minPrice={3200} photoUrl="https://..." bedsAvailable={4} onPress={handlePress} />
 */

import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, elevation, radius, space, type } from '../theme';

export interface HostelCardProps {
  name: string;
  area: string;
  minPrice: number;
  photoUrl?: string;
  bedsAvailable?: number;
  rating?: number;
  onPress: () => void;
}

export default function HostelCard({
  name,
  area,
  minPrice,
  photoUrl,
  bedsAvailable,
  rating,
  onPress,
}: HostelCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="business-outline" size={40} color={colors.inkFaint} />
          </View>
        )}

        {bedsAvailable !== undefined ? (
          <View style={styles.bedsPill}>
            <Text style={styles.bedsText}>
              {bedsAvailable > 0 ? `${bedsAvailable} beds free` : 'Fully booked'}
            </Text>
          </View>
        ) : null}

        {rating ? (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.area} numberOfLines={1}>
          {area}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            from GH₵{minPrice.toLocaleString()} <Text style={styles.periodText}>/ year</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: space.md,
    ...elevation.card,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.line,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  bedsPill: {
    position: 'absolute',
    top: space.md,
    left: space.md,
    backgroundColor: 'rgba(20, 26, 23, 0.75)',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
  },
  bedsText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  ratingBadge: {
    position: 'absolute',
    top: space.md,
    right: space.md,
    backgroundColor: colors.surface,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.ink,
    fontWeight: '600',
  },
  content: {
    padding: space.lg,
  },
  name: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.xs,
  },
  area: {
    fontFamily: type.caption.fontFamily,
    fontSize: type.caption.fontSize,
    color: colors.inkMuted,
    marginBottom: space.sm,
  },
  priceRow: {
    marginTop: space.xs,
  },
  priceText: {
    fontFamily: type.price.fontFamily,
    fontSize: type.price.fontSize,
    color: colors.primary,
    fontWeight: '700',
  },
  periodText: {
    fontFamily: type.body.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '400',
  },
});
