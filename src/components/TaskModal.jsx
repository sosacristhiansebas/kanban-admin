import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';

const TaskModal = ({ isOpen, onClose, onSave, task = null, onDelete }) => {
  const { isAdmin, currentUser } = useAuth();
  const { users } = useUsers();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignees: [],
    etaStart: '',
    etaEnd: '',
    driveLink: '',
    status: 'todo',
    subtasks: []
  });

  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        assignees: task.assignees || [],
        subtasks: task.subtasks || [],
        comments: task.comments || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignees: currentUser?.email ? [currentUser.email] : [],
        etaStart: '',
        etaEnd: '',
        driveLink: '',
        status: 'todo',
        subtasks: [],
        comments: []
      });
    }
  }, [task, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssigneeChange = (member) => {
    setFormData(prev => {
      const isSelected = prev.assignees.includes(member);
      if (isSelected) {
        return { ...prev, assignees: prev.assignees.filter(a => a !== member) };
      } else {
        return { ...prev, assignees: [...prev.assignees, member] };
      }
    });
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: Date.now().toString(), title: newSubtask, completed: false }]
    }));
    setNewSubtask('');
  };

  const handleToggleSubtask = (subId) => {
    setFormData(prev => {
      const newSubtasks = prev.subtasks.map(st => st.id === subId ? { ...st, completed: !st.completed } : st);
      
      const allCompletedNow = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);
      const allCompletedBefore = prev.subtasks.length > 0 && prev.subtasks.every(st => st.completed);
      
      if (allCompletedNow && !allCompletedBefore) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }

      return {
        ...prev,
        subtasks: newSubtasks
      };
    });
  };

  const handleDeleteSubtask = (subId) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== subId)
    }));
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now().toString(),
      text: newComment,
      author: currentUser?.displayName || currentUser?.email || 'Usuario',
      timestamp: new Date().toISOString()
    };
    setFormData(prev => ({
      ...prev,
      comments: [...(prev.comments || []), comment]
    }));
    setNewComment('');
  };

  const handleDeleteComment = (commentId) => {
    setFormData(prev => ({
      ...prev,
      comments: (prev.comments || []).filter(c => c.id !== commentId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Hubo un error al guardar la tarea. Revisa la consola o los permisos de Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, overflowY: 'auto' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ margin: '2rem auto', maxWidth: '600px', position: 'relative' }}>
        {showCelebration && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '0.5rem 1.5rem',
            borderRadius: '20px',
            fontWeight: 'bold',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1100,
            animation: 'fadeInOut 2s ease-in-out forwards',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🎉 ¡Good Job!
          </div>
        )}
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>
        {error && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título</label>
            <input 
              className="form-control" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea 
              className="form-control" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Responsables</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              {users.map(user => (
                <label key={user.email} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.assignees.includes(user.email)}
                    onChange={() => handleAssigneeChange(user.email)}
                  />
                  {user.displayName || user.email}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha de Inicio</label>
              <input 
                type="date"
                className="form-control" 
                name="etaStart" 
                value={formData.etaStart} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha de Fin</label>
              <input 
                type="date"
                className="form-control" 
                name="etaEnd" 
                value={formData.etaEnd} 
                onChange={handleChange} 
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sub-tareas (Opcional)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Añadir una subtarea..." 
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddSubtask(e)}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddSubtask}><Plus size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.subtasks.map(st => (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
                    <input 
                      type="checkbox" 
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                    />
                    <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? '#6c757d' : 'inherit' }}>
                      {st.title}
                    </span>
                  </label>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }} onClick={() => handleDeleteSubtask(st.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Comentarios</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
              {(formData.comments || []).map(comment => (
                <div key={comment.id} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>{comment.author}</strong>
                    <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {new Date(comment.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      <button type="button" style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: 0, display: 'flex' }} onClick={() => handleDeleteComment(comment.id)}>
                        <X size={14} />
                      </button>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>{comment.text}</div>
                </div>
              ))}
              {(formData.comments || []).length === 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No hay comentarios aún.</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Escribe un comentario..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddComment(e)}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddComment}>Enviar</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Link a la documentación</label>
            <input 
              type="url"
              className="form-control"
              name="driveLink" 
              value={formData.driveLink} 
              onChange={handleChange} 
              placeholder="https://..."
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {task && isAdmin && (
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => {
                  if(window.confirm('¿Eliminar esta tarea permanentemente?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
              >
                Eliminar
              </button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
