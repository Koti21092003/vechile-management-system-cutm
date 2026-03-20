import { useState, useEffect } from 'react';
import { initialData } from './constants';
import { User, Vehicle, Booking, Trip, FuelDetail, Notification, Driver } from './types';

type AppData = typeof initialData;

const VMS_DATA_KEY = 'vms-data';

const emptyState: AppData = {
    users: [],
    vehicles: [],
    drivers: [],
    bookings: [],
    trips: [],
    fuelDetails: [],
    notifications: []
};

let state: AppData = emptyState;

const listeners: Set<() => void> = new Set();

const emitChange = () => {
    for (const listener of listeners) {
        listener();
    }
};

export const useSharedState = () => {
    const [snapshot, setSnapshot] = useState(state);

    useEffect(() => {
        const listener = () => setSnapshot(state);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    const setState = (updater: (prevState: AppData) => AppData) => {
        state = updater(state);
        try {
            localStorage.setItem(VMS_DATA_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save data to localStorage', e);
        }
        emitChange();
    };

    return [snapshot, setState] as const;
};