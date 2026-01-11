// controllers/authController.js
const User = require('../models/User');

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token, username: user.username });
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });
        sendTokenResponse(user, 201, res);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Bu email yoki username band.' });
        }
        res.status(500).json({ message: 'Roʻyxatdan oʻtishda xatolik.', error: error.message });
    }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email va parolni kiriting.' });
    }
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Notoʻgʻri email yoki parol.' });
        }
        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ message: 'Tizimga kirishda xatolik.', error: error.message });
    }
};