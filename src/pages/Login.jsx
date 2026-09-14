import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error("Error logging in: ", error);
      alert("Error al iniciar sesión.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <h1 style={{ marginBottom: '2rem' }}>Team Administración y Finanzas</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        Inicia sesión para acceder al tablero del equipo (capacidad para 10 personas).
      </p>
      <button onClick={handleLogin} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
          <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.72 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.13H2.21V16.98C4.01 20.56 7.72 23 12 23Z" fill="#34A853"/>
          <path d="M5.88 14.13C5.66 13.47 5.54 12.75 5.54 12C5.54 11.25 5.66 10.53 5.88 9.87V7.02H2.21C1.46 8.5 1 10.2 1 12C1 13.8 1.46 15.5 2.21 16.98L5.88 14.13Z" fill="#FBBC05"/>
          <path d="M12 5.38C13.62 5.38 15.06 5.93 16.21 7.02L19.35 3.88C17.46 2.12 14.97 1 12 1C7.72 1 4.01 3.44 2.21 7.02L5.88 9.87C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
        </svg>
        Ingresar con Google
      </button>
    </div>
  );
};

export default Login;
