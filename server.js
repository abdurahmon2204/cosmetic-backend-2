require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Routerni import qilishda e'tiborli bo'ling
const productRoutes = require('./routes/productRoutes');
const connectDB = require('./config/db');

const app = express();

// MongoDB ulanishi
connectDB(); 

// --- FIREBASE INITIALIZATION ---
// Buni try-catch ichida saqlash yaxshi, lekin o'zgaruvchilarni tekshirish shart
try {
    if (!admin.apps.length) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY 
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
            : undefined;

        if (!process.env.FIREBASE_PROJECT_ID || !privateKey) {
            console.error("❌ XATO: Firebase o'zgaruvchilari topilmadi! Render Dashboardni tekshiring.");
        } else {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "cosmetic-seller2.firebasestorage.app"
            });
            console.log("✅ Firebase muvaffaqiyatli ulandi!");
        }
    }
} catch (error) {
    console.error("❌ Firebase ulanishida xatolik:", error.message);
}
// --------------------------------------------------

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Asosiy yo'nalishlar
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send("Server ishlayapti! Mahsulotlar uchun /api/products/all ga murojaat qiling.");
});

// Render uchun PORT sozlamasi
const PORT = process.env.PORT || 5005;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ${PORT}-portda ishga tushdi`);
});