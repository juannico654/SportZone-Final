const db = require('../config/database');

const productController = {
  // Obtener todos los productos
  getAllProducts: (req, res) => {
    const query = `
      SELECT p.*, u.nombre as admin_name 
      FROM producto p 
      LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
      ORDER BY p.id_producto DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener productos:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener productos',
          type: 'DATABASE_ERROR'
        });
      }

      res.json({
        success: true,
        type: 'SUCCESS',
        products: results
      });
    });
  },

  // Obtener productos por categoría
  getProductsByCategory: (req, res) => {
    const { category } = req.params;
    
    db.query('SELECT * FROM producto WHERE categoria = ?', [category], (err, results) => {
      if (err) {
        console.error('Error al obtener productos por categoría:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener productos',
          type: 'DATABASE_ERROR'
        });
      }

      res.json({
        success: true,
        type: 'SUCCESS',
        products: results
      });
    });
  },

  // Crear producto (solo administradores)
  createProduct: (req, res) => {
    const { nombre, descripcion, precio, stock, marca, categoria, imagen, id_usuario } = req.body;

    const query = 'INSERT INTO producto (nombre, descripcion, precio, stock, marca, categoria, imagen, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [nombre, descripcion, precio, stock, marca, categoria, imagen, id_usuario], (err, result) => {
      if (err) {
        console.error('Error al crear producto:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al crear producto',
          type: 'DATABASE_ERROR'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        type: 'SUCCESS',
        product: {
          id: result.insertId,
          nombre,
          precio,
          categoria
        }
      });
    });
  },

  // Actualizar producto
  updateProduct: (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, marca, categoria, imagen } = req.body;

    const query = 'UPDATE producto SET nombre = ?, descripcion = ?, precio = ?, stock = ?, marca = ?, categoria = ?, imagen = ? WHERE id_producto = ?';
    
    db.query(query, [nombre, descripcion, precio, stock, marca, categoria, imagen, id], (err, result) => {
      if (err) {
        console.error('Error al actualizar producto:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al actualizar producto',
          type: 'DATABASE_ERROR'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
          type: 'PRODUCT_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        type: 'SUCCESS'
      });
    });
  },

  // Eliminar producto con verificación de dependencias
  deleteProduct: (req, res) => {
    const { id } = req.params;

    // Verificar cuántos pedidos usan este producto
    db.query('SELECT COUNT(*) as count FROM detalle_pedido WHERE id_producto = ?', [id], (err, countResult) => {
      if (err) {
        console.error('Error al verificar dependencias del producto:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al verificar dependencias',
          type: 'DATABASE_ERROR'
        });
      }

      const ordersUsingProduct = countResult[0].count;

      // Obtener información del producto antes de eliminar
      db.query('SELECT nombre FROM producto WHERE id_producto = ?', [id], (err, productResult) => {
        if (err) {
          console.error('Error al obtener producto:', err);
          return res.status(500).json({
            success: false,
            message: 'Error en la base de datos',
            type: 'DATABASE_ERROR'
          });
        }

        if (productResult.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Producto no encontrado',
            type: 'PRODUCT_NOT_FOUND'
          });
        }

        const productName = productResult[0].nombre;

        if (ordersUsingProduct > 0) {
          // Si hay pedidos que usan este producto, preguntar si quiere eliminar en cascada
          // Por ahora, vamos a eliminar en cascada automáticamente
          console.log(`Producto "${productName}" tiene ${ordersUsingProduct} pedido(s) asociado(s). Eliminando en cascada...`);

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

            // Paso 1: Eliminar los detalles de pedidos que contengan este producto
            db.query('DELETE FROM detalle_pedido WHERE id_producto = ?', [id], (err, deleteDetailsResult) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error al eliminar detalles de pedidos:', err);
                  res.status(500).json({
                    success: false,
                    message: 'Error al eliminar referencias del producto en pedidos',
                    type: 'DATABASE_ERROR'
                  });
                });
              }

              // Paso 2: Eliminar el producto
              db.query('DELETE FROM producto WHERE id_producto = ?', [id], (err, deleteProductResult) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error al eliminar producto:', err);
                    res.status(500).json({
                      success: false,
                      message: 'Error al eliminar producto',
                      type: 'DATABASE_ERROR'
                    });
                  });
                }

                if (deleteProductResult.affectedRows === 0) {
                  return db.rollback(() => {
                    res.status(404).json({
                      success: false,
                      message: 'Producto no encontrado',
                      type: 'PRODUCT_NOT_FOUND'
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

                  const message = ordersUsingProduct > 0 
                    ? `Producto "${productName}" eliminado exitosamente junto con ${deleteDetailsResult.affectedRows} referencia(s) en pedidos`
                    : `Producto "${productName}" eliminado exitosamente`;

                  res.json({
                    success: true,
                    message: message,
                    type: 'SUCCESS',
                    deleted: {
                      product: productName,
                      orderReferences: deleteDetailsResult.affectedRows
                    }
                  });
                });
              });
            });
          });
        } else {
          // Si no hay pedidos que usen este producto, eliminar directamente
          db.query('DELETE FROM producto WHERE id_producto = ?', [id], (err, result) => {
            if (err) {
              console.error('Error al eliminar producto:', err);
              return res.status(500).json({
                success: false,
                message: 'Error al eliminar producto',
                type: 'DATABASE_ERROR'
              });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
                type: 'PRODUCT_NOT_FOUND'
              });
            }

            res.json({
              success: true,
              message: `Producto "${productName}" eliminado exitosamente`,
              type: 'SUCCESS'
            });
          });
        }
      });
    });
  },

  // Nuevo método: Obtener estadísticas del producto
  getProductStats: (req, res) => {
    const { id } = req.params;

    const query = 'SELECT COUNT(*) as count FROM detalle_pedido WHERE id_producto = ?';
    
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error al obtener estadísticas del producto:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener estadísticas',
          type: 'DATABASE_ERROR'
        });
      }

      res.json({
        success: true,
        type: 'SUCCESS',
        stats: {
          ordersUsing: result[0].count,
          canDelete: true // Ahora siempre se puede eliminar con cascada
        }
      });
    });
  }
};

module.exports = productController;