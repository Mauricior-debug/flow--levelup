import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { font, type Palette } from '../theme/colors';
import { xpFor } from '../engine/progression';
import type { Mission } from '../engine/types';

export function Mark({ size = 36, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size * 0.72} viewBox="0 0 64 46">
      <Path d="M32 3 L56 43 H43 L32 22 L21 43 H8 Z" fill={color} />
    </Svg>
  );
}

export function Wordmark({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Mark color={color} />
      <Text style={{ color, fontFamily: font.extra, letterSpacing: 4, fontSize: 22 }}>LEVELUP</Text>
    </View>
  );
}

export function Screen({
  colors,
  children,
  footer,
  top = true,
}: {
  colors: Palette;
  children: ReactNode;
  footer?: ReactNode;
  top?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: top ? insets.top + 12 : 12,
          paddingBottom: 24,
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
        }}
      >
        {children}
      </ScrollView>
      {footer ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 12, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

export function ProgressHeader({ step, total, colors }: { step: number; total: number; colors: Palette }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.line, marginRight: 12 }}>
          <View style={{ width: `${Math.max(8, (step / total) * 100)}%`, height: 4, borderRadius: 2, backgroundColor: colors.yellow }} />
        </View>
        <Text style={{ color: colors.textSecondary, fontFamily: font.medium, fontSize: 13 }}>
          Step {step} of {total}
        </Text>
      </View>
    </View>
  );
}

export function BackButton({ onPress, colors }: { onPress: () => void; colors: Palette }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      style={({ pressed }) => [styles.back, { opacity: pressed ? 0.55 : 1 }]}
    >
      <Ionicons name="chevron-back" size={26} color={colors.text} />
    </Pressable>
  );
}

export function Choice({
  title,
  detail,
  selected,
  onPress,
  colors,
  icon,
}: {
  title: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  colors: Palette;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.yellow : colors.line,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={22} color={selected ? colors.yellow : colors.purple} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 16 }}>{title}</Text>
        {detail ? <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 13, marginTop: 2 }}>{detail}</Text> : null}
      </View>
      {selected ? (
        <View style={[styles.check, { backgroundColor: colors.yellow }]}>
          <Ionicons name="checkmark" size={16} color={colors.onYellow} />
        </View>
      ) : (
        <View style={[styles.check, { borderWidth: 1, borderColor: colors.line }]} />
      )}
    </Pressable>
  );
}

export function MissionRow({ mission, colors, onOpen, onComplete }: { mission: Mission; colors: Palette; onOpen: () => void; onComplete: () => void }) {
  const done = mission.status === 'complete';
  const icon = mission.category === 'fitness' ? 'barbell-outline' : mission.category === 'learning' ? 'book-outline' : mission.category === 'money' ? 'wallet-outline' : mission.category === 'business' ? 'briefcase-outline' : mission.category === 'mindset' ? 'sparkles-outline' : 'leaf-outline';
  return (
    <View style={[styles.mission, { backgroundColor: colors.bgElevated }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={mission.title} onPress={onOpen} style={({ pressed }) => [styles.missionMain, { opacity: pressed ? 0.7 : 1 }]}>
        <View style={[styles.missionIcon, { backgroundColor: colors.card }]}>
          <Ionicons name={icon} size={18} color={colors.purple} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: done ? colors.textSecondary : colors.text, fontFamily: font.semibold, fontSize: 15, textDecorationLine: done ? 'line-through' : 'none' }}>{mission.title}</Text>
          <Text style={{ color: colors.yellow, fontFamily: font.bold, fontSize: 13, marginTop: 2 }}>+{xpFor(mission.difficulty)} XP</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={done ? 'Completed' : `Complete ${mission.title}`}
        disabled={done}
        onPress={done ? undefined : onComplete}
        style={({ pressed }) => [styles.complete, { borderColor: done ? colors.success : colors.line, backgroundColor: done ? colors.success : 'transparent', opacity: pressed ? 0.7 : 1 }]}
      >
        {done ? <Ionicons name="checkmark" size={18} color={colors.onYellow} /> : null}
      </Pressable>
    </View>
  );
}

export function Field({
  label,
  colors,
  children,
}: {
  label: string;
  colors: Palette;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colors.textSecondary, fontFamily: font.medium, fontSize: 13 }}>{label}</Text>
      {children}
    </View>
  );
}

export function inputStyle(colors: Palette) {
  return {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.line,
  } as const;
}

export function EmptyBlock({ title, body, colors }: { title: string; body: string; colors: Palette }) {
  return (
    <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 18 }}>{title}</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 15, lineHeight: 22 }}>{body}</Text>
    </View>
  );
}

export function ErrorBlock({ message, colors, onRetry }: { message: string; colors: Palette; onRetry?: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
      <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 22, textAlign: 'center' }}>Something went wrong</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 16, textAlign: 'center', lineHeight: 22 }}>{message}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [{ minHeight: 48, justifyContent: 'center' }, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={{ color: colors.yellow, fontFamily: font.bold, fontSize: 16 }}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  choice: { minHeight: 76, borderRadius: 20, borderWidth: 1.5, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  mission: { borderRadius: 18, paddingLeft: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
  missionMain: { flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  missionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  complete: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  empty: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 8 },
});
