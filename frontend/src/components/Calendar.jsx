// src/components/Calendar.jsx
import { useState } from 'react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const renderDays = () => {
    const days = [];
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

    // Empty cells for days before the 1st
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border p-1"></div>);
    }

    // Actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayEvents = events.filter(
        (event) => event.date.toDateString() === date.toDateString()
      );

      days.push(
        <div
          key={i}
          className={`h-24 border p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
            date.toDateString() === selectedDate?.toDateString()
              ? 'bg-blue-50 dark:bg-blue-900'
              : ''
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="font-bold">{i}</div>
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className="text-xs p-1 mb-1 rounded truncate"
              style={{ backgroundColor: event.color }}
            >
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  const monthYear = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const changeMonth = (offset) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + offset,
        1
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Previous
        </button>
        <h2 className="text-xl font-bold">{monthYear}</h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center font-bold p-2 border">
            {day}
          </div>
        ))}
        {renderDays()}
      </div>

      {selectedDate && (
        <EventPanel
          date={selectedDate}
          events={events.filter(
            (event) => event.date.toDateString() === selectedDate.toDateString()
          )}
          onAddEvent={(newEvent) => setEvents([...events, newEvent])}
          onDeleteEvent={(id) =>
            setEvents(events.filter((event) => event.id !== id))
          }
        />
      )}
    </div>
  );
}