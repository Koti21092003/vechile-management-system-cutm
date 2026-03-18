import React, { useState, useMemo } from 'react';
import { User, Vehicle, Notification } from '../types';
import { ADMIN_NAV_ITEMS } from '../constants';
import ProfileDropdown from '../components/ProfileDropdown';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import ProfileSection from '../components/ProfileSection';
import ThemeToggle from '../components/ThemeToggle';
import Analytics from '../components/Analytics';
import GlobalSearch from '../components/GlobalSearch';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';
import EditUserModal from '../components/EditUserModal';
import { useSharedState } from '../store';
import NotificationDropdown from '../components/NotificationDropdown';

interface AdminDashboardProps {
    user: User;
    onLogout: () => void;
    onUpdateUser: (updatedData: Partial<User>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useSharedState();
    const { users, vehicles, bookings, trips, fuelDetails, notifications } = data;
    const { addToast } = useToast();

    // Modal States
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // User form state
    const [userForm, setUserForm] = useState({
        username: '', password: '', role: '', fullName: '', email: '', phone: '', vehicleId: '', vehicleType: '', department: ''
    }); 

    // Vehicle form state
    const [vehicleForm, setVehicleForm] = useState({
        type: '', number: '', status: 'available'
    });

    // Maintenance form state
    const [maintenanceForm, setMaintenanceForm] = useState({
        vehicleId: '', status: 'maintenance' as 'available' | 'in-use' | 'maintenance', problem: ''
    });

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userForm.role) {
            addToast("Please select a role.", 'error');
            return;
        }
        const newUser: User = {
            // Use a more robust ID generation to avoid duplicates if users are deleted
            id: 'U' + Date.now(),
            username: userForm.username, password: userForm.password, fullName: userForm.fullName, email: userForm.email, phone: userForm.phone, 
            role: userForm.role as 'admin' | 'staff' | 'driver',
            joinDate: new Date().toISOString().split('T')[0],
            vehicleId: userForm.role === 'driver' ? userForm.vehicleId : undefined,
            vehicleType: userForm.role === 'driver' ? userForm.vehicleType : undefined,
            department: userForm.role === 'staff' ? userForm.department : undefined,
        };
        setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
        addToast('User added successfully!', 'success');
        setUserForm({ username: '', password: '', role: '', fullName: '', email: '', phone: '', vehicleId: '', vehicleType: '', department: '' });
    };

    const handleAddVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        const newVehicle: Vehicle = {
            id: 'V' + String(Date.now()).slice(-3),
            ...vehicleForm,
            status: vehicleForm.status as 'available' | 'in-use' | 'maintenance',
            driverId: null
        };
        setData(prev => ({ ...prev, vehicles: [...prev.vehicles, newVehicle] }));
        addToast('Vehicle added successfully!', 'success');
        setVehicleForm({ type: '', number: '', status: 'available' });
    };

    const handleUpdateVehicleStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!maintenanceForm.vehicleId) {
            addToast('Please select a vehicle to update.', 'error');
            return;
        }
        setData(prev => ({ ...prev, vehicles: prev.vehicles.map(v => 
            v.id === maintenanceForm.vehicleId 
            ? { ...v, status: maintenanceForm.status, maintenanceProblem: maintenanceForm.status === 'maintenance' ? maintenanceForm.problem : null } 
            : v
        )}));
        addToast('Vehicle status updated!', 'success');
        setMaintenanceForm({ vehicleId: '', status: 'maintenance', problem: '' });
    };
    
    const openEditModal = (userToEdit: User) => {
        setSelectedUser(userToEdit);
        setEditModalOpen(true);
    };

    const handleUpdateUserInList = (updatedUser: User) => {
        setData(prev => ({ ...prev, users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u) }));
        addToast('User updated successfully!', 'success');
        setEditModalOpen(false);
        setSelectedUser(null);
    };

    const openDeleteModal = (userToDelete: User) => {
        setSelectedUser(userToDelete);
        setDeleteModalOpen(true);
    };

    const confirmDeleteUser = () => {
        if (selectedUser) {
            setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== selectedUser.id) }));
            addToast('User deleted.', 'success');
        }
        setDeleteModalOpen(false);
        setSelectedUser(null);
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

    const adminNotifications = useMemo(() => {
        return notifications.filter(n => n.link === 'userManagement' || n.link === 'vehicleManagement');
    }, [notifications]);

    const renderDashboard = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Users" value={users.length} description="System users" icon="fa-users" theme="blue" />
                <DashboardCard title="Total Vehicles" value={vehicles.length} description="Fleet size" icon="fa-car" theme="green" />
                <DashboardCard title="Total Bookings" value={bookings.length} description="All time" icon="fa-calendar-check" theme="purple" />
                <DashboardCard title="Total Trips" value={trips.length} description="Completed" icon="fa-route" theme="orange" />
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">User Distribution</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Admins</span><span className="font-medium text-gray-800 dark:text-gray-200">{users.filter(u => u.role === 'admin').length}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Drivers</span><span className="font-medium text-gray-800 dark:text-gray-200">{users.filter(u => u.role === 'driver').length}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Staff</span><span className="font-medium text-gray-800 dark:text-gray-200">{users.filter(u => u.role === 'staff').length}</span></div>
                        </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                        <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Vehicle Status</h4>
                         <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Available</span><span className="font-medium text-gray-800 dark:text-gray-200">{vehicles.filter(v => v.status === 'available').length}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">In Use</span><span className="font-medium text-gray-800 dark:text-gray-200">{vehicles.filter(v => v.status === 'in-use').length}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Maintenance</span><span className="font-medium text-gray-800 dark:text-gray-200">{vehicles.filter(v => v.status === 'maintenance').length}</span></div>
                        </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                        <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2">Booking Status</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Completed</span><span className="font-medium text-gray-800 dark:text-gray-200">{bookings.filter(b => b.status === 'completed').length}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Pending</span><span className="font-medium text-gray-800 dark:text-gray-200">{bookings.filter(b => b.status === 'pending').length}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderUserManagement = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Add New User</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} placeholder="Username" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required />
                        <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="Password" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required />
                        <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required>
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="driver">Driver</option>
                            <option value="staff">Staff</option>
                        </select>
                        <input value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required />
                        <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="Email" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required />
                        <input type="tel" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required />
                        {userForm.role === 'driver' && (
                            <>
                                <input value={userForm.vehicleId} onChange={e => setUserForm({...userForm, vehicleId: e.target.value})} placeholder="Vehicle ID (Optional)" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" />
                                <input value={userForm.vehicleType} onChange={e => setUserForm({...userForm, vehicleType: e.target.value})} placeholder="Vehicle Type (Optional)" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" />
                            </>
                        )}
                        {userForm.role === 'staff' && (
                            <>
                                <input value={userForm.department} onChange={e => setUserForm({...userForm, department: e.target.value})} placeholder="Department (Optional)" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" />
                            </>
                        )}
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">Add User</button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">All Users</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Join Date</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{u.id}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100">{u.fullName}</td>
                                    <td className="px-6 py-4">{u.email}</td>
                                    <td className="px-6 py-4 capitalize">{u.role}</td>
                                    <td className="px-6 py-4">{u.joinDate}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => openEditModal(u)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-4">Edit</button>
                                        <button onClick={() => openDeleteModal(u)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderVehicleManagement = () => (
         <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Add New Vehicle</h3>
                 <form onSubmit={handleAddVehicle} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={vehicleForm.type} onChange={e => setVehicleForm({...vehicleForm, type: e.target.value})} placeholder="Vehicle Type" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required />
                        <input value={vehicleForm.number} onChange={e => setVehicleForm({...vehicleForm, number: e.target.value})} placeholder="Vehicle Number" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold">Add Vehicle</button>
                </form>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Update Vehicle Status</h3>
                <form onSubmit={handleUpdateVehicleStatus} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input value={maintenanceForm.vehicleId} onChange={e => setMaintenanceForm({...maintenanceForm, vehicleId: e.target.value})} placeholder="Enter Vehicle ID" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required />
                        <select value={maintenanceForm.status} onChange={e => setMaintenanceForm({...maintenanceForm, status: e.target.value as 'available' | 'in-use' | 'maintenance'})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                            <option value="maintenance">Maintenance</option>
                            <option value="available">Available</option>
                            <option value="in-use">In-Use</option>
                        </select>
                        {maintenanceForm.status === 'maintenance' && (
                            <input value={maintenanceForm.problem} onChange={e => setMaintenanceForm({...maintenanceForm, problem: e.target.value})} placeholder="Problem Description" className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" required />
                        )}
                    </div>
                    <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-semibold">Update Status</button>
                </form>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">All Vehicles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map(v => (
                        <div key={v.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border-l-4 border-blue-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{v.type}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{v.number}</p>
                                </div>
                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${v.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : v.status === 'in-use' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                    {v.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSystemReports = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">System Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-4">Recent Activity</h4>
                    <ul className="space-y-3">
                        <li className="flex items-center text-sm"><i className="fas fa-user-plus text-blue-500 mr-3"></i><span className="text-gray-700 dark:text-gray-300">New user 'Jane Staff' was added.</span></li>
                        <li className="flex items-center text-sm"><i className="fas fa-car text-green-500 mr-3"></i><span className="text-gray-700 dark:text-gray-300">Vehicle V002 status changed to 'in-use'.</span></li>
                        <li className="flex items-center text-sm"><i className="fas fa-calendar-check text-purple-500 mr-3"></i><span className="text-gray-700 dark:text-gray-300">Booking B001 confirmed by admin.</span></li>
                        <li className="flex items-center text-sm"><i className="fas fa-route text-orange-500 mr-3"></i><span className="text-gray-700 dark:text-gray-300">Trip T001 was completed successfully.</span></li>
                    </ul>
                </div>
                 <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                    <h4 className="font-bold text-green-800 dark:text-green-300 mb-4">System Health</h4>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center text-sm"><span className="text-gray-700 dark:text-gray-300">Server Status</span><span className="font-semibold px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-md">Online</span></li>
                        <li className="flex justify-between items-center text-sm"><span className="text-gray-700 dark:text-gray-300">Database Connection</span><span className="font-semibold px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-md">Healthy</span></li>
                        <li className="flex justify-between items-center text-sm"><span className="text-gray-700 dark:text-gray-300">API Latency</span><span className="font-semibold text-gray-800 dark:text-gray-200">12ms</span></li>
                        <li className="flex justify-between items-center text-sm"><span className="text-gray-700 dark:text-gray-300">System Load</span><span className="font-semibold px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-md">Normal</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderBookingList = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">All Bookings</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Booking ID</th>
                            <th scope="col" className="px-6 py-3">User Name</th>
                            <th scope="col" className="px-6 py-3">Vehicle Type</th>
                            <th scope="col" className="px-6 py-3">Date & Time</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{b.id}</td>
                                <td className="px-6 py-4">{b.userName}</td>
                                <td className="px-6 py-4">{b.vehicleType}</td>
                                <td className="px-6 py-4">{b.date} at {b.time}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 font-semibold rounded-full text-xs ${b.status === 'completed' || b.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : b.status === 'pending' || b.status === 'awaiting_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                        {b.status.replace('_', ' ')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderFuelDetails = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Fuel Details</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Vehicle No.</th>
                            <th scope="col" className="px-6 py-3">Fuel Amount</th>
                            <th scope="col" className="px-6 py-3">Cost</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Driver ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fuelDetails.map(f => (
                            <tr key={f.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{f.vehicleNumber}</td>
                                <td className="px-6 py-4">{f.fuelAmount}</td>
                                <td className="px-6 py-4">{f.cost}</td>
                                <td className="px-6 py-4">{f.date}</td>
                                <td className="px-6 py-4">{f.driverId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMaintenance = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Vehicles Under Maintenance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.filter(v => v.status === 'maintenance').map(v => (
                    <div key={v.id} className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                        <h4 className="font-bold text-red-800 dark:text-red-300">{v.type} - {v.number}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Status: <span className="font-semibold">Maintenance</span></p>
                        {v.maintenanceProblem && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Problem: <span className="font-semibold">{v.maintenanceProblem}</span></p>}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return renderDashboard();
            case 'analytics': return <Analytics users={users} vehicles={vehicles} bookings={bookings} fuelDetails={fuelDetails} />;
            case 'userManagement': return renderUserManagement();
            case 'vehicleManagement': return renderVehicleManagement();
            case 'bookingList': return renderBookingList();
            case 'fuelDetails': return renderFuelDetails();
            case 'maintenance': return renderMaintenance();
            case 'systemReports': return renderSystemReports();
            case 'profile': return <ProfileSection user={user} themeColor="blue" onUpdateUser={onUpdateUser} />;
            default: return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen font-inter text-gray-800 dark:text-gray-200">
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteUser}
                title="Confirm Deletion"
                message={`Are you sure you want to delete user ${selectedUser?.fullName}? This action cannot be undone.`}
            />

            {selectedUser && (
                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    user={selectedUser}
                    onSave={handleUpdateUserInList}
                />
            )}

            <header className="bg-white dark:bg-gray-800 shadow-md border-b-4 border-blue-600 dark:border-blue-500 sticky top-0 z-20">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                         <div className="flex items-center">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-gray-600 dark:text-gray-300">
                                <i className="fas fa-bars text-2xl"></i>
                            </button>
                            <div className="flex items-center">
                                <i className="fas fa-crown text-3xl text-blue-600 dark:text-blue-400 mr-3"></i>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center px-4">
                            <GlobalSearch 
                                users={users}
                                vehicles={vehicles}
                                bookings={bookings}
                                onNavigate={setActiveSection}
                            />
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                           <NotificationDropdown 
                                notifications={adminNotifications}
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
                        navItems={ADMIN_NAV_ITEMS} 
                        activeSection={activeSection} 
                        setActiveSection={setActiveSection} 
                        title="Admin Panel"
                        themeColor="blue"
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

export default AdminDashboard;