import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import driverRoutes from './routes/driver.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import tripRoutes from './routes/trip.routes.js';
import fuelRoutes from './routes/fuel.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow images to be loaded
})); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'CUTM VMS API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        status: 'error', 
        message: 'Route not found' 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;
