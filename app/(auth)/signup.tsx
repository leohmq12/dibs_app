import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DibsLogo } from '@/components/dibs-logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputBg = theme.inputBg;
  const placeholderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(15,26,43,0.4)';

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || undefined } }
    });
    
    if (!error) {
      await supabase.from('logs').insert({
        user_id: data?.user?.id,
        name: fullName || email.split('@')[0],
        details: 'Successful Account Creation',
        device: Platform.OS,
        status: 'verified',
        type: 'success',
      });
      signUp(email, password);
      router.replace('/(auth)/face-enroll');
    } else {
      await supabase.from('logs').insert({
        user_id: null,
        name: fullName || email.split('@')[0] || 'Unknown User',
        details: `Failed Signup: ${error.message}`,
        device: Platform.OS,
        status: 'blocked',
        type: 'danger',
      });
      console.error(error.message);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <DibsLogo width={200} height={77} />
          </View>

          <View style={styles.form}>
            <ThemedText type="title" style={[styles.headerTitle, { color: theme.text }]}>
              Create an account
            </ThemedText>
            <ThemedText style={[styles.subTitle, { color: theme.mutedText }]}>
              Use your email to get started
            </ThemedText>
            <Field
              label="Full Name"
              placeholder="e.g. Jenny Wilson"
              value={fullName}
              onChangeText={setFullName}
              theme={theme}
              inputBg={inputBg}
              placeholderColor={placeholderColor}
            />
            <Field
              label="Email address"
              placeholder="e.g. wilson09@gmail.com"
              value={email}
              onChangeText={setEmail}
              theme={theme}
              inputBg={inputBg}
              placeholderColor={placeholderColor}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <PasswordField
              label="Password"
              placeholder="•••••••••••••"
              value={password}
              onChangeText={setPassword}
              theme={theme}
              inputBg={inputBg}
              placeholderColor={placeholderColor}
              secureTextEntry={!showPassword}
              onToggleVisibility={() => setShowPassword((v) => !v)}
              textContentType="newPassword"
            />
            <PasswordField
              label="Confirm Password"
              placeholder="•••••••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              theme={theme}
              inputBg={inputBg}
              placeholderColor={placeholderColor}
              secureTextEntry={!showConfirmPassword}
              onToggleVisibility={() => setShowConfirmPassword((v) => !v)}
              textContentType="newPassword"
            />

            <Pressable
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              style={styles.checkboxRow}>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreedToTerms ? theme.accent : 'transparent',
                    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,26,43,0.15)',
                  },
                ]}>
                {agreedToTerms && <ThemedText style={styles.checkmark}>✓</ThemedText>}
              </View>
              <ThemedText style={[styles.checkboxLabel, { color: theme.mutedText }]}>
                I&apos;ve read and agree to the terms of privacy policy
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleCreateAccount}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.92 : 1 },
              ]}>
              <ThemedText style={styles.primaryButtonText}>Create Account</ThemedText>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            style={({ pressed }) => [styles.footerLink, { opacity: pressed ? 0.8 : 1 }]}>
            <ThemedText style={[styles.footerLinkText, { color: theme.mutedText }]}>
              Already have an account? Sign in
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function Field({
  label,
  placeholder,
  theme,
  inputBg,
  placeholderColor,
  ...props
}: {
  label: string;
  placeholder?: string;
  theme: typeof Colors.light;
  inputBg: string;
  placeholderColor: string;
} & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.fieldWrap}>
      <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>{label}</ThemedText>
      <TextInput
        placeholder={placeholder ?? label}
        placeholderTextColor={placeholderColor}
        style={[
          styles.input,
          {
            backgroundColor: inputBg,
            borderColor: theme.inputBorder,
            color: theme.text,
          },
        ]}
        {...props}
      />
    </View>
  );
}

function PasswordField({
  label,
  placeholder,
  theme,
  inputBg,
  placeholderColor,
  secureTextEntry,
  onToggleVisibility,
  ...props
}: {
  label: string;
  placeholder?: string;
  theme: typeof Colors.light;
  inputBg: string;
  placeholderColor: string;
  secureTextEntry: boolean;
  onToggleVisibility: () => void;
} & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.fieldWrap}>
      <ThemedText style={[styles.fieldLabel, { color: theme.text }]}>{label}</ThemedText>
      <View style={styles.passwordInputWrap}>
        <TextInput
          placeholder={placeholder ?? label}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureTextEntry}
          style={[
            styles.input,
            styles.inputWithRightIcon,
            {
              backgroundColor: inputBg,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          {...props}
        />
        <Pressable
          onPress={onToggleVisibility}
          style={styles.eyeButton}
          hitSlop={12}
          accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}>
          <MaterialIcons
            name={secureTextEntry ? 'visibility-off' : 'visibility'}
            size={22}
            color={theme.mutedText}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16 },
  content: { flex: 1, paddingTop: 24, justifyContent: 'space-between' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  headerTitle: { fontSize: 24, lineHeight: 30, letterSpacing: -1, marginBottom: 4 },
  subTitle: { fontSize: 14, lineHeight: 22, opacity: 0.9, marginBottom: 24 },
  form: { gap: 12 },
  fieldWrap: { marginBottom: 4 },
  fieldLabel: { fontSize: 14, lineHeight: 22, marginBottom: 6 },
  input: {
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 14,
    fontFamily: FontFamilies.regular,
  },
  passwordInputWrap: { position: 'relative', justifyContent: 'center' },
  inputWithRightIcon: { paddingRight: 48 },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#FFF', fontSize: 12, fontFamily: FontFamilies.semiBold },
  checkboxLabel: { flex: 1, fontSize: 14, lineHeight: 22 },
  primaryButton: {
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: FontFamilies.semiBold },
  footerLink: { paddingVertical: 16, alignItems: 'center' },
  footerLinkText: { fontSize: 14, fontFamily: FontFamilies.medium },
});
