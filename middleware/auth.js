// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Ruti himoyalash. Faqat login qilgan foydalanuvchilar kira oladi.
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Bearer token dan token so'zini ajratib olish
        token = req.headers.authorization.split(' ')[1];
    } 
    // Agar Front-end Cookie bilan ishlasa:
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Token mavjudligini tekshirish
    if (!token) {
        return res.status(401).json({ success: false, message: "Avtorizatsiyadan o'tilmagan." });
    }

    try {
        // Tokenni tekshirish
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Foydalanuvchini ID orqali topish (Parolsiz)
        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token yaroqsiz yoki muddati o'tgan." });
    }
};