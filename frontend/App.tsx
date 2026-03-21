import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { io } from 'socket.io-client';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [data, setData] = useSharedState();
    const [authView, setAuthView] = useState<AuthView>('login');

    // 🌐 REAL-TIME SOCKET CONNECTION
    useEffect(() => {
        if (!user) return;
        const api = import.meta.env.VITE_API_URL;
        const socketUrl = api.replace('/api', '');
        const socket = io(socketUrl, { withCredentials: true });

        socket.on('data_changed', async (payload: { collection: string }) => {
            console.log('⚡ Real-time update:', payload.collection);
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Determine fetch path
                let fetchPath = payload.collection;
                if (payload.collection === 'fuelDetails') fetchPath = 'fuel';
                
                const response = await fetch(`${api}/${fetchPath}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) return;
                
                const json = await response.json();
                let collectionData = json.data?.[payload.collection === 'fuelDetails' ? 'fuelRecords' : payload.collection];
                
                if (collectionData) {
                    setData(prev => {
                        const newState = { ...prev };
                        if (payload.collection === 'bookings') {
                            newState.bookings = collectionData.map((b: any) => ({ ...b, id: b._id, time: b.time || b.date?.split('T')[1]?.slice(0, 5) || '12:00', date: b.date?.split('T')[0], driverId: typeof b.driverId === 'object' && b.driverId ? b.driverId._id : b.driverId, vehicleId: typeof b.vehicleId === 'object' && b.vehicleId ? b.vehicleId._id : b.vehicleId, userName: b.userName || (b.userId && b.userId.fullName ? b.userId.fullName : 'Unknown'), userNumber: b.userNumber || (b.userId && b.userId.phone ? b.userId.phone : 'N/A') }));
                        } else if (payload.collection === 'trips') {
                            newState.trips = collectionData.map((t: any) => ({ ...t, id: t._id, date: t.date?.split('T')[0], driverId: typeof t.driverId === 'object' && t.driverId ? t.driverId._id : t.driverId, vehicleId: typeof t.vehicleId === 'object' && t.vehicleId ? t.vehicleId._id : t.vehicleId }));
                        } else if (payload.collection === 'users') {
                            newState.users = collectionData.map((u: any) => ({ ...u, id: u._id, joinDate: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0] }));
                        } else if (payload.collection === 'vehicles') {
                            newState.vehicles = collectionData.map((v: any) => ({ ...v, id: v._id }));
                        } else if (payload.collection === 'drivers') {
                            newState.drivers = collectionData.map((d: any) => ({ ...d, id: d._id }));
                        } else if (payload.collection === 'fuelDetails') {
                            newState.fuelDetails = collectionData.map((f: any) => ({ ...f, id: f._id, date: f.date?.split('T')[0], driverId: typeof f.driverId === 'object' && f.driverId ? f.driverId._id : f.driverId, vehicleNumber: f.vehicleNumber || (typeof f.vehicleId === 'object' && f.vehicleId ? f.vehicleId.number : 'Unknown') }));
                        }
                        return newState;
                    });
                }
            } catch (err) {
                console.error('Socket refetch failed:', err);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user, setData]);

    // 🛡️ SESSION RESTORATION (PERSIST LOGIN)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !user) {
            const api = import.meta.env.VITE_API_URL;
            const headers = { 'Authorization': `Bearer ${token}` };
            
            fetch(`${api}/auth/me`, { headers })
                .then(res => res.json())
                .then(result => {
                    if (result.status === 'success') {
                        const userData = result.data.user;
                        setUser({
                            id: userData._id,
                            fullName: userData.fullName,
                            email: userData.email,
                            role: userData.role,
                            joinDate: userData.createdAt ? userData.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                            profilePhoto: userData.profilePhoto ? (userData.profilePhoto.startsWith('http') ? userData.profilePhoto : `${api.replace('/api', '')}${userData.profilePhoto}`) : undefined,
                            phone: userData.phone,
                            department: userData.department,
                            licenseNumber: userData.licenseNumber
                        } as any);

                        // Trigger global data fetch
                        Promise.all([
                            fetch(`${api}/users`, { headers }),
                            fetch(`${api}/vehicles`, { headers }),
                            fetch(`${api}/drivers`, { headers }),
                            fetch(`${api}/bookings`, { headers }),
                            fetch(`${api}/trips`, { headers }),
                            fetch(`${api}/fuel`, { headers }),
                            fetch(`${api}/notifications`, { headers })
                        ]).then(async ([uRes, vRes, dRes, bRes, tRes, fRes, nRes]) => {
                            const users = (await uRes.json()).data?.users || [];
                            const vehicles = (await vRes.json()).data?.vehicles || [];
                            const drivers = (await dRes.json()).data?.drivers || [];
                            const bookings = (await bRes.json()).data?.bookings || [];
                            const trips = (await tRes.json()).data?.trips || [];
                            const fuelDetails = (await fRes.json()).data?.fuelRecords || [];
                            const notifications = (await nRes.json()).data?.notifications || [];

                            setData(() => ({
                                users: users.map((u: any) => ({ ...u, id: u._id, joinDate: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0] })),
                                vehicles: vehicles.map((v: any) => ({ ...v, id: v._id })),
                                drivers: drivers.map((d: any) => ({ ...d, id: d._id })),
                                bookings: bookings.map((b: any) => ({ ...b, id: b._id, time: b.time || b.date?.split('T')[1]?.slice(0, 5) || '12:00', date: b.date?.split('T')[0], driverId: typeof b.driverId === 'object' && b.driverId ? b.driverId._id : b.driverId, vehicleId: typeof b.vehicleId === 'object' && b.vehicleId ? b.vehicleId._id : b.vehicleId, userName: b.userName || (b.userId && b.userId.fullName ? b.userId.fullName : 'Unknown'), userNumber: b.userNumber || (b.userId && b.userId.phone ? b.userId.phone : 'N/A') })),
                                trips: trips.map((t: any) => ({ ...t, id: t._id, date: t.date?.split('T')[0], driverId: typeof t.driverId === 'object' && t.driverId ? t.driverId._id : t.driverId, vehicleId: typeof t.vehicleId === 'object' && t.vehicleId ? t.vehicleId._id : t.vehicleId })),
                                fuelDetails: fuelDetails.map((f: any) => ({ ...f, id: f._id, date: f.date?.split('T')[0], driverId: typeof f.driverId === 'object' && f.driverId ? f.driverId._id : f.driverId, vehicleNumber: f.vehicleNumber || (typeof f.vehicleId === 'object' && f.vehicleId ? f.vehicleId.number : 'Unknown') })),
                                notifications: notifications.map((n: any) => ({ ...n, id: n._id }))
                            }));
                        });
                    } else {
                        localStorage.removeItem('token');
                    }
                }).catch(() => localStorage.removeItem('token'));
        }
    }, [user, setData]);

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
                        bookings: bookings.map((b: any) => ({ ...b, id: b._id, time: b.time || b.date?.split('T')[1]?.slice(0, 5) || '12:00', date: b.date?.split('T')[0], driverId: typeof b.driverId === 'object' && b.driverId ? b.driverId._id : b.driverId, vehicleId: typeof b.vehicleId === 'object' && b.vehicleId ? b.vehicleId._id : b.vehicleId, userName: b.userName || (b.userId && b.userId.fullName ? b.userId.fullName : 'Unknown'), userNumber: b.userNumber || (b.userId && b.userId.phone ? b.userId.phone : 'N/A') })),
                        trips: trips.map((t: any) => ({ ...t, id: t._id, date: t.date?.split('T')[0], driverId: typeof t.driverId === 'object' && t.driverId ? t.driverId._id : t.driverId, vehicleId: typeof t.vehicleId === 'object' && t.vehicleId ? t.vehicleId._id : t.vehicleId })),
                        fuelDetails: fuelDetails.map((f: any) => ({ ...f, id: f._id, date: f.date?.split('T')[0], driverId: typeof f.driverId === 'object' && f.driverId ? f.driverId._id : f.driverId, vehicleNumber: f.vehicleNumber || (typeof f.vehicleId === 'object' && f.vehicleId ? f.vehicleId.number : 'Unknown') })),
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