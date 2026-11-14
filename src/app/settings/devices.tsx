import { ScrollView, Text } from 'react-native';
import { EmptyBlock } from '../../components/Chrome';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function DevicesScreen() {
  const colors = useColors();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>Connected devices</Text>
      <EmptyBlock colors={colors} title="Nothing is connected" body="Apple Health and wearables need system access this Expo Go build does not include. LEVELUP is not reading steps, sleep, or other devices." />
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>Your missions stay manual, so a missing watch never blocks a day.</Text>
    </ScrollView>
  );
}
