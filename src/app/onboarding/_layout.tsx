import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import { useColors } from '../../theme/Theme';

export default function OnboardingLayout() {
  const colors = useColors();
  const { ready, bundle } = useApp();
  useEffect(() => {
    if (ready && bundle?.onboarding.completed) router.replace('/(tabs)');
  }, [bundle?.onboarding.completed, ready]);
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }} />;
}
