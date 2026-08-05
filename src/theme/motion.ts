/**
 * NestMate v2 Design System — Motion Tokens (Spec §3.5)
 *
 * Named animation durations, scales, and timing constants.
 */
export const motion = {
  pressDuration: 100,     // ms, press feedback duration (scale 0.97)
  pressScale: 0.97,       // scale factor on active press
  screenTransition: 280,  // ms, screen transition duration (ease-in-out)
  bottomSheet: 320,       // ms, bottom sheet entrance duration
  bottomSheetDamping: 18, // spring damping for sheet gestures
  skeletonLoop: 1200,     // ms, skeleton shimmer loop duration
  scoreRingFill: 700,     // ms, score ring progress fill duration (ease-out)
};
