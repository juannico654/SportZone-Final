const db = require('../config/database');

const authController = {
  // Registro de usuario
  register: (req, res) => {
    const { name, email, password, address, phone, role } = req.body;

    // Verificar si el usuario ya existe
    db.query('SELECT * FROM usuario WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error en la consulta:', err);
        return res.status(500).json({
          success: false,
          message: 'Error en la base de datos',
          type: 'DATABASE_ERROR'
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya existe con este email',
          type: 'USER_EXISTS'
        });
      }

      // Crear nuevo usuario
      const query = 'INSERT INTO usuario (nombre, email, contraseña, direccion, telefono, rol) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(query, [name, email, password, address, phone, role], (err, result) => {
        if (err) {
          console.error('Error al crear usuario:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            type: 'DATABASE_ERROR'
          });
        }

        res.status(201).json({
          success: true,
          message: 'Usuario creado exitosamente',
          type: 'SUCCESS',
          user: {
            id: result.insertId,
            name,
            email,
            role
          }
        });
      });
    });
  },

  // Inicio de sesión
  login: (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM usuario WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error en la consulta:', err);
        return res.status(500).json({
          success: false,
          message: 'Error en la base de datos',
          type: 'DATABASE_ERROR'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          type: 'USER_NOT_FOUND'
        });
      }

      const user = results[0];

      // Verificar contraseña (sin encriptación para desarrollo)
      if (user.contraseña !== password) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta',
          type: 'INVALID_CREDENTIALS'
        });
      }

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        type: 'SUCCESS',
        user: {
          id: user.id_usuario,
          name: user.nombre,
          email: user.email,
          role: user.rol,
          address: user.direccion,
          phone: user.telefono
        }
      });
    });
  }
};

module.exports = authController;