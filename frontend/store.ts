import { useState, useEffect } from 'react';
import { initialData } from './constants';
import { User, Vehicle, Booking, Trip, FuelDetail, Notification, Driver } from './types';

type AppData = typeof initialData;

const VMS_DATA_KEY = 'vms-data';

function getInitialState(): AppData {
    try {
        const storedData = localStorage.getItem(VMS_DATA_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (e) {
        console.error('Failed to parse data from localStorage', e);
    }
    return JSON.parse(JSON.stringify(initialData)); // Deep clone to avoid mutating original constants
}

let state: AppData = getInitialState();

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