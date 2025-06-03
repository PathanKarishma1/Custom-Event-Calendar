import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import MonthView from './MonthView';
import EventForm from '../Events/EventForm';
import EventDetails from '../Events/EventDetails';
import { useCalendar } from '../../context/CalendarContext';
import { getMonthData, nextMonth, prevMonth } from '../../utils/date';
import { CalendarEvent } from '../../types';
import { format, parseISO, setHours, setMinutes } from 'date-fns';

const CalendarView: React.FC = () => {
  const { 
    state, 
    setSelectedDate, 
    toggleEventForm, 
    setSelectedEvent,
    setSearchTerm
  } = useCalendar();
  
  const [currentMonth, setCurrentMonth] = useState(getMonthData(state.selectedDate, state.events));
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  useEffect(() => {
    setCurrentMonth(getMonthData(state.selectedDate, state.events));
  }, [state.selectedDate, state.events]);

  useEffect(() => {
    if (state.searchTerm) {
      const filtered = state.events.filter(event => 
        event.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(state.searchTerm.toLowerCase()))
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [state.searchTerm, state.events]);

  const handlePrevMonth = () => {
    setSelectedDate(prevMonth(state.selectedDate));
  };

  const handleNextMonth = () => {
    setSelectedDate(nextMonth(state.selectedDate));
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    toggleEventForm(true);
  };

  const handleSearch = () => {
    setSearchTerm(localSearchTerm);
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    setSearchTerm('');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const eventId = draggableId.split('-')[0];
    const targetDate = parseISO(destination.droppableId);

    const draggedEvent = state.events.find(event => event.id === eventId);
    if (!draggedEvent) return;

    const newStart = new Date(targetDate);
    newStart.setHours(draggedEvent.start.getHours());
    newStart.setMinutes(draggedEvent.start.getMinutes());

    const duration = draggedEvent.end.getTime() - draggedEvent.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);

    setSelectedEvent({
      ...draggedEvent,
      start: newStart,
      end: newEnd
    });
    toggleEventForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentMonth.name} {currentMonth.year}
              </h1>
              <div className="flex ml-4">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-purple-100 transition-colors text-purple-600"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 rounded-full hover:bg-purple-100 transition-colors text-purple-600"
                  aria-label="Next month"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-10 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 w-full bg-white/80 backdrop-blur-sm"
                />
                <Search className="absolute left-3 top-3 text-purple-400" size={18} />
                {localSearchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-3 text-purple-400 hover:text-purple-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              <button 
                onClick={handleAddEvent}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span className="font-medium">Add Event</span>
              </button>
            </div>
          </div>
        </div>
        
        {filteredEvents.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Search Results</h2>
            <div className="space-y-2">
              {filteredEvents.map(event => (
                <div 
                  key={event.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 border-${event.color}-400 bg-white/80`}
                  onClick={() => {
                    setSelectedEvent(event);
                    toggleEventForm(false);
                  }}
                >
                  <div className="font-medium text-gray-800">{event.title}</div>
                  <div className="text-sm text-gray-600">
                    {format(event.start, 'PPP')} at {format(event.start, 'p')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <MonthView month={currentMonth} />
        </DragDropContext>
      </div>
      
      {state.isEventFormOpen && <EventForm />}
      {state.isViewEventOpen && state.selectedEvent && <EventDetails event={state.selectedEvent} />}
    </div>
  );
};

export default CalendarView;