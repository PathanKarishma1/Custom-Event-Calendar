import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';
import { Day, Month, CalendarEvent } from '../types';

export const formatDate = (date: Date, formatStr: string = 'PP'): string => {
  return format(date, formatStr);
};

export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const getMonthData = (date: Date, events: CalendarEvent[]): Month => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Day[] = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    const dayEvents = events.filter((event) => {
      // Handle regular events
      if (event.recurrence.type === 'none') {
        return isSameDay(event.start, currentDate);
      }
      
      // For recurring events, check if this date is part of the recurrence pattern
      return isWithinInterval(currentDate, { start: event.start, end: event.end }) ||
        isSameDay(event.start, currentDate);
    });

    days.push({
      date: currentDate,
      isCurrentMonth: isSameMonth(currentDate, monthStart),
      isToday: isSameDay(currentDate, new Date()),
      events: dayEvents,
    });
    currentDate = addDays(currentDate, 1);
  }

  return {
    days,
    name: format(monthStart, 'MMMM'),
    year: monthStart.getFullYear(),
  };
};

export const nextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

export const prevMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

export const parseTimeString = (timeStr: string, baseDate: Date): Date => {
  // Parse time string in format "HH:MM" or "HH:MM AM/PM"
  const [hours, minutesPart] = timeStr.split(':');
  let minutes = minutesPart;
  let isPM = false;
  
  if (minutesPart.toLowerCase().includes('pm')) {
    isPM = true;
    minutes = minutesPart.toLowerCase().replace('pm', '').trim();
  } else if (minutesPart.toLowerCase().includes('am')) {
    minutes = minutesPart.toLowerCase().replace('am', '').trim();
  }
  
  let hoursNum = parseInt(hours, 10);
  if (isPM && hoursNum < 12) {
    hoursNum += 12;
  } else if (!isPM && hoursNum === 12) {
    hoursNum = 0;
  }
  
  const minutesNum = parseInt(minutes, 10);
  
  return setMinutes(setHours(baseDate, hoursNum), minutesNum);
};