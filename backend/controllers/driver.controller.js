import Driver from '../models/Driver.model.js';

export const getAllDrivers = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;
        const drivers = await Driver.find(query).populate('userId', 'fullName email phone').populate('assignedVehicleId', 'type number').sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: drivers.length, data: { drivers } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching drivers' });
    }
};

export const getDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id).populate('userId', 'fullName email phone').populate('assignedVehicleId', 'type number status');
        if (!driver) return res.status(404).json({ status: 'error', message: 'Driver not found' });
        res.status(200).json({ status: 'success', data: { driver } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching driver' });
    }
};

export const createDriver = async (req, res) => {
    try {
        const driver = await Driver.create(req.body);
        res.status(201).json({ status: 'success', message: 'Driver created successfully', data: { driver } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateDriver = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!driver) return res.status(404).json({ status: 'error', message: 'Driver not found' });
        res.status(200).json({ status: 'success', message: 'Driver updated successfully', data: { driver } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error updating driver' });
    }
};

export const deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ status: 'error', message: 'Driver not found' });
        res.status(200).json({ status: 'success', message: 'Driver deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error deleting driver' });
    }
};
