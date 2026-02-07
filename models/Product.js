const Product = require('../models/Product');
const admin = require('firebase-admin');

/**
 * FIREBASE INITIALIZATION
 * Render-da JWT Signature xatosi chiqmasligi uchun privateKey-ni 
 * split/join usulida tozalab olamiz.
 */
if (!admin.apps.length) {
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;
    const formattedKey = rawKey ? rawKey.replace(/\\n/g, '\n') : undefined;

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: formattedKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
}

const bucket = admin.storage().bucket();

// 1. Yangi mahsulot qo'shish
exports.addProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Rasm yuklanmadi!" });
        }

        // Fayl nomi: products papkasiga vaqt bilan saqlash
        const fileName = `products/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            },
            resumable: false // Kichik fayllar uchun tezroq ishlaydi
        });

        stream.on('error', (error) => {
            console.error("Firebase yuklash xatosi:", error);
            return res.status(500).json({ success: false, message: "Firebase xatosi: " + error.message });
        });

        stream.on('finish', async () => {
            try {
                // Rasmni ommaviy (public) qilish
                await fileUpload.makePublic();
                
                // Rasmni URL manzilini olish
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

                // MongoDB-ga saqlash
                const newProduct = new Product({
                    name: req.body.name,
                    price: req.body.price,
                    description: req.body.description,
                    category: req.body.category,
                    image: imageUrl
                });

                await newProduct.save();
                res.status(201).json({ success: true, product: newProduct });

            } catch (dbError) {
                console.error("DB Saqlash xatosi:", dbError);
                res.status(500).json({ success: false, message: "Ma'lumotlar bazasiga saqlashda xato!" });
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
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Bitta mahsulotni olish
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

// 4. Mahsulotni o'chirish
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
                await bucket.file(fileName).delete().catch(e => console.log("Firebase-da rasm allaqachon o'chgan."));
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Mahsulot muvaffaqiyatli o'chirildi!" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};