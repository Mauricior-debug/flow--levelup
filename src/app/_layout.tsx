import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AppProvider, useApp } from '../state/AppContext';
import { ColorProvider, useColors } from '../theme/Theme';
import { configureNotifications } from '../ui/reminders';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  useEffect(() => {
    configureNotifications();
  }, []);
  if (!fontsLoaded && !fontError) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#100D1D' }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemedTree fontsReady={fontsLoaded || !!fontError} />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedTree({ fontsReady }: { fontsReady: boolean }) {
  const { bundle, ready } = useApp();
  const theme = bundle?.settings.theme ?? 'dark';
  useEffect(() => {
    if (ready && fontsReady) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsReady, ready]);
  useEffect(() => {
    Appearance.setColorScheme(theme);
    SystemUI.setBackgroundColorAsync(theme === 'light' ? '#F4F0E6' : '#100D1D').catch(() => undefined);
  }, [theme]);
  const base = theme === 'light' ? DefaultTheme : DarkTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme === 'light' ? '#F4F0E6' : '#100D1D',
      card: theme === 'light' ? '#FFFFFF' : '#19152A',
      text: theme === 'light' ? '#1A1408' : '#FFFFFF',
      border: 'transparent',
      primary: '#FFE45C',
    },
  };
  return (
    <ThemeProvider value={navigationTheme}>
      <ColorProvider theme={theme}>
        <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
        <Routes />
      </ColorProvider>
    </ThemeProvider>
  );
}

function Routes() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat" options={{ headerShown: true, title: 'Loop', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="achievements" options={{ headerShown: true, title: 'Achievements' }} />
      <Stack.Screen name="goal/new" options={{ headerShown: true, title: 'New goal', presentation: 'modal' }} />
      <Stack.Screen name="goal/[id]" options={{ headerShown: true, title: 'Goal' }} />
      <Stack.Screen name="settings/account" options={{ headerShown: true, title: 'Account' }} />
      <Stack.Screen name="settings/notifications" options={{ headerShown: true, title: 'Notifications' }} />
      <Stack.Screen name="settings/theme" options={{ headerShown: true, title: 'Theme' }} />
      <Stack.Screen name="settings/privacy" options={{ headerShown: true, title: 'Privacy' }} />
      <Stack.Screen name="settings/subscription" options={{ headerShown: true, title: 'Subscription' }} />
      <Stack.Screen name="settings/devices" options={{ headerShown: true, title: 'Connected devices' }} />
      <Stack.Screen
        name="mission/[id]"
        options={{ presentation: 'formSheet', sheetAllowedDetents: [0.58, 0.95], sheetGrabberVisible: true, headerShown: false, contentStyle: { backgroundColor: colors.bgElevated } }}
      />
      <Stack.Screen
        name="inbox"
        options={{ presentation: 'formSheet', sheetAllowedDetents: [0.62, 1], sheetGrabberVisible: true, headerShown: false, contentStyle: { backgroundColor: colors.bgElevated } }}
      />
      <Stack.Screen
        name="streak"
        options={{ presentation: 'formSheet', sheetAllowedDetents: [0.72, 1], sheetGrabberVisible: true, headerShown: false, contentStyle: { backgroundColor: colors.bgElevated } }}
      />
      <Stack.Screen
        name="habit/new"
        options={{ presentation: 'formSheet', sheetAllowedDetents: [0.62, 0.95], sheetGrabberVisible: true, headerShown: false, contentStyle: { backgroundColor: colors.bgElevated } }}
      />
      <Stack.Screen name="celebration" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
    </Stack>
  );
}
