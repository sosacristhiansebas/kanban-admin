import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import TaskModal from '../components/TaskModal';
import KanbanGuideDrawer from '../components/KanbanGuideDrawer';
import { Plus, Link as LinkIcon, Calendar, CheckSquare, Lightbulb, X, HelpCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Board = () => {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const { users } = useUsers();
  const { isAdmin, currentUser, filterUser, setFilterUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(() => localStorage.getItem('hasSeenGuide_v1') === 'true');

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando tareas...</div>;

  const columns = [
    { id: 'todo', title: 'Por Hacer' },
    { id: 'inprogress', title: 'En Progreso' },
    { id: 'done', title: 'Hecho (Historial)' }
  ];

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      return updateTask(editingTask.id, taskData);
    } else {
      // Al agregar una nueva tarea, le damos un orden muy bajo para que aparezca arriba
      return addTask({ ...taskData, order: Date.now() * -1 }); 
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
    if (isAdmin) {
      return filterUser ? assignees.includes(filterUser) : true;
    }
    return currentUser?.email ? assignees.includes(currentUser.email) : false;
  });

  const sortedVisibleTasks = [...visibleTasks].sort((a, b) => (a.order || 0) - (b.order || 0));

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const startColumn = source.droppableId;
    const finishColumn = destination.droppableId;
    
    if (startColumn === finishColumn) {
      const columnTasks = sortedVisibleTasks.filter(t => t.status === startColumn);
      const newTasks = Array.from(columnTasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);
      
      let newOrder = 0;
      if (newTasks.length > 1) {
        if (destination.index === 0) {
          newOrder = (newTasks[1].order || 0) - 1000;
        } else if (destination.index === newTasks.length - 1) {
          newOrder = (newTasks[newTasks.length - 2].order || 0) + 1000;
        } else {
          newOrder = ((newTasks[destination.index - 1].order || 0) + (newTasks[destination.index + 1].order || 0)) / 2;
        }
      }
      
      updateTask(draggableId, { order: newOrder });
    } else {
      // moving to different column
      const finishTasks = sortedVisibleTasks.filter(t => t.status === finishColumn);
      const newFinishTasks = Array.from(finishTasks);
      const movedTask = sortedVisibleTasks.find(t => t.id === draggableId);
      newFinishTasks.splice(destination.index, 0, movedTask);
      
      let newOrder = 0;
      if (newFinishTasks.length > 1) {
        if (destination.index === 0) {
          newOrder = (newFinishTasks[1].order || 0) - 1000;
        } else if (destination.index === newFinishTasks.length - 1) {
          newOrder = (newFinishTasks[newFinishTasks.length - 2].order || 0) + 1000;
        } else {
          newOrder = ((newFinishTasks[destination.index - 1].order || 0) + (newFinishTasks[destination.index + 1].order || 0)) / 2;
        }
      }
      
      updateTask(draggableId, { status: finishColumn, order: newOrder });
    }
  };

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
                <option value="sosacristhiansebas@gmail.com">Admin</option>
                {users.map(u => (
                  <option key={u.email} value={u.email}>{u.displayName || u.email}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setIsGuideOpen(true);
              if (!hasSeenGuide) {
                setHasSeenGuide(true);
                localStorage.setItem('hasSeenGuide_v1', 'true');
              }
            }}
            title="Guía Kanban y Novedades"
            style={{ padding: '0.6rem', position: 'relative' }}
          >
            <HelpCircle size={18} />
            {!hasSeenGuide && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                backgroundColor: '#ff4d4d',
                borderRadius: '50%',
                border: '2px solid var(--bg-color)'
              }}></span>
            )}
          </button>
          <button className="btn btn-primary" onClick={openNewTask}>
            <Plus size={18} /> Nueva Tarea
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', minHeight: '60vh' }}>
          {columns.map(col => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ 
                    flex: '1', 
                    minWidth: '300px', 
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(0, 180, 216, 0.05)' : 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: 'var(--border-radius)', 
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                    {col.title} ({sortedVisibleTasks.filter(t => t.status === col.id).length})
                  </h3>
                  
                  {sortedVisibleTasks.filter(t => t.status === col.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => openEditTask(task)}
                          style={{ 
                            backgroundColor: snapshot.isDragging ? '#1a3a4c' : '#112b38',
                            padding: '1rem', 
                            borderRadius: 'var(--border-radius)', 
                            boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                            cursor: 'grab',
                            borderLeft: `4px solid ${col.id === 'todo' ? '#ffb3ba' : col.id === 'inprogress' ? '#ffffba' : '#baffc9'}`,
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.9 : 1
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <strong>{task.title}</strong>
                            {task.driveLink && (
                              <a href={task.driveLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }} onClick={e => e.stopPropagation()}>
                                <LinkIcon size={16} />
                              </a>
                            )}
                          </div>
                          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {task.description}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <span style={{ backgroundColor: 'var(--bg-color)', padding: '0.2rem 0.5rem', borderRadius: '12px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {task.assignees?.map(a => users.find(u => u.email === a)?.displayName || a).join(', ') || 'Sin asignar'}
                            </span>
                            
                            {task.etaStart && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: (task.status !== 'done' && task.etaEnd) ? (() => {
                                const end = new Date(`${task.etaEnd}T00:00:00`);
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                
                                // Calculate business days difference manually to avoid requiring new imports
                                // but we do have date-fns. Let's just use simple ms difference to see how many days
                                // actually the user requested business days.
                                let diffDays = 0;
                                let current = new Date(today);
                                // If end is before today, diff is negative.
                                if (end < today) {
                                  return '#ff4d4d'; // Rojo intenso (vencida)
                                }
                                
                                while (current < end) {
                                  current.setDate(current.getDate() + 1);
                                  const dayOfWeek = current.getDay();
                                  if (dayOfWeek !== 0 && dayOfWeek !== 6) { // not Sunday (0) and not Saturday (6)
                                    diffDays++;
                                  }
                                }

                                if (diffDays <= 1) return '#ff4d4d'; // Rojo intenso (1 día o menos)
                                if (diffDays === 2) return '#ff8a8a'; // Rojita (2 días)
                                return 'var(--text-secondary)';
                              })() : 'var(--text-secondary)' }}>
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
                                  backgroundColor: '#add8e6',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {showInfoBox && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '300px',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          borderRadius: 'var(--border-radius)',
          padding: '1rem',
          display: 'flex',
          gap: '0.8rem',
          alignItems: 'flex-start',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          zIndex: 50,
          backdropFilter: 'blur(4px)'
        }}>
          <button 
            onClick={() => setShowInfoBox(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: 'rgba(220, 53, 69, 0.5)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'rgba(220, 53, 69, 1)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(220, 53, 69, 0.5)'}
            title="Cerrar"
          >
            <X size={14} />
          </button>
          <Lightbulb size={24} style={{ color: '#ff4d4d', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.9rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#ff4d4d', display: 'block', marginBottom: '0.4rem', fontSize: '1rem' }}>¿Idea o Problema?</strong>
            Crea una nueva tarjeta, describe tu pedido y pon a <strong style={{ color: 'inherit' }}>Admin</strong> como Responsable.
          </div>
        </div>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
        task={editingTask}
        onDelete={deleteTask}
      />

      <KanbanGuideDrawer 
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};

export default Board;

