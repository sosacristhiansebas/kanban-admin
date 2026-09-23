import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LayoutDashboard, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import Login from './pages/Login';
import Board from './pages/Board';
import CalendarView from './pages/CalendarView';
import Dashboard from './pages/Dashboard';
import VersionChecker from './components/VersionChecker';
import { PieChart } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <div className="app-container">
      <VersionChecker />
      {currentUser && (
        <nav className="navbar">
          <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/favicon.svg" alt="Logo" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
            Kanban
          </div>
          <div className="navbar-nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> Tablero
            </Link>
            <Link 
              to="/calendar" 
              className={`nav-link ${location.pathname === '/calendar' ? 'active' : ''}`}
            >
              <CalendarIcon size={18} /> Calendario
            </Link>
            {isAdmin && (
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                <PieChart size={18} /> Dashboard
              </Link>
            )}
            <button className="btn btn-secondary" onClick={logout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
              <LogOut size={16} /> Salir
            </button>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                {isAdmin ? <Dashboard /> : <Navigate to="/" />}
              </PrivateRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Board />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <PrivateRoute>
                <CalendarView />
              </PrivateRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
