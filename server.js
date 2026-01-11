// server.js
// --- 1. Maxfiy Sozlamalarni Yuklash (ENG BOSHI) ---
// dotenv paketini chaqirib, .env faylidagi o'zgaruvchilarni yuklaymiz.
require('dotenv').config({ path: './.env' }); 

// --- 2. Kerakli Modullarni Import Qilish ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); 

// --- 3. Route Fayllarini Import Qilish ---
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes'); 
const basketRoutes = require('./routes/basketRoutes'); 

// --- 4. MongoDB ga Ulanish ---
connectDB();

// --- 5. Express Ilovasini O'rnatish ---
const app = express();
const PORT = process.env.PORT || 3000; 

// --- 6. Global Middleware'lar ---
// CORS (Cross-Origin Resource Sharing): Boshqa domendan kirishga ruxsat beradi
app.use(cors());

// Body Parser: Kelayotgan JSON va form-data ma'lumotlarini o'qish uchun
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// --- 7. Statik Fayllar uchun Manzil ---
// 'uploads' papkasidagi rasmlarni URL orqali ko'rish imkonini beradi.
// Eslatma: Haqiqiy deploymentda Cloudinary/S3 kabi xizmatlar ishlatilishi tavsiya etiladi.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 8. Asosiy API Yo'llarini Ulash ---
app.use('/api/auth', authRoutes);     // /api/auth/register, /api/auth/login
app.use('/api/products', productRoutes); // /api/products (CRUD)
app.use('/api/basket', basketRoutes);   // /api/basket (Savatcha funksiyalari)

// --- 9. Serverni Ishga Tushirish ---
app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} portida ishlamoqda.`);
});