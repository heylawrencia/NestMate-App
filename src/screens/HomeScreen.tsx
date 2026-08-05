/**
 * HomeScreen — App's centre of gravity (Spec §6 in full)
 *
 * Section order (Spec §6.1):
 * 1. CollapsingHeader — greeting, avatar, notification bell with badge (bell fixed in place)
 * 2. Housing status card (has room / active hold / find hostel)
 * 3. Profile completeness card (from F4, conditional)
 * 4. "Hostels near you" rail (6 cards, 78% viewport width, Explore more →)
 * 5. "Your top matches" rail (match cards or setup prompt if no profile)
 * 6. Recent activity (3 most recent notifications)
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import HostelCard from '../components/HostelCard';
import IconCircle from '../components/IconCircle';
import ProfileCompletenessCard from '../components/ProfileCompletenessCard';
import ScoreRing from '../components/ScoreRing';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from '../context/DrawerContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { resolveMediaUrl } from '../services/apiClient';
import { fetchHostels, fetchMyHold } from '../services/hostelService';
import { fetchMatches, isPaywallError } from '../services/matchService';
import { fetchNotifications } from '../services/notificationService';
import { fetchProfile, fetchProfileCompleteness } from '../services/profileService';
import { fetchHousingStatus } from '../services/userService';
import { colors, elevation, radius, space, type } from '../theme';
import { Hostel } from '../types/hostel';
import { Match } from '../types/match';
import { NotificationItem } from '../types/notification';
import { UserProfile } from '../types/profile';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.78;

function getFirstName(fullName?: string): string {
  if (fullName && fullName.trim()) {
    return fullName.trim().split(' ')[0];
  }
  return 'there';
}

function formatHoldCountdown(expiresAtIso: string): string {
  const expiresAt = new Date(expiresAtIso).getTime();
  const remainingMs = expiresAt - Date.now();
  if (remainingMs <= 0) return 'Expired';
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m remaining`;
}

export default function HomeScreen({ navigation }: Props) {
  const { email } = useAuth();
  const { openDrawer } = useDrawer();

  // Profile and greeting state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userFirstName, setUserFirstName] = useState<string>('there');

  // Load profile on focus to ensure username edit reflects immediately
  useFocusEffect(
    useCallback(() => {
      fetchProfile().then((p) => {
        setProfile(p);
        setUserFirstName(getFirstName(p.fullName));
      });
    }, [])
  );

  // Housing status & hold
  const {
    data: housingStatus,
    loading: housingLoading,
    reload: reloadHousing,
  } = useAsyncData(fetchHousingStatus, []);
  const {
    data: activeHold,
    loading: holdLoading,
    reload: reloadHold,
  } = useAsyncData(fetchMyHold, []);

  // Completeness score
  const { data: completeness } = useAsyncData(fetchProfileCompleteness, []);

  // Hostels near you
  const {
    data: hostels,
    loading: hostelsLoading,
    error: hostelsError,
    reload: reloadHostels,
  } = useAsyncData(() => fetchHostels(), []);

  // Top matches
  const {
    data: topMatches,
    loading: matchesLoading,
    rawError: matchesRawError,
    reload: reloadMatches,
  } = useAsyncData(() => fetchMatches(5), []);
  const matchesPaywalled = isPaywallError(matchesRawError);

  // Notifications
  const { data: notifications, loading: notifsLoading, reload: reloadNotifs } = useAsyncData(
    fetchNotifications,
    []
  );
  const unreadNotifsCount = notifications?.filter((n) => !n.read).length ?? 0;

  // Refresh handler
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      reloadHousing(),
      reloadHold(),
      reloadHostels(),
      reloadMatches(),
      reloadNotifs(),
      fetchProfile().then((p) => {
        setProfile(p);
        setUserFirstName(getFirstName(p.fullName));
      }),
    ]);
    setRefreshing(false);
  }, [reloadHousing, reloadHold, reloadHostels, reloadMatches, reloadNotifs]);

  // Scroll animation for collapsing header
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header height interpolates 168 -> 56 across scrollY 0 -> 120
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [168, 56],
    extrapolate: 'clamp',
  });

  // Avatar & location fade over 0 -> 80
  const fadeOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Greeting font size transition
  const greetingFontSize = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [24, 18],
    extrapolate: 'clamp',
  });

  // Header elevation applies once collapsed
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 100, 120],
    outputRange: [0, 0.2, 0.4],
    extrapolate: 'clamp',
  });

  const top6Hostels = (hostels ?? []).slice(0, 6);
  const recent3Notifs = (notifications ?? []).slice(0, 3);
  const hasNoLifestyleProfile = !completeness || completeness.score < 20;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. COLLAPSING HEADER */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <Animated.View style={[styles.headerShadow, { opacity: headerShadowOpacity }]} />

        <View style={styles.headerInner}>
          {/* Menu Button / Avatar */}
          <TouchableOpacity
            onPress={openDrawer}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <Animated.View style={{ opacity: fadeOpacity }}>
              {profile?.avatarUri ? (
                <Image
                  source={{ uri: resolveMediaUrl(profile.avatarUri) }}
                  style={styles.avatarImage}
                />
              ) : (
                <IconCircle size={44} backgroundColor={colors.primaryLight}>
                  <Text style={styles.avatarInitial}>
                    {userFirstName.charAt(0).toUpperCase()}
                  </Text>
                </IconCircle>
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Greeting & Subtitle Group */}
          <View style={styles.headerTextGroup}>
            <Animated.Text
              style={[styles.greetingText, { fontSize: greetingFontSize }]}
              numberOfLines={1}
            >
              {userFirstName === 'there' ? 'Hi there 👋' : `Hi, ${userFirstName} 👋`}
            </Animated.Text>

            <Animated.View style={{ opacity: fadeOpacity }}>
              <Text style={styles.locationSubtext}>
                {profile?.city ?? 'Kumasi'} · KNUST Campus
              </Text>
            </Animated.View>
          </View>

          {/* Fixed Position Notification Bell Button */}
          <TouchableOpacity
            style={styles.fixedBellButton}
            onPress={() => (navigation as any).navigate('Notifications')}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.white} />
            {unreadNotifsCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* MAIN SCROLLABLE CONTENT */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 2. HOUSING STATUS CARD */}
        <View style={styles.sectionWrapper}>
          <ElevatedCard style={styles.housingCard}>
            {housingLoading || holdLoading ? (
              <Skeleton variant="card" height={100} />
            ) : housingStatus?.hasRoom ? (
              /* State A: Has a Room */
              <View style={styles.housingContentRow}>
                <IconCircle size={48} backgroundColor={colors.primaryLight}>
                  <Ionicons name="bed" size={24} color={colors.primary} />
                </IconCircle>
                <View style={styles.housingTextCol}>
                  <Text style={styles.housingStatusBadge}>ALLOCATED ROOM</Text>
                  <Text style={styles.housingTitle}>Room {housingStatus.roomNumber}</Text>
                  <Text style={styles.housingSubtitle}>{housingStatus.hostelName}</Text>
                </View>
              </View>
            ) : activeHold ? (
              /* State B: Active Hold */
              <View style={styles.housingContentRow}>
                <IconCircle size={48} backgroundColor={colors.surfaceTint}>
                  <Ionicons name="time" size={24} color={colors.accent} />
                </IconCircle>
                <View style={styles.housingTextCol}>
                  <Text style={styles.housingStatusBadgeHold}>ACTIVE BED HOLD</Text>
                  <Text style={styles.housingTitle}>{activeHold.hostelName}</Text>
                  <Text style={styles.housingSubtitle}>
                    {activeHold.roomLabel} · {formatHoldCountdown(activeHold.expiresAt)}
                  </Text>
                </View>
                <AppButton
                  title="Access code"
                  size="md"
                  variant="outline"
                  onPress={() =>
                    (navigation as any).navigate('AccessCode', { hostelId: '' })
                  }
                />
              </View>
            ) : (
              /* State C: Neither (No Room / Hold) */
              <View style={styles.housingPromptRow}>
                <Text style={styles.flagEmoji}>🇬🇭</Text>
                <View style={styles.housingTextCol}>
                  <Text style={styles.housingTitle}>Where will you live this year?</Text>
                  <Text style={styles.housingSubtitle}>
                    Explore verified hostels near KNUST with student matching
                  </Text>
                </View>
                <AppButton
                  title="Find a hostel"
                  size="md"
                  variant="primary"
                  onPress={() => (navigation as any).navigate('HostelsStack')}
                />
              </View>
            )}
          </ElevatedCard>
        </View>

        {/* 3. PROFILE COMPLETENESS CARD (from F4) */}
        <ProfileCompletenessCard
          onActionPress={() => navigation.navigate('Essentials')}
        />

        {/* 4. HOSTELS NEAR YOU RAIL */}
        <View style={styles.sectionWrapper}>
          <SectionHeader
            title="Hostels near you"
            actionLabel="Explore more →"
            onAction={() => (navigation as any).navigate('HostelsStack')}
          />

          <AsyncBoundary loading={hostelsLoading} error={hostelsError} onRetry={reloadHostels}>
            {hostelsLoading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.railScroll}>
                {[1, 2, 3].map((key) => (
                  <Skeleton
                    key={key}
                    variant="card"
                    width={CARD_WIDTH}
                    height={210}
                    style={styles.railSkeletonCard}
                  />
                ))}
              </ScrollView>
            ) : top6Hostels.length > 0 ? (
              <FlatList
                data={top6Hostels}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                snapToInterval={CARD_WIDTH + space.md}
                decelerationRate="fast"
                contentContainerStyle={styles.railContainer}
                renderItem={({ item }) => (
                  <View style={{ width: CARD_WIDTH, marginRight: space.md }}>
                    <HostelCard
                      name={item.name}
                      area={item.location}
                      minPrice={item.fromPricePerYear}
                      photoUrl={item.imageUrl}
                      bedsAvailable={item.bedsAvailable}
                      rating={item.rating}
                      onPress={() =>
                        (navigation as any).navigate('HostelDetail', { hostelId: item.id })
                      }
                    />
                  </View>
                )}
              />
            ) : null}
          </AsyncBoundary>
        </View>

        {/* 5. YOUR TOP MATCHES RAIL */}
        <View style={styles.sectionWrapper}>
          <SectionHeader
            title="Your top matches"
            actionLabel="See all →"
            onAction={() => navigation.navigate('Matches')}
          />

          {hasNoLifestyleProfile ? (
            /* No Lifestyle Profile Intent Card */
            <ElevatedCard style={styles.intentPromptCard}>
              <IconCircle size={44} backgroundColor={colors.primaryLight}>
                <Ionicons name="sparkles" size={22} color={colors.primary} />
              </IconCircle>
              <Text style={styles.intentTitle}>Unlock Roommate Matching</Text>
              <Text style={styles.intentSubtitle}>
                Set up your 2-screen lifestyle profile to see compatible students
              </Text>
              <View style={styles.intentButtonWrapper}>
                <AppButton
                  title="Set up lifestyle profile →"
                  variant="primary"
                  size="md"
                  onPress={() => navigation.navigate('Essentials')}
                />
              </View>
            </ElevatedCard>
          ) : matchesLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.railScroll}>
              {[1, 2, 3].map((key) => (
                <Skeleton
                  key={key}
                  variant="card"
                  width={150}
                  height={170}
                  style={styles.railSkeletonCard}
                />
              ))}
            </ScrollView>
          ) : matchesPaywalled ? (
            <ElevatedCard style={styles.paywallCard}>
              <Text style={styles.paywallText}>
                You&apos;ve used all free match checks. Upgrade to Premium for daily matching.
              </Text>
            </ElevatedCard>
          ) : (topMatches ?? []).length > 0 ? (
            <FlatList
              data={topMatches}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.userId)}
              contentContainerStyle={styles.railContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.matchCard}
                  onPress={() =>
                    navigation.navigate('MatchProfile', {
                      matchId: String(item.userId),
                      otherUserName: item.fullName,
                    })
                  }
                >
                  <ScoreRing score={Math.round(item.score)} size={52} strokeWidth={5} />
                  <Text style={styles.matchName} numberOfLines={1}>
                    {item.fullName}
                  </Text>
                  <View style={styles.matchScorePill}>
                    <Text style={styles.matchScoreLabel}>
                      ✨ {Math.round(item.score)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <ElevatedCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No matches found nearby yet.</Text>
            </ElevatedCard>
          )}
        </View>

        {/* 6. RECENT ACTIVITY (3 Most Recent Notifications) */}
        <View style={styles.sectionWrapper}>
          <SectionHeader title="Recent activity" />

          {notifsLoading ? (
            <View style={{ gap: space.sm }}>
              <Skeleton variant="row" height={56} />
              <Skeleton variant="row" height={56} />
            </View>
          ) : recent3Notifs.length > 0 ? (
            <ElevatedCard style={styles.notifCard}>
              {recent3Notifs.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifItemRow,
                    idx < recent3Notifs.length - 1 && styles.notifItemBorder,
                  ]}
                  onPress={() => (navigation as any).navigate('Notifications')}
                >
                  <IconCircle size={36} backgroundColor={colors.surfaceTint}>
                    <Ionicons name="notifications-outline" size={18} color={colors.primary} />
                  </IconCircle>
                  <View style={styles.notifTextCol}>
                    <Text style={styles.notifTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.notifDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                  <Text style={styles.notifTime}>{item.relativeTime}</Text>
                </TouchableOpacity>
              ))}
            </ElevatedCard>
          ) : (
            <ElevatedCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent activity</Text>
            </ElevatedCard>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
    zIndex: 20,
    position: 'relative',
  },
  headerShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    ...elevation.card,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  avatarInitial: {
    fontFamily: type.h2.fontFamily,
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerTextGroup: {
    flex: 1,
    marginLeft: space.md,
    marginRight: space.xl + space.md,
  },
  greetingText: {
    fontFamily: type.display.fontFamily,
    color: colors.white,
    fontWeight: '700',
  },
  locationSubtext: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  fixedBellButton: {
    position: 'absolute',
    right: 0,
    top: -4,
    padding: space.xs + 2,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  bellBadgeText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 9,
    color: colors.white,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingTop: space.md,
    paddingBottom: space.xxl,
  },
  sectionWrapper: {
    marginBottom: space.lg,
    paddingHorizontal: space.lg,
  },
  housingCard: {
    padding: space.lg,
    borderRadius: radius.xl,
  },
  housingContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  housingTextCol: {
    flex: 1,
  },
  housingStatusBadge: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    color: colors.mintDark,
    fontWeight: '700',
    letterSpacing: 0.8,
    backgroundColor: colors.mintLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 2,
    overflow: 'hidden',
  },
  housingStatusBadgeHold: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    color: '#92400E',
    fontWeight: '700',
    letterSpacing: 0.8,
    backgroundColor: '#FCEEDC',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 2,
    overflow: 'hidden',
  },
  housingTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '600',
    marginTop: 2,
  },
  housingSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  housingPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  flagEmoji: {
    fontSize: 32,
  },
  railScroll: {
    marginHorizontal: -space.lg,
    paddingHorizontal: space.lg,
  },
  railContainer: {
    paddingRight: space.lg,
  },
  railSkeletonCard: {
    marginRight: space.md,
  },
  intentPromptCard: {
    padding: space.lg,
    alignItems: 'center',
    borderRadius: radius.xl,
  },
  intentTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '600',
    marginTop: space.sm,
  },
  intentSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: space.xs,
    marginBottom: space.md,
  },
  intentButtonWrapper: {
    width: '100%',
  },
  matchCard: {
    width: 136,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    alignItems: 'center',
    marginRight: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    ...elevation.card,
  },
  matchName: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '700',
    marginTop: space.xs,
    textAlign: 'center',
  },
  matchScorePill: {
    marginTop: space.xs,
    backgroundColor: colors.mintLight,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  matchScoreLabel: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.mintDark,
    fontWeight: '700',
  },
  paywallCard: {
    padding: space.md,
  },
  paywallText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
  paywallLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  emptyCard: {
    padding: space.md,
  },
  emptyText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
  notifCard: {
    padding: space.xs,
    borderRadius: radius.lg,
  },
  notifItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.sm,
    gap: space.md,
  },
  notifItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  notifTextCol: {
    flex: 1,
  },
  notifTitle: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
  notifDesc: {
    fontFamily: type.caption.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  notifTime: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    color: colors.inkFaint,
  },
});
