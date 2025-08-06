import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api';


const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  const categories = [
    { value: 'all', label: 'Todos los productos' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'volleyball', label: 'Voleibol' },
    { value: 'football', label: 'Fútbol' }
  ];

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar productos cuando cambie la categoría o término de búsqueda
  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const loadProducts = async () => {
    try {
      const response = await ApiService.getProducts();
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      alert('Error al cargar productos', 'DATABASE_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoria === selectedCategory);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.marca.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      basketball: '🏀',
      volleyball: '🏐',
      football: '⚽'
    };
    return icons[category] || '📦';
  };

  if (loading) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', color: 'white' }}>
          <div className="loading" style={{ margin: '2rem auto' }}></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title white">Nuestros Productos</h1>

        {/* Filtros */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '3rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            alignItems: 'end'
          }}>
            <div className="form-group">
              <label htmlFor="search">Buscar productos</label>
              <input
                type="text"
                id="search"
                placeholder="Buscar por nombre, descripción o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1rem', color: '#666' }}>
            Mostrando {filteredProducts.length} de {products.length} productos
          </div>
        </div>

        {/* Lista de productos */}
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'white',
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px'
          }}>
            <h3>No se encontraron productos</h3>
            <p>Intenta cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {filteredProducts.map(product => (
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
                  borderRadius: '10px',
                  position: 'relative'
                }}>
                  <img 
                    src={`/images/${product.imagen}`} 
                    alt={product.nombre}
                    style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                    onError={(e) => { 
                      e.target.style.display = 'none'; 
                      e.target.nextSibling.style.display = 'block'; 
                    }}
                  />
                  <span style={{ display: 'none' }}>
                    {getCategoryIcon(product.categoria)}
                  </span>
                  
                  {/* Badge de categoría */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    {product.categoria}
                  </div>

                  {/* Badge de stock */}
                  {product.stock <= 5 && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: product.stock === 0 ? '#f44336' : '#ff9800',
                      color: 'white',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {product.stock === 0 ? 'Sin Stock' : `Solo ${product.stock}`}
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
                    {product.nombre}
                  </h3>
                  
                  <p style={{ color: '#7f8c8d', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    {product.descripcion}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    color: '#666'
                  }}>
                    <span><strong>Marca:</strong> {product.marca}</span>
                    <span><strong>Stock:</strong> {product.stock}</span>
                  </div>

                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#f5576c',
                    marginBottom: '1rem'
                  }}>
                    ${parseFloat(product.precio).toFixed(2)}
                  </div>

                  <button 
                    className={`btn ${product.stock > 0 ? 'btn-success' : 'btn-secondary'}`}
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
    </div>
  );
};

export default Products;