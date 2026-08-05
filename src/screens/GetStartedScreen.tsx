/**
 * GetStartedScreen — Welcome landing screen (Spec §5.1 & §3.1)
 *
 * Features full-bleed upper 55% illustration carousel, headline, concise value proposition,
 * primary [Create account] button, and ghost [I already have an account] button.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GetStarted'>;

interface Slide {
  key: string;
  image: number;
  title: string;
}

const SLIDES: Slide[] = [
  {
    key: 'roomie1',
    image: require('../../assets/roomie1.png'),
    title: 'Match with compatible roommates',
  },
  {
    key: 'roomie2',
    image: require('../../assets/roomie2.png'),
    title: 'Explore verified student hostels',
  },
  {
    key: 'roomie3',
    image: require('../../assets/roomie3.png'),
    title: 'Secure your room effortlessly',
  },
];

const AUTO_SLIDE_INTERVAL_MS = 3500;

export default function GetStartedScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const carouselHeight = height * 0.55;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const renderSlide = ({ item }: ListRenderItemInfo<Slide>) => {
    return (
      <View style={{ width, height: carouselHeight }}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Upper 55% Illustration Carousel */}
      <View style={{ width, height: carouselHeight }}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        />

        {/* Carousel Indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((slide, index) => (
            <View
              key={slide.key}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {/* Content & Action Sheet */}
      <View style={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <View style={styles.textContainer}>
          <Text style={styles.headline}>Find your ideal hostel and roommate in Ghana</Text>
          <Text style={styles.subhead}>
            Browse verified student hostels, calculate compatibility scores, and connect with roommates seamlessly.
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <AppButton
            title="Create account"
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate('SignUp')}
          />
          <AppButton
            title="I already have an account"
            variant="ghost"
            size="lg"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    position: 'absolute',
    bottom: space.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -radius.xl,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    justifyContent: 'space-between',
  },
  textContainer: {
    alignItems: 'center',
  },
  headline: {
    fontFamily: type.display.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: space.sm,
  },
  subhead: {
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  actionContainer: {
    gap: space.sm,
    marginTop: space.lg,
  },
});
