import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import './VersionChecker.css';

const VersionChecker = () => {
  const [showReload, setShowReload] = useState(false);
  const [initialVersion, setInitialVersion] = useState(null);

  useEffect(() => {
    // Escuchar el documento "app" en la colección "settings"
    const docRef = doc(db, 'settings', 'app');
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentVersion = data.version;

        if (initialVersion === null) {
          // Primera vez que carga, guardamos la versión inicial
          setInitialVersion(currentVersion);
        } else if (currentVersion > initialVersion) {
          // Si la versión en la BD es mayor a la inicial, mostramos el aviso
          setShowReload(true);
        }
      }
    }, (error) => {
      console.error("Error escuchando la versión de la app:", error);
    });

    return () => unsubscribe();
  }, [initialVersion]);

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
