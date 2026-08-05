import { ViewStyle } from 'react-native';

/**
 * NestMate v2 Design System — Elevation Tokens (Spec §3.4)
 */
export const elevation: Record<'none' | 'card' | 'raised' | 'sheet', ViewStyle> = {
  none: {},
  card: {
    shadowColor: '#2563EB',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#1E293B',
    shadowOpacity: 0.10,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  sheet: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -6 },
    elevation: 14,
  },
};

// Backward compatibility alias for pre-F2 components
export const shadows: Record<'sm' | 'md' | 'lg', ViewStyle> = {
  sm: elevation.card,
  md: elevation.raised,
  lg: elevation.sheet,
};
