// models/Product.js
const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        description: { type: String, default: 'Tavsif yoʻq' },
        imageUrl: { type: String, required: true }, // Rasm URL manzili
        stock: { type: Number, default: 0 }, // Sklad qoldig'i
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);