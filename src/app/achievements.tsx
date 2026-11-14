import { FlatList, Text, View } from 'react-native';
import { ACHIEVEMENTS } from '../engine/achievements';
import { useApp } from '../state/AppContext';
import { font } from '../theme/colors';
import { useColors } from '../theme/Theme';

export default function AchievementsScreen() {
  const colors = useColors();
  const unlocked = new Set(useApp().bundle?.achievements.map((item) => item.key) ?? []);
  return (
    <View collapsable={false} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={ACHIEVEMENTS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        renderItem={({ item }) => {
          const open = unlocked.has(item.key);
          return (
            <View style={{ borderRadius: 18, padding: 16, backgroundColor: colors.card, gap: 4, opacity: open ? 1 : 0.55 }}>
              <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>{item.group}</Text>
              <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 18 }}>{item.title}</Text>
              <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 21 }}>{open ? item.detail : 'Still ahead.'}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}
