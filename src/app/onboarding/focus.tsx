import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Button } from '../../components/Button';
import { BackButton, Choice, ProgressHeader } from '../../components/Chrome';
import { CATEGORIES } from '../../engine/catalog';
import type { CategoryId } from '../../engine/types';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function FocusScreen() {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const { bundle, saveOnboarding } = useApp();
  const [selected, setSelected] = useState<CategoryId[]>(bundle?.onboarding.categories ?? []);
  const col = Math.min(560, width) - 40;
  const card = (col - 12) / 2;
  const toggle = (id: CategoryId) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ProgressHeader step={2} total={6} colors={colors} />
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <BackButton colors={colors} onPress={() => router.back()} />
        <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 30, lineHeight: 36 }}>What would you like to improve in your life?</Text>
        <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 15, marginTop: 8, marginBottom: 16 }}>Choose what matters most to you right now.</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {CATEGORIES.map((category) => (
            <View key={category.id} style={{ width: card }}>
              <Choice
                colors={colors}
                title={category.title.split(' ')[0] ?? category.title}
                detail={category.detail}
                icon={category.icon as 'book-outline'}
                selected={selected.includes(category.id)}
                onPress={() => toggle(category.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ padding: 20 }}>
        <Button
          colors={colors}
          label="Continue"
          arrow
          disabled={selected.length === 0}
          onPress={() => {
            void saveOnboarding({ categories: selected, step: 'situation' });
            router.push('/onboarding/situation');
          }}
        />
      </View>
    </View>
  );
}
