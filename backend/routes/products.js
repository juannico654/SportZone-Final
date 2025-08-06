const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get('/', productController.getAllProducts);

// GET /api/products/category/:category - Obtener productos por categoría
router.get('/category/:category', productController.getProductsByCategory);

// GET /api/products/:id/stats - Obtener estadísticas de un producto
router.get('/:id/stats', productController.getProductStats);

// POST /api/products - Crear producto
router.post('/', productController.createProduct);

// PUT /api/products/:id - Actualizar producto
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', productController.deleteProduct);

module.exports = router;