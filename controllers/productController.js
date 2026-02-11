const Product = require('../models/Product');
const axios = require('axios');
const FormData = require('form-data');

// 1. Yangi mahsulot qo'shish
exports.addProduct = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Rasm yuklanmadi!" });

        const form = new FormData();
        form.append('image', req.file.buffer.toString('base64'));

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, {
            headers: { ...form.getHeaders() }
        });

        if (response.data.success) {
            const newProduct = new Product({
                name: req.body.name,
                price: Number(req.body.price),
                description: req.body.description,
                category: req.body.category,
                image: response.data.data.url
            });
            await newProduct.save();
            res.status(201).json({ success: true, product: newProduct });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Barcha mahsulotlarni olish (XATO SHU YERDA EDI)
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
        if (!product) return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. O'chirish
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Topilmadi" });
        res.status(200).json({ success: true, message: "O'chirildi" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// controllers/productController.js

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body; // Postmandan kelayotgan yangi ma'lumotlar

        // Diqqat:findByIdAndUpdate ishlatilishi shart!
        const product = await Product.findByIdAndUpdate(id, updatedData, { new: true });

        if (!product) {
            return res.status(404).json({ message: "Mahsulot topilmadi" });
        }

        res.status(200).json({ message: "Mahsulot yangilandi", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};