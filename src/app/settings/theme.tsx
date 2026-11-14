import { ScrollView, Text, View } from 'react-native';
import { Choice } from '../../components/Chrome';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function ThemeSettings() {
  const colors = useColors();
  const { bundle, updateSettings } = useApp();
  const theme = bundle?.settings.theme ?? 'dark';
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>LEVELUP is built for the dark purple night. Light is here when you want it.</Text>
      <View style={{ gap: 10 }}>
        <Choice colors={colors} title="Dark" detail="Deep navy and yellow" selected={theme === 'dark'} onPress={() => { void updateSettings({ theme: 'dark' }); }} />
        <Choice colors={colors} title="Light" detail="Warm paper and the same yellow" selected={theme === 'light'} onPress={() => { void updateSettings({ theme: 'light' }); }} />
      </View>
    </ScrollView>
  );
}
