import { router } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MissionRow } from '../../components/Chrome';
import { LoopView } from '../../components/LoopView';
import { homeLine, suggestedTitle } from '../../engine/recommendations';
import { levelFromTotal, sumXp, xpFor } from '../../engine/progression';
import { progressModel } from '../../engine/selectors';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bundle, completeMission } = useApp();
  if (!bundle) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const model = progressModel(bundle, 'all');
  const level = levelFromTotal(sumXp(bundle.transactions));
  const today = model.todayMissions;
  const done = today.filter((mission) => mission.status === 'complete').length;
  const line = homeLine({
    completedEver: bundle.missions.filter((mission) => mission.status === 'complete').length,
    pendingGap: model.pendingGap,
    openToday: today.length - done,
    doneToday: done,
  });
  const suggestion = suggestedTitle(today, bundle.loop.skill);
  const upcoming = bundle.missions.find((mission) => mission.status === 'open' && mission.day > model.today && mission.difficulty === 'weekly');
  return (
    <View collapsable={false} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: insets.bottom + 110, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPressIn={() => router.navigate('/(tabs)/profile')} style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}>
            {bundle.user.avatarUri ? <Image source={{ uri: bundle.user.avatarUri }} style={{ width: 44, height: 44 }} /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="person" size={18} color={colors.text} /></View>}
          </Pressable>
          <Text style={{ color: colors.text, fontFamily: font.extra, letterSpacing: 3, fontSize: 16 }}>LEVELUP</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Notices" onPressIn={() => router.push('/inbox')} style={({ pressed }) => [{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {bundle.notices.some((notice) => !notice.read) ? <View style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.yellow }} /> : null}
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>Level {level.level}</Text>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.card, marginTop: 8 }}>
              <View style={{ width: `${Math.max(4, (level.into / level.need) * 100)}%`, height: 8, borderRadius: 4, backgroundColor: colors.yellow }} />
            </View>
            <Text style={{ color: colors.textSecondary, fontFamily: font.medium, marginTop: 6 }}>{level.into} / {level.need} XP</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Streak" onPressIn={() => router.push('/streak')} style={({ pressed }) => [{ minHeight: 44, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 }]}>
            <Text style={{ color: colors.streak, fontFamily: font.bold }}>{model.pendingGap > 0 ? 'Paused' : `${model.streak}`}</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: font.medium, fontSize: 12 }}>{model.pendingGap > 0 ? 'Streak' : 'Day streak'}</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open Loop" onPressIn={() => router.navigate('/(tabs)/loop')} style={{ marginTop: 16, height: 280 }}>
          <Image source={require('../../../assets/scenes/scene-island.jpg')} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} resizeMode="cover" />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 }}>
            <View style={{ backgroundColor: 'rgba(16,13,29,0.78)', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 4, maxWidth: 280 }}>
              <Text style={{ color: '#FFFFFF', fontFamily: font.semibold, textAlign: 'center' }}>{line}</Text>
            </View>
            <LoopView visual={bundle.loop.mood} skin={bundle.loop.skin} accessory={bundle.loop.accessory} size={170} />
          </View>
        </Pressable>
        <View style={{ paddingHorizontal: 20, marginTop: 18, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 20 }}>Today's missions</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>{done}/{today.length || 0}</Text>
          </View>
          {today.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>Nothing is scheduled today. A new set appears when the current days are finished.</Text>
          ) : (
            today.map((mission) => (
              <MissionRow
                key={mission.id}
                mission={mission}
                colors={colors}
                onOpen={() => router.push(`/mission/${mission.id}`)}
                onComplete={() => {
                  void completeMission(mission.id).then((result) => {
                    if (bundle.onboarding.completed && (result.leveledUp || result.unlocked.length)) {
                      router.push({ pathname: '/celebration', params: { level: result.leveledUp ? String(result.level) : '', achievement: result.unlocked[0]?.title ?? '', xp: String(result.xp) } });
                    }
                  });
                }}
              />
            ))
          )}
          {suggestion ? <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>Loop suggests {suggestion}.</Text> : null}
          <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 18, marginTop: 8 }}>This week</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {model.weekStrip.map((day) => (
              <View key={day.day} style={{ alignItems: 'center', gap: 6, minWidth: 36 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: day.done ? colors.yellow : colors.card, borderWidth: day.isToday ? 2 : 0, borderColor: colors.purple }} />
                <Text style={{ color: colors.textSecondary, fontFamily: font.medium, fontSize: 12 }}>{day.label}</Text>
              </View>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPressIn={() => router.push('/achievements')} style={({ pressed }) => [{ minHeight: 64, borderRadius: 18, backgroundColor: colors.card, padding: 14, justifyContent: 'center', opacity: pressed ? 0.75 : 1 }]}>
            <Text style={{ color: colors.text, fontFamily: font.bold }}>Achievements · {bundle.achievements.length}</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: font.regular, marginTop: 2 }}>{level.need - level.into} XP to level {level.level + 1}</Text>
          </Pressable>
          {upcoming ? (
            <View style={{ borderRadius: 18, padding: 14, backgroundColor: colors.bgElevated }}>
              <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>Upcoming challenge</Text>
              <Text style={{ color: colors.text, fontFamily: font.bold, marginTop: 4 }}>{upcoming.title}</Text>
              <Text style={{ color: colors.yellow, fontFamily: font.bold, marginTop: 4 }}>+{xpFor(upcoming.difficulty)} XP · {upcoming.day}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
