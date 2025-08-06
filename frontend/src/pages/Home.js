import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api';


const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Cargar productos destacados al montar el componente
  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await ApiService.getProducts();
      if (response.success) {
        // Tomar solo los primeros 6 productos como destacados
        setFeaturedProducts(response.products.slice(0, 6));
      }
    } catch (error) {
      alert('Error al cargar productos', 'DATABASE_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const getProductsByCategory = (category) => {
    // Redirigir a la página de productos con filtro
    window.location.href = `/products?category=${category}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23667eea;stop-opacity:1" /><stop offset="25%" style="stop-color:%23764ba2;stop-opacity:1" /><stop offset="50%" style="stop-color:%23f093fb;stop-opacity:1" /><stop offset="75%" style="stop-color:%23f5576c;stop-opacity:1" /><stop offset="100%" style="stop-color:%234facfe;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="600" fill="url(%23grad)"/><circle cx="200" cy="150" r="3" fill="white" opacity="0.3"/><circle cx="800" cy="300" r="2" fill="white" opacity="0.4"/><circle cx="1000" cy="100" r="4" fill="white" opacity="0.2"/></svg>') center/cover`
      }}>
        <div className="fade-in-up">
          <h1 style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
            animation: 'fadeInUp 1s ease-out'
          }}>
            SportZone
          </h1>
          <p style={{
            fontSize: '1.3rem',
            marginBottom: '2rem',
            opacity: 0.9,
            animation: 'fadeInUp 1s ease-out 0.3s both'
          }}>
            Los mejores artículos deportivos para Basketball, Voleibol y Fútbol
          </p>
          <Link 
            to="/products" 
            style={{
              display: 'inline-block',
              background: 'linear-gradient(45deg, #f5576c, #f093fb)',
              color: '#fff',
              padding: '1rem 2rem',
              textDecoration: 'none',
              borderRadius: '50px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(245, 87, 108, 0.4)',
              animation: 'fadeInUp 1s ease-out 0.6s both'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.6)';
              e.target.style.background = 'linear-gradient(45deg, #4facfe, #00f2fe)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.4)';
              e.target.style.background = 'linear-gradient(45deg, #f5576c, #f093fb)';
            }}
          >
            Explorar Productos
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section section-white">
        <div className="container">
          <h2 className="section-title">Nuestras Categorías</h2>
          <div className="grid grid-3" style={{ marginTop: '3rem' }}>
            <div className="card" style={{
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                background: 'linear-gradient(45deg, #667eea, #f093fb, #f5576c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {/* Aquí pondrás la imagen */}
                <img 
                  src="/images/basketball.png" 
                  alt="Basketball" 
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                />
                <span style={{ display: 'none' }}></span>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
                Basketball
              </h3>
              <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                Encuentra todo lo que necesitas para dominar la cancha: balones, zapatillas, uniformes y accesorios profesionales.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => getProductsByCategory('basketball')}
              >
                Ver Productos
              </button>
            </div>

            <div className="card" style={{
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                background: 'linear-gradient(45deg, #667eea, #f093fb, #f5576c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <img 
                  src="/images/volleyball2.png" 
                  alt="Volleyball" 
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                />
                <span style={{ display: 'none' }}>🏐</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
                Voleibol
              </h3>
              <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                Equipamiento completo para voleibol: balones oficiales, rodilleras, uniformes y redes de alta calidad.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => getProductsByCategory('volleyball')}
              >
                Ver Productos
              </button>
            </div>

            <div className="card" style={{
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                background: 'linear-gradient(45deg, #667eea, #f093fb, #f5576c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <img 
                  src="/images/football.png" 
                  alt="Football" 
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                />
                <span style={{ display: 'none' }}>⚽</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
                Fútbol
              </h3>
              <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                Todo para el deporte rey: balones FIFA, botas, uniformes, guantes de portero y accesorios de entrenamiento.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => getProductsByCategory('football')}
              >
                Ver Productos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title white">Productos Destacados</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="loading"></div>
              <p style={{ color: '#fff', marginTop: '1rem' }}>Cargando productos...</p>
            </div>
          ) : (
            <div className="grid grid-3" style={{ marginTop: '3rem' }}>
              {featuredProducts.map(product => (
                <div key={product.id_producto} className="card">
                  <div style={{
                    height: '200px',
                    background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: '#999',
                    marginBottom: '1rem',
                    borderRadius: '10px'
                  }}>
                    <img 
                      src={`/images/${product.imagen}`} 
                      alt={product.nombre}
                      style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    />
                    <span style={{ display: 'none' }}>📦</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
                      {product.nombre}
                    </h3>
                    <p style={{ color: '#7f8c8d', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {product.descripcion}
                    </p>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#f5576c',
                      marginBottom: '1rem'
                    }}>
                      ${product.precio}
                    </div>
                    <button 
                      className="btn btn-success"
                      style={{ width: '100%' }}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;