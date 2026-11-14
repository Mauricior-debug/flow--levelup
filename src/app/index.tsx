import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { ErrorBlock, Wordmark } from '../components/Chrome';
import { useApp } from '../state/AppContext';
import { useColors } from '../theme/Theme';
import type { StepId } from '../engine/types';

export function stepHref(step: StepId): '/onboarding/welcome' | '/onboarding/meet' | '/onboarding/focus' | '/onboarding/situation' | '/onboarding/time' | '/onboarding/motivation' | '/onboarding/generating' | '/onboarding/plan' | '/onboarding/first-win' | '/onboarding/account' | '/(tabs)' {
  switch (step) {
    case 'meet':
      return '/onboarding/meet';
    case 'focus':
      return '/onboarding/focus';
    case 'situation':
      return '/onboarding/situation';
    case 'time':
      return '/onboarding/time';
    case 'motivation':
      return '/onboarding/motivation';
    case 'generating':
      return '/onboarding/generating';
    case 'plan':
      return '/onboarding/plan';
    case 'first':
      return '/onboarding/first-win';
    case 'account':
      return '/onboarding/account';
    case 'done':
      return '/(tabs)';
    default:
      return '/onboarding/welcome';
  }
}

export default function Index() {
  const colors = useColors();
  const { ready, error, bundle, retry } = useApp();
  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <Wordmark color={colors.text} />
        <ActivityIndicator color={colors.yellow} />
      </View>
    );
  }
  if (error && !bundle) return <ErrorBlock colors={colors} message={error} onRetry={retry} />;
  if (!bundle) return <Redirect href="/onboarding/welcome" />;
  if (!bundle.onboarding.completed) return <Redirect href={stepHref(bundle.onboarding.step)} />;
  return <Redirect href="/(tabs)" />;
}
