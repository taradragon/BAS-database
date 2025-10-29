import React, { useState, useEffect } from 'react';
import { Meeting, AttendanceStatus, Member } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  members: Member[];
  onUpdateAttendance: (meetingId: number, memberId: number, newStatus: AttendanceStatus) => void;
}

const statusConfig = {
  [AttendanceStatus.Present]: { icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />, text: 'Present' },
  [AttendanceStatus.Excused]: { icon: <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />, text: 'Excused' },
  [AttendanceStatus.Absent]: { icon: <XCircleIcon className="h-6 w-6 text-red-500" />, text: 'Absent' },
};

const getNextStatus = (currentStatus: AttendanceStatus): AttendanceStatus => {
  const statuses = [AttendanceStatus.Present, AttendanceStatus.Excused, AttendanceStatus.Absent];
  const currentIndex = statuses.indexOf(currentStatus);
  return statuses[(currentIndex + 1) % statuses.length];
};

// Function to determine if a role is a leader role
const isLeaderRole = (role: string): boolean => {
  return role === 'Leader' || role === 'Sub-Leader' || role === 'Gawala';
};

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, meeting, members, onUpdateAttendance }) => {
  const [currentMeeting, setCurrentMeeting] = useState<Meeting>(meeting);

  // Update currentMeeting when the meeting prop changes
  useEffect(() => {
    setCurrentMeeting(meeting);
  }, [meeting]);

  if (!isOpen) return null;

  // Map attendees to include role information
  const attendeesWithRoles = currentMeeting.attendees.map(attendee => {
    const member = members.find(m => m.id === attendee.memberId);
    return {
      ...attendee,
      role: member ? member.role : 'Member' // Default to 'Member' if not found
    };
  });

  // Separate leaders and members
  const leaders = attendeesWithRoles.filter(attendee => isLeaderRole(attendee.role));
  const membersList = attendeesWithRoles.filter(attendee => !isLeaderRole(attendee.role));

  // Handle attendance update
  const handleUpdateAttendance = (meetingId: number, memberId: number, newStatus: AttendanceStatus) => {
    // Call the parent's update function
    onUpdateAttendance(meetingId, memberId, newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentMeeting.title}</h2>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{currentMeeting.date}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Close"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow">
          {/* Leaders Section */}
          {leaders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Leaders</h3>
              <ul className="space-y-2">
                {leaders.map((attendee) => (
                  <li key={attendee.memberId} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-800 dark:text-gray-200">{attendee.name}</span>
                    <button
                      onClick={() => handleUpdateAttendance(currentMeeting.id, attendee.memberId, getNextStatus(attendee.status))}
                      title={`Current status: ${attendee.status}. Click to change.`}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      {statusConfig[attendee.status].icon}
                      <span className="text-gray-600 dark:text-gray-300 w-16 text-left">{statusConfig[attendee.status].text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Members Section */}
          {membersList.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Members</h3>
              <ul className="space-y-2">
                {membersList.map((attendee) => (
                  <li key={attendee.memberId} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-800 dark:text-gray-200">{attendee.name}</span>
                    <button
                      onClick={() => handleUpdateAttendance(currentMeeting.id, attendee.memberId, getNextStatus(attendee.status))}
                      title={`Current status: ${attendee.status}. Click to change.`}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      {statusConfig[attendee.status].icon}
                      <span className="text-gray-600 dark:text-gray-300 w-16 text-left">{statusConfig[attendee.status].text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};