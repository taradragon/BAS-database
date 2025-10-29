
import React, { useMemo } from 'react';
import { Member, Meeting, AttendanceStatus } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface AttendanceOverviewProps {
  members: Member[];
  meetings: Meeting[];
}

const AttendanceIcon = ({ status }: { status: AttendanceStatus | undefined }) => {
  if (status === AttendanceStatus.Present) return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
  if (status === AttendanceStatus.Excused) return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
  if (status === AttendanceStatus.Absent) return <XCircleIcon className="h-6 w-6 text-red-500" />;
  return <span className="text-gray-400">-</span>;
};

export const AttendanceOverview: React.FC<AttendanceOverviewProps> = ({ members, meetings }) => {

  const relevantMeetings = useMemo(() => {
    const memberIds = new Set(members.map(m => m.id));
    return meetings
        .filter(meeting => meeting.attendees.some(attendee => memberIds.has(attendee.memberId)))
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [members, meetings]);

  const attendanceData = useMemo(() => {
    return members.map(member => {
      let present = 0;
      let excused = 0;
      let absent = 0;
      let total = 0;

      const memberAttendance = relevantMeetings.map(meeting => {
        const attendee = meeting.attendees.find(a => a.memberId === member.id);
        if (attendee) {
          total++;
          if (attendee.status === AttendanceStatus.Present) present++;
          if (attendee.status === AttendanceStatus.Excused) excused++;
          if (attendee.status === AttendanceStatus.Absent) absent++;
        }
        return { meetingId: meeting.id, status: attendee?.status };
      });
      
      const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        member,
        stats: { present, excused, absent, total, attendancePercentage },
        attendance: memberAttendance,
      };
    });
  }, [members, relevantMeetings]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Attendance Overview</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Attendance %</th>
              {relevantMeetings.map(meeting => (
                <th key={meeting.id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  {meeting.title} ({meeting.date})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {attendanceData.map(({ member, stats, attendance }) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{member.fullNameEn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex items-center">
                        <span className="font-semibold w-8">{stats.attendancePercentage}%</span>
                        <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 ml-2">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${stats.attendancePercentage}%` }}></div>
                        </div>
                    </div>
                </td>
                {relevantMeetings.map(meeting => {
                  const status = attendance.find(a => a.meetingId === meeting.id)?.status;
                  return (
                    <td key={meeting.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <AttendanceIcon status={status} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
         {members.length === 0 && <div className="text-center py-12 text-gray-500 dark:text-gray-400">No members to display in this view.</div>}
      </div>
    </div>
  );
};