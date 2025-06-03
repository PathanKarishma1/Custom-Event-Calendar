import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { EventColor, EventFormData, RecurrenceType } from '../../types';
import { checkEventConflicts } from '../../utils/recurrence';

const EventForm: React.FC = () => {
  const { state, addEvent, updateEvent, toggleEventForm } = useCalendar();
  const { selectedDate, selectedEvent, events } = state;
  
  const defaultFormData: EventFormData = {
    title: '',
    start: new Date(selectedDate),
    end: new Date(selectedDate),
    description: '',
    color: 'blue',
    recurrence: {
      type: 'none',
      interval: 1,
      daysOfWeek: [],
      endDate: null,
      count: null,
    },
  };
  
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  
  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        title: selectedEvent.title,
        start: new Date(selectedEvent.start),
        end: new Date(selectedEvent.end),
        description: selectedEvent.description || '',
        color: selectedEvent.color,
        recurrence: { ...selectedEvent.recurrence },
      });
      setShowRecurrenceOptions(selectedEvent.recurrence.type !== 'none');
    } else {
      // Set default times for new events (9 AM to 10 AM)
      const startTime = new Date(selectedDate);
      startTime.setHours(9, 0, 0);
      
      const endTime = new Date(selectedDate);
      endTime.setHours(10, 0, 0);
      
      setFormData({
        ...defaultFormData,
        start: startTime,
        end: endTime,
      });
    }
  }, [selectedEvent, selectedDate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [hours, minutes] = value.split(':').map(Number);
    
    setFormData((prev) => {
      const newDate = new Date(prev[name as 'start' | 'end']);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      return { ...prev, [name]: newDate };
    });
  };
  
  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RecurrenceType;
    setFormData((prev) => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        type: value,
        // Reset other recurrence settings when changing type
        interval: 1,
        daysOfWeek: [],
        endDate: null,
        count: null,
      },
    }));
    setShowRecurrenceOptions(value !== 'none');
  };
  
  const handleRecurrenceIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setFormData((prev) => ({
        ...prev,
        recurrence: {
          ...prev.recurrence,
          interval: value,
        },
      }));
    }
  };
  
  const handleDayOfWeekToggle = (day: number) => {
    setFormData((prev) => {
      const daysOfWeek = [...(prev.recurrence.daysOfWeek || [])];
      
      if (daysOfWeek.includes(day)) {
        return {
          ...prev,
          recurrence: {
            ...prev.recurrence,
            daysOfWeek: daysOfWeek.filter((d) => d !== day),
          },
        };
      } else {
        return {
          ...prev,
          recurrence: {
            ...prev.recurrence,
            daysOfWeek: [...daysOfWeek, day].sort(),
          },
        };
      }
    });
  };
  
  const handleColorChange = (color: EventColor) => {
    setFormData((prev) => ({ ...prev, color }));
  };
  
  const handleRecurrenceEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        endDate: value ? new Date(value) : null,
      },
    }));
  };
  
  const handleRecurrenceCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        count: value > 0 ? value : null,
      },
    }));
  };
  
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setConflicts(['Title is required']);
      return false;
    }
    
    if (formData.end < formData.start) {
      setConflicts(['End time cannot be before start time']);
      return false;
    }
    
    // Check for event conflicts
    const conflictingEvents = checkEventConflicts(
      {
        id: selectedEvent?.id || 'new-event',
        ...formData,
      },
      events,
      selectedEvent?.id
    );
    
    if (conflictingEvents.length > 0) {
      setConflicts([
        'This event conflicts with:',
        ...conflictingEvents.map(e => `"${e.title}" at ${format(e.start, 'h:mm a')}`),
      ]);
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (selectedEvent) {
      updateEvent(selectedEvent.id, formData);
    } else {
      addEvent(formData);
    }
  };
  
  const colorOptions: EventColor[] = ['blue', 'green', 'purple', 'red', 'yellow', 'indigo'];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {selectedEvent ? 'Edit Event' : 'Add Event'}
          </h2>
          <button
            onClick={() => toggleEventForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {conflicts.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              {conflicts.map((conflict, i) => (
                <p key={i} className="text-sm text-red-600">{conflict}</p>
              ))}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event title"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={format(formData.start, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  newDate.setHours(formData.start.getHours(), formData.start.getMinutes());
                  setFormData((prev) => ({ ...prev, start: newDate }));
                }}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="start"
                value={format(formData.start, 'HH:mm')}
                onChange={handleTimeChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={format(formData.end, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  newDate.setHours(formData.end.getHours(), formData.end.getMinutes());
                  setFormData((prev) => ({ ...prev, end: newDate }));
                }}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="end"
                value={format(formData.end, 'HH:mm')}
                onChange={handleTimeChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              placeholder="Event description (optional)"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex space-x-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className={`w-8 h-8 rounded-full bg-${color}-500 ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  aria-label={`${color} color`}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence
            </label>
            <select
              value={formData.recurrence.type}
              onChange={handleRecurrenceChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          {showRecurrenceOptions && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              {formData.recurrence.type === 'weekly' && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat on days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayOfWeekToggle(index)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          formData.recurrence.daysOfWeek?.includes(index)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {(formData.recurrence.type === 'daily' || 
                formData.recurrence.type === 'weekly' || 
                formData.recurrence.type === 'monthly' || 
                formData.recurrence.type === 'custom') && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat every
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      value={formData.recurrence.interval}
                      onChange={handleRecurrenceIntervalChange}
                      className="w-16 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.recurrence.type === 'daily' && 'day(s)'}
                      {formData.recurrence.type === 'weekly' && 'week(s)'}
                      {formData.recurrence.type === 'monthly' && 'month(s)'}
                      {formData.recurrence.type === 'custom' && 'day(s)'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ends
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="never"
                      name="recurrenceEnd"
                      checked={!formData.recurrence.endDate && !formData.recurrence.count}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        recurrence: {
                          ...prev.recurrence,
                          endDate: null,
                          count: null,
                        }
                      }))}
                      className="mr-2"
                    />
                    <label htmlFor="never" className="text-sm text-gray-700">Never</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="onDate"
                      name="recurrenceEnd"
                      checked={!!formData.recurrence.endDate}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        recurrence: {
                          ...prev.recurrence,
                          endDate: new Date(prev.start),
                          count: null,
                        }
                      }))}
                      className="mr-2"
                    />
                    <label htmlFor="onDate" className="text-sm text-gray-700 mr-2">On date</label>
                    {(formData.recurrence.endDate || formData.recurrence.type !== 'none') && (
                      <input
                        type="date"
                        value={formData.recurrence.endDate ? format(formData.recurrence.endDate, 'yyyy-MM-dd') : ''}
                        onChange={handleRecurrenceEndDateChange}
                        className="p-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        disabled={!formData.recurrence.endDate}
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="afterOccurrences"
                      name="recurrenceEnd"
                      checked={!!formData.recurrence.count}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        recurrence: {
                          ...prev.recurrence,
                          endDate: null,
                          count: 1,
                        }
                      }))}
                      className="mr-2"
                    />
                    <label htmlFor="afterOccurrences" className="text-sm text-gray-700 mr-2">After</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.recurrence.count || ''}
                      onChange={handleRecurrenceCountChange}
                      className="w-16 p-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      disabled={!formData.recurrence.count}
                    />
                    <span className="ml-2 text-sm text-gray-600">occurrence(s)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => toggleEventForm(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {selectedEvent ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;