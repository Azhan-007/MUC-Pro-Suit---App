// MUC Pro Suit Color System — ported from Color.kt
// DO NOT modify hex values without updating the Android source too.

export const Colors = {
  // Primary — Blue
  BluePrimary: '#2563EB',
  BlueOnPrimary: '#FFFFFF',
  BluePrimaryContainer: '#DBEAFE',
  BlueOnPrimaryContainer: '#1E40AF',

  // Secondary — Sky
  SkySecondary: '#0EA5E9',
  SkyOnSecondary: '#FFFFFF',
  SkySecondaryContainer: '#E0F2FE',
  SkyOnSecondaryContainer: '#0369A1',

  // Tertiary — Teal
  TealTertiary: '#0D9488',
  TealOnTertiary: '#FFFFFF',
  TealTertiaryContainer: '#CCFBF1',
  TealOnTertiaryContainer: '#115E59',

  // Background & Surface
  AppBackground: '#F8FAFC',
  AppOnBackground: '#0F172A',
  AppSurface: '#FFFFFF',
  AppOnSurface: '#0F172A',
  AppSurfaceVariant: '#F1F5F9',
  AppOnSurfaceVariant: '#475569',
  AppOutline: '#E2E8F0',

  // Error — Red
  RedError: '#DC2626',
  RedErrorContainer: '#FEE2E2',
  RedOnError: '#FFFFFF',
  RedOnErrorContainer: '#991B1B',

  // Status
  ColorPresent: '#10B981',   // Green
  ColorAbsent: '#EF4444',    // Red
  ColorPending: '#F59E0B',   // Amber
  ColorHoliday: '#3B82F6',   // Blue
} as const;

export type ColorKey = keyof typeof Colors;
