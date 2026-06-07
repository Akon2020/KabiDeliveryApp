import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle, RotateCcw } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.log('[ErrorBoundary] Uncaught error:', error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconWrap}>
            <AlertTriangle size={48} color={theme.error} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Oups, une erreur est survenue</Text>
          <Text style={styles.subtitle}>
            L&apos;application a rencontré un problème inattendu. Vous pouvez réessayer.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetail} numberOfLines={4}>
              {this.state.error.message}
            </Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleReset}
            activeOpacity={0.85}
          >
            <RotateCcw size={18} color="#FFF" strokeWidth={2} />
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorDetail: {
    fontSize: 12,
    color: theme.error,
    backgroundColor: theme.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    fontFamily: 'monospace' as const,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
