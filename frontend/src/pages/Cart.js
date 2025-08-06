import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';


const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getOrderData 
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  console.log('🛒 Cart Component - Datos del carrito:', {
    cartItems,
    cartItemsLength: cartItems?.length,
    isAuthenticated: isAuthenticated(),
    user: user
  });

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleFinalizePurchase = async () => {
    if (!user) {
      alert('Debes iniciar sesión para finalizar la compra');
      return;
    }

    setLoading(true);
    try {
      const orderData = getOrderData(user.id);
      const response = await ApiService.createOrder(orderData);
      
      if (response.success) {
        alert('¡Pedido realizado exitosamente!');
        clearCart();
        navigate('/');
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      if (error.message.includes('Stock insuficiente')) {
        alert('Stock insuficiente para algunos productos', 'STOCK_ERROR');
      } else {
       alert ('Error al procesar el pedido', error.type || 'ORDER_ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  // SIEMPRE mostrar algo, independientemente del estado
  return (
    <div className="section" style={{ minHeight: '80vh', paddingTop: '2rem' }}>
      <div className="container">
        <h1 className="section-title white">Tu Carrito de Compras</h1>

        {/* Panel de debug - mostrar siempre */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          
          
          <p><strong>Usuario:</strong> {user ? user.name : 'No logueado'}</p>
          <p><strong>Items en carrito:</strong> {cartItems ? cartItems.length : 'undefined'}</p>
          {cartItems && cartItems.length > 0 && (
            <div>
              <strong>Productos:</strong>
              <ul>
                {cartItems.map(item => (
                  <li key={item.id_producto}>{item.nombre} - Cantidad: {item.cantidad}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Verificar autenticación */}
        {!isAuthenticated() ? (
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Debes iniciar sesión</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
              Para ver tu carrito y realizar compras, necesitas iniciar sesión.
            </p>
            <Link to="/login" className="btn btn-primary">
              Iniciar Sesión
            </Link>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          /* Carrito vacío */
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Tu carrito está vacío</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
              ¡Agrega algunos productos increíbles a tu carrito!
            </p>
            <Link to="/products" className="btn btn-primary">
              Ver Productos
            </Link>
          </div>
        ) : (
          /* Carrito con productos */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            {/* Lista de productos */}
            <div>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>
                Productos en tu carrito ({cartItems.length})
              </h3>
              
              {cartItems.map(item => (
                <div key={item.id_producto} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '100px 1fr auto', 
                    gap: '1rem', 
                    alignItems: 'center' 
                  }}>
                    {/* Imagen del producto */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      <img 
                        src={`/images/${item.imagen}`} 
                        alt={item.nombre}
                        style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                        onError={(e) => { 
                          e.target.style.display = 'none'; 
                          e.target.nextSibling.style.display = 'block'; 
                        }}
                      />
                      <span style={{ display: 'none' }}>📦</span>
                    </div>

                    {/* Información del producto */}
                    <div>
                      <h4 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>{item.nombre}</h4>
                      <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {item.descripcion}
                      </p>
                      <p style={{ color: '#666', fontSize: '0.8rem' }}>
                        <strong>Marca:</strong> {item.marca} | <strong>Stock:</strong> {item.stock}
                      </p>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f5576c' }}>
                        ${parseFloat(item.precio).toFixed(2)} c/u
                      </div>
                    </div>

                    {/* Controles */}
                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '1rem',
                        justifyContent: 'center'
                      }}>
                        <button
                          onClick={() => handleQuantityChange(item.id_producto, item.cantidad - 1)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '2px solid #4facfe',
                            background: 'white',
                            color: '#4facfe',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          -
                        </button>
                        <span style={{ 
                          minWidth: '30px', 
                          textAlign: 'center', 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold' 
                        }}>
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id_producto, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '2px solid #4facfe',
                            background: item.cantidad >= item.stock ? '#ccc' : 'white',
                            color: item.cantidad >= item.stock ? '#999' : '#4facfe',
                            cursor: item.cantidad >= item.stock ? 'not-allowed' : 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>
                      
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id_producto)}
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div>
              <div className="card" style={{ position: 'sticky', top: '100px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>Resumen del Pedido</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Productos ({cartItems.length}):</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Envío:</span>
                    <span style={{ color: '#4CAF50' }}>Gratis</span>
                  </div>
                  <hr style={{ margin: '1rem 0', border: '1px solid #eee' }} />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '1.3rem', 
                    fontWeight: 'bold',
                    color: '#2c3e50'
                  }}>
                    <span>Total:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleFinalizePurchase}
                  disabled={loading}
                  className="btn btn-success"
                  style={{ 
                    width: '100%', 
                    marginBottom: '1rem',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <div className="loading"></div>
                      Procesando...
                    </span>
                  ) : (
                    'Finalizar Compra'
                  )}
                </button>

                <button
                  onClick={clearCart}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;