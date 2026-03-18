import React, { useState, useMemo } from 'react';
import { User, Booking, Vehicle, Driver, Notification } from '../types';
import { STAFF_NAV_ITEMS } from '../constants';
import ProfileDropdown from '../components/ProfileDropdown';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import ProfileSection from '../components/ProfileSection';
import ThemeToggle from '../components/ThemeToggle';
import GlobalSearch from '../components/GlobalSearch';
import { useToast } from '../contexts/ToastContext';
import NotificationDropdown from '../components/NotificationDropdown';
import AssignDriverVehicleModal from './AssignDriverVehicleModal';
import { useSharedState } from '../store';

interface StaffDashboardProps {
    user: User;
    onLogout: () => void;
    onUpdateUser: (updatedData: Partial<User>) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useSharedState();
    const { bookings, vehicles, drivers, notifications } = data;
    const { addToast } = useToast();

    // Modal State
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    // Booking form state
    const [bookingForm, setBookingForm] = useState({
        userName: '', userNumber: '', vehicleType: '', tripDetails: '', date: '', time: ''
    });

    const handleCreateBooking = (e: React.FormEvent) => {
        e.preventDefault();
        const bookingDateTime = new Date(`${bookingForm.date}T${bookingForm.time}`);
        if (bookingDateTime < new Date()) {
            addToast('Cannot create a booking for a past date or time.', 'error');
            return;
        }

        const newBooking: Booking = {
            id: 'B' + Date.now(),
            ...bookingForm,
            status: 'pending',
            driverId: null,
            vehicleId: null
        };
        setData(prev => ({ ...prev, bookings: [newBooking, ...prev.bookings] }));
        addToast('Booking created successfully!', 'success');
        setBookingForm({ userName: '', userNumber: '', vehicleType: '', tripDetails: '', date: '', time: '' });
        setActiveSection('viewBookings');
    };
    
