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
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import { spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GetStarted'>;

interface Slide {
  key: string;
  image: number;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    key: 'roomie1',
    image: require('../../assets/roomie1.png'),
    title: 'Find your perfect roommates',
    description: 'Connect with verified people who match your lifestyle and vibe.',
  },
  {
    key: 'roomie2',
    image: require('../../assets/roomie2.png'),
    title: 'Discover your next home',
    description: 'Browse listings that fit your budget and location, hassle-free.',
  },
  {
    key: 'roomie3',
    image: require('../../assets/roomie3.png'),
    title: 'Build your community',
    description: 'Turn strangers into roommates, and roommates into friends.',
  },
];

const AUTO_SLIDE_INTERVAL_MS = 3000;

export default function GetStartedScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

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

  function handleMomentumScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  function renderSlide({ item }: ListRenderItemInfo<Slide>) {
    return <Image source={item.image} style={{ width, height }} resizeMode="cover" />;
  }

  const activeSlide = SLIDES[activeIndex];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

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

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      <View style={[styles.overlay, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.title}>{activeSlide.title}</Text>
        <Text style={styles.subtitle}>{activeSlide.description}</Text>

        <View style={styles.dots}>
          {SLIDES.map((slide, index) => (
            <View
              key={slide.key}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <AppButton title="Get Started" onPress={() => navigation.navigate('SignUp')} />
        <View style={styles.spacer} />
        <AppButton title="Log In" variant="outline" onPress={() => navigation.navigate('Login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  spacer: {
    height: spacing.md,
  },
});
