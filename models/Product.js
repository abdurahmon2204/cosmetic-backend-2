const Product = require('../models/Product');
const admin = require('firebase-admin');

// DIQQAT: admin.initializeApp bu yerda bo'lishi shart emas, 
// chunki u server.js da bir marta bajarilishi yetarli. 
// Lekin xavfsizlik uchun faqat bucket-ni shu usulda olamiz:
const bucket = admin.apps.length > 0 ? admin.storage().bucket() : null;

// 1. Yangi mahsulot qo'shish
exports.addProduct = async (req, res) => {
    try {
        if (!bucket) {
            return res.status(500).json({ success: false, message: "Firebase ulanishi mavjud emas!" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Rasm yuklanmadi!" });
        }

        // Fayl nomi va yuklash oqimi
        const fileName = `products/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            },
            resumable: false
        });

        stream.on('error', (error) => {
            console.error("Firebase yuklash xatosi:", error);
            return res.status(500).json({ success: false, message: "Firebase xatosi: " + error.message });
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
                res.status(500).json({ success: false, message: "MongoDB xatosi: " + dbError.message });
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
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
        }

        if (product.image && bucket) {
            const fileName = product.image.split(`${bucket.name}/`)[1];
            if (fileName) {
                await bucket.file(fileName).delete().catch(e => console.log("Rasm topilmadi."));
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "O'chirildi!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};