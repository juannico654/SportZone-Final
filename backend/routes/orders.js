const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// POST /api/orders - Crear pedido desde carrito
router.post('/', orderController.createOrder);

// GET /api/orders/user/:userId - Obtener pedidos de un usuario
router.get('/user/:userId', orderController.getUserOrders);

// GET /api/orders/:id - Obtener detalles de un pedido específico
router.get('/:id', orderController.getOrderDetails);

// GET /api/orders - Obtener todos los pedidos (admin)
router.get('/', orderController.getAllOrders);

// PUT /api/orders/:id/status - Actualizar estado de un pedido (admin)
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;