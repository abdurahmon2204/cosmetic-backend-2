// server.js
// --- 1. Maxfiy Sozlamalarni Yuklash (ENG BOSHI) ---
require('dotenv').config({ path: './.env' }); 

// --- 2. Kerakli Modullarni Import Qilish ---
// EXPRESS ENG BIRINCHI IMPORT QILINISHI SHART!
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
// ENDI express() chaqirilmoqda, chunki u yuqorida aniqlangan.
const app = express(); 
const PORT = process.env.PORT || 3000; 

// ... qolgan kodlar (middleware va app.use) ...

// Serverni ishga tushirish
app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} portida ishlamoqda.`);
});