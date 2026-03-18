export type UserRole = 'admin' | 'driver' | 'staff';

export interface User {
    id: string | number;
    username: string;
    password?: string;
    role: UserRole;
    fullName: string;
    email: string;
    phone: string;
    joinDate: string;
    licenseNumber?: string;
    department?: string;
    profilePhoto?: string;
    vehicleId?: string;
    vehicleType?: string;
}

export interface Vehicle {
    id: string;
    type: string;
    number: string;
    status: 'available' | 'in-use' | 'maintenance';
    driverId: string | null;
    maintenanceProblem?: string;
}

export interface Driver {
    id: string | number;
    name: string;
    number: string;
    email: string;
    licenseNumber: string;
    status: 'active' | 'inactive';
}

export interface Booking {
    id: string;
    userName: string;
    vehicleType: string;
    userNumber: string;
    tripDetails: string;
    status: 'completed' | 'pending' | 'cancelled' | 'awaiting_approval' | 'approved' | 'declined';
    date: string;
    time: string;
    driverId: string | null;
    vehicleId: string | null;
}

export interface Trip {
    id: string;
    driverId: string;
    vehicleId: string;
    startLocation: string;
    endLocation: string;
    distance: string;
    duration: string;
    date: string;
    status: 'completed' | 'in-progress' | 'cancelled';
}

export interface FuelDetail {
    id: string;
    vehicleId: string;
    vehicleType: string;
    vehicleNumber: string;
    fuelAmount: string;
    date: string;
    cost: string;
    driverId: string;
    station?: string;
}

export interface NavItem {
    id: string;
    icon: string;
    label: string;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

export type AuthView = 'login' | 'signup' | 'forgotPassword';

export interface SearchResult {
    id: string | number;
    name: string;
    description: string;
    category: 'Users' | 'Vehicles' | 'Drivers' | 'Bookings' | 'Trips';
    path: string;
}

export type SearchResults = Record<string, SearchResult[]>;

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

export interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    sources?: { uri: string; title: string }[];
}

export interface Notification {
    id: string;
    message: string;
    date: string;
    read: boolean;
    link?: string; // Optional link to navigate to
}