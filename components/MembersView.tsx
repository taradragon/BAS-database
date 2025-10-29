import React, { useState, useMemo, useRef } from 'react';
import { Member, MemberRole, MemberStatus, MEMBER_ROLES, Department, UserRole } from '../types';
import { MemberCard } from './AccountCard';
import { PlusIcon } from './icons/PlusIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { calculateAge } from '../utils/dateUtils';

interface MembersViewProps {
  members: Member[];
  departments: Department[];
  onAddMemberClick: () => void;
  onEditClick: (member: Member) => void;
  onTransferClick: (member: Member) => void;
  currentUser: UserRole;
  onImportMembers: (newMembers: Omit<Member, 'id'>[]) => Promise<void>;
  onShowMissingInfo?: () => void;
}

interface MemberWithMissingFields extends Member {
  missingFields: string[];
}

export const MembersView: React.FC<MembersViewProps> = ({ members, departments, onAddMemberClick, onEditClick, onTransferClick, currentUser, onImportMembers, onShowMissingInfo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MemberStatus | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<number | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current user is Admin or Head Leader (CEO)
  const isAdminOrHeadLeader = currentUser === 'Admin' || currentUser === 'CEO';

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const nameMatch = member.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = selectedRole === 'all' || member.role === selectedRole;
      const statusMatch = selectedStatus === 'all' || member.status === selectedStatus;
      const departmentMatch = selectedDepartment === 'all' || member.departmentId === selectedDepartment;
      return nameMatch && roleMatch && statusMatch && departmentMatch;
    });
  }, [members, searchTerm, selectedRole, selectedStatus, selectedDepartment]);

  const membersWithMissingInfo = useMemo(() => {
    return members.filter(m => 
      // Check if any field has the default "missing" value we set
      m.firstNameAr === 'غير محدد' || 
      m.secondNameAr === 'غير محدد' || 
      m.thirdNameAr === 'غير محدد' || 
      m.fourthNameAr === 'غير محدد' ||
      m.fullNameEn === 'Unnamed Member' ||
      m.birthDate === '1900-01-01' ||
      m.nationalId.startsWith('NID-') ||
      m.location === 'غير محدد' ||
      m.phoneNumber === 'غير محدد'
    ).map(member => {
      const missingFields: string[] = [];
      if (member.firstNameAr === 'غير محدد') missingFields.push('First Name (Arabic)');
      if (member.secondNameAr === 'غير محدد') missingFields.push('Second Name (Arabic)');
      if (member.thirdNameAr === 'غير محدد') missingFields.push('Third Name (Arabic)');
      if (member.fourthNameAr === 'غير محدد') missingFields.push('Fourth Name (Arabic)');
      if (member.fullNameEn === 'Unnamed Member') missingFields.push('Full Name (English)');
      if (member.birthDate === '1900-01-01') missingFields.push('Birth Date');
      if (member.nationalId.startsWith('NID-')) missingFields.push('National ID');
      if (member.location === 'غير محدد') missingFields.push('Location');
      if (member.phoneNumber === 'غير محدد') missingFields.push('Phone Number');
      
      return {
        ...member,
        missingFields
      } as MemberWithMissingFields;
    });
  }, [members]);

  const handleExport = () => {
    const departmentMap = new Map<number, string>(departments.map(d => [d.id, d.name]));
    
    const csvHeader = [
        "ID", "Full Name (English)", "First Name (AR)", "Second Name (AR)", "Third Name (AR)", "Fourth Name (AR)",
        "Birth Date", "National ID", "Location", "Phone Number", "Email",
        "Role", "Department", "Status", "Join Date"
    ].join(",");

    const csvRows = filteredMembers.map(m => {
        const departmentName = departmentMap.get(m.departmentId) || 'Unknown';
        
        const csvSafe = (field: string | undefined | null) => `"${(field || '').replace(/"/g, '""')}"`;

        return [
            m.id,
            csvSafe(m.fullNameEn),
            csvSafe(m.firstNameAr),
            csvSafe(m.secondNameAr),
            csvSafe(m.thirdNameAr),
            csvSafe(m.fourthNameAr),
            csvSafe(m.birthDate),
            csvSafe(m.nationalId),
            csvSafe(m.location),
            csvSafe(m.phoneNumber),
            csvSafe(m.email),
            csvSafe(m.role),
            csvSafe(departmentName),
            csvSafe(m.status),
            csvSafe(m.joinDate),
        ].join(",");
    }).join("\n");

    const csvContent = csvHeader + "\n" + csvRows;
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "members_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read.");

        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) {
          throw new Error("CSV file is empty or contains only a header.");
        }

        const headerLine = lines[0].trim();
        const header = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
        const expectedHeader = [
          "ID", "Full Name (English)", "First Name (AR)", "Second Name (AR)", "Third Name (AR)", "Fourth Name (AR)",
          "Birth Date", "National ID", "Location", "Phone Number", "Email",
          "Role", "Department", "Status", "Join Date"
        ];
      
        if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
          throw new Error(`Invalid CSV header. Please use the same format as the exported file.

Expected:
${expectedHeader.join(',')}

Found:
${headerLine}`);
        }

        const newMembers: Omit<Member, 'id'>[] = [];
        const departmentNameMap = new Map<string, number>(departments.map(d => [d.name.toLowerCase(), d.id]));
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          // Handle empty values with defaults
          const firstNameAr = values[2] || 'غير محدد';
          const secondNameAr = values[3] || 'غير محدد';
          const thirdNameAr = values[4] || 'غير محدد';
          const fourthNameAr = values[5] || 'غير محدد';
          
          // Create a full name if missing by combining Arabic names
          let fullNameEn = values[1];
          if (!fullNameEn) {
            const arabicNames = [firstNameAr, secondNameAr, thirdNameAr, fourthNameAr].filter(name => name && name !== 'غير محدد');
            fullNameEn = arabicNames.join(' ') || 'Unnamed Member';
          }

          const departmentName = values[12]?.toLowerCase() || '';
          let departmentId = departmentNameMap.get(departmentName);
        
          // If department is missing or invalid, default to the first department in the list.
          if (departmentId === undefined) {
            departmentId = departments[0]?.id;
            if (departmentId === undefined) {
              // This is an edge case where there are no departments at all.
              alert('Error: No departments are available to assign imported members to. Import aborted.');
              return;
            }
          }
        
          // Provide sensible defaults for missing fields
          const role = values[11] && MEMBER_ROLES.includes(values[11] as MemberRole) ? values[11] as MemberRole : 'Member';
          const status = values[13] && Object.values(MemberStatus).includes(values[13] as MemberStatus) ? values[13] as MemberStatus : MemberStatus.Pending;
          const birthDate = values[6] || '1900-01-01';
          const nationalId = values[7] || `NID-${Date.now()}-${i}`;
          const location = values[8] || 'غير محدد';
          const phoneNumber = values[9] || 'غير محدد';
          const email = values[10] || undefined;
          const joinDate = values[14] || new Date().toISOString().split('T')[0];
        
          newMembers.push({
            fullNameEn: fullNameEn,
            firstNameAr: firstNameAr,
            secondNameAr: secondNameAr,
            thirdNameAr: thirdNameAr,
            fourthNameAr: fourthNameAr,
            birthDate: birthDate,
            nationalId: nationalId,
            location: location,
            phoneNumber: phoneNumber,
            email: email,
            role: role,
            departmentId: departmentId,
            status: status,
            joinDate: joinDate,
          });
        }

        if (newMembers.length > 0) {
          await onImportMembers(newMembers);
        } else {
          alert("No new members were imported. Please check the file content and format.");
        }
      } catch (error) {
        alert(`An error occurred during import: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Members</h2>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={handleImportClick}
            className="flex items-center w-full md:w-auto justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <ArrowUpTrayIcon className="h-5 w-5 md:mr-2" />
            <span className="md:inline">Import</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center w-full md:w-auto justify-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 md:mr-2" />
            <span className="md:inline">Export</span>
          </button>
          <button
            onClick={onAddMemberClick}
            className="flex items-center w-full md:w-auto justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 md:mr-2" />
            <span className="md:inline">Add Member</span>
          </button>
        </div>
      </div>
      
      {/* Missing Info Summary Card */}
      {membersWithMissingInfo.length > 0 && (
        <div 
          className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          onClick={onShowMissingInfo}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Missing Information
              </p>
              <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                {membersWithMissingInfo.length} members have incomplete profiles
              </p>
            </div>
            <div className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar - Only show department filter for Admin and Head Leader */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value as MemberRole | 'all')}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Roles</option>
          {MEMBER_ROLES.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value as MemberStatus | 'all')}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Statuses</option>
          {Object.values(MemberStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        {/* Department filter - only visible to Admin and Head Leader */}
        {isAdminOrHeadLeader && (
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Departments</option>
            {departments.map(department => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onTransferClick={onTransferClick}
              onEditClick={onEditClick}
              currentUser={currentUser}
              // Pass department info and flag for Admin/Head Leader
              department={departments.find(d => d.id === member.departmentId)}
              showDepartment={isAdminOrHeadLeader}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">No members match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};