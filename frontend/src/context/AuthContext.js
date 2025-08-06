import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';


const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('sportzone_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error al parsear usuario guardado:', error);
        localStorage.removeItem('sportzone_user');
      }
    }
    setLoading(false);
  }, []);

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await ApiService.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('sportzone_user', JSON.stringify(response.user));
        alert(`¡Bienvenido, ${response.user.name}!`);
        return { success: true, user: response.user };
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('Usuario no encontrado')) {
        alert('Usuario no encontrado', 'USER_NOT_FOUND');
      } else if (error.message.includes('Contraseña incorrecta')) {
        alert('Contraseña incorrecta', 'INVALID_CREDENTIALS');
      } else if (error.message.includes('base de datos')) {
        alert('Error en la base de datos', 'DATABASE_ERROR');
      } else {
        alert('Error del servidor', 'SERVER_ERROR');
      }
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Registrar usuario
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await ApiService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('sportzone_user', JSON.stringify(response.user));
        alert('¡Cuenta creada exitosamente!');
        return { success: true, user: response.user };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('ya existe')) {
        alert('Este usuario ya existe', 'USER_EXISTS');
      } else if (error.message.includes('base de datos')) {
        alert('Error en la base de datos', 'DATABASE_ERROR');
      } else {
        alert('Error del servidor', 'SERVER_ERROR');
      }
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('sportzone_user');
    alert('Sesión cerrada correctamente');
  };

  // Verificar si es administrador
  const isAdmin = () => {
    return user && user.role === 'administrador';
  };

  // Verificar si está autenticado
  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};