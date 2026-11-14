import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { ProgressHeader } from '../../components/Chrome';
import { LoopView } from '../../components/LoopView';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function GeneratingScreen() {
  const colors = useColors();
  const { buildPlan, ready, bundle } = useApp();
  const buildPlanRef = useRef(buildPlan);
  buildPlanRef.current = buildPlan;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function openPlan() {
    setBusy(true);
    setError(null);
    try {
      await buildPlanRef.current();
      router.replace('/onboarding/plan');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Loop could not finish the plan.');
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!ready || !bundle) return;
    let active = true;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          await buildPlanRef.current();
          if (active) router.replace('/onboarding/plan');
        } catch (caught) {
          if (!active) return;
          setError(caught instanceof Error ? caught.message : 'Loop could not finish the plan.');
          setBusy(false);
        }
      })();
    }, 700);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // Saving the plan updates the bundle and recreates buildPlan.
    // Those changes must not cancel the move to the plan screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, bundle?.user.id]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ProgressHeader step={6} total={6} colors={colors} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 }}>
        <LoopView visual="thinking" size={240} />
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 24, textAlign: 'center', lineHeight: 30 }}>
          Loop is preparing your personal growth journey...
        </Text>
        {error ? (
          <Text style={{ color: colors.danger, fontFamily: font.medium, textAlign: 'center', lineHeight: 22 }}>{error}</Text>
        ) : null}
        <View style={{ alignSelf: 'stretch', marginTop: 8 }}>
          <Button colors={colors} label="See my plan" busy={busy} onPress={() => { void openPlan(); }} />
        </View>
      </View>
    </View>
  );
}
