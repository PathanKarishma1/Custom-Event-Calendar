import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CalendarEvent, EventFormData, RecurrenceType } from '../types';
import { calculateRecurringEvents } from '../utils/recurrence';

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: Date;
  selectedEvent: CalendarEvent | null;
  isEventFormOpen: boolean;
  isViewEventOpen: boolean;
  searchTerm: string;
}

type CalendarAction =
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'ADD_EVENT'; payload: EventFormData }
  | { type: 'UPDATE_EVENT'; payload: { id: string; event: EventFormData } }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_SELECTED_EVENT'; payload: CalendarEvent | null }
  | { type: 'TOGGLE_EVENT_FORM'; payload: boolean }
  | { type: 'TOGGLE_VIEW_EVENT'; payload: boolean }
  | { type: 'SET_SEARCH_TERM'; payload: string };

interface CalendarContextType {
  state: CalendarState;
  dispatch: React.Dispatch<CalendarAction>;
  addEvent: (event: EventFormData) => void;
  updateEvent: (id: string, event: EventFormData) => void;
  deleteEvent: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  toggleEventForm: (isOpen: boolean) => void;
  toggleViewEvent: (isOpen: boolean) => void;
  setSearchTerm: (term: string) => void;
}

const initialState: CalendarState = {
  events: [],
  selectedDate: new Date(),
  selectedEvent: null,
  isEventFormOpen: false,
  isViewEventOpen: false,
  searchTerm: '',
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const calendarReducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      return {
        ...state,
        selectedDate: action.payload,
      };
    case 'ADD_EVENT': {
      const newEvent: CalendarEvent = {
        id: uuidv4(),
        ...action.payload,
      };
      return {
        ...state,
        events: [...state.events, newEvent],
        isEventFormOpen: false,
      };
    }
    case 'UPDATE_EVENT': {
      const updatedEvents = state.events.map((event) =>
        event.id === action.payload.id ? { ...event, ...action.payload.event } : event
      );
      return {
        ...state,
        events: updatedEvents,
        selectedEvent: null,
        isEventFormOpen: false,
        isViewEventOpen: false,
      };
    }
    case 'DELETE_EVENT': {
      const filteredEvents = state.events.filter((event) => event.id !== action.payload);
      return {
        ...state,
        events: filteredEvents,
        selectedEvent: null,
        isViewEventOpen: false,
      };
    }
    case 'SET_SELECTED_EVENT':
      return {
        ...state,
        selectedEvent: action.payload,
      };
    case 'TOGGLE_EVENT_FORM':
      return {
        ...state,
        isEventFormOpen: action.payload,
      };
    case 'TOGGLE_VIEW_EVENT':
      return {
        ...state,
        isViewEventOpen: action.payload,
      };
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
      };
    default:
      return state;
  }
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [state, dispatch] = useReducer(calendarReducer, initialState, () => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      // Convert string dates back to Date objects
      const eventsWithDates = parsedEvents.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        recurrence: {
          ...event.recurrence,
          endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : null,
        },
      }));
      return {
        ...initialState,
        events: eventsWithDates,
      };
    }
    return initialState;
  });

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(state.events));
  }, [state.events]);

  const addEvent = (event: EventFormData) => {
    dispatch({ type: 'ADD_EVENT', payload: event });
  };

  const updateEvent = (id: string, event: EventFormData) => {
    dispatch({ type: 'UPDATE_EVENT', payload: { id, event } });
  };

  const deleteEvent = (id: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
  };

  const setSelectedDate = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  const setSelectedEvent = (event: CalendarEvent | null) => {
    dispatch({ type: 'SET_SELECTED_EVENT', payload: event });
  };

  const toggleEventForm = (isOpen: boolean) => {
    dispatch({ type: 'TOGGLE_EVENT_FORM', payload: isOpen });
  };

  const toggleViewEvent = (isOpen: boolean) => {
    dispatch({ type: 'TOGGLE_VIEW_EVENT', payload: isOpen });
  };

  const setSearchTerm = (term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  };

  return (
    <CalendarContext.Provider
      value={{
        state,
        dispatch,
        addEvent,
        updateEvent,
        deleteEvent,
        setSelectedDate,
        setSelectedEvent,
        toggleEventForm,
        toggleViewEvent,
        setSearchTerm,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};