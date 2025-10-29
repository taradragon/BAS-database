import React from 'react';
import { Member, MemberStatus, UserRole, Department } from '../types';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { PencilIcon } from './icons/PencilIcon';
import { calculateAge } from '../utils/dateUtils';

interface MemberCardProps {
  member: Member;
  onTransferClick: (member: Member) => void;
  onEditClick: (member: Member) => void;
  currentUser: UserRole;
  department?: Department;
  showDepartment?: boolean;
}

const getStatusClasses = (status: MemberStatus) => {
  switch (status) {
    case MemberStatus.Active:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case MemberStatus.Pending:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case MemberStatus.Inactive:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const MemberCard: React.FC<MemberCardProps> = ({ member, onTransferClick, onEditClick, currentUser, department, showDepartment }) => {
  
  // Determines if the current user has permission to transfer this specific member.
  const canTransfer = () => {
    // Rule 1: Admins and CEOs can always transfer any member.
    if (currentUser === 'Admin' || currentUser === 'CEO') {
      return true;
    }
    
    // Fix: The explicit check for a department head was redundant and caused a TypeScript error.
    // After the check for 'Admin' or 'CEO', TypeScript narrows the type of `currentUser`,
    // so we can safely assume the user is a department head. This simplified logic resolves the error.
    // Rule 2: Department heads can only transfer members with 'Rover' or 'Member' roles.
    if (member.role === 'Rover' || member.role === 'Member') {
      return true;
    }

    // Rule 3: In all other cases, transfer is not allowed.
    return false;
  };
  
  const showTransferButton = canTransfer();
  const age = calculateAge(member.birthDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.fullNameEn}</h3>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(
              member.status
            )}`}
          >
            {member.status}
          </span>
        </div>
        <div className="mt-4 text-gray-600 dark:text-gray-300">
          <p className="text-sm">
            <span className="font-semibold">Role:</span> {member.role}
          </p>
          {showDepartment && department && (
            <p className="text-sm mt-1">
              <span className="font-semibold">Department:</span> {department.name}
            </p>
          )}
          {age !== null && (
            <p className="text-sm mt-1">
              <span className="font-semibold">Age:</span> {age} years
            </p>
          )}
        </div>
      </div>
       <div className="border-t border-gray-200 dark:border-gray-700 mt-2 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Join Date</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {member.joinDate}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
                onClick={() => onEditClick(member)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Edit Member"
            >
                <PencilIcon className="h-5 w-5" />
            </button>
            {showTransferButton && (
              <button
                onClick={() => onTransferClick(member)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Transfer Member"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
    </div>
  );
};