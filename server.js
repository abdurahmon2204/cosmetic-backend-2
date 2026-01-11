// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); 
const connectDB = require('./config/db'); 

// Route fayllarini import qilish
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes'); 
const basketRoutes = require('./routes/basketRoutes'); 

// MongoDB ga ulanish
connectDB();

const app = express();
const PORT = process.env.PORT || 3000; 

// Middleware'lar
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// --- Statik fayllar (Faqat mahalliy test uchun. Renderda ISHLAMAYDI) ---
// Haqiqiy deployment uchun Cloudinary/S3 ishlatilishi shart.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Asosiy yo'llarni ulash ---
app.use('/api/auth', authRoutes);     // Login/Register
app.use('/api/products', productRoutes); // Mahsulot CRUD
app.use('/api/basket', basketRoutes);   // Savatcha

// Serverni ishga tushirish
app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} portida ishlamoqda.`);
});