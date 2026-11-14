import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { monthMatrix, todayKey } from '../engine/dates';
import { useApp } from '../state/AppContext';
import { font } from '../theme/colors';
import { useColors } from '../theme/Theme';
import { progressModel } from '../engine/selectors';

export default function StreakSheet() {
  const colors = useColors();
  const { bundle, updateSettings } = useApp();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  if (!bundle) return <View style={{ flex: 1, backgroundColor: colors.bgElevated }} />;
  const model = progressModel(bundle, 'all');
  const done = new Set(bundle.missions.filter((mission) => mission.status === 'complete').map((mission) => mission.day));
  const weeks = monthMatrix(cursor.year, cursor.month);
  const today = todayKey();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bgElevated }} contentContainerStyle={{ padding: 22, gap: 14 }}>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>{model.pendingGap > 0 ? 'Streak paused' : `${model.streak}-day streak`}</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>
        {model.pendingGap > 1
          ? 'Welcome back. We’ll start from today. Nothing to catch up.'
          : model.canRecover
            ? 'You were away yesterday. Your streak can wait. Reconnect it, or let today be a fresh start.'
            : 'A finished mission marks the day. Missing one does not erase the work you already did.'}
      </Text>
      {model.canRecover ? (
        <View style={{ gap: 8 }}>
          <Button colors={colors} label={bundle.settings.recoveryArmed ? 'Yesterday will count' : 'Reconnect yesterday'} disabled={bundle.settings.recoveryArmed} onPress={() => { void updateSettings({ recoveryArmed: true }); }} />
          <Button colors={colors} tone="secondary" label="Start fresh" onPress={() => { void updateSettings({ recoveryArmed: false }); }} />
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 18 }}>{new Date(cursor.year, cursor.month - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' })}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button colors={colors} tone="secondary" label="Prev" onPress={() => setCursor((current) => current.month === 1 ? { year: current.year - 1, month: 12 } : { year: current.year, month: current.month - 1 })} />
          <Button colors={colors} tone="secondary" label="Next" onPress={() => setCursor((current) => current.month === 12 ? { year: current.year + 1, month: 1 } : { year: current.year, month: current.month + 1 })} />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => <Text key={label + index} style={{ flex: 1, textAlign: 'center', color: colors.textSecondary, fontFamily: font.medium }}>{label}</Text>)}
      </View>
      {weeks.map((week, index) => (
        <View key={index} style={{ flexDirection: 'row' }}>
          {week.map((day, dayIndex) => (
            <View key={day ?? `empty-${dayIndex}`} style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              {day ? <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: done.has(day) ? colors.yellow : 'transparent', borderWidth: day === today ? 1 : 0, borderColor: colors.purple }}><Text style={{ color: done.has(day) ? colors.onYellow : colors.text, fontFamily: font.medium }}>{Number(day.slice(-2))}</Text></View> : null}
            </View>
          ))}
        </View>
      ))}
      <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>Best streak {bundle.settings.bestStreak} days.</Text>
    </ScrollView>
  );
}
