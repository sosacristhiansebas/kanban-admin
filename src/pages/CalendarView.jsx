import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';const argHolidays = [
  '01-01', // Año Nuevo
  '03-24', // Día Nacional de la Memoria por la Verdad y la Justicia
  '04-02', // Día del Veterano y de los Caídos en la Guerra de Malvinas
  '05-01', // Día del Trabajador
  '05-25', // Día de la Revolución de Mayo
  '06-20', // Paso a la Inmortalidad del Gral. Manuel Belgrano
  '07-09', // Día de la Independencia
  '12-08', // Día de la Inmaculada Concepción de María
  '12-25', // Navidad
];

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

  // Agrupar días en semanas
  const weeks = [];
  let currentWeek = [];
  days.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Filter logic
  const visibleTasks = tasks.filter(task => {
    if (task.status === 'done') return false;
    
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

      {/* Header de días de la semana */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '1px', 
        backgroundColor: 'var(--border-color)',
        border: '1px solid var(--border-color)',
        borderBottom: 'none',
        borderTopLeftRadius: 'var(--border-radius)',
        borderTopRightRadius: 'var(--border-radius)',
      }}>
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
      </div>
      
      {/* Grilla de Semanas y Tareas */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        backgroundColor: 'var(--border-color)',
        border: '1px solid var(--border-color)',
        borderTop: 'none',
        borderBottomLeftRadius: 'var(--border-radius)',
        borderBottomRightRadius: 'var(--border-radius)',
      }}>
        {weeks.map((week, weekIndex) => {
          const weekStartStr = format(week[0], 'yyyy-MM-dd');
          const weekEndStr = format(week[6], 'yyyy-MM-dd');
          
          // Buscar tareas que caen en esta semana
          const weekTasks = visibleTasks.filter(t => t.etaStart && t.etaEnd && t.etaStart <= weekEndStr && t.etaEnd >= weekStartStr);
          
          // Ordenar tareas: fecha de inicio más temprana primero, luego mayor duración
          weekTasks.sort((a, b) => {
            if (a.etaStart !== b.etaStart) return a.etaStart.localeCompare(b.etaStart);
            return b.etaEnd.localeCompare(a.etaEnd);
          });

          // Asignar slots verticales a las tareas para que no se superpongan
          const slots = [];
          const taskPlacements = weekTasks.map(task => {
            let assignedSlot = 0;
            while (slots[assignedSlot] && slots[assignedSlot] >= task.etaStart) {
              assignedSlot++;
            }
            slots[assignedSlot] = task.etaEnd;
            return { task, slot: assignedSlot };
          });

          // Calcular altura dinámica de la semana si hay muchas tareas
          const maxSlot = Math.max(-1, ...taskPlacements.map(p => p.slot));
          const tasksHeight = (maxSlot + 1) * 28; // 24px altura de barra + 4px de gap
          const weekMinHeight = Math.max(120, tasksHeight + 40); // 40px para el número del día

          return (
            <div key={weekIndex} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '1px', 
              position: 'relative', 
              minHeight: `${weekMinHeight}px` 
            }}>
              {/* Celdas de fondo de los días */}
              {week.map((day) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const mmdd = format(day, 'MM-dd');
                const isHoliday = argHolidays.includes(mmdd);
                const isOffDay = isWeekend || isHoliday;
                
                return (
                  <div key={day.toString()} style={{
                    // Damos un color levemente más oscuro/diferente a los fines de semana
                    backgroundColor: isOffDay ? 'var(--background-color)' : isSameMonth(day, monthStart) ? 'var(--surface-color)' : 'rgba(255, 255, 255, 0.02)',
                    padding: '0.5rem',
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
                      color: isSameDay(day, new Date()) ? 'var(--secondary-color)' : 'inherit',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ 
                        background: isSameDay(day, new Date()) ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '100px',
                        zIndex: 1
                      }}>
                        {format(day, 'd')}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Barras continuas de tareas */}
              {taskPlacements.map(({ task, slot }) => {
                const taskStart = task.etaStart < weekStartStr ? weekStartStr : task.etaStart;
                const taskEnd = task.etaEnd > weekEndStr ? weekEndStr : task.etaEnd;
                
                const startIndex = week.findIndex(d => format(d, 'yyyy-MM-dd') === taskStart);
                const endIndex = week.findIndex(d => format(d, 'yyyy-MM-dd') === taskEnd);
                const colSpan = endIndex - startIndex + 1;
                
                const isRealStart = task.etaStart >= weekStartStr;
                const isRealEnd = task.etaEnd <= weekEndStr;
                
                return (
                  <div
                    key={task.id}
                    style={{
                      position: 'absolute',
                      top: `${36 + slot * 28}px`,
                      left: `calc(${startIndex} * (100% / 7) + 4px)`,
                      width: `calc(${colSpan} * (100% / 7) - 8px)`,
                      height: '24px',
                      backgroundColor: task.status === 'todo' ? '#ffb3ba' : task.status === 'inprogress' ? '#ffffba' : '#baffc9',
                      color: '#333',
                      fontSize: '0.75rem',
                      padding: '0 0.5rem',
                      borderTopLeftRadius: isRealStart ? '4px' : '0',
                      borderBottomLeftRadius: isRealStart ? '4px' : '0',
                      borderTopRightRadius: isRealEnd ? '4px' : '0',
                      borderBottomRightRadius: isRealEnd ? '4px' : '0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      opacity: 0.9, // Transparencia para que se note si pasa por un fin de semana gris
                      zIndex: 10,
                      cursor: 'default'
                    }}
                    title={`${task.title}\n${task.description || 'Sin descripción'}`}
                  >
                    {task.title}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
