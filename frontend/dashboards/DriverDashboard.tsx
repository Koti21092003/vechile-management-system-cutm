import React, { useState, useMemo, useCallback } from 'react';
import { User, Trip, Booking, FuelDetail, Vehicle, Notification } from '../types';
import { DRIVER_NAV_ITEMS } from '../constants';
import ProfileDropdown from '../components/ProfileDropdown';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import ProfileSection from '../components/ProfileSection';
import ThemeToggle from '../components/ThemeToggle';
import GlobalSearch from '../components/GlobalSearch';
import { useToast } from '../contexts/ToastContext';
import NotificationDropdown from '../components/NotificationDropdown';
import { useSharedState } from '../store';
 
interface DriverDashboardProps {
    user: User;
    onLogout: () => void;
    onUpdateUser: (updatedData: Partial<User>) => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useSharedState();
    const { bookings, vehicles, trips, fuelDetails, notifications, drivers } = data;
    const { addToast } = useToast();

    // Form states
    const [tripForm, setTripForm] = useState({ startLocation: '', endLocation: '', distance: '', duration: '', vehicleId: user.vehicleId || '' });
    const [fuelForm, setFuelForm] = useState({ vehicleId: user.vehicleId || '', fuelAmount: '', cost: '', station: '' });

    const handleStartTrip = (e: React.FormEvent) => {
        e.preventDefault();
        const newTrip: Trip = {
            id: 'T' + Date.now(),            
            driverId: String(user.id),
            ...tripForm,
            date: new Date().toISOString().split('T')[0],
            status: 'in-progress'
        };
        setData(prev => ({ ...prev, trips: [newTrip, ...prev.trips] }));
        addToast('Trip started successfully!', 'success');
        setTripForm({ startLocation: '', endLocation: '', distance: '', duration: '', vehicleId: user.vehicleId || '' });
        setActiveSection('tripHistory');
    };

    const handleCompleteTrip = (tripId: string) => {
        setData(prev => ({ ...prev, trips: prev.trips.map(t => t.id === tripId ? { ...t, status: 'completed' } : t) }));
        addToast('Trip completed!', 'success');
    };
    
    const handleAddFuelRecord = (e: React.FormEvent) => {
        e.preventDefault();
        const vehicle = vehicles.find(v => v.id === fuelForm.vehicleId);
        const newRecord: FuelDetail = {
            id: 'F' + Date.now(),
            driverId: String(user.id),
            vehicleId: fuelForm.vehicleId,
            vehicleNumber: vehicle?.number || 'N/A',
            vehicleType: vehicle?.type || 'N/A',
            fuelAmount: `${fuelForm.fuelAmount}L`,
            cost: `₹${fuelForm.cost}`,
            date: new Date().toISOString().split('T')[0],
            station: fuelForm.station
        };
        setData(prev => ({ ...prev, fuelDetails: [newRecord, ...prev.fuelDetails] }));
        addToast('Fuel record added!', 'success');
        setFuelForm({ vehicleId: user.vehicleId || '', fuelAmount: '', cost: '', station: '' });
    };

