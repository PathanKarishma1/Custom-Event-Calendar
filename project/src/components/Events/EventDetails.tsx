import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { Edit, Trash2, X, Calendar, Clock } from 'lucide-react';

interface EventDetailsProps {
  event: CalendarEvent;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
  const { toggleViewEvent, toggleEventForm, setSelectedEvent, deleteEvent } = useCalendar();
  
  const handleEdit = () => {
    toggleViewEvent(false);
    toggleEventForm(true);
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(event.id);
    }
  };
  
  const handleClose = () => {
    toggleViewEvent(false);
    setSelectedEvent(null);
  };
  
  const getRecurrenceText = () => {
    const { type, interval, daysOfWeek, endDate, count } = event.recurrence;
    
    if (type === 'none') return 'Does not repeat';
    
    let text = '';
    
    switch (type) {
      case 'daily':
        text = interval === 1 ? 'Daily' : `Every ${interval} days`;
        break;
      case 'weekly':
        text = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
        if (daysOfWeek && daysOfWeek.length > 0) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          text += ` on ${daysOfWeek.map(d => days[d]).join(', ')}`;
        }
        break;
      case 'monthly':
        text = interval === 1 ? 'Monthly' : `Every ${interval} months`;
        break;
      case 'custom':
        text = `Every ${interval} days`;
        break;
    }
    
    if (endDate) {
      text += ` until ${format(endDate, 'MMM d, yyyy')}`;
    } else if (count) {
      text += `, ${count} time${count > 1 ? 's' : ''}`;
    }
    
    return text;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className={`rounded-t-lg px-4 py-3 flex justify-between items-center bg-${event.color}-500 text-white`}>
          <h2 className="text-xl font-semibold">{event.title}</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar size={18} className="mr-3 mt-0.5 text-gray-500" />
              <div>
                <div className="font-medium">
                  {format(event.start, 'EEEE, MMMM d, yyyy')}
                </div>
                {!isSameDay(event.start, event.end) && (
                  <div className="text-gray-600">
                    to {format(event.end, 'EEEE, MMMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={18} className="mr-3 mt-0.5 text-gray-500" />
              <div>
                <div className="font-medium">
                  {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                </div>
              </div>
            </div>
            
            {event.recurrence.type !== 'none' && (
              <div className="flex items-start">
                <svg className="w-[18px] h-[18px] mr-3 mt-0.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3v4" />
                  <path d="M7 3v4" />
                  <path d="M3 11h18" />
                  <path d="M14 15h1" />
                  <path d="M19 15h1" />
                  <path d="M9 15h1" />
                  <path d="M4 15h1" />
                  <path d="M14 19h1" />
                  <path d="M19 19h1" />
                  <path d="M9 19h1" />
                  <path d="M4 19h1" />
                  <rect x="3" y="7" width="18" height="14" rx="2" />
                </svg>
                <div className="font-medium">{getRecurrenceText()}</div>
              </div>
            )}
            
            {event.description && (
              <div className="pt-2 border-t">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={handleDelete}
              className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors"
            >
              <Edit size={16} className="mr-1" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to check if two dates are on the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export default EventDetails;