const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

// Barcha mahsulotlarni olish
router.get('/all', productController.getProducts);

// Bitta mahsulotni ID bo'yicha olish (ProductDetail uchun)
router.get('/:id', productController.getSingleProduct);

// Mahsulot qo'shish
router.post('/add', upload.single('image'), productController.addProduct);

// Mahsulotni o'chirish
router.delete('/delete/:id', productController.deleteProduct);

module.exports = router;