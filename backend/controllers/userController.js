const db = require('../config/database');

const userController = {
  // Obtener todos los usuarios (admin)
  getAllUsers: (req, res) => {
    const query = 'SELECT id_usuario, nombre, email, direccion, telefono, rol FROM usuario ORDER BY id_usuario DESC';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener usuarios:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener usuarios',
          type: 'DATABASE_ERROR'
        });
      }

      res.json({
        success: true,
        type: 'SUCCESS',
        users: results
      });
    });
  },

  // Eliminar usuario con eliminación en cascada
  deleteUser: (req, res) => {
    const { id } = req.params;

    // Verificar que no sea el último administrador
    db.query('SELECT COUNT(*) as count FROM usuario WHERE rol = "administrador"', (err, countResult) => {
      if (err) {
        console.error('Error al contar administradores:', err);
        return res.status(500).json({
          success: false,
          message: 'Error en la base de datos',
          type: 'DATABASE_ERROR'
        });
      }

      // Verificar si el usuario a eliminar es administrador
      db.query('SELECT rol, nombre FROM usuario WHERE id_usuario = ?', [id], (err, userResult) => {
        if (err) {
          console.error('Error al obtener usuario:', err);
          return res.status(500).json({
            success: false,
            message: 'Error en la base de datos',
            type: 'DATABASE_ERROR'
          });
        }

        if (userResult.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado',
            type: 'USER_NOT_FOUND'
          });
        }

        const usuario = userResult[0];

        // Si es el último admin, no permitir eliminación
        if (usuario.rol === 'administrador' && countResult[0].count <= 1) {
          return res.status(400).json({
            success: false,
            message: 'No se puede eliminar el único administrador del sistema',
            type: 'LAST_ADMIN_ERROR'
          });
        }

        // Obtener estadísticas antes de eliminar (para mostrar en la respuesta)
        db.query('SELECT COUNT(*) as count FROM producto WHERE id_usuario = ?', [id], (err, productCount) => {
          if (err) {
            console.error('Error al contar productos:', err);
            return res.status(500).json({
              success: false,
              message: 'Error al verificar dependencias',
              type: 'DATABASE_ERROR'
            });
          }

          db.query('SELECT COUNT(*) as count FROM pedido WHERE id_usuario = ?', [id], (err, orderCount) => {
            if (err) {
              console.error('Error al contar pedidos:', err);
              return res.status(500).json({
                success: false,
                message: 'Error al verificar dependencias',
                type: 'DATABASE_ERROR'
              });
            }

            const productsToDelete = productCount[0].count;
            const ordersToDelete = orderCount[0].count;

            // Iniciar transacción para eliminación en cascada
            db.beginTransaction((err) => {
              if (err) {
                console.error('Error al iniciar transacción:', err);
                return res.status(500).json({
                  success: false,
                  message: 'Error en la base de datos',
                  type: 'DATABASE_ERROR'
                });
              }

              // Paso 1: Eliminar detalles de pedidos del usuario
              db.query('DELETE dp FROM detalle_pedido dp INNER JOIN pedido p ON dp.id_pedido = p.id_pedido WHERE p.id_usuario = ?', [id], (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error al eliminar detalles de pedidos:', err);
                    res.status(500).json({
                      success: false,
                      message: 'Error al eliminar dependencias de pedidos',
                      type: 'DATABASE_ERROR'
                    });
                  });
                }

                // Paso 2: Eliminar pagos de pedidos del usuario
                db.query('DELETE pa FROM pago pa INNER JOIN pedido p ON pa.id_pedido = p.id_pedido WHERE p.id_usuario = ?', [id], (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error('Error al eliminar pagos:', err);
                      res.status(500).json({
                        success: false,
                        message: 'Error al eliminar dependencias de pagos',
                        type: 'DATABASE_ERROR'
                      });
                    });
                  }

                  // Paso 3: Eliminar pedidos del usuario
                  db.query('DELETE FROM pedido WHERE id_usuario = ?', [id], (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error('Error al eliminar pedidos:', err);
                        res.status(500).json({
                          success: false,
                          message: 'Error al eliminar pedidos del usuario',
                          type: 'DATABASE_ERROR'
                        });
                      });
                    }

                    // Paso 4: Eliminar productos creados por el usuario
                    db.query('DELETE FROM producto WHERE id_usuario = ?', [id], (err) => {
                      if (err) {
                        return db.rollback(() => {
                          console.error('Error al eliminar productos:', err);
                          res.status(500).json({
                            success: false,
                            message: 'Error al eliminar productos del usuario',
                            type: 'DATABASE_ERROR'
                          });
                        });
                      }

                      // Paso 5: Finalmente eliminar el usuario
                      db.query('DELETE FROM usuario WHERE id_usuario = ?', [id], (err, result) => {
                        if (err) {
                          return db.rollback(() => {
                            console.error('Error al eliminar usuario:', err);
                            res.status(500).json({
                              success: false,
                              message: 'Error al eliminar usuario',
                              type: 'DATABASE_ERROR'
                            });
                          });
                        }

                        if (result.affectedRows === 0) {
                          return db.rollback(() => {
                            res.status(404).json({
                              success: false,
                              message: 'Usuario no encontrado',
                              type: 'USER_NOT_FOUND'
                            });
                          });
                        }

                        // Confirmar transacción
                        db.commit((err) => {
                          if (err) {
                            return db.rollback(() => {
                              console.error('Error al confirmar transacción:', err);
                              res.status(500).json({
                                success: false,
                                message: 'Error al finalizar eliminación',
                                type: 'DATABASE_ERROR'
                              });
                            });
                          }

                          // Éxito - crear mensaje informativo
                          let message = `Usuario "${usuario.nombre}" eliminado exitosamente`;
                          if (productsToDelete > 0 || ordersToDelete > 0) {
                            message += ` junto con ${productsToDelete} producto(s) y ${ordersToDelete} pedido(s)`;
                          }

                          res.json({
                            success: true,
                            message: message,
                            type: 'SUCCESS',
                            deleted: {
                              user: usuario.nombre,
                              products: productsToDelete,
                              orders: ordersToDelete
                            }
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  },

  // Actualizar rol de usuario (admin)
  updateUserRole: (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Validar que el rol sea válido
    if (!['usuario', 'administrador'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Debe ser "usuario" o "administrador"',
        type: 'INVALID_ROLE'
      });
    }

    // Si se está cambiando de administrador a usuario, verificar que no sea el último admin
    if (role === 'usuario') {
      db.query('SELECT COUNT(*) as count FROM usuario WHERE rol = "administrador"', (err, countResult) => {
        if (err) {
          console.error('Error al contar administradores:', err);
          return res.status(500).json({
            success: false,
            message: 'Error en la base de datos',
            type: 'DATABASE_ERROR'
          });
        }

        // Verificar si el usuario actual es administrador
        db.query('SELECT rol FROM usuario WHERE id_usuario = ?', [id], (err, userResult) => {
          if (err) {
            console.error('Error al obtener usuario:', err);
            return res.status(500).json({
              success: false,
              message: 'Error en la base de datos',
              type: 'DATABASE_ERROR'
            });
          }

          if (userResult.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'Usuario no encontrado',
              type: 'USER_NOT_FOUND'
            });
          }

          // Si es el último admin y se quiere cambiar a usuario, no permitir
          if (userResult[0].rol === 'administrador' && countResult[0].count <= 1) {
            return res.status(400).json({
              success: false,
              message: 'No se puede cambiar el rol del único administrador del sistema',
              type: 'LAST_ADMIN_ERROR'
            });
          }

          // Proceder con la actualización
          updateRole();
        });
      });
    } else {
      // Si se está promoviendo a administrador, proceder directamente
      updateRole();
    }

    function updateRole() {
      db.query('UPDATE usuario SET rol = ? WHERE id_usuario = ?', [role, id], (err, result) => {
        if (err) {
          console.error('Error al actualizar rol:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al actualizar rol',
            type: 'DATABASE_ERROR'
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado',
            type: 'USER_NOT_FOUND'
          });
        }

        res.json({
          success: true,
          message: `Rol actualizado a ${role} exitosamente`,
          type: 'SUCCESS'
        });
      });
    }
  },

  // Obtener estadísticas del usuario (para el admin)
  getUserStats: (req, res) => {
    const { id } = req.params;

    const queries = {
      products: 'SELECT COUNT(*) as count FROM producto WHERE id_usuario = ?',
      orders: 'SELECT COUNT(*) as count FROM pedido WHERE id_usuario = ?'
    };

    Promise.all([
      new Promise((resolve, reject) => {
        db.query(queries.products, [id], (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(queries.orders, [id], (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        });
      })
    ])
    .then(([productCount, orderCount]) => {
      res.json({
        success: true,
        type: 'SUCCESS',
        stats: {
          products: productCount,
          orders: orderCount,
          canDelete: true // Ahora siempre se puede eliminar (excepto último admin)
        }
      });
    })
    .catch(err => {
      console.error('Error al obtener estadísticas del usuario:', err);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        type: 'DATABASE_ERROR'
      });
    });
  }
};

module.exports = userController;