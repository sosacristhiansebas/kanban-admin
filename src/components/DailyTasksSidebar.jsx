import React, { useState } from 'react';
import { useDailyTasks } from '../hooks/useDailyTasks';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Check, Circle, Trash2, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import './DailyTasksSidebar.css';

const DailyTasksSidebar = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { dailyTasks, addDailyTask, updateDailyTask, deleteDailyTask } = useDailyTasks(currentUser?.email);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const pendingTasks = dailyTasks.filter(t => !t.completed);
  const completedTasks = dailyTasks.filter(t => t.completed);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addDailyTask({ title: newTaskTitle.trim() });
      setNewTaskTitle('');
    } catch (error) {
      console.error("Error adding task", error);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      await updateDailyTask(taskId, { completed: !currentStatus });
    } catch (error) {
      console.error("Error updating task status", error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteDailyTask(taskId);
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`daily-tasks-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="daily-tasks-header">
        <h3 className="daily-tasks-title">Mis tareas</h3>
        <button className="close-btn" onClick={onClose} title="Cerrar">
          <X size={18} />
        </button>
      </div>

      <div className="daily-tasks-body">
        <form onSubmit={handleAddTask} className="add-task-form">
          <Plus size={18} className="add-icon" />
          <input
            type="text"
            placeholder="Agregar una tarea"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="add-task-input"
          />
        </form>

        <div className="tasks-list">
          {pendingTasks.map(task => (
            <div key={task.id} className="task-item">
              <button 
                className="task-check-btn" 
                onClick={() => toggleTaskStatus(task.id, task.completed)}
              >
                <Circle size={18} />
              </button>
              <span className="task-title">{task.title}</span>
              <button className="delete-task-btn" onClick={() => handleDelete(task.id)} title="Eliminar">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {completedTasks.length > 0 && (
          <div className="completed-section">
            <button 
              className="completed-toggle-btn" 
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Completadas ({completedTasks.length})
            </button>
            
            {showCompleted && (
              <div className="tasks-list completed-list">
                {completedTasks.map(task => (
                  <div key={task.id} className="task-item completed">
                    <button 
                      className="task-check-btn checked" 
                      onClick={() => toggleTaskStatus(task.id, task.completed)}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <span className="task-title">{task.title}</span>
                    <button className="delete-task-btn" onClick={() => handleDelete(task.id)} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTasksSidebar;
