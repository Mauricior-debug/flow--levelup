import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { xpFor } from '../../engine/progression';
import { categoryById } from '../../engine/catalog';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function MissionSheet() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bundle, completeMission } = useApp();
  const mission = bundle?.missions.find((item) => item.id === id);
  if (!mission) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgElevated, padding: 24, paddingTop: 28 }}>
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 22 }}>That mission is not on this device.</Text>
        <View style={{ marginTop: 16 }}><Button colors={colors} label="Close" onPress={() => router.back()} /></View>
      </View>
    );
  }
  const done = mission.status === 'complete';
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgElevated, padding: 22, paddingBottom: insets.bottom + 16, gap: 10 }}>
      <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>{categoryById(mission.category).title} · {mission.durationMinutes} min</Text>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28, lineHeight: 34 }}>{mission.title}</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 16, lineHeight: 23 }}>{mission.description}</Text>
      <Text style={{ color: colors.yellow, fontFamily: font.bold, fontSize: 18 }}>+{xpFor(mission.difficulty)} XP</Text>
      <View style={{ flex: 1 }} />
      <Button
        colors={colors}
        label={done ? 'Already complete' : 'Mark complete'}
        disabled={done}
        onPress={() => {
          void completeMission(mission.id).then((result) => {
            router.back();
            if (result.leveledUp || result.unlocked.length) {
              router.push({ pathname: '/celebration', params: { level: result.leveledUp ? String(result.level) : '', achievement: result.unlocked[0]?.title ?? '', xp: String(result.xp) } });
            }
          });
        }}
      />
    </View>
  );
}
