import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { BackButton, Choice, ProgressHeader } from '../../components/Chrome';
import { TIME_OPTIONS } from '../../engine/catalog';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function TimeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bundle, saveOnboarding } = useApp();
  const [minutes, setMinutes] = useState<5 | 10 | 20 | 30 | null>(bundle?.onboarding.dailyMinutes ?? null);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ProgressHeader step={4} total={6} colors={colors} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <BackButton colors={colors} onPress={() => router.back()} />
        <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 30, lineHeight: 36 }}>How much time can you dedicate to improving yourself each day?</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 18 }}>Small consistent actions create progress.</Text>
        <View style={{ gap: 12 }}>
          {TIME_OPTIONS.map((option) => (
            <Choice key={option.minutes} colors={colors} title={option.title} detail={option.detail} icon="time-outline" selected={minutes === option.minutes} onPress={() => setMinutes(option.minutes)} />
          ))}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 12 }}>
        <Button
          colors={colors}
          label="Continue"
          arrow
          disabled={!minutes}
          onPress={() => {
            if (!minutes) return;
            void saveOnboarding({ dailyMinutes: minutes, step: 'motivation' });
            router.push('/onboarding/motivation');
          }}
        />
      </View>
    </View>
  );
}
