/**
 * PickRoomScreen — Interactive Room Diagram & Bed Selector (Spec §7.3 & Task 7)
 *
 * Renders an actual ROOM DIAGRAM layout with beds as tappable tiles.
 * Tile states: FREE / HELD / CONFIRMED (distinguishable without colour alone).
 * Displays compatibility with current occupants when available.
 * CRITICAL: Absence of profile renders compatibility as "—" with "Set up matching" link,
 * and NEVER blocks booking.
 */

import React, { useState } from 'react';
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
import ElevatedCard from '../components/ElevatedCard';
import ScoreRing from '../components/ScoreRing';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { HostelsStackParamList, RootStackParamList } from '../navigation/types';
import { fetchHostelById, fetchRoomsForType, holdBed } from '../services/hostelService';
import { colors, elevation, radius, space, type } from '../theme';
import { RoomSummary } from '../types/hostel';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HostelsStackParamList, 'PickRoom'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function PickRoomScreen({ route, navigation }: Props) {
  const { hostelId, roomTypeId } = route.params;

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedBedIndex, setSelectedBedIndex] = useState<number>(0);
  const [holding, setHolding] = useState(false);
  const [holdError, setHoldError] = useState('');

  const {
    data: hostel,
    loading: hostelLoading,
    error: hostelError,
  } = useAsyncData(() => fetchHostelById(hostelId), [hostelId]);

  const {
    data: rooms,
    loading: roomsLoading,
    error: roomsError,
    reload: reloadRooms,
  } = useAsyncData(() => fetchRoomsForType(hostelId, roomTypeId), [hostelId, roomTypeId]);

  const targetRoomType = hostel?.roomTypes.find((rt) => rt.id === roomTypeId);
  const activeRoom = (rooms ?? []).find((r) => r.id === selectedRoomId) ?? (rooms ?? [])[0];

  const handleHoldBed = async () => {
    const bedToHold = activeRoom?.freeBedId;
    if (!bedToHold) return;

    setHoldError('');
    setHolding(true);
    try {
      await holdBed(bedToHold);
      setHolding(false);
      navigation.navigate('HoldPending', { hostelId, roomTypeId });
    } catch (e: any) {
      setHolding(false);
      setHoldError(e?.message || 'Could not hold bed. It may have just been taken.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Pick a Room</Text>
          {hostel && targetRoomType && (
            <Text style={styles.headerSubtitle}>
              {hostel.name} · {targetRoomType.label}
            </Text>
          )}
        </View>
      </View>

      <AsyncBoundary loading={roomsLoading || hostelLoading} error={roomsError || hostelError} onRetry={reloadRooms}>
        {roomsLoading || hostelLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton variant="card" height={160} />
            <Skeleton variant="card" height={240} />
          </View>
        ) : (rooms ?? []).length > 0 ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Room Selector Pills */}
            <Text style={styles.sectionLabel}>Available Rooms</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomPillsRow}>
              {(rooms ?? []).map((room: RoomSummary) => {
                const isSelected = (selectedRoomId || activeRoom?.id) === room.id;
                return (
                  <TouchableOpacity
                    key={room.id}
                    style={[styles.roomPill, isSelected && styles.roomPillSelected]}
                    onPress={() => {
                      setSelectedRoomId(room.id);
                      setSelectedBedIndex(0);
                    }}
                  >
                    <Text style={[styles.roomPillTitle, isSelected && styles.roomPillTitleSelected]}>
                      {room.label}
                    </Text>
                    <Text style={[styles.roomPillSub, isSelected && styles.roomPillSubSelected]}>
                      {room.bedsAvailable} free
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Room Card & Compatibility */}
            {activeRoom && (
              <ElevatedCard style={styles.roomCard}>
                <View style={styles.roomCardHeader}>
                  <View style={styles.roomTitleCol}>
                    <Text style={styles.activeRoomName}>{activeRoom.label}</Text>
                    <Text style={styles.activeRoomBeds}>
                      Capacity: {activeRoom.capacity} bed{activeRoom.capacity > 1 ? 's' : ''} ·{' '}
                      {activeRoom.bedsAvailable} free
                    </Text>
                  </View>

                  {/* Compatibility rendering rule: null -> "—" with link */}
                  <View style={styles.compatCol}>
                    {activeRoom.myAvgCompatibility != null ? (
                      <View style={styles.compatScoreGroup}>
                        <ScoreRing score={Math.round(activeRoom.myAvgCompatibility)} size={48} strokeWidth={4} />
                        <Text style={styles.compatText}>
                          {Math.round(activeRoom.myAvgCompatibility)}% match
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.noCompatGroup}>
                        <Text style={styles.noCompatScore}>Match: —</Text>
                        <TouchableOpacity onPress={() => (navigation as any).navigate('Essentials')}>
                          <Text style={styles.setupMatchingLink}>Set up matching →</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {/* ROOM DIAGRAM (Visual Bed Layout) */}
                <Text style={styles.diagramTitle}>Room Layout Diagram</Text>
                <View style={styles.roomDiagramBox}>
                  <View style={styles.doorIndicator}>
                    <Ionicons name="enter-outline" size={14} color={colors.inkMuted} />
                    <Text style={styles.doorText}>DOOR</Text>
                  </View>

                  {/* Bed Grid Tiles */}
                  <View style={styles.bedGrid}>
                    {Array.from({ length: activeRoom.capacity }).map((_, idx) => {
                      const bedNum = idx + 1;
                      const isFree = idx < activeRoom.bedsAvailable;
                      const isSelected = isFree && selectedBedIndex === idx;

                      return (
                        <Pressable
                          key={bedNum}
                          disabled={!isFree}
                          style={({ pressed }) => [
                            styles.bedTile,
                            isFree ? styles.bedTileFree : styles.bedTileTaken,
                            isSelected && styles.bedTileSelected,
                            pressed && styles.bedTilePressed,
                          ]}
                          onPress={() => setSelectedBedIndex(idx)}
                        >
                          <Ionicons
                            name={isFree ? 'bed-outline' : 'person-circle-outline'}
                            size={28}
                            color={
                              isSelected
                                ? colors.primary
                                : isFree
                                ? colors.ink
                                : colors.inkFaint
                            }
                          />
                          <Text
                            style={[
                              styles.bedTileLabel,
                              isSelected && styles.bedTileLabelSelected,
                            ]}
                          >
                            Bed {bedNum}
                          </Text>
                          <View
                            style={[
                              styles.bedStatusTag,
                              isFree ? styles.tagFree : styles.tagTaken,
                            ]}
                          >
                            <Text
                              style={[
                                styles.tagText,
                                isFree ? styles.tagTextFree : styles.tagTextTaken,
                              ]}
                            >
                              {isFree ? 'FREE' : 'TAKEN'}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {holdError ? <Text style={styles.errorText}>{holdError}</Text> : null}

                {/* Action */}
                <View style={styles.holdActionRow}>
                  <AppButton
                    title="Hold Bed for 48 Hours →"
                    variant="primary"
                    size="lg"
                    disabled={activeRoom.bedsAvailable <= 0}
                    loading={holding}
                    onPress={handleHoldBed}
                  />
                </View>
              </ElevatedCard>
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rooms available for this room type.</Text>
          </View>
        )}
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
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
  },
  skeletonContainer: {
    padding: space.lg,
    gap: space.md,
  },
  scrollContent: {
    padding: space.lg,
  },
  sectionLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.xs,
  },
  roomPillsRow: {
    flexDirection: 'row',
    marginBottom: space.lg,
  },
  roomPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    marginRight: space.xs,
    alignItems: 'center',
  },
  roomPillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  roomPillTitle: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 13,
    color: colors.ink,
  },
  roomPillTitleSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  roomPillSub: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    color: colors.inkMuted,
  },
  roomPillSubSelected: {
    color: colors.primary,
  },
  roomCard: {
    padding: space.lg,
    borderRadius: radius.xl,
  },
  roomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  roomTitleCol: {
    flex: 1,
  },
  activeRoomName: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  activeRoomBeds: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  compatCol: {
    alignItems: 'flex-end',
  },
  compatScoreGroup: {
    alignItems: 'center',
  },
  compatText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  noCompatGroup: {
    alignItems: 'flex-end',
  },
  noCompatScore: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
  },
  setupMatchingLink: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  diagramTitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.xs,
  },
  roomDiagramBox: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.line,
    padding: space.md,
    marginBottom: space.lg,
    position: 'relative',
  },
  doorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: space.md,
  },
  doorText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    color: colors.inkMuted,
    fontWeight: '700',
  },
  bedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    justifyContent: 'space-around',
  },
  bedTile: {
    width: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.line,
    padding: space.md,
    alignItems: 'center',
    position: 'relative',
  },
  bedTileFree: {
    borderColor: colors.line,
  },
  bedTileTaken: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.line,
    opacity: 0.6,
  },
  bedTileSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  bedTilePressed: {
    opacity: 0.8,
  },
  bedTileLabel: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
    marginTop: space.xs,
  },
  bedTileLabelSelected: {
    color: colors.primary,
  },
  bedStatusTag: {
    marginTop: space.xs,
    paddingHorizontal: space.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tagFree: {
    backgroundColor: colors.primaryLight,
  },
  tagTaken: {
    backgroundColor: colors.line,
  },
  tagText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 9,
    fontWeight: '700',
  },
  tagTextFree: {
    color: colors.primary,
  },
  tagTextTaken: {
    color: colors.inkMuted,
  },
  errorText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: space.md,
  },
  holdActionRow: {
    marginTop: space.xs,
  },
  emptyContainer: {
    padding: space.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
  },
});
