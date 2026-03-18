import React from 'react';
import { NavItem } from '../types';

interface SidebarProps {
    navItems: NavItem[];
    activeSection: string;
    setActiveSection: (section: string) => void;
    title: string;
    themeColor: 'blue' | 'green' | 'purple';
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, activeSection, setActiveSection, title, themeColor, isOpen, setIsOpen }) => {
    
    const colorClasses = {
        blue: { bg: 'bg-blue-600', text: 'text-white' },
        green: { bg: 'bg-green-600', text: 'text-white' },
        purple: { bg: 'bg-purple-600', text: 'text-white' },
    };

    const activeClass = `${colorClasses[themeColor].bg} ${colorClasses[themeColor].text}`;

    return (
        <aside className={`fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto w-64 bg-white dark:bg-gray-800 shadow-lg p-6 self-start transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    <i className="fas fa-times text-xl"></i>
                </button>
            </div>
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveSection(item.id);
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center font-medium ${
                            activeSection === item.id 
                                ? activeClass 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <i className={`fas fa-${item.icon} w-5 mr-3 text-center`}></i>
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
