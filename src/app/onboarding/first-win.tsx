import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Chrome';
import { LoopView } from '../../components/LoopView';
import { xpFor } from '../../engine/progression';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';
import { inputStyle } from '../../components/Chrome';

export default function FirstWinScreen() {
  const colors = useColors();
  const { bundle, completeMission, saveOnboarding } = useApp();
  const mission = bundle?.missions.find((item) => item.slot === 'show-up' && item.origin === 'user') ?? bundle?.missions.find((item) => item.status === 'open');
  const [done, setDone] = useState(mission?.status === 'complete');
  const [intention, setIntention] = useState(bundle?.onboarding.intention ?? '');
  const [xp, setXp] = useState(0);
  const [error, setError] = useState<string | null>(null);
  return (
    <Screen
      colors={colors}
      footer={
        <Button
          colors={colors}
          label={done ? 'Save my progress' : 'I showed up'}
          arrow
          onPress={() => {
            void (async () => {
              try {
                if (!done) {
                  if (!mission) throw new Error('Your first mission is missing. Go back and let Loop prepare the plan again.');
                  const result = await completeMission(mission.id);
                  if (intention.trim()) await saveOnboarding({ intention: intention.trim() });
                  setXp(result.xp);
                  setDone(true);
                  await saveOnboarding({ step: 'account' });
                } else {
                  router.push('/onboarding/account');
                }
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : 'That mission could not be saved.');
              }
            })();
          }}
        />
      }
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        <LoopView visual={done ? 'celebrate' : 'encourage'} size={220} />
        <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 30, textAlign: 'center' }}>{done ? 'That’s your first XP' : 'A small first win'}</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 16, lineHeight: 23, textAlign: 'center' }}>
          {done
            ? `+${xp || (mission ? xpFor(mission.difficulty) : 25)} XP. First Steps is yours. Save an account so this stays on the device.`
            : mission?.description ?? 'Show up, then Loop will count it.'}
        </Text>
      </View>
      {!done ? (
        <View style={{ marginTop: 22, gap: 8 }}>
          <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 16 }}>{mission?.title}</Text>
          <TextInput
            value={intention}
            onChangeText={setIntention}
            placeholder="One sentence about why, if you want"
            placeholderTextColor={colors.textSecondary}
            style={inputStyle(colors)}
            maxLength={140}
          />
        </View>
      ) : null}
      {error ? <Text style={{ color: colors.danger, marginTop: 12, fontFamily: font.medium }}>{error}</Text> : null}
    </Screen>
  );
}
