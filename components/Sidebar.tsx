import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ScoutIcon } from './icons/ScoutIcon';
import { ArrowLeftOnRectangleIcon } from './icons/ArrowLeftOnRectangleIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { AppView } from '../types';

type SidebarView = AppView | 'missing-info';

interface SidebarProps {
  departments: { id: number; name: string }[];
  selectedDepartmentId: number | null;
  onSelectDepartment: (id: number | null) => void;
  currentView: SidebarView;
  onSetView: (view: SidebarView) => void;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  departments,
  selectedDepartmentId,
  onSelectDepartment,
  currentView,
  onSetView,
  isOpen,
  onClose,
  onSignOut,
}) => {
  const baseItemClasses = 'flex items-center w-full px-4 py-3 text-sm font-medium text-left rounded-lg transition-colors duration-150';
  const activeItemClasses = 'bg-indigo-600 text-white shadow-lg';
  const inactiveItemClasses = 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
  
  const handleSelectDepartment = (id: number | null) => {
    onSelectDepartment(id);
    if (currentView !== 'dashboard') {
        onSetView('dashboard');
    }
    onClose();
  };

  const handleSetView = (view: SidebarView) => {
    onSetView(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}
      
      <aside 
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:h-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Scout Dashboard</h1>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            <ul>
              <li>
                <button
                  onClick={() => handleSetView('dashboard')}
                  className={`${baseItemClasses} ${
                    currentView === 'dashboard' ? activeItemClasses : inactiveItemClasses
                  }`}
                >
                  <HomeIcon className="w-5 h-5 mr-3" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSetView('members')}
                  className={`${baseItemClasses} ${
                    currentView === 'members' ? activeItemClasses : inactiveItemClasses
                  }`}
                >
                  <UserGroupIcon className="w-5 h-5 mr-3" />
                  Members
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSetView('meetings')}
                  className={`${baseItemClasses} ${
                    currentView === 'meetings' ? activeItemClasses : inactiveItemClasses
                  }`}
                >
                  <CalendarIcon className="w-5 h-5 mr-3" />
                  Meetings
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSetView('transfers')}
                  className={`${baseItemClasses} ${
                    currentView === 'transfers' ? activeItemClasses : inactiveItemClasses
                  }`}
                >
                  <ArrowPathIcon className="w-5 h-5 mr-3" />
                  Transfers
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSetView('overview')}
                  className={`${baseItemClasses} ${
                    currentView === 'overview' ? activeItemClasses : inactiveItemClasses
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5 mr-3" />
                  Attendance Overview
                </button>
              </li>
            </ul>

            <h3 className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Departments
            </h3>
            <ul>
              {departments.length > 1 && (
                <li>
                  <button
                    onClick={() => handleSelectDepartment(null)}
                    className={`${baseItemClasses} ${
                      selectedDepartmentId === null ? activeItemClasses : inactiveItemClasses
                    }`}
                  >
                    <ScoutIcon className="w-5 h-5 mr-3" />
                    All Departments
                  </button>
                </li>
              )}
              {departments.map((dept) => (
                <li key={dept.id}>
                  <button
                    onClick={() => handleSelectDepartment(dept.id)}
                    className={`${baseItemClasses} ${
                      selectedDepartmentId === dept.id ? activeItemClasses : inactiveItemClasses
                    }`}
                  >
                    <ScoutIcon className="w-5 h-5 mr-3" />
                    {dept.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
              onClick={onSignOut}
              className={`${baseItemClasses} ${inactiveItemClasses}`}
          >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
              Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};