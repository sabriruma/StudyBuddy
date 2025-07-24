// src/components/EventPanel.jsx
import { useState } from 'react';
import { askAI } from '../services/api';

export default function EventPanel({ date, events, onAddEvent, onDeleteEvent }) {
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    color: '#3b82f6', // Default blue
  });
  const [isAILoading, setIsAILoading] = useState(false);

  const handleAddEvent = () => {
    if (!newEvent.title) return;
    
    const event = {
      id: Date.now(),
      date: new Date(date),
      ...newEvent,
    };
    
    onAddEvent(event);
    setNewEvent({ title: '', description: '', color: '#3b82f6' });
  };

  const generateWithAI = async () => {
    if (!newEvent.title) return;
    setIsAILoading(true);
    
    try {
      const response = await askAI([
        {
          role: 'system',
          content: 'You are a calendar assistant. Generate a detailed description for this calendar event.',
        },
        {
          role: 'user',
          content: `Event: ${newEvent.title}\nDate: ${date.toDateString()}\nGenerate a detailed description and preparation notes.`,
        },
      ]);
      
      setNewEvent(prev => ({
        ...prev,
        description: response.choices[0].message.content,
      }));
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-bold mb-4">
        {date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </h3>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-3 rounded border"
            style={{ borderLeft: `4px solid ${event.color}` }}
          >
            <div className="flex justify-between">
              <h4 className="font-bold">{event.title}</h4>
              <button
                onClick={() => onDeleteEvent(event.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
            {event.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {event.description}
              </p>
            )}
          </div>
        ))}

        <div className="mt-4">
          <h4 className="font-bold mb-2">Add New Event</h4>
          <input
            type="text"
            placeholder="Event title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Description"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            className="w-full p-2 border rounded mb-2 min-h-[100px]"
          />
          <div className="flex items-center mb-4">
            <span className="mr-2">Color:</span>
            <input
              type="color"
              value={newEvent.color}
              onChange={(e) =>
                setNewEvent({ ...newEvent, color: e.target.value })
              }
              className="w-8 h-8"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddEvent}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Event
            </button>
            <button
              onClick={generateWithAI}
              disabled={isAILoading || !newEvent.title}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isAILoading ? 'Generating...' : 'AI Enhance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}