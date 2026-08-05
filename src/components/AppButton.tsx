/**
 * AppButton — Primary, secondary, ghost, and danger action button (Spec §3.6)
 *
 * Usage:
 * <AppButton title="Hold this bed" variant="primary" size="lg" onPress={handleHold} loading={isHolding} />
 */

import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { colors, motion, radius, space, type } from '../theme';

export interface AppButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'lg' | 'md';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: AppButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.timing(scaleAnim, {
      toValue: motion.pressScale,
      duration: motion.pressDuration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: motion.pressDuration,
      useNativeDriver: true,
    }).start();
  };

  // Variant color mapping
  let bg = colors.primary;
  let textColor = colors.white;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    bg = colors.primaryLight;
    textColor = colors.primary;
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textColor = colors.primary;
  } else if (variant === 'danger') {
    bg = colors.danger;
    textColor = colors.white;
  } else if (variant === 'outline') {
    bg = colors.surface;
    textColor = colors.ink;
    borderColor = colors.line;
  }

  const height = size === 'lg' ? 52 : 44;
  const isPrimary = variant === 'primary' && !isDisabled;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          {
            backgroundColor: bg,
            height,
            borderColor,
            borderWidth: borderColor !== 'transparent' ? 1 : 0,
            opacity: isDisabled ? 0.6 : 1,
          },
          isPrimary && styles.primaryShadow,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text style={[styles.title, { color: textColor }, size === 'md' && styles.titleMd, textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  primaryShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  title: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  titleMd: {
    fontSize: 14,
  },
});
