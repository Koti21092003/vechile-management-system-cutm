import Notification from '../models/Notification.model.js';

export const getAllNotifications = async (req, res) => {
    try {
        const { read } = req.query;
        let query = { userId: req.user.id };
        if (read !== undefined) query.read = read === 'true';
        const notifications = await Notification.find(query).sort({ date: -1, createdAt: -1 });
        res.status(200).json({ status: 'success', results: notifications.length, data: { notifications } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching notifications' });
    }
};

export const getNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ status: 'error', message: 'Notification not found' });
        res.status(200).json({ status: 'success', data: { notification } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching notification' });
    }
};

export const createNotification = async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).json({ status: 'success', message: 'Notification created successfully', data: { notification } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        if (!notification) return res.status(404).json({ status: 'error', message: 'Notification not found' });
        res.status(200).json({ status: 'success', message: 'Notification marked as read', data: { notification } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error marking notification as read' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
        res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error marking all notifications as read' });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ status: 'error', message: 'Notification not found' });
        res.status(200).json({ status: 'success', message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error deleting notification' });
    }
};
