import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DibsLogo } from '@/components/dibs-logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useDemoSession } from '@/hooks/demo-session';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useDemoSession();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const inputBg = theme.inputBg;
  const placeholderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(15,26,43,0.4)';

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <DibsLogo width={140} height={52} />
            </View>
            <ThemedText type="title" style={[styles.headerTitle, { color: theme.text }]}>
              Welcome back
            </ThemedText>
            <ThemedText style={[styles.subTitle, { color: theme.mutedText }]}>
              Sign in with your email to continue
            </ThemedText>
          </View>

          <View style={styles.form}>
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
            <Field
              label="Password"
              placeholder="•••••••••••••"
              value={password}
              onChangeText={setPassword}
              theme={theme}
              inputBg={inputBg}
              placeholderColor={placeholderColor}
              secureTextEntry
              textContentType="password"
            />
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              style={styles.forgotWrap}
              hitSlop={8}>
              <ThemedText style={[styles.forgotText, { color: theme.accent }]}>Forgot password?</ThemedText>
            </Pressable>

            <Pressable
              onPress={() => {
                signIn();
                router.replace('/(tabs)');
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.92 : 1 },
              ]}>
              <ThemedText style={styles.primaryButtonText}>Sign in</ThemedText>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.accent }]} />
              <ThemedText style={[styles.dividerText, { color: theme.accent }]}>or</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.accent }]} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(34, 198, 217, 0.1)' : 'rgba(34, 198, 217, 0.08)',
                  borderColor: colorScheme === 'dark' ? 'rgba(34, 198, 217, 0.25)' : 'rgba(34, 198, 217, 0.2)',
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <MaterialIcons name="mail" size={20} color={theme.accent} />
              <ThemedText style={[styles.socialButtonText, { color: theme.text }]}>Sign in with Google</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(34, 198, 217, 0.1)' : 'rgba(34, 198, 217, 0.08)',
                  borderColor: colorScheme === 'dark' ? 'rgba(34, 198, 217, 0.25)' : 'rgba(34, 198, 217, 0.2)',
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <MaterialIcons name="phone-iphone" size={20} color={theme.text} />
              <ThemedText style={[styles.socialButtonText, { color: theme.text }]}>Sign in with Apple</ThemedText>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(auth)/signup')}
            style={({ pressed }) => [styles.footerLink, { opacity: pressed ? 0.8 : 1 }]}>
            <ThemedText style={[styles.footerLinkText, { color: theme.mutedText }]}>
              New on DIBS? <ThemedText style={{ color: theme.accent, fontFamily: FontFamilies.medium }}>Create an account</ThemedText>
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16 },
  content: { flex: 1, paddingTop: 24, justifyContent: 'space-between' },
  header: { gap: 8 },
  logoContainer: { alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, lineHeight: 30, letterSpacing: -1 },
  subTitle: { fontSize: 14, lineHeight: 22, opacity: 0.9 },
  form: { gap: 16 },
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
  forgotWrap: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: 14, fontFamily: FontFamilies.medium },
  primaryButton: {
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FontFamilies.semiBold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  dividerLine: { width: 72, height: 1, opacity: 0.1 },
  dividerText: { fontSize: 16, fontFamily: FontFamilies.medium },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
  },
  socialButtonText: { fontSize: 14, fontFamily: FontFamilies.medium },
  footerLink: { paddingVertical: 16, alignItems: 'center' },
  footerLinkText: { fontSize: 14, fontFamily: FontFamilies.medium },
});
