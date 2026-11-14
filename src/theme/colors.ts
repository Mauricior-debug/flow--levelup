export type Palette = {
  bg: string;
  bgElevated: string;
  card: string;
  line: string;
  text: string;
  textSecondary: string;
  yellow: string;
  yellowPressed: string;
  onYellow: string;
  purple: string;
  blue: string;
  success: string;
  danger: string;
  streak: string;
  scrim: string;
  tab: string;
};

export const darkPalette: Palette = {
  bg: '#100D1D',
  bgElevated: '#19152A',
  card: '#1C1730',
  line: 'rgba(255,255,255,0.10)',
  text: '#FFFFFF',
  textSecondary: '#A5A1B5',
  yellow: '#FFE45C',
  yellowPressed: '#F0D34A',
  onYellow: '#1A1408',
  purple: '#A78BFA',
  blue: '#60A5FA',
  success: '#4ADE80',
  danger: '#F87171',
  streak: '#FF8A3D',
  scrim: 'rgba(16,13,29,0.72)',
  tab: '#FFE45C',
};

export const lightPalette: Palette = {
  bg: '#F4F0E6',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  line: 'rgba(26,20,8,0.10)',
  text: '#1A1408',
  textSecondary: '#5C5648',
  yellow: '#FFE45C',
  yellowPressed: '#F0D34A',
  onYellow: '#1A1408',
  purple: '#6D28D9',
  blue: '#1D4ED8',
  success: '#15803D',
  danger: '#B91C1C',
  streak: '#C2410C',
  scrim: 'rgba(244,240,230,0.78)',
  tab: '#7A5B00',
};

export function paletteFor(theme: 'dark' | 'light'): Palette {
  return theme === 'light' ? lightPalette : darkPalette;
}

export const font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extra: 'PlusJakartaSans_800ExtraBold',
};
