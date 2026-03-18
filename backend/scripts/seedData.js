import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Driver from '../models/Driver.model.js';
import Booking from '../models/Booking.model.js';
import Trip from '../models/Trip.model.js';
import Fuel from '../models/Fuel.model.js';
import Notification from '../models/Notification.model.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});
        await Booking.deleteMany({});
        await Trip.deleteMany({});
        await Fuel.deleteMany({});
        await Notification.deleteMany({});

        console.log('🗑️  Cleared existing data');

        // Create Users
        const admin = await User.create({
            username: 'admin',
            email: 'admin@cutmap.ac.in',
            password: 'admin123',
            fullName: 'Admin User',
            phone: '9876543210',
            role: 'admin',
            isActive: true
        });

        const driver1 = await User.create({
            username: 'driver1',
            email: 'john@cutmap.ac.in',
            password: 'driver123',
            fullName: 'John Driver',
            phone: '9876543211',
            role: 'driver',
            licenseNumber: 'DL123456789',
            vehicleType: 'Sedan',
            isActive: true
        });

        const driver2 = await User.create({
            username: 'driver2',
            email: 'mike@cutmap.ac.in',
            password: 'driver123',
            fullName: 'Mike Wilson',
            phone: '9876543213',
            role: 'driver',
            licenseNumber: 'DL987654321',
            vehicleType: 'SUV',
            isActive: true
        });

        const staff1 = await User.create({
            username: 'staff1',
            email: 'jane@cutmap.ac.in',
            password: 'staff123',
            fullName: 'Jane Staff',
            phone: '9876543212',
            role: 'staff',
            department: 'Administration',
            isActive: true
        });

        console.log('👥 Created users');

        // Create Vehicles
        const vehicle1 = await Vehicle.create({
            type: 'Sedan',
            number: 'ABC-1234',
            status: 'available',
            driverId: driver1._id,
            model: 'Honda Accord',
            year: 2022,
            capacity: 4
        });

        const vehicle2 = await Vehicle.create({
            type: 'SUV',
            number: 'XYZ-5678',
            status: 'in-use',
            driverId: driver2._id,
            model: 'Toyota Fortuner',
            year: 2023,
            capacity: 7
        });

        const vehicle3 = await Vehicle.create({
            type: 'Bus',
            number: 'BUS-9012',
            status: 'maintenance',
            driverId: null,
            maintenanceProblem: 'Engine check required',
            model: 'Tata Starbus',
            year: 2021,
            capacity: 40
        });

        console.log('🚗 Created vehicles');

        // Update user vehicle references
        driver1.vehicleId = vehicle1._id;
        await driver1.save();

        driver2.vehicleId = vehicle2._id;
        await driver2.save();

        // Create Drivers
        await Driver.create({
            userId: driver1._id,
            name: 'John Driver',
            number: '9876543211',
            email: 'john@cutmap.ac.in',
            licenseNumber: 'DL123456789',
            status: 'active',
            assignedVehicleId: vehicle1._id,
            rating: 4.5,
            totalTrips: 25
        });

        await Driver.create({
            userId: driver2._id,
            name: 'Mike Wilson',
            number: '9876543213',
            email: 'mike@cutmap.ac.in',
            licenseNumber: 'DL987654321',
            status: 'active',
            assignedVehicleId: vehicle2._id,
            rating: 4.8,
            totalTrips: 30
        });

        console.log('🚙 Created driver records');

        // Create Bookings
        const booking1 = await Booking.create({
            userName: 'Alice Johnson',
            userNumber: '9876543214',
            userId: staff1._id,
            vehicleType: 'Sedan',
            vehicleId: vehicle1._id,
            driverId: driver1._id,
            tripDetails: 'Airport to Hotel',
            pickupLocation: 'Airport',
            dropoffLocation: 'Grand Hotel',
            status: 'completed',
            date: new Date('2026-07-20'),
            time: '10:00',
            estimatedDuration: '45 min',
            estimatedDistance: '25 km'
        });

        const booking2 = await Booking.create({
            userName: 'Bob Smith',
            userNumber: '9876543215',
            userId: staff1._id,
            vehicleType: 'SUV',
            vehicleId: null,
            driverId: null,
            tripDetails: 'Office to Conference',
            pickupLocation: 'Main Office',
            dropoffLocation: 'Conference Center',
            status: 'awaiting_approval',
            date: new Date('2026-11-05'),
            time: '14:00',
            estimatedDuration: '30 min',
            estimatedDistance: '15 km'
        });

        console.log('📅 Created bookings');

        // Create Trips
        await Trip.create({
            bookingId: booking1._id,
            driverId: driver1._id,
            vehicleId: vehicle1._id,
            startLocation: 'Airport',
            endLocation: 'Grand Hotel',
            distance: '25 km',
            duration: '45 min',
            startTime: new Date('2026-07-20T10:00:00'),
            endTime: new Date('2026-07-20T10:45:00'),
            date: new Date('2026-07-20'),
            status: 'completed',
            startOdometer: 15000,
            endOdometer: 15025
        });

        console.log('🛣️  Created trips');

        // Create Fuel Records
        await Fuel.create({
            vehicleId: vehicle1._id,
            vehicleType: 'Sedan',
            vehicleNumber: 'ABC-1234',
            driverId: driver1._id,
            fuelAmount: '50L',
            fuelAmountLiters: 50,
            cost: '₹4500',
            costAmount: 4500,
            station: 'Central Fueling',
            odometer: 15050,
            date: new Date('2026-07-21'),
            receiptNumber: 'RCP001'
        });

        await Fuel.create({
            vehicleId: vehicle2._id,
            vehicleType: 'SUV',
            vehicleNumber: 'XYZ-5678',
            driverId: driver2._id,
            fuelAmount: '60L',
            fuelAmountLiters: 60,
            cost: '₹5400',
            costAmount: 5400,
            station: 'Highway Pumps',
            odometer: 20100,
            date: new Date('2026-07-22'),
            receiptNumber: 'RCP002'
        });

        console.log('⛽ Created fuel records');

        // Create Notifications
        await Notification.create({
            userId: admin._id,
            message: 'New booking request from Bob Smith is awaiting approval',
            type: 'info',
            read: false,
            link: 'bookingList',
            relatedId: booking2._id,
            relatedModel: 'Booking'
        });

        await Notification.create({
            userId: admin._id,
            message: 'Vehicle BUS-9012 is due for maintenance',
            type: 'warning',
            read: false,
            link: 'vehicleManagement'
        });

        await Notification.create({
            userId: staff1._id,
            message: 'Your booking has been completed successfully',
            type: 'success',
            read: true,
            link: 'viewBookings',
            relatedId: booking1._id,
            relatedModel: 'Booking'
        });

        console.log('🔔 Created notifications');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('Admin: admin@cutmap.ac.in / admin123');
        console.log('Driver: john@cutmap.ac.in / driver123');
        console.log('Staff: jane@cutmap.ac.in / staff123');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

// Run seeder
connectDB().then(() => seedData());
