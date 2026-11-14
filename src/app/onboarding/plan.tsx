import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Chrome';
import { LoopView } from '../../components/LoopView';
import { planHighlights } from '../../engine/plan';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function PlanScreen() {
  const colors = useColors();
  const { bundle, saveOnboarding } = useApp();
  const missions = (bundle?.missions ?? []).filter((mission) => mission.origin === 'user');
  const highlights = planHighlights(
    missions.map((mission) => ({
      title: mission.title,
      description: mission.description,
      category: mission.category,
      durationMinutes: mission.durationMinutes,
      difficulty: mission.difficulty,
      dayOffset: mission.challengeDay ? mission.challengeDay - 1 : 0,
      challengeDay: mission.challengeDay ?? 0,
      slot: mission.slot,
    })),
    bundle?.onboarding.dailyMinutes ?? 5,
  );
  return (
    <Screen
      colors={colors}
      footer={
        <Button
          colors={colors}
          label="Start My First Challenge"
          arrow
          disabled={missions.length === 0}
          onPress={() => {
            void saveOnboarding({ step: 'first' });
            router.push('/onboarding/first-win');
          }}
        />
      }
    >
      <View style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <LoopView visual="wave" size={210} />
        <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 32, textAlign: 'center' }}>Your plan is ready!</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 16, lineHeight: 23, textAlign: 'center' }}>
          Based on your answers, here is a 7-day challenge built around {bundle?.onboarding.dailyMinutes ?? 5} minutes a day.
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        {highlights.map((item) => (
          <View key={item.title} style={{ minHeight: 64, borderRadius: 18, backgroundColor: colors.card, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name={item.icon as 'flag-outline'} size={20} color={colors.success} />
            <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: 16, flex: 1 }}>{item.title}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
