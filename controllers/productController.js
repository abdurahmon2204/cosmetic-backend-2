const fs = require('fs');
const path = require('path');

// Hozircha vaqtinchalik ma'lumotlar bazasi (array)
let products = [];

// 1. Mahsulot qo'shish
exports.addProduct = (req, res) => {
    try {
        const { name, brand, price, stock } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ success: false, message: "Nom va narx majburiy!" });
        }

        const newProduct = {
            id: Date.now().toString(), // Unikal ID
            name,
            brand: brand || "Noma'lum",
            price: price,
            stock: stock || 0,
            image: req.file ? req.file.filename : null
        };

        products.push(newProduct);
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Barcha mahsulotlarni ko'rish
exports.getProducts = (req, res) => {
    res.json({ success: true, count: products.length, data: products });
};

// 3. BITTA MAHSULOTNI OLISH (Frontenddagi Detail sahifasi uchun kerak)
exports.getSingleProduct = (req, res) => {
    const { id } = req.params;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
    }

    res.json({ success: true, data: product });
};

// 4. Mahsulotni o'chirish (Rasm bilan birga)
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
        // Fayl mavjudligini tekshirib keyin o'chirish
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Rasmni fayl tizimidan o'chirishda xato:", err);
            });
        }
    }

    // Arraydan o'chirish
    products.splice(productIndex, 1);
    res.json({ success: true, message: "Mahsulot va uning rasmi o'chirildi" });
};