import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const patientSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    emergencyContact: { type: String },
    occupation: { type: String },
    homeState: { type: String, required: true },
    homeCity: { type: String, required: true },

    pastHistory: { type: String },
    allergies: { type: String },
    disabilities: { type: String },
    medications: { type: String },
    healthRecordUrl: { type: String },

    mobile: { type: String, required: true},
    aadhaar: { type: String, required: true, unique: true },

    mobileOtp: { type: String },
    mobileOtpExpires: { type: Date },
    isMobileVerified: { type: Boolean, default: false },
    isAadhaarVerified: { type: Boolean, default: false },

    password: { type: String, required: true },
    
    consents: {
        data: { type: Boolean, default: false },
        share: { type: Boolean, default: false },
        terms: { type: Boolean, default: false }
    }
}, { timestamps: true });

patientSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const PatientModel = mongoose.model('patientbyselves', patientSchema);

export default PatientModel;