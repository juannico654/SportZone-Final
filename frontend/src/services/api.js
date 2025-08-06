const API_BASE_URL = 'http://localhost:5000/api';

// Función base para hacer peticiones
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log(`🔄 Petición a: ${url}`, config);

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`📡 Respuesta de ${endpoint}:`, { status: response.status, data });
    
    if (!response.ok) {
      const error = new Error(data.message || 'Error en la petición');
      error.status = response.status;
      error.type = data.type || 'UNKNOWN_ERROR';
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error en ${endpoint}:`, error);
    
    // Si es un error de red (no se puede conectar al servidor)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:5000');
      networkError.type = 'NETWORK_ERROR';
      throw networkError;
    }
    
    throw error;
  }
};

// API Service con métodos exportados individualmente
const ApiService = {
  // AUTENTICACIÓN
  login: async (email, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // PRODUCTOS
  getProducts: async () => {
    return request('/products');
  },

  getProductsByCategory: async (category) => {
    return request(`/products/category/${category}`);
  },

  getProductStats: async (id) => {
    return request(`/products/${id}/stats`);
  },

  createProduct: async (productData) => {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id, productData) => {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (id) => {
    return request(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // USUARIOS (Admin)
  getUsers: async () => {
    return request('/users');
  },

  getUserStats: async (id) => {
    return request(`/users/${id}/stats`);
  },

  deleteUser: async (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  updateUserRole: async (id, role) => {
    return request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  // PEDIDOS
  createOrder: async (orderData) => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getUserOrders: async (userId) => {
    return request(`/orders/user/${userId}`);
  },

  getAllOrders: async () => {
    return request('/orders');
  },

  getOrderDetails: async (id) => {
    return request(`/orders/${id}`);
  },

  updateOrderStatus: async (id, estado) => {
    return request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    });
  },

  // PRUEBAS DE CONEXIÓN
  testConnection: async () => {
    return request('/test');
  },

  testDatabase: async () => {
    return request('/test-db');
  }
};

export default ApiService;