import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { paletteFor, font, type Palette } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  colors: Palette;
  disabled?: boolean;
  busy?: boolean;
  tone?: 'primary' | 'secondary' | 'ghost';
  arrow?: boolean;
};

export function Button({ label, onPress, colors, disabled, busy, tone = 'primary', arrow }: Props) {
  const blocked = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!blocked }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        tone === 'primary' && { backgroundColor: pressed ? colors.yellowPressed : colors.yellow },
        tone === 'secondary' && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
        tone === 'ghost' && { backgroundColor: 'transparent' },
        pressed && !blocked && styles.pressed,
        blocked && styles.disabled,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={tone === 'primary' ? colors.onYellow : colors.text} />
      ) : (
        <Text
          maxFontSizeMultiplier={1.3}
          style={[
            styles.label,
            { color: tone === 'primary' ? colors.onYellow : colors.text },
          ]}
        >
          {label}
          {arrow ? '  →' : ''}
        </Text>
      )}
    </Pressable>
  );
}

export function IconButton({
  label,
  onPress,
  children,
  colors = paletteFor('dark'),
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
  colors?: Palette;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.icon, pressed && { opacity: 0.55, transform: [{ scale: 0.96 }] }]}
    >
      <View>{children}</View>
      <Text style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}>{colors.bg}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  pressed: { transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.42 },
  label: { fontFamily: font.bold, fontSize: 17, letterSpacing: 0.1 },
  icon: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
