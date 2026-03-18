import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Vehicle, Driver, Booking, Trip, SearchResult, SearchResults } from '../types';

interface GlobalSearchProps {
    users?: User[];
    vehicles?: Vehicle[];
    drivers?: Driver[];
    bookings?: Booking[];
    trips?: Trip[];
    onNavigate: (sectionId: string) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
    users = [],
    vehicles = [],
    drivers = [],
    bookings = [],
    trips = [],
    onNavigate,
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({});
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const handleSearch = useCallback(() => {
        if (query.length < 2) {
            setResults({});
            setIsOpen(false);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const newResults: SearchResults = {};

        if (users.length > 0) {
            const userResults = users
                .filter(u => u.fullName.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery))
                .map(u => ({ id: u.id, name: u.fullName, description: u.email, category: 'Users' as const, path: 'userManagement' }));
            if (userResults.length > 0) newResults['Users'] = userResults;
        }
        
        if (vehicles.length > 0) {
            const vehicleResults = vehicles
                .filter(v => v.number.toLowerCase().includes(lowerQuery) || v.type.toLowerCase().includes(lowerQuery))
                .map(v => ({ id: v.id, name: v.number, description: v.type, category: 'Vehicles' as const, path: 'vehicleManagement' }));
            if (vehicleResults.length > 0) newResults['Vehicles'] = vehicleResults;
        }

        if (drivers.length > 0) {
            const driverResults = drivers
                .filter(d => d.name.toLowerCase().includes(lowerQuery))
                .map(d => ({ id: d.id, name: d.name, description: d.email, category: 'Drivers' as const, path: 'driverStatus' }));
            if (driverResults.length > 0) newResults['Drivers'] = driverResults;
        }

        if (bookings.length > 0) {
            const bookingResults = bookings
                .filter(b => b.userName.toLowerCase().includes(lowerQuery) || b.tripDetails.toLowerCase().includes(lowerQuery))
                .map(b => ({ id: b.id, name: b.userName, description: b.tripDetails, category: 'Bookings' as const, path: 'viewBookings' }));
            if (bookingResults.length > 0) newResults['Bookings'] = bookingResults;
        }
        
        if (trips.length > 0) {
            const tripResults = trips
                .filter(t => t.startLocation.toLowerCase().includes(lowerQuery) || t.endLocation.toLowerCase().includes(lowerQuery))
                .map(t => ({ id: t.id, name: `${t.startLocation} to ${t.endLocation}`, description: `on ${t.date}`, category: 'Trips' as const, path: 'tripHistory' }));
            if (tripResults.length > 0) newResults['Trips'] = tripResults;
        }
        
        setResults(newResults);
        setIsOpen(Object.keys(newResults).length > 0);

    }, [query, users, vehicles, drivers, bookings, trips]);

    useEffect(() => {
        const handler = setTimeout(() => {
            handleSearch();
        }, 300); // Debounce search

        return () => {
            clearTimeout(handler);
        };
    }, [query, handleSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (path: string) => {
        onNavigate(path);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative w-full max-w-xs md:max-w-sm" ref={searchRef}>
            <div className="relative">
                 <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    placeholder="Search anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                    className="w-full pl-10 pr-4 py-2 border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
            </div>

            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50 overflow-hidden max-h-96 overflow-y-auto animate-fade-in-down">
                    {Object.keys(results).length === 0 && query.length > 1 ? (
                        <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
                    ) : (
                        Object.entries(results).map(([category, items]) => (
                            <div key={category}>
                                <h4 className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">{category}</h4>
                                <ul>
                                    {items.map(item => (
                                        <li key={`${category}-${item.id}`}>
                                            <button 
                                                onClick={() => handleResultClick(item.path)}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{item.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
