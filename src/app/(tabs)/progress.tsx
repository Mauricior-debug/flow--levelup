import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Bars, Radar } from '../../components/Charts';
import { progressModel, type Period } from '../../engine/selectors';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All Time' },
];

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bundle } = useApp();
  const [period, setPeriod] = useState<Period>('week');
  if (!bundle) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const model = progressModel(bundle, period);
  const tiles = [
    { label: 'XP earned', value: String(model.periodXp), icon: 'flash', color: colors.yellow },
    { label: 'Day streak', value: String(model.streak), icon: 'flame', color: colors.streak },
    { label: 'Missions done', value: String(model.missionsCompleted), icon: 'checkmark-circle', color: colors.success },
    { label: 'Achievements', value: String(model.achievementsUnlocked), icon: 'trophy', color: colors.purple },
  ];
  return (
    <View collapsable={false} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 110, paddingHorizontal: 20, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28, textAlign: 'center' }}>Your Progress</Text>
        <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: 22, padding: 4, marginTop: 16 }}>
          {PERIODS.map((item) => (
            <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: period === item.id }} onPress={() => setPeriod(item.id)} style={({ pressed }) => [{ flex: 1, minHeight: 44, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: period === item.id ? colors.yellow : 'transparent', opacity: pressed ? 0.75 : 1 }]}>
              <Text style={{ color: period === item.id ? colors.onYellow : colors.textSecondary, fontFamily: font.bold }}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
          {tiles.map((tile) => (
            <View key={tile.label} style={{ flexGrow: 1, flexBasis: '46%', backgroundColor: colors.card, borderRadius: 20, padding: 14, minHeight: 92, gap: 6 }}>
              <Ionicons name={tile.icon as 'flash'} size={18} color={tile.color} />
              <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 26 }}>{tile.value}</Text>
              <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>{tile.label}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 20, marginTop: 22, marginBottom: 4 }}>Your growth</Text>
        <Radar scores={model.scores} colors={colors} />
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 20, marginTop: 22 }}>Activity</Text>
        <Bars items={model.activity} colors={colors} />
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 20, marginTop: 22 }}>Goals</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: font.regular, marginTop: 6, lineHeight: 22 }}>
          {model.goalRate.total === 0 ? 'Goals you create will show up here.' : `${model.goalRate.done} of ${model.goalRate.total} goals complete.`}
        </Text>
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 20, marginTop: 22 }}>Recent XP</Text>
        <View style={{ marginTop: 8, gap: 8 }}>
          {model.recent.length === 0 ? <Text style={{ color: colors.textSecondary, fontFamily: font.regular }}>XP you earn will be listed here.</Text> : model.recent.map((row) => (
            <View key={row.id} style={{ minHeight: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <Text style={{ color: colors.text, fontFamily: font.medium, flex: 1 }}>{row.reason}</Text>
              <Text style={{ color: colors.yellow, fontFamily: font.bold }}>+{row.amount}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: colors.textSecondary, fontFamily: font.regular, marginTop: 18 }}>Level {model.level} · {model.into} / {model.need} XP inside this level. Total {model.totalXp} XP.</Text>
      </ScrollView>
    </View>
  );
}
