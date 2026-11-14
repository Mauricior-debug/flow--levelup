import { NativeTabs } from 'expo-router/native-tabs';
import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { useColors } from '../../theme/Theme';
import { useApp } from '../../state/AppContext';

export default function TabLayout() {
  const colors = useColors();
  const themeName = useApp().bundle?.settings.theme ?? 'dark';
  const base = themeName === 'light' ? DefaultTheme : DarkTheme;
  return (
    <ThemeProvider value={{ ...base, colors: { ...base.colors, background: colors.bg, card: colors.bg, primary: colors.tab, text: colors.text, border: 'transparent' } }}>
      <NativeTabs tintColor={colors.tab} backgroundColor={colors.bg} disableTransparentOnScrollEdge>
        <NativeTabs.Trigger name="index" contentStyle={{ backgroundColor: colors.bg }}>
          <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="progress" contentStyle={{ backgroundColor: colors.bg }}>
          <NativeTabs.Trigger.Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} md="bar_chart" />
          <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="loop" contentStyle={{ backgroundColor: colors.bg }}>
          <NativeTabs.Trigger.Icon sf={{ default: 'pawprint', selected: 'pawprint.fill' }} md="pets" />
          <NativeTabs.Trigger.Label>Loop</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="goals" contentStyle={{ backgroundColor: colors.bg }}>
          <NativeTabs.Trigger.Icon sf={{ default: 'flag', selected: 'flag.fill' }} md="flag" />
          <NativeTabs.Trigger.Label>Goals</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile" contentStyle={{ backgroundColor: colors.bg }}>
          <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
