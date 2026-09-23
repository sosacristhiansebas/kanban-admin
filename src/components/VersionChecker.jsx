import React, { useEffect, useState } from 'react';
import './VersionChecker.css';

const VersionChecker = () => {
  const [showReload, setShowReload] = useState(false);
  const [initialVersion, setInitialVersion] = useState(null);

  const checkVersion = async () => {
    try {
      // Agregamos un timestamp para que el navegador no cachee esta petición
      const res = await fetch(`/version.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      
      setInitialVersion((prevInitial) => {
        if (prevInitial === null) {
          return data.version; // Guardamos la primera versión
        } else if (data.version && data.version !== prevInitial) {
          setShowReload(true); // Detectamos una versión diferente!
          return prevInitial;
        }
        return prevInitial;
      });
    } catch (error) {
      console.error("Error comprobando la versión de la app:", error);
    }
  };

  useEffect(() => {
    // Comprobar al cargar el componente
    checkVersion();

    // Comprobar cada vez que el usuario vuelve a hacer foco en la pestaña
    window.addEventListener('focus', checkVersion);
    
    // Comprobar periódicamente (ej: cada 15 minutos) por si dejan la pestaña abierta y activa
    const intervalId = setInterval(checkVersion, 15 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', checkVersion);
      clearInterval(intervalId);
    };
  }, []);

  if (!showReload) return null;

  return (
    <div className="version-checker-banner">
      <div className="version-checker-content">
        <span>Hay una nueva versión de la aplicación disponible.</span>
        <button 
          onClick={() => window.location.reload(true)} 
          className="version-checker-btn"
        >
          Actualizar ahora
        </button>
      </div>
    </div>
  );
};

export default VersionChecker;
