const db = require('../config/database');

const orderController = {
  // Crear pedido desde el carrito
  createOrder: (req, res) => {
    const { id_usuario, items, total } = req.body;
    const fecha = new Date().toISOString().split('T')[0]; // Fecha actual

    // Iniciar transacción
    db.beginTransaction((err) => {
      if (err) {
        console.error('Error al iniciar transacción:', err);
        return res.status(500).json({
          success: false,
          message: 'Error en la base de datos',
          type: 'DATABASE_ERROR'
        });
      }

      // Crear el pedido principal
      const orderQuery = 'INSERT INTO pedido (fecha, estado, total, id_usuario) VALUES (?, ?, ?, ?)';
      
      db.query(orderQuery, [fecha, 'pendiente', total, id_usuario], (err, orderResult) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error al crear pedido:', err);
            res.status(500).json({
              success: false,
              message: 'Error al crear pedido',
              type: 'DATABASE_ERROR'
            });
          });
        }

        const id_pedido = orderResult.insertId;

        // Crear los detalles del pedido
        const detailQuery = 'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES ?';
        const detailValues = items.map(item => [id_pedido, item.id_producto, item.cantidad, item.precio]);

        db.query(detailQuery, [detailValues], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error al crear detalles del pedido:', err);
              res.status(500).json({
                success: false,
                message: 'Error al procesar los productos del pedido',
                type: 'DATABASE_ERROR'
              });
            });
          }

          // Actualizar stock de productos
          const updateStockPromises = items.map(item => {
            return new Promise((resolve, reject) => {
              const updateQuery = 'UPDATE producto SET stock = stock - ? WHERE id_producto = ? AND stock >= ?';
              db.query(updateQuery, [item.cantidad, item.id_producto, item.cantidad], (err, result) => {
                if (err) {
                  reject(err);
                } else if (result.affectedRows === 0) {
                  reject(new Error(`Stock insuficiente para el producto ${item.id_producto}`));
                } else {
                  resolve();
                }
              });
            });
          });

          Promise.all(updateStockPromises)
            .then(() => {
              // Commit de la transacción
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error al hacer commit:', err);
                    res.status(500).json({
                      success: false,
                      message: 'Error al finalizar pedido',
                      type: 'DATABASE_ERROR'
                    });
                  });
                }

                res.status(201).json({
                  success: true,
                  message: 'Pedido creado exitosamente',
                  type: 'SUCCESS',
                  order: {
                    id: id_pedido,
                    fecha,
                    total,
                    estado: 'pendiente'
                  }
                });
              });
            })
            .catch((error) => {
              db.rollback(() => {
                console.error('Error al actualizar stock:', error);
                res.status(400).json({
                  success: false,
                  message: error.message || 'Error al procesar stock',
                  type: 'STOCK_ERROR'
                });
              });
            });
        });
      });
    });
  },

  // Obtener pedidos de un usuario
  getUserOrders: (req, res) => {
    const { userId } = req.params;

    const query = `
      SELECT p.*, 
             GROUP_CONCAT(CONCAT(pr.nombre, ' (', dp.cantidad, ')') SEPARATOR ', ') as productos
      FROM pedido p
      LEFT JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      LEFT JOIN producto pr ON dp.id_producto = pr.id_producto
      WHERE p.id_usuario = ?
      GROUP BY p.id_pedido
      ORDER BY p.fecha DESC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error al obtener pedidos:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener pedidos',
          type: 'DATABASE_ERROR'
        });
      }

      res.json({
        success: true,
        type: 'SUCCESS',
        orders: results
      });
    });
  },

  // Obtener todos los pedidos (admin)
  getAllOrders: (req, res) => {
    const query = `
      SELECT p.*, u.nombre as usuario_nombre,
             GROUP_CONCAT(CONCAT(pr.nombre, ' (', dp.cantidad, ')') SEPARATOR ', ') as productos
      FROM pedido p
      LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
      LEFT JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      LEFT JOIN producto pr ON dp.id_producto = pr.id_producto
      GROUP BY p.id_pedido
      ORDER BY p.fecha DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener todos los pedidos:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener pedidos',
          type: 'DATABASE_ERROR'
        });
      }

      res.json({
        success: true,
        type: 'SUCCESS',
        orders: results
      });
    });
  },

  // Actualizar estado del pedido (NUEVO)
  updateOrderStatus: (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    // Estados válidos
    const validStates = ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
    
    if (!validStates.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Estados válidos: ' + validStates.join(', '),
        type: 'INVALID_STATE'
      });
    }

    // Verificar que el pedido existe
    db.query('SELECT * FROM pedido WHERE id_pedido = ?', [id], (err, results) => {
      if (err) {
        console.error('Error al buscar pedido:', err);
        return res.status(500).json({
          success: false,
          message: 'Error en la base de datos',
          type: 'DATABASE_ERROR'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado',
          type: 'ORDER_NOT_FOUND'
        });
      }

      const currentOrder = results[0];

      // Actualizar el estado
      db.query('UPDATE pedido SET estado = ? WHERE id_pedido = ?', [estado, id], (err, result) => {
        if (err) {
          console.error('Error al actualizar estado del pedido:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al actualizar estado del pedido',
            type: 'DATABASE_ERROR'
          });
        }

        // Respuesta con información del cambio
        const stateNames = {
          'pendiente': 'Pendiente',
          'confirmado': 'Confirmado',
          'en_preparacion': 'En Preparación',
          'enviado': 'Enviado',
          'entregado': 'Entregado',
          'cancelado': 'Cancelado'
        };

        res.json({
          success: true,
          message: `Pedido #${id} actualizado a "${stateNames[estado]}"`,
          type: 'SUCCESS',
          order: {
            id: id,
            previousState: currentOrder.estado,
            newState: estado,
            stateName: stateNames[estado]
          }
        });
      });
    });
  },

  // Obtener detalles completos de un pedido (NUEVO)
  getOrderDetails: (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT 
        p.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        dp.cantidad,
        dp.precio_unitario,
        pr.nombre as producto_nombre,
        pr.descripcion as producto_descripcion,
        pr.imagen as producto_imagen
      FROM pedido p
      LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
      LEFT JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      LEFT JOIN producto pr ON dp.id_producto = pr.id_producto
      WHERE p.id_pedido = ?
    `;

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error al obtener detalles del pedido:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener detalles del pedido',
          type: 'DATABASE_ERROR'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado',
          type: 'ORDER_NOT_FOUND'
        });
      }

      // Procesar los resultados para estructurar la respuesta
      const orderInfo = {
        id_pedido: results[0].id_pedido,
        fecha: results[0].fecha,
        estado: results[0].estado,
        total: results[0].total,
        usuario: {
          nombre: results[0].usuario_nombre,
          email: results[0].usuario_email
        },
        productos: results.map(row => ({
          nombre: row.producto_nombre,
          descripcion: row.producto_descripcion,
          imagen: row.producto_imagen,
          cantidad: row.cantidad,
          precio_unitario: row.precio_unitario,
          subtotal: row.cantidad * row.precio_unitario
        }))
      };

      res.json({
        success: true,
        type: 'SUCCESS',
        order: orderInfo
      });
    });
  }
};

module.exports = orderController;