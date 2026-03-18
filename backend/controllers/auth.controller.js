import User from '../models/User.model.js';
import Driver from '../models/Driver.model.js';
import { generateToken } from '../middleware/auth.middleware.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { username, email, password, fullName, phone, role, licenseNumber, department, vehicleType } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        
        if (userExists) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email or username already exists'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            fullName,
            phone,
            role: role || 'staff',
            licenseNumber: role === 'driver' ? licenseNumber : undefined,
            department: role === 'staff' ? department : undefined,
            vehicleType: role === 'driver' ? vehicleType : undefined
        });

        // If driver, create driver record
        if (role === 'driver' && licenseNumber) {
            await Driver.create({
                userId: user._id,
                name: fullName,
                number: phone,
                email: email,
                licenseNumber: licenseNumber,
                status: 'active'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    phone: user.phone
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error registering user'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email and password'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Your account has been deactivated. Please contact admin.'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Get user without password
        const userWithoutPassword = await User.findById(user._id);

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error logging in'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user data'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email and new password'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found with this email'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error resetting password'
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide current and new password'
            });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Generate new token
        const token = generateToken(user._id);

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully',
            data: { token }
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating password'
        });
    }
};
