import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { BackButton, Choice, ProgressHeader } from '../../components/Chrome';
import { MOTIVATIONS } from '../../engine/catalog';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function MotivationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bundle, saveOnboarding } = useApp();
  const [motivation, setMotivation] = useState<string | null>(bundle?.onboarding.motivation ?? null);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ProgressHeader step={5} total={6} colors={colors} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <BackButton colors={colors} onPress={() => router.back()} />
        <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 32, lineHeight: 38, marginBottom: 18 }}>What motivates you most?</Text>
        <View style={{ gap: 12 }}>
          {MOTIVATIONS.map((option) => (
            <Choice key={option} colors={colors} title={option} selected={motivation === option} onPress={() => setMotivation(option)} />
          ))}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 12 }}>
        <Button
          colors={colors}
          label="Continue"
          arrow
          disabled={!motivation}
          onPress={() => {
            if (!motivation) return;
            void saveOnboarding({ motivation, step: 'generating' });
            router.push('/onboarding/generating');
          }}
        />
      </View>
    </View>
  );
}
