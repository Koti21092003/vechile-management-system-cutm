import { User, Vehicle, Driver, Booking, Trip, FuelDetail, NavItem, Notification } from './types';

const users: User[] = [
    { 
        id: 1, 
        username: 'admin', 
        password: 'admin123', 
        role: 'admin',
        fullName: 'Admin User',
        email: 'admin@cutmap.ac.in',
        phone: '9876543210',
        joinDate: '2024-01-01'
    },
    { 
        id: 2, 
        username: 'driver1', 
        password: 'driver123', 
        role: 'driver',
        fullName: 'John Driver',
        email: 'john@cutmap.ac.in',
        phone: '9876543211',
        joinDate: '2024-01-05',
        licenseNumber: 'DL123456789',
        vehicleId: 'V001',
        vehicleType: 'Sedan'
    },
    { 
        id: 3, 
        username: 'staff1', 
        password: 'staff123', 
        role: 'staff',
        fullName: 'Jane Staff',
        email: 'jane@cutmap.ac.in',
        phone: '9876543212',
        joinDate: '2024-01-10',
        department: 'Administration'
    }
];

const vehicles: Vehicle[] = [
    { id: 'V001', type: 'Sedan', number: 'ABC-1234', status: 'available', driverId: 'D001' },
    { id: 'V002', type: 'SUV', number: 'XYZ-5678', status: 'in-use', driverId: 'D002' },
    { id: 'V003', type: 'Bus', number: 'BUS-9012', status: 'maintenance', driverId: null, maintenanceProblem: 'Engine check required' }
];

const drivers: Driver[] = [
    { id: 'D001', name: 'John Driver', number: '9876543211', email: 'john@cutmap.ac.in', licenseNumber: 'DL123456789', status: 'active' },
    { id: 'D002', name: 'Mike Wilson', number: '9876543213', email: 'mike@cutmap.ac.in', licenseNumber: 'DL987654321', status: 'active' }
];

const bookings: Booking[] = [
    { 
        id: 'B001', 
        userName: 'Alice Johnson', 
        vehicleType: 'Sedan', 
        userNumber: '9876543212', 
        tripDetails: 'Airport to Hotel', 
        status: 'completed',
        date: '2024-07-20',
        time: '10:00',
        driverId: 'D001',
        vehicleId: 'V001'
    },
    { 
        id: 'B002', 
        userName: 'Bob Smith', 
        vehicleType: 'SUV', 
        userNumber: '9876543214', 
        tripDetails: 'Office to Conference', 
        status: 'pending',
        date: '2024-07-21',
        time: '14:00',
        driverId: null,
        vehicleId: null
    },
    { id: 'B003', userName: 'Charlie Brown', vehicleType: 'Bus', userNumber: '9876543215', tripDetails: 'City Tour', status: 'completed', date: '2024-07-22', time: '09:00', driverId: 'D001', vehicleId: 'V003' },
    { id: 'B004', userName: 'Diana Prince', vehicleType: 'Sedan', userNumber: '9876543216', tripDetails: 'Meeting Downtown', status: 'pending', date: '2024-07-25', time: '11:00', driverId: null, vehicleId: null },
    { id: 'B005', userName: 'Eve Adams', vehicleType: 'SUV', userNumber: '9876543217', tripDetails: 'Weekend Getaway', status: 'completed', date: '2024-06-15', time: '18:00', driverId: 'D002', vehicleId: 'V002' },
    { id: 'B006', userName: 'Frank Castle', vehicleType: 'Sedan', userNumber: '9876543218', tripDetails: 'Airport Dropoff', status: 'completed', date: '2024-06-20', time: '05:00', driverId: 'D001', vehicleId: 'V001' },
    { id: 'B007', userName: 'Grace Hopper', vehicleType: 'Bus', userNumber: '9876543219', tripDetails: 'Tech Conference', status: 'completed', date: '2024-05-10', time: '08:30', driverId: null, vehicleId: 'V003' },
    { id: 'B008', userName: 'Hank Pym', vehicleType: 'SUV', userNumber: '9876543220', tripDetails: 'Mountain Resort', status: 'cancelled', date: '2024-05-25', time: '12:00', driverId: null, vehicleId: null },
];

