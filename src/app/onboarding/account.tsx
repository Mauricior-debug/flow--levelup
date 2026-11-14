import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Chrome';
import { inputStyle } from '../../components/Chrome';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function AccountScreen() {
  const colors = useColors();
  const { bundle, createAccount, signInWithApple } = useApp();
  const [name, setName] = useState(bundle?.user.name === 'Friend' ? '' : bundle?.user.name ?? '');
  const [email, setEmail] = useState(bundle?.user.email ?? '');
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
      footer={
        <View style={{ gap: 10 }}>
          <Button
            colors={colors}
            label="Create account"
            busy={busy}
            onPress={() => {
              setBusy(true);
              setError(null);
              void createAccount({ name, email, password })
                .then(() => router.replace('/(tabs)'))
                .catch((caught) => setError(caught instanceof Error ? caught.message : 'The account could not be saved.'))
                .finally(() => setBusy(false));
            }}
          />
          <Button colors={colors} tone="ghost" label="I already have an account" onPress={() => router.push('/sign-in')} />
        </View>
      }
    >
      <Text style={{ color: colors.text, fontFamily: font.extra, fontSize: 32, lineHeight: 38 }}>Save your progress</Text>
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular, fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 20 }}>
        Your plan, XP, and chats stay on this device. An account lets you sign back in here.
      </Text>
      {apple ? (
        <View style={{ marginBottom: 16 }}>
          <Button
            colors={colors}
            tone="secondary"
            label="Continue with Apple"
            onPress={() => {
              void AppleAuthentication.signInAsync({
                requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
              })
                .then((credential) =>
                  signInWithApple({
                    appleSub: credential.user,
                    email: credential.email,
                    name: [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ') || null,
                  }),
                )
                .then(() => router.replace('/(tabs)'))
                .catch((caught) => {
                  if (caught && typeof caught === 'object' && 'code' in caught && caught.code === 'ERR_REQUEST_CANCELED') return;
                  setError(caught instanceof Error ? caught.message : 'Apple couldn’t finish signing in.');
                });
            }}
          />
        </View>
      ) : null}
      <View style={{ gap: 14 }}>
        <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.textSecondary} style={inputStyle(colors)} autoCapitalize="words" />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textSecondary} style={inputStyle(colors)} autoCapitalize="none" keyboardType="email-address" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.textSecondary} style={inputStyle(colors)} secureTextEntry autoCapitalize="none" />
      </View>
      {error ? <Text style={{ color: colors.danger, marginTop: 12, fontFamily: font.medium }}>{error}</Text> : null}
    </Screen>
  );
}
