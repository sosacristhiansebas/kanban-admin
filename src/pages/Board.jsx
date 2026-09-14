import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import TaskModal from '../components/TaskModal';
import { Plus, Link as LinkIcon, Calendar, CheckSquare } from 'lucide-react';

const Board = () => {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const { isAdmin, currentUser, filterUser, setFilterUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando tareas...</div>;

  const columns = [
    { id: 'todo', title: 'Por Hacer' },
    { id: 'inprogress', title: 'En Progreso' },
    { id: 'done', title: 'Hecho (Historial)' }
  ];

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTask(taskId, { status });
    }
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const openNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Filter logic
  const visibleTasks = tasks.filter(task => {
    const assignees = task.assignees || [];
    return filterUser ? assignees.includes(filterUser) : true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Tablero Kanban</h2>
          {isAdmin && (
            <div style={{ marginTop: '0.5rem' }}>
              <select 
                className="form-control" 
                style={{ width: 'auto', display: 'inline-block', padding: '0.4rem' }}
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="">Todos los integrantes</option>
                <option value="Gonza 🫡">Gonza 🫡</option>
                <option value="Zahi 🐾">Zahi 🐾</option>
                <option value="Edu 💯">Edu 💯</option>
                <option value="Mai 🏝️">Mai 🏝️</option>
                <option value="Dámaso 🐉">Dámaso 🐉</option>
                <option value="Me 💙">Me 💙</option>
                <option value="Sabri 😎">Sabri 😎</option>
                <option value="Flor 🤗">Flor 🤗</option>
              </select>
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={openNewTask}>
          <Plus size={18} /> Nueva Tarea
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {columns.map(col => (
          <div 
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            style={{ 
              flex: '1', 
              minWidth: '300px', 
              backgroundColor: '#f1f3f5', 
              borderRadius: 'var(--border-radius)', 
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
              {col.title} ({visibleTasks.filter(t => t.status === col.id).length})
            </h3>
            
            {visibleTasks.filter(t => t.status === col.id).map(task => (
              <div 
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => openEditTask(task)}
                style={{ 
                  backgroundColor: 'white', 
                  padding: '1rem', 
                  borderRadius: 'var(--border-radius)', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${col.id === 'todo' ? '#ffb3ba' : col.id === 'inprogress' ? '#ffffba' : '#baffc9'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{task.title}</strong>
                  {task.driveLink && (
                    <a href={task.driveLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }} onClick={e => e.stopPropagation()}>
                      <LinkIcon size={16} />
                    </a>
                  )}
                </div>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {task.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '12px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.assignees?.join(', ') || 'Sin asignar'}
                  </span>
                  
                  {task.etaStart && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      {task.etaStart.substring(5)} {task.etaEnd && task.etaStart !== task.etaEnd && `- ${task.etaEnd.substring(5)}`}
                    </div>
                  )}
                </div>

                {task.subtasks && task.subtasks.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckSquare size={12} /> {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                      </span>
                      <span>{Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`, 
                        height: '100%', 
                        backgroundColor: '#add8e6', /* Pastel blue */
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
        task={editingTask}
        onDelete={deleteTask}
      />
    </div>
  );
};

export default Board;
