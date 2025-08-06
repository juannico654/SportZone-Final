const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// GET /api/users - Obtener todos los usuarios (admin)
router.get('/', userController.getAllUsers);

// GET /api/users/:id/stats - Obtener estadísticas de un usuario
router.get('/:id/stats', userController.getUserStats);

// DELETE /api/users/:id - Eliminar usuario (admin)
router.delete('/:id', userController.deleteUser);

// PUT /api/users/:id/role - Actualizar rol de usuario (admin)
router.put('/:id/role', userController.updateUserRole);

module.exports = router;