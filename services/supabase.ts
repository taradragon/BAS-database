import { createClient } from '@supabase/supabase-js';
import { Member, Department, Meeting, Attendee, MemberStatus, AttendanceStatus } from '../types';

// Supabase configuration - replace with your actual project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service functions
export const fetchDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  return data || [];
};

export const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase
    .from('members')
    .select(`
      id,
      first_name_ar,
      second_name_ar,
      third_name_ar,
      fourth_name_ar,
      full_name_en,
      birth_date,
      national_id,
      location,
      phone_number,
      email,
      role,
      department_id,
      status,
      join_date
    `);

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  // Map database column names to TypeScript property names
  return (data || []).map(member => ({
    id: member.id,
    firstNameAr: member.first_name_ar,
    secondNameAr: member.second_name_ar,
    thirdNameAr: member.third_name_ar,
    fourthNameAr: member.fourth_name_ar,
    fullNameEn: member.full_name_en,
    birthDate: member.birth_date,
    nationalId: member.national_id,
    location: member.location,
    phoneNumber: member.phone_number,
    email: member.email,
    role: member.role,
    departmentId: member.department_id,
    status: member.status,
    joinDate: member.join_date
  }));
};

export const fetchMeetings = async (): Promise<Meeting[]> => {
  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, date');

  if (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }

  // Fetch attendees for each meeting
  const meetingsWithAttendees = await Promise.all(
    (data || []).map(async (meeting) => {
      const { data: attendees, error: attendeesError } = await supabase
        .from('attendees')
        .select('member_id, meeting_id, status')
        .eq('meeting_id', meeting.id);

      if (attendeesError) {
        console.error('Error fetching attendees for meeting:', attendeesError);
        return { ...meeting, attendees: [] };
      }

      // Fetch member names for attendees
      const attendeeList: Attendee[] = await Promise.all(
        attendees.map(async (attendee) => {
          const { data: member } = await supabase
            .from('members')
            .select('full_name_en')
            .eq('id', attendee.member_id)
            .single();

          return {
            memberId: attendee.member_id,
            name: member?.full_name_en || 'Unknown Member',
            status: attendee.status as AttendanceStatus
          };
        })
      );

      return {
        id: meeting.id,
        title: meeting.title,
        date: meeting.date,
        attendees: attendeeList
      };
    })
  );

  return meetingsWithAttendees;
};

export const addMember = async (member: Omit<Member, 'id'>): Promise<boolean> => {
  // Handle empty values for required fields by providing defaults
  const memberData = {
    first_name_ar: member.firstNameAr || 'غير محدد',
    second_name_ar: member.secondNameAr || 'غير محدد',
    third_name_ar: member.thirdNameAr || 'غير محدد',
    fourth_name_ar: member.fourthNameAr || 'غير محدد',
    full_name_en: member.fullNameEn || 'Unnamed Member',
    birth_date: member.birthDate || '1900-01-01',
    national_id: member.nationalId || `NID-${Date.now()}`,
    location: member.location || 'غير محدد',
    phone_number: member.phoneNumber || 'غير محدد',
    email: member.email || null,
    role: member.role,
    department_id: member.departmentId,
    status: member.status,
    join_date: member.joinDate || new Date().toISOString().split('T')[0]
  };

  const { error } = await supabase
    .from('members')
    .insert([memberData]);

  if (error) {
    console.error('Error adding member:', error);
    return false;
  }

  return true;
};

export const updateMember = async (member: Member): Promise<boolean> => {
  // Handle empty values for required fields by providing defaults
  const memberData = {
    first_name_ar: member.firstNameAr || 'غير محدد',
    second_name_ar: member.secondNameAr || 'غير محدد',
    third_name_ar: member.thirdNameAr || 'غير محدد',
    fourth_name_ar: member.fourthNameAr || 'غير محدد',
    full_name_en: member.fullNameEn || 'Unnamed Member',
    birth_date: member.birthDate || '1900-01-01',
    national_id: member.nationalId || `NID-${Date.now()}`,
    location: member.location || 'غير محدد',
    phone_number: member.phoneNumber || 'غير محدد',
    email: member.email || null,
    role: member.role,
    department_id: member.departmentId,
    status: member.status,
    join_date: member.joinDate || new Date().toISOString().split('T')[0]
  };

  const { error } = await supabase
    .from('members')
    .update(memberData)
    .eq('id', member.id);

  if (error) {
    console.error('Error updating member:', error);
    return false;
  }

  return true;
};

export const addMeeting = async (meeting: Omit<Meeting, 'id'>): Promise<boolean> => {
  // Insert meeting first
  const { data: meetingData, error: meetingError } = await supabase
    .from('meetings')
    .insert([
      {
        title: meeting.title,
        date: meeting.date
      }
    ])
    .select();

  if (meetingError) {
    console.error('Error adding meeting:', meetingError);
    return false;
  }

  // Insert attendees
  if (meetingData && meetingData[0] && meeting.attendees.length > 0) {
    const meetingId = meetingData[0].id;
    const attendeesData = meeting.attendees.map(attendee => ({
      member_id: attendee.memberId,
      meeting_id: meetingId,
      status: attendee.status
    }));

    const { error: attendeesError } = await supabase
      .from('attendees')
      .insert(attendeesData);

    if (attendeesError) {
      console.error('Error adding attendees:', attendeesError);
      return false;
    }
  }

  return true;
};

