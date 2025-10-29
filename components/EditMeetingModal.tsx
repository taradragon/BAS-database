import React, { useState, useEffect } from 'react';
// Fix: Import `AttendanceStatus` to use its enum values and resolve type errors.
import { Member, Meeting, Attendee, AttendanceStatus } from '../types';

interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditMeeting: (updatedMeeting: Meeting) => Promise<void>;
  onDeleteMeeting: (meetingId: number) => Promise<void>;
  meeting: Meeting;
  members: Member[];
}

export const EditMeetingModal: React.FC<EditMeetingModalProps> = ({ isOpen, onClose, onEditMeeting, onDeleteMeeting, meeting, members }) => {
  const [title, setTitle] = useState(meeting.title);
  const [date, setDate] = useState(meeting.date);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set(meeting.attendees.map(a => a.memberId)));

  useEffect(() => {
    if (isOpen) {
      setTitle(meeting.title);
      setDate(meeting.date);
      setSelectedMemberIds(new Set(meeting.attendees.map(a => a.memberId)));
    }
  }, [isOpen, meeting]);

  if (!isOpen) return null;

  const handleMemberToggle = (memberId: number) => {
    setSelectedMemberIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || selectedMemberIds.size === 0) {
      alert('Please provide a title and select at least one attendee.');
      return;
    }

    const newAttendees: Attendee[] = members
      .filter(m => selectedMemberIds.has(m.id))
      .map(m => {
        const existingAttendee = meeting.attendees.find(a => a.memberId === m.id);
        // Fix: Use the `AttendanceStatus` enum member instead of a string literal ('Present') to fix the type error.
        // This also improves the logic by setting a consistent, sensible default for newly added attendees.
        return existingAttendee || { memberId: m.id, name: m.fullNameEn, status: AttendanceStatus.Present };
      });

    await onEditMeeting({
      ...meeting,
      title,
      date,
      attendees: newAttendees,
    });
    
    onClose();
  };

  const handleDelete = async () => {
    await onDeleteMeeting(meeting.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Meeting</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meeting Title</label>
              <input type="text" id="title-edit" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
              <label htmlFor="date-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input type="date" id="date-edit" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attendees</label>
              <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-60 overflow-y-auto">
                {members.map(member => (
                  <div key={member.id} className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <input
                      id={`member-edit-${member.id}`}
                      type="checkbox"
                      checked={selectedMemberIds.has(member.id)}
                      onChange={() => handleMemberToggle(member.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor={`member-edit-${member.id}`} className="ml-3 block text-sm text-gray-900 dark:text-gray-200">
                      {member.fullNameEn}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Delete Meeting</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};