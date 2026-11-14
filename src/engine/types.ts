export const CATEGORY_IDS = [
  'fitness',
  'mindset',
  'money',
  'business',
  'learning',
  'lifestyle',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const DIFFICULTIES = ['small', 'standard', 'challenging', 'weekly', 'major'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const HORIZONS = ['daily', 'weekly', 'monthly', 'long_term'] as const;
export type Horizon = (typeof HORIZONS)[number];

export const STEPS = [
  'welcome',
  'meet',
  'focus',
  'situation',
  'time',
  'motivation',
  'generating',
  'plan',
  'first',
  'account',
  'done',
] as const;
export type StepId = (typeof STEPS)[number];

export const LOOKS = ['classic', 'explorer', 'cyber', 'galaxy'] as const;
export type LookId = (typeof LOOKS)[number];

export const ACCESSORIES = ['none', 'scarf', 'star', 'glow'] as const;
export type AccessoryId = (typeof ACCESSORIES)[number];

export const ENVIRONMENTS = ['island', 'bedroom', 'summit'] as const;
export type EnvironmentId = (typeof ENVIRONMENTS)[number];

export const SKILLS = ['steady', 'focus', 'comeback', 'deep'] as const;
export type SkillId = (typeof SKILLS)[number];

export const MOODS = [
  'idle',
  'happy',
  'excited',
  'relaxed',
  'sleepy',
  'welcoming',
  'sad',
  'thinking',
  'talking',
] as const;
export type Mood = (typeof MOODS)[number];

export type Origin = 'user' | 'sample';

export type User = {
  id: string;
  name: string;
  email: string | null;
  avatarUri: string | null;
  appleSub: string | null;
  isAnonymous: boolean;
  createdAt: string;
};

export type Onboarding = {
  step: StepId;
  categories: CategoryId[];
  routine: string | null;
  consistency: string | null;
  challenge: string | null;
  changeWish: string | null;
  dailyMinutes: 5 | 10 | 20 | 30 | null;
  motivation: string | null;
  intention: string | null;
  completed: boolean;
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  durationMinutes: number;
  difficulty: Difficulty;
  day: string;
  challengeDay: number | null;
  slot: 'show-up' | 'daily' | 'weekly';
  status: 'open' | 'complete';
  completedAt: string | null;
  origin: Origin;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string | null;
  horizon: Horizon;
  status: 'active' | 'complete';
  origin: Origin;
  createdAt: string;
};

export type Habit = {
  id: string;
  goalId: string | null;
  title: string;
  cadence: 'daily' | 'weekly';
  origin: Origin;
  createdAt: string;
};

export type HabitLog = {
  id: string;
  habitId: string;
  day: string;
  createdAt: string;
};

export type XpTransaction = {
  id: string;
  amount: number;
  reason: string;
  sourceType: 'mission' | 'achievement' | 'goal' | 'habit';
  sourceId: string | null;
  createdAt: string;
  origin: Origin;
};

export type UnlockedAchievement = {
  key: string;
  unlockedAt: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'loop';
  text: string;
  createdAt: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type LoopState = {
  bondXp: number;
  skin: LookId;
  accessory: AccessoryId;
  environment: EnvironmentId;
  skill: SkillId;
  mood: Mood;
  moodUntil: string | null;
  chatBondDay: string | null;
  chatBondToday: number;
};

export type Settings = {
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  shareProgress: boolean;
  streakCount: number;
  streakLastDay: string | null;
  bestStreak: number;
  recoveryWeek: string | null;
  recoveryArmed: boolean;
  comebackUnlocked: boolean;
  lastOpenDay: string | null;
};

export type Bundle = {
  user: User;
  onboarding: Onboarding;
  missions: Mission[];
  goals: Goal[];
  habits: Habit[];
  habitLogs: HabitLog[];
  transactions: XpTransaction[];
  achievements: UnlockedAchievement[];
  messages: ChatMessage[];
  notices: Notice[];
  loop: LoopState;
  settings: Settings;
};

export type MissionDraft = {
  title: string;
  description: string;
  category: CategoryId;
  durationMinutes: number;
  difficulty: Difficulty;
  dayOffset: number;
  challengeDay: number;
  slot: 'show-up' | 'daily' | 'weekly';
};

export type CompletionResult = {
  already: boolean;
  xp: number;
  level: number;
  leveledUp: boolean;
  previousLevel: number;
  unlocked: { key: string; title: string; group: string }[];
  streak: number;
  bondXp: number;
  bondLevel: number;
};
