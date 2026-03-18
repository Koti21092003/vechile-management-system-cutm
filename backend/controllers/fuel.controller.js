import Fuel from '../models/Fuel.model.js';

export const getAllFuelRecords = async (req, res) => {
    try {
        const { vehicleId, driverId } = req.query;
        let query = {};
        if (vehicleId) query.vehicleId = vehicleId;
        if (driverId) query.driverId = driverId;
        const fuelRecords = await Fuel.find(query).populate('vehicleId', 'type number').populate('driverId', 'fullName phone').sort({ date: -1, createdAt: -1 });
        res.status(200).json({ status: 'success', results: fuelRecords.length, data: { fuelRecords } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching fuel records' });
    }
};

export const getFuelRecord = async (req, res) => {
    try {
        const fuelRecord = await Fuel.findById(req.params.id).populate('vehicleId', 'type number status').populate('driverId', 'fullName phone email');
        if (!fuelRecord) return res.status(404).json({ status: 'error', message: 'Fuel record not found' });
        res.status(200).json({ status: 'success', data: { fuelRecord } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching fuel record' });
    }
};

export const createFuelRecord = async (req, res) => {
    try {
        const fuelRecord = await Fuel.create(req.body);
        res.status(201).json({ status: 'success', message: 'Fuel record created successfully', data: { fuelRecord } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateFuelRecord = async (req, res) => {
    try {
        const fuelRecord = await Fuel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!fuelRecord) return res.status(404).json({ status: 'error', message: 'Fuel record not found' });
        res.status(200).json({ status: 'success', message: 'Fuel record updated successfully', data: { fuelRecord } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error updating fuel record' });
    }
};

export const deleteFuelRecord = async (req, res) => {
    try {
        const fuelRecord = await Fuel.findByIdAndDelete(req.params.id);
        if (!fuelRecord) return res.status(404).json({ status: 'error', message: 'Fuel record not found' });
        res.status(200).json({ status: 'success', message: 'Fuel record deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error deleting fuel record' });
    }
};
