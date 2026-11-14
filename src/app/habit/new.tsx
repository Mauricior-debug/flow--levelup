import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Choice, inputStyle } from '../../components/Chrome';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function NewHabitSheet() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const { createHabit } = useApp();
  const [title, setTitle] = useState('');
  const [cadence, setCadence] = useState<'daily' | 'weekly'>('daily');
  const [error, setError] = useState<string | null>(null);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgElevated, padding: 22, paddingBottom: insets.bottom + 16, gap: 12 }}>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>New habit</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Habit name" placeholderTextColor={colors.textSecondary} style={inputStyle(colors)} />
      <Choice colors={colors} title="Daily" selected={cadence === 'daily'} onPress={() => setCadence('daily')} />
      <Choice colors={colors} title="Weekly" selected={cadence === 'weekly'} onPress={() => setCadence('weekly')} />
      {error ? <Text style={{ color: colors.danger, fontFamily: font.medium }}>{error}</Text> : null}
      <Button colors={colors} label="Save habit" onPress={() => {
        void createHabit({ title, cadence, goalId: goalId ?? null })
          .then(() => router.back())
          .catch((caught) => setError(caught instanceof Error ? caught.message : 'The habit could not be saved.'));
      }} />
    </View>
  );
}
