import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { FontFamilies } from '@/constants/theme';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch() {}

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="error-outline" size={48} color="#FF6B6B" />
          </View>
          <ThemedText style={styles.title}>Something went wrong</ThemedText>
          <ThemedText style={styles.body}>
            The app ran into an unexpected issue. Tap below to try again.
          </ThemedText>
          <Pressable
            onPress={this.handleReset}
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}>
            <ThemedText style={styles.buttonText}>Retry</ThemedText>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0F1B' },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: { marginBottom: 20 },
  title: {
    fontSize: 20,
    fontFamily: FontFamilies.semiBold,
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: { color: '#FFF', fontSize: 14, fontFamily: FontFamilies.semiBold },
});
