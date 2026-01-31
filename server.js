require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const productRoutes = require('./routes/productRoutes');
const connectDB = require('./config/db');

const app = express();
connectDB(); 

// FIREBASE ULASH
try {
    const keyPath = path.join(__dirname, 'firebase-key.json');
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "cosmetic-seller2.firebasestorage.app"
        });
        console.log("✅ Firebase muvaffaqiyatli ulandi!");
    }
} catch (error) {
    console.error("❌ Firebase ulanishida xatolik:", error.message);
}

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send("Server ishlayapti!");
});

// PORTNI 5001 QILDIK (Band bo'lmasligi uchun)
const PORT = process.env.PORT || 5005;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ${PORT}-portda ishga tushdi`);
});