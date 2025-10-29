import React, { useState, useMemo } from 'react';
import { Member, Department, UserRole, MemberStatus } from '../types';
import { PlusIcon } from './icons/PlusIcon';

// Define a transfer record type
export interface TransferRecord {
  id: number;
  memberId: number;
  memberName: string;
  fromDepartmentId: number;
  toDepartmentId: number;
  transferDate: string;
  transferredBy: string;
  status: 'pending' | 'completed'; // Track if the transfer has been officially completed
}

interface TransferReviewViewProps {
  members: Member[];
  departments: Department[];
  currentUser: UserRole;
  userDepartmentId: number | null;
  transferRecords: TransferRecord[];
  onAddMemberToDepartment?: (memberId: number, departmentId: number) => void;
}

export const TransferReviewView: React.FC<TransferReviewViewProps> = ({ 
  members, 
  departments, 
  currentUser,
  userDepartmentId,
  transferRecords,
  onAddMemberToDepartment 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  // Filter departments based on user role
  const visibleDepartments = useMemo(() => {
    if (currentUser === 'Admin' || currentUser === 'CEO') {
      return departments;
    }
    // Non-admin/CEO users can only see their own department
    return departments.filter(dept => dept.id === userDepartmentId);
  }, [departments, currentUser, userDepartmentId]);

  const departmentMap = useMemo(() => {
    const map = new Map<number, string>();
    departments.forEach(dept => map.set(dept.id, dept.name));
    return map;
  }, [departments]);

  const filteredAndSortedTransfers = useMemo(() => {
    // Filter transfers based on user role
    let filteredRecords = transferRecords;
    if (currentUser !== 'Admin' && currentUser !== 'CEO') {
      // Non-admin/CEO users can only see transfers related to their department
      filteredRecords = transferRecords.filter(record => 
        record.fromDepartmentId === userDepartmentId || 
        record.toDepartmentId === userDepartmentId
      );
    }
    
    let result = filteredRecords.filter(record => 
      record.memberName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.transferDate).getTime();
        const dateB = new Date(b.transferDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' 
          ? a.memberName.localeCompare(b.memberName)
          : b.memberName.localeCompare(a.memberName);
      }
    });

    return result;
  }, [transferRecords, searchTerm, sortBy, sortOrder, currentUser, userDepartmentId]);

  // Get pending transfers to the selected department
  const pendingTransfers = useMemo(() => {
    if (selectedDepartmentId === null) {
      return [];
    }
    
    // Find all pending transfer records where members were transferred to the selected department
    return transferRecords.filter(record => 
      record.toDepartmentId === selectedDepartmentId && 
      record.status === 'pending'
    );
  }, [transferRecords, selectedDepartmentId]);

  const handleSort = (field: 'date' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAddMember = (transferId: number, memberId: number) => {
    if (selectedDepartmentId !== null && onAddMemberToDepartment) {
      // Call the parent function to add the member to the department
      onAddMemberToDepartment(memberId, selectedDepartmentId);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Transfer Review</h2>
      
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by member name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Sort by:</span>
            <button
              onClick={() => handleSort('date')}
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === 'date'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('name')}
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === 'name'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Department Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Add Transferred Members to Department</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartmentId(null)}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedDepartmentId === null
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Select Department
          </button>
          {visibleDepartments.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartmentId(dept.id)}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedDepartmentId === dept.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
        
        {selectedDepartmentId !== null && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
              Pending transfers to {departmentMap.get(selectedDepartmentId) || 'Selected Department'}
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-h-60 overflow-y-auto">
              {pendingTransfers.length > 0 ? (
                <ul className="space-y-2">
                  {pendingTransfers.map(record => {
                    const member = members.find(m => m.id === record.memberId);
                    return (
                      <li key={record.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-600 rounded">
                        <div>
                          <span className="text-gray-800 dark:text-gray-200 font-medium">{record.memberName}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            From: {departmentMap.get(record.fromDepartmentId) || 'Unknown'} • 
                            Date: {new Date(record.transferDate).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddMember(record.id, record.memberId)}
                          className="flex items-center px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add to Department
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-2">
                  No pending transfers to this department
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transfer Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Member
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  From Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  To Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transfer Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transferred By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedTransfers.length > 0 ? (
                filteredAndSortedTransfers.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{record.memberName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {departmentMap.get(record.fromDepartmentId) || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {departmentMap.get(record.toDepartmentId) || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {new Date(record.transferDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      }`}>
                        {record.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">{record.transferredBy}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No transfer records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Transfers</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600 dark:text-indigo-400">
            {transferRecords.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pending Transfers</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600 dark:text-yellow-400">
            {transferRecords.filter(record => record.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Completed Transfers</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">
            {transferRecords.filter(record => record.status === 'completed').length}
          </p>
        </div>
      </div>
    </div>
  );
};