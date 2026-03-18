import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Driver name is required'],
        trim: true
    },
    number: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on-leave'],
        default: 'active'
    },
    assignedVehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalTrips: {
        type: Number,
        default: 0
    },
    licenseExpiryDate: {
        type: Date
    }
}, {
    timestamps: true
});

driverSchema.index({ status: 1, licenseNumber: 1 });

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
