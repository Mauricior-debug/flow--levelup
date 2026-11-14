import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { LoopView, type LoopVisual } from '../../components/LoopView';
import { ACCESSORY_DEFS, ENVIRONMENT_DEFS, LOOK_DEFS, SKILL_DEFS } from '../../engine/catalog';
import { accessoryUnlocked, environmentUnlocked, skillUnlocked } from '../../engine/loop';
import { bondLevel, levelFromTotal, sumXp } from '../../engine/progression';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

const SCENES = {
  island: require('../../../assets/scenes/scene-island.jpg'),
  bedroom: require('../../../assets/scenes/scene-bedroom.jpg'),
  summit: require('../../../assets/scenes/scene-mountains.jpg'),
};

const LOOK_ART = {
  classic: require('../../../assets/loop/skin-classic.png'),
  explorer: require('../../../assets/loop/skin-explorer.png'),
  cyber: require('../../../assets/loop/skin-cyber.png'),
  galaxy: require('../../../assets/loop/skin-galaxy.png'),
} as const;

export default function LoopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tile = (Math.min(width, 560) - 40 - 12) / 2;
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
        <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 22, textAlign: 'center', paddingTop: insets.top + 10 }}>
          {bundle.loop.skin === 'custom' && bundle.loop.petName ? bundle.loop.petName : 'Loop'}
        </Text>
        <View style={{ height: 320, marginTop: 12 }}>
          <Image source={SCENES[scene]} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <LoopView visual={visual} skin={bundle.loop.skin} accessory={bundle.loop.accessory} eyeColor={bundle.loop.eyeColor} glowColor={bundle.loop.glowColor} size={210} />
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
              <Pressable key={item} accessibilityRole="button" onPress={() => setTab(item)} style={({ pressed }) => [{ flex: 1, minHeight: 44, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === item ? colors.yellow : 'transparent', opacity: pressed ? 0.75 : 1 }]}>
                <Text style={{ color: tab === item ? colors.onYellow : colors.text, fontFamily: font.bold, textTransform: 'capitalize' }}>{item}</Text>
              </Pressable>
            ))}
          </View>
          {tab === 'looks' ? (
            <View style={{ gap: 12 }}>
              <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 20 }}>Tap a Loop to wear it.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {LOOK_DEFS.map((look) => {
                  const equipped = bundle.loop.skin === look.id;
                  return (
                    <Pressable
                      key={look.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: equipped }}
                      accessibilityLabel={`${look.name}${equipped ? ', wearing' : ''}`}
                      onPress={() => {
                        void equipLoop({ skin: look.id }).then((message) => setNote(message ?? `Wearing ${look.name}`));
                      }}
                      style={({ pressed }) => [{ width: tile, borderRadius: 22, padding: 10, backgroundColor: colors.card, borderWidth: 2, borderColor: equipped ? colors.yellow : colors.line, opacity: pressed ? 0.82 : 1 }]}
                    >
                      <Image source={LOOK_ART[look.id as keyof typeof LOOK_ART]} style={{ width: '100%', height: tile * 0.92, borderRadius: 16 }} resizeMode="contain" accessibilityIgnoresInvertColors />
                      <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 16, marginTop: 8 }}>{look.name}</Text>
                      <Text style={{ color: equipped ? colors.yellow : colors.textSecondary, fontFamily: font.medium, marginTop: 2 }}>{equipped ? 'Wearing' : look.detail}</Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: bundle.loop.skin === 'custom' }}
                  accessibilityLabel={bundle.loop.petName ? `${bundle.loop.petName}, your Loop` : 'Create your Loop'}
                  onPress={() => {
                    if (!bundle.loop.petName) {
                      router.push('/loop/create');
                      return;
                    }
                    void equipLoop({ skin: 'custom' }).then((message) => setNote(message ?? `Wearing ${bundle.loop.petName}`));
                  }}
                  style={({ pressed }) => [{ width: tile, borderRadius: 22, padding: 10, backgroundColor: colors.card, borderWidth: 2, borderColor: bundle.loop.skin === 'custom' ? colors.yellow : colors.line, opacity: pressed ? 0.82 : 1, alignItems: 'center' }]}
                >
                  <LoopView visual="happy" skin="custom" eyeColor={bundle.loop.eyeColor ?? '#FFE45C'} glowColor={bundle.loop.glowColor ?? '#A78BFA'} size={tile * 0.92} />
                  <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 16, marginTop: 8, alignSelf: 'flex-start' }}>{bundle.loop.petName ?? 'Yours'}</Text>
                  <Text style={{ color: bundle.loop.skin === 'custom' ? colors.yellow : colors.textSecondary, fontFamily: font.medium, marginTop: 2, alignSelf: 'flex-start' }}>
                    {bundle.loop.skin === 'custom' ? 'Wearing' : bundle.loop.petName ? 'Your Loop' : 'Make one'}
                  </Text>
                </Pressable>
              </View>
              <Button colors={colors} tone="secondary" label={bundle.loop.petName ? 'Edit your Loop' : 'Create your Loop'} onPress={() => router.push('/loop/create')} />
            </View>
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

function Card({ title, detail, selected, onPress, colors, wide = false }: { title: string; detail: string; selected: boolean; onPress: () => void; colors: ReturnType<typeof useColors>; wide?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [{ width: wide ? '100%' : 168, minHeight: 88, borderRadius: 18, padding: 12, backgroundColor: colors.card, borderWidth: 1.5, borderColor: selected ? colors.yellow : colors.line, opacity: pressed ? 0.75 : 1 }]}>
      <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 16 }}>{title}</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, marginTop: 6, lineHeight: 18 }}>{detail}</Text>
    </Pressable>
  );
}
