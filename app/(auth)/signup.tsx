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

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { isMobile } = useResponsive();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      Alert.alert('Signup Error', error.message);
    } else {
      Alert.alert('Success', 'Profile created! Please log in.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
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
            <ThemedText style={styles.headerTitle}>Create Account</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.mutedText }]}>
              Join DIBS to secure your personal media.
            </ThemedText>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: theme.mutedText }]}>FULL NAME</ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                  <MaterialIcons name="person-outline" size={20} color={theme.mutedText} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.mutedText}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

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
                    placeholder="Create a password"
                    placeholderTextColor={theme.mutedText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.signupButton,
                  { backgroundColor: theme.primary, opacity: pressed || loading ? 0.8 : 1 },
                ]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.signupButtonText}>Create Account</ThemedText>
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: theme.mutedText }]}>
              Already have an account?{' '}
            </ThemedText>
            <Pressable onPress={() => router.push('/login')}>
              <ThemedText style={[styles.footerLink, { color: theme.accent }]}>Sign In</ThemedText>
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
  signupButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  signupButtonText: { color: '#FFF', fontSize: 16, fontFamily: FontFamilies.semiBold },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 0 : 24,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontFamily: FontFamilies.semiBold },
});
