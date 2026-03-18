

import React, { useState, useCallback, useMemo } from 'react';
import Login from './components/Login';
import AdminDashboard from './dashboards/AdminDashboard';
import DriverDashboard from './dashboards/DriverDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import { User, UserRole, AuthView } from './types';
import { useSharedState } from './store';
import ToastContainer from './components/ToastContainer';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [data, setData] = useSharedState();
    const { users } = data;
    const [authView, setAuthView] = useState<AuthView>('login');

    const handleLogin = useCallback((email: string, password: string): boolean => {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            return true;
        }
        return false;
    }, [users]);

    const handleLogout = useCallback(() => {
        setUser(null);
        setAuthView('login');
    }, []);

    const handleUpdateUser = useCallback((updatedData: Partial<User>) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const newUserData = { ...currentUser, ...updatedData };
            setData(prev => ({ ...prev, users: prev.users.map(u => u.id === currentUser.id ? newUserData : u) }));
            return newUserData;
        });
    }, []);
    
    const handleRegister = (newUser: Omit<User, 'id' | 'joinDate'>): { success: boolean, message: string } => {
        const userExists = users.some(u => u.email === newUser.email);
        if (userExists) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const createdUser: User = {
            ...newUser,
            id: users.length + 1,
            joinDate: new Date().toISOString().split('T')[0],
        };
        setData(prev => ({ ...prev, users: [...prev.users, createdUser] }));
        setAuthView('login');
        return { success: true, message: 'Registration successful! Please log in.' };
    };

    const handlePasswordReset = (email: string, newPassword: string): boolean => {
        let userFound = false;
        setData(prev => ({ ...prev, users: prev.users.map(u => {
            if (u.email === email) {
                userFound = true;
                return { ...u, password: newPassword };
            }
            return u;
        })}));
        
        if (userFound) {
            setAuthView('login');
        }
        return userFound;
    };
    
    const systemInstruction = useMemo(() => {
        if (!user) return '';
        const dataContext = JSON.stringify({
            vehicles: data.vehicles,
            bookings: data.bookings,
            drivers: data.drivers,
        });

        return `You are an AI assistant for a Vehicle Management System.
        Your name is VMS-Bot.
        The current user is ${user.fullName}, who is a(n) ${user.role}.
        Here is the current system data (in JSON format) for your reference: ${dataContext}.
        Use this data to answer user questions about bookings, vehicles, etc.
        If asked about locations, routes, or nearby places, use your available tools.
        Be helpful, concise, and friendly.`;
    }, [user, data]);


    const renderAuth = () => {
        switch (authView) {
            case 'signup':
                return <Signup onRegister={handleRegister} onSwitchToLogin={() => setAuthView('login')} />;
            case 'forgotPassword':
                return <ForgotPassword onPasswordReset={handlePasswordReset} onSwitchToLogin={() => setAuthView('login')} />;
            case 'login':
            default:
                return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgotPassword')} />;
        }
    }

    const renderDashboard = () => {
        if (!user) return null;
        switch (user.role) {
            case 'admin':
                return <AdminDashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
            case 'driver':
                return <DriverDashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
            case 'staff':
                return <StaffDashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
            default:
                 return null;
        }
    }

    return (
        <>
            {!user ? renderAuth() : renderDashboard()}
            {user && <Chatbot systemInstruction={systemInstruction} />}
            <ToastContainer />
        </>
    );
};

export default App;
