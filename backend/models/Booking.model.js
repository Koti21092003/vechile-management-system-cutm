import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true
    },
    userNumber: {
        type: String,
        required: [true, 'User phone number is required'],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleType: {
        type: String,
        required: [true, 'Vehicle type is required'],
        trim: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    tripDetails: {
        type: String,
        required: [true, 'Trip details are required'],
        trim: true
    },
    pickupLocation: {
        type: String,
        trim: true
    },
    dropoffLocation: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'awaiting_approval', 'approved', 'declined', 'in_progress', 'completed', 'cancelled'],
        default: 'pending',
        index: true
    },
    date: {
        type: Date,
        required: [true, 'Booking date is required'],
        validate: {
            validator: function(v) {
                // Ensure date is not in the past
                return v >= new Date().setHours(0,0,0,0);
            },
            message: 'Booking date cannot be in the past'
        }
    },
    time: {
        type: String,
        required: [true, 'Booking time is required'],
        validate: {
            validator: function(v) {
                // Basic time format validation (HH:MM)
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Invalid time format. Use HH:MM (24-hour format)'
        }
    },
    estimatedDuration: {
        type: String,
        trim: true
    },
    estimatedDistance: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    cancelReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

bookingSchema.index({ status: 1, date: -1 });
bookingSchema.index({ userId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
