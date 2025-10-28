import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true],
    },
    role: {
        type: String,
        required: true,
        enum: ['Doctor', 'Compounder', 'Dispenser', 'Laboratorian'],
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    specialization: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    contactNumber: {
        type: String,
        required: true
    }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('AllWorkers', userSchema);

export default User;