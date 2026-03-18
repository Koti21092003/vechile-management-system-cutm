
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from '../contexts/ToastContext';

interface ProfileSectionProps {
    user: User;
    themeColor: 'blue' | 'green' | 'purple';
    onUpdateUser: (updatedData: Partial<User>) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, themeColor, onUpdateUser }) => {
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState<Partial<User>>({});
    const { addToast } = useToast();

    useEffect(() => {
        // Reset form when user prop changes or edit mode is toggled
        setEditForm({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            licenseNumber: user.licenseNumber || '',
            department: user.department || ''
        });
    }, [user, editMode]);

    const themeClasses = {
        blue: {
            profileBanner: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-500',
            ring: 'focus:ring-blue-500',
            button: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300'
        },
        green: {
            profileBanner: 'bg-green-50 dark:bg-green-900/20',
            text: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-500',
            ring: 'focus:ring-green-500',
            button: 'bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-900/80 text-green-700 dark:text-green-300'
        },
        purple: {
            profileBanner: 'bg-purple-50 dark:bg-purple-900/20',
            text: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-500',
            ring: 'focus:ring-purple-500',
            button: 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300'
        },
    };

    const currentTheme = themeClasses[themeColor];

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser(editForm);
        setEditMode(false);
        addToast('Profile updated successfully!', 'success');
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                onUpdateUser({ profilePhoto: result });
                addToast('Profile photo updated!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const getInitials = (name: string): string => {
        if (!name) return user.username.charAt(0).toUpperCase();
        return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    };
    
    const renderInputField = (name: keyof User, label: string, type: string = "text") => (
         <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input
                type={type}
                value={(editForm[name] as string) || ''}
                onChange={(e) => setEditForm({...editForm, [name]: e.target.value})}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 ${currentTheme.ring}`}
            />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className={`${currentTheme.profileBanner} p-8 rounded-xl border border-gray-200 dark:border-gray-700`}>
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <div className={`w-24 h-24 ${currentTheme.bg} rounded-full flex items-center justify-center text-white font-bold text-3xl overflow-hidden ring-4 ring-white dark:ring-gray-800`}>
                             {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                getInitials(user.fullName)
                            )}
                        </div>
                        <label className={`absolute bottom-0 right-0 ${currentTheme.bg} text-white rounded-full p-2 cursor-pointer hover:opacity-90 transition-all border-2 border-white dark:border-gray-800`}>
                            <i className="fas fa-camera text-sm"></i>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <h2 className={`text-3xl font-bold ${currentTheme.text}`}>{user.fullName}</h2>
                        <p className="text-xl text-gray-700 dark:text-gray-300 capitalize">{user.role}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        <i className={`fas fa-user mr-3 ${currentTheme.text}`}></i>
                        Personal Information
                    </h3>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`${currentTheme.button} px-3 py-1 rounded-lg text-sm font-medium transition-all`}
                    >
                        <i className={`fas ${editMode ? 'fa-times' : 'fa-edit'} mr-1`}></i>
                        {editMode ? 'Cancel' : 'Edit'}
                    </button>
                </div>
                {editMode ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
                        {renderInputField('fullName', 'Full Name')}
                        {renderInputField('email', 'Email', 'email')}
                        {renderInputField('phone', 'Phone', 'tel')}
                        {user.role === 'driver' && renderInputField('licenseNumber', 'License Number')}
                        {user.role === 'staff' && renderInputField('department', 'Department')}
                        <button type="submit" className={`w-full ${currentTheme.bg} text-white py-2 rounded-lg hover:opacity-90 transition-all font-semibold`}>
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 mt-4">
                         <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Full Name</span>
                            <span className="text-gray-800 dark:text-gray-100 font-semibold">{user.fullName}</span>
                        </div>
                         <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Email</span>
                            <span className="text-gray-800 dark:text-gray-200">{user.email}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Phone</span>
                            <span className="text-gray-800 dark:text-gray-200">{user.phone}</span>
                        </div>
                        {user.licenseNumber && (<div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700"><span className="text-gray-600 dark:text-gray-400 font-medium">License No.</span><span className="text-gray-800 dark:text-gray-200">{user.licenseNumber}</span></div>)}
                        {user.department && (<div className="flex justify-between py-3"><span className="text-gray-600 dark:text-gray-400 font-medium">Department</span><span className="text-gray-800 dark:text-gray-200">{user.department}</span></div>)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSection;