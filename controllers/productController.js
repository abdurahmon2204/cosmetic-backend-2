const Product = require('../models/Product');
const admin = require('firebase-admin');

// DIQQAT: Bu yerda initializeApp() bo'lmasligi shart!
// Shunchaki mavjud ulanishdan bucket-ni olamiz
const getBucket = () => {
    if (admin.apps.length === 0) {
        console.error("❌ Firebase hali ishga tushmagan!");
        return null;
    }
    return admin.storage().bucket();
};

// 1. Yangi mahsulot qo'shish
exports.addProduct = async (req, res) => {
    try {
        const bucket = getBucket();
        if (!bucket) return res.status(500).json({ success: false, message: "Firebase xatosi!" });

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Rasm yuklanmadi!" });
        }

        const fileName = `products/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: { contentType: req.file.mimetype },
            resumable: false
        });

        stream.on('error', (error) => {
            return res.status(500).json({ success: false, message: error.message });
        });

        stream.on('finish', async () => {
            try {
                await fileUpload.makePublic();
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

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
                res.status(500).json({ success: false, message: "DB xatosi: " + dbError.message });
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
        if (!product) return res.status(404).json({ success: false, message: "Topilmadi" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. O'chirish
exports.deleteProduct = async (req, res) => {
    try {
        const bucket = getBucket();
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Topilmadi" });

        if (product.image && bucket) {
            const fileName = product.image.split(`${bucket.name}/`)[1];
            if (fileName) {
                await bucket.file(fileName).delete().catch(() => console.log("Rasm topilmadi"));
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "O'chirildi" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};