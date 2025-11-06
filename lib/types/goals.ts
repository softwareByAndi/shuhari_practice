// Goal tracking types

export interface Goal {
  id: string;
  title: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  goalId: string;
  title: string;
  trackingType: 'numeric' | 'enum';
  order: number;
  createdAt: string;
}

export interface NumericTracking {
  value: number;
  date: string;
}

export type EnumTrackingValue = 'too_lazy' | 'got_done' | 'surpassed' | 'extra_mile';

export interface EnumTracking {
  value: EnumTrackingValue;
  date: string;
}

export interface GoalSession {
  goalId: string;
  userId: string | null;
  actionItems: Array<{
    actionItemId: string;
    tracking: NumericTracking | EnumTracking;
  }>;
  sessionDate: string;
  submitted: boolean;
}

export interface GoalSessionHistory {
  goalId: string;
  userId: string | null;
  sessions: GoalSession[];
}

// Enum labels for display
export const ENUM_LABELS: Record<EnumTrackingValue, string> = {
  'too_lazy': 'Too Lazy 😴',
  'got_done': 'It Got Done ✅',
  'surpassed': 'Surpassed Expectations 🎯',
  'extra_mile': 'Grit Through Extra Mile 💪'
};