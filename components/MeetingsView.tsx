import React, { useMemo, useState } from 'react';
import { Meeting, Member, UserRole } from '../types';
import { MeetingCard } from './MeetingCard';
import { PlusIcon } from './icons/PlusIcon';

interface MeetingsViewProps {
  meetings: Meeting[];
  members: Member[]; // Add members prop
  onUpdateAttendance: (meetingId: number, memberId: number, newStatus: any) => void;
  onEditMeetingClick: (meeting: Meeting) => void;
  onCreateMeetingClick: () => void;
  onAttendanceClick: (meeting: Meeting) => void; // New prop for attendance click
  onDeleteMeeting: (meetingId: number) => void; // New prop for delete meeting
  currentUser: UserRole;
  userDepartmentId: number | null;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({ meetings, members, onUpdateAttendance, onEditMeetingClick, onCreateMeetingClick, onAttendanceClick, onDeleteMeeting, currentUser, userDepartmentId }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  // Filter meetings based on user's department
  const departmentFilteredMeetings = useMemo(() => {
    // Admins and CEOs can see all meetings
    if (currentUser === 'Admin' || currentUser === 'CEO') {
      return meetings;
    }
    
    // Department heads can only see meetings for their department
    if (userDepartmentId !== null) {
      return meetings.filter(meeting => {
        // Check if any attendee belongs to the user's department
        return meeting.attendees.some(attendee => {
          const member = members.find(m => m.id === attendee.memberId);
          return member && member.departmentId === userDepartmentId;
        });
      });
    }
    
    // For other cases, return empty array
    return [];
  }, [meetings, members, currentUser, userDepartmentId]);
  
  // Filter meetings by selected month
  const filteredMeetings = useMemo(() => {
    if (selectedMonth === 'all') {
      return departmentFilteredMeetings;
    }
    
    return departmentFilteredMeetings.filter(meeting => {
      // Extract year and month from meeting date (YYYY-MM-DD format)
      const meetingDate = new Date(meeting.date);
      const meetingYearMonth = `${meetingDate.getFullYear()}-${String(meetingDate.getMonth() + 1).padStart(2, '0')}`;
      return meetingYearMonth === selectedMonth;
    });
  }, [departmentFilteredMeetings, selectedMonth]);
  
  // Get unique months from meetings for the filter dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    
    departmentFilteredMeetings.forEach(meeting => {
      const meetingDate = new Date(meeting.date);
      const yearMonth = `${meetingDate.getFullYear()}-${String(meetingDate.getMonth() + 1).padStart(2, '0')}`;
      months.add(yearMonth);
    });
    
    // Convert to array and sort in descending order (newest first)
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [departmentFilteredMeetings]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Meetings</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Months</option>
            {availableMonths.map(month => {
              // Format month for display (e.g., "2023-06" -> "June 2023")
              const [year, monthNum] = month.split('-');
              const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
              const monthName = date.toLocaleString('default', { month: 'long' });
              return (
                <option key={month} value={month}>
                  {`${monthName} ${year}`}
                </option>
              );
            })}
          </select>
          <button
            onClick={onCreateMeetingClick}
            className="flex items-center w-full md:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 md:mr-2" />
            <span className="md:inline">Create Meeting</span>
          </button>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map(meeting => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEditClick={onEditMeetingClick}
              onAttendanceClick={onAttendanceClick} // Pass the new prop
              onDeleteClick={onDeleteMeeting} // Pass the delete prop
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">
              {selectedMonth === 'all' 
                ? 'No meetings scheduled.' 
                : 'No meetings scheduled for the selected month.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};