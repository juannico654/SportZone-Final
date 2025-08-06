import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    role: 'usuario'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      // Redirigir según el rol del usuario
      if (result.user.role === 'administrador') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #764ba2, #f093fb, #4facfe)',
      padding: '2rem 0'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '3rem 2.5rem',
        borderRadius: '15px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#333',
          background: 'linear-gradient(45deg, #764ba2, #f093fb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Registrarse
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Tu nombre"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="********"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Tu dirección"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Tu número de teléfono"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              <option value="usuario">Usuario</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(45deg, #764ba2, #f093fb)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.8rem',
              width: '100%',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '1rem',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = 'linear-gradient(45deg, #4facfe, #00f2fe)')}
            onMouseOut={(e) => !loading && (e.target.style.background = 'linear-gradient(45deg, #764ba2, #f093fb)')}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="loading"></div>
                Creando cuenta...
              </span>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.95rem'
        }}>
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            style={{
              color: '#764ba2',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;