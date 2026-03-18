import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface ProfileDropdownProps {
    user: User;
    onLogout: () => void;
    onProfileClick: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout, onProfileClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getInitials = (name: string): string => {
        if (!name) return user.username.charAt(0).toUpperCase();
        return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    };

    const getRoleColor = (role: string): string => {
        switch (role) {
            case 'admin': return 'bg-blue-500';
            case 'driver': return 'bg-green-500';
            case 'staff': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 transition-all duration-300 hover:shadow-md"
            >
                <div className={`w-10 h-10 ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden`}>
                    {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        getInitials(user.fullName)
                    )}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.fullName || user.username}</p>
                    <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>
                <i className={`fas fa-chevron-down transition-all duration-300 text-gray-600 dark:text-gray-300 ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 z-20 overflow-hidden animate-fade-in-down">
                    <div className={`${getRoleColor(user.role)} p-4 text-white`}>
                        <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold overflow-hidden`}>
                                {user.profilePhoto ? (
                                    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(user.fullName)
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold">{user.fullName || user.username}</h3>
                                <p className="text-sm opacity-90">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="py-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onProfileClick();
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            <i className="fas fa-user-circle mr-3 w-5 text-center"></i>
                            My Profile
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400 transition-colors"
                        >
                            <i className="fas fa-sign-out-alt mr-3 w-5 text-center"></i>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;