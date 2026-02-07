require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const productRoutes = require('./routes/productRoutes');
const connectDB = require('./config/db');

const app = express();
connectDB(); 

// --- FIREBASE ULASH (RENDER UCHUN TO'G'RILANGAN) ---
try {
    if (!admin.apps.length) {
        // Renderdagi \n muammosini hal qiluvchi privateKey formati
        const privateKey = process.env.FIREBASE_PRIVATE_KEY 
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
            : undefined;

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
} catch (error) {
    console.error("❌ Firebase ulanishida xatolik:", error.message);
}
// --------------------------------------------------

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send("Server ishlayapti!");
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ${PORT}-portda ishga tushdi`);
});