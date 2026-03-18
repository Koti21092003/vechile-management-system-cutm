import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Vehicle type is required'],
        trim: true
        // Removed enum to allow any vehicle type (Bus, Car, Van, Truck, SUV, Sedan, Ambulance, etc.)
    },
    number: {
        type: String,
        required: [true, 'Vehicle number is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['available', 'in-use', 'maintenance'],
        default: 'available'
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    maintenanceProblem: {
        type: String,
        trim: true,
        default: null
    },
    capacity: {
        type: Number,
        min: 1
    },
    model: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 1
    },
    lastMaintenanceDate: {
        type: Date
    },
    nextMaintenanceDate: {
        type: Date
    }
}, {
    timestamps: true
});

vehicleSchema.index({ status: 1, type: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
