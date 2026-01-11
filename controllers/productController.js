// controllers/productController.js
const Product = require('../models/Product');

// @route POST /api/products (Himoyalangan: Faqat login qilgan qo'sha oladi)
exports.createProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Rasm fayli yuklanmadi.' });
        }
        
        const newProduct = await Product.create({
            ...req.body,
            imageUrl: `/uploads/${req.file.filename}`, // Rasm manzilini saqlash
        });

        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @route GET /api/products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Mahsulotlarni olishda xatolik.' });
    }
};

// @route DELETE /api/products/:id (Himoyalangan)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Mahsulot topilmadi.' });
        }
        res.status(200).json({ success: true, message: 'Mahsulot muvaffaqiyatli oʻchirildi.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};