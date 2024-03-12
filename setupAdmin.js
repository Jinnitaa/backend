const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');
require('dotenv').config(); // Load environment variables from a .env file

async function setupAdmin() {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });

    if (!adminExists) {
      // If admin doesn't exist, create a new admin user
      const saltRounds = 10;
      const password = process.env.ADMIN_PASSWORD || 'yourDefaultAdminPassword';

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newAdmin = new Admin({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
      });

      // Save the new admin user to the database
      await newAdmin.save();

      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }

    // Disconnect from the database
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error setting up admin:', error);
  }
}

// Run the setupAdmin function
setupAdmin();
