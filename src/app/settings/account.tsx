import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput } from 'react-native';
import { Button } from '../../components/Button';
import { inputStyle } from '../../components/Chrome';
import { useApp } from '../../state/AppContext';
import { font } from '../../theme/colors';
import { useColors } from '../../theme/Theme';

export default function AccountSettings() {
  const colors = useColors();
  const { bundle, updateProfile, changePassword, deleteAccount } = useApp();
  const [name, setName] = useState(bundle?.user.name ?? '');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.textSecondary, fontFamily: font.regular }}>{bundle?.user.email ?? 'Signed in with Apple on this device.'}</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.textSecondary} style={inputStyle(colors)} />
      <Button colors={colors} label="Save name" onPress={() => {
        setError(null);
        void updateProfile({ name }).then(() => setSaved('Name saved.')).catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not save.'));
      }} />
      {bundle?.user.appleSub && !bundle.user.email ? null : (
        <>
          <Text style={{ color: colors.text, fontFamily: font.bold, marginTop: 8 }}>Change password</Text>
          <TextInput value={current} onChangeText={setCurrent} placeholder="Current password" placeholderTextColor={colors.textSecondary} secureTextEntry style={inputStyle(colors)} />
          <TextInput value={next} onChangeText={setNext} placeholder="New password" placeholderTextColor={colors.textSecondary} secureTextEntry style={inputStyle(colors)} />
          <Button colors={colors} tone="secondary" label="Update password" onPress={() => {
            setError(null);
            void changePassword(current, next).then(() => { setSaved('Password updated.'); setCurrent(''); setNext(''); }).catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not update the password.'));
          }} />
        </>
      )}
      {saved ? <Text style={{ color: colors.success, fontFamily: font.medium }}>{saved}</Text> : null}
      {error ? <Text style={{ color: colors.danger, fontFamily: font.medium }}>{error}</Text> : null}
      <Button colors={colors} tone="ghost" label="Delete account" onPress={() => {
        Alert.alert('Delete account?', 'This removes your progress from this device.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => { void deleteAccount().then(() => router.replace('/onboarding/welcome')); } },
        ]);
      }} />
    </ScrollView>
  );
}
