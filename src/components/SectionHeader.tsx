import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onActionPress,
}) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {actionText && onActionPress && (
      <Pressable onPress={onActionPress} hitSlop={8}>
        <Text style={styles.action}>{actionText}</Text>
      </Pressable>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.AppOnBackground,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.BluePrimary,
  },
});
