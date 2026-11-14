import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Choice } from '../../components/Chrome';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';
import { syncReminder } from '../../ui/reminders';

const HOURS = [7, 8, 9, 12, 18, 20];

export default function NotificationSettings() {
  const colors = useColors();
  const { bundle, updateSettings } = useApp();
  const [message, setMessage] = useState<string | null>(null);
  const enabled = bundle?.settings.notificationsEnabled ?? false;
  const hour = bundle?.settings.reminderHour ?? 8;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>Reminders</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, lineHeight: 22 }}>
        A daily note from Loop, scheduled on this device. Expo Go can show local reminders. A server push channel is not part of this build, and nothing is sent if you leave them off.
      </Text>
      <Button colors={colors} label={enabled ? 'Turn reminders off' : 'Allow reminders'} onPress={() => {
        void (async () => {
          if (enabled) {
            await updateSettings({ notificationsEnabled: false });
            setMessage('Reminders are off.');
            return;
          }
          const result = await syncReminder(true, hour, 0);
          if (result === 'ok') {
            await updateSettings({ notificationsEnabled: true, reminderMinute: 0 });
            setMessage('A daily reminder is set.');
          } else if (result === 'denied') {
            await updateSettings({ notificationsEnabled: false });
            setMessage('Notifications are off for LEVELUP.');
          } else {
            setMessage('This device could not schedule a reminder.');
          }
        })();
      }} />
      {message === 'Notifications are off for LEVELUP.' ? <Button colors={colors} tone="secondary" label="Open Settings" onPress={() => { void Linking.openSettings(); }} /> : null}
      <Text style={{ color: colors.text, fontFamily: font.bold }}>Time</Text>
      <View style={{ gap: 8 }}>
        {HOURS.map((item) => (
          <Choice key={item} colors={colors} title={`${item}:00`} selected={hour === item} onPress={() => {
            void (async () => {
              await updateSettings({ reminderHour: item, reminderMinute: 0 });
              if (enabled) {
                const result = await syncReminder(true, item, 0);
                setMessage(result === 'ok' ? `Reminder moved to ${item}:00.` : 'The new time could not be scheduled.');
              }
            })();
          }} />
        ))}
      </View>
      {message ? <Text style={{ color: colors.text, fontFamily: font.medium }}>{message}</Text> : null}
    </ScrollView>
  );
}
