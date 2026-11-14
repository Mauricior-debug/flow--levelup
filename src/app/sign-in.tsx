import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text, TextInput } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button } from '../components/Button';
import { BackButton, Screen, inputStyle } from '../components/Chrome';
import { useApp } from '../state/AppContext';
import { font } from '../theme/colors';
import { useColors } from '../theme/Theme';

export default function SignInScreen() {
  const colors = useColors();
  const { signIn, signInWithApple, bundle } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [apple, setApple] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setApple).catch(() => setApple(false));
  }, []);
  return (
    <Screen
      colors={colors}
      footer={<Button colors={colors} label="Sign in" busy={busy} onPress={() => {
        setBusy(true);
        setError(null);
        void signIn(email, password)
          .then(() => router.replace('/'))
          .catch((caught) => setError(caught instanceof Error ? caught.message : 'Sign-in failed.'))
          .finally(() => setBusy(false));
      }} />}
    >
      <BackButton colors={colors} onPress={() => router.back()} />
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 32 }}>Welcome back</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, marginVertical: 8 }}>Sign in to the journey saved on this device.</Text>
      {apple ? <Button colors={colors} tone="secondary" label="Continue with Apple" onPress={() => {
        void AppleAuthentication.signInAsync({ requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL] })
          .then((credential) => signInWithApple({ appleSub: credential.user, email: credential.email, name: credential.fullName?.givenName ?? null }))
          .then(() => router.replace('/(tabs)'))
          .catch((caught) => {
            if (caught && typeof caught === 'object' && 'code' in caught && caught.code === 'ERR_REQUEST_CANCELED') return;
            setError(caught instanceof Error ? caught.message : 'Apple couldn’t finish signing in.');
          });
      }} /> : null}
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textSecondary} autoCapitalize="none" keyboardType="email-address" style={[inputStyle(colors), { marginTop: 16 }]} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.textSecondary} secureTextEntry style={[inputStyle(colors), { marginTop: 12 }]} />
      {error ? <Text style={{ color: colors.danger, marginTop: 12, fontFamily: font.medium }}>{error}</Text> : null}
    </Screen>
  );
}
