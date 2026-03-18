import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '../types';

interface NotificationDropdownProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onMarkAllRead: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onNotificationClick, onMarkAllRead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const timeSince = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle notifications"
            >
                <i className="fas fa-bell text-xl"></i>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 z-20 overflow-hidden animate-fade-in-down">
                    <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={onMarkAllRead} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <button 
                                    key={n.id} 
                                    onClick={() => onNotificationClick(n)}
                                    className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start space-x-3 transition-colors"
                                >
                                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                                    <div className={n.read ? 'pl-5' : ''}>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeSince(n.date)}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;