import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      padding: '1rem 0',
      position: 'fixed',
      width: '100%',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <nav style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            textDecoration: 'none'
          }}>
            SportZone
          </Link>
          
          <ul style={{
            display: 'flex',
            listStyle: 'none',
            gap: '2rem',
            margin: 0,
            padding: 0
          }}>
            <li>
              <Link to="/" style={{
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                transition: 'all 0.3s ease'
              }}>
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/products" style={{
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                transition: 'all 0.3s ease'
              }}>
                Productos
              </Link>
            </li>
            {user && (
              <li>
                <Link to="/cart" style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '0.5rem 1rem',
                  borderRadius: '25px',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}>
                  Carrito
                  {getCartItemsCount() > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: '#f5576c',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '0.8rem',
                      minWidth: '18px',
                      textAlign: 'center'
                    }}>
                      {getCartItemsCount()}
                    </span>
                  )}
                </Link>
              </li>
            )}
            {isAdmin() && (
              <li>
                <Link to="/admin" style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '0.5rem 1rem',
                  borderRadius: '25px',
                  transition: 'all 0.3s ease'
                }}>
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {user ? (
            <>
              <span style={{
                color: '#fff',
                padding: '0.6rem 1.2rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '30px',
                fontSize: '0.9rem'
              }}>
                ¡Hola, {user.name}!
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  border: '2px solid #fff',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#fff',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  border: '2px solid #fff',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#fff',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}>
                  Iniciar Sesión
                </button>
              </Link>
              <Link to="/register">
                <button style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: '#fff',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                }}>
                  Registrarse
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;