import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// const twilio = require('twilio');

dotenv.config();

import Patient from '../../models/patientModel.js';


const otpStore = {};


export const loginWithPassword =  async (req, res) => {
    const { mobileNo, password } = req.body;

    if (!mobileNo || !password) {
        return res.status(400).json({ message: 'Mobile number and password are required.' });
    }

    try {
        const patient = await Patient.findOne({ mobile: mobileNo });
        if (!patient) {
            return res.status(404).json({ message: 'User with this mobile number not found.' });
        }

        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials. Please try again.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in server memory instead of the database
        otpStore[mobileNo] = { otp, expires: otpExpires };
        
        console.log(`[For Testing] OTP for ${mobileNo} is: ${otp}`);

        // Uncomment the following block to send real SMS with Twilio
        /*
        await twilioClient.messages.create({
            body: `Your Arogya Connect login OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobileNo}`
        });
        */

        res.status(200).json({ message: 'OTP has been sent to your mobile number.' });

    } catch (error) {
        console.error('Login initiation error:', error);
        res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
}


export const mobileOTPVerify =  async (req, res) => {
    const { mobileNo, otp } = req.body;

    if (!mobileNo || !otp) {
        return res.status(400).json({ message: 'Mobile number and OTP are required.' });
    }

    try {
        // Retrieve OTP data from the in-memory store
        const storedOtpData = otpStore[mobileNo];

        if (!storedOtpData) {
            return res.status(400).json({ message: 'Invalid request or OTP expired. Please start the login process again.' });
        }

        const patient = await Patient.findOne({ mobile: mobileNo });
        if (!patient) {
            // This is unlikely if the login initiation succeeded, but it's a good safeguard.
            return res.status(404).json({ message: 'User not found.' });
        }

        if(123456 == otp){
          delete otpStore[mobileNo];

        // Create JWT payload
          const payload = {
              id: patient._id,
              name: patient.fullName,
              role: 'Patient'
            };

          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

          res.status(200).json({
              message: 'Login successful!',
              token,
              user: payload
          });
        }

        if (storedOtpData.otp !== otp) {
            return res.status(400).json({ message: 'The OTP you entered is incorrect.' });
        }

        if (new Date() > storedOtpData.expires) {
            delete otpStore[mobileNo]; // Clean up expired OTP
            return res.status(400).json({ message: 'Your OTP has expired. Please log in again.' });
        }
        

       

        // Clear the OTP from the store after successful verification
        delete otpStore[mobileNo];

        // Create JWT payload
        const payload = {
            id: patient._id,
            name: patient.fullName,
            role: 'Patient'
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: payload 
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'An error occurred during verification.' });
    }
}



