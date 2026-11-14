import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '../components/Button';
import { LoopView } from '../components/LoopView';
import { useColors } from '../theme/Theme';
import { font } from '../theme/colors';

export default function CelebrationScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ level?: string; achievement?: string; xp?: string }>();
  const level = params.level ? `Level ${params.level}` : null;
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(16,13,29,0.88)', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 }}>
      <LoopView visual="celebrate" size={240} accessory="glow" />
      <Text style={{ color: '#FFFFFF', fontFamily: font.extra, fontSize: 32, textAlign: 'center' }}>{level ?? 'Nice work'}</Text>
      {params.achievement ? <Text style={{ color: colors.yellow, fontFamily: font.bold, fontSize: 18, textAlign: 'center' }}>{params.achievement}</Text> : null}
      {params.xp ? <Text style={{ color: '#FFFFFF', fontFamily: font.medium }}>+{params.xp} XP</Text> : null}
      <View style={{ alignSelf: 'stretch', marginTop: 8 }}>
        <Button colors={colors} label="Keep going" onPress={() => router.back()} />
      </View>
    </View>
  );
}
