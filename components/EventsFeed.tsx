
import React from 'react';
import { WorldEvent } from '../types';

interface EventsFeedProps {
  events: WorldEvent[];
}

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.5l.053.053a.5.5 0 010 .707l-.053.053a.5.5 0 01-.707 0l-.053-.053a.5.5 0 010-.707l.053-.053a.5.5 0 01.707 0zM12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);


const EventsFeed: React.FC<EventsFeedProps> = ({ events }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700 h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-200">Relevant World Events</h2>
      <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
        {events.map((event) => (
          <div key={event.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors duration-200">
            <h3 className="font-semibold text-blue-300">{event.title}</h3>
            <div className="flex items-center text-xs text-gray-400 mt-1 mb-2">
                <GlobeIcon />
                <span>{event.region}</span>
            </div>
            <p className="text-sm text-gray-300">{event.summary}</p>
            <p className="text-xs text-amber-400 mt-2 italic">{event.impact}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsFeed;
