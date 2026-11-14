import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { BackButton, Screen } from '../../components/Chrome';
import { LoopView } from '../../components/LoopView';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function MeetScreen() {
  const colors = useColors();
  const { saveOnboarding, bundle } = useApp();
  return (
    <Screen
      colors={colors}
      footer={<Button colors={colors} label="Nice to Meet You!" arrow onPress={() => { void saveOnboarding({ step: 'focus' }); router.push('/onboarding/focus'); }} />}
    >
      <BackButton colors={colors} onPress={() => router.back()} />
      <View style={{ alignItems: 'center', gap: 18, paddingTop: 12 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 14, maxWidth: 280 }}>
          <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 18, textAlign: 'center' }}>Hey! I'm Loop.</Text>
        </View>
        <LoopView visual="wave" size={250} />
        <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 17, lineHeight: 25, textAlign: 'center' }}>
          I'll be your personal companion. Together, we're going to do amazing things!
        </Text>
        {bundle?.user.name ? <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}> </Text> : null}
      </View>
    </Screen>
  );
}
