import React, { useMemo } from 'react';
import { Member, Department, UserRole } from '../types';
import { ArrowLeftOnRectangleIcon } from './icons/ArrowLeftOnRectangleIcon';
import { calculateAge } from '../utils/dateUtils';

interface MissingInfoViewProps {
  members: Member[];
  departments: Department[];
  onEditClick: (member: Member) => void;
  onBack: () => void;
  currentUser: UserRole;
  userDepartmentId: number | null;
}

interface MemberWithMissingFields extends Member {
  missingFields: string[];
}

export const MissingInfoView: React.FC<MissingInfoViewProps> = ({ members, departments, onEditClick, onBack, currentUser, userDepartmentId }) => {
  const membersWithMissingInfo = useMemo(() => {
    // Filter members based on user's department
    let filteredMembers = members;
    
    // Admins and CEOs can see all members
    if (currentUser !== 'Admin' && currentUser !== 'CEO' && userDepartmentId !== null) {
      // Department heads can only see members from their department
      filteredMembers = members.filter(member => member.departmentId === userDepartmentId);
    }
    
    return filteredMembers.filter(m => 
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
  }, [members, currentUser, userDepartmentId]);

  const departmentMap = useMemo(() => {
    const map = new Map<number, string>();
    departments.forEach(dept => map.set(dept.id, dept.name));
    return map;
  }, [departments]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Missing Information</h2>
        <button
          onClick={onBack}
          className="flex items-center w-full md:w-auto justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 md:mr-2" />
          <span className="md:inline">Back to Members</span>
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full text-yellow-600 dark:text-yellow-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Incomplete Profiles</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{membersWithMissingInfo.length}</p>
          </div>
        </div>
      </div>

      {/* Missing Info Table */}
      {membersWithMissingInfo.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Missing Fields</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {membersWithMissingInfo.map(member => {
                  const age = calculateAge(member.birthDate);
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{member.fullNameEn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {departmentMap.get(member.departmentId) || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {age !== null ? `${age} years` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex flex-wrap gap-1">
                          {member.missingFields.map((field, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                              {field}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => onEditClick(member)}
                          className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        >
                          Complete Info
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">All profiles are complete!</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No members with missing information found.
          </p>
        </div>
      )}
    </div>
  );
};