const trips: Trip[] = [
    { id: 'T001', driverId: 'D001', vehicleId: 'V001', startLocation: 'Office', endLocation: 'Airport', distance: '25 km', duration: '45 min', date: '2024-07-19', status: 'completed' },
    { id: 'T002', driverId: 'D002', vehicleId: 'V002', startLocation: 'Hotel', endLocation: 'Conference Center', distance: '15 km', duration: '30 min', date: '2024-07-20', status: 'in-progress' }
];

const fuelDetails: FuelDetail[] = [
    { id: 'F001', vehicleId: 'V001', vehicleType: 'Sedan', vehicleNumber: 'ABC-1234', fuelAmount: '50L', date: '2024-07-15', cost: '₹4500', driverId: 'D001', station: 'Central Fueling' },
    { id: 'F002', vehicleId: 'V002', vehicleType: 'SUV', vehicleNumber: 'XYZ-5678', fuelAmount: '60L', date: '2024-07-16', cost: '₹5400', driverId: 'D002', station: 'Highway Pumps' },
    { id: 'F003', vehicleId: 'V001', vehicleType: 'Sedan', vehicleNumber: 'ABC-1234', fuelAmount: '45L', date: '2024-06-18', cost: '₹4100', driverId: 'D001', station: 'City Gas' },
    { id: 'F004', vehicleId: 'V003', vehicleType: 'Bus', vehicleNumber: 'BUS-9012', fuelAmount: '100L', date: '2024-06-25', cost: '₹9000', driverId: 'D001', station: 'Metro Fuels' },
];

const notifications: Notification[] = [
    { id: '1', message: 'New user "Kate Austen" has registered as a driver.', date: '2024-07-26T10:00:00Z', read: false, link: 'userManagement' },
    { id: '2', message: 'Vehicle V003 is due for maintenance next week.', date: '2024-07-25T14:30:00Z', read: false, link: 'vehicleManagement' },
    { id: '3', message: 'Booking B004 from "Diana Prince" is pending your approval.', date: '2024-07-25T09:00:00Z', read: true, link: 'viewBookings' },
    { id: '4', message: 'Your assigned trip T002 is currently in progress.', date: '2024-07-24T18:00:00Z', read: true, link: 'tripHistory' },
];

export const initialData = { users, vehicles, drivers, bookings, trips, fuelDetails, notifications };

export const ADMIN_NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
    { id: 'analytics', icon: 'chart-pie', label: 'Analytics' },
    { id: 'userManagement', icon: 'users', label: 'User Management' },
    { id: 'vehicleManagement', icon: 'car', label: 'Vehicle Management' },
    { id: 'bookingList', icon: 'list-alt', label: 'Booking List' },
    { id: 'fuelDetails', icon: 'gas-pump', label: 'Fuel Details' },
    { id: 'maintenance', icon: 'tools', label: 'Maintenance' },
    { id: 'systemReports', icon: 'chart-bar', label: 'System Reports' },
    { id: 'profile', icon: 'user-circle', label: 'My Profile' }
];

export const DRIVER_NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
    { id: 'tripRequests', icon: 'bell', label: 'Trip Requests' },
    { id: 'startTrip', icon: 'play-circle', label: 'Start Trip' },
    { id: 'tripHistory', icon: 'history', label: 'Trip History' },
    { id: 'fuelManagement', icon: 'gas-pump', label: 'Fuel Records' },
    { id: 'myBookings', icon: 'calendar', label: 'My Bookings' },
    { id: 'profile', icon: 'user-circle', label: 'My Profile' }
];

export const STAFF_NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
    { id: 'createBooking', icon: 'plus-circle', label: 'Create Booking' },
    { id: 'viewBookings', icon: 'list', label: 'View Bookings' },
    { id: 'vehicleStatus', icon: 'car', label: 'Vehicle Status' },
    { id: 'driverStatus', icon: 'users', label: 'Driver Status' },
    { id: 'profile', icon: 'user-circle', label: 'My Profile' }
];