    const handleMarkAllAsRead = () => {
        setData(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })) }));
    };

    const handleNotificationClick = (notification: Notification) => {
        setData(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === notification.id ? { ...n, read: true } : n) }));
        if (notification.link && notification.link !== activeSection) {
            setActiveSection(notification.link);
        }
    };

    const driverNotifications = useMemo(() => {
        // Example: drivers see notifications about their trips
        return notifications.filter(n => n.link === 'tripHistory' || n.link === 'tripRequests');
    }, [notifications]);

    const handleTripRequest = useCallback((bookingId: string, response: 'approved' | 'declined') => {
        const bookingToUpdate = data.bookings.find(b => b.id === bookingId);
        if (!bookingToUpdate) return;

        if (response === 'approved') {
            setData(prev => ({
                ...prev,
                bookings: prev.bookings.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b),
                vehicles: prev.vehicles.map(v => v.id === bookingToUpdate.vehicleId ? { ...v, status: 'in-use' } : v),                
                notifications: [
                    { id: `notif-${Date.now()}`, message: `Driver ${user.fullName} approved booking for ${bookingToUpdate.userName}.`, date: new Date().toISOString(), read: false, link: 'viewBookings' },
                    ...prev.notifications
                ]
            }));
            addToast('Trip request approved!', 'success');
        } else {
            setData(prev => ({
                ...prev,
                bookings: prev.bookings.map(b => b.id === bookingId ? { ...b, driverId: null, vehicleId: null, status: 'pending' } : b),
                notifications: [
                    { id: `notif-${Date.now()}`, message: `Driver ${user.fullName} declined booking for ${bookingToUpdate.userName}.`, date: new Date().toISOString(), read: false, link: 'viewBookings' },
                    ...prev.notifications
                ]
            }));
            addToast('Trip request declined.', 'info');
        }
    }, [data.bookings, addToast, setData]);

    const handleCompleteBooking = (bookingId: string) => {
        const bookingToUpdate = data.bookings.find(b => b.id === bookingId);
        if (!bookingToUpdate) return;

        setData(prev => ({
            ...prev,
            bookings: prev.bookings.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b),
            vehicles: prev.vehicles.map(v => v.id === bookingToUpdate.vehicleId ? { ...v, status: 'available' } : v),
            notifications: [{ id: `notif-${Date.now()}`, message: `Trip for ${bookingToUpdate.userName} has been completed.`, date: new Date().toISOString(), read: false, link: 'viewBookings' }, ...prev.notifications],
        }));
        addToast('Booking marked as complete!', 'success');
    };

    const renderDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Trips" value={trips.filter(t => t.driverId === String(user.id)).length} description="This month" icon="fa-route" theme="green" />
                <DashboardCard title="Active Trips" value={trips.filter(t => t.status === 'in-progress').length} description="In progress" icon="fa-clock" theme="blue" />
                <DashboardCard title="Bookings" value={bookings.filter(b => b.driverId === String(user.id)).length} description="Assigned to me" icon="fa-calendar-check" theme="purple" />
                <DashboardCard title="My Vehicle" value={user.vehicleId || 'N/A'} description="Assigned vehicle" icon="fa-car" theme="orange" />
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Quick Actions</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => setActiveSection('startTrip')} className="bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900/80 p-6 rounded-lg text-center transition-all"><i className="fas fa-play-circle text-3xl text-green-600 dark:text-green-400 mb-3"></i><p className="text-sm font-medium text-green-800 dark:text-green-300">Start Trip</p></button>
                    <button onClick={() => setActiveSection('tripHistory')} className="bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/80 p-6 rounded-lg text-center transition-all"><i className="fas fa-history text-3xl text-blue-600 dark:text-blue-400 mb-3"></i><p className="text-sm font-medium text-blue-800 dark:text-blue-300">Trip History</p></button>
                    <button onClick={() => setActiveSection('fuelManagement')} className="bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900/80 p-6 rounded-lg text-center transition-all"><i className="fas fa-gas-pump text-3xl text-purple-600 dark:text-purple-400 mb-3"></i><p className="text-sm font-medium text-purple-800 dark:text-purple-300">Fuel Records</p></button>
                    <button onClick={() => setActiveSection('myBookings')} className="bg-orange-50 dark:bg-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-900/80 p-6 rounded-lg text-center transition-all"><i className="fas fa-calendar text-3xl text-orange-600 dark:text-orange-400 mb-3"></i><p className="text-sm font-medium text-orange-800 dark:text-orange-300">My Bookings</p></button>
                </div>
            </div>
        </div>
    );

    const renderStartTrip = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Start New Trip</h3>
            <form onSubmit={handleStartTrip} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input value={tripForm.startLocation} onChange={e => setTripForm({...tripForm, startLocation: e.target.value})} placeholder="Start Location" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                     <input value={tripForm.endLocation} onChange={e => setTripForm({...tripForm, endLocation: e.target.value})} placeholder="End Location" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                     <input value={tripForm.distance} onChange={e => setTripForm({...tripForm, distance: e.target.value})} placeholder="Distance (e.g., 25 km)" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                     <input value={tripForm.duration} onChange={e => setTripForm({...tripForm, duration: e.target.value})} placeholder="Duration (e.g., 45 min)" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                </div>
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center"><i className="fas fa-play mr-2"></i>Start Trip</button>
            </form>
        </div>
    );
    const renderTripHistory = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Trip History</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Route</th><th className="px-6 py-3">Distance</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.filter(t => t.driverId === String(user.id)).map(trip => (
                            <tr key={trip.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-semibold">{trip.startLocation} → {trip.endLocation}</td>
                                <td className="px-6 py-4">{trip.distance}</td>
                                <td className="px-6 py-4">{trip.date}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 font-semibold rounded-full text-xs ${trip.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>{trip.status}</span></td>
                                <td className="px-6 py-4 text-center">
                                    {trip.status === 'in-progress' && <button onClick={() => handleCompleteTrip(trip.id)} className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600">Complete</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    const renderFuelManagement = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Fuel Management</h3>
            <form onSubmit={handleAddFuelRecord} className="space-y-4 mb-8 p-4 border rounded-lg dark:border-gray-700">
                <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Add New Fuel Record</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" value={fuelForm.fuelAmount} onChange={e => setFuelForm({...fuelForm, fuelAmount: e.target.value})} placeholder="Fuel Amount (L)" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    <input type="number" value={fuelForm.cost} onChange={e => setFuelForm({...fuelForm, cost: e.target.value})} placeholder="Total Cost (₹)" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    <input value={fuelForm.station} onChange={e => setFuelForm({...fuelForm, station: e.target.value})} placeholder="Fuel Station" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                </div>
                <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-semibold">Add Record</button>
            </form>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Vehicle</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Cost</th><th className="px-6 py-3">Station</th></tr>
                    </thead>
                    <tbody>
                        {fuelDetails.filter(f => f.driverId === user.id).map(r => <tr key={r.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"><td className="px-6 py-4">{r.date}</td><td className="px-6 py-4">{r.vehicleNumber}</td><td className="px-6 py-4">{r.fuelAmount}</td><td className="px-6 py-4">{r.cost}</td><td className="px-6 py-4">{r.station}</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
    const renderMyBookings = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">My Assigned Bookings</h3>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr><th className="px-6 py-3">Passenger</th><th className="px-6 py-3">Details</th><th className="px-6 py-3">Date & Time</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-center">Action</th></tr>
                    </thead>
                    <tbody>
                        {bookings.filter(b => b.driverId === String(user.id)).map(b => (
                             <tr key={b.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 font-semibold">{b.userName} <br/><span className="font-normal text-gray-500 dark:text-gray-400">{b.userNumber}</span></td>
                                <td className="px-6 py-4">{b.tripDetails}</td>
                                <td className="px-6 py-4">{b.date} at {b.time}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 font-semibold rounded-full text-xs ${b.status === 'completed' || b.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : b.status === 'pending' || b.status === 'awaiting_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{b.status.replace('_', ' ')}</span></td>
                                <td className="px-6 py-4 text-center">
                                    {b.status === 'approved' && <button onClick={() => handleCompleteBooking(b.id)} className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600">Complete</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>
    );

    const renderTripRequests = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Pending Trip Requests</h3>
            <div className="space-y-4">                
                {bookings.filter(b => drivers.find(d => d.id === b.driverId)?.email === user.email && b.status === 'awaiting_approval').length > 0 ? (
                    bookings.filter(b => drivers.find(d => d.id === b.driverId)?.email === user.email && b.status === 'awaiting_approval').map(b => (
                        <div key={b.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border-l-4 border-yellow-500">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{b.tripDetails}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">For: {b.userName} on {b.date} at {b.time}</p>
                                </div>
                                <div className="flex space-x-2 mt-3 sm:mt-0">
                                    <button onClick={() => handleTripRequest(b.id, 'approved')} className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600">Approve</button>
                                    <button onClick={() => handleTripRequest(b.id, 'declined')} className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600">Decline</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No pending trip requests.</p>
                )}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return renderDashboard();
            case 'tripRequests': return renderTripRequests();
            case 'startTrip': return renderStartTrip();
            case 'tripHistory': return renderTripHistory();
            case 'fuelManagement': return renderFuelManagement();
            case 'myBookings': return renderMyBookings();
            case 'profile': return <ProfileSection user={user} themeColor="green" onUpdateUser={onUpdateUser} />;
            default: return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen font-inter text-gray-800 dark:text-gray-200">
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
            <header className="bg-white dark:bg-gray-800 shadow-md border-b-4 border-green-600 dark:border-green-500 sticky top-0 z-20">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        <div className="flex items-center">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-gray-600 dark:text-gray-300">
                                <i className="fas fa-bars text-2xl"></i>
                            </button>
                            <div className="flex items-center">
                                <i className="fas fa-user-shield text-3xl text-green-600 dark:text-green-400 mr-3"></i>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Driver Dashboard</h1>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center px-4">
                           <GlobalSearch 
                                trips={trips.filter(t => t.driverId === String(user.id))}
                                bookings={bookings}
                                onNavigate={setActiveSection}
                           />
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <NotificationDropdown 
                                notifications={driverNotifications}
                                onNotificationClick={handleNotificationClick}
                                onMarkAllRead={handleMarkAllAsRead}
                            />
                            <ThemeToggle />
                            <ProfileDropdown user={user} onLogout={onLogout} onProfileClick={() => setActiveSection('profile')} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-screen-2xl mx-auto">
                <div className="flex flex-col lg:flex-row">
                    <Sidebar 
                        navItems={DRIVER_NAV_ITEMS} 
                        activeSection={activeSection} 
                        setActiveSection={setActiveSection} 
                        title="Driver Panel"
                        themeColor="green"
                        isOpen={isSidebarOpen}
                        setIsOpen={setSidebarOpen}
                    />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;