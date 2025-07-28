import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, MapPin, Tag } from 'lucide-react';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    description: '',
    location: '',
    attendees: '',
    category: 'personal',
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const categoryColors = {
    personal: 'bg-gradient-to-r from-purple-500 to-pink-500',
    work: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    study: 'bg-gradient-to-r from-green-500 to-emerald-500',
    social: 'bg-gradient-to-r from-orange-500 to-red-500',
    health: 'bg-gradient-to-r from-teal-500 to-blue-500'
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowEventModal(true);
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const dateKey = formatDateKey(selectedDate);
    const eventWithId = { ...newEvent, id: Date.now(), date: selectedDate };

    setEvents(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), eventWithId]
    }));

    setNewEvent({ title: '', time: '', description: '', location: '', attendees: '', category: 'personal' });
    setShowEventModal(false);
  };

  const getEventsForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = formatDateKey(date);
    return events[dateKey] || [];
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const dayEvents = getEventsForDate(day);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-24 md:h-32 border border-gray-100 p-2 cursor-pointer transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:shadow-lg hover:scale-105 relative group ${
            isToday ? 'bg-gradient-to-br from-blue-100 to-purple-100 ring-2 ring-blue-500 ring-opacity-50' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div
                key={idx}
                className={`text-xs px-2 py-1 rounded-full text-white truncate ${categoryColors[event.category]} shadow-sm`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 font-medium">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-lg"></div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Plus className="w-4 h-4 text-blue-500" />
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">First_Name Calendar</h1>
        <p className="text-gray-600 text-lg">Plan your days, achieve your goals</p>
      </div>

      {/* Calendar Header */}
      <div className="text-white bg-teal-600 p-6 mb-2">
        <div className="flex items-center justify-between">
          <button onClick={() => navigateMonth(-1)} className="p-3 rounded-full hover:bg-white/20 group transition-colors">
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-teal-100 mt-1">Click any date to add an event</p>
          </div>
          <button onClick={() => navigateMonth(1)} className="p-3 rounded-full hover:bg-white/20 group transition-colors">
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 bg-gray-100 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-4 text-center font-semibold text-gray-600 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {renderCalendarDays()}
      </div>

      {/* Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Add New Event</h3>
                </div>
                <button onClick={() => setShowEventModal(false)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-teal-100 mt-2">
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-white text-gray-50 placeholder-gray-400"
                  placeholder="Enter event title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Time
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Tag className="w-4 h-4 mr-2" /> Category
                </label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                >
                  <option value="personal">Personal</option>
                  <option value="meeting">Meeting</option>
                  <option value="study">Study Session</option>
                  <option value="social">Social</option>
                  <option value="health">Health</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Where is this event?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-400"
                  rows="3"
                  placeholder="Add some details about your event..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEventSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;