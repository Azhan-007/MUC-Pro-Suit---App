// Typography system — uses Inter via @expo-google-fonts/inter

import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
} as const;

export const Typography = {
  // Display
  display: {
    fontSize: 32,
    fontFamily: FontFamily.black,
    color: Colors.AppOnBackground,
    lineHeight: 40,
  } as TextStyle,

  // Headings
  h1: {
    fontSize: 28,
    fontFamily: FontFamily.black,
    color: Colors.AppOnBackground,
    lineHeight: 36,
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    color: Colors.AppOnBackground,
    lineHeight: 28,
  } as TextStyle,
  h3: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    color: Colors.AppOnBackground,
    lineHeight: 24,
  } as TextStyle,
  h4: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: Colors.AppOnBackground,
    lineHeight: 22,
  } as TextStyle,

  // Body
  bodyLg: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: Colors.AppOnBackground,
    lineHeight: 24,
  } as TextStyle,
  body: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colors.AppOnBackground,
    lineHeight: 20,
  } as TextStyle,
  bodySm: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: Colors.AppOnSurfaceVariant,
    lineHeight: 18,
  } as TextStyle,

  // Labels & Captions
  label: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: Colors.AppOnSurfaceVariant,
    lineHeight: 16,
  } as TextStyle,
  caption: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    color: Colors.AppOnSurfaceVariant,
    lineHeight: 14,
  } as TextStyle,

  // Special
  stat: {
    fontSize: 24,
    fontFamily: FontFamily.black,
    color: Colors.AppOnBackground,
    lineHeight: 30,
  } as TextStyle,
  statLg: {
    fontSize: 42,
    fontFamily: FontFamily.black,
    color: Colors.BluePrimary,
    lineHeight: 50,
  } as TextStyle,
} as const;
