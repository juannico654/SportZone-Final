const mysql = require('mysql2');

// Configuración de conexión a MySQL (XAMPP)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Sin contraseña en XAMPP por defecto
  database: 'SportShop',
  port: 3306,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
    console.error('Detalles del error:', {
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port
    });
    return;
  }
  console.log('✅ Conectado a MySQL - SportShop');
});

// Manejar errores de conexión
connection.on('error', (err) => {
  console.error('❌ Error en la conexión MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Reintentando conexión...');
  }
});

module.exports = connection;