import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, PanResponder, ScrollView, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';
import { buzzImpact } from '../../ui/haptics';
import { isoWeekKey, todayKey } from '../../engine/dates';

export default function GoalDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bundle, updateGoalProgress, completeGoal, deleteGoal, checkHabit } = useApp();
  const goal = bundle?.goals.find((item) => item.id === id);
  const habits = (bundle?.habits ?? []).filter((habit) => habit.goalId === id);
  const [draft, setDraft] = useState(goal?.currentValue ?? 0);
  const width = useRef(1);
  const target = useRef(goal?.targetValue ?? 1);
  const goalId = useRef(id);
  target.current = goal?.targetValue ?? 1;
  goalId.current = id;
  const commit = useRef(updateGoalProgress);
  commit.current = updateGoalProgress;
  useEffect(() => {
    if (goal) setDraft(goal.currentValue);
  }, [goal]);
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const max = target.current || 1;
      const next = Math.max(0, Math.min(max, (event.nativeEvent.locationX / width.current) * max));
      setDraft(next);
    },
    onPanResponderMove: (event) => {
      const max = target.current || 1;
      const next = Math.max(0, Math.min(max, (event.nativeEvent.locationX / width.current) * max));
      setDraft(next);
    },
    onPanResponderRelease: (event) => {
      const max = target.current || 1;
      const next = Math.round(Math.max(0, Math.min(max, (event.nativeEvent.locationX / width.current) * max)));
      setDraft(next);
      const currentId = goalId.current;
      if (currentId) void commit.current(currentId, next).then(() => buzzImpact());
    },
  })).current;
  if (!goal) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24 }}>
        <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 22 }}>That goal is not on this device.</Text>
      </View>
    );
  }
  const ratio = goal.targetValue === 0 ? 0 : draft / goal.targetValue;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 14 }}>
      <Text style={{ color: colors.textSecondary, fontFamily: font.medium, textTransform: 'capitalize' }}>{goal.horizon.replace('_', ' ')} · {goal.category}</Text>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 30 }}>{goal.title}</Text>
      {goal.description ? <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>{goal.description}</Text> : null}
      <Text style={{ color: colors.text, fontFamily: font.bold }}>{Math.round(draft)} / {goal.targetValue} {goal.unit}</Text>
      <View
        onLayout={(event) => {
          width.current = event.nativeEvent.layout.width;
        }}
        {...pan.panHandlers}
        style={{ height: 44, justifyContent: 'center' }}
      >
        <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.card }}>
          <View style={{ width: `${Math.min(100, ratio * 100)}%`, height: 12, borderRadius: 6, backgroundColor: colors.yellow }} />
        </View>
      </View>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular }}>Drag the bar. It follows your finger, then saves when you let go.</Text>
      {goal.deadline ? <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>Deadline {goal.deadline}</Text> : null}
      <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 18 }}>Habits</Text>
      {habits.length === 0 ? <Text style={{ color: colors.textSecondary }}>No habit linked yet.</Text> : habits.map((habit) => {
        const today = todayKey();
        const logged = bundle?.habitLogs.some((log) => log.habitId === habit.id && log.day === (habit.cadence === 'weekly' ? isoWeekKey(today) : today));
        return (
          <View key={habit.id} style={{ minHeight: 64, borderRadius: 16, backgroundColor: colors.card, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontFamily: font.semibold }}>{habit.title}</Text>
              <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>{habit.cadence}</Text>
            </View>
            <Button colors={colors} label={logged ? (habit.cadence === 'weekly' ? 'Done this week' : 'Done today') : 'Done'} disabled={logged} onPress={() => { void checkHabit(habit.id); }} />
          </View>
        );
      })}
      <Button colors={colors} tone="secondary" label="Add a habit" onPress={() => router.push({ pathname: '/habit/new', params: { goalId: goal.id } })} />
      {goal.status === 'active' ? <Button colors={colors} label="Mark goal complete" onPress={() => { void completeGoal(goal.id).then((result) => { if (result.leveledUp || result.unlocked.length) router.push({ pathname: '/celebration', params: { level: result.leveledUp ? String(result.level) : '', achievement: result.unlocked[0]?.title ?? '', xp: String(result.xp) } }); }); }} /> : <Text style={{ color: colors.success, fontFamily: font.bold }}>Completed</Text>}
      <Button colors={colors} tone="ghost" label="Delete goal" onPress={() => {
        Alert.alert('Delete this goal?', 'The goal and its habits will be removed from this device.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => { void deleteGoal(goal.id).then(() => router.back()); } },
        ]);
      }} />
    </ScrollView>
  );
}
