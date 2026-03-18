import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        trim: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    relatedModel: {
        type: String,
        enum: ['Booking', 'Trip', 'Vehicle', 'User']
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, read: 1, date: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
