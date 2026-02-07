const Product = require('../models/Product');
const admin = require('firebase-admin');

// Firebase bucket-ni server.js-dagi ulanishdan foydalanib olamiz
// initializeApp shart emas, chunki u server.js da bajarildi
const getBucket = () => admin.storage().bucket();

// 1. Yangi mahsulot qo'shish
exports.addProduct = async (req, res) => {
    try {
        const bucket = getBucket();

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Rasm yuklanmadi!" });
        }

        // Fayl nomi: products papkasi ichiga vaqt tamg'asi bilan saqlaymiz
        const fileName = `products/${Date.now()}_${req.file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        stream.on('error', (error) => {
            console.error("Firebase xatosi:", error);
            return res.status(500).json({ success: false, message: "Firebase xatosi: " + error.message });
        });

        stream.on('finish', async () => {
            try {
                // Rasmni hamma ko'rishi uchun ruxsat berish
                await fileUpload.makePublic();
                
                // Rasmni URL manzilini yasash
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
                res.status(500).json({ success: false, message: "MongoDB saqlashda xato: " + dbError.message });
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

// 4. Mahsulotni o'chirish
exports.deleteProduct = async (req, res) => {
    try {
        const bucket = getBucket();
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
        }

        // Firebase-dan rasmni o'chirish mantiqi
        if (product.image) {
            // URL-dan fayl yo'lini ajratib olish
            const parts = product.image.split(`${bucket.name}/`);
            if (parts.length > 1) {
                const fileName = parts[1];
                await bucket.file(fileName).delete().catch(e => console.log("Firebase rasm topilmadi:", e.message));
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "O'chirildi!" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};