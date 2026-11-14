import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { EmptyBlock } from '../../components/Chrome';
import { goalRecommendation } from '../../engine/recommendations';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bundle } = useApp();
  const goals = (bundle?.goals ?? []).filter((goal) => goal.origin === 'user');
  return (
    <View collapsable={false} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 120, paddingHorizontal: 20, width: '100%', maxWidth: 560, alignSelf: 'center' }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 32 }}>Goals</Text>
            {bundle ? <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>{goalRecommendation(bundle.onboarding, bundle.goals)}</Text> : null}
            <Button colors={colors} label="New goal" onPress={() => router.push('/goal/new')} />
          </View>
        }
        ListEmptyComponent={<EmptyBlock colors={colors} title="No goals yet" body="A goal gives your daily missions a place to land. Start with one target you can count." />}
        renderItem={({ item }) => {
          const ratio = item.targetValue === 0 ? 0 : Math.min(1, item.currentValue / item.targetValue);
          return (
            <Pressable accessibilityRole="button" onPressIn={() => router.push(`/goal/${item.id}`)} style={({ pressed }) => [{ marginBottom: 12, borderRadius: 20, backgroundColor: colors.card, padding: 16, gap: 8, opacity: pressed ? 0.75 : 1 }]}>
              <Text style={{ color: colors.textSecondary, fontFamily: font.medium, textTransform: 'capitalize' }}>{item.horizon.replace('_', ' ')} · {item.category}</Text>
              <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 18 }}>{item.title}</Text>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bg }}>
                <View style={{ width: `${ratio * 100}%`, height: 8, borderRadius: 4, backgroundColor: item.status === 'complete' ? colors.success : colors.yellow }} />
              </View>
              <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>{item.currentValue} / {item.targetValue} {item.unit}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
