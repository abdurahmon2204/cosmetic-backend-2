const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Mahsulot nomi kiritilishi shart"] 
    },
    price: { 
        type: Number, 
        required: [true, "Mahsulot narxi kiritilishi shart"] 
    },
    description: { 
        type: String 
    },
    image: { 
        type: String, 
        required: [true, "Mahsulot rasmi bo'lishi shart"] 
    },
    category: {
        type: String
    }
}, { 
    timestamps: true // Bu qator mahsulot qachon yaratilganini avtomatik saqlaydi
});

module.exports = mongoose.model('Product', productSchema);