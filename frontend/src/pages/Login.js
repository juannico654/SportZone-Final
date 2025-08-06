import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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

    const result = await login(formData.email, formData.password);
    
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
      background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
      padding: '2rem 0'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '3rem 2.5rem',
        borderRadius: '15px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#333',
          background: 'linear-gradient(45deg, #667eea, #f093fb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Iniciar Sesión
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tucorreo@ejemplo.com"
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

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(45deg, #667eea, #f093fb)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.8rem',
              width: '100%',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = 'linear-gradient(45deg, #4facfe, #00f2fe)')}
            onMouseOut={(e) => !loading && (e.target.style.background = 'linear-gradient(45deg, #667eea, #f093fb)')}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="loading"></div>
                Ingresando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.95rem'
        }}>
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;