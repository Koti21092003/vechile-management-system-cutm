import Vehicle from '../models/Vehicle.model.js';

export const getAllVehicles = async (req, res) => {
    try {
        const { status, type } = req.query;
        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        const vehicles = await Vehicle.find(query).populate('driverId', 'fullName phone email').sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: vehicles.length, data: { vehicles } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching vehicles' });
    }
};

export const getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('driverId', 'fullName phone email licenseNumber');
        if (!vehicle) return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
        res.status(200).json({ status: 'success', data: { vehicle } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching vehicle' });
    }
};

export const createVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        if (req.io) req.io.emit('data_changed', { collection: 'vehicles' });
        res.status(201).json({ status: 'success', message: 'Vehicle created successfully', data: { vehicle } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        console.log('Updating vehicle:', req.params.id, 'with data:', req.body);
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!vehicle) {
            console.log('Vehicle not found:', req.params.id);
            return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
        }
        console.log('Vehicle updated successfully:', vehicle);
        if (req.io) req.io.emit('data_changed', { collection: 'vehicles' });
        res.status(200).json({ status: 'success', message: 'Vehicle updated successfully', data: { vehicle } });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Error updating vehicle' });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
        if (req.io) req.io.emit('data_changed', { collection: 'vehicles' });
        res.status(200).json({ status: 'success', message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error deleting vehicle' });
    }
};

export const assignDriver = async (req, res) => {
    try {
        const { driverId } = req.body;
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { driverId }, { new: true }).populate('driverId', 'fullName phone email');
        if (!vehicle) return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
        if (req.io) req.io.emit('data_changed', { collection: 'vehicles' });
        res.status(200).json({ status: 'success', message: 'Driver assigned successfully', data: { vehicle } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error assigning driver' });
    }
};
