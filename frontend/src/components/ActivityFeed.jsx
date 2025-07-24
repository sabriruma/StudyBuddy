// src/components/ActivityFeed.jsx
import { useState } from 'react';

// Mock activity data - replace with real data later
const mockActivities = [
  {
    id: 1,
    type: 'ai-session',
    title: 'AI Tutor Session',
    description: 'Completed Calculus practice problems with AI Tutor',
    time: '2 hours ago',
    icon: '📚'
  },
  {
    id: 2,
    type: 'group-study',
    title: 'Group Study',
    description: 'Joined "Advanced Computer Science" study group',
    time: '1 day ago',
    icon: '👥'
  },
  {
    id: 3,
    type: 'progress',
    title: 'Milestone Reached',
    description: 'Completed 80% of Data Structures course',
    time: '3 days ago',
    icon: '🏆'
  },
  {
    id: 4,
    type: 'resource',
    title: 'New Resource',
    description: 'Added "React Hooks Guide" to your materials',
    time: '1 week ago',
    icon: '📂'
  }
];

export default function ActivityFeed() {
  const [activities] = useState(mockActivities);

  return (
    <div className="mt-4 space-y-4">
      {activities.map((activity) => (
        <div 
          key={activity.id}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-start">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 mr-3 text-lg">
              {activity.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {activity.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* View All link */}
      <div className="text-center mt-4">
        <button className="text-sm text-green-600 dark:text-green-400 hover:underline">
          View All Activity
        </button>
      </div>
    </div>
  );
}