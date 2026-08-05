/**
 * NestMate v2 Design System — Typography Scale (Spec §3.3)
 *
 * Two families: Sora (display, headings, numerics) & Inter (body, UI, captions).
 */
export const type = {
  display:    { fontFamily: 'Sora_700Bold',      fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  h1:         { fontFamily: 'Sora_600SemiBold',  fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  h2:         { fontFamily: 'Sora_600SemiBold',  fontSize: 19, lineHeight: 25 },
  h3:         { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 22 },
  body:       { fontFamily: 'Inter_400Regular',  fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: 'Inter_500Medium',   fontSize: 15, lineHeight: 22 },
  caption:    { fontFamily: 'Inter_400Regular',  fontSize: 13, lineHeight: 18 },
  micro:      { fontFamily: 'Inter_500Medium',   fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
  price:      { fontFamily: 'Sora_700Bold',      fontSize: 20, lineHeight: 24 },
  score:      { fontFamily: 'Sora_700Bold',      fontSize: 26, lineHeight: 28 },
};

// Backward compatibility alias for existing component imports
export const typography = {
  h1: 30,
  h2: 22,
  body: 16,
  caption: 13,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightBold: '700' as const,
};
