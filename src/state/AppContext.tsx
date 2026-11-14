import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initDb, loadSession } from '../data/store';
import * as store from '../data/store';
import type { Bundle, CompletionResult } from '../engine/types';
import { buzzImpact, buzzSuccess } from '../ui/haptics';
import { syncReminder } from '../ui/reminders';

type AppContextValue = {
  ready: boolean;
  error: string | null;
  bundle: Bundle | null;
  retry: () => void;
  startJourney: () => Promise<void>;
  saveOnboarding: (patch: Partial<Bundle['onboarding']>) => Promise<void>;
  buildPlan: () => Promise<void>;
  completeMission: (id: string) => Promise<CompletionResult>;
  createAccount: (input: { name: string; email: string; password: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithApple: (input: { appleSub: string; email: string | null; name: string | null }) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (patch: { name?: string; avatarUri?: string | null }) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  updateSettings: (patch: Partial<Bundle['settings']>) => Promise<void>;
  equipLoop: (patch: Partial<Pick<Bundle['loop'], 'skin' | 'accessory' | 'environment' | 'skill'>>) => Promise<string | null>;
  saveCustomPet: (input: { name: string; eyeColor: string; glowColor: string }) => Promise<void>;
  createGoal: (input: Parameters<typeof store.createGoal>[1]) => Promise<void>;
  updateGoalProgress: (id: string, value: number) => Promise<void>;
  completeGoal: (id: string) => Promise<CompletionResult>;
  deleteGoal: (id: string) => Promise<void>;
  createHabit: (input: { title: string; cadence: 'daily' | 'weekly'; goalId: string | null }) => Promise<void>;
  checkHabit: (id: string) => Promise<CompletionResult | null>;
  addUserMessage: (text: string) => Promise<void>;
  addLoopReply: () => Promise<void>;
  markNoticesRead: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boot = useCallback(async () => {
    setError(null);
    try {
      await initDb();
      const next = await loadSession();
      setBundle(next);
      if (next?.settings.notificationsEnabled) {
        await syncReminder(true, next.settings.reminderHour, next.settings.reminderMinute);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Saved progress could not be opened.');
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void boot();
  }, [boot]);

  const userId = bundle?.user.id;

  const value = useMemo<AppContextValue>(() => {
    const requireUser = () => {
      if (!userId) throw new Error('Start the journey first.');
      return userId;
    };
    return {
      ready,
      error,
      bundle,
      retry: () => {
        setReady(false);
        void boot();
      },
      startJourney: async () => setBundle(await store.startJourney()),
      saveOnboarding: async (patch) => setBundle(await store.saveOnboarding(requireUser(), patch)),
      buildPlan: async () => setBundle(await store.buildPlan(requireUser())),
      completeMission: async (id) => {
        const { bundle: next, result } = await store.completeMission(requireUser(), id);
        setBundle(next);
        if (!result.already) await buzzSuccess();
        return result;
      },
      createAccount: async (input) => {
        setBundle(await store.createAccount(requireUser(), input));
        await buzzSuccess();
      },
      signIn: async (email, password) => {
        setBundle(await store.signIn(email, password));
        await buzzSuccess();
      },
      signInWithApple: async (input) => {
        setBundle(await store.signInWithApple(userId ?? null, input));
        await buzzSuccess();
      },
      signOut: async () => {
        await store.signOut();
        setBundle(null);
      },
      deleteAccount: async () => {
        await store.deleteAccount(requireUser());
        setBundle(null);
      },
      updateProfile: async (patch) => setBundle(await store.updateProfile(requireUser(), patch)),
      changePassword: async (current, next) => {
        await store.changePassword(requireUser(), current, next);
        await buzzSuccess();
      },
      updateSettings: async (patch) => {
        const next = await store.updateSettings(requireUser(), patch);
        setBundle(next);
        if (patch.notificationsEnabled !== undefined || patch.reminderHour !== undefined || patch.reminderMinute !== undefined) {
          await syncReminder(next.settings.notificationsEnabled, next.settings.reminderHour, next.settings.reminderMinute);
        }
      },
      equipLoop: async (patch) => {
        const { bundle: next, error: equipError } = await store.equipLoop(requireUser(), patch);
        setBundle(next);
        if (!equipError) await buzzImpact();
        return equipError;
      },
      saveCustomPet: async (input) => {
        setBundle(await store.saveCustomPet(requireUser(), input));
        await buzzSuccess();
      },
      createGoal: async (input) => {
        setBundle(await store.createGoal(requireUser(), input));
        await buzzSuccess();
      },
      updateGoalProgress: async (id, amount) => setBundle(await store.updateGoalProgress(requireUser(), id, amount)),
      completeGoal: async (id) => {
        const { bundle: next, result } = await store.completeGoal(requireUser(), id);
        setBundle(next);
        if (!result.already) await buzzSuccess();
        return result;
      },
      deleteGoal: async (id) => setBundle(await store.deleteGoal(requireUser(), id)),
      createHabit: async (input) => {
        setBundle(await store.createHabit(requireUser(), input));
        await buzzSuccess();
      },
      checkHabit: async (id) => {
        const { bundle: next, result } = await store.checkHabit(requireUser(), id);
        setBundle(next);
        if (result) await buzzSuccess();
        return result;
      },
      addUserMessage: async (text) => setBundle(await store.addUserMessage(requireUser(), text)),
      addLoopReply: async () => setBundle(await store.addLoopReply(requireUser())),
      markNoticesRead: async () => setBundle(await store.markNoticesRead(requireUser())),
    };
  }, [boot, bundle, error, ready, userId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
