import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polygon, Circle, Text as SvgText } from 'react-native-svg';
import { font, type Palette } from '../theme/colors';

export function Radar({
  scores,
  colors,
}: {
  scores: { id: string; label: string; score: number }[];
  colors: Palette;
}) {
  const [selected, setSelected] = useState(0);
  const size = 250;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const radius = 78;
  const point = (index: number, scale: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / scores.length;
    return [cx + Math.cos(angle) * radius * scale, cy + Math.sin(angle) * radius * scale];
  };
  const polygon = scores.map((score, index) => point(index, Math.max(score.score, 6) / 100).join(',')).join(' ');
  const grid = [0.5, 1].map((scale) => scores.map((_, index) => point(index, scale).join(',')).join(' '));
  const active = scores[selected];
  const empty = scores.every((score) => score.score === 0);
  return (
    <View>
      <Svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`}>
        {grid.map((points) => (
          <Polygon key={points} points={points} fill="none" stroke={colors.line} strokeWidth={1} />
        ))}
        {scores.map((_, index) => {
          const [x, y] = point(index, 1);
          return <Line key={index} x1={cx} y1={cy} x2={x} y2={y} stroke={colors.line} strokeWidth={1} />;
        })}
        {!empty ? <Polygon points={polygon} fill={colors.yellow} fillOpacity={0.35} stroke={colors.yellow} strokeWidth={2} /> : null}
        <Circle cx={cx} cy={cy} r={2} fill={colors.yellow} />
        {scores.map((score, index) => {
          const [x, y] = point(index, 1.28);
          return (
            <SvgText key={score.id} x={x} y={y} fill={index === selected ? colors.yellow : colors.textSecondary} fontSize={12} fontWeight="700" textAnchor="middle">
              {score.label}
            </SvgText>
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {scores.map((score, index) => (
          <Pressable
            key={score.id}
            accessibilityRole="button"
            accessibilityLabel={`${score.label}, ${score.score}`}
            onPress={() => setSelected(index)}
            style={({ pressed }) => [styles.chip, { borderColor: index === selected ? colors.yellow : colors.line, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: 13 }}>{score.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.center, { color: colors.text }]}>
        {empty ? 'Complete a mission to map your growth.' : `${active?.label ?? ''} · ${active?.score ?? 0}`}
      </Text>
    </View>
  );
}

export function Bars({
  items,
  colors,
}: {
  items: { label: string; xp: number }[];
  colors: Palette;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(1, ...items.map((item) => item.xp));
  const current = selected === null ? null : items[selected];
  return (
    <View>
      <Text style={{ color: colors.text, fontFamily: font.semibold, minHeight: 22 }}>
        {current ? `${current.label} · ${current.xp} XP` : 'Tap a bar to read it'}
      </Text>
      <View style={styles.bars}>
        {items.map((item, index) => (
          <Pressable
            key={`${item.label}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`${item.label}, ${item.xp} XP`}
            onPress={() => setSelected(index)}
            style={({ pressed }) => [styles.barHit, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.track}>
              <View style={{ width: 16, height: Math.max(4, (item.xp / max) * 88), borderRadius: 6, backgroundColor: index === selected ? colors.yellow : colors.purple }} />
            </View>
            <Text style={{ color: colors.textSecondary, fontFamily: font.medium, fontSize: 12 }}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { minHeight: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center', marginTop: 12, fontFamily: font.medium, fontSize: 15 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 8 },
  barHit: { flex: 1, minHeight: 120, alignItems: 'center', justifyContent: 'flex-end' },
  track: { height: 92, justifyContent: 'flex-end' },
});
