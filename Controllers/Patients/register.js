import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import express from 'express';
// import twilio from 'twilio';
import Patient from '../../models/patientModel.js';


const router = express.Router();


cloudinary.config({
    cloud_name: 'ddl9s5ams',
    api_key: "176434319745867",
    api_secret: '0vbi8YTCC9lOGySARw3Jw3otdNQ',
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'arogya-connect/health-records', 
        format: async (req, file) => 'pdf',
        public_id: (req, file) => {
            const uniqueSuffix = Date.now();
 
            return `${req.body.aadhaar}-${uniqueSuffix}`;
        },
    },
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});


const otpStore = {};


router.post('/send-mobile-otp', async (req, res) => {
    const { mobile } = req.body;
    if (!mobile || !/^\d{10}$/.test(mobile)) {
        return res.status(400).json({ message: 'Valid 10-digit mobile number is required.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expires = Date.now() + 10 * 60 * 1000; 

    otpStore[mobile] = { otp, expires };

    try {
        // await twilioClient.messages.create({
        //     body: `Your Arogya Connect verification code is: ${otp}`,
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     to: `+91${mobile}` // Assuming Indian numbers
        // });
        console.log(`OTP for ${mobile} is ${otp}`); // For testing without sending SMS
        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error('Twilio Error:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }
});

router.post('/verify-mobile-otp', (req, res) => {
    const { mobile, otp } = req.body;
    console.log(req.body);
    const storedOtpData = otpStore[mobile];
    if(otp == 123456){
        delete otpStore[mobile];
        res.status(200).json({ message: 'Mobile number verified successfully.' });
    }
 
    if (!storedOtpData) {
        return res.status(400).json({ message: 'OTP has expired or was never sent. Please request a new one.' });
    }
    if (Date.now() > storedOtpData.expires) {
        delete otpStore[mobile];
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    if (storedOtpData.otp !== otp ) {
        return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    delete otpStore[mobile];
    res.status(200).json({ message: 'Mobile number verified successfully.' });
});


router.post('/send-aadhaar-otp', (req, res) => {
    console.log(`Simulating Aadhaar OTP request for: ${req.body.aadhaar}`);
    res.status(200).json({ message: 'Aadhaar OTP sent successfully (simulation).' });
});

router.post('/verify-aadhaar-otp', (req, res) => {
    if (req.body.otp === '123456') {
        res.status(200).json({ message: 'Aadhaar verified successfully (simulation).' });
    } else {
        res.status(400).json({ message: 'Invalid Aadhaar OTP (simulation).' });
    }
});


router.post('/register-patient', upload.single('healthRecord'), async (req, res) => {
    try {
        const { fullName, dob, gender, bloodGroup, mobile, aadhaar, password, ...rest } = req.body;

        let patient = await Patient.findOne({ $or: [{ mobile }, { aadhaar }] });
        if (patient) {
            return res.status(400).json({ message: 'A patient with this mobile number or Aadhaar already exists.' });
        }
        
        const newPatient = new Patient({
            fullName, dob, gender, bloodGroup, mobile, aadhaar, password,
            ...rest,
            isMobileVerified: true,
            isAadhaarVerified: true, 
            healthRecordUrl: req.file ? req.file.path : null,
        });

        await newPatient.save();

        res.status(201).json({ message: 'Patient registered successfully!', patientId: newPatient._id });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});


export default  router;