import { useEffect, useState } from 'react';
import { AccessibilityInfo, Image, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import type { AccessoryId, LookId, Mood } from '../engine/types';

const SPRITE = {
  idle: require('../../assets/loop/loop-idle.png'),
  wave: require('../../assets/loop/loop-wave.png'),
  sleepy: require('../../assets/loop/loop-sleep.png'),
  celebrate: require('../../assets/loop/loop-celebrate.png'),
  thinking: require('../../assets/loop/loop-think.png'),
  sad: require('../../assets/loop/loop-sad.png'),
  excited: require('../../assets/loop/loop-excited.png'),
  talking: require('../../assets/loop/loop-talk.png'),
  welcoming: require('../../assets/loop/loop-encourage.png'),
  encourage: require('../../assets/loop/loop-encourage.png'),
  happy: require('../../assets/loop/loop-idle.png'),
  relaxed: require('../../assets/loop/loop-idle.png'),
};

const SKIN = {
  classic: require('../../assets/loop/skin-classic.png'),
  explorer: require('../../assets/loop/skin-explorer.png'),
  cyber: require('../../assets/loop/skin-cyber.png'),
  galaxy: require('../../assets/loop/skin-galaxy.png'),
};

export type LoopVisual = Mood | 'celebrate' | 'wave' | 'encourage';

export function LoopView({
  visual,
  skin = 'classic',
  accessory = 'none',
  size = 220,
}: {
  visual: LoopVisual;
  skin?: LookId;
  accessory?: AccessoryId;
  size?: number;
}) {
  const [reduce, setReduce] = useState(false);
  const motion = useSharedValue(0);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (live) setReduce(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (reduce) {
      motion.value = 0;
      return;
    }
    const duration = visual === 'excited' || visual === 'celebrate' ? 520 : visual === 'sleepy' ? 2800 : 2400;
    motion.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [motion, reduce, visual]);
  const style = useAnimatedStyle(() => {
    if (visual === 'sleepy') return { transform: [{ scale: 1 + motion.value * 0.035 }] };
    if (visual === 'sad') return { transform: [{ translateY: 8 + motion.value * 2 }, { rotate: '-4deg' }] };
    if (visual === 'thinking') return { transform: [{ rotate: `${-4 + motion.value * 8}deg` }] };
    if (visual === 'excited' || visual === 'celebrate') {
      return { transform: [{ translateY: -10 * motion.value }, { scale: 1 + motion.value * 0.04 }] };
    }
    if (visual === 'wave' || visual === 'welcoming' || visual === 'encourage') {
      return { transform: [{ rotate: `${-3 + motion.value * 6}deg` }, { translateY: -4 * motion.value }] };
    }
    return { transform: [{ translateY: -8 * motion.value }] };
  });
  const calm = visual === 'idle' || visual === 'happy' || visual === 'relaxed';
  const source = calm && skin !== 'classic' ? SKIN[skin] : SPRITE[visual];
  const ring = accessory === 'scarf' ? '#FFB020' : accessory === 'star' ? '#FFE45C' : accessory === 'glow' ? '#A78BFA' : 'transparent';
  return (
    <View accessibilityLabel={`Loop, ${visual}`} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {(visual === 'excited' || visual === 'celebrate' || accessory === 'glow') && !reduce ? <Particles /> : null}
      <Animated.View style={[{ width: size, height: size }, style]}>
        <Image source={source} style={{ width: size, height: size }} resizeMode="contain" accessibilityIgnoresInvertColors />
      </Animated.View>
      {accessory !== 'none' ? <View pointerEvents="none" style={[styles.ring, { borderColor: ring, width: size * 0.78, height: size * 0.78, borderRadius: size }]} /> : null}
      {accessory === 'star' ? <View style={styles.star} accessibilityElementsHidden><View style={styles.starCore} /></View> : null}
      {visual === 'sleepy' ? <Zzz /> : null}
      {visual === 'thinking' ? <Dots /> : null}
    </View>
  );
}

function Particles() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {['#FFE45C', '#A78BFA', '#60A5FA', '#FFE45C', '#FFFFFF'].map((color, index) => (
        <Particle key={color + index} color={color} index={index} />
      ))}
    </View>
  );
}

function Particle({ color, index }: { color: string; index: number }) {
  const value = useSharedValue(0);
  useEffect(() => {
    value.value = withDelay(index * 120, withRepeat(withTiming(1, { duration: 1400 }), -1, true));
  }, [index, value]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + value.value * 0.7,
    transform: [{ translateY: -18 * value.value }, { scale: 0.6 + value.value * 0.6 }],
  }));
  const positions = [
    { left: '12%', top: '18%' },
    { right: '10%', top: '22%' },
    { left: '20%', bottom: '16%' },
    { right: '18%', bottom: '20%' },
    { left: '46%', top: '8%' },
  ] as const;
  return <Animated.View style={[styles.dot, { backgroundColor: color }, positions[index], style]} />;
}

function Zzz() {
  const value = useSharedValue(0);
  useEffect(() => {
    value.value = withRepeat(withSequence(withTiming(1, { duration: 1600 }), withTiming(0, { duration: 400 })), -1, false);
  }, [value]);
  const style = useAnimatedStyle(() => ({ opacity: 1 - value.value * 0.2, transform: [{ translateY: -12 * value.value }] }));
  return (
    <Animated.Text style={[styles.zzz, style]} accessibilityElementsHidden>
      z z
    </Animated.Text>
  );
}

function Dots() {
  return (
    <View style={styles.dots} accessibilityElementsHidden>
      <View style={styles.dotSmall} />
      <View style={styles.dotSmall} />
      <View style={styles.dotSmall} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', borderWidth: 2 },
  star: { position: 'absolute', right: '18%', bottom: '22%', width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  starCore: { width: 12, height: 12, backgroundColor: '#FFE45C', transform: [{ rotate: '45deg' }] },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  zzz: { position: 'absolute', right: 8, top: 12, color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  dots: { position: 'absolute', top: 8, right: 12, flexDirection: 'row', gap: 4 },
  dotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFE45C' },
});
