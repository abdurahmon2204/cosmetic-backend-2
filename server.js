// server.js

// -------------------------------------------------------------
// --- 1. Maxfiy Sozlamalarni Yuklash (ENG BOSHI) ---
// dotenv paketini chaqirib, .env faylidagi o'zgaruvchilarni yuklaymiz.
require('dotenv').config({ path: './.env' }); 

// -------------------------------------------------------------
// --- 2. Kerakli Modullarni Import Qilish ---
const express = require('express'); // Express eng birinchi import qilinishi shart!
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); 

// --- 3. Route Fayllarini Import Qilish ---
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes'); 
const basketRoutes = require('./routes/basketRoutes'); 

// -------------------------------------------------------------
// --- 4. MongoDB ga Ulanish ---
connectDB();

// --- 5. Express Ilovasini O'rnatish ---
const app = express();
const PORT = process.env.PORT || 3000; 

// -------------------------------------------------------------
// --- 6. Global Middleware'lar (Tartibi Muhim!) ---

// 6.1. CORS: Boshqa domendan kelgan so'rovlarga ruxsat berish
app.use(cors());

// 6.2. Body Parser: JSON formatidagi ma'lumotlarni req.body ga yuklash
app.use(express.json()); 

// 6.3. URL-encoded ma'lumotlarni o'qish (agar form-data ishlatilsa)
app.use(express.urlencoded({ extended: true })); 

// 6.4. Statik Fayllar uchun Manzil (Rasmlar, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------------------------------------------------
// --- 7. Asosiy API Yo'llarini Ulash (Routes) ---

app.use('/api/auth', authRoutes);     // Register / Login
app.use('/api/products', productRoutes); // Mahsulotlar
app.use('/api/basket', basketRoutes);   // Savatcha

// -------------------------------------------------------------
// --- 8. Serverni Ishga Tushirish ---

app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} portida ishlamoqda.`);
});