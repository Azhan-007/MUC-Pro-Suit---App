import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  StyleProp,
} from 'react-native';
import { Colors, Radius, Shadow } from '../theme';

interface CampusCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  backgroundColor?: string;
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  onPress?: () => void;
  padding?: number;
}

export const CampusCard: React.FC<CampusCardProps> = ({
  children,
  style,
  borderColor,
  backgroundColor = Colors.AppSurface,
  elevation = 'md',
  onPress,
  padding = 16,
}) => {
  const shadowStyle = elevation === 'none' ? {} : Shadow[elevation];

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderRadius: Radius.lg,
    padding,
    ...(borderColor ? { borderWidth: 1, borderColor } : {}),
    ...shadowStyle,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.92 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
