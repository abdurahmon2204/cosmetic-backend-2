const Product = require('../models/Product');
const admin = require('firebase-admin');

// 1. Yangi mahsulot qo'shish
exports.addProduct = async (req, res) => {
    try {
        // Firebase bucketni funksiya ichida chaqiramiz
        const bucket = admin.storage().bucket();

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Rasm yuklanmadi!" });
        }

        // Firebase uchun file nomi
        const fileName = `products/${Date.now()}_${req.file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: { contentType: req.file.mimetype }
        });

        stream.on('error', (error) => {
            res.status(500).json({ success: false, message: "Firebase xatosi: " + error.message });
        });

        stream.on('finish', async () => {
            // Rasmni internetda ko'rinadigan qilish
            await fileUpload.makePublic();
            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

            // MongoDB-ga saqlash
            const newProduct = new Product({
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                image: imageUrl // Firebase linki
            });

            await newProduct.save();
            res.status(201).json({ success: true, product: newProduct });
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
        const bucket = admin.storage().bucket(); // Funksiya ichida chaqiramiz
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

        // Firebase-dan rasmni o'chirish
        const fileUrl = product.image;
        if (fileUrl) {
            // URL ichidan fayl nomini ajratib olish
            const fileName = fileUrl.split(`${bucket.name}/`)[1];
            if (fileName) {
                await bucket.file(fileName).delete().catch(e => console.log("Rasm o'chmadi:", e.message));
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "O'chirildi!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};