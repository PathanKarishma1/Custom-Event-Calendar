export type EventColor = 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number; // e.g., every 2 weeks
  daysOfWeek?: number[]; // 0-6, where 0 is Sunday
  endDate?: Date | null;
  count?: number | null; // number of occurrences
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color: EventColor;
  recurrence: RecurrenceRule;
  isRecurringInstance?: boolean;
  parentEventId?: string; // For recurring event instances
}

export interface EventFormData {
  title: string;
  start: Date;
  end: Date;
  description: string;
  color: EventColor;
  recurrence: RecurrenceRule;
}

export interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface Month {
  days: Day[];
  name: string;
  year: number;
}