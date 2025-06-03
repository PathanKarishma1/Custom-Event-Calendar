import {
  addDays,
  addWeeks,
  addMonths,
  isBefore,
  isSameDay,
  getDay,
  startOfMonth,
  setDate,
  isAfter,
} from 'date-fns';
import { CalendarEvent, RecurrenceRule } from '../types';

export const calculateRecurringEvents = (
  event: CalendarEvent,
  startDate: Date,
  endDate: Date
): CalendarEvent[] => {
  if (event.recurrence.type === 'none') {
    return [event];
  }

  const recurringEvents: CalendarEvent[] = [];
  const { type, interval = 1, daysOfWeek, endDate: recurrenceEndDate, count } = event.recurrence;
  
  let currentDate = new Date(event.start);
  let occurrenceCount = 0;
  
  // Calculate duration of the event
  const duration = event.end.getTime() - event.start.getTime();

  while (
    isBefore(currentDate, endDate) && 
    (!recurrenceEndDate || isBefore(currentDate, recurrenceEndDate)) &&
    (!count || occurrenceCount < count)
  ) {
    if (isSameDay(currentDate, event.start) || isAfter(currentDate, startDate)) {
      const currentEnd = new Date(currentDate.getTime() + duration);
      
      recurringEvents.push({
        ...event,
        id: `${event.id}-${currentDate.getTime()}`,
        start: new Date(currentDate),
        end: currentEnd,
        isRecurringInstance: true,
        parentEventId: event.id,
      });
      
      occurrenceCount++;
    }
    
    // Calculate next occurrence based on recurrence type
    switch (type) {
      case 'daily':
        currentDate = addDays(currentDate, interval);
        break;
        
      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          // If we have specific days of the week
          const currentDayOfWeek = getDay(currentDate);
          const nextDayIndex = daysOfWeek.findIndex(day => day > currentDayOfWeek);
          
          if (nextDayIndex !== -1) {
            // Move to the next day in the same week
            currentDate = addDays(currentDate, daysOfWeek[nextDayIndex] - currentDayOfWeek);
          } else {
            // Move to the first day in the next week
            currentDate = addWeeks(currentDate, interval);
            currentDate = addDays(currentDate, daysOfWeek[0] - getDay(currentDate));
          }
        } else {
          // Simple weekly recurrence
          currentDate = addWeeks(currentDate, interval);
        }
        break;
        
      case 'monthly':
        currentDate = addMonths(currentDate, interval);
        break;
        
      case 'custom':
        // For custom recurrence, we can add more complex logic here
        currentDate = addDays(currentDate, interval);
        break;
        
      default:
        currentDate = addDays(currentDate, 1);
    }
  }
  
  return recurringEvents;
};

export const checkEventConflicts = (
  event: CalendarEvent,
  events: CalendarEvent[],
  excludeEventId?: string
): CalendarEvent[] => {
  return events.filter(existingEvent => {
    // Skip the event being edited
    if (excludeEventId && existingEvent.id === excludeEventId) {
      return false;
    }
    
    // Check if events overlap in time
    const eventsOverlap = (
      (event.start <= existingEvent.end && event.end >= existingEvent.start) ||
      (existingEvent.start <= event.end && existingEvent.end >= event.start)
    );
    
    // Check if they're on the same day
    const sameDayEvents = isSameDay(event.start, existingEvent.start);
    
    return eventsOverlap && sameDayEvents;
  });
};