const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProductById);
router.post('/batch', ctrl.getProductsByIds);
router.post('/', ctrl.createProduct);
router.delete('/:id', ctrl.deleteProduct);

module.exports = router;
