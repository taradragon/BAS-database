import React, { useState } from 'react';
import { USER_ACCOUNTS } from '../constants';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (user: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<UserRole>(USER_ACCOUNTS[0].id);
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
    // Check if password is correct (1234 for all accounts)
    if (password === '1234') {
      onLogin(selectedUser);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  // Handle Enter key press in password field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center mb-6">
            <img src="/assets/scout.png" alt="Scout Logo" className="h-60 w-60" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Welcome to BAS Database
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            Please select your account and enter password to continue.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="mb-4">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Account
            </label>
            <select
              id="user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value as UserRole)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {USER_ACCOUNTS.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Password"
            />
          </div>
          <div className="mt-6">
            <button
              onClick={handleLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};