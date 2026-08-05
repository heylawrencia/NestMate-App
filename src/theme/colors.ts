/**
 * NestMate v2 Design System — Color Tokens (Spec §3.2)
 *
 * Core palette: Vibrant Blue primary (#0066FF), Deep Royal Blue (#0047BB), Pure White & Crisp Slate background.
 */
export const colors = {
  // Brand — Electric Royal Blue & Fresh Mint Palette
  primary: '#2563EB',        // Royal Blue - main CTAs, headers, active tabs
  primaryDark: '#1D4ED8',    // Deep Royal Blue - pressed state
  primaryLight: '#EFF6FF',   // Soft Sky Blue - chip backgrounds & active tints
  
  // Mint & Teal Accents (Match percentages, badges, pill tags)
  mint: '#2DD4BF',           // Fresh Mint - high match score & active tab indicator
  mintLight: '#CCFBF1',      // Soft Mint Light - badge background
  mintDark: '#0F766E',       // Dark Teal - text inside mint badges
  
  secondary: '#0D9488',      // Teal Accent
  secondaryDark: '#0F766E',  
  secondaryLight: '#CCFBF1', 

  // Neutral scale
  background: '#F8FAFC',     // Page background - clean slate off-white
  surface: '#FFFFFF',        // Card background - crisp white
  surfaceRaised: '#FFFFFF',  // Elevated cards / sheets
  ink: '#0F172A',            // Body & headings - deep slate
  inkMuted: '#64748B',       // Subtitles & inactive icons
  inkFaint: '#94A3B8',       // Placeholders & borders
  line: '#E2E8F0',           // Card borders & subtle dividers

  // System & Compatibility Scale
  success: '#10B981',        // Emerald success
  warning: '#F59E0B',        // Amber warning / tip
  danger: '#EF4444',         // Red alert / dislike / dealbreaker
  info: '#2563EB',           // Royal blue info
  white: '#FFFFFF',

  // --- Backward Compatibility Aliases ---
  text: '#0F172A',           // alias -> ink
  textMuted: '#64748B',      // alias -> inkMuted
  border: '#E2E8F0',         // alias -> line
  error: '#EF4444',          // alias -> danger
  accent: '#2563EB',         // alias -> primary
  surfaceTint: '#EFF6FF',    // alias -> primaryLight
};