export const updateMeeting = async (meeting: Meeting): Promise<boolean> => {
  // Update meeting
  const { error: meetingError } = await supabase
    .from('meetings')
    .update({
      title: meeting.title,
      date: meeting.date
    })
    .eq('id', meeting.id);

  if (meetingError) {
    console.error('Error updating meeting:', meetingError);
    return false;
  }

  // Delete existing attendees
  const { error: deleteError } = await supabase
    .from('attendees')
    .delete()
    .eq('meeting_id', meeting.id);

  if (deleteError) {
    console.error('Error deleting existing attendees:', deleteError);
    return false;
  }

  // Insert updated attendees
  if (meeting.attendees.length > 0) {
    const attendeesData = meeting.attendees.map(attendee => ({
      member_id: attendee.memberId,
      meeting_id: meeting.id,
      status: attendee.status
    }));

    const { error: insertError } = await supabase
      .from('attendees')
      .insert(attendeesData);

    if (insertError) {
      console.error('Error updating attendees:', insertError);
      return false;
    }
  }

  return true;
};

export const updateAttendance = async (meetingId: number, memberId: number, status: AttendanceStatus): Promise<boolean> => {
  const { error } = await supabase
    .from('attendees')
    .update({ status })
    .eq('meeting_id', meetingId)
    .eq('member_id', memberId);

  if (error) {
    console.error('Error updating attendance:', error);
    return false;
  }

  return true;
};

// Add delete functions
export const deleteMember = async (memberId: number): Promise<boolean> => {
  // First delete any attendance records for this member
  const { error: attendanceError } = await supabase
    .from('attendees')
    .delete()
    .eq('member_id', memberId);

  if (attendanceError) {
    console.error('Error deleting member attendance records:', attendanceError);
    return false;
  }

  // Then delete the member
  const { error: memberError } = await supabase
    .from('members')
    .delete()
    .eq('id', memberId);

  if (memberError) {
    console.error('Error deleting member:', memberError);
    return false;
  }

  return true;
};

export const deleteMeeting = async (meetingId: number): Promise<boolean> => {
  // First delete any attendance records for this meeting
  const { error: attendanceError } = await supabase
    .from('attendees')
    .delete()
    .eq('meeting_id', meetingId);

  if (attendanceError) {
    console.error('Error deleting meeting attendance records:', attendanceError);
    return false;
  }

  // Then delete the meeting
  const { error: meetingError } = await supabase
    .from('meetings')
    .delete()
    .eq('id', meetingId);

  if (meetingError) {
    console.error('Error deleting meeting:', meetingError);
    return false;
  }

  return true;
};

// Keep mock data for reference/testing
export const mockDepartments: Department[] = [
  { id: 1, name: '2ashbal' },
  { id: 2, name: 'bar3me' },
  { id: 3, name: 'kashaf' },
  { id: 4, name: 'motakadam' },
  { id: 5, name: 'morsha7in gawala' },
  { id: 6, name: 'gawala' },
];

export const mockMembers: Member[] = [
  {
    id: 1,
    firstNameAr: 'محمد',
    secondNameAr: 'علي',
    thirdNameAr: 'حسين',
    fourthNameAr: 'السالم',
    fullNameEn: 'Mohammed Ali Hussein Al-Salem',
    birthDate: '1995-05-15',
    nationalId: '1234567890',
    location: 'Kuwait City',
    phoneNumber: '+96512345678',
    email: 'mohammed@example.com',
    role: 'Leader',
    departmentId: 1,
    status: MemberStatus.Active,
    joinDate: '2020-01-15',
  },
  {
    id: 2,
    firstNameAr: 'أحمد',
    secondNameAr: 'عبدالله',
    thirdNameAr: 'محمد',
    fourthNameAr: 'العجمي',
    fullNameEn: 'Ahmed Abdullah Mohammed Al-Ajami',
    birthDate: '1998-08-22',
    nationalId: '0987654321',
    location: 'Hawalli',
    phoneNumber: '+96587654321',
    role: 'Member',
    departmentId: 1,
    status: MemberStatus.Active,
    joinDate: '2021-03-10',
  },
  {
    id: 3,
    firstNameAr: 'فاطمة',
    secondNameAr: 'حسين',
    thirdNameAr: 'علي',
    fourthNameAr: 'الكندري',
    fullNameEn: 'Fatima Hussein Ali Al-Kandari',
    birthDate: '1997-12-03',
    nationalId: '1122334455',
    location: 'Salmiya',
    phoneNumber: '+96555667788',
    email: 'fatima@example.com',
    role: 'Sub-Leader',
    departmentId: 2,
    status: MemberStatus.Active,
    joinDate: '2019-07-20',
  },
];

export const mockAttendees: Attendee[] = [
  { memberId: 1, name: 'Mohammed Ali Hussein Al-Salem', status: AttendanceStatus.Present },
  { memberId: 2, name: 'Ahmed Abdullah Mohammed Al-Ajami', status: AttendanceStatus.Absent },
  { memberId: 3, name: 'Fatima Hussein Ali Al-Kandari', status: AttendanceStatus.Excused },
];

export const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: 'Monthly Department Meeting',
    date: '2023-06-15',
    attendees: mockAttendees,
  },
  {
    id: 2,
    title: 'Quarterly Planning Session',
    date: '2023-06-20',
    attendees: [
      { memberId: 1, name: 'Mohammed Ali Hussein Al-Salem', status: AttendanceStatus.Present },
      { memberId: 3, name: 'Fatima Hussein Ali Al-Kandari', status: AttendanceStatus.Present },
    ],
  },
];