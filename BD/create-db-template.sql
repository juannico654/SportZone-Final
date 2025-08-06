CREATE DATABASE IF NOT EXISTS SportShop;
USE SportShop;

CREATE TABLE usuario(
  id_usuario INT(5) PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  email VARCHAR(150),
  contraseña VARCHAR(255),
  direccion VARCHAR(150),
  telefono VARCHAR(15),
  rol ENUM('usuario','administrador') NOT NULL DEFAULT 'usuario'
);

CREATE TABLE producto(
  id_producto INT(5) PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50),
  descripcion VARCHAR(255),
  precio DECIMAL(10, 2),
  stock INT(10),
  marca VARCHAR(50),
  categoria VARCHAR(50),
  imagen VARCHAR(255),
  id_usuario INT(5),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE pedido (
  id_pedido INT(5) PRIMARY KEY AUTO_INCREMENT,
  fecha DATE,
  estado VARCHAR(50) DEFAULT 'pendiente',
  total DECIMAL(10, 2),
  id_usuario INT(5),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE detalle_pedido (
  id_detalle INT(5) PRIMARY KEY AUTO_INCREMENT,
  id_pedido INT(5),
  id_producto INT(5),
  cantidad INT(3),
  precio_unitario DECIMAL(10, 2),
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE pago(
    monto DECIMAL(10, 2),
    metodo VARCHAR(20),
    fecha DATE,
    id_pedido INT(5),
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);


INSERT INTO usuario (nombre, email, contraseña, direccion, telefono, rol) VALUES 
('Admin', 'admin@sportzone.com', 'admin123', 'Calle Admin 123', '1234567890', 'administrador'),
('Juan Pérez', 'juan@email.com', 'user123', 'Calle Usuario 456', '0987654321', 'usuario');

INSERT INTO producto (nombre, descripcion, precio, stock, marca, categoria, imagen, id_usuario) VALUES 
('Balón Basketball Pro', 'Balón profesional de basketball, tamaño oficial', 89.99, 50, 'Nike', 'basketball', 'basketball.png', 1),
('Balón Voleibol Oficial', 'Balón oficial de voleibol, aprobado por FIVB', 65.99, 30, 'Mikasa', 'volleyball', 'volleyball.png', 1),
('Balón Fútbol FIFA', 'Balón oficial FIFA, calidad premium', 75.99, 40, 'Adidas', 'football', 'football.png', 1),
('Zapatillas Basketball', 'Zapatillas profesionales de basketball', 149.99, 25, 'Jordan', 'basketball', 'shoes.png', 1),
('Rodilleras Voleibol', 'Protección para rodillas, material premium', 29.99, 60, 'Mizuno', 'volleyball', 'kneepads.png', 1),
('Guantes Portero', 'Guantes profesionales para porteros', 89.99, 20, 'Adidas', 'football', 'gloves.png', 1);