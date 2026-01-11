// routes/basketRoutes.js
const express = require('express');
const { getBasket, addItemToBasket, removeItemFromBasket } = require('../controllers/basketController');
const { protect } = require('../middleware/auth'); // Himoya

const router = express.Router();

// Barcha savatcha yo'llarini himoyalash
router.use(protect); 

// GET /api/basket
router.get('/', getBasket);

// POST /api/basket/:productId (Mahsulot qo'shish)
router.post('/:productId', addItemToBasket);

// DELETE /api/basket/:itemId (Savatcha elementini o'chirish)
router.delete('/:itemId', removeItemFromBasket); 

module.exports = router;