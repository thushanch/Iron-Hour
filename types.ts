
export enum PlanType {
  FOUNDATION = 'FOUNDATION', // Morning Ritual: Mindset & Prep
  BUILDER = 'BUILDER',       // Fortune & Skill: Deep Work
  VITALITY = 'VITALITY'      // Body & Connection: Health/Relationships
}

export interface SessionMeta {
  gratitudes?: string[];
  externalLink?: string;
  activityType?: 'MOVEMENT' | 'CONNECTION' | 'MEDITATION';
  interruptions: number;
  energyLevel?: number;
}

export interface SessionRecord {
  id: string;
  date: string;
  plan: PlanType;
  goal: string;
  why: string;
  reflection: string;
  refinement: string;
  completedAt: number;
  meta: SessionMeta;
}

export type SessionPhase = 'IDLE' | 'CALIBRATION' | 'FOCUS' | 'REVIEW' | 'COMPLETED';

export interface UserProfile {
  name: string;
  activePlan: PlanType | null;
  history: SessionRecord[];
  pledgeAmount: number; // For monetization/commitment
}

export const PLAN_DETAILS = {
  [PlanType.FOUNDATION]: {
    title: "Plan A: The Foundation",
    subtitle: "Take back the first hour.",
    description: "Focus on mindset, gratitude, reading, and planning. Guard the morning to win the day.",
    color: "text-blue-400",
    bg: "bg-blue-500",
    border: "border-blue-500",
    icon: "Sunrise"
  },
  [PlanType.BUILDER]: {
    title: "Plan B: The Builder",
    subtitle: "Practice beats theory.",
    description: "Deep work, coding, writing, or skill acquisition. Build your fortune in the quiet hour.",
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-500",
    icon: "Hammer"
  },
  [PlanType.VITALITY]: {
    title: "Plan C: The Vitality",
    subtitle: "Health & Connection.",
    description: "Exercise, meditation, or deep conversation. Build the body or the bond.",
    color: "text-rose-400",
    bg: "bg-rose-500",
    border: "border-rose-500",
    icon: "Heart"
  }
};
