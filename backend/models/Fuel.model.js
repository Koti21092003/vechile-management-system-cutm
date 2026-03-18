import mongoose from 'mongoose';

const fuelSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required']
    },
    vehicleType: {
        type: String,
        required: true,
        trim: true
    },
    vehicleNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Driver is required']
    },
    fuelAmount: {
        type: String,
        required: [true, 'Fuel amount is required'],
        trim: true
    },
    fuelAmountLiters: {
        type: Number,
        required: true,
        min: 0
    },
    cost: {
        type: String,
        required: [true, 'Cost is required'],
        trim: true
    },
    costAmount: {
        type: Number,
        required: true,
        min: 0
    },
    station: {
        type: String,
        trim: true
    },
    odometer: {
        type: Number,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    receiptNumber: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

fuelSchema.index({ vehicleId: 1, date: -1 });
fuelSchema.index({ driverId: 1, date: -1 });

const Fuel = mongoose.model('Fuel', fuelSchema);

export default Fuel;
