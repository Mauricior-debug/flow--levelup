import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { LoopView } from '../components/LoopView';
import { useApp } from '../state/AppContext';
import { font } from '../theme/colors';
import { useColors } from '../theme/Theme';

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bundle, addUserMessage, addLoopReply } = useApp();
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const caughtUp = useRef(false);
  const messages = bundle?.messages ?? [];
  useEffect(() => {
    if (!bundle || caughtUp.current) return;
    caughtUp.current = true;
    const last = bundle.messages[bundle.messages.length - 1];
    if (last?.role === 'user') {
      setTyping(true);
      void addLoopReply().finally(() => setTyping(false));
    }
  }, [addLoopReply, bundle]);
  const petName = bundle?.loop.skin === 'custom' && bundle.loop.petName ? bundle.loop.petName : 'Loop';
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: petName }} />
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <LoopView visual={typing ? 'talking' : 'happy'} skin={bundle?.loop.skin} eyeColor={bundle?.loop.eyeColor} glowColor={bundle?.loop.glowColor} size={92} />
      </View>
      <FlatList
        data={[...messages].reverse()}
        inverted
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        ListHeaderComponent={typing ? <Text style={{ color: colors.textSecondary, fontFamily: font.medium, padding: 8 }}>Loop is writing…</Text> : undefined}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, fontFamily: font.regular, textAlign: 'center', marginTop: 24 }}>Hey! I'm Loop. Tell me how you're feeling, or ask what to do next.</Text>}
        renderItem={({ item }) => (
          <View style={{ alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%', backgroundColor: item.role === 'user' ? colors.yellow : colors.card, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Text style={{ color: item.role === 'user' ? colors.onYellow : colors.text, fontFamily: font.regular, fontSize: 16, lineHeight: 22 }}>{item.text}</Text>
          </View>
        )}
      />
      {error ? <Text style={{ color: colors.danger, paddingHorizontal: 16, fontFamily: font.medium }}>{error}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 10, alignItems: 'flex-end' }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message Loop"
          placeholderTextColor={colors.textSecondary}
          style={{ flex: 1, minHeight: 48, maxHeight: 120, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.card, color: colors.text, fontFamily: font.medium, fontSize: 16 }}
          multiline
        />
        <Button
          colors={colors}
          label="Send"
          disabled={!text.trim() || typing}
          onPress={() => {
            const next = text;
            setText('');
            setError(null);
            setTyping(true);
            void addUserMessage(next)
              .then(() => new Promise((resolve) => setTimeout(resolve, 800)))
              .then(() => addLoopReply())
              .catch((caught) => setError(caught instanceof Error ? caught.message : 'The message could not be saved.'))
              .finally(() => setTyping(false));
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
