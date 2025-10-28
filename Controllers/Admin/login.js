import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../../xyzModel.js';
import dotenv from 'dotenv';

dotenv.config(); 


// const JWT_SECRET =  'your-very-secret-key';


export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Limit each IP to 5 login requests per windowMs
  message: { msg: 'Too many login attempts from this IP, please try again after a minute.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const Adminlogin =  async (req, res) => {
    const { userId, password } = req.body;
    console.log('cxscx');
    // Basic validation
    console.log(userId, password )
    if (!userId || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials. User not found.' });
        }

        // const isMatch = await bcrypt.compare(password, user.password);
        // console.log(isMatch);
        // if (!isMatch) {
        //     return res.status(400).json({ msg: 'Invalid credentials. Incorrect password.' });
        // }

        // 3. User is authenticated. Create a payload for the JWT.
        // The payload includes the user's database ID and their role.
        // The frontend can use the 'role' to redirect to the correct dashboard.
        const payload = {
            user: {
                id: user.id, // MongoDB's default _id
                role: user.role // e.g., "Doctor", "Compounder", etc.
            }
        };

        // 4. Sign the JWT
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' }, // Token expires in 5 hours
            (err, token) => {
                if (err) throw err;
                // 5. Send the token and user info back to the client
                res.json({
                    token,
                    user: {
                        id: user.id,
                        userId: user.userId,
                        fullName: user.fullName,
                        role: user.role
                    },
                    msg: `Login successful. Welcome ${user.role}!`
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export default Adminlogin;