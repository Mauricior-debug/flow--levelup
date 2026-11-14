import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { LoopView } from '../../components/LoopView';
import { inputStyle } from '../../components/Chrome';
import { PET_EYE_COLORS, PET_GLOW_COLORS } from '../../engine/catalog';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function CreateLoopScreen() {
  const colors = useColors();
  const { bundle, saveCustomPet } = useApp();
  const [name, setName] = useState(bundle?.loop.petName ?? '');
  const [eye, setEye] = useState(bundle?.loop.eyeColor ?? PET_EYE_COLORS[0]);
  const [glow, setGlow] = useState(bundle?.loop.glowColor ?? PET_GLOW_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>
        The four looks stay. This one is yours: a name, an eye light, and a glow that follows this Loop.
      </Text>
      <View style={{ alignItems: 'center' }}>
        <LoopView visual="happy" skin="custom" eyeColor={eye} glowColor={glow} size={200} />
      </View>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor={colors.textSecondary}
        style={inputStyle(colors)}
        maxLength={16}
        autoCapitalize="words"
      />
      <Text style={{ color: colors.text, fontFamily: font.bold }}>Eye light</Text>
      <Swatches colors={PET_EYE_COLORS} selected={eye} onSelect={setEye} border={colors.text} />
      <Text style={{ color: colors.text, fontFamily: font.bold }}>Glow</Text>
      <Swatches colors={PET_GLOW_COLORS} selected={glow} onSelect={setGlow} border={colors.text} />
      {error ? <Text style={{ color: colors.danger, fontFamily: font.medium }}>{error}</Text> : null}
      <Button
        colors={colors}
        label="This is my Loop"
        busy={busy}
        onPress={() => {
          setBusy(true);
          setError(null);
          void saveCustomPet({ name, eyeColor: eye, glowColor: glow })
            .then(() => router.back())
            .catch((caught) => {
              setError(caught instanceof Error ? caught.message : 'Your Loop could not be saved.');
              setBusy(false);
            });
        }}
      />
    </ScrollView>
  );
}

function Swatches({ colors, selected, onSelect, border }: { colors: readonly string[]; selected: string; onSelect: (color: string) => void; border: string }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {colors.map((color) => (
        <Pressable
          key={color}
          accessibilityRole="button"
          accessibilityLabel={color}
          accessibilityState={{ selected: selected === color }}
          onPress={() => onSelect(color)}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color, borderWidth: selected === color ? 3 : 0, borderColor: border }}
        />
      ))}
    </View>
  );
}
