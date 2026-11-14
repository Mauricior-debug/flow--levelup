import { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { EmptyBlock } from '../components/Chrome';
import { useApp } from '../state/AppContext';
import { font } from '../theme/colors';
import { useColors } from '../theme/Theme';

export default function InboxSheet() {
  const colors = useColors();
  const { bundle, markNoticesRead } = useApp();
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return;
    once.current = true;
    void markNoticesRead();
  }, [markNoticesRead]);
  const notices = bundle?.notices ?? [];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bgElevated }} contentContainerStyle={{ padding: 22, gap: 12 }}>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>Notices</Text>
      {notices.length === 0 ? <EmptyBlock colors={colors} title="Nothing waiting" body="Loop will leave a note when a mission, level, or achievement is worth a look." /> : notices.map((notice) => (
        <View key={notice.id} style={{ paddingVertical: 8, gap: 4 }}>
          <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 16 }}>{notice.title}</Text>
          <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 21 }}>{notice.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
