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

const seedAllData = async () => {
    try {
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});
        await Booking.deleteMany({});
        await Trip.deleteMany({});
        await Fuel.deleteMany({});
        await Notification.deleteMany({});
        console.log('✅ Cleared existing data');

        // Create Users (from constants.ts)
        console.log('👥 Creating users...');
        const admin = await User.create({
            username: 'admin',
            email: 'admin@cutmap.ac.in',
            password: 'admin123',
            fullName: 'Admin User',
            phone: '9876543210',
            role: 'admin',
            isActive: true,
            joinDate: new Date('2026-01-01')
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
            isActive: true,
            joinDate: new Date('2026-01-05')
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
            isActive: true,
            joinDate: new Date('2026-01-06')
        });

        const staff1 = await User.create({
            username: 'staff1',
            email: 'jane@cutmap.ac.in',
            password: 'staff123',
            fullName: 'Jane Staff',
            phone: '9876543212',
            role: 'staff',
            department: 'Administration',
            isActive: true,
            joinDate: new Date('2026-01-10')
        });

        // Additional users for bookings
        const staff2 = await User.create({
            username: 'alice',
            email: 'alice@cutmap.ac.in',
            password: 'staff123',
            fullName: 'Alice Johnson',
            phone: '9876543214',
            role: 'staff',
            department: 'Operations',
            isActive: true
        });

        const staff3 = await User.create({
            username: 'bob',
            email: 'bob@cutmap.ac.in',
            password: 'staff123',
            fullName: 'Bob Smith',
            phone: '9876543215',
            role: 'staff',
            department: 'HR',
            isActive: true
        });

        console.log('✅ Created users');

        // Create Vehicles (from constants.ts)
        console.log('🚗 Creating vehicles...');
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

        console.log('✅ Created vehicles');

        // Update user vehicle references
        driver1.vehicleId = vehicle1._id;
        await driver1.save();

        driver2.vehicleId = vehicle2._id;
        await driver2.save();

        // Create Drivers (from constants.ts)
        console.log('🚙 Creating driver records...');
        const driverRecord1 = await Driver.create({
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

        const driverRecord2 = await Driver.create({
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

        console.log('✅ Created driver records');

        // Create Bookings (from constants.ts - expanded)
        console.log('📅 Creating bookings...');
        const booking1 = await Booking.create({
            userName: 'Alice Johnson',
            userNumber: '9876543214',
            userId: staff2._id,
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
            userId: staff3._id,
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

        const booking3 = await Booking.create({
            userName: 'Charlie Brown',
            userNumber: '9876543216',
            userId: staff1._id,
            vehicleType: 'Bus',
            vehicleId: vehicle3._id,
            driverId: driver1._id,
            tripDetails: 'City Tour',
            pickupLocation: 'City Center',
            dropoffLocation: 'Tourist Spots',
            status: 'completed',
            date: new Date('2026-07-22'),
            time: '09:00',
            estimatedDuration: '4 hours',
            estimatedDistance: '50 km'
        });

        const booking4 = await Booking.create({
            userName: 'Diana Prince',
            userNumber: '9876543217',
            userId: staff1._id,
            vehicleType: 'Sedan',
            vehicleId: null,
            driverId: null,
            tripDetails: 'Meeting Downtown',
            pickupLocation: 'Office',
            dropoffLocation: 'Downtown Plaza',
            status: 'awaiting_approval',
            date: new Date('2026-11-25'),
            time: '11:00',
            estimatedDuration: '1 hour',
            estimatedDistance: '20 km'
        });

        const booking5 = await Booking.create({
            userName: 'Eve Adams',
            userNumber: '9876543218',
            userId: staff2._id,
            vehicleType: 'SUV',
            vehicleId: vehicle2._id,
            driverId: driver2._id,
            tripDetails: 'Weekend Getaway',
            pickupLocation: 'Residence',
            dropoffLocation: 'Hill Station',
            status: 'completed',
            date: new Date('2026-06-15'),
            time: '18:00',
            estimatedDuration: '3 hours',
            estimatedDistance: '120 km'
        });

        const booking6 = await Booking.create({
            userName: 'Frank Castle',
            userNumber: '9876543219',
            userId: staff3._id,
            vehicleType: 'Sedan',
            vehicleId: vehicle1._id,
            driverId: driver1._id,
            tripDetails: 'Airport Dropoff',
            pickupLocation: 'Home',
            dropoffLocation: 'Airport',
            status: 'completed',
            date: new Date('2026-06-20'),
            time: '05:00',
            estimatedDuration: '40 min',
            estimatedDistance: '22 km'
        });

        console.log('✅ Created bookings');

        // Create Trips (from constants.ts)
        console.log('🛣️  Creating trips...');
        const trip1 = await Trip.create({
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

        const trip2 = await Trip.create({
            bookingId: booking5._id,
            driverId: driver2._id,
            vehicleId: vehicle2._id,
            startLocation: 'Residence',
            endLocation: 'Hill Station',
            distance: '120 km',
            duration: '3 hours',
            startTime: new Date('2026-06-15T18:00:00'),
            endTime: new Date('2026-06-15T21:00:00'),
            date: new Date('2026-06-15'),
            status: 'completed',
            startOdometer: 20000,
            endOdometer: 20120
        });

        console.log('✅ Created trips');

        // Create Fuel Records (from constants.ts - expanded)
        console.log('⛽ Creating fuel records...');
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
            date: new Date('2026-07-15'),
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
            odometer: 20150,
            date: new Date('2026-07-16'),
            receiptNumber: 'RCP002'
        });

        await Fuel.create({
            vehicleId: vehicle1._id,
            vehicleType: 'Sedan',
            vehicleNumber: 'ABC-1234',
            driverId: driver1._id,
            fuelAmount: '45L',
            fuelAmountLiters: 45,
            cost: '₹4100',
            costAmount: 4100,
            station: 'City Gas',
            odometer: 14800,
            date: new Date('2026-06-18'),
            receiptNumber: 'RCP003'
        });

        await Fuel.create({
            vehicleId: vehicle3._id,
            vehicleType: 'Bus',
            vehicleNumber: 'BUS-9012',
            driverId: driver1._id,
            fuelAmount: '100L',
            fuelAmountLiters: 100,
            cost: '₹9000',
            costAmount: 9000,
            station: 'Metro Fuels',
            odometer: 50200,
            date: new Date('2026-06-25'),
            receiptNumber: 'RCP004'
        });

        console.log('✅ Created fuel records');

        // Create Notifications (from constants.ts)
        console.log('🔔 Creating notifications...');
        await Notification.create({
            userId: admin._id,
            message: 'New booking request from Bob Smith is awaiting approval',
            type: 'info',
            read: false,
            link: 'bookingList',
            relatedId: booking2._id,
            relatedModel: 'Booking',
            date: new Date('2026-07-25T09:00:00Z')
        });

        await Notification.create({
            userId: admin._id,
            message: 'Vehicle BUS-9012 is due for maintenance next week',
            type: 'warning',
            read: false,
            link: 'vehicleManagement',
            date: new Date('2026-07-25T14:30:00Z')
        });

        await Notification.create({
            userId: admin._id,
            message: 'Booking from Diana Prince is pending your approval',
            type: 'info',
            read: true,
            link: 'viewBookings',
            relatedId: booking4._id,
            relatedModel: 'Booking',
            date: new Date('2026-07-25T09:00:00Z')
        });

        await Notification.create({
            userId: driver2._id,
            message: 'Your assigned trip is currently in progress',
            type: 'info',
            read: true,
            link: 'tripHistory',
            relatedId: trip2._id,
            relatedModel: 'Trip',
            date: new Date('2026-07-24T18:00:00Z')
        });

        await Notification.create({
            userId: staff2._id,
            message: 'Your booking has been completed successfully',
            type: 'success',
            read: true,
            link: 'viewBookings',
            relatedId: booking1._id,
            relatedModel: 'Booking',
            date: new Date('2026-07-20T11:00:00Z')
        });

        console.log('✅ Created notifications');

        console.log('\n✅ ✅ ✅ Database seeded successfully with ALL mock data! ✅ ✅ ✅\n');
        console.log('📊 Summary:');
        console.log(`   Users: ${await User.countDocuments()}`);
        console.log(`   Vehicles: ${await Vehicle.countDocuments()}`);
        console.log(`   Drivers: ${await Driver.countDocuments()}`);
        console.log(`   Bookings: ${await Booking.countDocuments()}`);
        console.log(`   Trips: ${await Trip.countDocuments()}`);
        console.log(`   Fuel Records: ${await Fuel.countDocuments()}`);
        console.log(`   Notifications: ${await Notification.countDocuments()}`);
        
        console.log('\n📝 Test Credentials:');
        console.log('   Admin: admin@cutmap.ac.in / admin123');
        console.log('   Driver: john@cutmap.ac.in / driver123');
        console.log('   Driver: mike@cutmap.ac.in / driver123');
        console.log('   Staff: jane@cutmap.ac.in / staff123');
        console.log('   Staff: alice@cutmap.ac.in / staff123');
        console.log('   Staff: bob@cutmap.ac.in / staff123');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

// Run seeder
connectDB().then(() => seedAllData());
