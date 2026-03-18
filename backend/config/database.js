import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');

        // Debug log (optional)
        console.log(
            '🔍 Connection string starts with:',
            process.env.MONGO_URI
                ? process.env.MONGO_URI.substring(0, 25) + '...'
                : 'undefined'
        );

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Connection events
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        console.error('💡 Possible reasons:');
        console.error('   1. IP not allowed in MongoDB Atlas');
        console.error('   2. Wrong connection string');
        console.error('   3. Network/firewall issue');
        console.error('   4. Cluster is paused');
        console.error('\n📝 Check: https://cloud.mongodb.com/');
        process.exit(1);
    }
};

export default connectDB;