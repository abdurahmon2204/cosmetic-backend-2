require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Papkalarni import qilish (Yo'llar to'g'riligini tekshiring)
const productRoutes = require('./routes/productRoutes');
const connectDB = require('./config/db');

const app = express();

// 1. Ma'lumotlar bazasiga ulanish (Agar config/db.js tayyor bo'lsa)
// connectDB(); 

// 2. Middleware sozlamalari
app.use(cors());
app.use(express.json()); // JSON formatidagi body'ni o'qish uchun
app.use(express.urlencoded({ extended: true })); // Form-data uchun

// 3. 'uploads' papkasini tekshirish (Agar yo'q bo'lsa, avtomatik yaratadi)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 4. Static papka (Rasmlarni brauzerda ko'rish uchun)
// Masalan: http://localhost:5000/uploads/rasm_nomi.jpg
app.use('/uploads', express.static(uploadDir));

// 5. API Yo'nalishlari (Routes)
app.use('/api/products', productRoutes);

// 6. Test uchun asosiy yo'l
app.get('/', (req, res) => {
    res.send('Kosmetika do\'koni backend serveri ishlamoqda...');
});

// 7. Xatoliklarni ushlash (Error Handling)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Serverda ichki xatolik yuz berdi!",
        error: err.message
    });
});

// 8. Serverni yondirish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`🚀 Server ${PORT}-portda muvaffaqiyatli yondi`);
    console.log(`📂 Rasmlar uchun: http://localhost:${PORT}/uploads`);
    console.log(`-------------------------------------------`);
});