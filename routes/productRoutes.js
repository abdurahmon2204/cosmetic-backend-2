const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload'); // RAMda ushlab turuvchi multer sozlamasi

/**
 * @route   GET /api/products/all
 * @desc    Barcha mahsulotlarni bazadan olish
 */
router.get('/all', productController.getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Bitta mahsulotni ID bo'yicha olish (Batafsil sahifa uchun)
 */
router.get('/:id', productController.getSingleProduct);

/**
 * @route   POST /api/products/add
 * @desc    Yangi mahsulot qo'shish (Rasm Firebase-ga, ma'lumotlar MongoDB-ga)
 * @access  Public (yoki Admin, agar token bo'lsa)
 */
router.post('/add', upload.single('image'), productController.addProduct);

/**
 * @route   DELETE /api/products/delete/:id
 * @desc    Mahsulotni o'chirish (Firebase-dagi rasmi bilan birga)
 */
router.delete('/delete/:id', productController.deleteProduct);

module.exports = router;