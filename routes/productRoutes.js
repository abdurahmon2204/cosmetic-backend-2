const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload'); 

router.get('/all', productController.getProducts); // Controllerda getProducts bo'lishi shart!
router.get('/:id', productController.getSingleProduct);
router.post('/add', upload.single('image'), productController.addProduct);
router.delete('/delete/:id', productController.deleteProduct);

module.exports = router;