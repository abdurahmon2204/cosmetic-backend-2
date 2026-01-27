const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

router.post('/add', upload.single('image'), productController.addProduct);
router.get('/all', productController.getProducts);
router.delete('/delete/:id', productController.deleteProduct); // O'chirish yo'li

module.exports = router;