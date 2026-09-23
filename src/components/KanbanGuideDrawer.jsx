import React from 'react';
import { X, Inbox, LayoutTemplate, CalendarCheck, CheckSquare, Sparkles } from 'lucide-react';
import './KanbanGuideDrawer.css';

const KanbanGuideDrawer = ({ isOpen, onClose }) => {
  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`guide-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>EL ABC DE KANBAN</h2>
          <button className="drawer-close" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="drawer-subtitle">
          Mantente organizado y eficiente. Cada tarea pendiente, idea o responsabilidad, por pequeña que sea, tiene su lugar, lo que te mantiene a tu mejor rendimiento.
        </p>

        <div className="drawer-content">
          <div className="guide-section">
            <div className="guide-text-block highlight-new" style={{ backgroundColor: 'rgba(0, 180, 216, 0.1)', border: '1px solid var(--secondary-color)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} /> ¡Nuevo! Mis Tareas (Agenda)
              </h3>
              <p>Acabamos de sumar una agenda personal. Haz clic en el icono <CheckSquare size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> arriba a la derecha para anotar esas tareas diarias y cortas que no necesitan ir al tablero general. ¡Solo tú puedes verlas!</p>
            </div>

            <div className="guide-text-block active">
              <h3><Inbox size={18} className="guide-icon" /> Por Hacer (Bandeja)</h3>
              <p>Si lo tienes en mente, entonces colócalo aquí. Registra tus tareas pendientes en cualquier lugar y momento.</p>
            </div>
            
            <div className="guide-text-block">
              <h3><LayoutTemplate size={18} className="guide-icon" /> En Progreso</h3>
              <p>Tu lista de tareas puede ser larga, ¡pero manejable! Mantente al tanto de todo lo que estás trabajando actualmente.</p>
            </div>

            <div className="guide-text-block">
              <h3><CalendarCheck size={18} className="guide-icon" /> Hecho</h3>
              <p>Arrastra, suelta y termina. Mete las tareas más importantes aquí una vez finalizadas y dedica tiempo a lo que de verdad importa.</p>
            </div>
          </div>

          <div className="guide-visual">
            <div className="mini-board">
              <div className="mini-col todo">
                <div className="mini-col-header">Por Hacer</div>
                <div className="mini-card pulse">Nueva idea de campaña</div>
                <div className="mini-card">Revisar métricas</div>
              </div>
              <div className="mini-col inprogress">
                <div className="mini-col-header">En Progreso</div>
                <div className="mini-card">Diseño de UI</div>
              </div>
              <div className="mini-col done">
                <div className="mini-col-header">Hecho</div>
                <div className="mini-card dim">Reunión de equipo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KanbanGuideDrawer;
