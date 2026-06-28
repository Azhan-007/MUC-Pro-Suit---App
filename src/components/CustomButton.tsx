import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { Colors, Shadow } from '../theme';

interface CustomButtonProps {
  text: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined';
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onPress,
  variant = 'filled',
  backgroundColor = Colors.BluePrimary,
  textColor = '#FFFFFF',
  disabled = false,
  loading = false,
  leadingIcon,
  style,
  fullWidth = false,
}) => {
  const isOutlined = variant === 'outlined';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        isOutlined
          ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.AppOutline }
          : { backgroundColor: disabled ? Colors.AppOutline : backgroundColor },
        fullWidth && { alignSelf: 'stretch' },
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.85 },
        !isOutlined && Shadow.sm,
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={isOutlined ? Colors.AppOnBackground : textColor} size="small" />
        ) : (
          <>
            {leadingIcon && <View style={styles.icon}>{leadingIcon}</View>}
            <Text
              style={[
                styles.label,
                {
                  color: isOutlined
                    ? Colors.AppOnBackground
                    : disabled
                    ? Colors.AppOnSurfaceVariant
                    : textColor,
                },
              ]}
            >
              {text}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
});
