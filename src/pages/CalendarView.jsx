import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = () => {
  const { tasks, loading } = useTasks();
  const { isAdmin, currentUser, filterUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando calendario...</div>;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Filter logic
  const visibleTasks = tasks.filter(task => {
    const assignees = task.assignees || [];
    if (isAdmin) {
      return filterUser ? assignees.includes(filterUser) : true;
    }
    return currentUser?.email ? assignees.includes(currentUser.email) : false;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Calendario</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={prevMonth}><ChevronLeft size={20} /></button>
          <h3 style={{ margin: 0, textTransform: 'capitalize', minWidth: '150px', textAlign: 'center' }}>
            {format(currentDate, dateFormat, { locale: es })}
          </h3>
          <button className="btn btn-secondary" onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '1px', 
        backgroundColor: 'var(--border-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        overflow: 'hidden'
      }}>
        {/* Header de días de la semana */}
        {weekDays.map(day => (
          <div key={day} style={{ 
            backgroundColor: 'var(--surface-color)', 
            padding: '1rem', 
            textAlign: 'center', 
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}>
            {day}
          </div>
        ))}
        
        {/* Días del calendario */}
        {days.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayTasks = visibleTasks.filter(t => t.etaStart && t.etaEnd && dayStr >= t.etaStart && dayStr <= t.etaEnd);
          
          return (
            <div 
              key={day.toString()} 
              style={{ 
                backgroundColor: isSameMonth(day, monthStart) ? 'var(--surface-color)' : '#f8f9fa',
                minHeight: '120px',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
                color: isSameDay(day, new Date()) ? 'var(--secondary-color)' : 'inherit'
              }}>
                <span style={{ 
                  background: isSameDay(day, new Date()) ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '100px'
                }}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: task.status === 'todo' ? '#ffb3ba' : task.status === 'inprogress' ? '#ffffba' : '#baffc9',
                      color: '#333',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
