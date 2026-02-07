const Product = require('../models/Product');
const admin = require('firebase-admin');

/**
 * FIREBASE INITIALIZATION
 * Render platformasida Private Key xatosi chiqmasligi uchun 
 * .replace() funksiyasidan foydalanilgan.
 */
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY 
                ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
                : undefined,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
}

const bucket = admin.storage().bucket();

// 1. Yangi mahsulot qo'shish (Rasm Firebase-ga, Ma'lumotlar MongoDB-ga)
exports.addProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Rasm yuklanmadi!" });
        }

        // Firebase-ga yuklanadigan fayl nomi va yo'li
        const fileName = `products/${Date.now()}_${req.file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        // Yuklashda xato bo'lsa
        stream.on('error', (error) => {
            console.error("Firebase xatosi:", error);
            return res.status(500).json({ success: false, message: "Firebase xatosi: " + error.message });
        });

        // Yuklash muvaffaqiyatli tugasa
        stream.on('finish', async () => {
            try {
                // Rasmni hamma ko'rishi uchun ruxsat berish
                await fileUpload.makePublic();
                
                // Rasmni hamma ko'ra oladigan linki (URL)
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

                // MongoDB-ga saqlash
                const newProduct = new Product({
                    name: req.body.name,
                    price: req.body.price,
                    description: req.body.description,
                    category: req.body.category,
                    image: imageUrl // Firebase-dan qaytgan link
                });

                await newProduct.save();
                res.status(201).json({ success: true, product: newProduct });

            } catch (dbError) {
                res.status(500).json({ success: false, message: "MongoDB saqlashda xato: " + dbError.message });
            }
        });

        stream.end(req.file.buffer);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Barcha mahsulotlarni bazadan olish
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Bitta mahsulotni ID bo'yicha olish
exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Mahsulotni o'chirish (Firebase-dagi rasmi bilan birga)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
        }

        // Firebase-dan rasmni o'chirish
        if (product.image) {
            const fileName = product.image.split(`${bucket.name}/`)[1];
            if (fileName) {
                await bucket.file(fileName).delete().catch(e => console.log("Rasm o'chirishda xato:", e.message));
            }
        }

        // MongoDB-dan o'chirish
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Mahsulot va uning rasmi muvaffaqiyatli o'chirildi" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};