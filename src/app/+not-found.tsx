import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '../components/Button';
import { useColors } from '../theme/Theme';
import { font } from '../theme/colors';

export default function NotFound() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24, gap: 12 }}>
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 28 }}>That screen is missing</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 16 }}>The link doesn’t match a page in LEVELUP.</Text>
      <Button colors={colors} label="Go home" onPress={() => router.replace('/')} />
    </View>
  );
}
