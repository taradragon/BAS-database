import React from 'react';
import { UserRole } from '../types';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
  currentUser: UserRole;
  onToggleSidebar: () => void;
  departmentName?: string; // Add departmentName prop
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onToggleSidebar, departmentName }) => {
  // Determine what to display as the header title
  const headerTitle = departmentName ? `${departmentName} Department` : 'Member Directory';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 mr-2"
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <img src="/assets/scout.png" alt="Scout Logo" className="h-10 w-10" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
              {headerTitle}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                Logged in as: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentUser}</span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};