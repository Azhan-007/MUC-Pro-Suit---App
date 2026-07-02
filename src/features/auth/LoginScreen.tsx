import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Badge, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { LoginSchema, LoginInput } from '../../services/authService';
import { mockProfile } from '../../data/mockData';
import { CampusCard, CustomButton, CustomTextField } from '../../components';
import { Colors } from '../../theme';

export const LoginScreen: React.FC = () => {
  const { login, loginError, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      registerNumber: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    clearError();
    login(data.registerNumber, data.password, mockProfile);
  };

  const handleQuickLogin = (role: 'STUDENT' | 'FACULTY') => {
    clearError();
    if (role === 'STUDENT') {
      setValue('registerNumber', 'MUC710');
      setValue('password', 'password123');
      login('MUC710', 'password123', mockProfile);
    } else {
      setValue('registerNumber', 'FAC001');
      setValue('password', 'faculty123');
      login('FAC001', 'faculty123', mockProfile);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Icon & Logo */}
          <View style={styles.topSection}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to access your academic{'\n'}journey.
            </Text>
          </View>

          {/* Credentials Card */}
          <CampusCard borderColor={Colors.AppOutline} style={styles.credentialsCard}>
            {/* Username */}
            <Controller
              control={control}
              name="registerNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextField
                  label="Username"
                  placeholder="Enter your username"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  leadingIcon={<Badge size={20} color={Colors.AppOnSurfaceVariant} />}
                  error={errors.registerNumber?.message}
                />
              )}
            />

            <View style={styles.spacer} />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextField
                  label="Password"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  leadingIcon={<Lock size={20} color={Colors.AppOnSurfaceVariant} />}
                  trailingIcon={
                    <Pressable onPress={() => setShowPassword((p) => !p)} hitSlop={8}>
                      {showPassword ? (
                        <EyeOff size={20} color={Colors.AppOnSurfaceVariant} />
                      ) : (
                        <Eye size={20} color={Colors.AppOnSurfaceVariant} />
                      )}
                    </Pressable>
                  }
                  error={errors.password?.message}
                />
              )}
            />

            {/* API error */}
            {loginError && (
              <Text style={styles.errorText}>{loginError}</Text>
            )}

            {/* Forgot Password */}
            <View style={styles.forgotRow}>
              <Pressable hitSlop={8}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>

            {/* Sign In Button */}
            <CustomButton
              text="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
            />

            {/* Support link */}
            <View style={styles.supportRow}>
              <Text style={styles.supportText}>Need Help? </Text>
              <Pressable hitSlop={8}>
                <Text style={styles.supportLink}>Contact College ERP Support</Text>
              </Pressable>
            </View>
          </CampusCard>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <Pressable><Text style={styles.footerLink}>Privacy Policy</Text></Pressable>
              <Text style={styles.footerDot}> · </Text>
              <Pressable><Text style={styles.footerLink}>Terms of Service</Text></Pressable>
            </View>
            <Text style={styles.version}>MU Campus App v1.0</Text>

            {__DEV__ && (
              <View style={styles.devRow}>
                <Pressable onPress={() => handleQuickLogin('STUDENT')} style={styles.devBtn}>
                  <Text style={styles.devBtnText}>[Dev] Student Login</Text>
                </Pressable>
                <Text style={styles.devBtnDivider}>|</Text>
                <Pressable onPress={() => handleQuickLogin('FACULTY')} style={styles.devBtn}>
                  <Text style={styles.devBtnText}>[Dev] Faculty Login</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.AppBackground },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.AppOnBackground,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.AppOnSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 30,
  },
  credentialsCard: {
    marginBottom: 24,
  },
  spacer: { height: 20 },
  errorText: {
    color: Colors.RedError,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 12,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.BluePrimary,
  },
  supportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  supportText: { fontSize: 12, color: Colors.AppOnSurfaceVariant },
  supportLink: { fontSize: 12, fontWeight: '700', color: Colors.BluePrimary },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: { fontSize: 12, color: Colors.AppOnSurfaceVariant },
  footerDot: { fontSize: 12, color: Colors.AppOutline },
  version: {
    fontSize: 11,
    color: Colors.AppOnSurfaceVariant + '80',
    marginTop: 6,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  devBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  devBtnText: {
    fontSize: 11,
    color: Colors.BluePrimary,
    fontWeight: '600',
  },
  devBtnDivider: {
    fontSize: 11,
    color: Colors.AppOutline,
  },
});
