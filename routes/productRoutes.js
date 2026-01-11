// routes/productRoutes.js
const express = require('express');
const { createProduct, getAllProducts, deleteProduct } = require('../controllers/productController');
const upload = require('../config/multer'); // Multer konfiguratsiyasi
const { protect } = require('../middleware/auth'); // Himoya middleware'i

const router = express.Router();

// Mahsulot qo'shish: Avvalo rasm yuklanadi, keyin controller ishga tushadi. Faqat login qilganlar uchun.
router.post('/', protect, upload.single('image'), createProduct); 

// Barcha mahsulotlarni olish: Hamma uchun ochiq
router.get('/', getAllProducts);

// Mahsulotni o'chirish: Faqat login qilganlar uchun
router.delete('/:id', protect, deleteProduct); 

module.exports = router;