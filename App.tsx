import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardCard } from './components/DashboardCard';
import { AddMemberModal } from './components/AddMemberModal';
import { EditMemberModal } from './components/EditMemberModal';
import { CreateMeetingModal } from './components/CreateMeetingModal';
import { EditMeetingModal } from './components/EditMeetingModal';
import { TransferMemberModal } from './components/TransferMemberModal';
import { TransferReviewView } from './components/TransferReviewView';
import { Login } from './components/Login';
import { AttendanceOverview } from './components/AttendanceOverview';
import { MembersView } from './components/MembersView';
import { MeetingsView } from './components/MeetingsView';
import { AttendanceModal } from './components/AttendanceModal';
import { MissingInfoView } from './components/MissingInfoView';
import { UserGroupIcon } from './components/icons/UserGroupIcon';
import { CalendarIcon } from './components/icons/CalendarIcon';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import { Member, Department, UserRole, Meeting, AttendanceStatus, AppView } from './types';
// Import Supabase functions
import { 
  supabase, 
  fetchDepartments, 
  fetchMembers, 
  fetchMeetings, 
  addMember as addMemberToDB, 
  updateMember as updateMemberInDB, 
  addMeeting as addMeetingToDB, 
  updateMeeting as updateMeetingInDB, 
  updateAttendance as updateAttendanceInDB,
  deleteMember as deleteMemberFromDB,
  deleteMeeting as deleteMeetingFromDB
} from './services/supabase';

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRole | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState<boolean>(false);
  const [memberToTransfer, setMemberToTransfer] = useState<Member | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);
  const [meetingForAttendance, setMeetingForAttendance] = useState<Meeting | null>(null);
  const [view, setView] = useState<AppView | 'missing-info'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State to store transfer records
  const [transferRecords, setTransferRecords] = useState<any[]>([
    {
      id: 1,
      memberId: 1,
      memberName: 'Mohammed Ali Hussein Al-Salem',
      fromDepartmentId: 2,
      toDepartmentId: 1,
      transferDate: '2023-06-15',
      transferredBy: 'Admin',
      status: 'pending'
    },
    {
      id: 2,
      memberId: 3,
      memberName: 'Fatima Hussein Ali Al-Kandari',
      fromDepartmentId: 1,
      toDepartmentId: 3,
      transferDate: '2023-06-10',
      transferredBy: 'CEO',
      status: 'completed'
    },
    {
      id: 3,
      memberId: 2,
      memberName: 'Ahmed Abdullah Mohammed Al-Ajami',
      fromDepartmentId: 1,
      toDepartmentId: 3,
      transferDate: '2023-05-20',
      transferredBy: '2ashbal Head',
      status: 'pending'
    }
  ]);

  // Use real data from Supabase instead of mock data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [departmentsData, membersData, meetingsData] = await Promise.all([
        fetchDepartments(),
        fetchMembers(),
        fetchMeetings()
      ]);
      
      setDepartments(departmentsData);
      setMembers(membersData);
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectDepartment = (id: number | null) => {
    setSelectedDepartmentId(id);
  };
  
  const handleLogin = (user: UserRole) => {
      setCurrentUser(user);
      if(user !== 'Admin' && user !== 'CEO') {
          const userDept = departments.find(d => d.name === user);
          if (userDept) {
            setSelectedDepartmentId(userDept.id);
          }
      } else {
        setSelectedDepartmentId(null);
      }
      setView('dashboard');
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedDepartmentId(null);
    setView('dashboard');
  };

  const handleAddMember = async (newMemberData: Omit<Member, 'id'>) => {
    const success = await addMemberToDB(newMemberData);
    if (success) {
      // Refresh data after adding member
      fetchData();
    } else {
      alert('Failed to add member. Please try again.');
    }
  };

  const handleImportMembers = async (importedMembersData: Omit<Member, 'id'>[]) => {
    // For simplicity, we'll add members one by one
    // In a production app, you might want to optimize this with batch inserts
    let successCount = 0;
    for (const memberData of importedMembersData) {
      const success = await addMemberToDB(memberData);
      if (success) {
        successCount++;
      }
    }
    
    alert(`Successfully imported ${successCount} out of ${importedMembersData.length} new members.`);
    // Refresh data after importing members
    fetchData();
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    const success = await updateMemberInDB(updatedMember);
    if (success) {
      // Refresh data after updating member
      fetchData();
      setMemberToEdit(null);
    } else {
      alert('Failed to update member. Please try again.');
    }
  };

  // Add delete member function
  const handleDeleteMember = async (memberId: number) => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      const success = await deleteMemberFromDB(memberId);
      if (success) {
        // Refresh data after deleting member
        fetchData();
        setMemberToEdit(null);
      } else {
        alert('Failed to delete member. Please try again.');
      }
    }
  };

  const handleOpenTransferModal = (member: Member) => setMemberToTransfer(member);
  const handleCloseTransferModal = () => setMemberToTransfer(null);
  
  // Add this function to handle opening the attendance modal
  const handleOpenAttendanceModal = (meeting: Meeting) => setMeetingForAttendance(meeting);
  
  // Add this function to handle closing the attendance modal
  const handleCloseAttendanceModal = () => setMeetingForAttendance(null);

  const handleTransferMember = async (memberId: number, newDepartmentId: number) => {
    // Create a new transfer record instead of directly transferring
    const member = members.find(m => m.id === memberId);
    const fromDepartment = departments.find(d => d.id === member?.departmentId);
    const toDepartment = departments.find(d => d.id === newDepartmentId);
    
    if (member && fromDepartment && toDepartment) {
      const newTransferRecord = {
        id: transferRecords.length + 1,
        memberId: memberId,
        memberName: member.fullNameEn,
        fromDepartmentId: member.departmentId,
        toDepartmentId: newDepartmentId,
        transferDate: new Date().toISOString().split('T')[0],
        transferredBy: currentUser || 'Unknown',
        status: 'pending'
      };
      
      setTransferRecords([...transferRecords, newTransferRecord]);
    }
    
    handleCloseTransferModal();
  };

  // New function to handle adding transferred members to departments
  const handleAddTransferredMember = async (memberId: number, departmentId: number) => {
    // Update the member's department
    const updatedMembers = members.map(member => 
      member.id === memberId ? { ...member, departmentId: departmentId } : member
    );
    setMembers(updatedMembers);
    
    // Update the transfer record status to completed
    const updatedTransferRecords = transferRecords.map(record => 
      record.memberId === memberId && record.toDepartmentId === departmentId
        ? { ...record, status: 'completed' }
        : record
    );
    setTransferRecords(updatedTransferRecords);
  };

  // Add delete meeting function
  const handleDeleteMeeting = async (meetingId: number) => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      const success = await deleteMeetingFromDB(meetingId);
      if (success) {
        // Refresh data after deleting meeting
        fetchData();
        setMeetingToEdit(null);
      } else {
        alert('Failed to delete meeting. Please try again.');
      }
    }
  };

  const handleCreateMeeting = async (newMeetingData: Omit<Meeting, 'id'>) => {
    const success = await addMeetingToDB(newMeetingData);
    if (success) {
      // Refresh data after creating meeting
      fetchData();
    } else {
      alert('Failed to create meeting. Please try again.');
    }
  };
  
  const handleUpdateMeeting = async (updatedMeeting: Meeting) => {
    const success = await updateMeetingInDB(updatedMeeting);
    if (success) {
      // Refresh data after updating meeting
      fetchData();
      setMeetingToEdit(null);
    } else {
      alert('Failed to update meeting. Please try again.');
    }
  };

  const handleUpdateAttendance = async (meetingId: number, memberId: number, newStatus: AttendanceStatus) => {
    const success = await updateAttendanceInDB(meetingId, memberId, newStatus);
    if (success) {
      // Update local state to reflect the change
      const updatedMeetings = meetings.map(meeting => {
        if (meeting.id === meetingId) {
          const updatedAttendees = meeting.attendees.map(attendee => 
            attendee.memberId === memberId ? { ...attendee, status: newStatus } : attendee
          );
          return { ...meeting, attendees: updatedAttendees };
        }
        return meeting;
      });
      setMeetings(updatedMeetings);
      
      // Update the meetingForAttendance state if it's the same meeting
      if (meetingForAttendance && meetingForAttendance.id === meetingId) {
        const updatedMeeting = updatedMeetings.find(m => m.id === meetingId);
        if (updatedMeeting) {
          setMeetingForAttendance(updatedMeeting);
        }
      }
    } else {
      alert('Failed to update attendance. Please try again.');
    }
  };

  const userDepartment = useMemo(() => {
    if (!currentUser || currentUser === 'Admin' || currentUser === 'CEO') {
        return null;
    }
    const dept = departments.find(d => d.name === currentUser);
    return dept ? dept.id : null;
  }, [currentUser, departments]);

  // Get the department name for the current user
  const userDepartmentName = useMemo(() => {
    if (!currentUser || currentUser === 'Admin' || currentUser === 'CEO') {
        return 'All Departments';
    }
    return currentUser;
  }, [currentUser]);

  const visibleDepartments = useMemo(() => {
    if (!currentUser || currentUser === 'Admin' || currentUser === 'CEO') {
        return departments;
    }
    const userDepartment = departments.find(d => d.name === currentUser);
    return userDepartment ? [userDepartment] : [];
  }, [currentUser, departments]);

  const membersInVisibleDepts = useMemo(() => {
    if (selectedDepartmentId === null) {
        if (!currentUser || currentUser === 'Admin' || currentUser === 'CEO') {
            return members;
        }
        const userDept = departments.find(d => d.name === currentUser);
        if (!userDept) return [];
        return members.filter(member => member.departmentId === userDept.id);
    }
    return members.filter(
      (member) => member.departmentId === selectedDepartmentId
    );
  }, [selectedDepartmentId, members, currentUser, departments]);
  
  if (!currentUser) {
      return <Login onLogin={handleLogin} />
  }
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-semibold">Loading Data...</div>;
  }

  const renderContent = () => {
    // For the members view, Admin and CEO should see all members
    const membersForView = (view === 'members' && (currentUser === 'Admin' || currentUser === 'CEO')) 
      ? members 
      : membersInVisibleDepts;
      
    if (view === 'members') {
        return <MembersView 
                  members={membersForView}
                  departments={departments}
                  onAddMemberClick={() => setIsAddMemberModalOpen(true)}
                  onEditClick={(member) => setMemberToEdit(member)}
                  onTransferClick={handleOpenTransferModal}
                  currentUser={currentUser}
                  onImportMembers={handleImportMembers}
                  onShowMissingInfo={() => setView('missing-info')}
               />;
    }
    if (view === 'missing-info') {
        return <MissingInfoView 
                  members={members}
                  departments={departments}
                  onEditClick={(member) => {
                    setMemberToEdit(member);
                    setView('members');
                  }}
                  onBack={() => setView('members')}
                  currentUser={currentUser}
                  userDepartmentId={userDepartment}
               />;
    }
    if (view === 'transfers') {
        return <TransferReviewView 
                  members={members}
                  departments={departments}
                  currentUser={currentUser}
                  userDepartmentId={userDepartment}
                  onAddMemberToDepartment={handleAddTransferredMember}
                  transferRecords={transferRecords} // Pass transfer records as prop
               />;
    }
    if (view === 'meetings') {
        return <MeetingsView
                  meetings={meetings}
                  members={members} // Pass members data
                  onUpdateAttendance={handleUpdateAttendance}
                  onEditMeetingClick={(meeting) => setMeetingToEdit(meeting)}
                  onCreateMeetingClick={() => setIsCreateMeetingModalOpen(true)}
                  onAttendanceClick={handleOpenAttendanceModal} // Add this prop
                  currentUser={currentUser}
                  userDepartmentId={userDepartment}
                  onDeleteMeeting={handleDeleteMeeting}
             />;
    }
    if (view === 'overview') {
        return <AttendanceOverview members={membersInVisibleDepts} meetings={meetings} />;
    }
    // Default to dashboard
    return (
        <>
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <DashboardCard
                title="Total Members"
                value={membersInVisibleDepts.length}
                icon={<UserGroupIcon className="h-8 w-8" />}
                onClick={() => setView('members')}
                />
                <DashboardCard
                title="Total Meetings"
                value={meetings.length}
                icon={<CalendarIcon className="h-8 w-8" />}
                onClick={() => setView('meetings')}
                />
                 <DashboardCard
                title="Attendance Overview"
                value="View Report"
                icon={<ChartBarIcon className="h-8 w-8" />}
                onClick={() => setView('overview')}
                />
            </div>
        </>
      );
  }

  return (
    <div className="relative min-h-screen md:flex bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      <Sidebar
        departments={visibleDepartments}
        selectedDepartmentId={selectedDepartmentId}
        onSelectDepartment={handleSelectDepartment}
        currentView={view}
        onSetView={setView as (view: AppView) => void}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSignOut={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser} 
          onToggleSidebar={() => setIsSidebarOpen(true)}
          departmentName={userDepartmentName} // Pass department name
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          <div className="container mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onAddMember={handleAddMember}
        departments={departments}
        initialDepartmentId={selectedDepartmentId}
      />
      <CreateMeetingModal 
        isOpen={isCreateMeetingModalOpen}
        onClose={() => setIsCreateMeetingModalOpen(false)}
        onCreateMeeting={handleCreateMeeting}
        members={membersInVisibleDepts}
      />
      {memberToTransfer && (
        <TransferMemberModal
          isOpen={!!memberToTransfer}
          onClose={handleCloseTransferModal}
          onTransfer={handleTransferMember}
          member={memberToTransfer}
          departments={departments}
          currentUser={currentUser}
        />
      )}
      {memberToEdit && (
        <EditMemberModal 
            isOpen={!!memberToEdit}
            onClose={() => setMemberToEdit(null)}
            onEditMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            member={memberToEdit}
            departments={departments}
        />
      )}
      {meetingToEdit && (
        <EditMeetingModal 
            isOpen={!!meetingToEdit}
            onClose={() => setMeetingToEdit(null)}
            onEditMeeting={handleUpdateMeeting}
            onDeleteMeeting={handleDeleteMeeting}
            meeting={meetingToEdit}
            members={members}
        />
      )}
      {/* Add the AttendanceModal component */}
      {meetingForAttendance && (
        <AttendanceModal
          isOpen={!!meetingForAttendance}
          onClose={handleCloseAttendanceModal}
          meeting={meetingForAttendance}
          members={members}
          onUpdateAttendance={handleUpdateAttendance}
        />
      )}
    </div>
  );
};

export default App;