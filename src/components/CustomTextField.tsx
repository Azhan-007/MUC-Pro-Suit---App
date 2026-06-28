import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '../theme';

interface CustomTextFieldProps extends TextInputProps {
  label: string;
  placeholder?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label,
  placeholder,
  leadingIcon,
  trailingIcon,
  error,
  containerStyle,
  ...inputProps
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {leadingIcon && <View style={styles.leadingIcon}>{leadingIcon}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.AppOnSurfaceVariant + '99'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
        {trailingIcon && <View style={styles.trailingIcon}>{trailingIcon}</View>}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.AppOnBackground,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.AppOutline,
    borderRadius: 12,
    backgroundColor: Colors.AppSurfaceVariant + '4D',
    paddingHorizontal: 12,
    height: 52,
  },
  inputFocused: {
    borderColor: Colors.BluePrimary,
  },
  inputError: {
    borderColor: Colors.RedError,
  },
  leadingIcon: {
    marginRight: 10,
  },
  trailingIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.AppOnBackground,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: Colors.RedError,
    marginTop: 4,
    fontWeight: '500',
  },
});
