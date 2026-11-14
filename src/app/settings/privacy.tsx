import { ScrollView, Text, View } from 'react-native';
import { Choice } from '../../components/Chrome';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function PrivacySettings() {
  const colors = useColors();
  const { bundle, updateSettings } = useApp();
  const share = bundle?.settings.shareProgress ?? true;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>Privacy</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>Your goals, missions, and chats stay on this device. Loop answers from what you have saved here.</Text>
      <View style={{ gap: 10 }}>
        <Choice colors={colors} title="Include level and streak when I share" selected={share} onPress={() => { void updateSettings({ shareProgress: !share }); }} />
      </View>
    </ScrollView>
  );
}
