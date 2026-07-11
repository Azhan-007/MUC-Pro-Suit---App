import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface QuickActionButtonProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  onPress: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  title,
  icon,
  iconBg,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.container, { opacity: pressed ? 0.8 : 1 }]}
  >
    <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
    <Text style={styles.label} numberOfLines={1}>
      {title}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.AppOnSurfaceVariant,
    textAlign: 'center',
  },
});
