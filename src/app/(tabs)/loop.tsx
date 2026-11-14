import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { LoopView, type LoopVisual } from '../../components/LoopView';
import { ACCESSORY_DEFS, ENVIRONMENT_DEFS, LOOK_DEFS, SKILL_DEFS } from '../../engine/catalog';
import { accessoryUnlocked, environmentUnlocked, lookUnlocked, skillUnlocked } from '../../engine/loop';
import { bondLevel, levelFromTotal, sumXp } from '../../engine/progression';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

const SCENES = {
  island: require('../../../assets/scenes/scene-island.jpg'),
  bedroom: require('../../../assets/scenes/scene-bedroom.jpg'),
  summit: require('../../../assets/scenes/scene-mountains.jpg'),
};

export default function LoopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bundle, equipLoop } = useApp();
  const [tab, setTab] = useState<'looks' | 'items' | 'skills'>('looks');
  const [note, setNote] = useState<string | null>(null);
  if (!bundle) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const level = levelFromTotal(sumXp(bundle.transactions)).level;
  const bond = bondLevel(bundle.loop.bondXp);
  const weeklyDone = bundle.missions.some((mission) => mission.status === 'complete' && mission.difficulty === 'weekly');
  const missionCount = bundle.missions.filter((mission) => mission.status === 'complete').length;
  const scene = bundle.loop.mood === 'sleepy' ? 'bedroom' : bundle.loop.environment;
  const visual: LoopVisual = bundle.loop.mood === 'sleepy' ? 'sleepy' : bundle.loop.mood;
  return (
    <View collapsable={false} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 22, textAlign: 'center', paddingTop: insets.top + 10 }}>Loop</Text>
        <View style={{ height: 320, marginTop: 12 }}>
          <Image source={SCENES[scene]} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <LoopView visual={visual} skin={bundle.loop.skin} accessory={bundle.loop.accessory} size={210} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, gap: 8, marginTop: 16 }}>
          <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 18 }}>Bond level {bond.level}</Text>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.card }}>
            <View style={{ width: `${(bond.into / bond.need) * 100}%`, height: 8, borderRadius: 4, backgroundColor: colors.purple }} />
          </View>
          <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>{bond.into} / {bond.need}</Text>
          <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>Your companion, always with you. Keep completing missions, and Loop will grow, unlock new looks and learn new skills.</Text>
          {note ? <Text style={{ color: colors.yellow, fontFamily: font.medium }}>{note}</Text> : null}
          <Button colors={colors} label="Talk with Loop" onPress={() => router.push('/chat')} />
          <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: 22, padding: 4 }}>
            {(['looks', 'items', 'skills'] as const).map((item) => (
              <Pressable key={item} accessibilityRole="button" onPressIn={() => setTab(item)} style={({ pressed }) => [{ flex: 1, minHeight: 44, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === item ? colors.yellow : 'transparent', opacity: pressed ? 0.75 : 1 }]}>
                <Text style={{ color: tab === item ? colors.onYellow : colors.text, fontFamily: font.bold, textTransform: 'capitalize' }}>{item}</Text>
              </Pressable>
            ))}
          </View>
          {tab === 'looks' ? (
            <Row>
              {LOOK_DEFS.map((look) => {
                const open = lookUnlocked(look.id, bundle.loop.bondXp, level);
                const equipped = bundle.loop.skin === look.id;
                return (
                  <Card key={look.id} colors={colors} title={look.name} detail={open ? look.detail : `Opens at bond ${look.bond} and level ${look.level}`} selected={equipped} onPress={() => { void equipLoop({ skin: look.id }).then((message) => setNote(message)); }} />
                );
              })}
            </Row>
          ) : null}
          {tab === 'items' ? (
            <View style={{ gap: 10 }}>
              {ACCESSORY_DEFS.map((item) => {
                const open = accessoryUnlocked(item.id, bundle.loop.bondXp, level, weeklyDone);
                return <Card wide key={item.id} colors={colors} title={item.name} detail={open ? item.detail : item.needsWeekly ? 'Finish a weekly challenge to open this.' : `Opens at bond ${item.bond} and level ${item.level}`} selected={bundle.loop.accessory === item.id} onPress={() => { void equipLoop({ accessory: item.id }).then((message) => setNote(message)); }} />;
              })}
              <Text style={{ color: colors.text, fontFamily: font.bold, marginTop: 8 }}>Places</Text>
              {ENVIRONMENT_DEFS.map((item) => {
                const open = environmentUnlocked(item.id, bundle.loop.bondXp, level);
                return <Card wide key={item.id} colors={colors} title={item.name} detail={open ? item.detail : `Opens at bond ${item.bond} and level ${item.level}`} selected={bundle.loop.environment === item.id} onPress={() => { void equipLoop({ environment: item.id }).then((message) => setNote(message)); }} />;
              })}
            </View>
          ) : null}
          {tab === 'skills' ? (
            <View style={{ gap: 10 }}>
              {SKILL_DEFS.map((skill) => {
                const open = skillUnlocked(skill.id, { missionCount, level, comeback: bundle.settings.comebackUnlocked });
                return <Card wide key={skill.id} colors={colors} title={skill.name} detail={open ? skill.detail : 'This opens as you finish missions, return after time away, or reach a higher level.'} selected={bundle.loop.skill === skill.id} onPress={() => { void equipLoop({ skill: skill.id }).then((message) => setNote(message)); }} />;
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>{children}</ScrollView>;
}

function Card({ title, detail, selected, onPress, colors, wide = false }: { title: string; detail: string; selected: boolean; onPress: () => void; colors: ReturnType<typeof useColors>; wide?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPressIn={onPress} style={({ pressed }) => [{ width: wide ? '100%' : 168, minHeight: 88, borderRadius: 18, padding: 12, backgroundColor: colors.card, borderWidth: 1.5, borderColor: selected ? colors.yellow : colors.line, opacity: pressed ? 0.75 : 1 }]}>
      <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 16 }}>{title}</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, marginTop: 6, lineHeight: 18 }}>{detail}</Text>
    </Pressable>
  );
}
