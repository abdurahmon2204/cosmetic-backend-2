const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload'); 

/**
 * @route   GET /api/products/all
 * @desc    Barcha mahsulotlarni bazadan olish
 */
router.get('/all', productController.getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Bitta mahsulotni ID bo'yicha olish
 */
router.get('/:id', productController.getSingleProduct);

/**
 * @route   POST /api/products/add
 * @desc    Yangi mahsulot qo'shish (ImgBB orqali rasm yuklanadi)
 * @access  Public
 */
router.post('/add', upload.single('image'), productController.addProduct);

/**
 * @route   DELETE /api/products/delete/:id
 * @desc    Mahsulotni o'chirish
 */
router.delete('/delete/:id', productController.deleteProduct);

module.exports = router;