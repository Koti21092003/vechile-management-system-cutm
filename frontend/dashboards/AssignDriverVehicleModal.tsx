import React, { useState, useEffect } from 'react';
import { Driver, Vehicle } from '../types';
import Modal from '../components/Modal';

interface AssignDriverVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (driverId: string, vehicleId: string) => void;
    drivers: Driver[];
    vehicles: Vehicle[];
}

const AssignDriverVehicleModal: React.FC<AssignDriverVehicleModalProps> = ({ isOpen, onClose, onConfirm, drivers, vehicles }) => {
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedDriver('');
            setSelectedVehicle('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (selectedDriver && selectedVehicle) {
            onConfirm(selectedDriver, selectedVehicle);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Assign Driver & Vehicle</h3>
                <div className="space-y-4">
                    <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required><option value="">Select an available driver</option>{drivers.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}</select>
                    <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required><option value="">Select an available vehicle</option>{vehicles.map(v => (<option key={v.id} value={v.id}>{v.type} - {v.number}</option>))}</select>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex justify-end space-x-3 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={handleConfirm} disabled={!selectedDriver || !selectedVehicle} className="px-4 py-2 bg-blue-600 text-white border border-transparent rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400">Confirm Assignment</button>
            </div>
        </Modal>
    );
};

export default AssignDriverVehicleModal;