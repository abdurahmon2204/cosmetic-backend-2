// controllers/basketController.js
const User = require('../models/User');

// @route GET /api/basket
// @desc  Savatchadagi barcha mahsulotlarni ko'rish (Himoyalangan)
exports.getBasket = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('basket.product');
        res.status(200).json({ success: true, basket: user.basket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route POST /api/basket/:productId
// @desc  Savatchaga mahsulot qo'shish (Himoyalangan)
exports.addItemToBasket = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    try {
        const user = await User.findById(req.user.id);

        const itemIndex = user.basket.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            // Agar mahsulot allaqachon mavjud bo'lsa, miqdorini oshirish
            user.basket[itemIndex].quantity += parseInt(quantity) || 1;
        } else {
            // Yangi mahsulotni qo'shish
            user.basket.push({ product: productId, quantity: parseInt(quantity) || 1 });
        }

        await user.save();
        // Yangilangan savatchani to'liq ma'lumotlar bilan qaytarish (populating)
        const updatedUser = await User.findById(req.user.id).populate('basket.product');

        res.status(200).json({ success: true, message: 'Mahsulot savatchaga qoʻshildi.', basket: updatedUser.basket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route DELETE /api/basket/:itemId
// @desc  Savatchadan mahsulotni o'chirish (Himoyalangan)
exports.removeItemFromBasket = async (req, res) => {
    const { itemId } = req.params; // Bu yerda itemId, basket ichidagi array elementining _id'si
    
    try {
        const user = await User.findById(req.user.id);

        // $pull operatori array ichidan shartga mos keladigan elementni o'chiradi
        user.basket.pull({ _id: itemId }); // Savatcha ichidan elementni o'chirish
        
        await user.save();
        const updatedUser = await User.findById(req.user.id).populate('basket.product');

        res.status(200).json({ success: true, message: 'Mahsulot savatchadan olib tashlandi.', basket: updatedUser.basket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};