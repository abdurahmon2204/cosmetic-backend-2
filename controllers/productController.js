const fs = require('fs');
const path = require('path');

// Hozircha vaqtinchalik ma'lumotlar bazasi (array)
let products = [];

// 1. Mahsulot qo'shish
exports.addProduct = (req, res) => {
    const { name, brand, price, stock } = req.body;
    
    const newProduct = {
        id: Date.now().toString(), // Unikal ID
        name,
        brand,
        price,
        stock,
        image: req.file ? req.file.filename : null
    };

    products.push(newProduct);
    res.status(201).json({ success: true, data: newProduct });
};

// 2. Barcha mahsulotlarni ko'rish
exports.getProducts = (req, res) => {
    res.json({ success: true, count: products.length, data: products });
};

// 3. Mahsulotni o'chirish (Rasm bilan birga)
exports.deleteProduct = (req, res) => {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
    }

    const product = products[productIndex];

    // Rasmni papkadan o'chirish logikasi
    if (product.image) {
        const imagePath = path.join(__dirname, '../uploads/', product.image);
        fs.unlink(imagePath, (err) => {
            if (err) console.log("Rasmni o'chirishda xato:", err);
        });
    }

    // Bazadan o'chirish
    products.splice(productIndex, 1);
    res.json({ success: true, message: "Mahsulot va uning rasmi o'chirildi" });
};