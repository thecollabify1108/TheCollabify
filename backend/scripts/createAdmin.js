require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@collabify.com';
        const password = 'adminpassword123';
        const name = 'Super Admin';

        // Check if exists
        const exists = await User.findOne({ email });
        if (exists) {
            console.log('Admin user already exists:', email);
            process.exit(0);
        }

        const admin = await User.create({
            name,
            email,
            password,
            role: 'admin',
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

createAdmin();
