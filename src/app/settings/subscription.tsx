import { ScrollView, Text, View } from 'react-native';
import { LOOK_DEFS } from '../../engine/catalog';
import { bondLevel, levelFromTotal, sumXp } from '../../engine/progression';
import { lookUnlocked } from '../../engine/loop';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function SubscriptionScreen() {
  const colors = useColors();
  const bundle = useApp().bundle;
  const level = bundle ? levelFromTotal(sumXp(bundle.transactions)).level : 1;
  const bond = bundle ? bondLevel(bundle.loop.bondXp).level : 1;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>This device</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>
        There is no paid plan in this build. Every feature here is included. Looks open as you and Loop grow. Premium cosmetics are not for sale.
      </Text>
      {LOOK_DEFS.map((look) => {
        const open = bundle ? lookUnlocked(look.id, bundle.loop.bondXp, level) : look.id === 'classic';
        return (
          <View key={look.id} style={{ paddingVertical: 8 }}>
            <Text style={{ color: colors.text, fontFamily: font.bold }}>{look.name}</Text>
            <Text style={{ color: open ? colors.success : colors.textSecondary, fontFamily: font.medium }}>{open ? 'Unlocked' : `Bond ${look.bond} · level ${look.level}`}</Text>
          </View>
        );
      })}
      <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>Bond level {bond}. Player level {level}.</Text>
    </ScrollView>
  );
}
