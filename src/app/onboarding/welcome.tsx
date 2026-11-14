import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Wordmark } from '../../components/Chrome';
import { LoopView } from '../../components/LoopView';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { startJourney, saveOnboarding, bundle } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Image source={require('../../../assets/scenes/scene-mountains.jpg')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(16,13,29,0.28)' }]} />
      <View style={{ flex: 1, paddingTop: insets.top + 18, paddingHorizontal: 24, paddingBottom: insets.bottom + 16, justifyContent: 'space-between' }}>
        <Wordmark color="#FFFFFF" />
        <View style={{ alignItems: 'center' }}>
          <LoopView visual="idle" size={250} />
          <Text style={styles.kicker}>Level up</Text>
          <Text style={[styles.display, { color: colors.yellow }]}>Your Life</Text>
          <Text style={styles.support}>Build better habits, achieve your goals and unlock your potential. Your little companion is here to help.</Text>
        </View>
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            {[0, 1, 2, 3].map((dot) => (
              <View key={dot} style={{ width: dot === 0 ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: dot === 0 ? colors.yellow : 'rgba(255,255,255,0.45)' }} />
            ))}
          </View>
          <Button
            colors={colors}
            label="Let's Start"
            arrow
            onPress={() => {
              void (async () => {
                if (!bundle) await startJourney();
                else await saveOnboarding({ step: 'meet' });
                router.push('/onboarding/meet');
              })();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { color: '#FFFFFF', fontFamily: font.extra, fontSize: 40, lineHeight: 44, textAlign: 'center' },
  display: { fontFamily: font.extra, fontSize: 40, lineHeight: 44, textAlign: 'center' },
  support: { color: '#FFFFFF', fontFamily: font.regular, fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 12, maxWidth: 320 },
});
