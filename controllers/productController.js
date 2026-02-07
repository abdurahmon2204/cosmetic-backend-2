const Product = require('../models/Product');
const admin = require('firebase-admin');

// --- FIREBASE INITIALIZATION (Xatoni tuzatadigan qism) ---
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Renderdagi \n muammosini hal qiluvchi kod:
            privateKey: process.env.FIREBASE_PRIVATE_KEY 
                ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
                : undefined,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
}
// --------------------------------------------------------

// 1. Yangi mahsulot qo'shish
exports.addProduct = async (req, res) => {
    try {
        const bucket = admin.storage().bucket();

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Rasm yuklanmadi!" });
        }

        const fileName = `products/${Date.now()}_${req.file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: { contentType: req.file.mimetype }
        });

        // Xatolikni ushlash uchun 'error' hodisasi
        stream.on('error', (error) => {
            console.error("Firebase Upload Error:", error);
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: "Firebase xatosi: " + error.message });
            }
        });

        // Yuklash yakunlanganda
        stream.on('finish', async () => {
            try {
                // Rasmni ochiq (public) qilish
                await fileUpload.makePublic();
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

                // MongoDB-ga saqlash
                const newProduct = new Product({
                    name: req.body.name,
                    price: req.body.price,
                    description: req.body.description,
                    image: imageUrl
                });

                await newProduct.save();
                res.status(201).json({ success: true, product: newProduct });
            } catch (err) {
                res.status(500).json({ success: false, message: "DB saqlashda xato: " + err.message });
            }
        });

        stream.end(req.file.buffer);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Barcha mahsulotlarni olish
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Bitta mahsulotni olish
exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Topilmadi" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Mahsulotni o'chirish
exports.deleteProduct = async (req, res) => {
    try {
        const bucket = admin.storage().bucket();
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

        if (product.image) {
            // URL ichidan fayl nomini to'g'ri ajratib olish (yaxshilangan variant)
            const parts = product.image.split(`${bucket.name}/`);
            if (parts.length > 1) {
                const fileName = parts[1];
                await bucket.file(fileName).delete().catch(e => console.log("Rasm Firebase'da topilmadi, o'chirib bo'lmadi."));
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "O'chirildi!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};