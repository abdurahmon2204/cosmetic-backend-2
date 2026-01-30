const fs = require('fs');
const path = require('path');

// Vaqtinchalik xotira
let products = [];

// 1. Mahsulot qo'shish
exports.addProduct = (req, res) => {
    try {
        const { name, brand, price, description } = req.body;
        
        // Majburiy maydonlarni tekshirish
        if (!name || !price) {
            return res.status(400).json({ success: false, message: "Nom va narx majburiy!" });
        }

        const newProduct = {
            id: Date.now().toString(),
            name,
            brand: brand || "Brendsiz",
            description: description || "Tavsif berilmagan",
            price: price,
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

// 3. Bitta mahsulotni olish
exports.getSingleProduct = (req, res) => {
    const { id } = req.params;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
    }

    res.json({ success: true, data: product });
};

// 4. Mahsulotni o'chirish
exports.deleteProduct = (req, res) => {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ success: false, message: "Mahsulot topilmadi" });
    }

    const product = products[productIndex];

    // Rasmni papkadan o'chirish
    if (product.image) {
        const imagePath = path.join(__dirname, '../uploads/', product.image);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Rasm o'chirishda xato:", err);
            });
        }
    }

    products.splice(productIndex, 1);
    res.json({ success: true, message: "Mahsulot muvaffaqiyatli o'chirildi" });
};