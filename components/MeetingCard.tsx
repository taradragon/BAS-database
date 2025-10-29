import React from 'react';
import { Meeting } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface MeetingCardProps {
  meeting: Meeting;
  onEditClick: (meeting: Meeting) => void;
  onAttendanceClick: (meeting: Meeting) => void; // New prop for attendance click
  onDeleteClick: (meetingId: number) => void; // New prop for delete click
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onEditClick, onAttendanceClick, onDeleteClick }) => {
  // Count attendees
  const attendeeCount = meeting.attendees.length;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      onDeleteClick(meeting.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{meeting.title}</h3>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{meeting.date}</span>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={() => onEditClick(meeting)}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Edit Meeting"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete Meeting"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex-grow">
        {/* Display attendee count instead of listing attendees */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-semibold">{attendeeCount}</span> attendees
          </p>
        </div>
        
        {/* Button to open attendance form */}
        <button
          onClick={() => onAttendanceClick(meeting)}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Take Attendance
        </button>
      </div>
    </div>
  );
};