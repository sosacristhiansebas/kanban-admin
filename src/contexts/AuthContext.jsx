import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');

  const adminEmails = ['gnoves@nowvertical-es.com', 'csosa@nowvertical-es.com'];
  const isAdmin = currentUser?.email ? adminEmails.includes(currentUser.email) : false;

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    // Para modo de prueba local (sin credenciales de Firebase configuradas):
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setCurrentUser({
        displayName: 'Gonza 🫡',
        email: 'gonza@nowvertical.com',
        uid: '12345'
      });
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loginWithGoogle,
    logout,
    filterUser,
    setFilterUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
