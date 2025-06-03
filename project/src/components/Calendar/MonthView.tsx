import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Month, Day, CalendarEvent } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { format } from 'date-fns';

interface MonthViewProps {
  month: Month;
}

const MonthView: React.FC<MonthViewProps> = ({ month }) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-gradient-to-r from-purple-100 to-pink-100">
        {dayNames.map((day) => (
          <div key={day} className="p-3 text-center border-b border-purple-200">
            <span className="text-sm font-semibold text-purple-700">{day}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-purple-100">
        {month.days.map((day) => (
          <DayCell key={day.date.toISOString()} day={day} />
        ))}
      </div>
    </div>
  );
};

const DayCell: React.FC<{ day: Day }> = ({ day }) => {
  const { setSelectedDate, toggleEventForm, setSelectedEvent, toggleViewEvent } = useCalendar();
  
  const handleDayClick = () => {
    setSelectedDate(day.date);
    setSelectedEvent(null);
    toggleEventForm(true);
  };
  
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    toggleViewEvent(true);
  };
  
  const cellClasses = `min-h-[120px] p-2 bg-white/80 hover:bg-white/90 transition-colors ${
    !day.isCurrentMonth ? 'bg-opacity-50' : ''
  } ${day.isToday ? 'bg-purple-50/80' : ''}`;
  
  const dateClasses = `text-sm font-medium p-1.5 rounded-full w-8 h-8 flex items-center justify-center ${
    day.isToday 
      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
      : day.isCurrentMonth 
        ? 'text-gray-800' 
        : 'text-gray-400'
  }`;
  
  const dayString = format(day.date, 'yyyy-MM-dd');
  
  return (
    <Droppable droppableId={day.date.toISOString()}>
      {(provided) => (
        <div
          className={cellClasses}
          onClick={handleDayClick}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className="flex justify-between">
            <div className={dateClasses}>{format(day.date, 'd')}</div>
          </div>
          <div className="mt-1 max-h-[80px] overflow-y-auto scrollbar-thin">
            {day.events.slice(0, 3).map((event, index) => (
              <Draggable
                key={`${event.id}-${dayString}`}
                draggableId={`${event.id}-${dayString}`}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`text-xs p-2 mb-1.5 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer bg-${event.color}-100/80 text-${event.color}-800 border border-${event.color}-200`}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {format(event.start, 'h:mm a')}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {day.events.length > 3 && (
              <div className="text-xs text-purple-600 pl-1 mt-1">
                +{day.events.length - 3} more
              </div>
            )}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default MonthView;