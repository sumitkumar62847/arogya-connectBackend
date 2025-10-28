import mongoose from 'mongoose';
import User from './xyzModel.js';
import dotenv from 'dotenv';

dotenv.config(); 

const MONGO_URI = process.env.MONGO_URL;

const users = [
    // Doctors
    {
        userId: "111122223333",
        password: "doctorPassword1",
        role: "Doctor",
        fullName: "Dr. Anjali Sharma",
        specialization: "Cardiology",
        licenseNumber: "MCI12345",
        email: "anjali.sharma@clinic.com",
        contactNumber: "9876543210"
    },
    {
        userId: "444455556666",
        password: "doctorPassword2",
        role: "Doctor",
        fullName: "Dr. Vikram Singh",
        specialization: "Pediatrics",
        licenseNumber: "MCI67890",
        email: "vikram.singh@clinic.com",
        contactNumber: "9876543211" 
    },
    // Compounders
    {
        userId: "777788889999", 
        password: "compounderPass1",
        role: "Compounder",
        fullName: "Priya Patel",
        specialization: "Pharmaceutical Compounding",
        licenseNumber: "PCI54321",
        email: "priya.patel@clinic.com",
        contactNumber: "9876543212"
    },
    {
        userId: "101010101010",
        password: "compounderPass2",
        role: "Compounder",
        fullName: "Rohan Mehta",
        specialization: "Pharmaceutical Compounding",
        licenseNumber: "PCI09876",
        email: "rohan.mehta@clinic.com",
        contactNumber: "9876543213"
    },
    // Dispensers
    {
        userId: "121212121212",
        password: "dispenserPass1",
        role: "Dispenser",
        fullName: "Sunita Gupta",
        specialization: "Pharmacy Dispensing",
        licenseNumber: "PCI11223",
        email: "sunita.gupta@clinic.com",
        contactNumber: "9876543214"
    },
    {
        userId: "131313131313",
        password: "dispenserPass2",
        role: "Dispenser",
        fullName: "Amit Kumar",
        specialization: "Pharmacy Dispensing",
        licenseNumber: "PCI44556",
        email: "amit.kumar@clinic.com",
        contactNumber: "9876543215"
    },
    // Laboratorians
    {
        userId: "141414141414",
        password: "laboratorianPass1",
        role: "Laboratorian",
        fullName: "Neha Reddy",
        specialization: "Clinical Laboratory Science",
        licenseNumber: "LABTECH789",
        email: "neha.reddy@clinic.com",
        contactNumber: "9876543216"
    },
    {
        userId: "151515151515",
        password: "laboratorianPass2",
        role: "Laboratorian",
        fullName: "Sanjay Verma",
        specialization: "Medical Technology",
        licenseNumber: "LABTECH101",
        email: "sanjay.verma@clinic.com",
        contactNumber: "9876543217"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected...');

        await User.deleteMany({});
        console.log('Existing users cleared.');


        await User.create(users);
        console.log('Database has been seeded successfully!');

    } catch (error) {
        console.error('Error seeding database:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};
seedDB();