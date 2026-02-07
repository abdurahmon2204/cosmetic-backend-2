require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();

// 1. MongoDB ulanishi
connectDB(); 

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 2. Asosiy yo'nalishlar (Routerlar)
app.use('/api/products', productRoutes);

// Tekshirish uchun bosh sahifa
app.get('/', (req, res) => {
    res.send("🚀 Server ImgBB bilan muvaffaqiyatli ishlayapti!");
});

// 3. Port sozlamalari
const PORT = process.env.PORT || 5005;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ${PORT}-portda ishga tushdi`);
    console.log(`📡 Mahsulotlar: http://localhost:${PORT}/api/products/all`);
});