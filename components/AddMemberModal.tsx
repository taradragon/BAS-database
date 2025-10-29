import React, { useState, useEffect } from 'react';
import { Department, Member, MemberStatus, MemberRole, MEMBER_ROLES } from '../types';
import { calculateAge } from '../utils/dateUtils';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (newMember: Omit<Member, 'id'>) => Promise<void>;
  departments: Department[];
  initialDepartmentId: number | null;
}

const initialFormState = {
    firstNameAr: '',
    secondNameAr: '',
    thirdNameAr: '',
    fourthNameAr: '',
    fullNameEn: '',
    birthDate: '',
    nationalId: '',
    location: '',
    phoneNumber: '',
    email: '',
    role: MEMBER_ROLES[0],
    departmentId: '',
    status: MemberStatus.Active,
    joinDate: new Date().toISOString().split('T')[0],
};

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  departments,
  initialDepartmentId
}) => {
  const [formState, setFormState] = useState(initialFormState);
  
  useEffect(() => {
    if (isOpen) {
        const defaultDeptId = initialDepartmentId !== null ? String(initialDepartmentId) : (departments.length > 0 ? String(departments[0].id) : '');
        setFormState({
            ...initialFormState,
            departmentId: defaultDeptId,
        });
    }
  }, [isOpen, initialDepartmentId, departments]);

  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new member object from the form state, excluding the optional email if it's empty
    const { email, ...requiredFields } = formState;
    const newMemberData: Omit<Member, 'id'> = {
        ...requiredFields,
        departmentId: parseInt(formState.departmentId, 10),
        ...(email && { email }), // Conditionally add email
    };

    await onAddMember(newMemberData);
    onClose();
  };

  const age = calculateAge(formState.birthDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            
            {/* Arabic Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name (Arabic)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Fix: Replaced invalid `style jsx` with Tailwind classes. */}
                    <input type="text" name="firstNameAr" value={formState.firstNameAr} onChange={handleChange} placeholder="First Name" className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                    <input type="text" name="secondNameAr" value={formState.secondNameAr} onChange={handleChange} placeholder="Second Name" className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                    <input type="text" name="thirdNameAr" value={formState.thirdNameAr} onChange={handleChange} placeholder="Third Name" className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                    <input type="text" name="fourthNameAr" value={formState.fourthNameAr} onChange={handleChange} placeholder="Fourth Name" className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
            </div>

            {/* English Name */}
            <div>
              <label htmlFor="fullNameEn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name (English)</label>
              <input type="text" id="fullNameEn" name="fullNameEn" value={formState.fullNameEn} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birth Date</label>
                    <input type="date" id="birthDate" name="birthDate" value={formState.birthDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                    {age !== null && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Age: {age} years</p>
                    )}
                </div>
                <div>
                    <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">National ID</label>
                    <input type="text" id="nationalId" name="nationalId" value={formState.nationalId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <input type="text" id="location" name="location" value={formState.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" value={formState.phoneNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email (Optional)</label>
                    <input type="email" id="email" name="email" value={formState.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Join Date</label>
                    <input type="date" id="joinDate" name="joinDate" value={formState.joinDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select id="role" name="role" value={formState.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        {MEMBER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                    <select id="departmentId" name="departmentId" value={formState.departmentId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select id="status" name="status" value={formState.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">Add Member</button>
          </div>
        </form>
      </div>
    </div>
  );
};