export enum MemberStatus {
  Active = 'Active',
  Pending = 'Pending',
  Inactive = 'Inactive',
}

export const MEMBER_ROLES = ['Leader', 'Sub-Leader', 'Gawala', 'Rover', 'Member'] as const;
export type MemberRole = typeof MEMBER_ROLES[number];

export type UserRole =
  | 'Admin'
  | 'CEO'
  | '2ashbal'
  | 'bar3me'
  | 'kashaf'
  | 'motakadam'
  | 'morsha7in gawala'
  | 'gawala';

export interface Member {
  id: number;
  // Arabic Names
  firstNameAr: string;
  secondNameAr: string;
  thirdNameAr: string;
  fourthNameAr: string;
  // English Full Name
  fullNameEn: string;
  // Personal Details
  birthDate: string;
  nationalId: string;
  location: string;
  phoneNumber: string;
  email?: string; // Optional
  // Role and Status
  role: MemberRole;
  departmentId: number;
  status: MemberStatus;
  joinDate: string;
}


export interface Department {
  id: number;
  name: string;
}

export enum AttendanceStatus {
  Present = 'Present',
  Excused = 'Excused',
  Absent = 'Absent',
}

export interface Attendee {
  memberId: number;
  name: string; // This will hold fullNameEn
  status: AttendanceStatus;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  attendees: Attendee[];
}

export type AppView = 'dashboard' | 'overview' | 'members' | 'meetings' | 'transfers' | 'missing-info';
