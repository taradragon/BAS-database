import React from 'react';

interface ActionCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({ title, icon, onClick, disabled = false }) => {
  const baseClasses = "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-6 transition-all duration-300";
  const interactiveClasses = "hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transform hover:-translate-y-1";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`${baseClasses} ${disabled ? disabledClasses : interactiveClasses}`}
      role="button"
      aria-disabled={disabled}
    >
      <div className="flex-shrink-0">
        <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-600 dark:text-indigo-300">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
    </div>
  );
};
