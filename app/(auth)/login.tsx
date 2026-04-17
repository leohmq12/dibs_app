import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DibsLogo } from '@/components/dibs-logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { isMobile } = useResponsive();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.content, !isMobile && styles.tabletCont]}>
          <View style={styles.logoContainer}>
            <DibsLogo width={200} height={77} />
          </View>

          <View>
            <ThemedText style={styles.headerTitle}>Welcome Back</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.mutedText }]}>
              Securely access your media vault.
            </ThemedText>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: theme.mutedText }]}>EMAIL ADDRESS</ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                  <MaterialIcons name="alternate-email" size={20} color={theme.mutedText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.mutedText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: theme.mutedText }]}>PASSWORD</ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                  <MaterialIcons name="lock-outline" size={20} color={theme.mutedText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.mutedText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <Pressable style={styles.forgotPassword}>
                <ThemedText style={[styles.forgotPasswordText, { color: theme.accent }]}>Forgot Password?</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  { backgroundColor: theme.primary, opacity: pressed || loading ? 0.8 : 1 },
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.loginButtonText}>SIgn In</ThemedText>
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: theme.mutedText }]}>
              Don&apos;t have an account?{' '}
            </ThemedText>
            <Pressable onPress={() => router.push('/signup')}>
              <ThemedText style={[styles.footerLink, { color: theme.accent }]}>Sign Up</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16, alignItems: 'center' },
  tabletCont: { maxWidth: 480, width: '100%' },
  content: { flex: 1, paddingTop: 24, justifyContent: 'space-between' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  headerTitle: { fontSize: 24, lineHeight: 30, letterSpacing: -1, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, marginBottom: 32 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 11, fontFamily: FontFamilies.bold, letterSpacing: 0.5 },
  inputContainer: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, fontFamily: FontFamilies.medium },
  forgotPassword: { alignSelf: 'flex-end', marginTop: -8 },
  forgotPasswordText: { fontSize: 13, fontFamily: FontFamilies.medium },
  loginButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  loginButtonText: { color: '#FFF', fontSize: 16, fontFamily: FontFamilies.semiBold },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 0 : 24,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontFamily: FontFamilies.semiBold },
});
