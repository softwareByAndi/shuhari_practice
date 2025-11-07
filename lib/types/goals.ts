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
  trackingType: 'numeric' | 'enum' | 'time';
  progressionRate?: number; // For numeric: +/- N units, for time: +/- minutes
  order: number;
  createdAt: string;
}

export interface NumericTracking {
  value: number | null;  // null for incomplete
  completed: boolean;
  date: string;
}

export interface TimeTracking {
  value: number | null;  // milliseconds, null for incomplete
  completed: boolean;
  date: string;
}

export type EnumTrackingValue = 'too_lazy' | 'got_done' | 'surpassed' | 'extra_mile';

export interface EnumTracking {
  value: EnumTrackingValue;
  completed: boolean;
  date: string;
}

export interface GoalSession {
  goalId: string;
  userId: string | null;
  actionItems: Array<{
    actionItemId: string;
    tracking: NumericTracking | TimeTracking | EnumTracking;
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

// Time formatting utilities
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function parseTime(timeStr: string): number {
  const parts = timeStr.split(':').map(p => parseInt(p, 10));
  let milliseconds = 0;

  if (parts.length === 3) {
    // h:mm:ss
    milliseconds = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  } else if (parts.length === 2) {
    // mm:ss
    milliseconds = (parts[0] * 60 + parts[1]) * 1000;
  } else if (parts.length === 1) {
    // just seconds
    milliseconds = parts[0] * 1000;
  }

  return milliseconds;
}