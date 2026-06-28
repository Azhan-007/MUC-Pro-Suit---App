import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AttendanceStatus } from '../types';
import { Colors } from '../theme';

interface StatusBadgeProps {
  status: AttendanceStatus;
}

const STATUS_CONFIG: Record<AttendanceStatus, { bg: string; text: string; label: string }> = {
  PRESENT: { bg: Colors.ColorPresent + '26', text: Colors.ColorPresent, label: 'Present' },
  ABSENT: { bg: Colors.ColorAbsent + '26', text: Colors.ColorAbsent, label: 'Absent' },
  PENDING: { bg: Colors.ColorPending + '26', text: Colors.ColorPending, label: 'Pending' },
  HOLIDAY: { bg: Colors.ColorHoliday + '26', text: Colors.ColorHoliday, label: 'Holiday' },
  LATE: { bg: '#F59E0B26', text: '#F59E0B', label: 'Late' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
