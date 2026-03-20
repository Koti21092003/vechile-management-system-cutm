import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const addKoti = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
        
        const existingKoti = await User.findOne({ email: 'koti@cutmap.ac.in' });
        if (existingKoti) {
            console.log('✅ Koti already exists in Database.');
        } else {
            console.log('Creating Admin Koti...');
            await User.create({
                username: 'koti',
                email: 'koti@cutmap.ac.in',
                password: 'password123', // I set a default password here
                fullName: 'Koteswara Rao',
                phone: '1234567890',
                role: 'admin',
                isActive: true,
                joinDate: new Date()
            });
            console.log('✅ Koti added successfully as Admin!');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

addKoti();
