import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '3rem 0 1rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#f093fb' }}>SportZone</h3>
            <p style={{ color: '#ccc', lineHeight: 1.8 }}>
              Tu tienda de confianza para artículos deportivos de basketball, voleibol y fútbol.
            </p>
          </div>
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#f093fb' }}>Contacto</h3>
            <p style={{ color: '#ccc', lineHeight: 1.8 }}>📞 +57 3223384870</p>
            <p style={{ color: '#ccc', lineHeight: 1.8 }}>📧 info@sportzone.com</p>
            <p style={{ color: '#ccc', lineHeight: 1.8 }}>📍 85 Sports Ave, Chapinero</p>
          </div>
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#f093fb' }}>Síguenos</h3>
            <p style={{ color: '#ccc', lineHeight: 1.8 }}>
              <a href="https://www.facebook.com/?locale=es_LA" style={{ color: '#ccc', textDecoration: 'none' }}>Facebook</a>
            </p>
            <p style={{ color: '#ccc', lineHeight: 1.8 }}>
              <a href="https://www.instagram.com/" style={{ color: '#ccc', textDecoration: 'none' }}>Instagram</a>
            </p>
            <p style={{ color: '#ccc', lineHeight: 1.8 }}>
              <a href="https://x.com/home?lang=es" style={{ color: '#ccc', textDecoration: 'none' }}>Twitter</a>
            </p>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid #444',
          paddingTop: '1rem',
          color: '#999'
        }}>
          <p>&copy; 2025 SportZone. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;