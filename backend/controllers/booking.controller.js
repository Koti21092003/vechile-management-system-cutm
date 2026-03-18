import mongoose from 'mongoose';
import Booking from '../models/Booking.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import Vehicle from '../models/Vehicle.model.js';

export const getAllBookings = async (req, res) => {
    try {
        const { status, userId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (userId) query.userId = userId;
        const bookings = await Booking.find(query).populate('userId', 'fullName email phone').populate('vehicleId', 'type number').populate('driverId', 'fullName phone').sort({ date: -1, createdAt: -1 });
        res.status(200).json({ status: 'success', results: bookings.length, data: { bookings } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching bookings' });
    }
};

export const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('userId', 'fullName email phone').populate('vehicleId', 'type number status').populate('driverId', 'fullName phone email');
        if (!booking) return res.status(404).json({ status: 'error', message: 'Booking not found' });
        res.status(200).json({ status: 'success', data: { booking } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching booking' });
    }
};

export const createBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { userId, vehicleType, pickupLocation, destination, purpose, date, time, passengers } = req.body;

        // Validate required fields
        if (!vehicleType || !pickupLocation || !destination || !date || !time) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                status: 'error', 
                message: 'Please provide all required fields: vehicleType, pickupLocation, destination, date, and time' 
            });
        }

        // Find all available vehicles of the requested type
        const availableVehicles = await Vehicle.find({ 
            type: vehicleType, 
            status: 'available' 
        }).session(session);

        if (availableVehicles.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                status: 'error', 
                message: `No available ${vehicleType} found` 
            });
        }

        // Get all drivers who can drive this vehicle type
        const drivers = await User.find({ 
            role: 'driver',
            'driverInfo.vehicleTypes': vehicleType,
            status: 'active'
        }).session(session);

        if (drivers.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                status: 'error', 
                message: `No available drivers for ${vehicleType}` 
            });
        }

        // Create booking with pending status
        const booking = new Booking({
            userId,
            vehicleType,
            pickupLocation,
            destination,
            purpose,
            date,
            time,
            passengers: passengers || 1,
            status: 'pending',
            availableVehicles: availableVehicles.map(v => v._id)
        });

        await booking.save({ session });

        // Notify all eligible drivers
        const notificationPromises = drivers.map(driver => {
            return Notification.create([{
                recipient: driver._id,
                type: 'booking_request',
                message: `New ${vehicleType} booking request available`,
                data: { bookingId: booking._id },
                status: 'unread'
            }], { session });
        });

        await Promise.all(notificationPromises);
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ 
            status: 'success', 
            message: 'Booking request created. Waiting for driver acceptance.',
            data: { booking }
        });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Error creating booking',
            error: error.message 
        });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!booking) return res.status(404).json({ status: 'error', message: 'Booking not found' });
        res.status(200).json({ status: 'success', message: 'Booking updated successfully', data: { booking } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error updating booking' });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ status: 'error', message: 'Booking not found' });
        res.status(200).json({ status: 'success', message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error deleting booking' });
    }
};

export const acceptBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { driverId, vehicleId } = req.body;

        // Verify the booking exists and is pending or awaiting_approval
        const booking = await Booking.findById(id).session(session);
        if (!booking) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ status: 'error', message: 'Booking not found' });
        }

        if (booking.status !== 'pending' && booking.status !== 'awaiting_approval') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                status: 'error', 
                message: 'Booking is no longer available for acceptance' 
            });
        }

        // Verify the vehicle is still available
        const vehicle = await Vehicle.findById(vehicleId).session(session);
        if (!vehicle || vehicle.status !== 'available' || !booking.availableVehicles.includes(vehicleId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                status: 'error', 
                message: 'Selected vehicle is no longer available' 
            });
        }

        // Update booking status and assign driver/vehicle
        booking.status = 'approved';
        booking.driverId = driverId;
        booking.vehicleId = vehicleId;
        booking.assignedAt = new Date();
        await booking.save({ session });

        // Update vehicle status
        vehicle.status = 'in-use';
        await vehicle.save({ session });

        // Notify other drivers that the booking was taken
        const otherDrivers = await User.find({
            _id: { $ne: driverId },
            role: 'driver',
            'driverInfo.vehicleTypes': booking.vehicleType,
            status: 'active'
        }).session(session);

        const otherDriverNotifications = otherDrivers.map(driver => {
            return Notification.create([{
                recipient: driver._id,
                type: 'info',
                message: `The ${booking.vehicleType} booking has been accepted by another driver`,
                data: { bookingId: booking._id },
                status: 'unread'
            }], { session });
        });

        // Notify the user who made the booking
        const userNotification = Notification.create([{
            recipient: booking.userId,
            type: 'booking_approved',
            message: `Your booking for a ${booking.vehicleType} has been approved.`,
            data: { 
                bookingId: booking._id,
                driverId: driverId,
                vehicleId: vehicleId,
            },
            status: 'unread'
        }], { session });

        await Promise.all([...otherDriverNotifications, userNotification]);

        await session.commitTransaction();
        session.endSession();

        if (req.io) {
            req.io.emit('booking_updated', { bookingId: booking._id, status: 'approved' });
        }

        res.status(200).json({ 
            status: 'success', 
            message: 'Booking accepted successfully',
            data: { booking }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error accepting booking:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Error accepting booking',
            error: error.message 
        });
    }
};

export const approveBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const booking = await Booking.findById(req.params.id).session(session);
        if (!booking) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ status: 'error', message: 'Booking not found' });
        }

        // Check if booking is already approved
        if (booking.status === 'approved') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ status: 'error', message: 'Booking is already approved' });
        }

        // Update booking status
        booking.status = 'approved';
        booking.updatedBy = req.user.id;
        await booking.save({ session });

        // Create notification
        const notification = new Notification({
            userId: booking.userId,
            title: 'Booking Approved',
            message: `Your booking #${booking.bookingNumber} has been approved`,
            type: 'booking',
            link: `/bookings/${booking._id}`,
            createdBy: req.user.id
        });
        await notification.save({ session });

        await session.commitTransaction();
        session.endSession();
        
        res.status(200).json({ status: 'success', message: 'Booking approved successfully', data: { booking } });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error approving booking:', error);
        res.status(500).json({ status: 'error', message: 'Error approving booking' });
    }
};

export const declineBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'declined' }, { new: true });
        if (!booking) return res.status(404).json({ status: 'error', message: 'Booking not found' });
        await Notification.create({ userId: booking.userId, message: 'Your booking has been declined', type: 'error', link: 'viewBookings', relatedId: booking._id, relatedModel: 'Booking' });
        res.status(200).json({ status: 'success', message: 'Booking declined', data: { booking } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error declining booking' });
    }
};

export default {
    getAllBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    acceptBooking,
    approveBooking,
    declineBooking
};
