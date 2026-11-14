import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { ProgressHeader } from '../../components/Chrome';
import { LoopView } from '../../components/LoopView';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function GeneratingScreen() {
  const colors = useColors();
  const { buildPlan, ready, bundle } = useApp();
  const started = useRef(false);
  useEffect(() => {
    if (!ready || !bundle || started.current) return;
    started.current = true;
    let live = true;
    void (async () => {
      await buildPlan();
      await new Promise((resolve) => setTimeout(resolve, 1600));
      if (live) router.replace('/onboarding/plan');
    })();
    return () => {
      live = false;
    };
  }, [buildPlan, bundle, ready]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ProgressHeader step={6} total={6} colors={colors} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 }}>
        <LoopView visual="thinking" size={240} />
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 24, textAlign: 'center', lineHeight: 30 }}>Loop is preparing your personal growth journey...</Text>
      </View>
    </View>
  );
}
