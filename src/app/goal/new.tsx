import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { Choice, inputStyle } from '../../components/Chrome';
import { CATEGORIES } from '../../engine/catalog';
import type { CategoryId, Horizon } from '../../engine/types';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

const HORIZONS: { id: Horizon; label: string }[] = [
  { id: 'daily', label: 'Daily habit' },
  { id: 'weekly', label: 'Weekly habit' },
  { id: 'monthly', label: 'Monthly goal' },
  { id: 'long_term', label: 'Long-term goal' },
];

export default function NewGoalScreen() {
  const colors = useColors();
  const { createGoal, bundle } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>(bundle?.onboarding.categories[0] ?? 'lifestyle');
  const [horizon, setHorizon] = useState<Horizon>('daily');
  const [target, setTarget] = useState('7');
  const [unit, setUnit] = useState('check-ins');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>Each check-in adds 1. Daily and weekly goals also create a habit you can mark.</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor={colors.textSecondary} style={inputStyle(colors)} />
      <TextInput value={description} onChangeText={setDescription} placeholder="What done looks like" placeholderTextColor={colors.textSecondary} style={[inputStyle(colors), { minHeight: 88 }]} multiline />
      <TextInput value={target} onChangeText={setTarget} placeholder="Target" placeholderTextColor={colors.textSecondary} keyboardType="number-pad" style={inputStyle(colors)} />
      <TextInput value={unit} onChangeText={setUnit} placeholder="Unit" placeholderTextColor={colors.textSecondary} style={inputStyle(colors)} />
      <TextInput value={deadline} onChangeText={setDeadline} placeholder="Deadline YYYY-MM-DD, optional" placeholderTextColor={colors.textSecondary} autoCapitalize="none" style={inputStyle(colors)} />
      <Text style={{ color: colors.text, fontFamily: font.bold }}>Category</Text>
      <View style={{ gap: 8 }}>
        {CATEGORIES.map((item) => <Choice key={item.id} colors={colors} title={item.title} selected={category === item.id} onPress={() => setCategory(item.id)} />)}
      </View>
      <Text style={{ color: colors.text, fontFamily: font.bold }}>Horizon</Text>
      <View style={{ gap: 8 }}>
        {HORIZONS.map((item) => <Choice key={item.id} colors={colors} title={item.label} selected={horizon === item.id} onPress={() => setHorizon(item.id)} />)}
      </View>
      {error ? <Text style={{ color: colors.danger, fontFamily: font.medium }}>{error}</Text> : null}
      <Button colors={colors} label="Save goal" onPress={() => {
        const value = Number(target);
        if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
          setError('Use a deadline like 2026-12-01, or leave it blank.');
          return;
        }
        void createGoal({ title, description, category, targetValue: value, unit, deadline: deadline || null, horizon })
          .then(() => router.back())
          .catch((caught) => setError(caught instanceof Error ? caught.message : 'The goal could not be saved.'));
      }} />
    </ScrollView>
  );
}
