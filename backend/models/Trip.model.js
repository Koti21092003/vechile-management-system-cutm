import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Driver is required']
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required']
    },
    startLocation: {
        type: String,
        required: [true, 'Start location is required'],
        trim: true
    },
    endLocation: {
        type: String,
        required: [true, 'End location is required'],
        trim: true
    },
    distance: {
        type: String,
        trim: true
    },
    duration: {
        type: String,
        trim: true
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    startOdometer: {
        type: Number,
        min: 0
    },
    endOdometer: {
        type: Number,
        min: 0
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

tripSchema.index({ driverId: 1, status: 1 });
tripSchema.index({ vehicleId: 1, date: -1 });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
