import Trip from '../models/Trip.model.js';

export const getAllTrips = async (req, res) => {
    try {
        const { status, driverId, vehicleId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (driverId) query.driverId = driverId;
        if (vehicleId) query.vehicleId = vehicleId;
        const trips = await Trip.find(query).populate('driverId', 'fullName phone email').populate('vehicleId', 'type number').populate('bookingId').sort({ date: -1, createdAt: -1 });
        res.status(200).json({ status: 'success', results: trips.length, data: { trips } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching trips' });
    }
};

export const getTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id).populate('driverId', 'fullName phone email').populate('vehicleId', 'type number status').populate('bookingId');
        if (!trip) return res.status(404).json({ status: 'error', message: 'Trip not found' });
        res.status(200).json({ status: 'success', data: { trip } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching trip' });
    }
};

export const createTrip = async (req, res) => {
    try {
        const trip = await Trip.create(req.body);
        res.status(201).json({ status: 'success', message: 'Trip created successfully', data: { trip } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!trip) return res.status(404).json({ status: 'error', message: 'Trip not found' });
        res.status(200).json({ status: 'success', message: 'Trip updated successfully', data: { trip } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error updating trip' });
    }
};

export const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) return res.status(404).json({ status: 'error', message: 'Trip not found' });
        res.status(200).json({ status: 'success', message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error deleting trip' });
    }
};

export const startTrip = async (req, res) => {
    try {
        const trip = await Trip.findByIdAndUpdate(req.params.id, { status: 'in-progress', startTime: new Date() }, { new: true });
        if (!trip) return res.status(404).json({ status: 'error', message: 'Trip not found' });
        res.status(200).json({ status: 'success', message: 'Trip started successfully', data: { trip } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error starting trip' });
    }
};

export const completeTrip = async (req, res) => {
    try {
        const trip = await Trip.findByIdAndUpdate(req.params.id, { status: 'completed', endTime: new Date(), ...req.body }, { new: true });
        if (!trip) return res.status(404).json({ status: 'error', message: 'Trip not found' });
        res.status(200).json({ status: 'success', message: 'Trip completed successfully', data: { trip } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error completing trip' });
    }
};
