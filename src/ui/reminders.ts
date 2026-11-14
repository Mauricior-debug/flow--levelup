import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let configured = false;

export function configureNotifications(): void {
  if (configured) return;
  configured = true;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    // Expo Go can limit the notifications module. Local reminders still try below.
  }
}

export async function syncReminder(enabled: boolean, hour: number, minute: number): Promise<'ok' | 'denied' | 'unavailable'> {
  configureNotifications();
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduled.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
    if (!enabled) return 'ok';
    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    if (status !== 'granted') return 'denied';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'LEVELUP',
        body: 'Loop is here. One small mission is enough for today.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return 'ok';
  } catch {
    return 'unavailable';
  }
}
