import React from 'react';
import CalendarView from './components/Calendar/CalendarView';
import { CalendarProvider } from './context/CalendarContext';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <CalendarProvider>
        <CalendarView />
      </CalendarProvider>
    </div>
  );
}

export default App;