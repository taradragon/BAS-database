import React, { useState, useEffect, useMemo } from 'react';
import { Department, Member, UserRole } from '../types';
import { TRANSFER_LADDER } from '../constants';

interface TransferMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (memberId: number, newDepartmentId: number) => Promise<void>;
  member: Member;
  departments: Department[];
  currentUser: UserRole; // Add currentUser prop
}

export const TransferMemberModal: React.FC<TransferMemberModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  member,
  departments,
  currentUser, // Destructure currentUser
}) => {
  // Determine available departments based on user role and member role
  const availableDepartments = useMemo(() => {
    // Admins and CEOs can transfer to any department
    if (currentUser === 'Admin' || currentUser === 'CEO') {
      return departments;
    }
    
    // For department heads, only allow transfers according to the ladder
    // but only for 'Rover' and 'Member' roles
    if (member.role === 'Rover' || member.role === 'Member') {
      const nextDepartmentId = TRANSFER_LADDER[member.departmentId];
      if (nextDepartmentId) {
        const nextDept = departments.find(d => d.id === nextDepartmentId);
        return nextDept ? [nextDept] : [];
      }
    }
    
    // For other roles (Leader, Sub-Leader, Gawala) department heads cannot transfer
    return [];
  }, [member.departmentId, member.role, departments, currentUser]);

  const [newDepartmentId, setNewDepartmentId] = useState<string>('');

  useEffect(() => {
    if (isOpen && availableDepartments.length > 0) {
      setNewDepartmentId(String(availableDepartments[0].id));
    } else {
      setNewDepartmentId('');
    }
  }, [isOpen, availableDepartments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentId) {
      alert('Please select a new department.');
      return;
    }

    const sourceDepartment = departments.find(d => d.id === member.departmentId);
    const targetDepartment = departments.find(d => d.id === parseInt(newDepartmentId, 10));

    if (!sourceDepartment || !targetDepartment) {
      alert('Could not determine department information. Transfer cancelled.');
      return;
    }

    const confirmationMessage = `Are you sure you want to transfer ${member.fullNameEn} from "${sourceDepartment.name}" to "${targetDepartment.name}"?`;

    if (window.confirm(confirmationMessage)) {
      await onTransfer(member.id, parseInt(newDepartmentId, 10));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Transfer Member</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Transfer <span className="font-semibold text-indigo-500">{member.fullNameEn}</span> to a new department.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Department</label>
              <select 
                id="department" 
                value={newDepartmentId} 
                onChange={e => setNewDepartmentId(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
                required
              >
                {availableDepartments.length > 0 ? availableDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                )) : (
                  <option disabled>
                    {currentUser === 'Admin' || currentUser === 'CEO' 
                      ? 'No departments available' 
                      : (member.role === 'Leader' || member.role === 'Sub-Leader' || member.role === 'Gawala'
                        ? 'Department heads cannot transfer leaders, sub-leaders, or gawala members'
                        : 'No transfer available for this department')}
                  </option>
                )}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={availableDepartments.length === 0} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};