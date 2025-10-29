
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, onClick }) => {
  const isClickable = !!onClick;
  const cardClasses = `
    bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-4
    ${isClickable ? 'transition-all duration-300 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transform hover:-translate-y-1' : ''}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex-shrink-0">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-600 dark:text-indigo-300">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};
