import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';

type ChipLevel =
  | 'SAFE' | 'WARNING' | 'LOW' | 'NOW' | 'ACTIVE'
  | 'ACADEMIC' | 'EXAMS' | 'PLACEMENTS' | 'SCHOLARSHIPS' | 'LIBRARY';

interface StatusChipProps {
  text: string;
  level: string;
}

function getChipColors(level: string): { bg: string; text: string } {
  switch (level.toUpperCase()) {
    case 'SAFE':
    case 'ACTIVE':
      return { bg: Colors.ColorPresent + '1F', text: Colors.ColorPresent };
    case 'WARNING':
      return { bg: Colors.ColorPending + '1F', text: Colors.ColorPending };
    case 'LOW':
      return { bg: Colors.ColorAbsent + '1F', text: Colors.ColorAbsent };
    case 'NOW':
      return { bg: Colors.BluePrimary, text: '#FFFFFF' };
    case 'ACADEMIC':
    case 'EXAMS':
      return { bg: Colors.BluePrimaryContainer, text: Colors.BluePrimary };
    case 'PLACEMENTS':
      return { bg: Colors.TealTertiaryContainer, text: Colors.TealTertiary };
    case 'SCHOLARSHIPS':
      return { bg: Colors.SkySecondaryContainer, text: Colors.SkySecondary };
    case 'LIBRARY':
      return { bg: Colors.AppOutline, text: Colors.AppOnSurfaceVariant };
    default:
      return { bg: Colors.AppSurfaceVariant, text: Colors.AppOnSurfaceVariant };
  }
}

export const StatusChip: React.FC<StatusChipProps> = ({ text, level }) => {
  const { bg, text: textColor } = getChipColors(level);
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
