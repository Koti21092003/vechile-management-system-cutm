import User from '../models/User.model.js';
import Driver from '../models/Driver.model.js';

export const getAllUsers = async (req, res) => {
    try {
        const { role, isActive, search } = req.query;
        let query = {};
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User.find(query).populate('vehicleId', 'type number').sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: users.length, data: { users } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching users' });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('vehicleId', 'type number status');
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching user' });
    }
};

export const createUser = async (req, res) => {
    try {
        const { username, email, password, fullName, phone, role, licenseNumber, department, vehicleType } = req.body;
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ status: 'error', message: 'User already exists' });
        
        const user = await User.create({ username, email, password, fullName, phone, role, licenseNumber: role === 'driver' ? licenseNumber : undefined, department: role === 'staff' ? department : undefined, vehicleType: role === 'driver' ? vehicleType : undefined });
        
        if (role === 'driver' && licenseNumber) {
            await Driver.create({ userId: user._id, name: fullName, number: phone, email, licenseNumber, status: 'active' });
        }
        res.status(201).json({ status: 'success', message: 'User created successfully', data: { user } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Convert both IDs to strings for comparison
        if (req.user.id.toString() !== id && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Not authorized' });
        }
        if (req.body.password) delete req.body.password;
        const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        if (user.role === 'driver') {
            await Driver.findOneAndUpdate({ userId: user._id }, { name: user.fullName, number: user.phone, email: user.email, licenseNumber: user.licenseNumber });
        }
        res.status(200).json({ status: 'success', message: 'User updated successfully', data: { user } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error updating user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        if (user.role === 'driver') await Driver.findOneAndDelete({ userId: user._id });
        await user.deleteOne();
        res.status(200).json({ status: 'success', message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error deleting user' });
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ status: 'success', message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { user } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error toggling user status' });
    }
};

export const uploadProfilePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID
        if (!id || id === 'undefined') {
            return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
        }
        
        // Check if user is updating their own profile or is admin
        if (req.user.id.toString() !== id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Not authorized to update this profile' 
            });
        }

        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded' });
        }

        // Generate photo URL
        const photoUrl = `/uploads/profiles/${req.file.filename}`;

        // Update user with photo URL
        const user = await User.findByIdAndUpdate(
            id,
            { profilePhoto: photoUrl },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Profile photo uploaded successfully',
            data: { user, photoUrl }
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Error uploading photo' });
    }
};
