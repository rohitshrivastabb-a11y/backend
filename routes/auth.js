// routes/auth.js
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.API_BASE_URL}/api/auth/google/callback` // Redirect URI
);

// Route jise frontend call karega 'code' ke saath
router.post('/google/callback', async (req, res) => {
    const { code } = req.body;

    try {
        // Code ko token se exchange karein
        const { tokens } = await oAuth2Client.getToken(code);
        const { id_token } = tokens;

        // Token ko verify karke user ki details nikalein
        const ticket = await oAuth2Client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: profilePicture } = payload;

        // Database mein user ko dhoondein ya naya banayein (upsert)
        let user = await User.findOne({ googleId });

        if (!user) {
            // Agar user nahi mila to naya banayein
            user = new User({
                googleId,
                email,
                name,
                profilePicture,
            });
            await user.save();
        }

        // User ke liye ek JWT banayein
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d', // Token 7 din mein expire hoga
        });
        
        // Frontend ko token aur user data bhejein
        res.status(200).json({ token, user });

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
});

// Endpoint to verify token and get current user (for frontend reloads)
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-__v');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Endpoint to provide Google Client ID to frontend
router.get('/google-client-id', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});


module.exports = router;