    const handleOpenAssignModal = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setAssignModalOpen(true);
    };

    const handleCancelBooking = (bookingId: string) => {
        setData(prev => ({ ...prev, bookings: prev.bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b) }));
        addToast('Booking cancelled!', 'success');
    };

    const handleConfirmAssignment = (driverId: string, vehicleId: string) => {
        if (selectedBookingId) {
            const bookingToUpdate = bookings.find(b => b.id === selectedBookingId);
            const driver = drivers.find(d => d.id === driverId);
            if (bookingToUpdate && driver) {
                setData(prev => ({ 
                    ...prev, 
                    bookings: prev.bookings.map(b => b.id === selectedBookingId ? { ...b, status: 'awaiting_approval', driverId, vehicleId } : b),
                    notifications: [{ id: `notif-${Date.now()}`, message: `New trip request for ${bookingToUpdate.userName}.`, date: new Date().toISOString(), read: false, link: 'tripRequests' }, ...prev.notifications]
                }));
                addToast(`Booking sent to ${driver.name} for approval!`, 'info');
            }
            setAssignModalOpen(false);
            setSelectedBookingId(null);
        }
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
    
    const staffNotifications = useMemo(() => {
        return notifications.filter(n => n.link === 'viewBookings');
    }, [notifications]);

    const renderDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="My Bookings" value={bookings.length} description="Total created" icon="fa-calendar-plus" theme="purple" />
                <DashboardCard title="Available Vehicles" value={vehicles.filter(v => v.status === 'available').length} description="Ready to use" icon="fa-car" theme="blue" />
                <DashboardCard title="Active Drivers" value={drivers.filter(d => d.status === 'active').length} description="Available now" icon="fa-users" theme="green" />
                <DashboardCard title="Pending Bookings" value={bookings.filter(b => b.status === 'pending').length} description="Need approval" icon="fa-clock" theme="orange" />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Quick Actions</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => setActiveSection('createBooking')} className="bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900/80 p-6 rounded-lg text-center transition-all"><i className="fas fa-plus-circle text-3xl text-purple-600 dark:text-purple-400 mb-3"></i><p className="text-sm font-medium text-purple-800 dark:text-purple-300">Create Booking</p></button>
                    <button onClick={() => setActiveSection('viewBookings')} className="bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/80 p-6 rounded-lg text-center transition-all"><i className="fas fa-list text-3xl text-blue-600 dark:text-blue-400 mb-3"></i><p className="text-sm font-medium text-blue-800 dark:text-blue-300">View Bookings</p></button>
                    <button onClick={() => setActiveSection('vehicleStatus')} className="bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900/80 p-6 rounded-lg text-center transition-all"><i className="fas fa-car text-3xl text-green-600 dark:text-green-400 mb-3"></i><p className="text-sm font-medium text-green-800 dark:text-green-300">Vehicle Status</p></button>
                    <button onClick={() => setActiveSection('driverStatus')} className="bg-orange-50 dark:bg-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-900/80 p-6 rounded-lg text-center transition-all"><i className="fas fa-users text-3xl text-orange-600 dark:text-orange-400 mb-3"></i><p className="text-sm font-medium text-orange-800 dark:text-orange-300">Driver Status</p></button>
                </div>
            </div>
        </div>
    );

    const renderCreateBooking = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Create New Booking</h3>
            <form onSubmit={handleCreateBooking} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={bookingForm.userName} onChange={e => setBookingForm({...bookingForm, userName: e.target.value})} placeholder="Passenger's Full Name" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    <input type="tel" value={bookingForm.userNumber} onChange={e => setBookingForm({...bookingForm, userNumber: e.target.value})} placeholder="Passenger's Contact Number" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    <select value={bookingForm.vehicleType} onChange={e => setBookingForm({...bookingForm, vehicleType: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required>
                        <option value="">Select Vehicle Type</option>
                        {/* Dynamically populate vehicle types from available vehicles */}
                        {[...new Set(vehicles.map(v => v.type))].map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <input type="date" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                    <input type="time" value={bookingForm.time} onChange={e => setBookingForm({...bookingForm, time: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required />
                 </div>
                 <textarea value={bookingForm.tripDetails} onChange={e => setBookingForm({...bookingForm, tripDetails: e.target.value})} placeholder="Trip Details (e.g., Pickup, Destination)" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" rows={3} required></textarea>
                <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-semibold">Create Booking</button>
            </form>
        </div>
    );
    const renderViewBookings = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">All Bookings</h3>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr><th className="px-6 py-3">Passenger</th><th className="px-6 py-3">Vehicle</th><th className="px-6 py-3">Date & Time</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-center">Actions</th></tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-semibold">{b.userName}</td><td className="px-6 py-4">{b.vehicleType}</td><td className="px-6 py-4">{b.date} at {b.time}</td><td className="px-6 py-4"><span className={`px-2 py-1 font-semibold rounded-full text-xs ${b.status === 'completed' || b.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : b.status === 'pending' || b.status === 'awaiting_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{b.status.replace('_', ' ')}</span></td>
                                <td className="px-6 py-4 text-center">
                                    {b.status === 'pending' && (<>
                                        <button onClick={() => handleOpenAssignModal(b.id)} className="font-medium text-green-600 dark:text-green-500 hover:underline mr-4">Confirm & Assign</button>
                                        <button onClick={() => handleCancelBooking(b.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Cancel</button>
                                    </>)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>
    );
    const renderVehicleStatus = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Vehicle Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(v => (
                    <div key={v.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border-l-4 border-green-500">
                         <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{v.type}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{v.number}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${v.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : v.status === 'in-use' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{v.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    const renderDriverStatus = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Driver Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {drivers.map(d => (
                    <div key={d.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border-l-4 border-orange-500">
                         <div className="flex justify-between items-start">
                             <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{d.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{d.email}</p>
                            </div>
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${d.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{d.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return renderDashboard();
            case 'createBooking': return renderCreateBooking();
            case 'viewBookings': return renderViewBookings();
            case 'vehicleStatus': return renderVehicleStatus();
            case 'driverStatus': return renderDriverStatus();
            case 'profile': return <ProfileSection user={user} themeColor="purple" onUpdateUser={onUpdateUser} />;
            default: return renderDashboard();
        }
    };
    
    return (
        <div className="min-h-screen font-inter text-gray-800 dark:text-gray-200">
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
            <AssignDriverVehicleModal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onConfirm={handleConfirmAssignment}
                drivers={drivers.filter(d => d.status === 'active')}
                vehicles={vehicles.filter(v => v.status === 'available' && !bookings.some(b => b.vehicleId === v.id && b.status === 'awaiting_approval'))}
            />
            <header className="bg-white dark:bg-gray-800 shadow-md border-b-4 border-purple-600 dark:border-purple-500 sticky top-0 z-20">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        <div className="flex items-center">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-gray-600 dark:text-gray-300">
                                <i className="fas fa-bars text-2xl"></i>
                            </button>
                            <div className="flex items-center">
                                <i className="fas fa-user-tie text-3xl text-purple-600 dark:text-purple-400 mr-3"></i>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Staff Dashboard</h1>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center px-4">
                            <GlobalSearch 
                                bookings={bookings}
                                vehicles={vehicles}
                                drivers={drivers}
                                onNavigate={setActiveSection}
                            />
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <NotificationDropdown 
                                notifications={staffNotifications}
                                onNotificationClick={handleNotificationClick}
                                onMarkAllRead={handleMarkAllAsRead} // This was missing
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
                        navItems={STAFF_NAV_ITEMS} 
                        activeSection={activeSection} 
                        setActiveSection={setActiveSection} 
                        title="Staff Panel"
                        themeColor="purple"
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

export default StaffDashboard;