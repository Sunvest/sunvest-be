import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import connectDB from '../config/database';

// Load environment variables
dotenv.config();

// Sample user data
const userData = [
  {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '1234567890',
    isEmailVerified: true,
    isPhoneVerified: true,
  },
  {
    email: 'jane@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNumber: '2345678901',
    isEmailVerified: false,
    isPhoneVerified: false,
  },
  {
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Smith',
    phoneNumber: '3456789012',
    isEmailVerified: true,
    isPhoneVerified: false,
  },
];

// Function to import data
const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    console.log('Data cleared...');
    
    // Insert new data
    await User.create(userData);
    console.log('Data imported successfully!');
    
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Function to delete data
const deleteData = async () => {
  try {
    await connectDB();
    
    await User.deleteMany({});
    console.log('Data deleted successfully!');
    
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Process command line arguments
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Please provide a valid command: --import or --delete');
  process.exit();
} 