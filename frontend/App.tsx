import React, { useState, useCallback, useMemo } from 'react';
import Login from './components/Login';
import AdminDashboard from './dashboards/AdminDashboard';
import DriverDashboard from './dashboards/DriverDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import { User, AuthView } from './types';
import { useSharedState } from './store';
import ToastContainer from './components/ToastContainer';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [data, setData] = useSharedState();
    const [authView, setAuthView] = useState<AuthView>('login');

    // ✅ LOGIN (BACKEND CONNECTED)
    const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            console.log("LOGIN RESPONSE:", result);

            if (response.ok && result.data?.token) {
                const token = result.data.token;
                localStorage.setItem('token', token);

                const userData = result.data.user;
                const loggedInUser: any = {
                    id: userData._id,
                    fullName: userData.fullName,
                    email: userData.email,
                    role: userData.role,
                    joinDate: new Date().toISOString().split('T')[0],
                };
                setUser(loggedInUser);

                // Fetch Global App Data from Backend
                try {
                    const headers = { 'Authorization': `Bearer ${token}` };
                    const api = import.meta.env.VITE_API_URL;
                    const [uRes, vRes, dRes, bRes, tRes, fRes, nRes] = await Promise.all([
                        fetch(`${api}/users`, { headers }),
                        fetch(`${api}/vehicles`, { headers }),
                        fetch(`${api}/drivers`, { headers }),
                        fetch(`${api}/bookings`, { headers }),
                        fetch(`${api}/trips`, { headers }),
                        fetch(`${api}/fuel`, { headers }),
                        fetch(`${api}/notifications`, { headers })
                    ]);

                    const users = (await uRes.json()).data?.users || [];
                    const vehicles = (await vRes.json()).data?.vehicles || [];
                    const drivers = (await dRes.json()).data?.drivers || [];
                    const bookings = (await bRes.json()).data?.bookings || [];
                    const trips = (await tRes.json()).data?.trips || [];
                    const fuelDetails = (await fRes.json()).data?.fuelRecords || [];
                    const notifications = (await nRes.json()).data?.notifications || [];

                    console.log('Fetched ALL Backend Data Successfully 🎊');

                    setData(() => ({
                        users: users.map((u: any) => ({ ...u, id: u._id, joinDate: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0] })),
                        vehicles: vehicles.map((v: any) => ({ ...v, id: v._id })),
                        drivers: drivers.map((d: any) => ({ ...d, id: d._id })),
                        bookings: bookings.map((b: any) => ({ ...b, id: b._id, time: b.time || b.date?.split('T')[1]?.slice(0, 5) || '12:00', date: b.date?.split('T')[0] })),
                        trips: trips.map((t: any) => ({ ...t, id: t._id, date: t.date?.split('T')[0] })),
                        fuelDetails: fuelDetails.map((f: any) => ({ ...f, id: f._id, date: f.date?.split('T')[0] })),
                        notifications: notifications.map((n: any) => ({ ...n, id: n._id }))
                    }));
                } catch (dataErr) {
                    console.error('Initial data fetch failed:', dataErr);
                }

                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }, [setData]);

    // ✅ LOGOUT
    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        setAuthView('login');
    }, []);

    // ✅ UPDATE USER
    const handleUpdateUser = useCallback((updatedData: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...updatedData } : null);
    }, []);

    // ✅ REGISTER (BACKEND CONNECTED)
    const handleRegister = async (newUser: Omit<User, 'id' | 'joinDate'>) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser)
            });
            
            const result = await response.json();
            
            if (response.ok && result.status === 'success') {
                setAuthView('login');
                return { success: true, message: 'Registered successfully! You can now log in.' };
            } else {
                return { success: false, message: result.message || 'Registration failed. Please check the provided data.' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error during registration.' };
        }
    };

    // ✅ TEMP RESET
    const handlePasswordReset = () => {
        setAuthView('login');
        return true;
    };

    // 🤖 CHATBOT
    const systemInstruction = useMemo(() => {
        if (!user) return '';

        return `User: ${user.fullName} (${user.role})`;
    }, [user]);

    // 🔐 AUTH UI
    const renderAuth = () => {
        switch (authView) {
            case 'signup':
                return <Signup onRegister={handleRegister} onSwitchToLogin={() => setAuthView('login')} />;
            case 'forgotPassword':
                return <ForgotPassword onPasswordReset={handlePasswordReset} onSwitchToLogin={() => setAuthView('login')} />;
            default:
                return (
                    <Login
                        onLogin={handleLogin}
                        onSwitchToSignup={() => setAuthView('signup')}
                        onSwitchToForgotPassword={() => setAuthView('forgotPassword')}
                    />
                );
        }
    };

    // 📊 DASHBOARD
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
    };

    return (
        <>
            {!user ? renderAuth() : renderDashboard()}
            {user && <Chatbot systemInstruction={systemInstruction} />}
            <ToastContainer />
        </>
    );
};

export default App;