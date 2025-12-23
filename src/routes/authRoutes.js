import express from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({ userId}, process.env.JWT_SECRET, { expiresIn: '5d' });
};

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }

        //existing email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        //existing username
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        
        // get random avatar
        const profileImage = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;

        const newUser = new User({ 
            username,
            email, 
            password,
            profileImage
         });
         
        await newUser.save();

        const token = generateToken(newUser._id);

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profileImage: newUser.profileImage,
                createdAt: newUser.createdAt
            }
        });
    
    }catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//login 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }});
        
        }catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;