const mongoose = require('mongoose');

// Mahsulot qolipi (Schema)
const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Mahsulot nomi shart"] 
    },
    price: { 
        type: Number, 
        required: [true, "Narxi shart"] 
    },
    description: { 
        type: String 
    },
    category: { 
        type: String 
    },
    image: { 
        type: String, 
        required: [true, "Rasm linki shart"] 
    }
}, { 
    // Avtomatik createdAt va updatedAt vaqtlarini qo'shadi
    timestamps: true 
});

// Modelni eksport qilish
// DIQQAT: module.exports = { Product } ko'rinishida yozmang!
module.exports = mongoose.model('Product', productSchema);