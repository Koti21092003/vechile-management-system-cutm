import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: string;
    theme: 'blue' | 'green' | 'purple' | 'orange';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description, icon, theme }) => {
    const themeClasses = {
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
        green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400' },
        orange: { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-400' },
    };
    
    const currentTheme = themeClasses[theme];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 card-hover flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${currentTheme.bg}`}>
                <i className={`fas ${icon} text-3xl ${currentTheme.text}`}></i>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    );
};

export default DashboardCard;