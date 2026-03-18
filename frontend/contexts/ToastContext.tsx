import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Toast, ToastContextType, ToastType } from '../types';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[100] w-full max-w-xs space-y-3">
                {toasts.map(toast => (
                    <ToastNotification key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// A standalone component for the Toast UI, kept here for simplicity
const ToastNotification: React.FC<{ toast: Toast, onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onRemove]);

    const typeClasses = {
        success: {
            bg: 'bg-green-50 dark:bg-green-900/50',
            text: 'text-green-800 dark:text-green-200',
            icon: 'fa-check-circle',
            iconColor: 'text-green-500 dark:text-green-400'
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/50',
            text: 'text-red-800 dark:text-red-200',
            icon: 'fa-times-circle',
            iconColor: 'text-red-500 dark:text-red-400'
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/50',
            text: 'text-blue-800 dark:text-blue-200',
            icon: 'fa-info-circle',
            iconColor: 'text-blue-500 dark:text-blue-400'
        }
    };

    const currentType = typeClasses[toast.type];

    return (
        <div className={`flex items-start w-full p-4 rounded-lg shadow-lg animate-fade-in-down ${currentType.bg} border border-black/5 dark:border-white/10`}>
            <div className={`flex-shrink-0 text-xl ${currentType.iconColor}`}>
                <i className={`fas ${currentType.icon}`}></i>
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className={`text-sm font-medium ${currentType.text}`}>{toast.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button
                    onClick={() => onRemove(toast.id)}
                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <span className="sr-only">Close</span>
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};