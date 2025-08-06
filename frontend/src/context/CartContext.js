import React, { createContext, useContext, useState, useEffect } from 'react';


const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('sportzone_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        localStorage.removeItem('sportzone_cart');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('sportzone_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id_producto === product.id_producto);
      
      if (existingItem) {
        // Si el producto ya existe, incrementar cantidad
        const newQuantity = existingItem.cantidad + quantity;
        
        // Verificar stock
        if (newQuantity > product.stock) {
          alert(`Solo hay ${product.stock} unidades disponibles`);
          return prevItems.map(item =>
            item.id_producto === product.id_producto
              ? { ...item, cantidad: product.stock }
              : item
          );
        }
        
        alert(`${product.nombre} actualizado en el carrito`);
        return prevItems.map(item =>
          item.id_producto === product.id_producto
            ? { ...item, cantidad: newQuantity }
            : item
        );
      } else {
        // Agregar nuevo producto
        if (quantity > product.stock) {
          alert(`Solo hay ${product.stock} unidades disponibles`);
          quantity = product.stock;
        }
        
        alert(`${product.nombre} agregado al carrito`);
        return [...prevItems, { ...product, cantidad: quantity }];
      }
    });
  };

  // Remover producto del carrito
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item.id_producto === productId);
      if (item) {
        alert(`${item.nombre} removido del carrito`);
      }
      return prevItems.filter(item => item.id_producto !== productId);
    });
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id_producto === productId) {
          // Verificar stock
          if (newQuantity > item.stock) {
            alert(`Solo hay ${item.stock} unidades disponibles`);
            return { ...item, cantidad: item.stock };
          }
          return { ...item, cantidad: newQuantity };
        }
        return item;
      });
    });
  };

  // Limpiar carrito
  const clearCart = () => {
    setCartItems([]);
    alert('Carrito vaciado');
  };

  // Calcular total del carrito
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // Calcular cantidad total de items
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.cantidad, 0);
  };

  // Verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return cartItems.some(item => item.id_producto === productId);
  };

  // Obtener cantidad de un producto específico en el carrito
  const getProductQuantity = (productId) => {
    const item = cartItems.find(item => item.id_producto === productId);
    return item ? item.cantidad : 0;
  };

  // Preparar datos para enviar al backend (crear pedido)
  const getOrderData = (userId) => {
    return {
      id_usuario: userId,
      total: getCartTotal(),
      items: cartItems.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio: item.precio
      }))
    };
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getProductQuantity,
    getOrderData
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};