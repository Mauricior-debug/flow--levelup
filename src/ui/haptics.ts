import * as Haptics from 'expo-haptics';

export async function buzzSuccess(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics are unavailable on this device.
  }
}

export async function buzzImpact(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics are unavailable on this device.
  }
}
