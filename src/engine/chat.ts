import { categoryById } from './catalog';
import { xpFor } from './progression';
import type { Difficulty, Goal, Mission, Onboarding, SkillId } from './types';

export type ChatContext = {
  name: string;
  text: string;
  level: number;
  streak: number;
  openMissions: { title: string; difficulty: Difficulty; category: Mission['category'] }[];
  goals: Pick<Goal, 'title' | 'category' | 'status'>[];
  onboarding: Pick<Onboarding, 'challenge' | 'changeWish' | 'consistency' | 'motivation' | 'intention' | 'categories'>;
  skill: SkillId;
};

export type LoopReply = { text: string; expression: 'talking' | 'sad' | 'excited' | 'encouraging' | 'happy' };

function norm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
}

export function replyTo(input: ChatContext): LoopReply {
  const text = norm(input.text);
  if (/missed (\w+ )?days/.test(text) || text.includes('missed three') || text.includes('been gone') || text.includes('fell off')) {
    return {
      text: "Hey, welcome back! I've missed our adventures. No guilt, no pressure. Shall we start fresh?",
      expression: 'encouraging',
    };
  }
  if (
    text.includes('completed all') ||
    text.includes('finished all') ||
    text.includes('all my missions') ||
    text.includes('did all my missions')
  ) {
    return {
      text: "WAIT... YOU DID IT! I'm so proud of you. We are getting stronger together!",
      expression: 'excited',
    };
  }
  if (
    text.includes("don't feel motivated") ||
    text.includes('do not feel motivated') ||
    text.includes('not motivated') ||
    text.includes('no motivation') ||
    text.includes('unmotivated')
  ) {
    return {
      text: "That's okay! We don't need to do everything today. Let's start with one small win. I've got your back!",
      expression: 'encouraging',
    };
  }
  if (/(sad|anxious|tired|overwhelmed|hopeless|depressed)/.test(text)) {
    return {
      text: "That's a heavy feeling, and you don't have to fix it today. I'm here. One small step is allowed to be enough.",
      expression: 'sad',
    };
  }
  if (/(who are you|are you (an? )?ai|are you real)/.test(text)) {
    return {
      text: "I'm Loop, your companion on this device. I can see your goals and missions, and I'll talk with you here.",
      expression: 'happy',
    };
  }

  const suggested = suggestMission(input.openMissions, input.skill);
  const goal = input.goals.find((item) => item.status === 'active');

  if (/(what should i do|what next|help me|next mission|what now)/.test(text)) {
    if (suggested) {
      return {
        text: `Let's keep it small. ${suggested.title} is open, and it's worth ${xpFor(suggested.difficulty)} XP.`,
        expression: 'encouraging',
      };
    }
    return { text: 'Nothing is waiting today. You can rest, or add a goal when you want a new thread.', expression: 'happy' };
  }
  if (text.includes('streak')) {
    if (input.streak <= 0) return { text: 'There is no streak to protect. The next mission you finish starts one.', expression: 'encouraging' };
    return { text: `Your streak is ${input.streak} day${input.streak === 1 ? '' : 's'}. It grows when you finish a mission, and a missed day is not a verdict.`, expression: 'happy' };
  }
  if (text.includes('level') || text.includes('xp')) {
    return { text: `You're level ${input.level}. The bar moves only when a mission, habit, or goal is actually finished.`, expression: 'happy' };
  }
  if (/^(hi|hey|hello|yo|good morning|good evening)\b/.test(text)) {
    const name = input.name && input.name !== 'Friend' ? ` ${input.name}` : '';
    return { text: `Hey${name}. I'm glad you opened this. What's on your mind?`, expression: 'happy' };
  }

  if (suggested && input.skill === 'focus') {
    return {
      text: `One thing, then we stop. ${suggested.title}. ${input.onboarding.intention ? `You said you started because: ${input.onboarding.intention}` : 'It counts even if the rest of the day is messy.'}`,
      expression: 'encouraging',
    };
  }
  if (input.onboarding.consistency && /fade|rarely/.test(input.onboarding.consistency) && suggested) {
    return {
      text: `You said you ${input.onboarding.consistency.toLowerCase()}. So we keep ${suggested.title} short. ${xpFor(suggested.difficulty)} XP when it's done.`,
      expression: 'encouraging',
    };
  }
  if (goal) {
    return {
      text: `${goal.title} is still active. ${suggested ? `If you want a rep today, ${suggested.title} is the one I'd pick.` : 'A habit on it would make the next step obvious.'}`,
      expression: 'talking',
    };
  }
  if (suggested) {
    const label = categoryById(suggested.category).title;
    return {
      text: `I'm with you. ${suggested.title} sits in ${label}, and it's worth ${xpFor(suggested.difficulty)} XP.`,
      expression: 'encouraging',
    };
  }
  return {
    text: input.onboarding.changeWish
      ? `You wanted to ${input.onboarding.changeWish.toLowerCase()}. We can pick that up whenever you're ready.`
      : "I'm here. Tell me how today feels, or ask what to do next.",
    expression: 'happy',
  };
}

export function suggestMission<T extends { title: string; difficulty: Difficulty }>(missions: T[], skill: SkillId): T | null {
  const open = missions.filter(Boolean);
  if (!open.length) return null;
  if (skill === 'deep') {
    return open.find((item) => item.difficulty === 'challenging' || item.difficulty === 'weekly') ?? open[0];
  }
  const small = open.find((item) => item.difficulty === 'small');
  return small ?? open[0];
}
