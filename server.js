require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Papkalarni import qilish
const productRoutes = require('./routes/productRoutes');
const connectDB = require('./config/db');

const app = express();

// 1. Ma'lumotlar bazasiga ulanish
// Agar MongoDB ulamagan bo'lsangiz, buni vaqtincha kommentariyada qoldiring
// connectDB(); 

// 2. Middleware sozlamalari
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 3. 'uploads' papkasini tekshirish (Renderda papka yo'qolib qolsa, avtomatik yaratadi)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 4. Static papka (Rasmlarni brauzerda ko'rish uchun eng muhim qism)
// Brauzerda: https://...onrender.com/uploads/rasm.jpg deb ko'rish imkonini beradi
app.use('/uploads', express.static(uploadDir));

// 5. API Yo'nalishlari (Routes)
app.use('/api/products', productRoutes);

// 6. Asosiy sahifa testi
app.get('/', (req, res) => {
    res.send("Kosmetika do'koni backend serveri muvaffaqiyatli ishlayapti!");
});

// 7. Xatoliklarni ushlash
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Serverda ichki xatolik!",
        error: err.message
    });
});

// 8. Serverni yondirish
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ${PORT}-portda ishga tushdi`);
});