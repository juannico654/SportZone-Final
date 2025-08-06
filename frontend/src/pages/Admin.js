import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';


const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    marca: '',
    categoria: 'basketball',
    imagen: ''
  });

  useEffect(() => {
    if (isAdmin()) {
      if (activeTab === 'products') loadProducts();
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'orders') loadOrders();
    }
  }, [activeTab]);

  if (!isAdmin()) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', color: 'white' }}>
          <h2>Acceso Denegado</h2>
          <p>Solo los administradores pueden acceder a esta página</p>
        </div>
      </div>
    );
  }

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getProducts();
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      alert('Error al cargar productos', error.type);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        ...productForm,
        precio: parseFloat(productForm.precio),
        stock: parseInt(productForm.stock),
        id_usuario: user.id
      };

      let response;
      if (editingProduct) {
        response = await ApiService.updateProduct(editingProduct.id_producto, productData);
      } else {
        response = await ApiService.createProduct(productData);
      }

      if (response.success) {
        alert(editingProduct ? 'Producto actualizado' : 'Producto creado');
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({
          nombre: '', descripcion: '', precio: '', stock: '', marca: '', categoria: 'basketball', imagen: ''
        });
        loadProducts();
      }
    } catch (error) {
      alert('Error al guardar producto', error.type);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      marca: product.marca,
      categoria: product.categoria,
      imagen: product.imagen
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      const response = await ApiService.deleteProduct(id);
      if (response.success) {
        alert('Producto eliminado');
        loadProducts();
      }
    } catch (error) {
      alert('Error al eliminar producto', error.type);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getUsers();
      if (response.success) {
        setUsers(response.users);
        
        const stats = {};
        for (const userItem of response.users) {
          try {
            const userStatsResponse = await ApiService.getUserStats(userItem.id_usuario);
            if (userStatsResponse.success) {
              stats[userItem.id_usuario] = userStatsResponse.stats;
            }
          } catch (error) {
            console.error('Error al cargar stats del usuario:', error);
          }
        }
        setUserStats(stats);
      }
    } catch (error) {
      alert('Error al cargar usuarios', error.type);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, userName) => {
    const stats = userStats[id];
    
    let confirmMessage = `¿Estás seguro de que quieres eliminar al usuario "${userName}"?`;
    
    if (stats && (stats.products > 0 || stats.orders > 0)) {
      confirmMessage += `\n\n⚠️ ATENCIÓN: Esta acción eliminará PERMANENTEMENTE:\n`;
      if (stats.products > 0) confirmMessage += `- ${stats.products} producto(s) creado(s) por este usuario\n`;
      if (stats.orders > 0) confirmMessage += `- ${stats.orders} pedido(s) realizado(s) por este usuario\n`;
      confirmMessage += `\n¿Continuar con la eliminación en cascada?`;
    }
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const response = await ApiService.deleteUser(id);
      if (response.success) {
        alert(response.message);
        loadUsers();
        
        if (response.deleted && response.deleted.products > 0) {
          loadProducts();
        }
        
        if (response.deleted && response.deleted.orders > 0) {
          loadOrders();
        }
      }
    } catch (error) {
      if (error.type === 'LAST_ADMIN_ERROR') {
        alert(error.message, 'LAST_ADMIN_ERROR');
      } else {
        alert('Error al eliminar usuario', error.type);
      }
    }
  };

  const handleChangeUserRole = async (id, newRole) => {
    try {
      const response = await ApiService.updateUserRole(id, newRole);
      if (response.success) {
        alert(response.message);
        loadUsers();
      }
    } catch (error) {
      if (error.type === 'LAST_ADMIN_ERROR') {
        alert(error.message, 'LAST_ADMIN_ERROR');
      } else {
        alert('Error al actualizar rol', error.type);
      }
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAllOrders();
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (error) {
      alert('Error al cargar pedidos', error.type);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title white">Panel de Administración</h1>

        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '15px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('products')}
              className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Pedidos
            </button>
          </div>
        </div>

        {activeTab === 'products' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <button
                onClick={() => {
                  setShowProductForm(!showProductForm);
                  setEditingProduct(null);
                  setProductForm({
                    nombre: '', descripcion: '', precio: '', stock: '', marca: '', categoria: 'basketball', imagen: ''
                  });
                }}
                className="btn btn-primary"
              >
                {showProductForm ? 'Cancelar' : 'Agregar Producto'}
              </button>
            </div>

            {showProductForm && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
                <form onSubmit={handleProductSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Nombre</label>
                      <input
                        type="text"
                        value={productForm.nombre}
                        onChange={(e) => setProductForm({...productForm, nombre: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Marca</label>
                      <input
                        type="text"
                        value={productForm.marca}
                        onChange={(e) => setProductForm({...productForm, marca: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Precio</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.precio}
                        onChange={(e) => setProductForm({...productForm, precio: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Categoría</label>
                      <select
                        value={productForm.categoria}
                        onChange={(e) => setProductForm({...productForm, categoria: e.target.value})}
                        required
                      >
                        <option value="basketball">Basketball</option>
                        <option value="volleyball">Voleibol</option>
                        <option value="football">Fútbol</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Imagen (nombre del archivo)</label>
                      <input
                        type="text"
                        value={productForm.imagen}
                        onChange={(e) => setProductForm({...productForm, imagen: e.target.value})}
                        placeholder="ejemplo: basketball.png"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      value={productForm.descripcion}
                      onChange={(e) => setProductForm({...productForm, descripcion: e.target.value})}
                      rows="3"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear Producto')}
                  </button>
                </form>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <div className="loading"></div>
              </div>
            ) : (
              <div className="card">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Categoría</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id_producto}>
                        <td>{product.nombre}</td>
                        <td>${product.precio}</td>
                        <td>{product.stock}</td>
                        <td>
                          <span className="badge badge-success">{product.categoria}</span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="btn btn-primary"
                            style={{ marginRight: '0.5rem', padding: '0.3rem 0.8rem' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id_producto)}
                            className="btn btn-danger"
                            style={{ padding: '0.3rem 0.8rem' }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <h3>Gestión de Usuarios</h3>
            <div style={{
              background: '#e8f4fd',
              border: '1px solid #bee5eb',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              <strong>ℹ️ Información:</strong> Al eliminar un usuario, se eliminarán automáticamente todos sus productos creados y pedidos realizados.
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <div className="loading"></div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Productos</th>
                    <th>Pedidos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(userItem => {
                    const stats = userStats[userItem.id_usuario] || { products: 0, orders: 0 };
                    return (
                      <tr key={userItem.id_usuario}>
                        <td>{userItem.nombre}</td>
                        <td>{userItem.email}</td>
                        <td>
                          <select
                            value={userItem.rol}
                            onChange={(e) => handleChangeUserRole(userItem.id_usuario, e.target.value)}
                            style={{
                              padding: '0.3rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          >
                            <option value="usuario">Usuario</option>
                            <option value="administrador">Administrador</option>
                          </select>
                        </td>
                        <td>
                          <span className={`badge ${stats.products > 0 ? 'badge-warning' : 'badge-success'}`}>
                            {stats.products}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${stats.orders > 0 ? 'badge-warning' : 'badge-success'}`}>
                            {stats.orders}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(userItem.id_usuario, userItem.nombre)}
                            className="btn btn-danger"
                            style={{ padding: '0.3rem 0.8rem' }}
                            disabled={userItem.id_usuario === user.id}
                            title={userItem.id_usuario === user.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario y todas sus dependencias'}
                          >
                            {userItem.id_usuario === user.id ? 'Tú' : 'Eliminar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="card">
            <h3>Pedidos</h3>
            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <div className="loading"></div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Productos</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id_pedido}>
                      <td>#{order.id_pedido}</td>
                      <td>{order.usuario_nombre}</td>
                      <td>{new Date(order.fecha).toLocaleDateString()}</td>
                      <td>${parseFloat(order.total || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${order.estado === 'pendiente' ? 'badge-warning' : 'badge-success'}`}>
                          {order.estado}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.8rem' }}>
                        {order.productos || 'Sin productos'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;