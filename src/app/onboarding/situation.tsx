import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { BackButton, Choice, ProgressHeader } from '../../components/Chrome';
import { changeOptions, challengeOptions, CONSISTENCY, ROUTINES } from '../../engine/catalog';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function SituationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bundle, saveOnboarding } = useApp();
  const categories = bundle?.onboarding.categories ?? [];
  const questions = [
    { key: 'routine' as const, prompt: 'How would you describe your current routine?', options: ROUTINES },
    { key: 'consistency' as const, prompt: 'How consistent are you with your goals?', options: CONSISTENCY },
    { key: 'challenge' as const, prompt: 'What is your biggest challenge?', options: challengeOptions(categories) },
    { key: 'changeWish' as const, prompt: 'What would you most like to change?', options: changeOptions(categories) },
  ];
  const initial = questions.findIndex((question) => !bundle?.onboarding[question.key]);
  const [index, setIndex] = useState(initial === -1 ? 0 : initial);
  const question = questions[index] ?? questions[0];
  const [answer, setAnswer] = useState<string | null>(bundle?.onboarding[question.key] ?? null);
  const go = (nextIndex: number) => {
    const next = questions[nextIndex];
    setIndex(nextIndex);
    setAnswer(next ? bundle?.onboarding[next.key] ?? null : null);
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ProgressHeader step={3} total={6} colors={colors} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <BackButton
          colors={colors}
          onPress={() => {
            if (index === 0) router.back();
            else go(index - 1);
          }}
        />
        <Text style={{ color: colors.textSecondary, fontFamily: font.medium, marginBottom: 8 }}>Question {index + 1} of {questions.length}</Text>
        <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 30, lineHeight: 36, marginBottom: 18 }}>{question.prompt}</Text>
        <View style={{ gap: 12 }}>
          {question.options.map((option) => (
            <Choice key={option} colors={colors} title={option} selected={answer === option} onPress={() => setAnswer(option)} />
          ))}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 12 }}>
        <Button
          colors={colors}
          label={index === questions.length - 1 ? 'Continue' : 'Next'}
          arrow
          disabled={!answer}
          onPress={() => {
            if (!answer) return;
            const patch = { [question.key]: answer };
            if (index === questions.length - 1) {
              void saveOnboarding({ ...patch, step: 'time' });
              router.push('/onboarding/time');
            } else {
              void saveOnboarding(patch);
              const following = questions[index + 1];
              setIndex(index + 1);
              setAnswer(following ? bundle?.onboarding[following.key] ?? null : null);
            }
          }}
        />
      </View>
    </View>
  );
}
