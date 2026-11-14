import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { levelFromTotal, sumXp } from '../../engine/progression';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bundle, updateProfile, signOut } = useApp();
  const [photoError, setPhotoError] = useState<string | null>(null);
  if (!bundle) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const level = levelFromTotal(sumXp(bundle.transactions));
  const pick = async (camera: boolean) => {
    setPhotoError(null);
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPhotoError(permission.canAskAgain ? 'Permission is needed to set a photo.' : 'Photo access is off. You can turn it on in Settings.');
      return;
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) await updateProfile({ avatarUri: result.assets[0].uri });
  };
  const rows = [
    ['Account', '/settings/account'],
    ['Notifications', '/settings/notifications'],
    ['Theme', '/settings/theme'],
    ['Privacy', '/settings/privacy'],
    ['Subscription', '/settings/subscription'],
    ['Connected devices', '/settings/devices'],
  ] as const;
  return (
    <View collapsable={false} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 120, paddingHorizontal: 20, width: '100%', maxWidth: 560, alignSelf: 'center', gap: 14 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, overflow: 'hidden', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
            {bundle.user.avatarUri ? <Image source={{ uri: bundle.user.avatarUri }} style={{ width: 96, height: 96 }} /> : <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 32 }}>{bundle.user.name.slice(0, 1)}</Text>}
          </View>
          <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>{bundle.user.name}</Text>
          <Text style={{ color: colors.textSecondary, fontFamily: font.medium }}>{bundle.user.email ?? 'Saved on this device'}</Text>
          <Text style={{ color: colors.text, fontFamily: font.semibold }}>Level {level.level} · {sumXp(bundle.transactions)} XP · {bundle.settings.streakCount} day streak</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable accessibilityRole="button" onPress={() => { void pick(false); }} style={({ pressed }) => [{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8, opacity: pressed ? 0.6 : 1 }]}><Text style={{ color: colors.yellow, fontFamily: font.bold }}>Choose photo</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => { void pick(true); }} style={({ pressed }) => [{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8, opacity: pressed ? 0.6 : 1 }]}><Text style={{ color: colors.yellow, fontFamily: font.bold }}>Take photo</Text></Pressable>
          </View>
          {photoError ? (
            <View style={{ gap: 6, alignItems: 'center' }}>
              <Text style={{ color: colors.danger, textAlign: 'center', fontFamily: font.medium }}>{photoError}</Text>
              <Pressable accessibilityRole="button" onPress={() => { void Linking.openSettings(); }} style={({ pressed }) => [{ minHeight: 44, justifyContent: 'center', opacity: pressed ? 0.6 : 1 }]}><Text style={{ color: colors.text, fontFamily: font.bold }}>Open Settings</Text></Pressable>
            </View>
          ) : null}
        </View>
        <View style={{ backgroundColor: colors.card, borderRadius: 20, overflow: 'hidden' }}>
          {rows.map(([label, href]) => (
            <Pressable key={href} accessibilityRole="button" onPress={() => router.push(href)} style={({ pressed }) => [{ minHeight: 52, paddingHorizontal: 16, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.line, opacity: pressed ? 0.65 : 1 }]}>
              <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: 16 }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            const message = bundle.settings.shareProgress
              ? `I'm level ${level.level} on LEVELUP, with ${sumXp(bundle.transactions)} XP and a ${bundle.settings.streakCount}-day streak.`
              : 'I’m building better habits with LEVELUP.';
            void Share.share({ message });
          }}
          style={({ pressed }) => [{ minHeight: 52, justifyContent: 'center', opacity: pressed ? 0.65 : 1 }]}
        >
          <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 16 }}>Share progress</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            Alert.alert('Sign out?', 'Your progress stays on this device.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: () => { void signOut().then(() => router.replace('/sign-in')); } },
            ]);
          }}
          style={({ pressed }) => [{ minHeight: 52, justifyContent: 'center', opacity: pressed ? 0.65 : 1 }]}
        >
          <Text style={{ color: colors.danger, fontFamily: font.bold, fontSize: 16 }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
