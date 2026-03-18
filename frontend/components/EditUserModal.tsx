
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { User } from '../types';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedUser: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState<User>(user);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const renderInputField = (name: keyof User, label: string, type: string = "text") => (
         <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input
                type={type}
                name={name}
                value={(formData[name] as string) || ''}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Edit User: {user.fullName}</h3>
                    <div className="space-y-4">
                        {renderInputField('fullName', 'Full Name')}
                        {renderInputField('email', 'Email', 'email')}
                        {renderInputField('phone', 'Phone Number', 'tel')}
                        {user.role === 'driver' && renderInputField('licenseNumber', 'License Number')}
                        {user.role === 'staff' && renderInputField('department', 'Department / Branch')}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex justify-end space-x-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white border border-transparent rounded-md font-medium hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserModal;
